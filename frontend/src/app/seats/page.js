'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { ArrowLeft, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function SeatsPage() {
  const { settings, refreshUserData, showToast } = useApp();

  const totalSeats = settings.totalSeats;
  const occupiedSeats = settings.occupiedSeats;
  const availableSeats = Math.max(0, totalSeats - occupiedSeats);

  const handleRefresh = () => {
    refreshUserData();
    showToast('Seat availability refreshed.', 'success');
  };

  // Generate seat array representation
  const seatsArray = [];
  for (let i = 1; i <= totalSeats; i++) {
    // Distribute occupied seats reasonably
    const isOccupied = i <= occupiedSeats;
    seatsArray.push({
      seatNumber: i,
      isOccupied
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 min-h-[75vh]">
      
      {/* Back button */}
      <div className="flex justify-between items-center">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-white/10 hover:bg-slate-800 text-xs text-slate-300 hover:text-white rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Availability</span>
        </button>
      </div>

      {/* Main Header Card */}
      <div className="glass-card p-8 rounded-3xl border border-white/5 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="space-y-2">
          <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase">Live Seat Status</span>
          <h1 className="text-3xl font-extrabold tracking-tight">Reading Hall Seating Chart</h1>
          <p className="text-slate-400 text-xs">Real-time seat occupancy count inside {settings.libraryName}.</p>
        </div>

        {/* Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-center">
          <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Total Hall Seats</span>
            <span className="text-4xl font-black text-white">{totalSeats}</span>
          </div>

          <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-col justify-center items-center">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold uppercase tracking-wider mb-1">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Available</span>
            </div>
            <span className="text-4xl font-black text-emerald-400">{availableSeats}</span>
          </div>

          <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex flex-col justify-center items-center">
            <div className="flex items-center gap-1.5 text-xs text-rose-400 font-bold uppercase tracking-wider mb-1">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>Occupied</span>
            </div>
            <span className="text-4xl font-black text-rose-400">{occupiedSeats}</span>
          </div>
        </div>
      </div>

      {/* Visual seat layout grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm">Visual Seating Arrangement</h3>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-emerald-500/20 border border-emerald-500/40 rounded"></span>
              <span className="text-slate-400 text-[10px] font-semibold">Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-rose-500/20 border border-rose-500/40 rounded"></span>
              <span className="text-slate-400 text-[10px] font-semibold">Occupied</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-8 rounded-3xl border border-white/5">
          <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-10 gap-3">
            {seatsArray.map((seat) => (
              <div
                key={seat.seatNumber}
                className={`py-3 rounded-lg border text-center font-bold text-xs transition-all relative group select-none
                  ${seat.isOccupied
                    ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                    : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  }
                `}
                title={`Seat ${seat.seatNumber}: ${seat.isOccupied ? 'Occupied' : 'Available'}`}
              >
                <span>{String(seat.seatNumber).padStart(2, '0')}</span>
                <span className={`absolute top-0.5 right-0.5 w-1 h-1 rounded-full ${seat.isOccupied ? 'bg-rose-400' : 'bg-emerald-400'}`}></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6 text-xs text-slate-400 text-center leading-relaxed">
        💡 Seats are occupied dynamically as members check in at the reception desk. Check availability before visiting.
      </div>

    </div>
  );
}
