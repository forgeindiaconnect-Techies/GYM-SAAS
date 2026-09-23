import React, { useState } from 'react';
import { Plus, Trash2, Dumbbell, Image as ImageIcon } from 'lucide-react';

interface StepProps {
  form: any;
  set: (field: string, value: any) => void;
  errors: Record<string, string>;
  inputCls: (field: string) => string;
  selBtnCls: (active: boolean) => string;
}

const CATEGORIES = ['Cardio', 'Strength', 'Free Weights', 'Accessories', 'CrossFit'];
const CONDITIONS = ['New', 'Good', 'Maintenance Required'];

const Step2Equipment: React.FC<StepProps> = ({ form, set, errors, inputCls }) => {
  const [newItem, setNewItem] = useState({
    category: '', name: '', quantity: '', brand: '', condition: '', availability: 'Available', image: ''
  });

  const addItem = () => {
    if (!newItem.category || !newItem.name || !newItem.quantity || !newItem.condition) {
      alert('Please fill all required equipment fields');
      return;
    }
    set('equipment', [...(form.equipment || []), { ...newItem, quantity: Number(newItem.quantity) }]);
    setNewItem({ category: '', name: '', quantity: '', brand: '', condition: '', availability: 'Available', image: '' });
  };

  const removeItem = (index: number) => {
    const updated = [...(form.equipment || [])];
    updated.splice(index, 1);
    set('equipment', updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-[#DCD9CD] pb-2">
        <h2 className="text-lg font-semibold text-[#202522]">Gym Equipment</h2>
        <span className="text-sm text-[#4A514D]">{(form.equipment || []).length} items added</span>
      </div>

      <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-medium text-[#202522] mb-4">Add New Equipment</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#4A514D] mb-1">Category *</label>
            <select 
              value={newItem.category} 
              onChange={e => setNewItem({...newItem, category: e.target.value})}
              className={inputCls('equipmentCategory')}
            >
              <option value="">Select Category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#4A514D] mb-1">Equipment Name *</label>
            <input 
              value={newItem.name} 
              onChange={e => setNewItem({...newItem, name: e.target.value})}
              placeholder="e.g. Treadmill" 
              className={inputCls('equipmentName')} 
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-[#4A514D] mb-1">Quantity *</label>
            <input 
              type="number"
              value={newItem.quantity} 
              onChange={e => setNewItem({...newItem, quantity: e.target.value})}
              placeholder="e.g. 5" 
              className={inputCls('equipmentQty')} 
            />
          </div>
          <div>
            <label className="block text-xs text-[#4A514D] mb-1">Brand (Optional)</label>
            <input 
              value={newItem.brand} 
              onChange={e => setNewItem({...newItem, brand: e.target.value})}
              placeholder="e.g. Life Fitness" 
              className={inputCls('equipmentBrand')} 
            />
          </div>
          <div>
            <label className="block text-xs text-[#4A514D] mb-1">Condition *</label>
            <select 
              value={newItem.condition} 
              onChange={e => setNewItem({...newItem, condition: e.target.value})}
              className={inputCls('equipmentCondition')}
            >
              <option value="">Select Condition</option>
              {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-xs text-[#4A514D] mb-1">Availability</label>
            <select 
              value={newItem.availability} 
              onChange={e => setNewItem({...newItem, availability: e.target.value})}
              className={inputCls('equipmentAvail')}
            >
              <option value="Available">Available</option>
              <option value="In Repair">In Repair</option>
            </select>
          </div>
          <div>
            <button type="button" onClick={addItem} className="w-full flex items-center justify-center space-x-2 py-3 bg-[#FFFFFF] border border-[#34483F] text-[#34483F] rounded-xl hover:bg-[#34483F]/10 transition-colors">
              <Plus size={16} />
              <span>Add Equipment</span>
            </button>
          </div>
        </div>
      </div>
      
      {errors.equipment && <p className="text-teal-400 text-xs">{errors.equipment}</p>}

      {form.equipment && form.equipment.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-[#202522]">Added Equipment</h3>
            <span className="text-[10px] text-[#4A514D] italic">Add more, or click 'Next' below to continue</span>
          </div>
          {form.equipment.map((item: any, i: number) => (
            <div key={i} className="flex items-center justify-between bg-[#FFFFFF] border border-[#DCD9CD] p-4 rounded-xl">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-[#FFFFFF] rounded-lg flex items-center justify-center text-[#34483F]">
                  <Dumbbell size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-[#202522]">{item.name} <span className="text-xs text-[#4A514D]">x{item.quantity}</span></h4>
                  <p className="text-xs text-[#4A514D]">{item.category} • {item.condition} • {item.availability}</p>
                </div>
              </div>
              <button type="button" onClick={() => removeItem(i)} className="p-2 text-[#4A514D] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Step2Equipment;
