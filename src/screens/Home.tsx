import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronRight, Zap, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { Product, Category } from '../types';
import { db } from '../lib/firebase';
import { collection, query, limit, getDocs } from 'firebase/firestore';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodQuery = query(collection(db, 'products'), limit(4));
        const prodSnap = await getDocs(prodQuery);
        setFeaturedProducts(prodSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));

        const catSnap = await getDocs(collection(db, 'categories'));
        setCategories(catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
      } catch (err) {
        console.error('Failed to fetch data', err);
      }
    };
    fetchData();
  }, []);

  const features = [
    { icon: Zap, title: 'Super Fast Delivery', desc: 'Get your orders in 1-2 days' },
    { icon: ShieldCheck, title: 'Secure Payments', desc: '100% safe payment processing' },
    { icon: RotateCcw, title: 'Easy Returns', desc: '10 days return policy' },
    { icon: Truck, title: 'Free Shipping', desc: 'On orders above ₹499' }
  ];

  return (
    <div className="space-y-10">
      {/* Hero Banner */}
      <section className="relative rounded-xl overflow-hidden bg-gradient-to-r from-blue-700 to-indigo-800 h-[300px] md:h-[450px]">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-16 text-white max-w-2xl">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-6xl font-extrabold leading-tight"
          >
            Neko Kart <br /> 
            <span className="text-yellow-400">Summer Sale</span>
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg md:text-xl text-blue-100"
          >
            Up to 80% off on your favorite brands. Don't miss out on the biggest deals of the season!
          </motion.p>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8 flex gap-4"
          >
            <Link to="/products" className="bg-yellow-400 text-blue-900 px-8 py-3 rounded-full font-bold hover:bg-yellow-300 transition-colors shadow-lg">
              Shop Now
            </Link>
            <Link to="/products?category=electronics" className="bg-white/10 backdrop-blur-md text-white border border-white/30 px-8 py-3 rounded-full font-bold hover:bg-white/20 transition-colors">
              Best Deals
            </Link>
          </motion.div>
        </div>
        <img 
          src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop&q=60" 
          alt="Sale Banner" 
          className="absolute right-0 top-0 h-full w-1/2 object-cover hidden md:block opacity-60"
        />
      </section>

      {/* Categories Bar */}
      <section className="bg-white p-4 rounded-xl shadow-sm overflow-x-auto">
        <div className="flex gap-4 md:gap-8 min-w-max">
          {categories.map((cat, idx) => {
            const isObject = typeof cat === 'object' && cat !== null;
            const name = isObject ? cat.name : cat as unknown as string;
            const id = isObject ? cat.id : `cat-${idx}`;
            const image = isObject ? cat.image : `https://source.unsplash.com/100x100/?${name}`;

            return (
              <Link 
                key={id} 
                to={`/products?category=${name}`}
                className="flex flex-col items-center group w-20"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:border-blue-400 group-hover:scale-110 transition-all duration-300">
                  <img 
                    src={image} 
                    alt={name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => (e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/3081/3081559.png")}
                  />
                </div>
                <span className="text-[10px] font-bold mt-2 capitalize text-gray-600 group-hover:text-blue-600 text-center whitespace-nowrap overflow-hidden text-ellipsis w-full">{name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <Link to="/products" className="text-blue-600 font-semibold flex items-center hover:underline">
            View All <ChevronRight size={18} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {featuredProducts.map((product, idx) => (
            <Link 
              key={product.id || `prod-${idx}`} 
              to={`/products/${product.id}`}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all group overflow-hidden border border-gray-100 flex flex-col"
            >
              <div className="aspect-[4/5] overflow-hidden bg-gray-50 flex items-center justify-center">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 flex-grow flex flex-col">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{product.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5 font-bold">
                    {product.rating} ★
                  </span>
                  <span className="text-gray-400 text-xs">({Math.floor(Math.random() * 1000 + 50)})</span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-lg font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                  <span className="text-sm text-gray-500 line-through">₹{(product.price * 1.4).toLocaleString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
        {features.map((f, i) => (
          <div key={i} className="flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-blue-50 rounded-full text-blue-600">
              <f.icon size={24} />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">{f.title}</h3>
            <p className="text-xs text-gray-500">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
