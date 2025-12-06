
import React from 'react';
import { SiddvaultData } from '../types';

interface MetadataViewProps {
  data: SiddvaultData;
  isEditing?: boolean;
  onUpdate?: (section: keyof SiddvaultData, field: string, value: any) => void;
}

const Section = ({ title, children }: { title: string; children?: React.ReactNode }) => (
  <div className="mb-8">
    <h3 className="text-[#794A3A]/80 uppercase tracking-widest text-xs font-bold border-b border-[#794A3A]/20 pb-2 mb-4">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {children}
    </div>
  </div>
);

interface FieldProps {
  label: string;
  value: string | boolean | string[] | any[] | undefined;
  isEditing?: boolean;
  onChange?: (val: any) => void;
}

const Field = ({ label, value, isEditing, onChange }: FieldProps) => {
  if (!isEditing && (!value || (Array.isArray(value) && value.length === 0))) return null;
  
  // Handle Arrays (comma separated for edit)
  if (isEditing && Array.isArray(value)) {
      // If array contains objects, we can't easily edit in a textarea, so we JSON stringify for now or skip
      const isComplexArray = value.some(v => typeof v === 'object' && v !== null);
      
      if (isComplexArray) {
           return (
            <div className="group">
                <dt className="text-[#794A3A]/60 text-[10px] uppercase tracking-wider mb-1">{label.replace(/_/g, ' ')}</dt>
                <div className="text-xs text-[#794A3A]/60 italic">Complex list editing not supported in this view.</div>
            </div>
          );
      }

      return (
        <div className="group">
            <dt className="text-[#794A3A]/60 text-[10px] uppercase tracking-wider mb-1">{label.replace(/_/g, ' ')}</dt>
            <textarea 
                className="w-full bg-white/30 border border-[#794A3A]/20 rounded px-2 py-1 text-sm text-[#794A3A] focus:border-[#DD5341] focus:outline-none focus:bg-white/50"
                value={value.join(', ')}
                onChange={(e) => onChange && onChange(e.target.value.split(',').map(s => s.trim()))}
                rows={2}
            />
        </div>
      )
  }

  // Handle Boolean
  if (typeof value === 'boolean') {
    if (isEditing) {
        return (
            <div className="group flex items-center gap-2 mt-4">
                 <input 
                    type="checkbox" 
                    checked={value} 
                    onChange={(e) => onChange && onChange(e.target.checked)}
                    className="w-4 h-4 rounded border-[#794A3A]/20 text-[#DD5341] focus:ring-[#DD5341] bg-white/30"
                 />
                 <dt className="text-[#794A3A]/60 text-[10px] uppercase tracking-wider">{label.replace(/_/g, ' ')}</dt>
            </div>
        )
    }
    return (
        <div className="group">
            <dt className="text-[#794A3A]/60 text-[10px] uppercase tracking-wider mb-1">{label.replace(/_/g, ' ')}</dt>
            <dd className="text-[#794A3A] font-medium text-sm">{value ? 'Yes' : 'No'}</dd>
        </div>
    );
  }

  // Edit Mode Text
  if (isEditing) {
    const isLongText = String(value).length > 50 || label.includes('trivia') || label.includes('significance') || label.includes('context');
    return (
        <div className="group">
            <dt className="text-[#794A3A]/60 text-[10px] uppercase tracking-wider mb-1">{label.replace(/_/g, ' ')}</dt>
            {isLongText ? (
                 <textarea
                    className="w-full bg-white/30 border border-[#794A3A]/20 rounded px-2 py-1 text-sm text-[#794A3A] focus:border-[#DD5341] focus:outline-none focus:bg-white/50"
                    value={String(value || '')}
                    onChange={(e) => onChange && onChange(e.target.value)}
                    rows={4}
                />
            ) : (
                <input
                    type="text"
                    className="w-full bg-white/30 border border-[#794A3A]/20 rounded px-2 py-1 text-sm text-[#794A3A] focus:border-[#DD5341] focus:outline-none focus:bg-white/50"
                    value={String(value || '')}
                    onChange={(e) => onChange && onChange(e.target.value)}
                />
            )}
        </div>
    );
  }

  // Read Only Display
  let displayValue: React.ReactNode = value as React.ReactNode;
  if (Array.isArray(value)) {
    displayValue = (
        <ul className="list-disc list-inside">
            {value.map((v, i) => {
                // Safely handle object rendering for tracks
                if (typeof v === 'object' && v !== null) {
                     const t = v as any;
                     // Construct a string representation
                     const trackNum = t.track_number ? `${t.track_number}. ` : '';
                     const title = t.title || 'Unknown Track';
                     const singers = t.singers ? (Array.isArray(t.singers) ? t.singers.join(', ') : t.singers) : '';
                     const singerText = singers ? ` — ${singers}` : '';
                     return <li key={i}>{trackNum}{title}{singerText}</li>;
                }
                return <li key={i}>{v}</li>;
            })}
        </ul>
    );
  }

  return (
    <div className="group">
      <dt className="text-[#794A3A]/60 text-[10px] uppercase tracking-wider mb-1">{label.replace(/_/g, ' ')}</dt>
      <dd className="text-[#794A3A] font-medium text-sm leading-relaxed border-l-2 border-transparent group-hover:border-[#794A3A]/30 pl-0 group-hover:pl-2 transition-all duration-200 break-words">
        {displayValue}
      </dd>
    </div>
  );
};

