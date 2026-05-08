import React, { useState, useEffect } from 'react';
import { useStore } from '../StoreContext';
import { MessageSquare, Send, Clock, CheckCircle, HelpCircle, Loader2 } from 'lucide-react';
import { SupportTicket } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import UserLayout from '../components/UserLayout';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function Support() {
  const { user } = useStore();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', message: '' });

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'tickets'),
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      setTickets(snap.docs.map(d => ({ id: d.id, ...d.data() } as SupportTicket)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const ticketRef = doc(collection(db, 'tickets'));
      await setDoc(ticketRef, {
        ...newTicket,
        id: ticketRef.id,
        userId: user.id,
        userName: user.name,
        status: 'Open',
        createdAt: serverTimestamp()
      });
      setShowNew(false);
      setNewTicket({ subject: '', message: '' });
    } catch (err) { alert('Failed to create ticket'); }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <UserLayout title="Customer Support">
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <HelpCircle size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Neko Support</h2>
                <p className="text-sm text-gray-500">We respond within 24 hours</p>
              </div>
          </div>
          <button 
            onClick={() => setShowNew(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700"
          >
            Create Ticket
          </button>
        </div>

        <AnimatePresence>
          {showNew && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-white rounded-2xl shadow-sm border border-blue-100"
            >
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <h3 className="font-bold text-gray-900 border-b pb-4">New Support Request</h3>
                <div className="grid gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Subject</label>
                      <input 
                        required 
                        className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-100 outline-none" 
                        placeholder="Order issue, Refund request, etc."
                        value={newTicket.subject}
                        onChange={e => setNewTicket({...newTicket, subject: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description</label>
                      <textarea 
                        required 
                        rows={4}
                        className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-100 outline-none" 
                        placeholder="How can we help you?"
                        value={newTicket.message}
                        onChange={e => setNewTicket({...newTicket, message: e.target.value})}
                      />
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setShowNew(false)} className="px-6 py-2 font-bold text-gray-500">Discard</button>
                    <button type="submit" className="bg-blue-600 text-white px-8 py-2 rounded-xl font-bold shadow-lg shadow-blue-100">Send Message</button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          {tickets.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-gray-300">
              <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No active support tickets.</p>
            </div>
          ) : (
            tickets.map((t) => (
              <div key={t.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 justify-between items-start">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        t.status === 'Open' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'
                      }`}>
                        {t.status}
                      </span>
                      <span className="text-xs text-gray-400 font-mono italic">#{t.id}</span>
                    </div>
                    <h3 className="font-bold text-gray-900">{t.subject}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{t.message}</p>
                </div>
                <div className="text-right space-y-2 shrink-0">
                    <p className="text-xs text-gray-400 flex items-center justify-end gap-1">
                      <Clock size={12} /> {new Date(t.createdAt).toLocaleDateString()}
                    </p>
                    {t.status === 'Open' ? (
                      <div className="text-xs font-bold text-orange-600 animate-pulse">Awaiting response...</div>
                    ) : (
                      <div className="text-xs font-bold text-green-600 flex items-center justify-end gap-1">
                          <CheckCircle size={14} /> Resolved
                      </div>
                    )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </UserLayout>
  );
}
