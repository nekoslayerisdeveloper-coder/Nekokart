import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useStore } from '../StoreContext';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      
      const isAdminEmail = email === 'nekoslayer20@gmail.com' || email === 'admin@gmail.com';
      
      // Check if email is verified (Bypass for admins or if verified)
      if (!user.emailVerified && !isAdminEmail) {
        setError('Please verify your email address to access your account.');
        setLoading(false);
        return;
      }

      navigate(from, { replace: true });
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    setError('');
    setMessage('');
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset link sent! Please check your spam folder if you don\'t see it.');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else {
        setError(err.message);
      }
    }
  };

  const handleResendVerification = async () => {
    if (!auth.currentUser) return;
    setResending(true);
    try {
      await sendEmailVerification(auth.currentUser);
      setMessage('Verification email resent! Please check your inbox.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-blue-600 p-8 text-white text-center">
          <h2 className="text-2xl font-bold">Login</h2>
          <p className="text-blue-100 text-sm mt-2">Get access to your Orders, Wishlist and Recommendations</p>
        </div>
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg flex flex-col gap-2 text-sm border border-red-100">
                <div className="flex items-start gap-2">
                  <AlertCircle size={18} className="shrink-0" />
                  <p>{error}</p>
                </div>
                {error.includes('verify your email') && (
                  <button 
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resending}
                    className="text-blue-600 font-bold hover:underline self-start mt-1 text-xs px-7"
                  >
                    {resending ? 'Sending...' : 'Resend Verification Email'}
                  </button>
                )}
              </div>
            )}

            {message && (
              <div className="bg-green-50 text-green-600 p-3 rounded-lg flex items-start gap-2 text-sm border border-green-100">
                <p>{message}</p>
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-b-2 border-gray-200 focus:border-blue-600 transition-colors py-2 pl-10 focus:outline-none"
                  placeholder="Enter Email"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-b-2 border-gray-200 focus:border-blue-600 transition-colors py-2 pl-10 focus:outline-none"
                  placeholder="Enter Password"
                />
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={handleForgotPassword} className="text-xs font-bold text-blue-600 hover:underline">Forgot?</button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 rounded font-bold uppercase tracking-widest shadow-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Login'}
            </button>
          </form>

          <p className="text-center mt-10 text-gray-500 text-sm">
            New to Neko Kart? <Link to="/signup" className="text-blue-600 font-bold hover:underline">Create an account</Link>
          </p>
        </div>
      </div>
      <div className="mt-8 text-center text-xs text-gray-400">
        By continuing, you agree to Neko Kart's Terms of Use and Privacy Policy.
      </div>
    </div>
  );
}
