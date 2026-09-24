import React, { useState } from 'react';
import { FileCheck, ChevronDown, ChevronUp } from 'lucide-react';

interface StepProps {
  form: any;
  set: (field: string, value: any) => void;
  errors: Record<string, string>;
}

const Step7Documents: React.FC<StepProps> = ({ form, set, errors }) => {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <div className="space-y-6">
      <div className="border-b border-[#D3DFDA] pb-2 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-[#202828]">Verification & Documents</h2>
          <p className="text-sm text-[#455250]">Acknowledge the requirements for gym verification.</p>
        </div>
        <FileCheck className="text-[#164A4A]" size={24} />
      </div>

      <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl p-6 space-y-4">
        <p className="text-sm text-[#455250] leading-relaxed">
          To ensure the quality and safety of our platform, all registered gyms must be verified. 
          Our onboarding team will contact you shortly after registration to collect the following documents:
        </p>
        
        <ul className="list-disc pl-5 text-sm text-[#455250] space-y-2">
          <li>Business Registration / Trade License</li>
          <li>Owner's Government ID Proof</li>
          <li>Gym Establishment Photos</li>
          <li>Bank Account Details for Payouts</li>
        </ul>

        <div className="pt-4 border-t border-[#D3DFDA] space-y-4">
          <div>
            <label className="flex items-start space-x-3 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-0.5">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={form.acceptTerms || false} 
                  onChange={(e) => set('acceptTerms', e.target.checked)} 
                />
                <div className={`w-5 h-5 border rounded flex items-center justify-center transition-colors ${form.acceptTerms ? 'bg-[#164A4A] border-[#164A4A]' : 'border-[#555] group-hover:border-[#164A4A]'}`}>
                  {form.acceptTerms && <FileCheck size={14} className="text-black" />}
                </div>
              </div>
              <div className="text-sm text-[#455250] flex-1">
                I confirm that I have the required documents ready for verification and I accept the <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowTerms(!showTerms); }} className="text-[#164A4A] hover:underline font-medium inline-flex items-center">Terms & Conditions {showTerms ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />}</button>.
              </div>
            </label>
            {errors.acceptTerms && <p className="text-teal-400 text-xs ml-8 mt-1">{errors.acceptTerms}</p>}
            
            {showTerms && (
              <div className="ml-8 mt-3 p-4 bg-[#F2EFE8] border border-[#D3DFDA] rounded-lg text-xs text-[#455250] space-y-2">
                <p><strong>1. Agreement to Terms:</strong> By accessing our platform, you agree to these terms.</p>
                <p><strong>2. User Responsibilities:</strong> You must provide accurate and verifiable information about your gym facility.</p>
                <p><strong>3. Platform Fees:</strong> AI GYM charges a standard platform fee for transactions processed through the system.</p>
                <p><strong>4. Termination:</strong> We reserve the right to suspend or terminate gym profiles that violate our community standards.</p>
                <p><strong>5. Liability:</strong> AI GYM is not liable for disputes between gym owners and their members.</p>
              </div>
            )}
          </div>

          <div>
            <label className="flex items-start space-x-3 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-0.5">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={form.acceptPrivacy || false} 
                  onChange={(e) => set('acceptPrivacy', e.target.checked)} 
                />
                <div className={`w-5 h-5 border rounded flex items-center justify-center transition-colors ${form.acceptPrivacy ? 'bg-[#164A4A] border-[#164A4A]' : 'border-[#555] group-hover:border-[#164A4A]'}`}>
                  {form.acceptPrivacy && <FileCheck size={14} className="text-black" />}
                </div>
              </div>
              <div className="text-sm text-[#455250] flex-1">
                I accept the <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowPrivacy(!showPrivacy); }} className="text-[#164A4A] hover:underline font-medium inline-flex items-center">Privacy Policy {showPrivacy ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />}</button>.
              </div>
            </label>
            {errors.acceptPrivacy && <p className="text-teal-400 text-xs ml-8 mt-1">{errors.acceptPrivacy}</p>}
            
            {showPrivacy && (
              <div className="ml-8 mt-3 p-4 bg-[#F2EFE8] border border-[#D3DFDA] rounded-lg text-xs text-[#455250] space-y-2">
                <p><strong>1. Data Collection:</strong> We collect business details, contact information, and location data to list your gym on our platform.</p>
                <p><strong>2. Data Usage:</strong> Your data is used exclusively to facilitate bookings, manage memberships, and improve our services.</p>
                <p><strong>3. Data Security:</strong> We employ industry-standard security measures to protect your sensitive business information.</p>
                <p><strong>4. Third-Party Sharing:</strong> We do not sell your data to third parties. Data may be shared with payment processors to facilitate transactions.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step7Documents;
