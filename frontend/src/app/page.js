'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Wifi, Shield, Zap, Wind, Key, HelpCircle, ArrowRight,
  MapPin, Phone, MessageSquare, Mail, Award, CheckCircle, ChevronDown, ChevronUp, Image as ImageIcon, Star
} from 'lucide-react';

export default function HomePage() {
  const { settings, API_URL, showToast, user } = useApp();
  const router = useRouter();

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null);

  // Gallery Lightbox State
  const [lightboxImage, setLightboxImage] = useState(null);

  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  // Reviews State
  const [reviews, setReviews] = useState([
    { student: { name: 'Aman Sharma' }, rating: 5, comment: 'Best study environment in Gaya. The individual cabins are perfect for focused preparation.' },
    { student: { name: 'Priya Singh' }, rating: 5, comment: 'High speed Wi-Fi and 24x7 power backup have made my studies very smooth. Highly recommended.' },
    { student: { name: 'Ravi Kumar' }, rating: 4, comment: 'AC hall is very silent. Safe parking is a big relief. Mritunjay Ji manages it very well.' }
  ]);

  // Load reviews from backend
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${API_URL}/other/reviews/approved`);
        const data = await res.json();
        if (data.success && data.reviews.length > 0) {
          setReviews(data.reviews);
        }
      } catch (err) {
        console.error('Error fetching approved reviews:', err);
      }
    };
    fetchReviews();
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.phone || !contactForm.message) {
      showToast('Name, Phone, and Message are required!', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/other/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Your message has been sent successfully!', 'success');
        setContactForm({ name: '', email: '', phone: '', message: '' });
      } else {
        showToast(data.message || 'Failed to send message', 'error');
      }
    } catch (err) {
      showToast('Server is currently offline. Please try again later.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFaqToggle = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Static Membership Plans
  const membershipPlans = [
    { id: '1', name: 'Daily Pass', price: 50, duration: '1 Day', benefits: ['Study hall access', 'High speed Wi-Fi', 'Drinking RO water'] },
    { id: '2', name: 'Weekly Pass', price: 250, duration: '7 Days', benefits: ['Study hall access', 'High speed Wi-Fi', 'Power backup', 'Locker access (chargeable)'] },
    { id: '3', name: 'Monthly Pass', price: 800, duration: '30 Days', benefits: ['Allocated Cabin preference', 'High speed Wi-Fi', 'Locker facility', 'Power backup', 'Fully A/C'] },
    { id: '4', name: 'Quarterly Pass', price: 2200, duration: '90 Days', benefits: ['Allocated Cabin preference', 'High speed Wi-Fi', 'Locker facility', 'Power backup', 'Fully A/C', '1 Free Magazine'] },
    { id: '5', name: 'Half-Yearly Pass', price: 4000, duration: '180 Days', benefits: ['Allocated Cabin preference', 'High speed Wi-Fi', 'Locker facility', 'Power backup', 'Fully A/C', 'Monthly Magazines'] },
    { id: '6', name: 'Yearly Pass', price: 7500, duration: '365 Days', benefits: ['Permanent Study Cabin', 'High speed Wi-Fi', 'Locker facility', 'Power backup', 'Fully A/C', 'All Magazines', '10% Discount'] }
  ];

  // Static FAQs
  const faqs = [
    { q: 'How to join the library?', a: 'You can register online, pick a membership plan, complete payment, and start visiting. Alternatively, you can drop by and book via WhatsApp or at the reception.' },
    { q: 'How does the cabin booking system work?', a: 'Once logged in, click "Reserve Cabin" in your dashboard, select your date, select an open time slot, choose from the available cabins, and confirm instantly.' },
    { q: 'Can I cancel my booking?', a: 'Yes! You can cancel your cabin booking directly from your student dashboard. The cabin will instantly become available for other students.' },
    { q: 'Is high-speed Wi-Fi included in all passes?', a: 'Yes, unlimited high-speed fiber Wi-Fi is included for free in all membership plans (Daily, Weekly, Monthly, and Annual passes).' },
    { q: 'What are the operating timings of the library?', a: 'We are open 7 days a week, from 06:00 AM to 10:00 PM.' }
  ];

  // Gallery images list (seeded initially or default)
  const galleryImages = settings.gallery.length > 0 ? settings.gallery : [
    'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=800'
  ];

  const handleBookNow = (plan) => {
    if (!user) {
      showToast('Please register/login to buy a membership pass.', 'info');
      router.push('/login');
    } else {
      router.push(`/dashboard?plan=${plan.id}`);
    }
  };

  const openWhatsApp = () => {
    const text = `Hello,\nI would like to book a study cabin.\n\nName:\nDate:\nTime:\nDuration:\n\nPlease confirm availability.`;
    const url = `https://wa.me/91${settings.whatsAppNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-20 pb-20">
      
      {/* 1. Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-slate-950 text-white overflow-hidden py-16 px-4">
        {/* Background Image overlay with dark tint */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 z-0 scale-105 transition-transform duration-1000"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=1200')` }}
        ></div>
        
        {/* Colorful Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-indigo-950/20 z-0"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

        <div className="relative max-w-5xl mx-auto text-center space-y-8 z-10 animate-fade-in-up">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold tracking-wider text-indigo-300 backdrop-blur-md uppercase">
            <Award className="w-4 h-4" />
            <span>Success is Dependent on Effort</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Distraction-Free Silent Zone <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-200 bg-clip-text text-transparent">
              {settings.libraryName}
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-xl max-w-3xl mx-auto leading-relaxed">
            Boost your learning output. Reserve private sound-dampening study cabins, lock personal lockers, 
            and read with high speed internet, fully air-conditioned halls, power backup, and safe parking.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/register'}
              className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-sm transition-all shadow-xl shadow-indigo-600/25 w-full sm:w-auto justify-center"
            >
              <span>{user ? 'Go to Dashboard' : 'Get Started Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={openWhatsApp}
              className="flex items-center gap-2 px-8 py-3.5 bg-slate-900/80 hover:bg-slate-800 border border-white/10 rounded-xl font-bold text-sm transition-all backdrop-blur-sm w-full sm:w-auto justify-center"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Book via WhatsApp</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10 text-slate-400 text-xs tracking-wider uppercase font-semibold">
            <div className="p-4 bg-white/5 border border-white/5 rounded-xl backdrop-blur-sm">
              <span className="text-white text-2xl font-bold block mb-1">80+</span>
              Comfortable Seats
            </div>
            <div className="p-4 bg-white/5 border border-white/5 rounded-xl backdrop-blur-sm">
              <span className="text-white text-2xl font-bold block mb-1">10</span>
              Study Cabins
            </div>
            <div className="p-4 bg-white/5 border border-white/5 rounded-xl backdrop-blur-sm">
              <span className="text-white text-2xl font-bold block mb-1">24x7</span>
              CCTV & Security
            </div>
            <div className="p-4 bg-white/5 border border-white/5 rounded-xl backdrop-blur-sm">
              <span className="text-white text-2xl font-bold block mb-1">100%</span>
              Power Backup
            </div>
          </div>
        </div>
      </section>

      {/* 2. Library Introduction & Why Choose Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-block text-xs font-bold tracking-widest text-indigo-500 uppercase">
              Introduction
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
              Create the Perfect Environment For Your Future Success
            </h2>
            <p className="text-slate-400 leading-relaxed text-base">
              Distractions are the biggest hurdle in preparing for competitive exams like UPSC, JEE, NEET, banking, and civil services. 
              <strong> The Study Point Library</strong> offers a quiet sanctuary at Khatangi Kothi on the Gaya-Fatehpur highway, built precisely for deep-focus studies.
            </p>
            <p className="text-slate-400 leading-relaxed text-base">
              Each student gets a personal seat equipped with a mobile charging point, high-speed fiber internet, and comfortable ergonomics. 
              Our reading halls are spacious, air-conditioned, and continuously monitored to ensure a peaceful atmosphere.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">Silent Zone Rules</h4>
                  <p className="text-xs text-slate-500">Strictly enforced silent hall behaviors.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">Ergonomic Seating</h4>
                  <p className="text-xs text-slate-500">Long hours study seats with back support.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Intro Side Image */}
          <div className="lg:col-span-5 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-slate-900 border border-white/10 aspect-video lg:aspect-square">
              <img
                src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600"
                alt="Study Cabins Hall"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Facilities Grid */}
      <section className="bg-slate-900/50 py-20 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          
          <div className="space-y-4">
            <div className="text-xs font-bold tracking-widest text-indigo-500 uppercase">Premium Conveniences</div>
            <h2 className="text-3xl font-extrabold tracking-tight">Our Standard Library Facilities</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm">Everything you need to maintain productivity and support long hours of study.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {[
              { icon: <Wifi className="w-6 h-6 text-indigo-400" />, title: 'High-Speed Wi-Fi', desc: 'Unlimited high speed fiber connectivity across all devices.' },
              { icon: <Zap className="w-6 h-6 text-amber-400" />, title: '24x7 Power Backup', desc: 'Complete electricity backup with high-capacity silent generators.' },
              { icon: <Wind className="w-6 h-6 text-sky-400" />, title: 'Air Conditioning', desc: 'Halls and cabins are kept fully air-conditioned for maximum comfort.' },
              { icon: <Shield className="w-6 h-6 text-emerald-400" />, title: 'CCTV Security', desc: 'Continuous surveillance and monitoring for student safety.' },
              { icon: <Key className="w-6 h-6 text-purple-400" />, title: 'Locker Facility', desc: 'Personal locked shelves to store reference books safely.' },
              { icon: <CheckCircle className="w-6 h-6 text-indigo-400" />, title: 'Drinking RO Water', desc: 'Cold and pure drinking water dispenser available 24x7.' },
              { icon: <MapPin className="w-6 h-6 text-rose-400" />, title: 'Safe Parking Space', desc: 'Spacious dedicated parking for bicycles and two-wheelers.' },
              { icon: <Star className="w-6 h-6 text-yellow-400" />, title: 'Magazines & Papers', desc: 'Daily news dailies and monthly competitive books provided.' }
            ].map((facility, index) => (
              <div key={index} className="glass-card p-6 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all group hover:-translate-y-1">
                <div className="p-3 bg-white/5 rounded-xl inline-block mb-4 group-hover:bg-indigo-500/10 transition-colors">
                  {facility.icon}
                </div>
                <h3 className="font-bold text-base mb-2">{facility.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{facility.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Membership Plans Section */}
      <section id="plans" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 Scroll-mt-20">
        <div className="text-center space-y-4">
          <div className="text-xs font-bold tracking-widest text-indigo-500 uppercase">Pricing Options</div>
          <h2 className="text-3xl font-extrabold tracking-tight">Flexible Membership Passes</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">Choose from our daily access pass to yearly permanent memberships.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {membershipPlans.map((plan) => (
            <div key={plan.id} className="glass-card rounded-2xl border border-white/5 hover:border-indigo-500/40 transition-all flex flex-col justify-between overflow-hidden relative group">
              {/* Yearly plan highlight badge */}
              {plan.name.includes('Yearly') && (
                <span className="absolute top-3 right-3 bg-indigo-600 text-[10px] text-white font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-full">
                  Best Value
                </span>
              )}
              
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <h3 className="font-extrabold text-xl">{plan.name}</h3>
                  <p className="text-xs text-slate-400">Duration: {plan.duration}</p>
                </div>
                
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold">₹{plan.price}</span>
                  <span className="text-xs text-slate-500">/ pass</span>
                </div>

                <hr className="border-white/10" />

                <ul className="space-y-3 text-xs text-slate-300">
                  {plan.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-8 pt-0 mt-auto">
                <button
                  onClick={() => handleBookNow(plan)}
                  className="w-full text-center py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-indigo-600/10 group-hover:scale-[1.02]"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Image Gallery Section */}
      <section className="bg-slate-900/30 py-20 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-4">
            <div className="text-xs font-bold tracking-widest text-indigo-500 uppercase">Visual Tour</div>
            <h2 className="text-3xl font-extrabold tracking-tight">Our Study Space Gallery</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm">Browse high quality snapshots of our reading rooms, study cabins, and reception space.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galleryImages.map((image, index) => (
              <div
                key={index}
                onClick={() => setLightboxImage(image)}
                className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 cursor-pointer group shadow-lg"
              >
                <img
                  src={image}
                  alt={`Library Spot ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Lightbox Preview Overlay */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button className="absolute top-4 right-4 text-white hover:text-slate-300 p-2 text-xl font-bold">✕</button>
          <div className="max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/10" onClick={e => e.stopPropagation()}>
            <img src={lightboxImage} alt="Lightbox Preview" className="max-w-full max-h-[80vh] object-contain" />
          </div>
        </div>
      )}

      {/* 7. Student Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4">
          <div className="text-xs font-bold tracking-widest text-indigo-500 uppercase">Student Success</div>
          <h2 className="text-3xl font-extrabold tracking-tight">What Our Students Say</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">Read real reviews submitted by aspirants who secured exams reading at our halls.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.slice(0, 3).map((review, index) => (
            <div key={index} className="glass-card p-8 rounded-2xl border border-white/5 relative flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex gap-1 text-yellow-500">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-slate-300 text-xs italic leading-relaxed">
                  "{review.comment}"
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-white/10">
                <h4 className="font-bold text-sm text-white">{review.student?.name || 'Anonymous Aspirant'}</h4>
                <span className="text-[10px] text-indigo-400 font-semibold tracking-widest uppercase">Verified Student</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. FAQ Accordions */}
      <section id="faqs" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 scroll-mt-20">
        <div className="text-center space-y-4">
          <div className="text-xs font-bold tracking-widest text-indigo-500 uppercase">Common Doubts</div>
          <h2 className="text-3xl font-extrabold tracking-tight">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => handleFaqToggle(index)}
                className="w-full px-6 py-4 flex items-center justify-between font-bold text-sm text-left hover:bg-white/5 transition-colors"
              >
                <span>{faq.q}</span>
                {openFaq === index ? <ChevronUp className="w-4 h-4 text-indigo-400" /> : <ChevronDown className="w-4 h-4 text-indigo-400" />}
              </button>
              
              {openFaq === index && (
                <div className="px-6 pb-5 pt-1 text-xs leading-relaxed text-slate-400 border-t border-white/5 animate-fade-in-up">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 9. Rules Section */}
      <section id="rules" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-20">
        <div className="text-center space-y-4">
          <div className="text-xs font-bold tracking-widest text-rose-500 uppercase">Important Rules</div>
          <h2 className="text-3xl font-extrabold tracking-tight">Library Rules & Regulations</h2>
          <p className="text-slate-400 text-sm">Please adhere to the guidelines to maintain a healthy study environment.</p>
        </div>

        <div className="bg-slate-900 border border-rose-500/10 rounded-2xl p-8 space-y-4 leading-relaxed text-xs text-slate-300">
          <p>1. <strong>Maintain Complete Silence</strong> inside the reading hall. Discussions, calls, or group talks must take place outside.</p>
          <p>2. Keep mobile phones in <strong>Silent Mode</strong> at all times. Use headphones when playing reference videos or lectures.</p>
          <p>3. Do not reserve/block open seats with books if leaving for more than 30 minutes.</p>
          <p>4. <strong>Study Cabins Rules</strong>: Maximum booking limit is 8 hours/day per student. Cancel the booking if not attending.</p>
          <p>5. CCTV cameras are active. Strict action will be taken in case of any misconduct.</p>
        </div>
      </section>

      {/* 10. Contact Section & Maps */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Contact Details & Links */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="text-xs font-bold tracking-widest text-indigo-500 uppercase">Get In Touch</div>
              <h2 className="text-3xl font-extrabold tracking-tight">Drop Us a Message</h2>
              <p className="text-slate-400 text-xs leading-relaxed">
                Have questions about pricing, seat occupancy, or cabins? Write to us, dial directly, or message us on WhatsApp.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-4 p-4 bg-slate-900/60 border border-white/5 rounded-2xl">
                <Phone className="w-5 h-5 text-indigo-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-400 mb-0.5">Call Us Directly</h4>
                  <a href={`tel:${settings.contactNumber}`} className="text-sm font-semibold hover:text-indigo-400 transition-colors">
                    +91 {settings.contactNumber}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-900/60 border border-white/5 rounded-2xl">
                <MessageSquare className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-400 mb-0.5">WhatsApp Inquiry</h4>
                  <button onClick={openWhatsApp} className="text-sm font-semibold text-emerald-400 hover:underline text-left">
                    Chat with Admin Mr. Mritunjay
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-900/60 border border-white/5 rounded-2xl">
                <Mail className="w-5 h-5 text-indigo-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-400 mb-0.5">Email Support</h4>
                  <a href={`mailto:${settings.email}`} className="text-sm font-semibold hover:text-indigo-400 transition-colors truncate block max-w-[250px]">
                    {settings.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-slate-900/60 border border-white/5 rounded-2xl">
                <MapPin className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-400 mb-0.5">Location Address</h4>
                  <p className="text-slate-300 leading-normal">
                    Janki-Lalan Commercial Building, Khatangi Kothi, Gaya-Fatehpur State Highway, Bihar.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Message Form */}
          <div className="lg:col-span-7 glass-card p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>

            <form onSubmit={handleContactSubmit} className="space-y-6 relative z-10 text-xs">
              <h3 className="font-extrabold text-lg text-white mb-2">Send Inquiry Form</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-slate-400 font-semibold">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter name"
                    value={contactForm.name}
                    onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-slate-400 font-semibold">Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter email (optional)"
                    value={contactForm.email}
                    onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-slate-400 font-semibold">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter 10-digit number"
                    value={contactForm.phone}
                    onChange={e => setContactForm({ ...contactForm, phone: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-slate-400 font-semibold">Study Timing / Pass Preference</label>
                  <select
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:border-indigo-500 transition-all text-xs"
                    value={contactForm.message.split(' | ')[0] || ''}
                    onChange={e => setContactForm({ ...contactForm, message: `${e.target.value} | Msg: ${contactForm.message.split(' | ')[1] || ''}` })}
                  >
                    <option value="">Select Plan Preference</option>
                    <option value="Daily Pass">Daily Pass</option>
                    <option value="Monthly Pass">Monthly Pass</option>
                    <option value="Yearly Pass">Yearly Pass</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-slate-400 font-semibold">Your Message *</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Enter details of your inquiry"
                  value={contactForm.message.includes(' | Msg: ') ? contactForm.message.split(' | Msg: ')[1] : contactForm.message}
                  onChange={e => {
                    const prefix = contactForm.message.includes(' | Msg: ') ? contactForm.message.split(' | Msg: ')[0] + ' | Msg: ' : '';
                    setContactForm({ ...contactForm, message: prefix + e.target.value });
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all text-xs resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-600/10"
              >
                {submitting ? 'Sending Message...' : 'Send Inquiry Message'}
              </button>
            </form>
          </div>
        </div>

        {/* 11. Google Maps Location */}
        <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl h-80 w-full relative">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115637.38287754593!2d84.92095039328227!3d24.79589311099684!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f32a67e2b7e5bf%3A0xe1043329f6de35c4!2sGaya%2C%20Bihar!5e0!3m2!1sen!2sin!4v1719400000000!5m2!1sen!2sin"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="The Study Point Library Gaya Map Location"
          ></iframe>
        </div>
      </section>
    </div>
  );
}
