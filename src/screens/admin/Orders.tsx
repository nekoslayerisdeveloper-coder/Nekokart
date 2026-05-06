import React, { useEffect, useState } from 'react';
import { useStore } from '../../StoreContext';
import { Order } from '../../types';
import { Eye, Package, CheckCircle2, Clock, XCircle, Search, Truck, X, User as UserIcon, Phone, MapPin } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminOrders() {
  const { token } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    fetch('/api/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setOrders(data.reverse());
        setLoading(false);
      });
  };

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/admin/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    if (res.ok) fetchOrders();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processing': return 'text-orange-600 bg-orange-50';
      case 'Shipped': return 'text-blue-600 bg-blue-50';
      case 'Delivered': return 'text-green-600 bg-green-50';
      case 'Cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <AdminLayout title="Order Registry">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
         <div className="relative w-full sm:w-96">
            <input 
              type="text" 
              placeholder="Filter by Order ID or User..." 
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm" 
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
         </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Order ID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">User Details</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-gray-900">{o.id}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs">
                      <p className="font-bold text-gray-900">{o.shippingDetails?.fullName || 'N/A'}</p>
                      <p className="text-gray-500">{o.shippingDetails?.phone || 'N/A'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold">₹{o.total.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(o.status)}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button 
                        onClick={() => setSelectedOrder(o)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="View Details"
                      ><Eye size={16} /></button>
                      <button 
                        onClick={() => updateStatus(o.id, 'Shipped')}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded" title="Mark Shipped"
                      ><Truck size={16} /></button>
                      <button 
                        onClick={() => updateStatus(o.id, 'Delivered')}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Mark Delivered"
                      ><CheckCircle2 size={16} /></button>
                      <button 
                        onClick={() => updateStatus(o.id, 'Cancelled')}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Cancel Order"
                      ><XCircle size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
                  <p className="text-xs text-gray-500 font-mono mt-1">{selectedOrder.id}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-white rounded-full bg-transparent border-0">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-6 space-y-8">
                {/* User & Shipping Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                       <UserIcon size={14} /> Customer Information
                    </h4>
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-gray-900">{selectedOrder.shippingDetails.fullName}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Phone size={14} className="text-gray-400" /> {selectedOrder.shippingDetails.phone}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Package size={14} className="text-gray-400" /> Pincode: {selectedOrder.shippingDetails.pincode}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                       <MapPin size={14} /> Shipping Address
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border">
                      {selectedOrder.shippingDetails.address}
                    </p>
                  </div>
                </div>

                {/* Photos Section */}
                {(selectedOrder.shippingDetails.homePhoto || selectedOrder.shippingDetails.userPhoto) && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {selectedOrder.shippingDetails.homePhoto && (
                        <div className="space-y-2">
                           <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Home/Location Photo</h4>
                           <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden border">
                              <img src={selectedOrder.shippingDetails.homePhoto} className="w-full h-full object-cover" />
                           </div>
                        </div>
                      )}
                      {selectedOrder.shippingDetails.userPhoto && (
                        <div className="space-y-2">
                           <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer ID Photo</h4>
                           <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden border">
                              <img src={selectedOrder.shippingDetails.userPhoto} className="w-full h-full object-cover" />
                           </div>
                        </div>
                      )}
                   </div>
                )}

                {/* Items List */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                     <Package size={14} /> Order Items ({selectedOrder.items.length})
                  </h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-center p-3 border rounded-xl hover:bg-gray-50">
                        <div className="w-12 h-12 bg-gray-50 rounded border p-1 shrink-0 flex items-center justify-center">
                          <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain" />
                        </div>
                        <div className="flex-grow">
                          <p className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                        </div>
                        <p className="text-sm font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-blue-600 p-6 rounded-2xl text-white flex justify-between items-center shadow-lg shadow-blue-100">
                  <div className="space-y-1">
                    <p className="text-blue-100 text-[10px] font-bold uppercase tracking-wider">Payment Method</p>
                    <p className="font-bold flex items-center gap-2">{selectedOrder.paymentMethod}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-blue-100 text-[10px] font-bold uppercase tracking-wider">Total Amount</p>
                    <p className="text-2xl font-bold italic">₹{selectedOrder.total.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
                 <button 
                   onClick={() => setSelectedOrder(null)}
                   className="px-6 py-2 font-bold text-gray-500"
                 >Close</button>
                 <button 
                   onClick={() => updateStatus(selectedOrder.id, 'Shipped')}
                   className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-lg"
                 >Dispatch Now</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
