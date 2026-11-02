import React, { useState } from 'react';
import { Star, Award, Calendar, Clock, ChevronRight, CheckCircle2, Shield } from 'lucide-react';
import { MobileCard } from '../../../shared/components/MobileCard';
import { MobileModal } from '../../../shared/components/MobileModal';
import { MobileButton } from '../../../shared/components/MobileButton';

interface MarketplaceTrainer {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewsCount: number;
  experience: string;
  hourlyRate: number;
  availableSlot: string;
}

export const CustomerTrainersScreen: React.FC = () => {
  const [selectedTrainer, setSelectedTrainer] = useState<MarketplaceTrainer | null>(null);
  const [bookedSuccess, setBookedSuccess] = useState(false);

  const trainers: MarketplaceTrainer[] = [
    { id: '1', name: 'Vikram Malhotra', specialty: 'Strength & Body Transformation', rating: 4.9, reviewsCount: 128, experience: '6+ yrs', hourlyRate: 800, availableSlot: 'Today, 06:00 PM' },
    { id: '2', name: 'Ananya Deshmukh', specialty: 'Yoga, Posture & Flexibility', rating: 4.8, reviewsCount: 94, experience: '5+ yrs', hourlyRate: 750, availableSlot: 'Tomorrow, 07:30 AM' },
    { id: '3', name: 'Karan Mehra', specialty: 'HIIT & Athletic Conditioning', rating: 4.7, reviewsCount: 110, experience: '4+ yrs', hourlyRate: 700, availableSlot: 'Today, 04:30 PM' },
    { id: '4', name: 'Rohit Verma', specialty: 'Bodybuilding & Powerlifting', rating: 4.9, reviewsCount: 156, experience: '8+ yrs', hourlyRate: 900, availableSlot: 'Wednesday, 05:00 PM' }
  ];

  const handleConfirmBooking = () => {
    setBookedSuccess(true);
    setTimeout(() => {
      setBookedSuccess(false);
      setSelectedTrainer(null);
    }, 1800);
  };

  return (
    <div className="space-y-4 pb-6">
      <div className="bg-gradient-to-r from-orange-600 to-amber-500 rounded-2xl p-4 text-white shadow-md">
        <h2 className="text-base font-bold">1-on-1 Elite Trainers</h2>
        <p className="text-xs text-orange-100 mt-0.5">Book certified coaches for personalized guidance</p>
      </div>

      <div className="space-y-3">
        {trainers.map(t => (
          <MobileCard key={t.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-700 font-bold text-base flex items-center justify-center border border-orange-200">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{t.name}</h3>
                  <p className="text-xs text-orange-600 font-semibold">{t.specialty}</p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                    <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {t.rating}
                    </span>
                    <span>• {t.reviewsCount} reviews</span>
                    <span>• {t.experience}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">Rate per session</span>
                <span className="text-xs font-bold text-slate-900">₹{t.hourlyRate}</span>
              </div>
              <button 
                onClick={() => setSelectedTrainer(t)}
                className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-600/20 active:scale-95 transition-all"
              >
                Book Session
              </button>
            </div>
          </MobileCard>
        ))}
      </div>

      {/* Booking Modal */}
      <MobileModal 
        isOpen={!!selectedTrainer} 
        onClose={() => setSelectedTrainer(null)} 
        title="Confirm Training Session"
      >
        {selectedTrainer && (
          <div className="space-y-4">
            {bookedSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Session Confirmed!</h3>
                <p className="text-xs text-slate-500">
                  You are booked with {selectedTrainer.name} for {selectedTrainer.availableSlot}.
                </p>
              </div>
            ) : (
              <>
                <div className="p-3 bg-orange-50 rounded-xl border border-orange-200">
                  <p className="text-xs font-bold text-slate-900">{selectedTrainer.name}</p>
                  <p className="text-[11px] text-orange-600">{selectedTrainer.specialty}</p>
                  <p className="text-[11px] text-slate-600 mt-1">Slot: <strong>{selectedTrainer.availableSlot}</strong></p>
                </div>
                <div className="flex justify-between text-xs py-2 border-y border-slate-100">
                  <span className="text-slate-500">Session Fee</span>
                  <span className="font-bold text-slate-900">₹{selectedTrainer.hourlyRate}</span>
                </div>
                <div className="flex gap-2">
                  <MobileButton variant="secondary" onClick={() => setSelectedTrainer(null)}>
                    Cancel
                  </MobileButton>
                  <MobileButton variant="primary" onClick={handleConfirmBooking}>
                    Pay & Confirm
                  </MobileButton>
                </div>
              </>
            )}
          </div>
        )}
      </MobileModal>
    </div>
  );
};
export default CustomerTrainersScreen;

