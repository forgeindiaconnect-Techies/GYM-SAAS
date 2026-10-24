import { UploadCloud, CheckCircle2, FileText, AlertCircle } from 'lucide-react';

export const Step7Documents = ({ data, updateData, errors }: any) => {
  const handleFileUpload = (field: string, file: File | null) => {
    if (file) {
      updateData({ 
        [field]: file.name,
        [`${field}Url`]: URL.createObjectURL(file)
      });
    }
  };

  const DocumentUpload = ({ title, field, isRequired, desc }: { title: string, field: string, isRequired: boolean, desc: string }) => {
    const hasFile = !!data[field];
    const fileUrl = data[`${field}Url`];
    const error = errors[field];

    return (
      <div className={`bg-[#FFFFFF] p-6 rounded-2xl border transition-colors ${error ? 'border-[#1B2728]/50' : hasFile ? 'border-green-500/50 bg-green-500/5' : 'border-[#2A3A3A]'}`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-[#F5FAFA] flex items-center">
              {title} {isRequired && <span className="text-[#2DD4BF] ml-1">*</span>}
            </h3>
            <p className="text-[#9AAEAE] text-sm mt-1">{desc}</p>
          </div>
          {hasFile ? (
            <div className="bg-green-500/20 text-green-500 p-2 rounded-full">
              <CheckCircle2 size={24} />
            </div>
          ) : (
            <div className="bg-[#FFFFFF] text-[#9AAEAE] p-2 rounded-full">
              <FileText size={24} />
            </div>
          )}
        </div>

        {!hasFile ? (
          <div className="relative border-2 border-dashed border-[#2A3A3A] hover:border-[#2DD4BF] rounded-xl p-8 transition-colors text-center group cursor-pointer">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload(field, e.target.files?.[0] || null)}
            />
            <UploadCloud size={32} className="mx-auto text-[#9AAEAE] group-hover:text-[#2DD4BF] mb-3 transition-colors" />
            <p className="text-sm font-semibold text-[#F5FAFA]">Click to upload or drag and drop</p>
            <p className="text-xs text-[#9AAEAE] mt-1">PDF, JPG, PNG (Max. 10MB)</p>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-[#FFFFFF] border border-[#2A3A3A] p-4 rounded-xl">
            <div className="flex items-center space-x-3 truncate">
              <FileText size={20} className="text-[#2DD4BF] shrink-0" />
              <span className="text-sm font-medium text-[#F5FAFA] truncate">{data[field]}</span>
            </div>
            <div className="flex items-center space-x-4 shrink-0 ml-4">
              {fileUrl && (
                <a 
                  href={fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#2DD4BF] hover:text-[#2DD4BF] transition-colors"
                >
                  View
                </a>
              )}
              <button 
                onClick={() => updateData({ [field]: '', [`${field}Url`]: '' })}
                className="text-xs font-bold text-[#1B2728] hover:text-[#2DD4BF] transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        )}
        
        {error && (
          <p className="text-[#1B2728] text-xs font-bold mt-3 flex items-center">
            <AlertCircle size={12} className="mr-1" /> {error}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#F5FAFA] tracking-tight">Verification Documents</h2>
        <p className="text-[#9AAEAE] mt-1">Upload the required legal documents to verify the gym's authenticity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DocumentUpload 
          title="Business Registration" 
          field="businessRegFile" 
          isRequired={true}
          desc="Official proof of business registration or incorporation."
        />
        <DocumentUpload 
          title="Gym License" 
          field="gymLicenseFile" 
          isRequired={true}
          desc="Valid license to operate a fitness facility in the registered state/city."
        />
        <DocumentUpload 
          title="Address Proof" 
          field="addressProofFile" 
          isRequired={true}
          desc="Utility bill or lease agreement for the gym's physical address."
        />
      </div>
    </div>
  );
};
