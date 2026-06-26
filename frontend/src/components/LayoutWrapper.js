'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Toast from './Toast';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sun, Moon, Bell, LogOut, User, LayoutDashboard, Menu, X,
  Phone, Mail, MapPin, MessageSquare, BookOpen, Clock, Heart, Award
} from 'lucide-react';

export default function LayoutWrapper({ children }) {
  const {
    user,
    logout,
    settings,
    notifications,
    darkMode,
    toggleDarkMode,
    toasts,
    loading,
    markNotificationsRead
  } = useApp();

  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const unreadNotifications = notifications.filter(n => !n.isRead);

  const isActive = (path) => pathname === path;

  // Render navigation links
  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Membership Plans', href: '/#plans' },
    { label: 'Rules', href: '/#rules' },
    { label: 'FAQs', href: '/#faqs' }
  ];

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-sm font-semibold tracking-wider text-indigo-400 uppercase">Loading Library Portal...</p>
        </div>
      </div>
    );
  }

  // Pre-filled WhatsApp link
  const openWhatsApp = () => {
    const text = `Hello,\nI would like to book a study cabin.\n\nName:\nDate:\nTime:\nDuration:\n\nPlease confirm availability.`;
    const url = `https://wa.me/91${settings.whatsAppNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className={`flex flex-col min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Toast Notification Banner */}
      <Toast toasts={toasts} />

      {/* Header / Navigation */}
      <header className="sticky top-0 z-40 backdrop-blur-lg border-b bg-opacity-70 border-white/10 bg-slate-900/80 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-indigo-600 rounded-lg text-white group-hover:bg-indigo-500 transition-colors">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg leading-tight tracking-tight bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-200 bg-clip-text text-transparent">
                  {settings.libraryName}
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase hidden sm:inline">
                  {settings.tagline}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6 items-center">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-sm font-medium hover:text-indigo-400 transition-colors ${
                    isActive(link.href) ? 'text-indigo-400 font-semibold' : 'text-slate-300'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Real-time indicator button */}
              <Link
                href="/seats"
                className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-semibold hover:bg-emerald-500/20 transition-all shrink-0"
              >
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
                Seats: {settings.totalSeats - settings.occupiedSeats} Available
              </Link>
            </nav>

            {/* Header Right Action Area */}
            <div className="flex items-center gap-4">
              
              {/* Dark/Light toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors"
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Logged in Area */}
              {user ? (
                <div className="flex items-center gap-3">
                  
                  {/* Notifications Icon */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setNotifDropdownOpen(!notifDropdownOpen);
                        if (!notifDropdownOpen) markNotificationsRead();
                      }}
                      className="p-2 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors relative"
                    >
                      <Bell className="w-5 h-5" />
                      {unreadNotifications.length > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                      )}
                    </button>

                    {/* Notifications Dropdown */}
                    {notifDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                        <div className="p-3 border-b border-white/10 bg-slate-950 flex justify-between items-center">
                          <span className="font-bold text-xs uppercase tracking-wider text-slate-400">Notifications</span>
                          <span className="text-[10px] bg-indigo-600/30 text-indigo-400 px-2 py-0.5 rounded-full font-semibold">
                            {notifications.length} total
                          </span>
                        </div>
                        <div className="max-h-60 overflow-y-auto divide-y divide-white/5">
                          {notifications.length === 0 ? (
                            <div className="p-4 text-center text-xs text-slate-500">
                              No notifications yet.
                            </div>
                          ) : (
                            notifications.map((notif) => (
                              <div key={notif._id} className="p-3 hover:bg-white/5 transition-colors">
                                <p className="text-xs text-slate-200 leading-normal">{notif.message}</p>
                                <span className="text-[9px] text-slate-500 block mt-1">
                                  {new Date(notif.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Dashboard link & Log out */}
                  <Link
                    href={user.role === 'admin' ? '/admin' : '/dashboard'}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold text-white transition-all shadow-md shadow-indigo-600/20"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Dashboard</span>
                  </Link>

                  <button
                    onClick={logout}
                    className="p-2 hover:bg-rose-500/20 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                    title="Log Out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-3">
                  <Link
                    href="/login"
                    className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 rounded-lg text-white transition-all shadow-md shadow-indigo-600/20"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-white/10 px-4 pt-2 pb-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-base font-medium hover:bg-white/5 transition-colors ${
                  isActive(link.href) ? 'text-indigo-400 bg-white/5' : 'text-slate-300'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/seats"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
            >
              Seats Status ({settings.totalSeats - settings.occupiedSeats} Available)
            </Link>
            {!user && (
              <div className="flex gap-2 pt-2 border-t border-white/10">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 border border-white/20 rounded-lg text-sm text-slate-300"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 bg-indigo-600 rounded-lg text-sm font-semibold"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main page content */}
      <main className="flex-1 w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-white/10 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Library Introduction */}
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-600 rounded-md text-white">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="font-bold text-white text-base tracking-tight">{settings.libraryName}</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-400 max-w-sm">
                A premium space designed for students and professionals. Equipped with private study cabins, 
                high speed Wi-Fi, air conditioning, RO drinking water, power backup, and safe parking. 
                Enjoy a distraction-free silent environment for competitive preparations.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold">
                <Award className="w-4 h-4" />
                <span>Success is Dependent on Effort</span>
              </div>
            </div>

            {/* Facilities Quick Links */}
            <div>
              <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/#plans" className="hover:text-indigo-400 transition-colors">Membership Pricing</Link>
                </li>
                <li>
                  <Link href="/gallery" className="hover:text-indigo-400 transition-colors">Study Hall Gallery</Link>
                </li>
                <li>
                  <Link href="/#rules" className="hover:text-indigo-400 transition-colors">Rules & Regulations</Link>
                </li>
                <li>
                  <button onClick={openWhatsApp} className="hover:text-indigo-400 transition-colors text-left">
                    Book Study Cabin (WhatsApp)
                  </button>
                </li>
              </ul>
            </div>

            {/* Direct Contact Options */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold text-sm tracking-wider uppercase">Contact Us</h3>
              
              <div className="flex flex-col gap-2 text-sm">
                {/* Phone Link */}
                <a
                  href={`tel:${settings.contactNumber}`}
                  className="flex items-center gap-2 hover:text-indigo-400 transition-colors"
                >
                  <Phone className="w-4 h-4 text-indigo-400" />
                  <span>+91 {settings.contactNumber}</span>
                </a>

                {/* Email Link */}
                <a
                  href={`mailto:${settings.email}`}
                  className="flex items-center gap-2 hover:text-indigo-400 transition-colors"
                >
                  <Mail className="w-4 h-4 text-indigo-400" />
                  <span className="truncate">{settings.email}</span>
                </a>

                {/* WhatsApp button */}
                <button
                  onClick={openWhatsApp}
                  className="flex items-center gap-2 hover:text-emerald-400 transition-colors text-left"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp Chat</span>
                </button>

                {/* Location Map Redirect */}
                <a
                  href="https://maps.google.com/?q=Janki-Lalan+Commercial+Building,+Khatangi+Kothi,+Gaya-Fatehpur+State+Highway,+Bihar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 hover:text-indigo-400 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">Janki-Lalan Building, Khatangi Kothi, Gaya Highway</span>
                </a>
              </div>
            </div>
          </div>

          {/* Timing details & Copy Rights */}
          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Timings: {settings.timings} (Open 7 Days)</span>
            </div>
            <p>&copy; {new Date().getFullYear()} {settings.libraryName}. All rights reserved. Created with <Heart className="w-3.5 h-3.5 inline text-rose-500 mx-0.5 fill-rose-500" /> for academic success.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
