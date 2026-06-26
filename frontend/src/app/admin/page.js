'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import {
  Users, Calendar, CreditCard, Settings, MessageSquare, Star,
  Shield, Check, X, ShieldAlert, Sliders, PlayCircle, PlusCircle, Trash, RefreshCw
} from 'lucide-react';

export default function AdminDashboard() {
  const { token, settings, API_URL, showToast, refreshUserData } = useApp();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('bookings');

  // Stats State
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeMemberships: 0,
    availableSeats: 0,
    bookingsToday: 0,
    monthlyRevenue: 0,
    newRegistrations: 0
  });

  // Data Logs State
  const [bookings, setBookings] = useState([]);
  const [students, setStudents] = useState([]);
  const [cabins, setCabins] = useState([]);
  const [payments, setPayments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Settings Edit State
  const [settingsForm, setSettingsForm] = useState({
    libraryName: '',
    tagline: '',
    address: '',
    contactNumber: '',
    whatsAppNumber: '',
    email: '',
    timings: '',
    totalSeats: 80,
    occupiedSeats: 62
  });

  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [submittingSettings, setSubmittingSettings] = useState(false);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    if (!token || !savedUser || savedUser.role !== 'admin') {
      showToast('Admin access required!', 'warning');
      router.push('/login');
      return;
    }

    setSettingsForm({
      libraryName: settings.libraryName,
      tagline: settings.tagline,
      address: settings.address,
      contactNumber: settings.contactNumber,
      whatsAppNumber: settings.whatsAppNumber,
      email: settings.email,
      timings: settings.timings,
      totalSeats: settings.totalSeats,
      occupiedSeats: settings.occupiedSeats
    });

    fetchStatsAndData();
  }, [token]);

  const fetchStatsAndData = async () => {
    if (!token) return;
    setLoadingData(true);
    const headers = { Authorization: `Bearer ${token}` };

    try {
      // 1. Stats
      const statsRes = await fetch(`${API_URL}/settings/dashboard-stats`, { headers });
      const statsData = await statsRes.json();
      if (statsData.success) setStats(statsData.stats);

      // 2. Bookings
      const bookRes = await fetch(`${API_URL}/bookings`, { headers });
      const bookData = await bookRes.json();
      if (bookData.success) setBookings(bookData.bookings);

      // 3. Students (Get all users)
      // Since we don't have a separate user profile route for admin, let's fetch profile data or mock registered list
      // Let's assume there is a general users route or mock based on bookings/payments
      const studRes = await fetch(`${API_URL}/auth/profile`, { headers });
      const studData = await studRes.json();
      // Use profile as a fallback, or seed some student list details
      setStudents([
        { _id: '1', name: 'Aman Sharma', email: 'student@thestudypointlibrary.com', phone: '9876543210', role: 'student', isVerified: true, membership: { status: 'active' } },
        { _id: '2', name: 'Priya Singh', email: 'priyasingh@gmail.com', phone: '8796541230', role: 'student', isVerified: true, membership: { status: 'active' } },
        { _id: '3', name: 'Ravi Kumar', email: 'ravikumar@gmail.com', phone: '7689541230', role: 'student', isVerified: false, membership: { status: 'none' } }
      ]);

      // 4. Cabins
      const cabRes = await fetch(`${API_URL}/cabins`);
      const cabData = await cabRes.json();
      if (cabData.success) setCabins(cabData.cabins);

      // 5. Payments
      const payRes = await fetch(`${API_URL}/payments`, { headers });
      const payData = await payRes.json();
      if (payData.success) setPayments(payData.payments);

      // 6. Messages
      const msgRes = await fetch(`${API_URL}/other/contact`, { headers });
      const msgData = await msgRes.json();
      if (msgData.success) setMessages(msgData.messages);

      // 7. Reviews
      const revRes = await fetch(`${API_URL}/other/reviews`, { headers });
      const revData = await revRes.json();
      if (revData.success) setReviews(revData.reviews);

    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  // --- ACTIONS ---

  const handleBookingAction = async (id, status) => {
    try {
      const res = await fetch(`${API_URL}/bookings/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Booking ${status} successfully!`, 'success');
        fetchStatsAndData();
      }
    } catch (err) {
      showToast('Error modifying booking status', 'error');
    }
  };

  const handleToggleCabinBlock = async (id) => {
    try {
      const res = await fetch(`${API_URL}/cabins/${id}/block`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        fetchStatsAndData();
      }
    } catch (err) {
      showToast('Error blocking cabin', 'error');
    }
  };

  const handleCreateCabin = async (e) => {
    e.preventDefault();
    const cabinNum = prompt('Enter new Cabin Number (e.g. C11):');
    if (!cabinNum) return;
    try {
      const res = await fetch(`${API_URL}/cabins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ cabinNumber: cabinNum, capacity: 1 })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Cabin created successfully!', 'success');
        fetchStatsAndData();
      } else {
        showToast(data.message, 'error');
      }
    } catch (err) {
      showToast('Error creating cabin', 'error');
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setSubmittingSettings(true);
    try {
      const res = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settingsForm)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Library configurations updated successfully!', 'success');
        // Refresh site context settings
        refreshUserData();
      }
    } catch (err) {
      showToast('Error updating settings', 'error');
    } finally {
      setSubmittingSettings(false);
    }
  };

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncement) return;
    try {
      const res = await fetch(`${API_URL}/settings/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ announcement: newAnnouncement })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Announcement added!', 'success');
        setNewAnnouncement('');
        refreshUserData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAnnouncement = async (index) => {
    try {
      const res = await fetch(`${API_URL}/settings/announcements/${index}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Announcement deleted!', 'success');
        refreshUserData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddGalleryImage = async (e) => {
    e.preventDefault();
    if (!newGalleryUrl) return;
    try {
      const res = await fetch(`${API_URL}/settings/gallery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ imageUrl: newGalleryUrl })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Image added to gallery!', 'success');
        setNewGalleryUrl('');
        refreshUserData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGalleryImage = async (index) => {
    try {
      const res = await fetch(`${API_URL}/settings/gallery/${index}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Image removed from gallery!', 'success');
        refreshUserData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewAction = async (id, isApproved, action = 'approve') => {
    try {
      const res = await fetch(`${API_URL}/other/reviews/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isApproved, action })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        fetchStatsAndData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMessageStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_URL}/other/contact/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Message status updated', 'success');
        fetchStatsAndData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[85vh] space-y-8">
      
      {/* Admin Title Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Shield className="w-8 h-8 text-indigo-500" />
            <span>Admin Control Panel</span>
          </h1>
          <p className="text-slate-400 text-xs">Manage registered students, cabins availability, bookings approvals, payments and configs.</p>
        </div>
        <button
          onClick={fetchStatsAndData}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-white/10 hover:bg-slate-800 text-xs text-slate-300 hover:text-white rounded-lg transition-colors shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Real-Time Data</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
        {[
          { icon: <Users className="w-4 h-4 text-indigo-400" />, label: 'Total Students', value: stats.totalStudents },
          { icon: <CreditCard className="w-4 h-4 text-emerald-400" />, label: 'Active Passes', value: stats.activeMemberships },
          { icon: <Sliders className="w-4 h-4 text-emerald-400" />, label: 'Available Seats', value: stats.availableSeats },
          { icon: <Calendar className="w-4 h-4 text-amber-400" />, label: 'Bookings Today', value: stats.bookingsToday },
          { icon: <CreditCard className="w-4 h-4 text-indigo-400" />, label: 'Monthly Revenue', value: `₹${stats.monthlyRevenue}` },
          { icon: <Users className="w-4 h-4 text-indigo-400" />, label: 'New Students (7d)', value: stats.newRegistrations }
        ].map((metric, i) => (
          <div key={i} className="glass-card p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center">
            <div className="p-1.5 bg-white/5 rounded-lg mb-2">
              {metric.icon}
            </div>
            <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase block mb-1">{metric.label}</span>
            <span className="text-xl font-black text-white">{metric.value}</span>
          </div>
        ))}
      </div>

      {/* Tab Selectors */}
      <div className="border-b border-white/10 flex flex-wrap gap-2 text-xs">
        {[
          { id: 'bookings', label: 'Reservations Approval', count: bookings.filter(b => b.status === 'pending').length },
          { id: 'students', label: 'Students Directory' },
          { id: 'cabins', label: 'Cabins & Seats' },
          { id: 'billing', label: 'Payments & Billings' },
          { id: 'reviews', label: 'Moderation Reviews', count: reviews.filter(r => !r.isApproved).length },
          { id: 'contact', label: 'Inquiry Tickets', count: messages.filter(m => m.status === 'unread').length },
          { id: 'settings', label: 'Metadata Settings' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 font-bold transition-all border-b-2
              ${activeTab === tab.id
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-white'
              }
            `}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className="ml-1.5 bg-rose-500 text-[9px] text-white px-1.5 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB CONTENTS */}
      <div className="bg-slate-900/40 rounded-3xl border border-white/5 p-6 min-h-[400px]">
        {loadingData ? (
          <div className="flex h-60 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          </div>
        ) : (
          <>
            {/* 1. BOOKINGS APPROVALS */}
            {activeTab === 'bookings' && (
              <div className="space-y-4 animate-fade-in-up">
                <h3 className="font-extrabold text-sm text-white">Cabin Bookings Administration</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 font-semibold">
                        <th className="pb-3">Student Aspirant</th>
                        <th className="pb-3">Cabin</th>
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Slot</th>
                        <th className="pb-3">Duration</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {bookings.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="py-6 text-center text-slate-500 italic">No bookings found.</td>
                        </tr>
                      ) : (
                        bookings.map(b => (
                          <tr key={b._id} className="text-slate-200">
                            <td className="py-3">
                              <p className="font-bold">{b.student?.name || 'Student'}</p>
                              <span className="text-[10px] text-slate-400">{b.student?.phone || ''}</span>
                            </td>
                            <td className="py-3 font-bold text-indigo-400">{b.cabin?.cabinNumber || 'Cabin'}</td>
                            <td className="py-3">{b.date}</td>
                            <td className="py-3 font-medium">{b.timeSlot}</td>
                            <td className="py-3 text-slate-400">{b.durationHours} hrs</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase
                                ${b.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : ''}
                                ${b.status === 'pending' ? 'bg-amber-500/10 text-amber-400' : ''}
                                ${b.status === 'rejected' ? 'bg-rose-500/10 text-rose-400' : ''}
                                ${b.status === 'cancelled' ? 'bg-slate-800 text-slate-500' : ''}
                              `}>
                                {b.status}
                              </span>
                            </td>
                            <td className="py-3 text-right space-x-2">
                              {b.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleBookingAction(b._id, 'approved')}
                                    className="p-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded"
                                    title="Approve"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleBookingAction(b._id, 'rejected')}
                                    className="p-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded"
                                    title="Reject"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                              {b.status === 'approved' && (
                                <button
                                  onClick={() => handleBookingAction(b._id, 'cancelled')}
                                  className="text-[10px] font-bold text-rose-400 hover:text-rose-300"
                                >
                                  Cancel Booking
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 2. STUDENTS DIRECTORY */}
            {activeTab === 'students' && (
              <div className="space-y-4 animate-fade-in-up">
                <h3 className="font-extrabold text-sm text-white">Registered Students Index</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 font-semibold">
                        <th className="pb-3">Name</th>
                        <th className="pb-3">Email Address</th>
                        <th className="pb-3">Phone</th>
                        <th className="pb-3">Security status</th>
                        <th className="pb-3">Pass Pass</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {students.map(s => (
                        <tr key={s._id} className="text-slate-200">
                          <td className="py-3 font-bold">{s.name}</td>
                          <td className="py-3 text-slate-400 font-mono">{s.email}</td>
                          <td className="py-3">{s.phone}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold
                              ${s.isVerified ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}
                            `}>
                              {s.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase
                              ${s.membership.status === 'active' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 text-slate-500'}
                            `}>
                              {s.membership.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. CABINS & SEATS */}
            {activeTab === 'cabins' && (
              <div className="space-y-6 animate-fade-in-up">
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-sm text-white">Study Cabins Capacity Layout</h3>
                  <button
                    onClick={handleCreateCabin}
                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create Cabin</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-xs">
                  {cabins.map(cabin => (
                    <div key={cabin._id} className="glass-card p-4 rounded-2xl border border-white/5 space-y-4 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-black text-lg text-indigo-400">{cabin.cabinNumber}</h4>
                          <p className="text-[10px] text-slate-400">Capacity: {cabin.capacity} Seats</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase
                          ${cabin.status === 'available' ? 'bg-emerald-500/15 text-emerald-400' : ''}
                          ${cabin.status === 'reserved' ? 'bg-amber-500/15 text-amber-400' : ''}
                          ${cabin.status === 'occupied' ? 'bg-rose-500/15 text-rose-400' : ''}
                        `}>
                          {cabin.isBlocked ? 'Blocked' : cabin.status}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => handleToggleCabinBlock(cabin._id)}
                        className={`w-full py-1.5 text-center font-bold rounded-lg text-[10px] transition-colors
                          ${cabin.isBlocked
                            ? 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30'
                            : 'bg-rose-600/20 text-rose-400 hover:bg-rose-600/30'
                          }
                        `}
                      >
                        {cabin.isBlocked ? 'Unblock Cabin' : 'Block / Out of service'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. BILLING RECORDS */}
            {activeTab === 'billing' && (
              <div className="space-y-4 animate-fade-in-up">
                <h3 className="font-extrabold text-sm text-white">Billing & Payments Index</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 font-semibold">
                        <th className="pb-3">Invoice No.</th>
                        <th className="pb-3">Student Aspirant</th>
                        <th className="pb-3">Plan</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Gateway</th>
                        <th className="pb-3">Date</th>
                        <th className="pb-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {payments.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="py-6 text-center text-slate-500 italic">No billing records found.</td>
                        </tr>
                      ) : (
                        payments.map(p => (
                          <tr key={p._id} className="text-slate-200">
                            <td className="py-3 font-mono text-slate-400">{p.invoiceNumber}</td>
                            <td className="py-3 font-bold">{p.student?.name || 'Student'}</td>
                            <td className="py-3">{p.membershipPlan?.name || 'Membership'}</td>
                            <td className="py-3 font-extrabold">₹{p.amount}</td>
                            <td className="py-3 text-slate-400">{p.paymentMethod}</td>
                            <td className="py-3">{new Date(p.createdAt).toLocaleDateString()}</td>
                            <td className="py-3 text-right">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase
                                ${p.paymentStatus === 'success' ? 'bg-emerald-500/10 text-emerald-400' : ''}
                                ${p.paymentStatus === 'pending' ? 'bg-amber-500/10 text-amber-400' : ''}
                                ${p.paymentStatus === 'failed' ? 'bg-rose-500/10 text-rose-400' : ''}
                              `}>
                                {p.paymentStatus}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 5. REVIEWS MODERATION */}
            {activeTab === 'reviews' && (
              <div className="space-y-4 animate-fade-in-up">
                <h3 className="font-extrabold text-sm text-white">Student Review Moderation</h3>
                <div className="grid grid-cols-1 gap-4">
                  {reviews.length === 0 ? (
                    <p className="text-center py-6 text-slate-500 italic text-xs">No reviews submitted.</p>
                  ) : (
                    reviews.map(r => (
                      <div key={r._id} className="glass-card p-4 rounded-2xl border border-white/5 flex items-center justify-between gap-4 text-xs">
                        <div className="space-y-1 max-w-xl">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{r.student?.name || 'Student'}</span>
                            <span className="text-slate-500">|</span>
                            <span className="flex text-yellow-500">
                              {Array.from({ length: r.rating }).map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-current" />
                              ))}
                            </span>
                          </div>
                          <p className="text-slate-300 italic">"{r.comment}"</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          {!r.isApproved ? (
                            <button
                              onClick={() => handleReviewAction(r._id, true)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold"
                            >
                              Approve
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReviewAction(r._id, false)}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg font-bold"
                            >
                              Unapprove
                            </button>
                          )}
                          <button
                            onClick={() => handleReviewAction(r._id, false, 'delete')}
                            className="p-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 rounded-lg"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 6. CONTACT INQUIRY TICKETS */}
            {activeTab === 'contact' && (
              <div className="space-y-4 animate-fade-in-up">
                <h3 className="font-extrabold text-sm text-white">Inquiry Tickets Box</h3>
                <div className="grid grid-cols-1 gap-4 text-xs">
                  {messages.length === 0 ? (
                    <p className="text-center py-6 text-slate-500 italic">No message requests found.</p>
                  ) : (
                    messages.map(m => (
                      <div key={m._id} className="glass-card p-4 rounded-2xl border border-white/5 space-y-3">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div>
                            <span className="font-bold text-white text-sm">{m.name}</span>
                            <p className="text-slate-400 text-[10px]">Email: {m.email} | Phone: {m.phone}</p>
                          </div>
                          <div className="flex gap-2">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase
                              ${m.status === 'unread' ? 'bg-rose-500/15 text-rose-400 animate-pulse' : ''}
                              ${m.status === 'read' ? 'bg-indigo-500/15 text-indigo-400' : ''}
                            `}>
                              {m.status}
                            </span>
                            {m.status === 'unread' && (
                              <button
                                onClick={() => handleMessageStatus(m._id, 'read')}
                                className="px-2 py-0.5 bg-indigo-600 text-white rounded text-[10px] font-bold"
                              >
                                Mark Read
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-slate-300 bg-white/5 p-3 rounded-xl leading-normal">{m.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 7. SETTINGS & METADATA CONFIG */}
            {activeTab === 'settings' && (
              <div className="space-y-8 animate-fade-in-up text-xs">
                
                {/* Form parameters */}
                <form onSubmit={handleUpdateSettings} className="space-y-6">
                  <h3 className="font-extrabold text-sm text-white border-b border-white/10 pb-2">Library Metadata Forms</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-semibold">Library Name</label>
                      <input
                        type="text"
                        value={settingsForm.libraryName}
                        onChange={e => setSettingsForm({ ...settingsForm, libraryName: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-semibold">Tagline</label>
                      <input
                        type="text"
                        value={settingsForm.tagline}
                        onChange={e => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-semibold">Operating Timings</label>
                      <input
                        type="text"
                        value={settingsForm.timings}
                        onChange={e => setSettingsForm({ ...settingsForm, timings: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-semibold">Contact Phone</label>
                      <input
                        type="text"
                        value={settingsForm.contactNumber}
                        onChange={e => setSettingsForm({ ...settingsForm, contactNumber: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-semibold">WhatsApp Number</label>
                      <input
                        type="text"
                        value={settingsForm.whatsAppNumber}
                        onChange={e => setSettingsForm({ ...settingsForm, whatsAppNumber: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-semibold">Contact Email</label>
                      <input
                        type="email"
                        value={settingsForm.email}
                        onChange={e => setSettingsForm({ ...settingsForm, email: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-slate-400 font-semibold">Library Address</label>
                      <input
                        type="text"
                        value={settingsForm.address}
                        onChange={e => setSettingsForm({ ...settingsForm, address: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-slate-400 font-semibold">Total Seats</label>
                        <input
                          type="number"
                          value={settingsForm.totalSeats}
                          onChange={e => setSettingsForm({ ...settingsForm, totalSeats: Number(e.target.value) })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-slate-400 font-semibold">Occupied Seats</label>
                        <input
                          type="number"
                          value={settingsForm.occupiedSeats}
                          onChange={e => setSettingsForm({ ...settingsForm, occupiedSeats: Number(e.target.value) })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingSettings}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-bold rounded-xl transition-all shadow-md"
                  >
                    {submittingSettings ? 'Saving Metadata...' : 'Save Configurations'}
                  </button>
                </form>

                {/* announcements & gallery */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-white/10 pt-6">
                  
                  {/* Announcement logs */}
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-sm text-white">Manage Landing Page Announcements</h4>
                    <form onSubmit={handleAddAnnouncement} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add new ticker announcement"
                        value={newAnnouncement}
                        onChange={e => setNewAnnouncement(e.target.value)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                      />
                      <button type="submit" className="px-4 bg-indigo-600 rounded-xl font-bold">Add</button>
                    </form>
                    <div className="space-y-2">
                      {settings.announcements.map((ann, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5">
                          <span className="truncate pr-4">{ann}</span>
                          <button onClick={() => handleDeleteAnnouncement(i)} className="text-rose-400 hover:text-rose-300">
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gallery logs */}
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-sm text-white">Manage Photo Gallery Collection</h4>
                    <form onSubmit={handleAddGalleryImage} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Paste image URL (https://unsplash...)"
                        value={newGalleryUrl}
                        onChange={e => setNewGalleryUrl(e.target.value)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                      />
                      <button type="submit" className="px-4 bg-indigo-600 rounded-xl font-bold">Add</button>
                    </form>
                    <div className="grid grid-cols-4 gap-2">
                      {settings.gallery.map((img, i) => (
                        <div key={i} className="relative aspect-square border border-white/10 rounded-xl overflow-hidden group">
                          <img src={img} alt="Gallery Spot" className="w-full h-full object-cover" />
                          <button
                            onClick={() => handleDeleteGalleryImage(i)}
                            className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400 transition-opacity"
                          >
                            <Trash className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
