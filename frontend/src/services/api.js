const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Fetch backend API health status
 */
export const fetchHealthStatus = async () => {
  const startTime = performance.now();
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      data,
      latency: `${duration}ms`,
      statusCode: response.status,
    };
  } catch (error) {
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    return {
      success: false,
      error: error.message || 'Failed to reach API server',
      latency: `${duration}ms`,
      statusCode: null,
    };
  }
};
