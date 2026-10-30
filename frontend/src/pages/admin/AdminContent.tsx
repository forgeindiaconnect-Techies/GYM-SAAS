import { FileEdit } from 'lucide-react';

const AdminContent = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileEdit className="text-[#B76E79]" size={32} />
            Content Management
          </h1>
          <p className="text-[#57534E] mt-2">Manage blogs, FAQs, and static page text.</p>
        </div>
        <button className="px-6 py-2 bg-[#B76E79] text-white font-bold rounded-xl font-bold hover:bg-[#9F5965] transition-colors">
          Manage Content Management
        </button>
      </div>
      
      
      <div className="bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-[#E7DADD] flex justify-between items-center bg-[#FFFFFF]">
          <h2 className="text-lg font-bold">Published Articles</h2>
          <button className="px-4 py-2 bg-[#F3E8E8] rounded-lg text-sm hover:bg-[#333]">+ New Post</button>
        </div>
        <table className="w-full text-left">
          <tbody className="divide-y divide-[#E7DADD] text-sm">
            {['10 Tips for Better Deadlifts', 'Understanding Macros', 'The Future of AI in Fitness'].map((title, i) => (
              <tr key={i} className="hover:bg-[#FFFFFF]">
                <td className="p-4 font-bold">{title}</td>
                <td className="p-4 text-[#57534E]">Blog Post</td>
                <td className="p-4 text-right">
                  <button className="text-[#B76E79]">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    
    </div>
  );
};

export default AdminContent;