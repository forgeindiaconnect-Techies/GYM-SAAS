import { Link, useNavigate } from 'react-router-dom';
import { Activity, ArrowLeft } from 'lucide-react';

const TermsOfService = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else if (window.opener) {
      window.close();
      // fallback in case window.close() is blocked
      setTimeout(() => navigate('/'), 100);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3EE] text-[#202522] selection:bg-[#34483F] selection:text-black">
      <nav className="border-b border-[#DCD9CD] bg-[#FFFFFF]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-[#34483F] rounded-sm flex items-center justify-center">
              <Activity className="text-black" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#34483F]">AI GYM</span>
          </Link>
          <button onClick={handleBack} className="text-sm font-medium text-[#4A514D] hover:text-[#34483F] flex items-center space-x-2">
            <ArrowLeft size={16} /> <span>Back</span>
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-[#4A514D] mb-12">Last updated: September 5, 2026</p>

        <div className="space-y-8 text-[#4A514D] leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-[#202522] mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing or using AI GYM, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#202522] mb-4">2. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are and will remain the exclusive property of AI GYM and its licensors. Our AI-generated plans are for personal use only and may not be distributed commercially.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#202522] mb-4">3. Medical Disclaimer</h2>
            <p>
              AI GYM provides fitness and nutritional information for educational purposes only. You should not rely on this information as a substitute for, nor does it replace, professional medical advice, diagnosis, or treatment. If you have any concerns or questions about your health, you should always consult with a physician or other health-care professional.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#202522] mb-4">4. Subscriptions</h2>
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
