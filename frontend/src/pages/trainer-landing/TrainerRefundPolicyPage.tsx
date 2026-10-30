import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import { TrainerPageLayout } from './TrainerPageLayout';

export const TrainerRefundPolicyPage: React.FC = () => {
  return (
    <TrainerPageLayout>
      <div className="py-16 md:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/trainers"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#57534E] hover:text-[#B76E79] transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          <span>Back to Trainer Landing Page</span>
        </Link>

        {/* Header */}
        <div className="mb-10 pb-6 border-b border-[#E7DADD]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B76E79]/10 border border-[#B76E79]/30 text-[#B76E79] text-xs font-semibold mb-4">
            <RotateCcw size={13} />
            <span>Financial Policies</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#292524] tracking-tight mb-3">
            Trainer Refund & Cancellation Policy
          </h1>
          <p className="text-xs sm:text-sm text-[#57534E]">
            Last Updated: October 2026 • Policy governing session cancellations, fee structures, and disputes
          </p>
        </div>

        {/* Review Notice Alert */}
        <div className="p-5 bg-[#FFFFFF] border border-amber-500/30 rounded-2xl text-xs text-[#57534E] flex items-start gap-3 mb-10">
          <AlertCircle size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[#292524]">Notice for Business Review: </span>
            This policy outlines standard operational frameworks for trainer session scheduling, cancellations, and payout settlements. Specific commercial split terms and cancellation charge windows are established pursuant to individual facility contracts and require review before commercial rollout.
          </div>
        </div>

        <div className="space-y-8 text-xs sm:text-sm text-[#292524] leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-[#292524] mb-3">1. Trainer Registration Fees</h2>
            <p>
              Listing your professional coaching profile and applying to partner gyms on the Gymora platform does not incur recurring software registration charges. As such, no registration refund claims apply.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#292524] mb-3">2. 1-on-1 Coaching Session Cancellations</h2>
            <div className="space-y-3 text-xs text-[#57534E]">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={15} className="text-[#B76E79] shrink-0 mt-0.5" />
                <span><strong className="text-[#292524]">Standard 12-Hour Cancellation Window:</strong> Members cancelling a pre-booked coaching slot at least 12 hours prior to start time are eligible for complimentary rescheduling without penalty.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={15} className="text-[#B76E79] shrink-0 mt-0.5" />
                <span><strong className="text-[#292524]">Late Cancellation / No-Show:</strong> When a member fails to attend without prior notice, the session credit is typically forfeited to compensate the trainer for allocated facility time, subject to gym policy.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={15} className="text-[#B76E79] shrink-0 mt-0.5" />
                <span><strong className="text-[#292524]">Trainer Initiated Rescheduling:</strong> If an instructor is unable to conduct a scheduled session due to illness or emergency, the member must be notified promptly and offered alternative priority booking or credit restoration.</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#292524] mb-3">3. Payout Settlements & Disputes</h2>
            <p>
              Coaching session fee settlements and trainer revenue shares are processed through the respective gym facility’s administration. Any billing discrepancy regarding completed session counts must be lodged within 14 calendar days of month-end reconciliation.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#292524] mb-3">4. Disputed Training Plans</h2>
            <p>
              Digital workout routines delivered via the trainer dashboard are non-physical advisory goods. Once delivered and initiated, plan fees are generally non-refundable unless verified technical delivery errors occurred on the platform.
            </p>
          </section>

          <section className="pt-6 border-t border-[#E7DADD]">
            <h2 className="text-lg font-bold text-[#292524] mb-2">5. Need Help with a Cancellation or Settlement?</h2>
            <p className="text-xs text-[#57534E]">
              Please coordinate with your gym’s operations manager or contact our trainer assistance desk at <Link to="/trainers/contact" className="text-[#B76E79] hover:underline">/trainers/contact</Link>.
            </p>
          </section>
        </div>
      </div>
    </TrainerPageLayout>
  );
};

