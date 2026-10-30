import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  MessageSquare,
  Building2,
  Send,
  CheckCircle2,
  Sparkles,
  MapPin,
  Clock,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { TrainerPageLayout } from './TrainerPageLayout';

export const TrainerContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: 'Strength & Conditioning',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate submission without altering backend models
    setSubmitted(true);
  };

  return (
    <TrainerPageLayout>
      <div className="py-16 md:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/trainers"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#64748B] hover:text-[#EA580C] transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          <span>Back to Trainer Landing Page</span>
        </Link>

        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF7ED] border border-[#FFEDD5] text-[#EA580C] text-xs font-semibold mb-4">
            <Mail size={13} />
            <span>Direct Trainer Inquiries</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#111827] tracking-tight mb-4">
            Contact Trainer Support
          </h1>
          <p className="text-base sm:text-lg text-[#64748B] leading-relaxed">
            Have questions about joining as a coach, verifying certifications, or connecting with gym facilities? Reach out to our trainer relations team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Contact Details Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-7">
              <h2 className="text-lg font-bold text-[#111827] mb-5">Trainer Relations Desk</h2>
              
              <div className="space-y-5 text-xs sm:text-sm text-[#64748B]">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#EA580C] shrink-0">
                    <Mail size={16} />
                  </div>
                  <div>
                    <div className="font-bold text-[#111827] text-xs mb-0.5">Trainer Email Inquiries</div>
                    <a href="mailto:trainers@gymora.com" className="text-[#EA580C] hover:underline">
                      trainers@gymora.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#EA580C] shrink-0">
                    <Clock size={16} />
                  </div>
                  <div>
                    <div className="font-bold text-[#111827] text-xs mb-0.5">Support Availability</div>
                    <p className="text-xs">Monday – Saturday, 9:00 AM – 7:00 PM IST</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#EA580C] shrink-0">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <div className="font-bold text-[#111827] text-xs mb-0.5">Credential Verification</div>
                    <p className="text-xs">Turnaround time: 24 to 48 business hours upon document submission.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6 text-xs text-[#64748B]">
              <span className="font-bold text-[#111827] block mb-1">Direct Gym Communication:</span>
              Once approved by a specific partner club, you can also coordinate directly with the gym management through their assigned coordinator.
            </div>
          </div>

          {/* Contact Form Column */}
          <div className="lg:col-span-7">
            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-8 sm:p-9">
              {submitted ? (
                <div className="text-center py-10 animate-fadeIn">
                  <div className="w-16 h-16 rounded-2xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#EA580C] mx-auto mb-4">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-[#111827] mb-2">Inquiry Submitted Successfully</h3>
                  <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto mb-6 leading-relaxed">
                    Thank you for reaching out to Gymora Trainer Support. A representative from our trainer relations team will respond to your registered email shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-2.5 bg-[#F8FAFC] hover:bg-[#FFF7ED] text-xs font-bold text-[#EA580C] border border-[#FFEDD5] rounded-xl"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="text-lg font-bold text-[#111827] mb-4">Send an Inquiry</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#111827] mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Alex Henderson"
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-xs text-[#111827] focus:outline-none focus:border-[#FDBA74]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#111827] mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="alex@example.com"
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-xs text-[#111827] focus:outline-none focus:border-[#FDBA74]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#111827] mb-1.5">
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-xs text-[#111827] focus:outline-none focus:border-[#FDBA74]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#111827] mb-1.5">
                        Primary Specialization
                      </label>
                      <select
                        value={formData.specialization}
                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-xs text-[#111827] focus:outline-none focus:border-[#FDBA74]"
                      >
                        <option value="Strength & Conditioning">Strength & Conditioning</option>
                        <option value="Hypertrophy & Bodybuilding">Hypertrophy & Bodybuilding</option>
                        <option value="Functional & Mobility">Functional & Mobility</option>
                        <option value="Yoga & Pilates">Yoga & Pilates</option>
                        <option value="Rehabilitation & Recovery">Rehabilitation & Recovery</option>
                        <option value="Other">Other / General Fitness</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#111827] mb-1.5">
                      Subject *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g. Question regarding ACE certification accreditation"
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-xs text-[#111827] focus:outline-none focus:border-[#FDBA74]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#111827] mb-1.5">
                      Message *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please describe your inquiry in detail..."
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 text-xs text-[#111827] focus:outline-none focus:border-[#FDBA74]"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-orange-500/15 transition-all cursor-pointer"
                  >
                    <Send size={16} />
                    <span>Submit Inquiry</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </TrainerPageLayout>
  );
};

