import { CalendarCheck, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

const TrainerAttendance = () => {
  const [clients, setClients] = useState([
    { id: 1, name: 'Sarah Connor', status: 'present' },
    { id: 2, name: 'John Doe', status: 'absent' },
    { id: 3, name: 'Mike Tyson', status: 'present' },
    { id: 4, name: 'Jane Smith', status: 'pending' },
  ]);

  const toggleStatus = (id: number, newStatus: string) => {
    setClients(clients.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  const saveRoster = () => {
    alert("Attendance roster saved successfully!");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Attendance</h1>
        <p className="text-[#455250]">Track client participation for your sessions</p>
      </div>

      <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-[#D3DFDA] flex justify-between items-center bg-[#FFFFFF]">
          <div>
            <h2 className="text-lg font-bold">CrossFit Group Class</h2>
            <p className="text-sm text-[#455250]">Today, 04:00 PM</p>
          </div>
          <button 
            onClick={saveRoster}
            className="px-4 py-2 bg-[#164A4A] text-white font-bold rounded-lg text-sm hover:bg-[#164A4A]/90 transition-colors"
          >
            Save Roster
          </button>
        </div>
        
        <div className="divide-y divide-[#D3DFDA]">
          {clients.map((client) => (
            <div key={client.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#E8E5DA] rounded-full flex items-center justify-center font-bold text-sm text-[#202828]">
                  {client.name[0]}
                </div>
                <h4 className="font-medium text-[#202828]">{client.name}</h4>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => toggleStatus(client.id, 'present')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm transition-colors ${client.status === 'present' ? 'bg-green-100 text-green-700 border border-green-200 shadow-sm font-semibold' : 'text-[#455250] hover:bg-gray-100'}`}
                >
                  <CheckCircle size={16} /> Present
                </button>
                <button 
                  onClick={() => toggleStatus(client.id, 'absent')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm transition-colors ${client.status === 'absent' ? 'bg-red-100 text-red-700 border border-red-200 shadow-sm font-semibold' : 'text-[#455250] hover:bg-gray-100'}`}
                >
                  <XCircle size={16} /> Absent
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrainerAttendance;