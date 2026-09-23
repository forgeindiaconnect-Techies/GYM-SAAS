import React, { useState } from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';

interface StepProps {
  form: any;
  set: (field: string, value: any) => void;
  errors: Record<string, string>;
  inputCls: (field: string) => string;
}

const OFFER_TYPES = ['Percentage Discount', 'Flat Discount', 'Free Days', 'Special Package'];

const Step6Offers: React.FC<StepProps> = ({ form, set, errors, inputCls }) => {
  const [showAddOffer, setShowAddOffer] = useState(false);
  const [newOffer, setNewOffer] = useState({
    name: '', type: '', description: '', originalPrice: '', offerPrice: '', 
    discountPercentage: '', validFrom: '', validUntil: '', applicablePlan: '', 
    terms: '', status: 'Active'
  });

  const addOffer = () => {
    if (!newOffer.name || !newOffer.type || !newOffer.validFrom || !newOffer.validUntil || !newOffer.terms) {
      alert('Please fill all required offer fields');
      return;
    }
    const offers = form.offers || [];
    set('offers', [...offers, {
      ...newOffer,
      originalPrice: Number(newOffer.originalPrice),
      offerPrice: Number(newOffer.offerPrice),
      discountPercentage: Number(newOffer.discountPercentage)
    }]);
    setNewOffer({ name: '', type: '', description: '', originalPrice: '', offerPrice: '', discountPercentage: '', validFrom: '', validUntil: '', applicablePlan: '', terms: '', status: 'Active' });
    setShowAddOffer(false);
  };

  const removeOffer = (index: number) => {
    const updated = [...(form.offers || [])];
    updated.splice(index, 1);
    set('offers', updated);
  };

  const offers = form.offers || [];

  return (
    <div className="space-y-6">
      <div className="border-b border-[#DCD9CD] pb-2 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-[#202522]">Promotional Offers</h2>
          <p className="text-sm text-[#4A514D]">Create special deals and discounts for customers.</p>
        </div>
        {!showAddOffer && (
          <button type="button" onClick={() => setShowAddOffer(true)} className="px-3 py-1.5 bg-[#22C55E]/10 text-[#22C55E] text-sm font-medium rounded-lg hover:bg-[#22C55E]/20 transition-colors flex items-center space-x-1">
            <Plus size={16} /><span>Add Offer</span>
          </button>
        )}
      </div>

      {showAddOffer && (
        <div className="bg-[#FFFFFF] border border-[#22C55E]/30 rounded-xl p-5 space-y-4">
          <h3 className="font-medium text-[#202522] text-sm">New Offer Details</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#4A514D] mb-1">Offer Name *</label>
              <input value={newOffer.name} onChange={e => setNewOffer({...newOffer, name: e.target.value})} placeholder="e.g. New Year Special" className={inputCls('offerName')} />
            </div>
            <div>
              <label className="block text-xs text-[#4A514D] mb-1">Offer Type *</label>
              <select value={newOffer.type} onChange={e => setNewOffer({...newOffer, type: e.target.value})} className={inputCls('offerType')}>
                <option value="">Select Type</option>
                {OFFER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#4A514D] mb-1">Description</label>
            <textarea value={newOffer.description} onChange={e => setNewOffer({...newOffer, description: e.target.value})} placeholder="Brief details about the offer..." className={inputCls('offerDesc')} rows={2}></textarea>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-[#4A514D] mb-1">Original Price</label>
              <input type="number" value={newOffer.originalPrice} onChange={e => setNewOffer({...newOffer, originalPrice: e.target.value})} placeholder="0" className={inputCls('originalPrice')} />
            </div>
            <div>
              <label className="block text-xs text-[#4A514D] mb-1">Offer Price</label>
              <input type="number" value={newOffer.offerPrice} onChange={e => setNewOffer({...newOffer, offerPrice: e.target.value})} placeholder="0" className={inputCls('offerPrice')} />
            </div>
            <div>
              <label className="block text-xs text-[#4A514D] mb-1">Discount %</label>
              <input type="number" value={newOffer.discountPercentage} onChange={e => setNewOffer({...newOffer, discountPercentage: e.target.value})} placeholder="e.g. 20" className={inputCls('discount')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#4A514D] mb-1">Valid From *</label>
              <input type="date" value={newOffer.validFrom} onChange={e => setNewOffer({...newOffer, validFrom: e.target.value})} className={inputCls('validFrom')} />
            </div>
            <div>
              <label className="block text-xs text-[#4A514D] mb-1">Valid Until *</label>
              <input type="date" value={newOffer.validUntil} onChange={e => setNewOffer({...newOffer, validUntil: e.target.value})} className={inputCls('validUntil')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#4A514D] mb-1">Applicable Plan</label>
              <select value={newOffer.applicablePlan} onChange={e => setNewOffer({...newOffer, applicablePlan: e.target.value})} className={inputCls('applicablePlan')}>
                <option value="">Any Plan</option>
                {form.subscriptionPlans?.map((p: any, i: number) => (
                  <option key={i} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#4A514D] mb-1">Status</label>
              <select value={newOffer.status} onChange={e => setNewOffer({...newOffer, status: e.target.value})} className={inputCls('status')}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#4A514D] mb-1">Terms & Conditions *</label>
            <input value={newOffer.terms} onChange={e => setNewOffer({...newOffer, terms: e.target.value})} placeholder="e.g. Only valid for new members" className={inputCls('terms')} />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={() => setShowAddOffer(false)} className="px-4 py-2 text-sm text-[#4A514D] hover:text-[#34483F] transition-colors">Cancel</button>
            <button type="button" onClick={addOffer} className="px-4 py-2 bg-[#22C55E] text-white text-sm font-semibold rounded-lg hover:bg-green-600 transition-colors">Save Offer</button>
          </div>
        </div>
      )}

      {errors.offers && <p className="text-teal-400 text-xs">{errors.offers}</p>}

      {offers.length === 0 && !showAddOffer ? (
        <div className="text-center py-8 bg-[#FFFFFF] border border-[#DCD9CD] border-dashed rounded-xl">
          <p className="text-[#4A514D] text-sm mb-3">No promotional offers active.</p>
          <button type="button" onClick={() => setShowAddOffer(true)} className="px-4 py-2 bg-[#FFFFFF] text-[#202522] text-sm border border-[#DCD9CD] rounded-lg hover:border-[#22C55E]/50 transition-colors">
            Create an Offer
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {offers.map((offer: any, i: number) => (
            <div key={i} className="bg-[#FFFFFF] border border-[#DCD9CD] p-5 rounded-xl relative group">
              <button type="button" onClick={() => removeOffer(i)} className="absolute top-3 right-3 text-[#4A514D] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 size={16} />
              </button>
              <div className="flex items-center space-x-2 mb-2">
                <Tag size={16} className="text-[#22C55E]" />
                <h3 className="text-sm font-bold text-[#202522]">{offer.name}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${offer.status === 'Active' ? 'bg-[#22C55E]/20 text-[#22C55E]' : 'bg-[#555]/20 text-[#4A514D]'}`}>
                  {offer.status}
                </span>
              </div>
              <p className="text-xs text-[#4A514D] mb-3">{offer.type}</p>
              
              <div className="grid grid-cols-2 gap-2 text-xs mb-3 bg-[#FFFFFF] p-2 rounded-lg">
                <div>
                  <span className="text-[#4A514D] block">Valid From</span>
                  <span className="text-[#202522]">{offer.validFrom}</span>
                </div>
                <div>
                  <span className="text-[#4A514D] block">Valid Until</span>
                  <span className="text-[#202522]">{offer.validUntil}</span>
                </div>
              </div>
              <p className="text-[10px] text-[#4A514D]">T&C: {offer.terms}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Step6Offers;
