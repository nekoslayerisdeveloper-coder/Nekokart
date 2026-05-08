import React, { useState, useEffect } from 'react';
import { QrCode, Save, Loader2, Link, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../StoreContext';

export default function AdminPaymentSettings() {
  const { token } = useStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({ adminQR: '', upiId: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaving(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
       const res = await fetch('/api/upload', {
         method: 'POST',
         headers: { 'Authorization': `Bearer ${token}` },
         body: formData
       });
       const data = await res.json();
       if (res.ok) {
         setSettings(prev => ({ ...prev, adminQR: data.url }));
       }
    } catch (err) {
      alert('QR Upload failed');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        alert('Settings saved successfully!');
      }
    } catch (err) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <QrCode className="text-blue-600" />
          Payment Settings
        </h2>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Save Changes
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y">
        {/* QR Section */}
        <div className="p-8">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Store Payment QR Code</h3>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="relative group">
              <div className="w-48 h-48 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl overflow-hidden flex items-center justify-center">
                {settings.adminQR ? (
                  <img src={settings.adminQR} alt="Admin QR" className="w-full h-full object-contain" />
                ) : (
                  <QrCode size={48} className="text-gray-200" />
                )}
              </div>
              <input type="file" accept="image/*" onChange={handleQRUpload} className="hidden" id="qr-upload" />
              <label htmlFor="qr-upload" className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer rounded-3xl">
                <span className="text-white text-xs font-bold uppercase tracking-tight">Change QR Code</span>
              </label>
            </div>
            <div className="flex-grow space-y-4">
              <p className="text-sm text-gray-500 leading-relaxed">
                Upload your UPI QR code. Customers will scan this during checkout to pay for their orders.
              </p>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-3">
                 <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1">
                    <Link size={10} /> Associated UPI ID
                 </label>
                 <input 
                  type="text" 
                  value={settings.upiId}
                  onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
                  placeholder="e.g. kailash@upi"
                  className="w-full bg-white border border-blue-200 rounded-lg p-3 text-sm font-mono font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                 />
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="p-8 bg-gray-50/50">
          <div className="flex gap-4">
             <div className="w-10 h-10 bg-white shadow-sm border border-gray-100 rounded-lg flex items-center justify-center shrink-0">
                <ShieldCheck className="text-green-500" size={24} />
             </div>
             <div>
                <h4 className="text-sm font-bold text-gray-900">Security Verification</h4>
                <p className="text-xs text-gray-500 mt-1">
                   Only payments with verified screenshots will be visible to you in the orders panel. 
                   Ensure your QR code is current and matches the UPI ID above.
                </p>
             </div>
          </div>
        </div>
      </div>

       <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center gap-4">
          <CheckCircle2 className="text-blue-500" />
          <p className="text-sm font-medium text-gray-600">
             When a user pays, they will be required to upload a screenshot. 
             You can verify this screenshot in the <strong>Admin &rarr; Orders</strong> section.
          </p>
       </div>
    </div>
  );
}
