import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Product, CartItem } from './types';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface StoreContextType {
  user: User | null;
  loading: boolean;
  cart: CartItem[];
  wishlist: Product[];
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        // Fetch extra profile data from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          // Force admin role for owner or explicit admin emails
          if (firebaseUser.email === 'nekoslayer20@gmail.com' || firebaseUser.email === 'admin@gmail.com') {
            userData.role = 'admin';
          }
          setUser({ 
            id: firebaseUser.uid, 
            ...userData,
            emailVerified: firebaseUser.emailVerified 
          } as User);
        } else {
          // If no doc yet, set basic info
          const isAdminEmail = firebaseUser.email === 'nekoslayer20@gmail.com' || firebaseUser.email === 'admin@gmail.com';
          setUser({ 
            id: firebaseUser.uid, 
            email: firebaseUser.email || '', 
            name: firebaseUser.displayName || 'User',
            role: isAdminEmail ? 'admin' : 'user',
            emailVerified: firebaseUser.emailVerified
          } as User);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    const savedCart = localStorage.getItem('cart');
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    
    setIsInitialized(true);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('cart', JSON.stringify(cart));
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
  }, [user, cart, wishlist, isInitialized]);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => 
      item.id === productId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) return prev.filter(p => p.id !== product.id);
      return [...prev, product];
    });
  };

  const isInWishlist = (productId: string) => wishlist.some(p => p.id === productId);

  return (
    <StoreContext.Provider value={{
      user, loading, cart, wishlist,
      setUser, logout, addToCart, removeFromCart, updateQuantity, clearCart,
      toggleWishlist, isInWishlist
    }}>
      {!loading && children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
