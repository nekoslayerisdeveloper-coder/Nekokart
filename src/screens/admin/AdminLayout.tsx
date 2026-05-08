import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, ListOrdered, Users, ArrowLeft, Layers, QrCode } from 'lucide-react';

export default function AdminLayout({ children, title }: { children: React.ReactNode, title: string }) {
  const location = useLocation();

  const menuItems = [
    { label: 'Overview', icon: LayoutDashboard, path: '/admin' },
    { label: 'Categories', icon: Layers, path: '/admin/categories' },
    { label: 'Products', icon: ShoppingBag, path: '/admin/products' },
    { label: 'Orders', icon: ListOrdered, path: '/admin/orders' },
    { label: 'Payment QR', icon: QrCode, path: '/admin/payment' },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <aside className="w-full md:w-64 space-y-2">
        <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 mb-6">
           <Link to="/" className="flex items-center gap-2 p-3 text-blue-600 font-bold hover:bg-blue-50 rounded-lg transition-colors">
             <ArrowLeft size={18} /> Back to Store
           </Link>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b">
             <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Admin Control</h2>
          </div>
          <div className="p-2 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-3 p-3 rounded-lg font-bold text-sm transition-all ${
                  location.pathname === item.path 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-grow space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
           <h1 className="text-xl font-bold text-gray-900">{title}</h1>
           <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-400 px-3 py-1 bg-gray-50 rounded-full">Server Status: Online</span>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">A</div>
           </div>
        </div>
        {children}
      </div>
    </div>
  );
}
