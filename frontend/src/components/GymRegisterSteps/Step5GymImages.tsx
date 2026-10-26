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
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#2A3A3A]">
        <div className="p-3 bg-[#2DD4BF]/15 rounded-xl">
          <ImageIcon className="text-[#2DD4BF]" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#F5FAFA]">Gym Images</h2>
          <p className="text-sm text-[#9AAEAE]">Add photos of your gym to showcase to customers</p>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-semibold text-[#C1D0D0]">Upload Images</label>
        <div className="flex flex-col items-center gap-4">
          <label
            htmlFor="gym-images-upload"
            className="w-full flex flex-col items-center justify-center border-2 border-dashed border-[#2A3A3A] rounded-xl px-6 py-10 text-center bg-[#101819] cursor-pointer hover:border-[#2DD4BF] hover:bg-[#141D1E] transition-all"
          >
            <Upload className="text-[#2DD4BF] mb-3" size={32} />
            <p className="text-[#F5FAFA] font-bold text-sm">Click to upload images</p>
            <p className="text-[#9AAEAE] text-xs mt-1">You can select multiple images at once</p>
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
        {errors.images && <p className="text-red-400 text-xs mt-1">{errors.images}</p>}
      </div>

      {form.images && form.images.length > 0 && (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
          {form.images.map((url: string, index: number) => (
            <div key={index} className="relative group rounded-xl overflow-hidden border border-[#2A3A3A] shadow-sm">
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
        <div className="border-2 border-dashed border-[#2A3A3A] rounded-xl p-8 text-center bg-[#101819] mt-6">
          <ImageIcon className="mx-auto text-[#6A7F7F] mb-3" size={32} />
          <p className="text-[#F5FAFA] font-bold text-sm">No images added yet</p>
          <p className="text-[#9AAEAE] text-xs mt-1">Upload images above to add them to your gym profile</p>
        </div>
      )}
    </div>
  );
};

export default Step5GymImages;
