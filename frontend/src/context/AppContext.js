'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [settings, setSettings] = useState({
    libraryName: 'The Study Point Library',
    tagline: 'Success is Dependent on Effort',
    address: 'Janki-Lalan Commercial Building, Khatangi Kothi, Gaya-Fatehpur State Highway, Bihar',
    contactNumber: '8210792095',
    whatsAppNumber: '8210792095',
    email: 'contact@thestudypointlibrary.com',
    timings: '06:00 AM - 10:00 PM',
    totalSeats: 80,
    occupiedSeats: 62,
    announcements: [],
    gallery: []
  });
  const [cabins, setCabins] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [myPayments, setMyPayments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:5000/api';

  // Add toast helper
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Initialize Auth & Settings
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedTheme = localStorage.getItem('theme');
    
    // Initialize Theme
    const isDark = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    
    // Load public configurations
    fetchSettings();
    setLoading(false);
  }, []);

  // Fetch configs
  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/settings`);
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  // Synchronize dynamic info (profile, cabins, notifications, bookings) after login
  const refreshUserData = async (activeToken = token) => {
    if (!activeToken) return;
    try {
      const headers = { Authorization: `Bearer ${activeToken}` };
      
      // Profile
      const profileRes = await fetch(`${API_URL}/auth/profile`, { headers });
      const profileData = await profileRes.json();
      if (profileData.success) {
        setUser(profileData.user);
        localStorage.setItem('user', JSON.stringify(profileData.user));
      }

      // Notifications
      const notifRes = await fetch(`${API_URL}/other/notifications`, { headers });
      const notifData = await notifRes.json();
      if (notifData.success) {
        setNotifications(notifData.notifications);
      }

      // Bookings
      const bookRes = await fetch(`${API_URL}/bookings/my-bookings`, { headers });
      const bookData = await bookRes.json();
      if (bookData.success) {
        setMyBookings(bookData.bookings);
      }

      // Payments
      const payRes = await fetch(`${API_URL}/payments/my-payments`, { headers });
      const payData = await payRes.json();
      if (payData.success) {
        setMyPayments(payData.payments);
      }
    } catch (err) {
      console.error('Error refreshing user data:', err);
    }
  };

  useEffect(() => {
    if (token) {
      refreshUserData(token);
      fetchCabins();
    }
  }, [token]);

  // Cabins list
  const fetchCabins = async () => {
    try {
      const res = await fetch(`${API_URL}/cabins`);
      const data = await res.json();
      if (data.success) {
        setCabins(data.cabins);
      }
    } catch (err) {
      console.error('Error fetching cabins:', err);
    }
  };

  // --- STUDENT AUTH ACTIONS ---

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        showToast('Welcome back! Login successful.', 'success');
        return { success: true };
      } else {
        showToast(data.message || 'Login failed', 'error');
        return { success: false, message: data.message };
      }
    } catch (err) {
      showToast('Network error during login', 'error');
      return { success: false, message: 'Server is currently offline.' };
    }
  };

  const register = async (name, email, password, phone) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone })
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        showToast('Registration successful!', 'success');
        return { success: true };
      } else {
        showToast(data.message || 'Registration failed', 'error');
        return { success: false, message: data.message };
      }
    } catch (err) {
      showToast('Network error during registration', 'error');
      return { success: false, message: 'Server is currently offline.' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setMyBookings([]);
    setMyPayments([]);
    setNotifications([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showToast('Logged out successfully', 'success');
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        showToast('Profile updated successfully!', 'success');
        return { success: true };
      } else {
        showToast(data.message || 'Failed to update profile', 'error');
        return { success: false, message: data.message };
      }
    } catch (err) {
      showToast('Network error during profile update', 'error');
      return { success: false };
    }
  };

  const verifyEmail = async (tokenString) => {
    try {
      const res = await fetch(`${API_URL}/auth/verify-email/${tokenString}`);
      const data = await res.json();
      if (data.success) {
        showToast('Email verified successfully!', 'success');
        if (token) refreshUserData();
        return { success: true };
      } else {
        showToast(data.message || 'Verification failed', 'error');
        return { success: false, message: data.message };
      }
    } catch (err) {
      showToast('Network error', 'error');
      return { success: false };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Password reset link simulated in backend logs!', 'success');
        return { success: true };
      } else {
        showToast(data.message || 'User not found', 'error');
        return { success: false, message: data.message };
      }
    } catch (err) {
      showToast('Network error', 'error');
      return { success: false };
    }
  };

  const resetPassword = async (resetToken, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/reset-password/${resetToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Password reset successful! Please login.', 'success');
        return { success: true };
      } else {
        showToast(data.message || 'Failed to reset password', 'error');
        return { success: false, message: data.message };
      }
    } catch (err) {
      showToast('Network error', 'error');
      return { success: false };
    }
  };


  // --- BOOKING ACTIONS ---

  const createBooking = async (bookingData) => {
    try {
      const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Booking confirmed immediately!', 'success');
        refreshUserData();
        fetchCabins();
        return { success: true, booking: data.booking };
      } else {
        showToast(data.message || 'Failed to create booking', 'error');
        return { success: false, message: data.message };
      }
    } catch (err) {
      showToast('Network error during booking', 'error');
      return { success: false };
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      const res = await fetch(`${API_URL}/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Booking cancelled.', 'success');
        refreshUserData();
        fetchCabins();
        return { success: true };
      } else {
        showToast(data.message || 'Failed to cancel booking', 'error');
        return { success: false };
      }
    } catch (err) {
      showToast('Network error', 'error');
      return { success: false };
    }
  };


  // --- MEMBERSHIP & PAYMENT ACTIONS ---

  const buyMembership = async (planId, method) => {
    try {
      const res = await fetch(`${API_URL}/payments/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ planId, paymentMethod: method })
      });
      const data = await res.json();
      if (data.success) {
        return { success: true, data };
      } else {
        showToast(data.message || 'Failed to initiate purchase', 'error');
        return { success: false };
      }
    } catch (err) {
      showToast('Network error', 'error');
      return { success: false };
    }
  };

  const simulatePaymentSuccess = async (paymentId) => {
    try {
      const res = await fetch(`${API_URL}/payments/${paymentId}/simulate-success`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Payment successful! Membership active.', 'success');
        refreshUserData();
        return { success: true };
      } else {
        showToast(data.message || 'Failed to verify payment', 'error');
        return { success: false };
      }
    } catch (err) {
      showToast('Network error', 'error');
      return { success: false };
    }
  };

  // --- REVIEW ACTION ---

  const submitReview = async (reviewData) => {
    try {
      const res = await fetch(`${API_URL}/other/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(reviewData)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Review submitted for approval!', 'success');
        return { success: true };
      } else {
        showToast(data.message || 'Review failed', 'error');
        return { success: false };
      }
    } catch (err) {
      showToast('Network error', 'error');
      return { success: false };
    }
  };

  const markNotificationsRead = async () => {
    try {
      const res = await fetch(`${API_URL}/other/notifications/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        settings,
        cabins,
        myBookings,
        myPayments,
        notifications,
        darkMode,
        toasts,
        loading,
        API_URL,
        toggleDarkMode,
        showToast,
        login,
        register,
        logout,
        updateProfile,
        verifyEmail,
        forgotPassword,
        resetPassword,
        fetchCabins,
        createBooking,
        cancelBooking,
        buyMembership,
        simulatePaymentSuccess,
        submitReview,
        markNotificationsRead,
        refreshUserData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
