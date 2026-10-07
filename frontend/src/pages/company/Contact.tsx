import { Link } from 'react-router-dom';
import { Activity, ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';

const Contact = () => {
  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#292524] selection:bg-[#F97316] selection:text-black">
      <nav className="border-b border-[#E7E5E4] bg-[#FFFFFF]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-[#F97316] rounded-sm flex items-center justify-center">
              <Activity className="text-black" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#F97316]">AI GYM</span>
          </Link>
          <Link to="/" className="text-sm font-medium text-[#78716C] hover:text-[#F97316] flex items-center space-x-2">
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

          <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-8">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#78716C] mb-2">First Name</label>
                  <input type="text" className="w-full bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl px-4 py-3 text-[#292524] focus:outline-none focus:border-[#F97316]" placeholder="John" />
                </div>
                <div>
                  <label className="block text-sm text-[#78716C] mb-2">Last Name</label>
                  <input type="text" className="w-full bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl px-4 py-3 text-[#292524] focus:outline-none focus:border-[#F97316]" placeholder="Doe" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-[#78716C] mb-2">Email Address</label>
                <input type="email" className="w-full bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl px-4 py-3 text-[#292524] focus:outline-none focus:border-[#F97316]" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm text-[#78716C] mb-2">Message</label>
                <textarea rows={4} className="w-full bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl px-4 py-3 text-[#292524] focus:outline-none focus:border-[#F97316] resize-none" placeholder="How can we help you?"></textarea>
              </div>
              <button className="w-full py-4 bg-[#F97316] text-[#292524] font-bold rounded-xl hover:bg-[#EA580C] transition-colors">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;