export const MetadataView: React.FC<MetadataViewProps> = ({ data, isEditing = false, onUpdate }) => {
  
  const createUpdater = (section: keyof SiddvaultData, field: string) => (val: any) => {
     if (onUpdate) onUpdate(section, field, val);
  };

  return (
    <div className="space-y-4">
        <Section title="Core Identity">
            <Field isEditing={isEditing} onChange={createUpdater('core_identity', 'album_title')} label="Album Title" value={data.core_identity.album_title} />
            <Field isEditing={isEditing} onChange={createUpdater('core_identity', 'album_title_original_script')} label="Native Script" value={data.core_identity.album_title_original_script} />
            <Field isEditing={isEditing} onChange={createUpdater('core_identity', 'artist_primary')} label="Artist" value={data.core_identity.artist_primary} />
            <Field isEditing={isEditing} onChange={createUpdater('core_identity', 'music_director')} label="Music Director" value={data.core_identity.music_director} />
            <Field isEditing={isEditing} onChange={createUpdater('core_identity', 'film_name')} label="Film" value={data.core_identity.film_name} />
            <Field isEditing={isEditing} onChange={createUpdater('core_identity', 'label_name')} label="Label" value={data.core_identity.label_name} />
            <Field isEditing={isEditing} onChange={createUpdater('core_identity', 'catalogue_number')} label="Catalogue #" value={data.core_identity.catalogue_number} />
            <Field isEditing={isEditing} onChange={createUpdater('core_identity', 'year_of_release')} label="Year" value={data.core_identity.year_of_release} />
            <Field isEditing={isEditing} onChange={createUpdater('core_identity', 'country_of_pressing')} label="Country" value={data.core_identity.country_of_pressing} />
        </Section>

        <Section title="Condition Grading (Visual)">
            <Field isEditing={isEditing} onChange={createUpdater('condition_grading', 'vinyl_grade')} label="Vinyl" value={data.condition_grading.vinyl_grade} />
            <Field isEditing={isEditing} onChange={createUpdater('condition_grading', 'sleeve_grade')} label="Sleeve" value={data.condition_grading.sleeve_grade} />
            <Field isEditing={isEditing} onChange={createUpdater('condition_grading', 'special_damage_notes')} label="Notes" value={data.condition_grading.special_damage_notes} />
            <Field isEditing={isEditing} onChange={createUpdater('condition_grading', 'surface_marks')} label="Surface Marks" value={data.condition_grading.surface_marks} />
        </Section>

        <Section title="Historical Context">
            <Field isEditing={isEditing} onChange={createUpdater('cultural_historical', 'cultural_significance')} label="Cultural Significance" value={data.cultural_historical.cultural_significance} />
            <Field isEditing={isEditing} onChange={createUpdater('cultural_historical', 'film_trivia')} label="Film Trivia" value={data.cultural_historical.film_trivia} />
            <Field isEditing={isEditing} onChange={createUpdater('cultural_historical', 'awards_won')} label="Awards" value={data.cultural_historical.awards_won} />
        </Section>

        <Section title="Tracks">
            <Field isEditing={isEditing} onChange={createUpdater('track_listing', 'side_a')} label="Side A" value={data.track_listing.side_a} />
            <Field isEditing={isEditing} onChange={createUpdater('track_listing', 'side_b')} label="Side B" value={data.track_listing.side_b} />
        </Section>
        
        <Section title="Archival Details">
             <Field isEditing={isEditing} onChange={createUpdater('siddvault_metadata', 'catalogued_by')} label="Catalogued By" value={data.siddvault_metadata.catalogued_by} />
             <Field isEditing={isEditing} onChange={createUpdater('siddvault_metadata', 'date_catalogued')} label="Date" value={data.siddvault_metadata.date_catalogued} />
             <Field isEditing={isEditing} onChange={createUpdater('siddvault_metadata', 'confidence_score')} label="Confidence" value={data.siddvault_metadata.confidence_score} />
        </Section>
    </div>
  );
};