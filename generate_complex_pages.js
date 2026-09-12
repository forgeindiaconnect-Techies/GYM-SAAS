const fs = require('fs');
const path = require('path');

const writePage = (role, page, content) => {
  const filePath = path.join(__dirname, 'frontend', 'src', 'pages', role, `${page}.tsx`);
  fs.writeFileSync(filePath, content);
  console.log(`Updated: ${filePath}`);
};

const adminTrainersContent = `import React, { useState, useEffect } from 'react';
import { getDb, addItem, deleteItem, updateItem } from '../../../utils/mockDb';
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';

const GymAdminTrainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', spec: '', experience: '', phone: '', email: '', type: 'Full Time' });

  useEffect(() => {
    setTrainers(getDb('trainers'));
  }, []);

  const handleHire = (e) => {
    e.preventDefault();
    const newTrainer = addItem('trainers', { ...formData, status: 'Active' });
    setTrainers([...trainers, newTrainer]);
    setShowForm(false);
    setFormData({ name: '', spec: '', experience: '', phone: '', email: '', type: 'Full Time' });
  };

  const handleToggleStatus = (id, currentStatus) => {
    const updated = updateItem('trainers', id, { status: currentStatus === 'Active' ? 'Inactive' : 'Active' });
    setTrainers(trainers.map(t => t.id === id ? updated : t));
  };

  const handleDelete = (id) => {
    deleteItem('trainers', id);
    setTrainers(trainers.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Trainers</h1>
          <p className="text-[#A1A1AA] mt-1">Manage all trainers hired by this gym.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center space-x-2 px-4 py-2 bg-[#FF3366] text-white rounded-xl font-semibold hover:bg-[#E62E5C] transition-colors">
          <Plus size={20} />
          <span>Hire Trainer</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-[#101010] border border-[#272727] rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Hire New Trainer</h2>
          <form onSubmit={handleHire} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#A1A1AA] mb-1">Name</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#151515] border border-[#272727] rounded-lg px-4 py-2 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#A1A1AA] mb-1">Email</label>
              <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#151515] border border-[#272727] rounded-lg px-4 py-2 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#A1A1AA] mb-1">Specialization</label>
              <input required value={formData.spec} onChange={e => setFormData({...formData, spec: e.target.value})} className="w-full bg-[#151515] border border-[#272727] rounded-lg px-4 py-2 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#A1A1AA] mb-1">Experience</label>
              <input required value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} className="w-full bg-[#151515] border border-[#272727] rounded-lg px-4 py-2 text-white" />
            </div>
            <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-[#A1A1AA] hover:text-white transition-colors">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-[#FF3366] text-white rounded-lg font-semibold hover:bg-[#E62E5C] transition-colors">Hire Trainer</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-[#101010] border border-[#272727] rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm text-[#A1A1AA]">
          <thead className="bg-[#151515] border-b border-[#272727] text-white">
            <tr>
              <th className="px-6 py-4 font-medium">Trainer Info</th>
              <th className="px-6 py-4 font-medium">Specialization</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#272727]">
            {trainers.map(trainer => (
              <tr key={trainer.id} className="hover:bg-[#151515]/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold text-white">{trainer.name}</div>
                  <div className="text-xs">{trainer.email}</div>
                </td>
                <td className="px-6 py-4">{trainer.spec}</td>
                <td className="px-6 py-4">
                  <span className={\`px-2 py-1 rounded-full text-xs font-medium \${trainer.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}\`}>
                    {trainer.status}
                  </span>
                </td>
                <td className="px-6 py-4 flex space-x-3">
                  <button onClick={() => handleToggleStatus(trainer.id, trainer.status)} className="text-[#A1A1AA] hover:text-white" title="Toggle Status">
                    {trainer.status === 'Active' ? <XCircle size={18} /> : <CheckCircle size={18} />}
                  </button>
                  <button onClick={() => handleDelete(trainer.id)} className="text-red-500 hover:text-red-400" title="Delete">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {trainers.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-8 text-center">No trainers found. Hire a trainer to get started.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GymAdminTrainers;
`;

