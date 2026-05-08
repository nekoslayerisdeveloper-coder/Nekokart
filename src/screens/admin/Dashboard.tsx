import React, { useEffect, useState } from 'react';
import { useStore } from '../../StoreContext';
import { 
  Users, ShoppingBag, DollarSign, TrendingUp, 
  BarChart3, Calendar, ArrowUpRight, ArrowDownRight, Loader2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import AdminLayout from './AdminLayout';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

export default function AdminDashboard() {
  const { user } = useStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [ordersSnap, usersSnap] = await Promise.all([
          getDocs(collection(db, 'orders')),
          getDocs(collection(db, 'users'))
        ]);

        const orders = ordersSnap.docs.map(d => d.data());
        const totalRevenue = orders.reduce((acc, curr: any) => acc + (curr.total || 0), 0);
        
        // Mock chart data based on real count
        const chartData = [
          { date: 'Mon', revenue: totalRevenue * 0.1 },
          { date: 'Tue', revenue: totalRevenue * 0.2 },
          { date: 'Wed', revenue: totalRevenue * 0.15 },
          { date: 'Thu', revenue: totalRevenue * 0.25 },
          { date: 'Fri', revenue: totalRevenue * 0.3 },
        ];

        setStats({
          totalRevenue,
          totalOrders: ordersSnap.size,
          totalUsers: usersSnap.size,
          chartData
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <AdminLayout title="Dashboard"><div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-blue-600" /></div></AdminLayout>;

  const cards = [
    { title: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'blue', change: '+12.5%' },
    { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'orange', change: '+8.2%' },
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'green', change: '+5.1%' },
    { title: 'Sales Velocity', value: '8.4/hr', icon: TrendingUp, color: 'purple', change: '-2.4%' }
  ];

  return (
    <AdminLayout title="Analytics Overview">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg bg-${card.color}-50 text-${card.color}-600`}>
                <card.icon size={24} />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${
                card.change.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
              }`}>
                {card.change.startsWith('+') ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {card.change}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-500">{card.title}</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{card.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 size={20} className="text-blue-600" /> Revenue Growth
            </h3>
            <select className="text-xs font-bold text-gray-500 border rounded p-1 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Calendar size={20} className="text-orange-600" /> Recent Activity
            </h3>
          </div>
          <div className="space-y-4">
             {[1, 2, 3, 4].map(i => (
               <div key={i} className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-blue-600">
                    <ShoppingBag size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">New Order #NK-92{i}83</p>
                    <p className="text-xs text-gray-500">2 minutes ago • ₹4,200</p>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
