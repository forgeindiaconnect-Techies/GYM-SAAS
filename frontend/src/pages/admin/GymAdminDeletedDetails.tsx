import { useState } from 'react';
import { Trash2, Search, Filter, RotateCcw, Eye, X } from 'lucide-react';

const mockDeletedItems = [
  { id: 'DEL-001', name: 'John Doe', type: 'Trainer', deletedAt: '2026-09-14', deletedBy: 'Admin', reason: 'Contract Expired' },
  { id: 'DEL-002', name: 'Jane Smith', type: 'Member', deletedAt: '2026-09-12', deletedBy: 'Admin', reason: 'Requested account deletion' },
  { id: 'DEL-003', name: 'Mike Johnson', type: 'Trainer', deletedAt: '2026-09-10', deletedBy: 'Admin', reason: 'Violation of terms' },
];

const GymAdminDeletedDetails = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deletedItems, setDeletedItems] = useState(mockDeletedItems);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const filteredItems = deletedItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRestore = (id: string) => {
    setDeletedItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#202522] tracking-tight">Deleted Details</h1>
          <p className="text-[#4A514D] mt-1">View history of deleted trainers, members, and profiles.</p>
        </div>
      </div>

      <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5"><Trash2 size={120} /></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
          <div className="relative w-full md:w-96">
            <input 
              type="text" 
              placeholder="Search deleted records..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl pl-10 pr-4 py-2.5 text-[#202522] focus:border-[#34483F] transition-all outline-none"
            />
            <Search className="absolute left-3 top-3 text-[#4A514D]" size={18} />
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar relative z-10">
          <table className="w-full text-left text-sm text-[#4A514D] whitespace-nowrap">
            <thead className="bg-[#F2EFE8] border-b border-[#DCD9CD] text-[#202522]">
              <tr>
                <th className="px-6 py-4 font-semibold rounded-tl-xl">ID</th>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Deleted At</th>
                <th className="px-6 py-4 font-semibold">Reason</th>
                <th className="px-6 py-4 font-semibold text-center rounded-tr-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCD9CD]">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F5F3EE] transition-colors">
                    <td className="px-6 py-4 font-mono text-xs">{item.id}</td>
                    <td className="px-6 py-4 font-bold text-[#202522]">{item.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                        item.type === 'Trainer' ? 'bg-blue-500/10 text-blue-600' : 'bg-purple-500/10 text-purple-600'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">{item.deletedAt}</td>
                    <td className="px-6 py-4 truncate max-w-xs">{item.reason}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-3">
                        <button onClick={() => setSelectedItem(item)} className="text-[#4A514D] hover:text-[#8FA89B] transition-colors" title="View Details">
                          <Eye size={18} />
                        </button>
                        <button onClick={() => handleRestore(item.id)} className="text-[#4A514D] hover:text-[#34483F] transition-colors" title="Restore Data">
                          <RotateCcw size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Trash2 size={40} className="mx-auto text-[#CBD5E1] mb-3" />
                    <p className="text-[#4A514D] font-medium">No deleted records found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-md w-full shadow-2xl border border-[#DCD9CD] overflow-hidden">
            <div className="p-6 border-b border-[#DCD9CD] flex justify-between items-center bg-[#F2EFE8]">
              <h2 className="text-xl font-bold text-[#202522]">Deleted Record Details</h2>
              <button onClick={() => setSelectedItem(null)} className="text-[#4A514D] hover:text-[#202522]"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <span className="text-sm font-bold text-[#4A514D]">ID</span>
                  <p className="text-[#202522] font-semibold break-all">{selectedItem.id}</p>
                </div>
                <div>
                  <span className="text-sm font-bold text-[#4A514D]">Name</span>
                  <p className="text-[#202522] font-semibold">{selectedItem.name}</p>
                </div>
                <div>
                  <span className="text-sm font-bold text-[#4A514D]">Type</span>
                  <p className="text-[#202522] font-semibold">{selectedItem.type}</p>
                </div>
                <div>
                  <span className="text-sm font-bold text-[#4A514D]">Deleted At</span>
                  <p className="text-[#202522] font-semibold">{selectedItem.deletedAt}</p>
                </div>
                <div>
                  <span className="text-sm font-bold text-[#4A514D]">Deleted By</span>
                  <p className="text-[#202522] font-semibold">{selectedItem.deletedBy}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-sm font-bold text-[#4A514D]">Reason</span>
                  <p className="text-[#202522] font-semibold">{selectedItem.reason}</p>
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-[#DCD9CD]">
                <button type="button" onClick={() => setSelectedItem(null)} className="px-6 py-2 bg-[#F1F5F9] text-[#202522] font-bold hover:bg-[#E8E5DA] rounded-xl transition-colors">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymAdminDeletedDetails;
