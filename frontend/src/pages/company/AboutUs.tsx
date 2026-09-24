import { Link } from 'react-router-dom';
import { Activity, ArrowLeft } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-[#F1F5F3] text-[#202828] selection:bg-[#164A4A] selection:text-black">
      <nav className="border-b border-[#D3DFDA] bg-[#FFFFFF]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-[#164A4A] rounded-sm flex items-center justify-center">
              <Activity className="text-black" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#164A4A]">AI GYM</span>
          </Link>
          <Link to="/" className="text-sm font-medium text-[#455250] hover:text-[#164A4A] flex items-center space-x-2">
            <ArrowLeft size={16} /> <span>Back to Home</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <span className="text-[#164A4A] text-sm font-bold uppercase tracking-wider mb-4 block">Our Story</span>
        <h1 className="text-4xl md:text-5xl font-bold mb-8">About AI GYM</h1>
        <div className="space-y-6 text-[#455250] text-lg leading-relaxed">
          <p>
            Welcome to AI GYM, where the future of fitness meets human expertise. Founded in 2026, our mission is to democratize elite-level fitness coaching by combining cutting-edge artificial intelligence with the personalized touch of human trainers.
          </p>
          <p>
            We realized that most gym-goers struggle with consistency, nutrition, and programming because hiring a full-time personal trainer is expensive, and generic workout plans rarely work. That's why we built the AI GYM ecosystem.
          </p>
          <p>
            Our proprietary AI analyzes your body type, goals, schedule, and progress to generate dynamic workout and meal plans that evolve with you. But we didn't stop there. We built a platform that connects you with human professionals and top-tier local gyms, creating a seamless, all-in-one fitness experience.
          </p>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#D3DFDA]">
            <h3 className="text-[#202828] font-bold text-xl mb-2">100k+</h3>
            <p className="text-[#455250] text-sm">Active Members worldwide</p>
          </div>
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#D3DFDA]">
            <h3 className="text-[#202828] font-bold text-xl mb-2">5,000+</h3>
            <p className="text-[#455250] text-sm">Certified Trainers</p>
          </div>
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#D3DFDA]">
            <h3 className="text-[#202828] font-bold text-xl mb-2">1M+</h3>
            <p className="text-[#455250] text-sm">AI Plans Generated</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AboutUs;
