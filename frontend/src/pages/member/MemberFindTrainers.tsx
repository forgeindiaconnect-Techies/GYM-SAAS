import { useState, useEffect } from 'react';
import { getDb } from '../../utils/mockDb';
import { Search, Star, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const MemberFindTrainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Only show active trainers
    setTrainers(getDb('trainers').filter(t => t.status === 'Active'));
  }, []);

  const filtered = trainers.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.spec?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">Find Trainers</h1>
          <p className="text-[#475569] mt-1">Discover expert trainers at your gym and book a session.</p>
        </div>
        <div className="relative w-full md:w-64">
          <input 
            type="text" 
            placeholder="Search by name or spec..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl pl-10 pr-4 py-2 text-[#1E293B] focus:border-[#16A34A] focus:ring-1 focus:ring-[#EF4444] transition-all"
          />
          <Search className="absolute left-3 top-2.5 text-[#475569]" size={18} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(trainer => (
          <div key={trainer.id} className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6 hover:border-[#16A34A]/50 transition-colors flex flex-col h-full">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-[#FFFFFF] rounded-full flex items-center justify-center text-xl font-bold text-[#16A34A] border border-[#CCFBF1]">
                {trainer.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#1E293B]">{trainer.name}</h3>
                <p className="text-sm text-[#16A34A] font-medium">{trainer.spec || 'General Fitness'}</p>
                <div className="flex items-center space-x-1 mt-1 text-[#475569] text-xs">
                  <Star size={12} className="text-yellow-500 fill-yellow-500" />
                  <span>4.8 (24 reviews)</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-[#CCFBF1] space-y-2 text-sm text-[#475569] flex-1">
              <p><span className="text-[#1E293B]">Experience:</span> {trainer.experience || '5+ years'}</p>
              <p><span className="text-[#1E293B]">Availability:</span> Mon-Fri</p>
            </div>
            
            <div className="mt-6 flex gap-3">
              <Link to="/member/book-session" className="flex-1 flex justify-center items-center space-x-2 py-2 bg-[#16A34A] text-white rounded-xl font-semibold hover:bg-[#15803D] transition-colors">
                <Calendar size={16} />
                <span>Book Session</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      {filtered.length === 0 && (
        <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-12 text-center">
          <p className="text-[#475569] text-lg">No trainers found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default MemberFindTrainers;
