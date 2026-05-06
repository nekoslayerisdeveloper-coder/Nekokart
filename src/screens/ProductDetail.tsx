import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Zap, Heart, Star, ShieldCheck, RotateCcw, Truck, MapPin } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../StoreContext';
import { motion } from 'motion/react';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setLoading(false);
      });
  }, [id]);

  if (loading || !product) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleBuyNow = () => {
    addToCart(product);
    navigate('/cart');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex flex-col md:flex-row p-6 md:p-10 gap-10">
        {/* Left: Images */}
        <div className="w-full md:w-1/2 space-y-4">
          <div className="aspect-square border rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center p-8">
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={product.image} 
              alt={product.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => addToCart(product)}
              className="flex-1 bg-yellow-400 text-blue-900 h-14 rounded font-bold flex items-center justify-center gap-2 hover:bg-yellow-300 transition-colors uppercase tracking-wide"
            >
              <ShoppingCart size={20} /> Add to Cart
            </button>
            <button 
              onClick={handleBuyNow}
              className="flex-1 bg-orange-500 text-white h-14 rounded font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors uppercase tracking-wide"
            >
              <Zap size={20} /> Buy Now
            </button>
          </div>
        </div>

        {/* Right: Info */}
        <div className="flex-grow space-y-6">
          <div className="space-y-1">
            <nav className="text-xs text-gray-500 flex gap-2 mb-2">
              <span className="hover:text-blue-600 cursor-pointer">Home</span>
              <span>/</span>
              <span className="hover:text-blue-600 cursor-pointer capitalize">{product.category}</span>
              <span>/</span>
              <span className="text-gray-900">{product.name}</span>
            </nav>
            <h1 className="text-2xl font-semibold text-gray-900 leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-4 mt-2">
               <div className="bg-green-600 text-white text-sm px-2 py-0.5 rounded flex items-center gap-1 font-bold">
                  {product.rating} <Star size={14} className="fill-white" />
                </div>
                <span className="text-gray-500 text-sm font-medium">1,452 Ratings & 236 Reviews</span>
                <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/fa_6296a0.png" alt="Assured" className="h-4" />
            </div>
          </div>

          <div className="space-y-1">
             <p className="text-green-600 text-sm font-bold">Special Price</p>
             <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold">₹{product.price.toLocaleString()}</span>
                <span className="text-gray-400 line-through">₹{(product.price * 1.4).toLocaleString()}</span>
                <span className="text-green-600 font-bold">28% off</span>
             </div>
          </div>

          {/* Delivery Options */}
          <div className="py-6 border-y border-gray-100 flex flex-col sm:flex-row gap-6">
            <div className="space-y-3">
               <div className="flex items-center gap-2 text-gray-500 text-sm font-semibold">
                 <MapPin size={16} /> Delivery
               </div>
               <div className="flex">
                  <input type="text" placeholder="Enter Pincode" className="border-b-2 border-blue-600 focus:outline-none px-2 py-1 text-sm font-medium" />
                  <button className="text-blue-600 font-bold text-sm ml-2">Check</button>
               </div>
               <p className="text-xs font-bold text-gray-900">Delivery by 12 May, Tuesday | Free <span className="text-gray-400 line-through">₹40</span></p>
            </div>
            <div className="flex gap-8">
               <div className="flex flex-col items-center text-center gap-1">
                  <RotateCcw size={20} className="text-gray-700" />
                  <span className="text-[10px] text-gray-500 font-medium">7 Days <br/> Replacement</span>
               </div>
               <div className="flex flex-col items-center text-center gap-1">
                  <Truck size={20} className="text-gray-700" />
                  <span className="text-[10px] text-gray-500 font-medium">Cash on <br/> Delivery Available</span>
               </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-gray-900">Product Details</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {product.description}. This {product.category} product is built with high-quality materials to ensure durability and performance. It comes with a 1-year brand warranty.
            </p>
          </div>

          <button 
            onClick={() => toggleWishlist(product)}
            className={`flex items-center gap-2 text-sm font-bold ${
              isInWishlist(product.id) ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            }`}
          >
            <Heart size={20} className={isInWishlist(product.id) ? 'fill-red-500' : ''} />
            {isInWishlist(product.id) ? 'Added to Wishlist' : 'Add to Wishlist'}
          </button>
        </div>
      </div>
    </div>
  );
}