const memberFindTrainersContent = `import React, { useState, useEffect } from 'react';
import { getDb } from '../../../utils/mockDb';
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
          <h1 className="text-3xl font-bold text-white tracking-tight">Find Trainers</h1>
          <p className="text-[#A1A1AA] mt-1">Discover expert trainers at your gym and book a session.</p>
        </div>
        <div className="relative w-full md:w-64">
          <input 
            type="text" 
            placeholder="Search by name or spec..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#101010] border border-[#272727] rounded-xl pl-10 pr-4 py-2 text-white focus:border-[#FF3366] focus:ring-1 focus:ring-[#FF3366] transition-all"
          />
          <Search className="absolute left-3 top-2.5 text-[#A1A1AA]" size={18} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(trainer => (
          <div key={trainer.id} className="bg-[#101010] border border-[#272727] rounded-2xl p-6 hover:border-[#FF3366]/50 transition-colors flex flex-col h-full">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-[#151515] rounded-full flex items-center justify-center text-xl font-bold text-[#FF3366] border border-[#272727]">
                {trainer.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">{trainer.name}</h3>
                <p className="text-sm text-[#FF3366] font-medium">{trainer.spec || 'General Fitness'}</p>
                <div className="flex items-center space-x-1 mt-1 text-[#A1A1AA] text-xs">
                  <Star size={12} className="text-yellow-500 fill-yellow-500" />
                  <span>4.8 (24 reviews)</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-[#272727] space-y-2 text-sm text-[#A1A1AA] flex-1">
              <p><span className="text-white">Experience:</span> {trainer.experience || '5+ years'}</p>
              <p><span className="text-white">Availability:</span> Mon-Fri</p>
            </div>
            
            <div className="mt-6 flex gap-3">
              <Link to="/member/book-session" className="flex-1 flex justify-center items-center space-x-2 py-2 bg-[#FF3366] text-white rounded-xl font-semibold hover:bg-[#E62E5C] transition-colors">
                <Calendar size={16} />
                <span>Book Session</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      {filtered.length === 0 && (
        <div className="bg-[#101010] border border-[#272727] rounded-2xl p-12 text-center">
          <p className="text-[#A1A1AA] text-lg">No trainers found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default MemberFindTrainers;
`;

const memberBookSessionContent = `import React, { useState, useEffect } from 'react';
import { getDb, addItem } from '../../../utils/mockDb';
import { Calendar, Clock, Video, MapPin, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MemberBookSession = () => {
  const [trainers, setTrainers] = useState([]);
  const [formData, setFormData] = useState({ trainerId: '', date: '', time: '', type: 'Offline' });
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setTrainers(getDb('trainers').filter(t => t.status === 'Active'));
  }, []);

  const handleBook = (e) => {
    e.preventDefault();
    if (!formData.trainerId || !formData.date || !formData.time) return;
    
    addItem('bookings', {
      ...formData,
      status: 'Pending',
      memberId: 'currentUser', // Mocked user ID
      createdAt: new Date().toISOString()
    });
    
    setIsSuccess(true);
    setTimeout(() => {
      navigate('/member/bookings');
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <CheckCircle size={64} className="text-green-500" />
        <h2 className="text-2xl font-bold text-white">Booking Confirmed!</h2>
        <p className="text-[#A1A1AA]">Your session request has been sent to the trainer.</p>
        <p className="text-sm text-[#A1A1AA]">Redirecting to your bookings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Book a Session</h1>
        <p className="text-[#A1A1AA] mt-1">Schedule your next training session with an expert.</p>
      </div>

      <form onSubmit={handleBook} className="bg-[#101010] border border-[#272727] rounded-2xl p-6 md:p-8 space-y-6">
        
        {/* Trainer Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-[#A1A1AA]">Select Trainer</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trainers.map(t => (
              <label key={t.id} className={\`flex items-center p-4 border rounded-xl cursor-pointer transition-all \${formData.trainerId === t.id ? 'border-[#FF3366] bg-[#FF3366]/5' : 'border-[#272727] bg-[#151515] hover:border-[#444]'}\`}>
                <input type="radio" name="trainer" value={t.id} checked={formData.trainerId === t.id} onChange={() => setFormData({...formData, trainerId: t.id})} className="hidden" />
                <div className="w-10 h-10 bg-[#272727] rounded-full flex items-center justify-center text-[#FF3366] font-bold mr-3">{t.name.charAt(0)}</div>
                <div>
                  <p className="font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-[#A1A1AA]">{t.spec}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Session Type */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-[#A1A1AA]">Session Type</label>
          <div className="flex space-x-4">
            <label className={\`flex-1 flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all \${formData.type === 'Offline' ? 'border-[#FF3366] bg-[#FF3366]/5 text-[#FF3366]' : 'border-[#272727] bg-[#151515] text-[#A1A1AA] hover:border-[#444]'}\`}>
              <input type="radio" name="type" value="Offline" checked={formData.type === 'Offline'} onChange={() => setFormData({...formData, type: 'Offline'})} className="hidden" />
              <MapPin size={24} className="mb-2" />
              <span className="font-medium">In-Gym</span>
            </label>
            <label className={\`flex-1 flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all \${formData.type === 'Online' ? 'border-[#FF3366] bg-[#FF3366]/5 text-[#FF3366]' : 'border-[#272727] bg-[#151515] text-[#A1A1AA] hover:border-[#444]'}\`}>
              <input type="radio" name="type" value="Online" checked={formData.type === 'Online'} onChange={() => setFormData({...formData, type: 'Online'})} className="hidden" />
              <Video size={24} className="mb-2" />
              <span className="font-medium">Online</span>
            </label>
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-[#A1A1AA] flex items-center gap-2"><Calendar size={16}/> Select Date</label>
            <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} min={new Date().toISOString().split('T')[0]} className="w-full bg-[#151515] border border-[#272727] rounded-xl px-4 py-3 text-white focus:border-[#FF3366] focus:ring-1 focus:ring-[#FF3366] transition-all" />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium text-[#A1A1AA] flex items-center gap-2"><Clock size={16}/> Select Time</label>
            <select required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full bg-[#151515] border border-[#272727] rounded-xl px-4 py-3 text-white focus:border-[#FF3366] focus:ring-1 focus:ring-[#FF3366] transition-all">
              <option value="">Choose a slot</option>
              <option value="09:00 AM">09:00 AM</option>
              <option value="10:00 AM">10:00 AM</option>
              <option value="11:00 AM">11:00 AM</option>
              <option value="04:00 PM">04:00 PM</option>
              <option value="05:00 PM">05:00 PM</option>
              <option value="06:00 PM">06:00 PM</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={!formData.trainerId || !formData.date || !formData.time} className="w-full py-4 bg-[#FF3366] text-white rounded-xl font-bold hover:bg-[#E62E5C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-8">
          Confirm Booking Request
        </button>
      </form>
    </div>
  );
};

export default MemberBookSession;
`;

