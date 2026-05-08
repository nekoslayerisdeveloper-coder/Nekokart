import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User as UserIcon, Search, Menu, X, LogOut, LayoutDashboard, ShieldAlert } from 'lucide-react';
import { useStore } from '../StoreContext';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../lib/firebase';
import { sendEmailVerification } from 'firebase/auth';

export default function Navbar() {
  const { user, logout, cart, wishlist } = useStore();
  const [search, setSearch] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [vMessage, setVMessage] = useState('');
  const navigate = useNavigate();

  const handleResendVerification = async () => {
    if (!auth.currentUser) return;
    try {
      await sendEmailVerification(auth.currentUser);
      setVMessage('Verification link sent!');
      setTimeout(() => setVMessage(''), 5000);
    } catch (err: any) {
      setVMessage('Failed to send link');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search)}`);
    }
  };

  const navItems = [
    { label: 'Wishlist', icon: Heart, count: wishlist.length, path: '/wishlist' },
    { label: 'Cart', icon: ShoppingCart, count: cart.length, path: '/cart' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Verification Banner */}
      {user && !user.emailVerified && (
        <div className="bg-yellow-100 text-yellow-800 px-4 py-1.5 text-xs font-medium flex items-center justify-center gap-2 border-b border-yellow-200">
          <ShieldAlert size={14} className="shrink-0" />
          <span>Please verify your email to access all features.</span>
          <button 
            onClick={handleResendVerification}
            className="underline font-bold hover:text-yellow-900 ml-2"
          >
            {vMessage || 'Resend Link'}
          </button>
        </div>
      )}
      
      <nav className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="bg-white p-1 rounded-lg">
              <div className="w-6 h-6 bg-blue-600 rounded-sm flex items-center justify-center font-bold text-xs">NK</div>
            </div>
            <span className="text-xl font-bold tracking-tight hidden sm:block">Neko Kart</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-grow max-w-2xl relative">
            <input
              type="text"
              placeholder="Search for products, brands and more"
              className="w-full bg-white text-gray-900 py-1.5 pl-4 pr-10 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 px-2">
              <Search size={20} />
            </button>
          </form>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {user?.role === 'admin' && (
              <Link to="/admin" className="flex items-center gap-1 hover:text-blue-100 transition-colors">
                <LayoutDashboard size={20} />
                <span className="text-sm font-medium">Admin</span>
              </Link>
            )}

            <div className="group relative py-2">
              <button className="flex items-center gap-1 hover:text-blue-100 transition-colors">
                <UserIcon size={20} />
                <span className="text-sm font-medium">{user ? user.name.split(' ')[0] : 'Login'}</span>
              </button>
              <div className="absolute top-full right-0 mt-1 w-48 bg-white text-gray-900 rounded shadow-xl border overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                {user ? (
                  <>
                    <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100 text-sm">My Profile</Link>
                    <Link to="/orders" className="block px-4 py-2 hover:bg-gray-100 text-sm">My Orders</Link>
                    <Link to="/support" className="block px-4 py-2 hover:bg-gray-100 text-sm">Support Tickets</Link>
                    <button onClick={logout} className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2 text-red-600 border-t">
                      <LogOut size={16} /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="block px-4 py-2 hover:bg-gray-100 text-sm">Login</Link>
                    <Link to="/signup" className="block px-4 py-2 hover:bg-gray-100 text-sm">Sign Up</Link>
                  </>
                )}
              </div>
            </div>

            {navItems.map((item) => (
              <Link key={item.label} to={item.path} className="flex items-center gap-1 relative hover:text-blue-100 transition-colors">
                <item.icon size={20} />
                <span className="text-sm font-medium">{item.label}</span>
                {item.count > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-blue-900 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {item.count}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-blue-700 overflow-hidden"
            >
              <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
                {user && (
                  <div className="pb-4 border-b border-blue-600">
                    <p className="text-sm text-blue-200">Hello, {user.name}</p>
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block py-2 mt-2">Admin Dashboard</Link>
                    )}
                  </div>
                )}
                <Link to="/orders" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 py-2">
                  <UserIcon size={20} /> My Orders
                </Link>
                <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 py-2">
                  <Heart size={20} /> Wishlist ({wishlist.length})
                </Link>
                <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 py-2">
                  <ShoppingCart size={20} /> Cart ({cart.length})
                </Link>
                {user ? (
                  <button onClick={() => { logout(); setIsMenuOpen(false); }} className="flex items-center gap-2 py-2 text-red-300">
                    <LogOut size={20} /> Logout
                  </button>
                ) : (
                  <div className="flex gap-4 pt-2">
                    <Link to="/login" onClick={() => setIsMenuOpen(false)} className="bg-white text-blue-600 px-6 py-2 rounded font-bold text-sm">Login</Link>
                    <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="border border-white px-6 py-2 rounded font-bold text-sm">Sign Up</Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
