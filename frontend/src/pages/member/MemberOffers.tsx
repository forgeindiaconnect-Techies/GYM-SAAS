import { Gift } from 'lucide-react';

const MemberOffers = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Exclusive Offers</h1>
        <p className="text-[#78716C]">Deals and discounts just for you</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {[
          { title: '20% Off Supplements', desc: 'Get 20% off all protein powders and vitamins at the gym store this week.', code: 'PROTEIN20', exp: 'Oct 15' },
          { title: 'Bring a Friend for Free', desc: 'Bring a friend to any group class for free this weekend.', code: 'FRIENDPASS', exp: 'Oct 20' },
        ].map((offer, i) => (
          <div key={i} className="bg-gradient-to-br from-[#FFFFFF] to-[#FFFFFF] border border-[#F97316]/30 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 text-[#F97316]/5 group-hover:scale-110 transition-transform">
              <Gift size={120} />
            </div>
            <div className="relative z-10">
              <span className="px-2 py-1 bg-[#F97316]/20 text-[#F97316] text-xs font-bold rounded mb-4 inline-block">Valid till {offer.exp}</span>
              <h3 className="text-xl font-bold mb-2">{offer.title}</h3>
              <p className="text-sm text-[#78716C] mb-6">{offer.desc}</p>
              
              <div className="bg-[#FFFDF8] border border-[#E7E5E4] rounded-lg p-3 flex justify-between items-center">
                <span className="font-mono text-[#F97316] tracking-wider">{offer.code}</span>
                <button className="text-xs font-bold uppercase hover:text-[#F97316] transition transition-colors">Copy Code</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberOffers;