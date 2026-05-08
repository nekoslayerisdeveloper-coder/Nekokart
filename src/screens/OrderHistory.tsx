import React, { useEffect, useState } from 'react';
import { useStore } from '../StoreContext';
import { Package, Truck, ChevronRight, Search, Clock, X, MapPin, Phone, User as UserIcon, RotateCcw, Edit, Save, Loader2 } from 'lucide-react';
import { Order } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import UserLayout from '../components/UserLayout';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';

export default function OrderHistory() {
  const { user } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editDetails, setEditDetails] = useState({ fullName: '', phone: '', address: '', pincode: '' });

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'orders'), 
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: 'Cancelled' });
    } catch (err) { alert('Action failed'); }
  };

  const handleReturnOrder = async (orderId: string) => {
    if (!confirm('Do you want to initiate a return?')) return;
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: 'Returned' });
    } catch (err) { alert('Action failed'); }
  };

  const handleSaveEdit = async () => {
    if (!selectedOrder) return;
    try {
      await updateDoc(doc(db, 'orders', selectedOrder.id), { shippingDetails: { ...selectedOrder.shippingDetails, ...editDetails } });
      setIsEditing(false);
    } catch (err) { alert('Update failed'); }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <UserLayout title="My Orders">
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-gray-100">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold">No orders found</h3>
          </div>
        ) : (
          orders.map((order) => (
            <motion.div 
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="p-6 flex flex-col md:flex-row gap-6">
                <div className="flex -space-x-4 shrink-0 overflow-hidden">
                  {order.items.slice(0, 3).map((item, i) => (
                    <div key={i} className="w-16 h-16 border-2 border-white rounded shadow-sm bg-gray-50 p-2 overflow-hidden flex items-center justify-center">
                      <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain" />
                    </div>
                  ))}
                </div>

                <div className="flex-grow flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-1">
                    <p className={`text-[10px] font-black uppercase tracking-widest ${order.status === 'Cancelled' ? 'text-red-500' : 'text-blue-600'}`}>
                      {order.status}
                    </p>
                    <h3 className="font-bold text-gray-900 truncate max-w-sm">
                      {order.items[0].name} {order.items.length > 1 ? `& ${order.items.length - 1} more items` : ''}
                    </h3>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                       Ordered on {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <p className="text-lg font-bold text-gray-900">₹{order.total.toLocaleString()}</p>
                    <div className="flex items-center gap-1 text-sm font-bold text-blue-600">
                       View Details <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setSelectedOrder(null); setIsEditing(false); }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b flex justify-between items-center bg-gray-50 shrink-0">
                <div>
                   <h3 className="text-xl font-bold text-gray-900">Order #{selectedOrder.id}</h3>
                   <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-1">{selectedOrder.status}</p>
                </div>
                <button onClick={() => { setSelectedOrder(null); setIsEditing(false); }} className="p-2 text-gray-400 hover:text-gray-900 border-0 bg-transparent">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-6 space-y-6">
                {/* Shipping Section */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                       <Truck size={14} /> Shipping Destination
                    </h4>
                    {selectedOrder.status === 'Processing' && (
                      <button 
                        onClick={() => {
                          setEditDetails(selectedOrder.shippingDetails);
                          setIsEditing(!isEditing);
                        }}
                        className="text-blue-600 text-xs font-bold hover:underline"
                      >
                        {isEditing ? 'Cancel Edit' : 'Edit Address'}
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-4">
                       <div className="grid grid-cols-2 gap-4">
                          <input className="w-full border rounded-lg p-2 text-sm" value={editDetails.fullName} onChange={e => setEditDetails({...editDetails, fullName:e.target.value})} placeholder="Name" />
                          <input className="w-full border rounded-lg p-2 text-sm" value={editDetails.phone} onChange={e => setEditDetails({...editDetails, phone:e.target.value})} placeholder="Phone" />
                       </div>
                       <input className="w-full border rounded-lg p-2 text-sm" value={editDetails.pincode} onChange={e => setEditDetails({...editDetails, pincode:e.target.value})} placeholder="Pincode" />
                       <textarea className="w-full border rounded-lg p-2 text-sm" value={editDetails.address} onChange={e => setEditDetails({...editDetails, address:e.target.value})} placeholder="Address" rows={2} />
                       <button onClick={handleSaveEdit} className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2"><Save size={16}/> Save Changes</button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                       <p className="font-bold text-gray-900 flex items-center gap-2 text-sm"><UserIcon size={14}/> {selectedOrder.shippingDetails.fullName}</p>
                       <p className="text-gray-600 flex items-center gap-2 text-sm"><Phone size={14}/> {selectedOrder.shippingDetails.phone}</p>
                       <p className="text-gray-600 flex items-center gap-2 text-sm"><MapPin size={14}/> {selectedOrder.shippingDetails.address}, {selectedOrder.shippingDetails.pincode}</p>
                    </div>
                  )}
                </div>

                {/* Items */}
                <div className="space-y-3">
                   <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order Summary</h4>
                   {selectedOrder.items.map((item, idx) => (
                     <div key={idx} className="flex gap-4 items-center p-3 border rounded-xl">
                        <div className="w-12 h-12 bg-gray-50 rounded border p-1 shrink-0 flex items-center justify-center">
                          <img src={item.image} alt="" className="max-w-full max-h-full object-contain" />
                        </div>
                        <div className="flex-grow">
                          <p className="text-sm font-bold text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500">₹{item.price.toLocaleString()} × {item.quantity}</p>
                        </div>
                        <p className="font-bold">₹{(item.price * item.quantity).toLocaleString()}</p>
                     </div>
                   ))}
                </div>

                {/* Footer Stats & Actions */}
                <div className="flex justify-between items-center pt-4 border-t">
                   <div>
                      <p className="text-xs font-bold text-gray-400 uppercase">Grand Total</p>
                      <p className="text-2xl font-bold text-blue-600">₹{selectedOrder.total.toLocaleString()}</p>
                   </div>
                   <div className="flex gap-2">
                      {selectedOrder.status === 'Processing' && (
                        <button onClick={() => handleCancelOrder(selectedOrder.id)} className="bg-red-50 text-red-500 px-6 py-2 rounded-xl font-bold flex items-center gap-2"><X size={18}/> Cancel</button>
                      )}
                      {selectedOrder.status === 'Delivered' && (
                        <button onClick={() => handleReturnOrder(selectedOrder.id)} className="bg-orange-50 text-orange-500 px-6 py-2 rounded-xl font-bold flex items-center gap-2"><RotateCcw size={18}/> Return</button>
                      )}
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </UserLayout>
  );
}
