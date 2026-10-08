import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowLeft, Mail, Phone, MapPin, CheckCircle2, AlertCircle, Loader2, Send } from 'lucide-react';
import api from '../../utils/api';

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.message.trim()) {
      setErrorMessage('Please provide both your email address and message.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const response = await api.post('/enquiries/contact', {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        message: formData.message.trim()
      });

      if (response.data && response.data.success) {
        setIsSuccess(true);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          message: ''
        });
      } else {
        setErrorMessage(response.data?.message || 'Failed to send message. Please try again.');
      }
    } catch (err: any) {
      console.error('Contact submission error:', err);
      const msg = err.response?.data?.message || 'Unable to send message. Please check your connection and try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#292524] selection:bg-[#F97316] selection:text-black">
      <nav className="border-b border-[#E7E5E4] bg-[#FFFFFF]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-[#F97316] rounded-sm flex items-center justify-center group-hover:scale-105 transition-transform">
              <Activity className="text-black" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#F97316]">AI GYM</span>
          </Link>
          <Link to="/" className="text-sm font-medium text-[#78716C] hover:text-[#F97316] flex items-center space-x-2 transition-colors">
            <ArrowLeft size={16} /> <span>Back to Home</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <span className="text-[#F97316] text-sm font-bold uppercase tracking-wider mb-4 block">Get In Touch</span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
            <p className="text-[#78716C] text-lg mb-10 leading-relaxed">
              Have questions about our AI fitness platform, your subscription, or looking to partner your gym with us? Send us a message and we'll respond within 24 hours.
            </p>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#FED7AA] rounded-full flex items-center justify-center">
                  <Mail size={20} className="text-[#F97316]" />
                </div>
                <div>
                  <p className="text-[#78716C] text-sm">Email</p>
                  <p className="font-semibold text-lg">support@aigym.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#FED7AA] rounded-full flex items-center justify-center">
                  <Phone size={20} className="text-[#F97316]" />
                </div>
                <div>
                  <p className="text-[#78716C] text-sm">Phone</p>
                  <p className="font-semibold text-lg">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#FED7AA] rounded-full flex items-center justify-center">
                  <MapPin size={20} className="text-[#F97316]" />
                </div>
                <div>
                  <p className="text-[#78716C] text-sm">Office</p>
                  <p className="font-semibold text-lg">123 Fitness Blvd, NY 10001</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-8 shadow-sm">
            {isSuccess ? (
              <div className="py-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-[#FED7AA] rounded-2xl flex items-center justify-center mb-6 text-[#F97316]">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-2xl font-bold text-[#292524] mb-3">Message Sent Successfully!</h3>
                <p className="text-[#78716C] text-base max-w-sm mb-8 leading-relaxed">
                  Thank you for reaching out. Your enquiry has been received and instant notifications have been sent to our gym owners and superadmin team.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSuccess(false)}
                  className="px-6 py-3 bg-[#F97316] text-[#292524] font-bold rounded-xl hover:bg-[#EA580C] transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                {errorMessage && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start space-x-3">
                    <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#78716C] mb-2 font-medium">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl px-4 py-3 text-[#292524] focus:outline-none focus:border-[#F97316] transition-colors"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#78716C] mb-2 font-medium">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl px-4 py-3 text-[#292524] focus:outline-none focus:border-[#F97316] transition-colors"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-[#78716C] mb-2 font-medium">
                    Email Address <span className="text-[#F97316]">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl px-4 py-3 text-[#292524] focus:outline-none focus:border-[#F97316] transition-colors"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#78716C] mb-2 font-medium">
                    Message <span className="text-[#F97316]">*</span>
                  </label>
                  <textarea
                    rows={4}
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl px-4 py-3 text-[#292524] focus:outline-none focus:border-[#F97316] transition-colors resize-none"
                    placeholder="How can we help you?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#F97316] text-[#292524] font-bold rounded-xl hover:bg-[#EA580C] transition-colors flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;
