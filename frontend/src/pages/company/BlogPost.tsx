import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Clock,
  Calendar,
  Share2,
  Check,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  Bookmark
} from 'lucide-react';
import { BLOG_POSTS, getBlogPost } from '../../data/blogData';

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const post = getBlogPost(id || '');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] text-[#292524] flex flex-col justify-between">
        <nav className="border-b border-[#E7E5E4] bg-[#FFFFFF]/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#F97316] rounded-sm flex items-center justify-center">
                <Activity className="text-black" size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#F97316]">AI GYM</span>
            </Link>
            <Link to="/blog" className="text-sm font-medium text-[#78716C] hover:text-[#F97316] flex items-center space-x-2">
              <ArrowLeft size={16} /> <span>Back to Blog</span>
            </Link>
          </div>
        </nav>

        <main className="max-w-2xl mx-auto px-4 py-24 text-center">
          <div className="w-16 h-16 bg-[#FED7AA] rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#F97316]">
            <Activity size={32} />
          </div>
          <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
          <p className="text-[#78716C] mb-8">
            The article you are looking for doesn't exist or has been moved. Check out our latest fitness and AI insights.
          </p>
          <button
            onClick={() => navigate('/blog')}
            className="px-6 py-3 bg-[#F97316] text-black font-semibold rounded-xl hover:bg-[#ea580c] transition-colors"
          >
            Browse All Articles
          </button>
        </main>

        <footer className="border-t border-[#E7E5E4] py-8 text-center text-sm text-[#78716C]">
          <p>&copy; {new Date().getFullYear()} AI GYM Technologies Inc. All rights reserved.</p>
        </footer>
      </div>
    );
  }

  // Related posts (excluding current)
  const relatedPosts = BLOG_POSTS.filter((p) => p.id !== post.id);

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#292524] selection:bg-[#F97316] selection:text-black">
      {/* Top Navbar */}
      <nav className="border-b border-[#E7E5E4] bg-[#FFFFFF]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-[#F97316] rounded-sm flex items-center justify-center group-hover:scale-105 transition-transform">
              <Activity className="text-black" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#F97316]">AI GYM</span>
          </Link>
          <div className="flex items-center space-x-6">
            <Link
              to="/blog"
              className="text-sm font-medium text-[#78716C] hover:text-[#F97316] flex items-center space-x-2 transition-colors"
            >
              <ArrowLeft size={16} /> <span>All Articles</span>
            </Link>
            <Link
              to="/"
              className="hidden sm:inline-block text-sm font-medium text-[#78716C] hover:text-[#F97316] transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs md:text-sm text-[#78716C] mb-8 overflow-x-auto whitespace-nowrap pb-1">
          <Link to="/" className="hover:text-[#F97316]">Home</Link>
          <span>/</span>
          <Link to="/blog" className="hover:text-[#F97316]">Blog</Link>
          <span>/</span>
          <span className="text-[#292524] font-medium truncate max-w-xs md:max-w-md">{post.title}</span>
        </div>

        {/* Metadata badges */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="bg-[#FED7AA] text-[#292524] font-semibold text-xs px-3 py-1.5 rounded-full">
            {post.category}
          </span>
          <span className="flex items-center text-xs text-[#78716C] space-x-1.5">
            <Calendar size={14} />
            <span>{post.date}</span>
          </span>
          <span className="flex items-center text-xs text-[#78716C] space-x-1.5">
            <Clock size={14} />
            <span>{post.readTime}</span>
          </span>
        </div>

        {/* Main Title & Subtitle */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-6 text-[#292524]">
          {post.title}
        </h1>
        <p className="text-lg md:text-xl text-[#78716C] leading-relaxed mb-8">
          {post.subtitle}
        </p>

        {/* Author Header & Actions */}
        <div className="flex items-center justify-between border-y border-[#E7E5E4] py-4 mb-8">
          <div className="flex items-center space-x-4">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-[#FED7AA]"
            />
            <div>
              <p className="font-semibold text-sm text-[#292524]">{post.author.name}</p>
              <p className="text-xs text-[#78716C]">{post.author.role}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setBookmarked(!bookmarked)}
              title="Bookmark article"
              className={`p-2.5 rounded-xl border transition-colors ${
                bookmarked
                  ? 'bg-[#F97316] text-black border-[#F97316]'
                  : 'bg-white border-[#E7E5E4] text-[#78716C] hover:text-[#292524] hover:border-stone-400'
              }`}
            >
              <Bookmark size={18} />
            </button>
            <button
              onClick={handleShare}
              title="Share article link"
              className="flex items-center space-x-2 px-3.5 py-2.5 bg-white border border-[#E7E5E4] rounded-xl text-xs font-semibold text-[#292524] hover:border-[#F97316] transition-colors"
            >
              {copied ? <Check size={16} className="text-emerald-600" /> : <Share2 size={16} />}
              <span>{copied ? 'Copied Link!' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Hero Image */}
        <div className="rounded-2xl overflow-hidden mb-12 shadow-sm border border-[#E7E5E4]">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-[320px] sm:h-[420px] md:h-[480px] object-cover"
          />
        </div>

        {/* Intro */}
        <div className="text-lg md:text-xl font-normal leading-relaxed text-[#44403C] mb-10 pb-8 border-b border-[#E7E5E4]">
          {post.content.intro}
        </div>

        {/* Key Takeaways Box */}
        {post.content.takeaways && post.content.takeaways.length > 0 && (
          <div className="bg-[#FFF8ED] border border-[#FED7AA] rounded-2xl p-6 md:p-8 mb-12">
            <div className="flex items-center space-x-2.5 mb-4 text-[#F97316]">
              <Sparkles size={20} />
              <h2 className="text-lg font-bold text-[#292524]">Key Takeaways at a Glance</h2>
            </div>
            <ul className="space-y-3">
              {post.content.takeaways.map((takeaway, idx) => (
                <li key={idx} className="flex items-start space-x-3 text-sm md:text-base text-[#57534E]">
                  <CheckCircle2 size={18} className="text-[#F97316] shrink-0 mt-0.5" />
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Main Content Sections */}
        <div className="space-y-12 mb-16">
          {post.content.sections.map((section, idx) => (
            <div key={idx} className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-[#292524] tracking-tight">
                {section.heading}
              </h2>

              {section.body.map((paragraph, pIdx) => (
                <p key={pIdx} className="text-base md:text-lg leading-relaxed text-[#57534E]">
                  {paragraph}
                </p>
              ))}

              {section.quote && (
                <div className="my-6 border-l-4 border-[#F97316] bg-[#FFFFFF] p-6 rounded-r-2xl shadow-sm italic text-base md:text-lg text-[#292524]">
                  "{section.quote}"
                </div>
              )}

              {section.bullets && section.bullets.length > 0 && (
                <ul className="space-y-3.5 my-6 pl-2">
                  {section.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="flex items-start space-x-3 text-sm md:text-base text-[#57534E]">
                      <div className="w-2 h-2 rounded-full bg-[#F97316] shrink-0 mt-2" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Pro Tip Box */}
        {post.content.proTip && (
          <div className="bg-[#FFFFFF] border-2 border-[#FED7AA] rounded-2xl p-6 md:p-8 mb-16 shadow-sm">
            <div className="flex items-center space-x-2 text-[#EA580C] font-bold text-sm uppercase tracking-wide mb-2">
              <Lightbulb size={20} />
              <span>Expert Coach Pro Tip</span>
            </div>
            <p className="text-base md:text-lg text-[#44403C] leading-relaxed">
              {post.content.proTip}
            </p>
          </div>
        )}

        {/* Author Bio Box */}
        <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-16">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="w-20 h-20 rounded-full object-cover border-2 border-[#FED7AA] shrink-0"
          />
          <div className="text-center sm:text-left">
            <span className="text-xs uppercase tracking-wider text-[#F97316] font-bold">Written by</span>
            <h3 className="text-xl font-bold text-[#292524] mt-1">{post.author.name}</h3>
            <p className="text-sm text-[#78716C] mb-3">{post.author.role}</p>
            <p className="text-sm text-[#57534E] leading-relaxed">
              Contributing fitness scientist and lead author for AI GYM. Passionate about evidence-based biomechanics, progressive overload protocols, and nutrition optimization.
            </p>
          </div>
        </div>

        {/* Related Articles Section */}
        {relatedPosts.length > 0 && (
          <div className="border-t border-[#E7E5E4] pt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#F97316] font-bold">Continue Reading</span>
                <h2 className="text-2xl md:text-3xl font-bold text-[#292524] mt-1">Related Articles</h2>
              </div>
              <Link
                to="/blog"
                className="text-sm font-semibold text-[#F97316] hover:underline flex items-center space-x-1"
              >
                <span>View All</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {relatedPosts.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/blog/${item.slug}`)}
                  className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl overflow-hidden group hover:border-[#F97316]/50 transition-all cursor-pointer flex flex-col shadow-sm hover:shadow-md"
                >
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-md text-[#292524]">
                      {item.category}
                    </span>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center text-xs text-[#78716C] space-x-3 mb-2">
                      <span>{item.date}</span>
                      <span>•</span>
                      <span>{item.readTime}</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#292524] mb-3 group-hover:text-[#F97316] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#78716C] line-clamp-2 mb-4">
                      {item.excerpt}
                    </p>
                    <div className="mt-auto flex items-center space-x-2 text-[#F97316] text-sm font-semibold group-hover:translate-x-1 transition-transform">
                      <span>Read Article</span>
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E7E5E4] bg-[#FFFFFF] py-12 mt-16 text-center text-sm text-[#78716C]">
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

export default BlogPost;
