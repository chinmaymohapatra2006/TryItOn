import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  Heart, 
  Ruler, 
  User, 
  Shirt, 
  Bookmark, 
  RotateCw, 
  ShieldCheck, 
  RefreshCcw, 
  CreditCard, 
  Headphones,
  Eye,
  Check
} from 'lucide-react';
import { useCostume } from '../context/CostumeContext.jsx';

export const HomePage = () => {
  const navigate = useNavigate();
  const { selectCostume } = useCostume();
  const [activeSlide, setActiveSlide] = useState(0);
  const [wishlist, setWishlist] = useState({});

  const toggleWishlist = (id) => {
    setWishlist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleTryOn = (costumeId) => {
    if (costumeId) {
      selectCostume(costumeId);
    }
    navigate('/dashboard');
  };

  const categories = [
    { name: 'Shirts', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=300&q=80', costumeId: 'shirt' },
    { name: 'T-Shirts', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80', costumeId: 'tshirt' },
    { name: 'Jeans', image: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=300&q=80', costumeId: null },
    { name: 'Dresses', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=300&q=80', costumeId: 'kurta' },
    { name: 'Kurtas', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80', costumeId: 'kurta' },
    { name: 'Jackets', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=300&q=80', costumeId: 'jacket' },
    { name: 'Accessories', image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=300&q=80', costumeId: null },
  ];

  const bestSellers = [
    {
      id: 'bs-1',
      title: 'Linen Shirt',
      price: '₹1,599',
      image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80',
      costumeId: 'shirt',
      tag: 'Best Seller'
    },
    {
      id: 'bs-2',
      title: 'Floral Maxi Dress',
      price: '₹2,299',
      image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80',
      costumeId: 'kurta',
      tag: 'Trending'
    },
    {
      id: 'bs-3',
      title: 'Premium Polo T-Shirt',
      price: '₹1,199',
      image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=600&q=80',
      costumeId: 'tshirt',
      tag: 'Popular'
    },
    {
      id: 'bs-4',
      title: 'Cotton Kurta Set',
      price: '₹1,999',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
      costumeId: 'kurta',
      tag: 'Festive'
    },
    {
      id: 'bs-5',
      title: 'Denim Jacket',
      price: '₹2,499',
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80',
      costumeId: 'jacket',
      tag: 'Classic'
    }
  ];

  return (
    <div className="bg-[#FAF7F2] text-[#1C1917] min-h-screen">
      
      {/* 1. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <div className="relative rounded-3xl bg-[#F4EFE6] border border-[#E8DFC8] overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center min-h-[520px]">
            
            {/* Left Content */}
            <div className="lg:col-span-6 p-8 sm:p-14 lg:p-16 flex flex-col justify-center z-10">
              <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#8C6D58] mb-3">
                New Collection
              </span>

              <h1 className="font-serif text-4xl sm:text-6xl font-medium tracking-tight text-[#1C1917] leading-[1.1] mb-6">
                Dress Better. <br />
                Live Better.
              </h1>

              <p className="text-sm sm:text-base text-[#6E5341] max-w-md mb-8 leading-relaxed">
                Timeless styles. Premium fabrics. Made for every you. Experience our next-generation 3D virtual fitting room before you buy.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/dashboard"
                  className="px-8 py-3.5 bg-[#1C1917] hover:bg-[#2E2824] text-white text-xs font-semibold tracking-wider uppercase rounded-sm shadow-md transition-all hover:scale-[1.02]"
                >
                  Shop New Arrivals
                </Link>

                <Link
                  to="/dashboard"
                  className="px-6 py-3.5 border border-[#1C1917] hover:bg-[#1C1917] hover:text-white text-[#1C1917] text-xs font-semibold tracking-wider uppercase rounded-sm transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>3D Fitting Room</span>
                </Link>
              </div>
            </div>

            {/* Right Hero Image */}
            <div className="lg:col-span-6 h-full min-h-[420px] lg:min-h-[540px] relative overflow-hidden flex items-end justify-center">
              <img
                src="https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1200&q=80"
                alt="Model in timeless linen shirt"
                className="w-full h-full object-cover object-top"
              />

              {/* Slide Indicators on the right */}
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 text-xs font-medium text-[#1C1917]/70 hidden sm:flex">
                <span className="cursor-pointer font-bold text-[#1C1917]">01</span>
                <span className="cursor-pointer hover:text-[#1C1917]">02</span>
                <span className="cursor-pointer hover:text-[#1C1917]">03</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. GENDER CATEGORIES BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Men */}
          <div className="relative rounded-2xl bg-[#F7F2EC] border border-[#E9E1D6] p-6 flex items-center justify-between overflow-hidden group hover:shadow-md transition-all">
            <div className="space-y-2 z-10">
              <h3 className="font-serif text-2xl font-semibold tracking-wide text-[#1C1917]">MEN</h3>
              <p className="text-xs uppercase tracking-wider text-[#8C6D58] font-semibold">UP TO 40% OFF</p>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1C1917] tracking-wider uppercase pt-2 border-b border-[#1C1917] hover:gap-2.5 transition-all"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="w-32 h-36 rounded-xl overflow-hidden shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=400&q=80"
                alt="Men fashion"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Women */}
          <div className="relative rounded-2xl bg-[#F7F2EC] border border-[#E9E1D6] p-6 flex items-center justify-between overflow-hidden group hover:shadow-md transition-all">
            <div className="space-y-2 z-10">
              <h3 className="font-serif text-2xl font-semibold tracking-wide text-[#1C1917]">WOMEN</h3>
              <p className="text-xs uppercase tracking-wider text-[#8C6D58] font-semibold">UP TO 40% OFF</p>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1C1917] tracking-wider uppercase pt-2 border-b border-[#1C1917] hover:gap-2.5 transition-all"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="w-32 h-36 rounded-xl overflow-hidden shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                alt="Women fashion"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Kids */}
          <div className="relative rounded-2xl bg-[#F7F2EC] border border-[#E9E1D6] p-6 flex items-center justify-between overflow-hidden group hover:shadow-md transition-all">
            <div className="space-y-2 z-10">
              <h3 className="font-serif text-2xl font-semibold tracking-wide text-[#1C1917]">KIDS</h3>
              <p className="text-xs uppercase tracking-wider text-[#8C6D58] font-semibold">UP TO 40% OFF</p>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1C1917] tracking-wider uppercase pt-2 border-b border-[#1C1917] hover:gap-2.5 transition-all"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="w-32 h-36 rounded-xl overflow-hidden shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=400&q=80"
                alt="Kids fashion"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

        </div>
      </section>

      {/* 3. SHOP BY CATEGORY (Circular Pills) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#8C6D58]">
          Top Categories
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#1C1917] mt-2 mb-10">
          Shop By Category
        </h2>

        <div className="flex items-center justify-center gap-6 sm:gap-10 overflow-x-auto pb-4 no-scrollbar">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              onClick={() => handleTryOn(cat.costumeId)}
              className="flex flex-col items-center gap-3 cursor-pointer group flex-shrink-0"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-[#E7DEC8] group-hover:border-[#8C6D58] transition-all p-1 bg-white shadow-sm group-hover:scale-105">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <span className="text-xs sm:text-sm font-medium text-[#1C1917] group-hover:text-[#8C6D58] transition-colors">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. BEST SELLERS PRODUCT GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#8C6D58]">
            Best Sellers
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#1C1917] mt-2">
            Trending Outfits & 3D Fits
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {bestSellers.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col justify-between rounded-xl bg-white border border-[#E9E1D6] p-3 hover:shadow-lg transition-all duration-300"
            >
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-[#F3EDE2] mb-3">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Wishlist Heart */}
                <button
                  onClick={() => toggleWishlist(item.id)}
                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#1C1917] hover:text-[#9C5838] transition-colors shadow-sm"
                >
                  <Heart
                    className={`w-4 h-4 ${wishlist[item.id] ? 'fill-rose-500 text-rose-500' : ''}`}
                  />
                </button>

                {/* Try On Button Overlay */}
                <button
                  onClick={() => handleTryOn(item.costumeId)}
                  className="absolute inset-x-3 bottom-3 py-2 bg-[#1C1917]/90 backdrop-blur-sm text-white text-xs font-semibold uppercase tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 hover:bg-[#1C1917]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#D5C4A1]" />
                  <span>Try In 3D</span>
                </button>
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-medium text-[#1C1917] truncate">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-[#8C6D58] mt-1">
                  {item.price}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/dashboard"
            className="inline-block px-8 py-3 border border-[#1C1917] hover:bg-[#1C1917] hover:text-white text-[#1C1917] text-xs font-semibold uppercase tracking-wider rounded-sm transition-all"
          >
            View All Products & 3D Fits
          </Link>
        </div>
      </section>

      {/* 5. PROMOTIONAL BANNER: REFRESH YOUR WARDROBE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-3xl bg-[#F4EFE6] border border-[#E8DFC8] overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            
            {/* Left Clothing Rack Image */}
            <div className="lg:col-span-7 h-64 lg:h-96 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1200&q=80"
                alt="Refresh your wardrobe fashion rack"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right Text */}
            <div className="lg:col-span-5 p-8 sm:p-12">
              <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#8C6D58]">
                New Season, New You.
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#1C1917] mt-2 mb-4">
                Refresh Your Wardrobe
              </h2>
              <p className="text-xs sm:text-sm text-[#6E5341] leading-relaxed mb-6">
                Explore the latest styles curated for the season. Seamlessly simulate fabric drape and fit on your personalized 3D avatar.
              </p>
              <Link
                to="/dashboard"
                className="inline-block px-8 py-3.5 bg-[#1C1917] hover:bg-[#2E2824] text-white text-xs font-semibold uppercase tracking-wider rounded-sm shadow transition-all"
              >
                Explore Collection
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 6. 4 VALUE / TRUST PROPOSITION BADGES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-y border-[#E8DFC8]/60">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#F3EDE2] flex items-center justify-center text-[#8C6D58] flex-shrink-0">
              <Shirt className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                Premium Quality
              </h4>
              <p className="text-xs text-[#6E5341] mt-0.5">
                Finest fabrics, crafted for comfort
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#F3EDE2] flex items-center justify-center text-[#8C6D58] flex-shrink-0">
              <RefreshCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                Easy Returns
              </h4>
              <p className="text-xs text-[#6E5341] mt-0.5">
                Simple returns within 7 days
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#F3EDE2] flex items-center justify-center text-[#8C6D58] flex-shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                Secure Payments
              </h4>
              <p className="text-xs text-[#6E5341] mt-0.5">
                100% secure payment gateway
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#F3EDE2] flex items-center justify-center text-[#8C6D58] flex-shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                Customer Support
              </h4>
              <p className="text-xs text-[#6E5341] mt-0.5">
                We're here to help you anytime
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 7. COMPLETE USER JOURNEY WALKTHROUGH */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#8C6D58]">
            Virtual Fitting Journey
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#1C1917] mt-2">
            How The 3D Try-On Works
          </h2>
          <p className="text-xs sm:text-sm text-[#6E5341] mt-2 max-w-lg mx-auto">
            From entering your measurements to automatic precision fitting and 360° virtual orbit.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-6 rounded-2xl bg-white border border-[#E9E1D6] hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-full bg-[#F7F2EC] text-[#8C6D58] font-bold text-sm flex items-center justify-center mb-4">
              1
            </div>
            <h3 className="font-serif text-lg font-semibold text-[#1C1917] flex items-center gap-2">
              <Ruler className="w-4 h-4 text-[#8C6D58]" />
              <span>Measurements</span>
            </h3>
            <p className="text-xs text-[#6E5341] mt-2 leading-relaxed">
              Enter your exact height, chest, waist, and hips, or pick from Small, Average, and Large body presets.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E9E1D6] hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-full bg-[#F7F2EC] text-[#8C6D58] font-bold text-sm flex items-center justify-center mb-4">
              2
            </div>
            <h3 className="font-serif text-lg font-semibold text-[#1C1917] flex items-center gap-2">
              <User className="w-4 h-4 text-[#8C6D58]" />
              <span>3D Avatar</span>
            </h3>
            <p className="text-xs text-[#6E5341] mt-2 leading-relaxed">
              Our skeletal modifier adjusts the humanoid rig in real-time to match your silhouette and posture presets.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E9E1D6] hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-full bg-[#F7F2EC] text-[#8C6D58] font-bold text-sm flex items-center justify-center mb-4">
              3
            </div>
            <h3 className="font-serif text-lg font-semibold text-[#1C1917] flex items-center gap-2">
              <Shirt className="w-4 h-4 text-[#8C6D58]" />
              <span>Automatic Fit</span>
            </h3>
            <p className="text-xs text-[#6E5341] mt-2 leading-relaxed">
              Select garments from our catalog. CostumeFitter automatically scales cloth with anti-clipping clearance.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E9E1D6] hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-full bg-[#F7F2EC] text-[#8C6D58] font-bold text-sm flex items-center justify-center mb-4">
              4
            </div>
            <h3 className="font-serif text-lg font-semibold text-[#1C1917] flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-[#8C6D58]" />
              <span>Save Look</span>
            </h3>
            <p className="text-xs text-[#6E5341] mt-2 leading-relaxed">
              Rotate, zoom, and inspect your outfit in 360°. Save customized looks to your wardrobe.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
};

export default HomePage;
