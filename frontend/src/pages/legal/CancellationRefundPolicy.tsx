import { useNavigate, useLocation } from 'react-router-dom';
import { Activity, ArrowLeft, RefreshCw, Clock, AlertCircle, CheckCircle, FileText, Phone } from 'lucide-react';

const CancellationRefundPolicy = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const returnPath: string = (location.state as any)?.from ?? '/';
  const returnLabel: string = (location.state as any)?.fromLabel ?? 'Back';

  const handleBack = () => {
    if ((location.state as any)?.from) {
      navigate(returnPath);
    } else if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const Section = ({
    icon: Icon,
    title,
    children,
  }: {
    icon: React.ElementType;
    title: string;
    children: React.ReactNode;
  }) => (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 bg-[#B76E79]/10 rounded-xl flex items-center justify-center text-[#B76E79] shrink-0">
          <Icon size={18} />
        </div>
        <h2 className="text-lg font-bold text-[#292524]">{title}</h2>
      </div>
      <div className="pl-12">{children}</div>
    </section>
  );

  const P = ({ children }: { children: React.ReactNode }) => (
    <p className="text-sm text-[#57534E] leading-relaxed mb-3">{children}</p>
  );

  const Li = ({ children }: { children: React.ReactNode }) => (
    <li className="flex items-start gap-2 text-sm text-[#57534E] leading-relaxed mb-2">
      <CheckCircle size={14} className="text-[#B76E79] shrink-0 mt-0.5" />
      <span>{children}</span>
    </li>
  );

  const Note = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-start gap-3 p-4 bg-[#FFFFFF] border border-[#B76E79]/20 rounded-xl mb-4">
      <AlertCircle size={16} className="text-[#B76E79] shrink-0 mt-0.5" />
      <p className="text-sm text-[#57534E] leading-relaxed">{children}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F3E8E8] text-[#292524] selection:bg-[#B76E79] selection:text-[#292524]">
      {/* Nav */}
      <nav className="border-b border-[#E7DADD] bg-[#F3E8E8]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#B76E79] to-[#9F5965] rounded-lg flex items-center justify-center">
              <Activity className="text-[#FFFFFF]" size={16} strokeWidth={2.5} />
            </div>
            <span className="text-lg font-black tracking-tight text-[#292524]">Gymora</span>
          </div>
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#B76E79] hover:bg-[#9F5965] text-white font-bold text-xs sm:text-sm rounded-full transition-all shadow-md cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>{returnLabel}</span>
          </button>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-b from-[#FFFFFF] to-[#F3E8E8] border-b border-[#E7DADD]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="w-14 h-14 bg-[#B76E79]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#B76E79]/20">
            <RefreshCw size={28} className="text-[#B76E79]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#292524] mb-2">
            Cancellation &amp; Refund Policy
          </h1>
          <p className="text-sm text-[#57534E] max-w-xl mx-auto">
            This policy explains your cancellation rights, refund eligibility, and the process for requesting a refund on Gymora.
          </p>
          <p className="text-xs text-[#E7DADD] mt-3">
            Last updated: October 2026 &nbsp;·&nbsp; Draft — subject to final review before publication
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Note>
          This policy is a draft prepared for review. Final cancellation timelines, refund amounts,
          and processing procedures are subject to confirmation by the Gymora operations team before
          publication. Do not rely on this document as a legally binding commitment until it has been
          formally approved and published.
        </Note>

        <Section icon={FileText} title="1. Scope of This Policy">
          <P>
            This Cancellation &amp; Refund Policy applies to purchases made through the Gymora platform,
            including gym membership subscriptions, trainer session bookings, and store orders placed
            by customers. It does not apply to the Gymora SaaS subscription purchased by gym owners,
            which is governed by a separate agreement.
          </P>
        </Section>

        <Section icon={RefreshCw} title="2. Gym Membership Cancellations">
          <P>
            Gym memberships on Gymora are managed on a per-gym basis. Each gym may configure its own
            cancellation terms within the bounds of this platform policy.
          </P>
          <ul className="space-y-1 mb-4">
            <Li>
              Customers may request membership cancellation by contacting their gym directly or
              submitting a support request through Gymora Help &amp; Support.
            </Li>
            <Li>
              Cancellations requested within 24 hours of purchase and before any gym access has
              been used may be eligible for a full refund, subject to gym approval.
            </Li>
            <Li>
              Cancellations requested after the first gym check-in or after 24 hours from purchase
              are subject to the gym's configured partial-refund or no-refund policy.
            </Li>
            <Li>
              Unused days remaining on an active membership at the time of cancellation are not
              automatically refunded unless the gym's policy permits it.
            </Li>
          </ul>
          <Note>
            If your gym has not configured a specific cancellation policy, the platform default
            applies: no refund is issued for memberships cancelled after 24 hours of purchase.
          </Note>
        </Section>

        <Section icon={Clock} title="3. Trainer Session Cancellations">
          <P>
            Session bookings can be cancelled according to the following rules:
          </P>
          <ul className="space-y-1 mb-4">
            <Li>
              Cancellations made more than 24 hours before the scheduled session time are eligible
              for a full refund of the session fee.
            </Li>
            <Li>
              Cancellations made between 6 and 24 hours before the scheduled session are eligible
              for a 50% refund.
            </Li>
            <Li>
              Cancellations made less than 6 hours before the session, or no-shows, are not eligible
              for a refund.
            </Li>
            <Li>
              If a trainer cancels a confirmed session, the customer is entitled to a full refund or
              may reschedule at no extra cost.
            </Li>
          </ul>
          <P>
            To cancel a booking, navigate to Member → Bookings, select the booking, and use the
            cancellation option before the applicable cut-off time.
          </P>
        </Section>

        <Section icon={CheckCircle} title="4. Store Order Cancellations">
          <P>
            Orders placed in the Gymora gym store can be cancelled under the following conditions:
          </P>
          <ul className="space-y-1 mb-4">
            <Li>
              Orders can be cancelled within 1 hour of placement if they have not yet been processed
              or dispatched.
            </Li>
            <Li>
              Once an order has been marked as processed or dispatched, cancellation is no longer
              available through the platform.
            </Li>
            <Li>
              For dispatched orders, customers should contact the gym directly for returns and refunds.
            </Li>
          </ul>
          <P>
            To cancel an order, go to Member → My Orders, select the relevant order, and use the
            Cancel Order action if it is still eligible.
          </P>
        </Section>

        <Section icon={RefreshCw} title="5. Refund Eligibility">
          <P>
            Refunds are processed only for eligible cancellations as described above. The following
            purchases are not eligible for refunds:
          </P>
          <ul className="space-y-1 mb-4">
            <Li>Memberships already used (after at least one gym check-in).</Li>
            <Li>Trainer sessions that have already been completed.</Li>
            <Li>Store orders that have been dispatched or delivered.</Li>
            <Li>Reward points redeemed or vouchers already applied.</Li>
            <Li>Promotional or discounted memberships marked as non-refundable at purchase.</Li>
          </ul>
        </Section>

        <Section icon={Clock} title="6. Refund Processing Timeline">
          <P>
            Once a refund is approved, the amount will be credited as follows:
          </P>
          <ul className="space-y-1 mb-4">
            <Li>
              Online payment refunds (card, UPI, net banking) are processed within 5 to 10 business
              days from the date of approval, subject to the payment gateway's processing time.
            </Li>
            <Li>
              Cash payments refunded in person at the gym are subject to the gym's own payout
              schedule.
            </Li>
            <Li>
              Platform wallet credits (where available) are applied within 1 to 2 business days.
            </Li>
          </ul>
          <Note>
            Gymora is not responsible for delays caused by the customer's bank or payment gateway
            after the refund has been initiated from our end.
          </Note>
        </Section>

        <Section icon={Phone} title="7. How to Request a Refund">
          <P>
            To request a refund:
          </P>
          <ol className="space-y-2 mb-4 list-none">
            {[
              'Log in to your Gymora account.',
              'Navigate to the relevant section: Member → Payments (for membership), Member → Bookings (for sessions), or Member → My Orders (for store orders).',
              'Identify the transaction and check if a cancellation or refund action is available.',
              'If no direct action is available, submit a support request via Help & Support with your transaction reference number.',
              'Our team will review your request and respond within 2 to 3 business days.',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-[#57534E] leading-relaxed">
                <span className="w-6 h-6 rounded-full bg-[#B76E79]/20 text-[#B76E79] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </Section>

        <Section icon={AlertCircle} title="8. Disputes and Escalations">
          <P>
            If you are unsatisfied with the outcome of a refund request, you may escalate the matter
            by contacting Gymora support directly through the Contact Us form. Provide your ticket
            reference number and a description of the dispute.
          </P>
          <P>
            Gymora reserves the right to make the final determination on all refund disputes in
            accordance with this policy.
          </P>
        </Section>

        <Section icon={FileText} title="9. Changes to This Policy">
          <P>
            Gymora may update this policy from time to time. The revised policy will be published on
            this page with an updated effective date. Continued use of the platform after changes
            are published constitutes acceptance of the updated terms.
          </P>
        </Section>

        {/* Back */}
        <div className="mt-12 pt-8 border-t border-[#E7DADD] flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B76E79] hover:bg-[#9F5965] text-white font-bold text-sm transition-all cursor-pointer"
          >
            <ArrowLeft size={16} />
            {returnLabel}
          </button>
          <p className="text-xs text-[#E7DADD]">© 2026 Gymora. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default CancellationRefundPolicy;

