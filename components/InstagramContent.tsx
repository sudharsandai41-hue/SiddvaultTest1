
import React from 'react';
import { SiddvaultData } from '../types';
import { Icons } from './Icons';

export const InstagramContent: React.FC<{ data: SiddvaultData }> = ({ data }) => {
  const { content_generation } = data;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard");
  };

  return (
    <div className="grid gap-6 text-[#794A3A]">
      
      {/* Post Caption */}
      <div className="bg-white/20 rounded-xl p-6 border border-[#794A3A]/20">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-[#DD5341] font-serif text-xl">Post Caption</h3>
            <button onClick={() => copyToClipboard(content_generation.instagram_caption)} className="text-xs flex items-center gap-1 hover:text-[#794A3A]/70 text-[#794A3A]/50 transition-colors">
                <Icons.Share2 size={14} /> Copy
            </button>
        </div>
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-[#794A3A]">
            {content_generation.instagram_caption}
        </pre>
        <div className="mt-4 pt-4 border-t border-[#794A3A]/10 text-[#DD5341]/80 text-sm italic">
            {content_generation.instagram_hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ')}
        </div>
      </div>

      {/* Reel Script */}
      <div className="bg-white/20 rounded-xl p-6 border border-[#794A3A]/20">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-[#DD5341] font-serif text-xl">Reel Script</h3>
            <button onClick={() => copyToClipboard(content_generation.reel_script)} className="text-xs flex items-center gap-1 hover:text-[#794A3A]/70 text-[#794A3A]/50 transition-colors">
                <Icons.Share2 size={14} /> Copy
            </button>
        </div>
        <div className="prose prose-invert prose-sm max-w-none">
            <p className="whitespace-pre-wrap text-[#794A3A]">{content_generation.reel_script}</p>
        </div>
      </div>

    </div>
  );
};