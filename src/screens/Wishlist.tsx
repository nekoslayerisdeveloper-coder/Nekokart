import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Heart, ShoppingCart } from 'lucide-react';
import { useStore } from '../StoreContext';
import { motion, AnimatePresence } from 'motion/react';

export default function Wishlist() {
  const { wishlist, toggleWishlist, addToCart } = useStore();

  if (wishlist.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center max-w-2xl mx-auto border border-gray-100">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
          <Heart size={48} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Your wishlist is empty</h2>
        <p className="text-gray-500 mt-2 mb-8">Save items that you like to your wishlist.</p>
        <Link to="/products" className="bg-blue-600 text-white px-10 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 transition-colors">
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-4 rounded-t-lg border-b mb-4">
        <h2 className="text-lg font-bold">My Wishlist ({wishlist.length})</h2>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence initial={false}>
          {wishlist.map((product) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex gap-6 items-center"
            >
              <Link to={`/products/${product.id}`} className="w-24 h-24 shrink-0 border rounded overflow-hidden p-2 flex items-center justify-center bg-gray-50">
                <img src={product.image} alt={product.name} className="max-w-full max-h-full object-contain" />
              </Link>
              
              <div className="flex-grow">
                <Link to={`/products/${product.id}`} className="font-semibold text-gray-900 hover:text-blue-600 line-clamp-1">
                  {product.name}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <div className="bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5 font-bold">
                    {product.rating} ★
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-lg font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                  <span className="text-xs text-gray-400 line-through">₹{(product.price * 1.3).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button 
                  onClick={() => addToCart(product)}
                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 hover:bg-blue-700 whitespace-nowrap"
                >
                  <ShoppingCart size={16} /> Add to Cart
                </button>
                <button 
                  onClick={() => toggleWishlist(product)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  title="Remove from Wishlist"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