const memberAIFitnessContent = `import React, { useState } from 'react';
import { Bot, Activity, Target, Zap, ArrowRight, Save } from 'lucide-react';

const MemberAIFitness = () => {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  
  const [data, setData] = useState({
    goal: 'Weight Loss',
    level: 'Beginner',
    days: '3 days',
    equipment: 'Full Gym'
  });

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate AI generation delay
    setTimeout(() => {
      setIsGenerating(false);
      setResult({
        summary: "Based on your goal of Weight Loss and Beginner level, here is a customized 3-day routine.",
        routine: [
          { day: "Day 1 (Full Body)", exercises: ["Squats: 3x10", "Pushups (Knee): 3x8", "Plank: 3x30s", "Treadmill: 15 mins"] },
          { day: "Day 2 (Active Recovery)", exercises: ["Light Walking: 20 mins", "Yoga Stretching: 15 mins"] },
          { day: "Day 3 (Cardio & Core)", exercises: ["Rowing: 10 mins", "Crunches: 3x15", "Cycling: 15 mins", "Dumbbell Rows: 3x10"] }
        ],
        dietTip: "Focus on a caloric deficit of 300-500 calories per day. Ensure you consume at least 1g of protein per kg of body weight."
      });
      setStep(3);
    }, 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-[#FF3366] to-[#991F3D] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(255,51,102,0.3)]">
          <Bot size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">AI Fitness Engine</h1>
          <p className="text-[#A1A1AA] mt-1">Get personalized workout and diet recommendations instantly.</p>
        </div>
      </div>

      {step === 1 && (
        <div className="bg-[#101010] border border-[#272727] rounded-2xl p-8 space-y-8 animate-in fade-in zoom-in duration-300">
          <h2 className="text-xl font-semibold text-white border-b border-[#272727] pb-4">Tell us about your goals</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-sm font-medium text-[#A1A1AA] flex items-center gap-2"><Target size={16}/> Primary Goal</label>
              <select value={data.goal} onChange={e => setData({...data, goal: e.target.value})} className="w-full bg-[#151515] border border-[#272727] rounded-xl px-4 py-3 text-white focus:border-[#FF3366] transition-all outline-none">
                <option>Weight Loss</option>
                <option>Muscle Building</option>
                <option>Strength & Conditioning</option>
                <option>Endurance</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium text-[#A1A1AA] flex items-center gap-2"><Activity size={16}/> Fitness Level</label>
              <select value={data.level} onChange={e => setData({...data, level: e.target.value})} className="w-full bg-[#151515] border border-[#272727] rounded-xl px-4 py-3 text-white focus:border-[#FF3366] transition-all outline-none">
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium text-[#A1A1AA] flex items-center gap-2"><Zap size={16}/> Days per week</label>
              <select value={data.days} onChange={e => setData({...data, days: e.target.value})} className="w-full bg-[#151515] border border-[#272727] rounded-xl px-4 py-3 text-white focus:border-[#FF3366] transition-all outline-none">
                <option>2 days</option>
                <option>3 days</option>
                <option>4 days</option>
                <option>5+ days</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium text-[#A1A1AA]">Available Equipment</label>
              <select value={data.equipment} onChange={e => setData({...data, equipment: e.target.value})} className="w-full bg-[#151515] border border-[#272727] rounded-xl px-4 py-3 text-white focus:border-[#FF3366] transition-all outline-none">
                <option>Full Gym</option>
                <option>Dumbbells Only</option>
                <option>Bodyweight (Home)</option>
              </select>
            </div>
          </div>
          
          <button onClick={() => setStep(2)} className="w-full md:w-auto px-8 py-3 bg-white text-black rounded-xl font-bold hover:bg-[#A1A1AA] transition-colors flex items-center justify-center space-x-2 ml-auto">
            <span>Next Step</span>
            <ArrowRight size={18} />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="bg-[#101010] border border-[#272727] rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-6">
          {!isGenerating ? (
            <>
              <Bot size={64} className="text-[#FF3366] mb-2" />
              <h2 className="text-2xl font-bold text-white">Ready to Generate</h2>
              <p className="text-[#A1A1AA] max-w-md">Our AI engine will analyze your profile and create a personalized plan optimized for {data.goal}.</p>
              <div className="flex gap-4 mt-4">
                <button onClick={() => setStep(1)} className="px-6 py-3 border border-[#272727] text-white rounded-xl font-semibold hover:bg-[#151515] transition-colors">Back</button>
                <button onClick={handleGenerate} className="px-8 py-3 bg-gradient-to-r from-[#FF3366] to-[#991F3D] text-white rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center space-x-2 shadow-[0_4px_14px_rgba(255,51,102,0.4)]">
                  <Zap size={18} />
                  <span>Generate AI Plan</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-6 py-8">
              <div className="w-16 h-16 border-4 border-[#FF3366]/30 border-t-[#FF3366] rounded-full animate-spin"></div>
              <p className="text-xl font-medium text-white animate-pulse">Analyzing neural fitness models...</p>
              <p className="text-[#A1A1AA]">Optimizing for {data.goal}...</p>
            </div>
          )}
        </div>
      )}

      {step === 3 && result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-gradient-to-r from-[#101010] to-[#1a1013] border border-[#272727] rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-[#FF3366] mb-2">Your AI Plan is Ready</h2>
            <p className="text-white font-medium">{result.summary}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#101010] border border-[#272727] rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center"><Dumbbell className="mr-2 text-[#FF3366]" size={20}/> Workout Routine</h3>
              <div className="space-y-4">
                {result.routine.map((day, idx) => (
                  <div key={idx} className="bg-[#151515] rounded-xl p-4 border border-[#272727]">
                    <h4 className="font-bold text-white mb-2">{day.day}</h4>
                    <ul className="space-y-1">
                      {day.exercises.map((ex, i) => (
                        <li key={i} className="text-[#A1A1AA] text-sm flex items-start"><ArrowRight size={14} className="mr-2 mt-0.5 text-[#FF3366] shrink-0" /> {ex}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-[#101010] border border-[#272727] rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center"><Utensils className="mr-2 text-[#FF3366]" size={20}/> Nutrition Guidance</h3>
                <p className="text-[#A1A1AA]">{result.dietTip}</p>
              </div>
              
              <button onClick={() => setStep(1)} className="w-full py-4 bg-[#FF3366] text-white rounded-xl font-bold hover:bg-[#E62E5C] transition-colors flex justify-center items-center gap-2">
                <Save size={20} /> Save to My Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
// Add missing icons that were used inside the component
import { Utensils, Dumbbell } from 'lucide-react';
export default MemberAIFitness;
`;

writePage('admin', 'GymAdminTrainers', adminTrainersContent);
writePage('member', 'MemberFindTrainers', memberFindTrainersContent);
writePage('member', 'MemberBookSession', memberBookSessionContent);
writePage('member', 'MemberAIFitness', memberAIFitnessContent);
console.log('Finished updating complex pages.');
