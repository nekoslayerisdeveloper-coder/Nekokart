import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useStore } from '../StoreContext';
import { motion, AnimatePresence } from 'motion/react';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity } = useStore();
  const navigate = useNavigate();

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryCharge = subtotal > 499 ? 0 : 40;
  const total = subtotal + deliveryCharge;

  if (cart.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center max-w-2xl mx-auto border border-gray-100">
        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Your cart is empty!</h2>
        <p className="text-gray-500 mt-2 mb-8">Add items to it now.</p>
        <Link to="/products" className="bg-blue-600 text-white px-10 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 transition-colors">
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Items List */}
      <div className="flex-grow space-y-4">
        <div className="bg-white p-4 rounded-t-lg border-b flex items-center justify-between">
          <h2 className="text-lg font-bold">My Cart ({cart.length})</h2>
          <Link to="/products" className="text-blue-600 text-sm font-semibold flex items-center gap-1 hover:underline">
            <ArrowLeft size={16} /> Continue Shopping
          </Link>
        </div>
        
        <div className="bg-white shadow-sm border border-gray-100 rounded-b-lg overflow-hidden">
          <AnimatePresence initial={false}>
            {cart.map((item) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-4 border-b last:border-0 flex gap-4"
              >
                <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 border rounded overflow-hidden p-2 flex items-center justify-center bg-gray-50">
                  <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain" />
                </div>
                <div className="flex-grow flex flex-col justify-between py-1">
                  <div>
                    <h3 className="font-semibold text-gray-900 line-clamp-2">{item.name}</h3>
                    <p className="text-xs text-gray-500 mt-1 capitalize">{item.category}</p>
                    <div className="flex items-baseline gap-2 mt-2">
                       <span className="text-lg font-bold text-gray-900">₹{item.price.toLocaleString()}</span>
                       <span className="text-xs text-green-600 font-bold">1 Offer Applied</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border rounded-full overflow-hidden">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-gray-100 text-gray-600"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center font-bold text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-gray-100 text-gray-600"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-xs font-bold text-gray-400 hover:text-red-600 uppercase tracking-wider flex items-center gap-1"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Price Summary */}
      <div className="w-full lg:w-96 shrink-0">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden sticky top-24">
          <div className="p-4 border-b">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Price Details</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex justify-between text-gray-700">
              <span>Price ({cart.length} items)</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Discount</span>
              <span className="text-green-600">- ₹0</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Delivery Charges</span>
              <span className={deliveryCharge === 0 ? 'text-green-600' : ''}>
                {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
              </span>
            </div>
            <div className="pt-4 border-t border-dashed flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">Total Amount</span>
              <span className="text-lg font-bold text-gray-900">₹{total.toLocaleString()}</span>
            </div>
            <div className="pt-2">
               <p className="text-green-600 text-xs font-bold font-medium flex items-center gap-1">
                 You will save ₹{(subtotal * 0.1).toFixed(0)} on this order
               </p>
            </div>
          </div>
          <div className="p-4 bg-gray-50 border-t">
            <button 
              onClick={() => navigate('/checkout')}
              className="w-full bg-orange-500 text-white py-4 rounded font-bold uppercase tracking-wider shadow-lg hover:bg-orange-600 transition-colors"
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
