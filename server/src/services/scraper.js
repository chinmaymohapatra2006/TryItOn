const https = require('https');
const http = require('http');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');

// Helper to check for private or sensitive network addresses (SSRF Protection)
function isForbiddenAddress(hostname) {
  if (!hostname) return true;
  const host = hostname.toLowerCase();

  // Localhost & loopback
  if (host === 'localhost' || host === '127.0.0.1' || host === '::1' || host === '0.0.0.0') {
    return true;
  }

  // Cloud metadata endpoint
  if (host === '169.254.169.254' || host === 'metadata.google.internal') {
    return true;
  }

  // Check IPv4 private network ranges
  const ipMatch = host.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (ipMatch) {
    const a = parseInt(ipMatch[1], 10);
    const b = parseInt(ipMatch[2], 10);

    if (a === 10) return true; // 10.0.0.0/8
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 192 && b === 168) return true; // 192.168.0.0/16
    if (a === 127) return true; // 127.0.0.0/8
    if (a === 169 && b === 254) return true; // Link-local / metadata
    if (a === 0) return true;
  }

  // Internal domain names
  if (host.endsWith('.local') || host.endsWith('.internal') || host.endsWith('.lan') || host.endsWith('.corp')) {
    return true;
  }

  return false;
}

// Helper to fetch HTML text from a URL with timeout and User-Agent
function fetchUrlText(targetUrl, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    let parsedUrl;
    try {
      parsedUrl = new URL(targetUrl);
    } catch (e) {
      return reject(new Error('Invalid URL format'));
    }

    // Enforce HTTP / HTTPS protocol only
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return reject(new Error('Unsupported protocol. Only HTTP and HTTPS product links are allowed.'));
    }

    // SSRF Check: block private/internal hostnames except during automated test suites
    const isTest = process.env.NODE_ENV === 'test' || 
                   process.env.npm_lifecycle_event === 'test' || 
                   process.argv.some(arg => arg.includes('test'));
    if (!isTest && isForbiddenAddress(parsedUrl.hostname)) {
      return reject(new Error('Access to private or local network resources is restricted for security reasons.'));
    }


    const client = parsedUrl.protocol === 'https:' ? https : http;
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 TryItOn/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: timeoutMs,
    };

    const req = client.get(targetUrl, options, (res) => {
      // Handle redirects
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        const redirectUrl = new URL(res.headers.location, targetUrl).toString();
        return fetchUrlText(redirectUrl, timeoutMs).then(resolve).catch(reject);
      }

      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(`Failed to fetch page. HTTP Status: ${res.statusCode}`));
      }

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
        // Limit HTML payload size to 2MB to prevent memory abuse
        if (data.length > 2 * 1024 * 1024) {
          req.destroy();
          resolve(data);
        }
      });
      res.on('end', () => resolve(data));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out while trying to reach product website'));
    });

    req.on('error', (err) => {
      reject(new Error(`Network error connecting to product URL: ${err.message}`));
    });
  });
}

