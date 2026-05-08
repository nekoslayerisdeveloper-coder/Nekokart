import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Truck, CheckCircle2, Loader2, IndianRupee, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useStore } from '../StoreContext';
import { motion, AnimatePresence } from 'motion/react';

export default function Checkout() {
  const { cart, token, clearCart } = useStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [shippingDetails, setShippingDetails] = useState({
    fullName: '',
    phone: '',
    address: '',
    pincode: '',
    homePhoto: '',
    userPhoto: ''
  });
  const [uploading, setUploading] = useState<'home' | 'user' | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Online'>('COD');
  const [paymentScreenshot, setPaymentScreenshot] = useState('');
  const [adminSettings, setAdminSettings] = useState({ adminQR: '', upiId: '' });

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryCharge = subtotal > 499 ? 0 : 40;
  const total = subtotal + deliveryCharge;

  React.useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setAdminSettings(data))
      .catch(err => console.error('Failed to fetch settings', err));
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'home' | 'user' | 'payment') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type !== 'payment') setUploading(type);
    else setLoading(true); // Using loading state for payment screenshot

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        if (type === 'payment') {
          setPaymentScreenshot(data.url);
        } else {
          setShippingDetails(prev => ({ ...prev, [type === 'home' ? 'homePhoto' : 'userPhoto']: data.url }));
        }
      }
    } catch (err) {
      alert('Upload failed');
    } finally {
      setUploading(null);
      setLoading(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingDetails.fullName || !shippingDetails.phone || !shippingDetails.address || !shippingDetails.pincode) {
      return alert('Please fill in all shipping details including Pincode');
    }

    if (paymentMethod === 'Online' && !paymentScreenshot) {
      return alert('Please upload payment screenshot after paying via QR code');
    }
    
    setLoading(true);
    try {
      const orderData = {
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        total,
        paymentMethod,
        paymentScreenshot: paymentMethod === 'Online' ? paymentScreenshot : null,
        shippingDetails
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (!res.ok) throw new Error('Order placement failed');
      
      setSuccess(true);
      clearCart();
      setTimeout(() => navigate('/orders'), 3000);
    } catch (err) {
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-10 rounded-2xl shadow-xl border border-blue-50"
        >
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Order Placed Successfully!</h2>
          <p className="text-gray-500 mt-2 mb-8">Thank you for shopping with Neko Kart. Your order is being processed.</p>
          <p className="text-sm text-blue-600 font-bold">Redirecting to My Orders...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
      {/* Checkout Forms */}
      <div className="flex-grow space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
           <div className="bg-blue-600 px-6 py-3 text-white flex items-center gap-2">
              <span className="bg-white text-blue-600 w-5 h-5 rounded-sm flex items-center justify-center font-bold text-xs">1</span>
              <h3 className="font-bold uppercase text-sm tracking-wider">Shipping Details</h3>
           </div>
           <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter Full Name"
                    className="w-full border-b-2 border-gray-100 p-2 focus:border-blue-600 focus:outline-none font-medium"
                    value={shippingDetails.fullName}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, fullName: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
                  <input 
                    type="text" 
                    placeholder="10-digit mobile number"
                    className="w-full border-b-2 border-gray-100 p-2 focus:border-blue-600 focus:outline-none font-medium"
                    value={shippingDetails.phone}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pincode</label>
                  <input 
                    type="text" 
                    placeholder="6-digit Pincode"
                    className="w-full border-b-2 border-gray-100 p-2 focus:border-blue-600 focus:outline-none font-medium"
                    value={shippingDetails.pincode}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, pincode: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Delivery Address</label>
                <textarea 
                  placeholder="Enter building, street, area, landmark"
                  className="w-full border-2 border-gray-100 rounded-lg p-4 focus:border-blue-600 focus:outline-none h-20 text-gray-700 font-medium"
                  value={shippingDetails.address}
                  onChange={(e) => setShippingDetails({ ...shippingDetails, address: e.target.value })}
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <MapPin size={12} /> Home/Location Photo
                  </label>
                  <div className="relative group">
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'home')} className="hidden" id="home-photo" />
                    <label htmlFor="home-photo" className="block w-full border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-blue-400 group-hover:bg-blue-50">
                      {shippingDetails.homePhoto ? (
                        <img src={shippingDetails.homePhoto} className="h-16 mx-auto object-contain" alt="Home" />
                      ) : uploading === 'home' ? (
                        <Loader2 className="animate-spin mx-auto text-blue-600" />
                      ) : (
                        <span className="text-xs font-bold text-gray-400">Upload Home Photo</span>
                      )}
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <UserIcon size={12} /> Your Photo (Verification)
                  </label>
                  <div className="relative group">
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'user')} className="hidden" id="user-photo" />
                    <label htmlFor="user-photo" className="block w-full border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-blue-400 group-hover:bg-blue-50">
                      {shippingDetails.userPhoto ? (
                        <img src={shippingDetails.userPhoto} className="h-16 mx-auto object-contain" alt="User" />
                      ) : uploading === 'user' ? (
                        <Loader2 className="animate-spin mx-auto text-blue-600" />
                      ) : (
                        <span className="text-xs font-bold text-gray-400">Upload Your Photo</span>
                      )}
                    </label>
                  </div>
                </div>
              </div>
           </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
           <div className="bg-blue-600 px-6 py-3 text-white flex items-center gap-2">
              <span className="bg-white text-blue-600 w-5 h-5 rounded-sm flex items-center justify-center font-bold text-xs">2</span>
              <h3 className="font-bold uppercase text-sm tracking-wider">Payment Options</h3>
           </div>
            <div className="p-6 space-y-4">
              <label 
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'COD' ? 'border-blue-600 bg-blue-50' : 'border-gray-50 hover:border-gray-200'
                }`}
                onClick={() => setPaymentMethod('COD')}
              >
                <input type="radio" name="payment" checked={paymentMethod === 'COD'} onChange={() => {}} className="accent-blue-600" />
                <div className="flex items-center gap-3">
                  <Truck className="text-gray-600" size={24} />
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Cash on Delivery</p>
                    <p className="text-xs text-gray-500">Pay when you receive your order</p>
                  </div>
                </div>
              </label>

              <label 
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'Online' ? 'border-blue-600 bg-blue-50' : 'border-gray-50 hover:border-gray-200'
                }`}
                onClick={() => setPaymentMethod('Online')}
              >
                <input type="radio" name="payment" checked={paymentMethod === 'Online'} onChange={() => {}} className="accent-blue-600" />
                <div className="flex items-center gap-3">
                  <CreditCard className="text-gray-600" size={24} />
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Online Payment (UPI/QR)</p>
                    <p className="text-xs text-gray-500">Scan QR Code & Upload Screenshot</p>
                  </div>
                </div>
              </label>

              <AnimatePresence>
                {paymentMethod === 'Online' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-200"
                  >
                    <div className="text-center space-y-6">
                      <div className="space-y-2">
                        <p className="text-xs uppercase font-bold text-gray-500 tracking-widest">Step 1: Scan & Pay Amount ₹{total.toLocaleString()}</p>
                        <div className="bg-white p-4 rounded-2xl inline-block shadow-md border border-gray-100">
                          {adminSettings.adminQR ? (
                            <img src={adminSettings.adminQR} alt="Admin QR" className="w-48 h-48 mx-auto" />
                          ) : (
                            <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded-lg">
                              <p className="text-xs text-gray-400">QR Code not available</p>
                            </div>
                          )}
                          <p className="mt-3 font-mono text-sm font-bold text-blue-600">{adminSettings.upiId || 'kailash@upi'}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="text-xs uppercase font-bold text-gray-500 tracking-widest">Step 2: Upload Payment Screenshot</p>
                        <div className="relative group">
                          <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'payment')} className="hidden" id="payment-screenshot" />
                          <label htmlFor="payment-screenshot" className={`block w-full border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                            paymentScreenshot ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400'
                          }`}>
                            {paymentScreenshot ? (
                              <div className="space-y-2">
                                <CheckCircle2 size={32} className="text-green-500 mx-auto" />
                                <p className="text-sm font-bold text-green-700">Screenshot Uploaded!</p>
                                <img src={paymentScreenshot} className="h-20 mx-auto rounded" alt="Payment" />
                                <span className="text-[10px] text-green-600 underline">Change Screenshot</span>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <ShieldCheck size={32} className="text-gray-300 mx-auto group-hover:text-blue-400" />
                                <p className="text-sm font-bold text-gray-500 group-hover:text-blue-600">Click to Upload Screenshot</p>
                                <p className="text-[10px] text-gray-400">Must be a clear proof of payment</p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
        </div>
      </div>

      {/* Summary Side */}
      <div className="w-full md:w-96 shrink-0 space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Price Details</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between text-gray-600 text-sm">
              <span>Price ({cart.length} items)</span>
              <span className="font-bold">₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600 text-sm">
              <span>Delivery Charges</span>
              <span className={deliveryCharge === 0 ? 'text-green-600 font-bold' : 'font-bold'}>
                {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
              </span>
            </div>
            <div className="pt-3 border-t border-dashed flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">Amount Payable</span>
              <span className="text-lg font-bold text-gray-900">₹{total.toLocaleString()}</span>
            </div>
          </div>
          <div className="p-4 bg-gray-50 border-t">
            <button 
              disabled={loading}
              onClick={handlePlaceOrder}
              className="w-full bg-orange-500 text-white py-4 rounded font-bold uppercase tracking-widest shadow-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Complete Order'}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-400 text-[10px] px-2">
           <ShieldCheck size={16} /> 
           <span>Safe and Secure Payments. 100% Authentic products.</span>
        </div>
      </div>
    </div>
  );
}
