import React, { useEffect, useState } from 'react';
import { Clock, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const ExpiryPopup: React.FC = () => {
  const { user } = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const [timeLeftStr, setTimeLeftStr] = useState('');

  useEffect(() => {
    if (!user || !user.subscriptionExpiry) return;

    const checkExpiry = () => {
      const now = new Date();
      const expiry = new Date(user.subscriptionExpiry!);
      
      const diffMs = expiry.getTime() - now.getTime();
      
      // If expired, or diff is more than 1 hour (3600000 ms), don't show
      if (diffMs <= 0 || diffMs > 3600000) {
        setShowPopup(false);
        return;
      }

      // Less than 1 hour remaining
      const minutes = Math.floor(diffMs / 60000);
      setTimeLeftStr(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
      setShowPopup(true);
    };

    checkExpiry();
    const interval = setInterval(checkExpiry, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [user]);

  if (!showPopup) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
      <div className="bg-white border-2 border-red-500 rounded-xl shadow-xl p-4 w-80 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
        <button 
          onClick={() => setShowPopup(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <X size={16} />
        </button>
        
        <div className="flex items-start gap-3 mt-1">
          <div className="p-2 bg-red-50 rounded-lg shrink-0">
            <Clock className="text-[#6fa3a0]" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Plan Expiring Soon</h3>
            <p className="text-sm text-gray-600 mt-1 leading-snug">
              Your <span className="font-semibold">{user?.subscriptionPlan}</span> plan expires in {timeLeftStr}. Please renew to avoid interruption.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