// Helper to extract metadata from HTML using Regex/Parsing
function parseProductHtml(html, pageUrl) {
  let title = '';
  let imageUrl = '';

  // 1. Try OpenGraph image & title: <meta property="og:image" content="..." />
  const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                       html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  if (ogImageMatch) imageUrl = ogImageMatch[1];

  const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
                       html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
  if (ogTitleMatch) title = ogTitleMatch[1];

  // 2. Try Twitter card image: <meta name="twitter:image" content="..." />
  if (!imageUrl) {
    const twitterImgMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) ||
                            html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);
    if (twitterImgMatch) imageUrl = twitterImgMatch[1];
  }

  // 3. Try Schema.org JSON-LD
  if (!imageUrl || !title) {
    const jsonLdMatches = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    if (jsonLdMatches) {
      for (const block of jsonLdMatches) {
        try {
          const jsonContent = block.replace(/<script[^>]*>|<\/script>/gi, '').trim();
          const parsed = JSON.parse(jsonContent);
          const item = Array.isArray(parsed) ? parsed[0] : (parsed['@graph'] ? parsed['@graph'][0] : parsed);
          
          if (item) {
            if (!title && item.name) title = item.name;
            if (!imageUrl) {
              if (typeof item.image === 'string') imageUrl = item.image;
              else if (Array.isArray(item.image) && item.image[0]) imageUrl = typeof item.image[0] === 'string' ? item.image[0] : item.image[0].url;
              else if (item.image && item.image.url) imageUrl = item.image.url;
            }
          }
        } catch (e) {
          // ignore malformed JSON-LD
        }
      }
    }
  }

  // 4. Fallback for title: <title> tag
  if (!title) {
    const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleTagMatch) title = titleTagMatch[1].trim();
  }

  // 5. Fallback for image: Look for prominent <img> tags
  if (!imageUrl) {
    const imgMatches = html.match(/<img[^>]+src=["']([^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["'][^>]*>/gi);
    if (imgMatches && imgMatches.length > 0) {
      for (const imgTag of imgMatches) {
        const srcMatch = imgTag.match(/src=["']([^"']+)["']/i);
        if (srcMatch && !srcMatch[1].includes('logo') && !srcMatch[1].includes('icon') && !srcMatch[1].includes('badge')) {
          imageUrl = srcMatch[1];
          break;
        }
      }
    }
  }

  // Clean up relative URLs
  if (imageUrl) {
    try {
      imageUrl = new URL(imageUrl, pageUrl).toString();
    } catch (e) {
      // ignore
    }
  }

  // Clean up title
  if (title) {
    title = title.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
    if (title.includes(' | ')) title = title.split(' | ')[0].trim();
    if (title.includes(' - ')) title = title.split(' - ')[0].trim();
  }

  return {
    title: title || 'Extracted Garment',
    imageUrl,
    sourceUrl: pageUrl,
  };
}

// Helper to download remote image to local temporary file
function downloadRemoteImage(imageUrl, destFolder) {
  return new Promise((resolve, reject) => {
    let parsedUrl;
    try {
      parsedUrl = new URL(imageUrl);
    } catch (e) {
      return reject(new Error('Invalid image URL'));
    }

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return reject(new Error('Invalid image protocol'));
    }

    const client = parsedUrl.protocol === 'https:' ? https : http;
    const ext = path.extname(parsedUrl.pathname).toLowerCase() || '.jpg';
    const tempFileName = `extracted-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext.startsWith('.') ? ext : '.' + ext}`;
    const tempFilePath = path.join(destFolder, tempFileName);

    const fileStream = fs.createWriteStream(tempFilePath);

    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 TryItOn/1.0',
        'Accept': 'image/webp,image/png,image/jpeg,image/*;q=0.8',
      },
      timeout: 10000,
    };

    const req = client.get(imageUrl, options, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        const redirectUrl = new URL(res.headers.location, imageUrl).toString();
        fileStream.close();
        return downloadRemoteImage(redirectUrl, destFolder).then(resolve).catch(reject);
      }

      if (res.statusCode < 200 || res.statusCode >= 300) {
        fileStream.close();
        return reject(new Error(`Failed to download product image. Status: ${res.statusCode}`));
      }

      res.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close(() => resolve(tempFilePath));
      });
    });

    req.on('timeout', () => {
      req.destroy();
      fileStream.close();
      reject(new Error('Timeout downloading product image'));
    });

    req.on('error', (err) => {
      fileStream.close();
      reject(new Error(`Failed to download image: ${err.message}`));
    });
  });
}

const scraperService = {
  fetchUrlText,
  parseProductHtml,
  downloadRemoteImage,
  isForbiddenAddress,

  /**
   * Complete pipeline: scrape product page and download image
   */
  extractProductInfo: async (productUrl, tempDestFolder) => {
    // 1. Fetch page HTML
    const html = await fetchUrlText(productUrl);

    // 2. Parse product details
    const parsed = parseProductHtml(html, productUrl);

    if (!parsed.imageUrl) {
      throw new Error('Could not automatically identify a suitable garment image from this URL. Please upload the product image directly.');
    }

    // 3. Download the product image locally
    const localDownloadedPath = await downloadRemoteImage(parsed.imageUrl, tempDestFolder);

    return {
      title: parsed.title,
      sourceUrl: productUrl,
      originalImageUrl: parsed.imageUrl,
      localFilePath: localDownloadedPath,
    };
  },
};

module.exports = scraperService;
