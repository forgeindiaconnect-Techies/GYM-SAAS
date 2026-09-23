import { Link, useNavigate } from 'react-router-dom';
import { Activity, ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
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
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-[#4A514D] mb-12">Last updated: September 5, 2026</p>

        <div className="space-y-8 text-[#4A514D] leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-[#202522] mb-4">1. Information We Collect</h2>
            <p className="mb-4">
              When you use AI GYM, we collect information you provide directly to us, such as when you create an account, update your profile, or communicate with us. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Name, email address, and contact information.</li>
              <li>Fitness goals, height, weight, and health-related data required for AI plan generation.</li>
              <li>Billing and payment information (processed securely by third-party providers).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#202522] mb-4">2. How We Use Your Information</h2>
            <p className="mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, maintain, and improve our AI fitness coaching services.</li>
              <li>Generate personalized workout and diet plans.</li>
              <li>Process transactions and send related information such as confirmations and receipts.</li>
              <li>Respond to your comments, questions, and provide customer service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#202522] mb-4">3. Data Security</h2>
            <p>
              We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction. All sensitive data, including passwords and health metrics, are encrypted in transit and at rest.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#202522] mb-4">4. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@aigym.com" className="text-[#34483F] hover:underline">privacy@aigym.com</a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
