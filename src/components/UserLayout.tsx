import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Package, HelpCircle, LogOut, ChevronRight, ShieldCheck } from 'lucide-react';
import { useStore } from '../StoreContext';

export default function UserLayout({ children, title }: { children: React.ReactNode, title: string }) {
  const location = useLocation();
  const { logout, user } = useStore();

  const menuItems = [
    { label: 'My Profile', icon: User, path: '/profile' },
    { label: 'My Orders', icon: Package, path: '/orders' },
    { label: 'Support Tickets', icon: HelpCircle, path: '/support' },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
          <div className="p-6 bg-blue-600 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
                {user?.name.charAt(0)}
              </div>
              <div className="truncate">
                <p className="text-xs text-blue-100 font-bold uppercase tracking-wider">Hello,</p>
                <p className="font-bold truncate">{user?.name}</p>
              </div>
            </div>
          </div>
          
          <div className="p-2 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center justify-between p-3 rounded-xl font-bold text-sm transition-all group ${
                  location.pathname === item.path 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} />
                  {item.label}
                </div>
                <ChevronRight size={16} className={`transition-transform ${location.pathname === item.path ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
              </Link>
            ))}
            
            <div className="pt-2 mt-2 border-t border-gray-100">
               <button 
                 onClick={logout}
                 className="w-full flex items-center gap-3 p-3 rounded-xl font-bold text-sm text-red-500 hover:bg-red-50 transition-all"
               >
                 <LogOut size={20} /> Logout
               </button>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 flex items-center gap-2 text-[10px] text-gray-400 font-bold justify-center">
             <ShieldCheck size={14} /> 100% SECURE SHOPPING
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-grow space-y-6">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
           <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        </div>
        {children}
      </div>
    </div>
  );
}
