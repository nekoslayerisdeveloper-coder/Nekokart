import React, { useEffect, useState } from 'react';
import { useStore } from '../../StoreContext';
import { Product, Category } from '../../types';
import { Plus, Edit2, Trash2, Search, ExternalLink, Loader2 } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminProducts() {
  const { token } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = () => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  };

  const fetchCategories = () => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) fetchProducts();
  };

  const [uploading, setUploading] = useState(false);

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) setEditingProduct(prev => ({ ...prev!, image: data.url }));
    } catch (err) { alert('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingProduct?.id 
      ? `/api/admin/products/${editingProduct.id}` 
      : '/api/admin/products';
    const method = editingProduct?.id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(editingProduct)
    });

    if (res.ok) {
      setIsModalOpen(false);
      fetchProducts();
    }
  };

  return (
    <AdminLayout title="Product Management">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
         <div className="relative w-full sm:w-96">
            <input 
              type="text" 
              placeholder="Filter products..." 
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm" 
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
         </div>
         <button 
           onClick={() => { setEditingProduct({ name: '', price: 0, category: 'electronics', image: '', description: '' }); setIsModalOpen(true); }}
           className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 w-full sm:w-auto"
         >
           <Plus size={20} /> Add Product
         </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Product</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Price</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Stock</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img src={p.image} className="w-10 h-10 rounded object-contain border bg-gray-50" alt="" />
                      <div>
                        <p className="text-sm font-bold text-gray-900">{p.name}</p>
                        <p className="text-xs text-gray-500">ID: {p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 capitalize text-sm text-gray-600">{p.category}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">₹{p.price.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.stock}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => { setEditingProduct(p); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden"
            >
              <div className="p-6 border-b">
                <h3 className="text-xl font-bold text-gray-900">{editingProduct?.id ? 'Edit Product' : 'Add New Product'}</h3>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Product Name</label>
                    <input required className="w-full border rounded-lg px-4 py-2 mt-1" value={editingProduct?.name} onChange={e => setEditingProduct({...editingProduct!, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Category</label>
                    <select 
                      required 
                      className="w-full border rounded-lg px-4 py-2 mt-1 bg-white" 
                      value={editingProduct?.category} 
                      onChange={e => setEditingProduct({...editingProduct!, category: e.target.value})}
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Price (₹)</label>
                    <input required type="number" className="w-full border rounded-lg px-4 py-2 mt-1" value={editingProduct?.price} onChange={e => setEditingProduct({...editingProduct!, price: Number(e.target.value)})} />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Product Image</label>
                    <div className="flex gap-4 mt-1">
                      <div className="w-16 h-16 border rounded bg-gray-50 flex items-center justify-center shrink-0">
                        {editingProduct?.image ? <img src={editingProduct.image} className="max-w-full max-h-full object-contain" /> : <Plus className="text-gray-300" />}
                      </div>
                      <label className="flex-grow">
                        <input type="file" accept="image/*" onChange={handleProductImageUpload} className="hidden" />
                        <div className="w-full border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 font-bold text-xs text-gray-400">
                          {uploading ? <Loader2 className="animate-spin mx-auto" /> : 'Click to Upload Image'}
                        </div>
                      </label>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Description</label>
                    <textarea rows={3} className="w-full border rounded-lg px-4 py-2 mt-1" value={editingProduct?.description} onChange={e => setEditingProduct({...editingProduct!, description: e.target.value})} />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 font-bold text-gray-500">Cancel</button>
                   <button type="submit" className="px-8 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-lg hover:bg-blue-700 transition shadow-blue-200">Save Product</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
