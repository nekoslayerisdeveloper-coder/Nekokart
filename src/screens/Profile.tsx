import React, { useState, useEffect } from 'react';
import { useStore } from '../StoreContext';
import { User as UserIcon, Phone, MapPin, Save, AlertCircle, Loader2, Lock } from 'lucide-react';
import UserLayout from '../components/UserLayout';

export default function Profile() {
  const { token, user, login } = useStore();
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [pwMessage, setPwMessage] = useState('');

  useEffect(() => {
    fetch('/api/auth/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setProfile({
          name: data.name || '',
          phone: data.phone || '',
          address: data.address || ''
        });
        setLoading(false);
      });
  }, [token]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });
      const data = await res.json();
      if (res.ok) {
        login(token!, data);
        setMessage('Profile updated successfully!');
      }
    } catch (err) {
      setMessage('Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setPwMessage('Passwords do not match');
    }
    setPwMessage('');
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        setPwMessage('Password updated successfully!');
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPwMessage(data.message);
      }
    } catch (err) {
      setPwMessage('Update failed');
    }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <UserLayout title="My Profile">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Profile Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b flex items-center gap-3">
             <UserIcon className="text-blue-600" />
             <h3 className="font-bold text-gray-900 uppercase text-xs tracking-widest">Personal Information</h3>
          </div>
          <form onSubmit={handleUpdate} className="p-8 space-y-6">
            {message && (
               <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-bold ${
                 message.includes('success') ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
               }`}>
                 <AlertCircle size={18} /> {message}
               </div>
            )}

            <div className="grid gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                <input 
                  type="text" 
                  value={profile.name}
                  onChange={e => setProfile({...profile, name: e.target.value})}
                  className="w-full border-b-2 py-2 focus:border-blue-600 focus:outline-none font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mobile Number</label>
                <input 
                  type="text" 
                  value={profile.phone}
                  onChange={e => setProfile({...profile, phone: e.target.value})}
                  className="w-full border-b-2 py-2 focus:border-blue-600 focus:outline-none font-bold"
                  placeholder="Add phone number"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Default Address</label>
                <textarea 
                  rows={3}
                  value={profile.address}
                  onChange={e => setProfile({...profile, address: e.target.value})}
                  className="w-full border rounded-xl p-4 mt-2 focus:ring-2 focus:ring-blue-100 focus:outline-none font-medium"
                  placeholder="Enter full address"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={saving}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold uppercase tracking-widest shadow-lg hover:bg-blue-700 transition flex items-center justify-center gap-3"
            >
              {saving ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Update Profile</>}
            </button>
          </form>
        </div>

        {/* Password Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b flex items-center gap-3">
             <Lock className="text-orange-600" />
             <h3 className="font-bold text-gray-900 uppercase text-xs tracking-widest">Security & Password</h3>
          </div>
          <form onSubmit={handlePasswordChange} className="p-8 space-y-6">
            {pwMessage && (
               <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-bold ${
                 pwMessage.includes('success') ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
               }`}>
                 <AlertCircle size={18} /> {pwMessage}
               </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Current Password</label>
                <input 
                  type="password" 
                  value={passwordData.oldPassword}
                  onChange={e => setPasswordData({...passwordData, oldPassword: e.target.value})}
                  className="w-full border-b-2 py-2 focus:border-blue-600 focus:outline-none font-medium"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">New Password</label>
                <input 
                  type="password" 
                  value={passwordData.newPassword}
                  onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full border-b-2 py-2 focus:border-blue-600 focus:outline-none font-medium"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Confirm New Password</label>
                <input 
                  type="password" 
                  value={passwordData.confirmPassword}
                  onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full border-b-2 py-2 focus:border-blue-600 focus:outline-none font-medium"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold uppercase tracking-widest shadow-lg hover:bg-black transition"
            >
              Change Password
            </button>
          </form>
        </div>
      </div>
    </UserLayout>
  );
}
