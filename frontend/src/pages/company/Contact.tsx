import { Link } from 'react-router-dom';
import { Activity, ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';

const Contact = () => {
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
          <Link to="/" className="text-sm font-medium text-[#4A514D] hover:text-[#34483F] flex items-center space-x-2">
            <ArrowLeft size={16} /> <span>Back to Home</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <span className="text-[#34483F] text-sm font-bold uppercase tracking-wider mb-4 block">Get In Touch</span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
            <p className="text-[#4A514D] text-lg mb-10 leading-relaxed">
              Have questions about our AI fitness platform, your subscription, or looking to partner your gym with us? Send us a message and we'll respond within 24 hours.
            </p>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#E8E5DA] rounded-full flex items-center justify-center">
                  <Mail size={20} className="text-[#34483F]" />
                </div>
                <div>
                  <p className="text-[#4A514D] text-sm">Email</p>
                  <p className="font-semibold text-lg">support@aigym.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#E8E5DA] rounded-full flex items-center justify-center">
                  <Phone size={20} className="text-[#34483F]" />
                </div>
                <div>
                  <p className="text-[#4A514D] text-sm">Phone</p>
                  <p className="font-semibold text-lg">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#E8E5DA] rounded-full flex items-center justify-center">
                  <MapPin size={20} className="text-[#34483F]" />
                </div>
                <div>
                  <p className="text-[#4A514D] text-sm">Office</p>
                  <p className="font-semibold text-lg">123 Fitness Blvd, NY 10001</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-8">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#4A514D] mb-2">First Name</label>
                  <input type="text" className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-3 text-[#202522] focus:outline-none focus:border-[#34483F]" placeholder="John" />
                </div>
                <div>
                  <label className="block text-sm text-[#4A514D] mb-2">Last Name</label>
                  <input type="text" className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-3 text-[#202522] focus:outline-none focus:border-[#34483F]" placeholder="Doe" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-[#4A514D] mb-2">Email Address</label>
                <input type="email" className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-3 text-[#202522] focus:outline-none focus:border-[#34483F]" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm text-[#4A514D] mb-2">Message</label>
                <textarea rows={4} className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-3 text-[#202522] focus:outline-none focus:border-[#34483F] resize-none" placeholder="How can we help you?"></textarea>
              </div>
              <button className="w-full py-4 bg-[#34483F] text-[#202522] font-bold rounded-xl hover:bg-[#C6A77D] transition-colors">
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
