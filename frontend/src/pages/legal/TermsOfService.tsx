import { Link } from 'react-router-dom';
import { Activity, ArrowLeft } from 'lucide-react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-[#F0FDFA] text-[#1E293B] selection:bg-[#16A34A] selection:text-black">
      <nav className="border-b border-[#CCFBF1] bg-[#FFFFFF]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-[#16A34A] rounded-sm flex items-center justify-center">
              <Activity className="text-black" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#16A34A]">AI GYM</span>
          </Link>
          <Link to="/" className="text-sm font-medium text-[#475569] hover:text-[#16A34A] flex items-center space-x-2">
            <ArrowLeft size={16} /> <span>Back to Home</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-[#475569] mb-12">Last updated: September 5, 2026</p>

        <div className="space-y-8 text-[#475569] leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-[#1E293B] mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing or using AI GYM, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#1E293B] mb-4">2. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are and will remain the exclusive property of AI GYM and its licensors. Our AI-generated plans are for personal use only and may not be distributed commercially.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#1E293B] mb-4">3. Medical Disclaimer</h2>
            <p>
              AI GYM provides fitness and nutritional information for educational purposes only. You should not rely on this information as a substitute for, nor does it replace, professional medical advice, diagnosis, or treatment. If you have any concerns or questions about your health, you should always consult with a physician or other health-care professional.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#1E293B] mb-4">4. Subscriptions</h2>
            <p>
              Some parts of the Service are billed on a subscription basis ("Subscriptions"). You will be billed in advance on a recurring and periodic basis (such as daily, weekly, monthly, or annually).
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default TermsOfService;
