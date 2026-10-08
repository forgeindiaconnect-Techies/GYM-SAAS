import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, ArrowLeft, ArrowRight, Search, Clock, Calendar } from 'lucide-react';
import { BLOG_POSTS } from '../../data/blogData';

const Blog = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', 'Technology', 'Nutrition', 'Fitness'];

  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchesCategory =
      selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#292524] selection:bg-[#F97316] selection:text-black">
      {/* Top Navigation */}
      <nav className="border-b border-[#E7E5E4] bg-[#FFFFFF]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-[#F97316] rounded-sm flex items-center justify-center group-hover:scale-105 transition-transform">
              <Activity className="text-black" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#F97316]">AI GYM</span>
          </Link>
          <Link
            to="/"
            className="text-sm font-medium text-[#78716C] hover:text-[#F97316] flex items-center space-x-2 transition-colors"
          >
            <ArrowLeft size={16} /> <span>Back to Home</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header Section */}
        <div className="max-w-3xl mb-12">
          <span className="text-[#F97316] text-sm font-bold uppercase tracking-wider mb-3 block">
            Knowledge Base & Insights
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">The AI GYM Blog</h1>
          <p className="text-lg text-[#78716C] leading-relaxed">
            Evidence-based fitness training, cutting-edge AI workout algorithms, and sports nutrition strategies designed to help you reach peak performance.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-10 pb-6 border-b border-[#E7E5E4]">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  selectedCategory === category
                    ? 'bg-[#F97316] text-black shadow-sm'
                    : 'bg-[#FFFFFF] border border-[#E7E5E4] text-[#78716C] hover:text-[#292524] hover:border-[#F97316]/50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78716C]" size={16} />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl text-sm focus:outline-none focus:border-[#F97316] transition-colors placeholder-[#A8A29E]"
            />
          </div>
        </div>

        {/* Blog Post Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20 bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl">
            <p className="text-lg font-semibold text-[#292524] mb-2">No articles found</p>
            <p className="text-sm text-[#78716C] mb-6">
              Try adjusting your category filter or search query.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="px-5 py-2.5 bg-[#FED7AA] text-[#292524] font-semibold text-sm rounded-lg hover:bg-[#F97316] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => navigate(`/blog/${post.slug}`)}
                className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl overflow-hidden group hover:border-[#F97316]/60 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col"
              >
                {/* Image */}
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-[#FED7AA] px-2.5 py-1 rounded text-xs font-semibold text-[#292524] shadow-xs">
                    {post.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-[#78716C] mb-3">
                    <span className="flex items-center space-x-1">
                      <Calendar size={13} />
                      <span>{post.date}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock size={13} />
                      <span>{post.readTime}</span>
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold mb-3 text-[#292524] group-hover:text-[#F97316] transition-colors leading-snug">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-sm text-[#78716C] leading-relaxed mb-6 line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Read Article Action */}
                  <div className="mt-auto pt-4 border-t border-[#F5F5F4] flex items-center justify-between">
                    <Link
                      to={`/blog/${post.slug}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center space-x-2 text-[#F97316] hover:text-[#ea580c] text-sm font-semibold group-hover:translate-x-1 transition-all"
                    >
                      <span>Read Article</span>
                      <ArrowRight size={16} />
                    </Link>

                    <div className="flex items-center space-x-2">
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-6 h-6 rounded-full object-cover border border-[#FED7AA]"
                      />
                      <span className="text-xs text-[#78716C] truncate max-w-[100px]">
                        {post.author.name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E7E5E4] bg-[#FFFFFF] py-12 mt-20 text-center text-sm text-[#78716C]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-[#F97316] rounded-sm flex items-center justify-center">
              <Activity className="text-black" size={16} />
            </div>
            <span className="font-bold text-[#F97316]">AI GYM</span>
          </div>
          <p>&copy; {new Date().getFullYear()} AI GYM Technologies Inc. All rights reserved.</p>
          <div className="flex items-center space-x-6 text-xs">
            <Link to="/about" className="hover:text-[#F97316]">About</Link>
            <Link to="/blog" className="hover:text-[#F97316]">Blog</Link>
            <Link to="/contact" className="hover:text-[#F97316]">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Blog;
