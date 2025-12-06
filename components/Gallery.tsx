
import React, { useState, useRef } from 'react';
import { SiddvaultData } from '../types';
import { Icons } from './Icons';
import { MetadataView } from './MetadataView';
import { PrintableTag } from './PrintableTag';
import html2canvas from 'html2canvas';

interface GalleryProps {
    records: SiddvaultData[];
    onUpdateRecord: (record: SiddvaultData) => void;
}

export const Gallery: React.FC<GalleryProps> = ({ records, onUpdateRecord }) => {
    const [selectedRecord, setSelectedRecord] = useState<SiddvaultData | null>(null);
    const [activeTab, setActiveTab] = useState<'metadata' | 'tag'>('metadata');
    const [isEditing, setIsEditing] = useState(false);
    const detailRef = useRef<HTMLDivElement>(null);

    const handleDownloadImage = async () => {
        if (detailRef.current && selectedRecord) {
            try {
                const canvas = await html2canvas(detailRef.current, {
                    backgroundColor: '#FACA78', // Ensure matching background
                    scale: 2, // Higher resolution
                    useCORS: true,
                });
                const link = document.createElement('a');
                link.download = `SIDDVAULT-${selectedRecord.core_identity.album_title || 'Record'}-Archive.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            } catch (error) {
                console.error("Failed to download image", error);
                alert("Could not generate image. Please try again.");
            }
        }
    };

    const handleDataUpdate = (section: keyof SiddvaultData, field: string, value: any) => {
        if (!selectedRecord) return;

        const updatedRecord = {
            ...selectedRecord,
            [section]: {
                ...selectedRecord[section],
                [field]: value
            }
        };

        setSelectedRecord(updatedRecord);
        onUpdateRecord(updatedRecord);
    };

    if (records.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-white/30 animate-in fade-in">
                <Icons.Gallery size={64} className="mb-4 opacity-40" />
                <h3 className="text-xl font-serif text-white/60">Vault Empty</h3>
                <p className="text-sm mt-2 max-w-xs text-center font-medium text-white/40">
                    No records have been archived yet. Switch to the Portal to catalog your first vinyl.
                </p>
            </div>
        );
    }

    // Detail View Overlay
    if (selectedRecord) {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => { setSelectedRecord(null); setIsEditing(false); }}
                        className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider"
                    >
                        <Icons.Back size={16} /> Back to Collection
                    </button>

                    <div className="flex items-center gap-3">
                        {/* Edit Toggle */}
                        {activeTab === 'metadata' && (
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-colors ${isEditing ? 'bg-white text-[#F57F5B] border-white' : 'border-white/30 text-white hover:border-white'}`}
                            >
                                <Icons.Edit size={14} /> {isEditing ? 'Editing Active' : 'Edit Data'}
                            </button>
                        )}

                        <button
                            onClick={handleDownloadImage}
                            className="flex items-center gap-2 px-4 py-2 rounded-full text-white hover:bg-white/10 text-xs font-bold uppercase tracking-wider transition-colors border border-white/30"
                        >
                            <Icons.Download size={14} /> Download Image
                        </button>
                    </div>
                </div>

                <div ref={detailRef} className="bg-[#FACA78]/95 backdrop-blur-xl border border-[#794A3A]/20 rounded-2xl p-6 md:p-10 shadow-2xl text-[#794A3A] relative overflow-hidden">

                    {/* Editing Indicator Banner */}
                    {isEditing && activeTab === 'metadata' && (
                        <div className="absolute top-0 left-0 right-0 bg-white/50 border-b border-[#794A3A]/10 py-1 px-4 text-center text-[10px] text-[#794A3A] font-bold uppercase tracking-widest z-10">
                            Edit Mode Active — Changes are saved automatically
                        </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between border-b border-[#794A3A]/10 pb-6 mb-8 gap-4">
                        <div className="flex items-center gap-6">
                            {/* Dual-layer image for detail view as well */}
                            <div className="w-20 h-20 relative rounded-lg shadow-lg border border-[#794A3A]/20 overflow-hidden">
                                {selectedRecord.siddvault_metadata.cover_image && (
                                    <>
                                        <img
                                            src={selectedRecord.siddvault_metadata.cover_image}
                                            className="absolute inset-0 w-full h-full object-cover blur-sm scale-110 opacity-70"
                                            alt="blur-bg"
                                        />
                                        <img
                                            src={selectedRecord.siddvault_metadata.cover_image}
                                            alt={selectedRecord.core_identity.album_title}
                                            className="absolute inset-0 w-full h-full object-contain z-10"
                                        />
                                    </>
                                )}
                            </div>
                            <div>
                                <h2 className="text-3xl font-serif font-bold text-[#794A3A]">{selectedRecord.core_identity.album_title}</h2>
                                <p className="text-[#DD5341] text-sm font-medium uppercase tracking-wide mt-1">
                                    {selectedRecord.core_identity.artist_primary}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveTab('metadata')}
                                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'metadata' ? 'bg-[#794A3A] text-[#FACA78]' : 'bg-transparent text-[#794A3A]/60 hover:text-[#794A3A]'}`}
                            >
                                Metadata
                            </button>
                            <button
                                onClick={() => setActiveTab('tag')}
                                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'tag' ? 'bg-[#794A3A] text-[#FACA78]' : 'bg-transparent text-[#794A3A]/60 hover:text-[#794A3A]'}`}
                            >
                                Museum Tag
                            </button>
                        </div>
                    </div>

                    {activeTab === 'metadata' ? (
                        <MetadataView data={selectedRecord} isEditing={isEditing} onUpdate={handleDataUpdate} />
                    ) : (
                        <div className="flex flex-col items-center py-8">
                            <div className="bg-zinc-100 p-4 rounded shadow-lg max-w-md w-full border border-zinc-200">
                                <PrintableTag data={selectedRecord} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Grid View
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in">
            {records.map((record) => (
                <div
                    key={record.siddvault_metadata.record_id}
                    onClick={() => {
                        // If user wants to open in main portal for full edit:
                        // onSelectRecord(record); 
                        // But current Gallery usually has its own detail view (selectedRecord state).
                        // The user said "show this meta data muesum tag page".
                        // The Gallery's internal view DOES show metadata and tag.
                        // So maybe just selecting it internally is enough?
                        // "if ui clkec teh saved fiel it shoudl show this meta data muesum tag page"
                        // The internal view works. Let's stick with it.
                        setSelectedRecord(record);
                    }}
                    className="group bg-[#FACA78]/80 backdrop-blur-md border border-[#794A3A]/20 hover:border-[#DD5341]/50 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#794A3A]/10"
                >
                    <div className="aspect-square bg-black/5 relative overflow-hidden">
                        {record.siddvault_metadata.cover_image ? (
                            <>
                                {/* Dual Layer Image for Gallery Card */}
                                <img
                                    src={record.siddvault_metadata.cover_image}
                                    className="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-60 transition-opacity duration-700"
                                    alt="background-fill"
                                />
                                <img
                                    src={record.siddvault_metadata.cover_image}
                                    alt={record.core_identity.album_title}
                                    className="absolute inset-0 w-full h-full object-contain z-10 group-hover:scale-105 transition-transform duration-500"
                                />
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#794A3A]/30">
                                <Icons.Disc size={48} />
                            </div>
                        )}
                        <div className="absolute top-2 right-2 bg-[#FACA78]/90 backdrop-blur text-[#794A3A] text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm z-20">
                            {record.core_identity.year_of_release || 'N/A'}
                        </div>
                    </div>

                    <div className="p-5">
                        <div className="mb-3">
                            <h3 className="font-serif text-lg font-bold text-[#794A3A] leading-tight truncate group-hover:text-[#DD5341] transition-colors">
                                {record.core_identity.album_title}
                            </h3>
                            <p className="text-[#794A3A]/70 text-xs font-medium uppercase tracking-wider mt-1 truncate">
                                {record.core_identity.artist_primary}
                            </p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-[#794A3A]/10">
                            <span className="text-[10px] text-[#794A3A]/50 font-mono">{record.siddvault_metadata.record_id}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${record.condition_grading.vinyl_grade.startsWith('NM') || record.condition_grading.vinyl_grade.startsWith('M')
                                    ? 'bg-green-900/10 text-green-700 border border-green-900/10'
                                    : 'bg-[#794A3A]/10 text-[#794A3A]/60'
                                }`}>
                                {record.condition_grading.vinyl_grade}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
