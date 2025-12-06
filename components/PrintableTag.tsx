import React from 'react';
import { SiddvaultData } from '../types';

interface PrintableTagProps {
  data: SiddvaultData;
  isEditing?: boolean;
  onUpdate?: (section: keyof SiddvaultData, field: string, value: any) => void;
}

export const PrintableTag: React.FC<PrintableTagProps> = ({ data, isEditing, onUpdate }) => {
  const { core_identity, condition_grading, siddvault_metadata, cultural_historical } = data;

  const renderEditable = (
    section: keyof SiddvaultData,
    field: string,
    value: string,
    className: string,
    multiline: boolean = false
  ) => {
    if (isEditing && onUpdate) {
      if (multiline) {
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onUpdate(section, field, e.target.value)}
            className={`w-full bg-yellow-50/50 border-b border-dashed border-gray-400 outline-none focus:border-black resize-none overflow-hidden ${className}`}
            rows={4}
          />
        );
      }
      return (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onUpdate(section, field, e.target.value)}
          className={`w-full bg-yellow-50/50 border-b border-dashed border-gray-400 outline-none focus:border-black ${className}`}
        />
      );
    }
    return <span className={className}>{value || 'N/A'}</span>;
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white text-black p-8 shadow-2xl font-serif border-4 border-double border-zinc-200">
      {/* Header */}
      <div className="flex justify-between items-end border-b-2 border-black pb-4 mb-6">
        <div className="flex-1 mr-4">
          <h1 className="text-xs font-sans font-bold tracking-[0.2em] text-zinc-500 uppercase mb-1">SIDDVAULT ARCHIVE</h1>
          {renderEditable('core_identity', 'album_title', core_identity.album_title, "text-3xl font-bold leading-none block")}
        </div>
        <div className="text-right">
          <div className="text-xs font-sans text-zinc-500">{siddvault_metadata.record_id}</div>
        </div>
      </div>

      {/* Core Info Grid */}
      <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm mb-6">
        <div>
          <span className="block text-[10px] font-sans uppercase tracking-wider text-zinc-500">Artist</span>
          {renderEditable('core_identity', 'artist_primary', core_identity.artist_primary, "font-semibold text-lg block")}
        </div>
        <div>
          <span className="block text-[10px] font-sans uppercase tracking-wider text-zinc-500">Music Director</span>
          {renderEditable('core_identity', 'music_director', core_identity.music_director, "block")}
        </div>
        <div className="col-span-1">
          <span className="block text-[10px] font-sans uppercase tracking-wider text-zinc-500">Label / Cat No</span>
          <div className="flex gap-1">
            {renderEditable('core_identity', 'label_name', core_identity.label_name, "inline")}
            {!isEditing && <span>—</span>}
            {renderEditable('core_identity', 'catalogue_number', core_identity.catalogue_number, "inline")}
          </div>
        </div>
        <div>
          <span className="block text-[10px] font-sans uppercase tracking-wider text-zinc-500">Year / Origin</span>
          <div className="flex gap-1">
            {renderEditable('core_identity', 'year_of_release', core_identity.year_of_release, "inline")}
            {!isEditing && <span>,</span>}
            {renderEditable('core_identity', 'country_of_pressing', core_identity.country_of_pressing, "inline")}
          </div>
        </div>
      </div>

      {/* Significance */}
      <div className="mb-6 bg-zinc-50 p-4 border-l-2 border-zinc-300">
        <span className="block text-[10px] font-sans uppercase tracking-wider text-zinc-500 mb-1">Cultural Context</span>
        <div className="italic text-sm leading-relaxed opacity-90">
          {renderEditable('cultural_historical', 'cultural_significance', cultural_historical.cultural_significance, "", true)}
        </div>
      </div>

      {/* Grading Footer */}
      <div className="flex justify-between items-center border-t border-zinc-200 pt-4">
        <div className="flex gap-4">
          <div>
            <span className="block text-[9px] font-sans uppercase text-zinc-400">Vinyl</span>
            {renderEditable('condition_grading', 'vinyl_grade', condition_grading.vinyl_grade, "font-bold font-sans text-lg block")}
          </div>
          <div>
            <span className="block text-[9px] font-sans uppercase text-zinc-400">Sleeve</span>
            {renderEditable('condition_grading', 'sleeve_grade', condition_grading.sleeve_grade, "font-bold font-sans text-lg block")}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-sans text-zinc-400 uppercase">Catalogued</div>
          <div className="font-mono text-xs">{siddvault_metadata.date_catalogued}</div>
        </div>
      </div>
    </div>
  );
};
