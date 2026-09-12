import { Link } from 'react-router-dom';
import { Activity, ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
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
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-[#475569] mb-12">Last updated: September 5, 2026</p>

        <div className="space-y-8 text-[#475569] leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-[#1E293B] mb-4">1. Information We Collect</h2>
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
            <h2 className="text-2xl font-semibold text-[#1E293B] mb-4">2. How We Use Your Information</h2>
            <p className="mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, maintain, and improve our AI fitness coaching services.</li>
              <li>Generate personalized workout and diet plans.</li>
              <li>Process transactions and send related information such as confirmations and receipts.</li>
              <li>Respond to your comments, questions, and provide customer service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#1E293B] mb-4">3. Data Security</h2>
            <p>
              We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction. All sensitive data, including passwords and health metrics, are encrypted in transit and at rest.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#1E293B] mb-4">4. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@aigym.com" className="text-[#16A34A] hover:underline">privacy@aigym.com</a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
