import { Link } from 'react-router-dom';
import { Activity, ArrowLeft, ArrowRight } from 'lucide-react';

const Blog = () => {
  const posts = [
    { title: 'The Science Behind AI Workout Generation', date: 'Oct 15, 2026', category: 'Technology', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop' },
    { title: 'Top 10 High-Protein Post-Workout Meals', date: 'Sep 28, 2026', category: 'Nutrition', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800&auto=format&fit=crop' },
    { title: 'How to Prevent Injuries as a Beginner', date: 'Sep 10, 2026', category: 'Fitness', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop' },
  ];

  return (
    <div className="min-h-screen bg-[#F0FDFA] text-[#1E293B] selection:bg-[#16A34A] selection:text-black">
      <nav className="border-b border-[#CCFBF1] bg-[#FFFFFF]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-[#16A34A] rounded-sm flex items-center justify-center">
              <Activity className="text-black" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#16A34A]">AI GYM</span>
          </Link>
          <Link to="/" className="text-sm font-medium text-[#475569] hover:text-[#16A34A] flex items-center space-x-2">
            <ArrowLeft size={16} /> <span>Back to Home</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <span className="text-[#16A34A] text-sm font-bold uppercase tracking-wider mb-4 block">Knowledge Base</span>
        <h1 className="text-4xl md:text-5xl font-bold mb-12">The AI GYM Blog</h1>

        <div className="grid md:grid-cols-3 gap-8">
          {posts.map((post, i) => (
            <div key={i} className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl overflow-hidden group hover:border-[#16A34A]/50 transition-colors cursor-pointer flex flex-col">
              <div className="h-48 overflow-hidden">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between text-xs text-[#475569] mb-3">
                  <span className="bg-[#E2E8F0] px-2 py-1 rounded text-[#1E293B]">{post.category}</span>
                  <span>{post.date}</span>
                </div>
                <h3 className="text-xl font-bold mb-4">{post.title}</h3>
                <div className="mt-auto flex items-center space-x-2 text-[#16A34A] text-sm font-semibold group-hover:underline">
                  <span>Read Article</span> <ArrowRight size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Blog;
