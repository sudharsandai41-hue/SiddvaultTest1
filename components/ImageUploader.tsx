import React, { useRef } from 'react';
import { ImageCategory, UploadedImage } from '../types';
import { Icons } from './Icons';

interface ImageUploaderProps {
  images: UploadedImage[];
  onUpload: (file: File, category: ImageCategory) => void;
  onRemove: (category: ImageCategory) => void;
  isScanning?: boolean;
}

const categories: { id: ImageCategory; label: string }[] = [
  { id: 'front', label: 'Front Cover' },
  { id: 'back', label: 'Back Cover' },
  { id: 'labelA', label: 'Label Side A' },
  { id: 'labelB', label: 'Label Side B' },
];

const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onUpload, onRemove, isScanning = false }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {categories.map((cat) => {
        const existingImage = images.find((img) => img.category === cat.id);
        return (
          <UploadSlot
            key={cat.id}
            category={cat.id}
            label={cat.label}
            image={existingImage}
            onUpload={onUpload}
            onRemove={onRemove}
            isScanning={isScanning}
          />
        );
      })}
    </div>
  );
};

const UploadSlot: React.FC<{
  category: ImageCategory;
  label: string;
  image?: UploadedImage;
  onUpload: (file: File, category: ImageCategory) => void;
  onRemove: (category: ImageCategory) => void;
  isScanning: boolean;
}> = ({ category, label, image, onUpload, onRemove, isScanning }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0], category);
    }
  };

  return (
    <div 
      className={`relative group aspect-square rounded-lg border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center overflow-hidden cursor-pointer
      ${image ? 'border-white/50 bg-black/20' : 'border-white/30 bg-white/5 hover:border-white/60 hover:bg-white/10'}`}
      onClick={() => !image && inputRef.current?.click()}
    >
      {image ? (
        <>
            <img src={image.preview} alt={label} className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            
            {/* Scanning Effect Overlay */}
            {isScanning && (
              <div className="absolute inset-0 z-20 pointer-events-none">
                <div className="absolute inset-x-0 h-1/3 animate-scan bg-gradient-to-b from-transparent via-white/40 to-transparent blur-sm"></div>
                <div className="absolute inset-0 border-2 border-white/50 animate-pulse rounded-lg"></div>
              </div>
            )}

            {!isScanning && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onRemove(category); }}
                    className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-30"
                >
                    <Icons.Close size={14} />
                </button>
            )}
            
            <div className="absolute bottom-2 left-2 right-2 text-xs font-medium text-white bg-black/60 backdrop-blur-sm p-1 rounded text-center shadow z-10">
                {label}
            </div>
        </>
      ) : (
        <div 
            className="flex flex-col items-center justify-center text-white/60 group-hover:text-white w-full h-full transition-colors"
        >
          <Icons.Camera size={24} className="mb-2 opacity-70" />
          <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
          <span className="text-[9px] mt-1 font-medium opacity-60">Click to Upload</span>
        </div>
      )}
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept="image/*"
        onChange={handleChange}
        disabled={isScanning}
      />
    </div>
  );
};

export default ImageUploader;