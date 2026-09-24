import { Link } from 'react-router-dom';
import { Activity, ArrowLeft, Briefcase, MapPin, Clock } from 'lucide-react';

const Careers = () => {
  const jobs = [
    { title: 'Senior AI Engineer', dept: 'Engineering', loc: 'Remote', type: 'Full-time' },
    { title: 'Product Manager, Fitness', dept: 'Product', loc: 'New York, NY', type: 'Full-time' },
    { title: 'Full Stack React Developer', dept: 'Engineering', loc: 'Remote', type: 'Full-time' },
    { title: 'Customer Success Specialist', dept: 'Support', loc: 'Austin, TX', type: 'Part-time' },
  ];

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
        <span className="text-[#164A4A] text-sm font-bold uppercase tracking-wider mb-4 block">Join Our Team</span>
        <h1 className="text-4xl md:text-5xl font-bold mb-8">Build the Future of Fitness</h1>
        <p className="text-[#455250] text-lg mb-12">
          We are a fast-growing team of fitness enthusiasts, engineers, and designers. If you are passionate about health and technology, come join us!
        </p>

        <div className="space-y-4">
          {jobs.map((job, idx) => (
            <div key={idx} className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#D3DFDA] hover:border-[#164A4A]/50 transition-colors group flex flex-col md:flex-row md:items-center justify-between cursor-pointer">
              <div>
                <h3 className="text-xl font-bold text-[#202828] mb-2">{job.title}</h3>
                <div className="flex flex-wrap items-center space-x-4 text-sm text-[#455250]">
                  <span className="flex items-center space-x-1"><Briefcase size={14} /> <span>{job.dept}</span></span>
                  <span className="flex items-center space-x-1"><MapPin size={14} /> <span>{job.loc}</span></span>
                  <span className="flex items-center space-x-1"><Clock size={14} /> <span>{job.type}</span></span>
                </div>
              </div>
              <button className="mt-4 md:mt-0 px-5 py-2.5 bg-[#E8E5DA] text-[#202828] font-semibold rounded-lg group-hover:bg-[#164A4A] group-hover:text-black transition-colors">
                Apply Now
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Careers;
