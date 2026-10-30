import React from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface StepProps {
  form: any;
  set: (field: string, value: any) => void;
  errors: Record<string, string>;
}

const Step5GymImages: React.FC<StepProps> = ({ form, set, errors }) => {
  const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    const readers = files
      .filter((file) => file.type.startsWith('image/'))
      .map((file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        })
      );
    Promise.all(readers).then((dataUrls) => {
      set('images', [...form.images, ...dataUrls]);
    });
    event.target.value = '';
  };

  const removeImage = (index: number) => {
    const updated = [...form.images];
    updated.splice(index, 1);
    set('images', updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#E2E8F0]">
        <div className="p-3 bg-[#FFF7ED] rounded-xl">
          <ImageIcon className="text-[#EA580C]" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#111827]">Gym Images</h2>
          <p className="text-sm text-[#64748B]">Add photos of your gym to showcase to customers</p>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-semibold text-[#111827]">Upload Images</label>
        <div className="flex flex-col items-center gap-4">
          <label
            htmlFor="gym-images-upload"
            className="w-full flex flex-col items-center justify-center border-2 border-dashed border-[#E2E8F0] rounded-xl px-6 py-10 text-center bg-[#FFFFFF] cursor-pointer hover:border-[#FDBA74] hover:bg-[#FFFFFF] transition-all"
          >
            <Upload className="text-[#EA580C] mb-3" size={32} />
            <p className="text-[#111827] font-bold text-sm">Click to upload images</p>
            <p className="text-[#64748B] text-xs mt-1">You can select multiple images at once</p>
          </label>
          <input
            id="gym-images-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFiles}
            className="hidden"
          />
        </div>
        {errors.images && <p className="text-[#B91C1C] text-xs mt-1">{errors.images}</p>}
      </div>

      {form.images && form.images.length > 0 && (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
          {form.images.map((url: string, index: number) => (
            <div key={index} className="relative group rounded-xl overflow-hidden border border-[#E2E8F0] shadow-sm">
              <img 
                src={url} 
                alt={`Gym image ${index + 1}`} 
                className="w-full h-32 object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500/90 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {form.images && form.images.length === 0 && (
        <div className="border-2 border-dashed border-[#E2E8F0] rounded-xl p-8 text-center bg-[#FFFFFF] mt-6">
          <ImageIcon className="mx-auto text-[#64748B] mb-3" size={32} />
          <p className="text-[#111827] font-bold text-sm">No images added yet</p>
          <p className="text-[#64748B] text-xs mt-1">Upload images above to add them to your gym profile</p>
        </div>
      )}
    </div>
  );
};

export default Step5GymImages;
