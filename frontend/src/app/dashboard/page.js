'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User, CreditCard, Calendar, MessageSquare, Star, Clock, AlertCircle,
  CheckCircle, ShieldAlert, Key, ClipboardList, Info, HelpCircle, X, Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

function DashboardContent() {
  const {
    user,
    token,
    cabins,
    myBookings,
    myPayments,
    settings,
    createBooking,
    cancelBooking,
    buyMembership,
    simulatePaymentSuccess,
    submitReview,
    updateProfile,
    showToast,
    refreshUserData
  } = useApp();

  const router = useRouter();
  const searchParams = useSearchParams();

  // Selected tab
  const [activeTab, setActiveTab] = useState('overview');

  // Booking Flow Wizard State
  const [bookingDate, setBookingDate] = useState('');
  const [bookingSlot, setBookingSlot] = useState('');
  const [bookingDuration, setBookingDuration] = useState('4');
  const [selectedCabin, setSelectedCabin] = useState(null);
  const [cabinsList, setCabinsList] = useState([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Membership Purchase State
  const [selectedPlan, setSelectedPlan] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('QR_Code');
  const [initiatedPayment, setInitiatedPayment] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', password: '' });
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  // Review Form State
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Auto-focus tab if query params are present
  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    
    const targetPlan = searchParams.get('plan');
    if (targetPlan) {
      setActiveTab('membership');
      setSelectedPlan(targetPlan);
    }

    if (user) {
      setProfileForm({ name: user.name, phone: user.phone, password: '' });
    }
  }, [searchParams, token, user]);

  // Set default booking date as tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    setBookingDate(`${yyyy}-${mm}-${dd}`);
    setBookingSlot('08:00-12:00');
  }, []);

  // Fetch Cabins Availability when date or slot changes
  useEffect(() => {
    if (bookingDate && bookingSlot && activeTab === 'booking') {
      checkCabinAvailability();
    }
  }, [bookingDate, bookingSlot, activeTab]);

  const checkCabinAvailability = async () => {
    setCheckingAvailability(true);
    setSelectedCabin(null);
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/check-availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: bookingDate, timeSlot: bookingSlot })
      });
      const data = await res.json();
      if (data.success) {
        setCabinsList(data.cabins);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleCreateBookingSubmit = async () => {
    if (!selectedCabin) {
      showToast('Please select an available cabin!', 'warning');
      return;
    }

    const payload = {
      cabinId: selectedCabin._id,
      date: bookingDate,
      timeSlot: bookingSlot,
      durationHours: Number(bookingDuration)
    };

    const result = await createBooking(payload);
    if (result.success) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setSelectedCabin(null);
      setActiveTab('overview');
    }
  };

  const handlePurchaseMembership = async (e) => {
    e.preventDefault();
    if (!selectedPlan) {
      showToast('Please select a membership pass!', 'warning');
      return;
    }

    setProcessingPayment(true);
    const result = await buyMembership(selectedPlan, paymentMethod);
    setProcessingPayment(false);

    if (result.success) {
      setInitiatedPayment(result.data);
      showToast('Checkout simulated. Approve payment below to activate.', 'info');
    }
  };

  const handleApprovePayment = async () => {
    if (!initiatedPayment) return;
    setProcessingPayment(true);
    const result = await simulatePaymentSuccess(initiatedPayment.paymentId);
    setProcessingPayment(false);
    if (result.success) {
      confetti({ particleCount: 150, spread: 80 });
      setInitiatedPayment(null);
      setSelectedPlan('');
      setActiveTab('overview');
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSubmitting(true);
    const result = await updateProfile(profileForm);
    setProfileSubmitting(false);
    if (result.success) {
      setProfileForm(prev => ({ ...prev, password: '' }));
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment) {
      showToast('Please write a comment', 'warning');
      return;
    }
    setReviewSubmitting(true);
    const result = await submitReview(reviewForm);
    setReviewSubmitting(false);
    if (result.success) {
      setReviewForm({ rating: 5, comment: '' });
    }
  };

  if (!user) return null;

  // Static plans mapped to MongoDB IDs simulated
  const plansData = [
    { id: 'Daily Pass', name: 'Daily Pass (₹50)', price: 50 },
    { id: 'Weekly Pass', name: 'Weekly Pass (₹250)', price: 250 },
    { id: 'Monthly Pass', name: 'Monthly Pass (₹800)', price: 800 },
    { id: 'Quarterly Pass', name: 'Quarterly Pass (₹2200)', price: 2200 },
    { id: 'Half-Yearly Pass', name: 'Half-Yearly Pass (₹4000)', price: 4000 },
    { id: 'Yearly Pass', name: 'Yearly Pass (₹7500)', price: 7500 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[80vh]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar Nav */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl">
                <User className="w-5 h-5" />
              </div>
              <div className="truncate">
                <h3 className="font-extrabold text-sm text-white truncate">{user.name}</h3>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">
                  {user.role} Account
                </span>
              </div>
            </div>

            <hr className="border-white/5" />

            <nav className="flex flex-col gap-1 text-xs">
              {[
                { id: 'overview', label: 'Dashboard Overview', icon: <ClipboardList className="w-4 h-4" /> },
                { id: 'booking', label: 'Reserve Study Cabin', icon: <Calendar className="w-4 h-4" /> },
                { id: 'membership', label: 'Passes & Billing', icon: <CreditCard className="w-4 h-4" /> },
                { id: 'profile', label: 'Account Settings', icon: <Key className="w-4 h-4" /> },
                { id: 'review', label: 'Rate & Review Us', icon: <Star className="w-4 h-4" /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setInitiatedPayment(null);
                  }}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl font-bold transition-all text-left
                    ${activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Dashboard Main Area */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in-up">
              
              {/* Profile Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Membership Pass Card */}
                <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
                  
                  <span className="text-[9px] font-bold tracking-widest text-indigo-400 uppercase">Membership Status</span>
                  
                  {user.membership && user.membership.status === 'active' ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-extrabold text-sm">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        <span>Active Pass</span>
                      </div>
                      <h4 className="font-extrabold text-lg text-white">
                        {user.membership.plan?.name || 'Standard Pass'}
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Expires: {new Date(user.membership.expiryDate).toLocaleDateString()}
                      </p>
                      <div className="mt-3 text-2xl font-black text-white">
                        {user.membership.remainingDays} <span className="text-xs text-slate-500 font-medium">days left</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-1.5 text-rose-400 font-extrabold text-sm">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>No Active Pass</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        Purchase a membership plan to unlock booking study cabins.
                      </p>
                      <button
                        onClick={() => setActiveTab('membership')}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-[10px] font-bold text-white transition-colors"
                      >
                        Buy Pass Now
                      </button>
                    </div>
                  )}
                </div>

                {/* Allocated Cabin Card */}
                <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-4">
                  <span className="text-[9px] font-bold tracking-widest text-indigo-400 uppercase">Cabin Allocation</span>
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-slate-400">Your Active Cabin:</div>
                    {user.cabinNumber ? (
                      <div className="space-y-1">
                        <div className="text-3xl font-black text-indigo-400">{user.cabinNumber}</div>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          Your individual study desk is locked for your booking slots.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="text-slate-500 text-sm italic font-medium">None Reserved</div>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          Navigate to the booking section to reserve your individual cabin.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Email Verification Box */}
                <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-4">
                  <span className="text-[9px] font-bold tracking-widest text-indigo-400 uppercase">Security Check</span>
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-slate-400">Account Verification:</div>
                    {user.isVerified ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-extrabold text-xs">
                          <CheckCircle className="w-4 h-4 shrink-0" />
                          <span>Email Verified</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          Full features unlocked. Enjoy your study point resources!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-rose-400 font-extrabold text-xs">
                          <ShieldAlert className="w-4 h-4 shrink-0" />
                          <span>Unverified Account</span>
                        </div>
                        <Link
                          href="/verify-email"
                          className="inline-block text-[10px] font-bold text-indigo-400 hover:underline"
                        >
                          Verify Account Now &rarr;
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Booking History Logs */}
              <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-4">
                <h3 className="font-extrabold text-sm text-white">Your Cabin Booking History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 font-semibold">
                        <th className="pb-3 font-bold">Cabin</th>
                        <th className="pb-3 font-bold">Date</th>
                        <th className="pb-3 font-bold">Time Slot</th>
                        <th className="pb-3 font-bold">Duration</th>
                        <th className="pb-3 font-bold">Status</th>
                        <th className="pb-3 text-right font-bold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {myBookings.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-6 text-center text-slate-500 italic">
                            No study cabin bookings found.
                          </td>
                        </tr>
                      ) : (
                        myBookings.map(b => (
                          <tr key={b._id} className="text-slate-200">
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
                            <td className="py-3 text-right">
                              {b.status === 'approved' && (
                                <button
                                  onClick={() => cancelBooking(b._id)}
                                  className="text-[10px] font-bold text-rose-400 hover:text-rose-300 transition-colors"
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
            </div>
          )}

          {/* TAB 2: BOOK CABIN */}
          {activeTab === 'booking' && (
            <div className="glass-card p-8 rounded-3xl border border-white/5 space-y-6 animate-fade-in-up">
              
              <div className="space-y-1">
                <h3 className="font-extrabold text-lg text-white">Reserve An Individual Study Cabin</h3>
                <p className="text-slate-400 text-xs">Block a distraction-free private study cabin. Instant confirmation.</p>
              </div>

              {user.membership?.status !== 'active' ? (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-6 rounded-2xl text-xs leading-relaxed space-y-2">
                  <p className="font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>Active Membership Required</span>
                  </p>
                  <p>You cannot book study cabins without an active pass. Please navigate to the "Passes & Billing" tab to buy a pass.</p>
                </div>
              ) : (
                <div className="space-y-6 text-xs">
                  
                  {/* Step inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-semibold">1. Choose Date</label>
                      <input
                        type="date"
                        value={bookingDate}
                        onChange={e => setBookingDate(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-semibold">2. Choose Time Slot</label>
                      <select
                        value={bookingSlot}
                        onChange={e => setBookingSlot(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
                      >
                        <option value="06:00-10:00">Early Morning (06:00 AM - 10:00 AM)</option>
                        <option value="08:00-12:00">Morning Shift (08:00 AM - 12:00 PM)</option>
                        <option value="12:00-16:00">Noon Shift (12:00 PM - 04:00 PM)</option>
                        <option value="14:00-18:00">Afternoon Shift (02:00 PM - 06:00 PM)</option>
                        <option value="16:00-20:00">Evening Shift (04:00 PM - 08:00 PM)</option>
                        <option value="18:00-22:00">Night Shift (06:00 PM - 10:00 PM)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-semibold">3. Select Duration</label>
                      <select
                        value={bookingDuration}
                        onChange={e => setBookingDuration(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
                      >
                        <option value="2">2 Hours</option>
                        <option value="4">4 Hours</option>
                        <option value="6">6 Hours</option>
                        <option value="8">8 Hours (Max)</option>
                      </select>
                    </div>
                  </div>

                  {/* Cabins Status Grid */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-slate-400 font-semibold">4. Choose Available Cabin</label>
                      <div className="flex gap-3 text-[10px]">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500"></span>Available</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-rose-500"></span>Occupied</span>
                      </div>
                    </div>

                    {checkingAvailability ? (
                      <div className="py-10 text-center text-slate-500">Checking live availability...</div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                        {cabinsList.map(cabin => {
                          const isSelected = selectedCabin && selectedCabin._id === cabin._id;
                          return (
                            <button
                              key={cabin._id}
                              disabled={!cabin.isAvailable}
                              onClick={() => setSelectedCabin(cabin)}
                              className={`p-4 rounded-xl border text-center font-bold select-none transition-all flex flex-col items-center gap-1
                                ${cabin.isAvailable
                                  ? isSelected
                                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg'
                                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400 opacity-60 cursor-not-allowed'
                                }
                              `}
                            >
                              <span className="text-sm">{cabin.cabinNumber}</span>
                              <span className="text-[9px] font-normal uppercase tracking-wider">
                                {cabin.isAvailable ? (isSelected ? 'Selected' : 'Open') : 'Booked'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Confirm Booking */}
                  {selectedCabin && (
                    <div className="p-4 bg-indigo-600/10 border border-indigo-600/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-indigo-400">Verify Selection Summary:</p>
                        <p className="text-slate-300 text-[10px]">
                          Cabin {selectedCabin.cabinNumber} | Date: {bookingDate} | Slot: {bookingSlot} ({bookingDuration} hrs duration)
                        </p>
                      </div>
                      <button
                        onClick={handleCreateBookingSubmit}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold transition-all shadow-md shrink-0"
                      >
                        Confirm Cabin Booking
                      </button>
                    </div>
                  )}

                </div>
              )}
            </div>
          )}

          {/* TAB 3: PASSES & BILLING */}
          {activeTab === 'membership' && (
            <div className="space-y-6 animate-fade-in-up">
              
              <div className="glass-card p-8 rounded-3xl border border-white/5 space-y-6">
                <div className="space-y-1">
                  <h3 className="font-extrabold text-lg text-white">Buy or Renew Membership Passes</h3>
                  <p className="text-slate-400 text-xs">Renew your access cards safely. UPI QR codes will be mock generated.</p>
                </div>

                {!initiatedPayment ? (
                  <form onSubmit={handlePurchaseMembership} className="space-y-6 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-slate-400 font-semibold">Select Pass Plan</label>
                        <select
                          required
                          value={selectedPlan}
                          onChange={e => setSelectedPlan(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
                        >
                          <option value="">-- Select Subscription Plan --</option>
                          {myPayments.length === 0 ? (
                            // Seed plan items
                            <>
                              <option value="Daily Pass">Daily Pass - ₹50 (1 Day)</option>
                              <option value="Weekly Pass">Weekly Pass - ₹250 (7 Days)</option>
                              <option value="Monthly Pass">Monthly Pass - ₹800 (30 Days)</option>
                              <option value="Quarterly Pass">Quarterly Pass - ₹2200 (90 Days)</option>
                              <option value="Half-Yearly Pass">Half-Yearly Pass - ₹4000 (180 Days)</option>
                              <option value="Yearly Pass">Yearly Pass - ₹7500 (365 Days)</option>
                            </>
                          ) : (
                            // Seed plan items fallback
                            <>
                              <option value="Daily Pass">Daily Pass - ₹50 (1 Day)</option>
                              <option value="Weekly Pass">Weekly Pass - ₹250 (7 Days)</option>
                              <option value="Monthly Pass">Monthly Pass - ₹800 (30 Days)</option>
                              <option value="Quarterly Pass">Quarterly Pass - ₹2200 (90 Days)</option>
                              <option value="Half-Yearly Pass">Half-Yearly Pass - ₹4000 (180 Days)</option>
                              <option value="Yearly Pass">Yearly Pass - ₹7500 (365 Days)</option>
                            </>
                          )}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-slate-400 font-semibold">Select Gateway Method</label>
                        <select
                          value={paymentMethod}
                          onChange={e => setPaymentMethod(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
                        >
                          <option value="QR_Code">UPI QR Code scanner (Simulated)</option>
                          <option value="UPI">UPI Direct ID (Simulated)</option>
                          <option value="Razorpay">Razorpay Checkout (Simulated)</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={processingPayment}
                      className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-600/10 text-xs"
                    >
                      {processingPayment ? 'Processing Checkout...' : 'Proceed to Checkout'}
                    </button>
                  </form>
                ) : (
                  <div className="p-6 bg-slate-900 border border-white/10 rounded-2xl space-y-6 flex flex-col items-center text-center text-xs">
                    <div className="flex justify-between w-full pb-3 border-b border-white/10">
                      <span className="font-bold text-indigo-400">Payment Checkout Session</span>
                      <button onClick={() => setInitiatedPayment(null)} className="text-slate-500 hover:text-white">✕</button>
                    </div>

                    <div className="space-y-2">
                      <p className="text-slate-400">Amount Due:</p>
                      <h2 className="text-3xl font-extrabold text-white">₹{initiatedPayment.amount}</h2>
                      <p className="text-[10px] text-slate-500">Invoice: {initiatedPayment.invoiceNumber}</p>
                    </div>

                    {initiatedPayment.qrCodeUrl && (
                      <div className="p-4 bg-white rounded-xl shadow-xl space-y-2 flex flex-col items-center">
                        <img src={initiatedPayment.qrCodeUrl} alt="UPI QR Scanner" className="w-48 h-48" />
                        <span className="text-[9px] text-slate-500 font-semibold tracking-wider uppercase">Scan QR to pay ₹{initiatedPayment.amount}</span>
                      </div>
                    )}

                    <div className="w-full space-y-2">
                      <button
                        onClick={handleApprovePayment}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-colors"
                      >
                        Simulate Successful Payment Approval
                      </button>
                      <button
                        onClick={() => {
                          setInitiatedPayment(null);
                          showToast('Payment cancelled.', 'error');
                        }}
                        className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-400 rounded-xl transition-colors border border-white/5"
                      >
                        Cancel Transaction
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Billing History Logs */}
              <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-4">
                <h3 className="font-extrabold text-sm text-white">Billing & Payment Logs</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 font-semibold">
                        <th className="pb-3 font-bold">Invoice No.</th>
                        <th className="pb-3 font-bold">Plan Pass</th>
                        <th className="pb-3 font-bold">Amount</th>
                        <th className="pb-3 font-bold">Method</th>
                        <th className="pb-3 font-bold">Date</th>
                        <th className="pb-3 text-right font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {myPayments.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-6 text-center text-slate-500 italic">
                            No billing transactions found.
                          </td>
                        </tr>
                      ) : (
                        myPayments.map(p => (
                          <tr key={p._id} className="text-slate-200">
                            <td className="py-3 font-mono text-slate-400">{p.invoiceNumber}</td>
                            <td className="py-3 font-bold">{p.membershipPlan?.name || 'Membership Plan'}</td>
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
            </div>
          )}

          {/* TAB 4: ACCOUNT SETTINGS */}
          {activeTab === 'profile' && (
            <div className="glass-card p-8 rounded-3xl border border-white/5 space-y-6 animate-fade-in-up">
              <div className="space-y-1">
                <h3 className="font-extrabold text-lg text-white">Update Profile Settings</h3>
                <p className="text-slate-400 text-xs">Update your display name, contact phone number, or password credentials.</p>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-6 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-semibold">Your Display Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Display name"
                      value={profileForm.name}
                      onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-semibold">Contact Phone Number</label>
                    <input
                      type="text"
                      required
                      placeholder="10 digit number"
                      value={profileForm.phone}
                      onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 max-w-sm">
                  <label className="text-slate-400 font-semibold">Change Password (Leave blank to keep current)</label>
                  <input
                    type="password"
                    placeholder="New password (optional)"
                    value={profileForm.password}
                    onChange={e => setProfileForm({ ...profileForm, password: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={profileSubmitting}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-600/10 text-xs"
                >
                  {profileSubmitting ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: RATE & REVIEW */}
          {activeTab === 'review' && (
            <div className="glass-card p-8 rounded-3xl border border-white/5 space-y-6 animate-fade-in-up">
              <div className="space-y-1">
                <h3 className="font-extrabold text-lg text-white">Rate & Review Your Experience</h3>
                <p className="text-slate-400 text-xs">Help other aspirants know about your experience. Your feedback keeps us improving.</p>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-6 text-xs">
                
                <div className="space-y-2">
                  <label className="text-slate-400 font-semibold block">Select Rating Star Count</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= reviewForm.rating
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-slate-600 hover:text-yellow-500'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold">Write Detailed Comments *</label>
                  <textarea
                    rows="5"
                    required
                    placeholder="Write details of your study environment, cabins, Wi-Fi speed, and timing experience..."
                    value={reviewForm.comment}
                    onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-xs resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-600/10 text-xs"
                >
                  {reviewSubmitting ? 'Submitting Review...' : 'Submit Rating Review'}
                </button>
              </form>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  return (
    <Suspense fallback={
      <div className="flex h-[70vh] items-center justify-center bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
