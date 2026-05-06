import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter, SlidersHorizontal, Star } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../StoreContext';

export default function ProductList() {
  const [searchParams] = useSearchParams();
  const { toggleWishlist, isInWishlist } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const category = searchParams.get('category');
  const search = searchParams.get('search');

  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams();
    if (category) query.append('category', category);
    if (search) query.append('search', search);

    fetch(`/api/products?${query.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
      })
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [category, search]);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 space-y-6 hidden md:block">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Filter size={18} /> Filters
            </h3>
            <button className="text-blue-600 text-xs font-semibold uppercase">Clear All</button>
          </div>
          
          <div className="space-y-4 pt-4 border-t">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Price Range</p>
              <div className="flex items-center gap-2">
                <input type="number" placeholder="Min" className="w-full border rounded px-2 py-1 text-sm pt-4" />
                <span className="text-gray-400">to</span>
                <input type="number" placeholder="Max" className="w-full border rounded px-2 py-1 text-sm pt-4" />
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Customer Ratings</p>
              {[4, 3, 2, 1].map((rating) => (
                <label key={rating} className="flex items-center gap-2 mb-2 cursor-pointer group">
                  <input type="checkbox" className="rounded text-blue-600" />
                  <span className="text-sm text-gray-700 flex items-center gap-1 group-hover:text-blue-600">
                    {rating} <Star size={14} className="fill-yellow-400 text-yellow-400" /> & above
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Grid */}
      <div className="flex-grow">
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {search ? `Search results for "${search}"` : category ? `Category: ${category}` : 'All Products'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">{products.length} items found</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:block">Sort By:</span>
            <select className="border rounded-sm px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600">
              <option>Relevance</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest First</option>
            </select>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-dashed border-gray-300">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <SlidersHorizontal size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">No matching products</h3>
            <p className="text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
            <Link to="/products" className="mt-6 inline-block bg-blue-600 text-white px-8 py-2 rounded font-bold">
              View All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, idx) => (
              <div 
                key={product.id || `prod-${idx}`} 
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all group overflow-hidden border border-gray-100 relative flex flex-col"
              >
                <button 
                  onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
                  className={`absolute top-3 right-3 z-10 p-1.5 rounded-full shadow-sm transition-colors ${
                    isInWishlist(product.id) ? 'bg-red-50 text-red-500' : 'bg-white text-gray-400 hover:text-red-500'
                  }`}
                >
                  <Star size={18} className={isInWishlist(product.id) ? 'fill-red-500' : ''} />
                </button>
                <Link to={`/products/${product.id}`} className="flex-grow flex flex-col">
                  <div className="aspect-[4/5] overflow-hidden bg-gray-50 flex items-center justify-center">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 pt-4">
                    <h3 className="font-medium text-gray-800 line-clamp-2 leading-snug h-10 group-hover:text-blue-600">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5 font-bold">
                        {product.rating} ★
                      </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-lg font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                      <span className="text-xs text-gray-400 line-through">₹{(product.price * 1.3).toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
                <div className="px-4 pb-4 border-t pt-2 mt-auto">
                    <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Free Delivery</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
