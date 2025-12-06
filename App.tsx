
import React, { useState, useRef, useEffect } from 'react';
import { ImageCategory, UploadedImage, SiddvaultData } from './types';
import { analyzeVinylImages } from './services/geminiService';
import { Icons } from './components/Icons';
import ImageUploader from './components/ImageUploader';
import { MetadataView } from './components/MetadataView';
import { PrintableTag } from './components/PrintableTag';
import { InstagramContent } from './components/InstagramContent';
import { Gallery } from './components/Gallery';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';

type PortalTab = 'metadata' | 'tag' | 'social' | 'json';
type AppView = 'portal' | 'gallery';

const DRIVE_FOLDER_LINK = "https://drive.google.com/drive/folders/1nC0VVGo-J9tRlZg7QOUNodSkcdSmMKi9?usp=sharing";

// Login Screen Component
const LoginScreen = ({ onLogin }: { onLogin: (status: boolean) => void }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (userId === 'sidd' && password === '1234') {
      onLogin(true);
    } else {
      setError('Access Denied: Invalid Credentials');
      // Shake animation trigger could go here
    }
  };

  return (
    <div className="min-h-screen bg-[#F57F5B] flex flex-col items-center justify-center p-4">
      <div className="animate-in fade-in zoom-in duration-500 w-full max-w-md">

        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8 text-white">
          <div className="relative mb-4">
            <Icons.Disc className="relative z-10 animate-[spin_10s_linear_infinite]" size={64} />
            <div className="absolute inset-0 bg-white/30 blur-xl rounded-full"></div>
          </div>
          <h1 className="font-serif text-4xl font-bold tracking-wider">SIDDVAULT</h1>
          <p className="text-xs font-sans uppercase tracking-[0.4em] opacity-80 mt-2">Vinyl Intelligence System</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#FACA78]/90 backdrop-blur-xl border border-[#794A3A]/20 p-8 rounded-2xl shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">

            <div>
              <label className="block text-[#794A3A] text-xs font-bold uppercase tracking-widest mb-2">
                Operative ID
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full bg-white/40 border border-[#794A3A]/20 rounded-lg px-4 py-3 text-[#794A3A] placeholder-[#794A3A]/40 focus:outline-none focus:border-[#DD5341] focus:bg-white/60 transition-all font-medium"
                placeholder="Enter ID"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-[#794A3A] text-xs font-bold uppercase tracking-widest mb-2">
                Passcode
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/40 border border-[#794A3A]/20 rounded-lg px-4 py-3 text-[#794A3A] placeholder-[#794A3A]/40 focus:outline-none focus:border-[#DD5341] focus:bg-white/60 transition-all font-medium"
                placeholder="••••"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-[#DD5341] text-xs font-bold bg-[#DD5341]/10 p-3 rounded-lg border border-[#DD5341]/20 animate-in fade-in slide-in-from-top-1">
                <Icons.Alert size={14} />
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#794A3A] text-[#FACA78] font-bold uppercase tracking-widest py-4 rounded-lg hover:bg-[#643a2d] transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 group"
            >
              <span>Authenticate</span>
              <Icons.ExternalLink size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[10px] text-[#794A3A]/50 font-mono uppercase">Restricted Access • Archivists Only</p>
          </div>
        </div>

      </div>
    </div>
  );
};

// Magic Loader Component
const MagicLoader = () => (
  <div className="flex flex-col items-center justify-center py-12 animate-in fade-in zoom-in duration-700 relative">
    <div className="relative w-40 h-40 flex items-center justify-center">
      {/* Glowing Backdrop */}
      <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full animate-pulse"></div>

      {/* Spinning Rings */}
      <div className="absolute inset-0 border-2 border-white/10 rounded-full"></div>
      <div className="absolute inset-2 border-2 border-transparent border-t-white/80 rounded-full animate-spin [animation-duration:3s]"></div>
      <div className="absolute inset-6 border-2 border-transparent border-b-white/60 rounded-full animate-spin [animation-duration:2s] direction-reverse"></div>
      <div className="absolute inset-12 border border-white/30 rounded-full animate-ping [animation-duration:2s]"></div>

      {/* Center Core */}
      <div className="relative z-10 bg-white/10 backdrop-blur-md p-4 rounded-full border border-white/20 shadow-2xl">
        <Icons.Disc size={40} className="text-white animate-spin [animation-duration:8s]" />
      </div>
    </div>

    <div className="mt-8 text-center space-y-2 relative z-10">
      <h3 className="text-3xl font-serif font-bold text-white tracking-widest animate-pulse drop-shadow-lg">
        ARCHIVING
      </h3>
      <div className="flex items-center justify-center gap-2 text-white/80 text-[10px] uppercase tracking-[0.3em] font-medium">
        <span>Extracting Visuals</span>
        <span className="animate-pulse">...</span>
      </div>
    </div>
  </div>
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('siddvault_auth') === 'true';
  });
  const [activeView, setActiveView] = useState<AppView>('portal');
  const [savedRecords, setSavedRecords] = useState<SiddvaultData[]>([]);

  // File Counter State
  const [fileCounter, setFileCounter] = useState<number>(() => {
    const saved = localStorage.getItem('siddvault_file_counter');
    return saved ? parseInt(saved, 10) : 1;
  });

  // Load records from disk on mount
  useEffect(() => {
    fetch('/api/load-gallery')
      .then(res => res.json())
      .then(data => {
        if (data && data.records) {
          // data.records is the array
          setSavedRecords(data.records);
        }
        if (data && data.nextId) {
          setFileCounter(data.nextId);
        }
      })
      .catch(err => console.error("Failed to load gallery", err));
  }, []);

  // Save fileCounter to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('siddvault_file_counter', fileCounter.toString());
  }, [fileCounter]);

  // Portal State
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [data, setData] = useState<SiddvaultData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [portalTab, setPortalTab] = useState<PortalTab>('metadata');
  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);

  // Save auth state
  useEffect(() => {
    localStorage.setItem('siddvault_auth', isAuthenticated.toString());
  }, [isAuthenticated]);

  const handleUpload = (file: File, category: ImageCategory) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      setImages((prev) => {
        const filtered = prev.filter((img) => img.category !== category);
        return [...filtered, { file, preview, category }];
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = (category: ImageCategory) => {
    setImages((prev) => prev.filter((img) => img.category !== category));
  };

  const handleAnalyze = async () => {
    if (images.length === 0) {
      setError("Please upload at least one image.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setData(null); // Reset current data

    try {
      const result = await analyzeVinylImages(images);
      // Inject the front cover image into metadata for the Gallery thumbnail
      const frontImage = images.find(img => img.category === 'front')?.preview;
      if (frontImage) {
        result.siddvault_metadata.cover_image = frontImage;
      }
      setData(result);
      setIsEditing(false);
      setIsDirty(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during analysis.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataUpdate = (section: keyof SiddvaultData, field: string, value: any) => {
    if (!data) return;
    setData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      };
    });
    setIsDirty(true);
  };

  // Update record in the saved collection (for Gallery edits)
  const handleGalleryUpdate = (updatedRecord: SiddvaultData) => {
    setSavedRecords(prev => prev.map(r =>
      r.siddvault_metadata.record_id === updatedRecord.siddvault_metadata.record_id ? updatedRecord : r
    ));
  };

  const handleNewScan = () => {
    // If we have data and it IS dirty, confirm.
    // If not dirty (just saved, or empty), go ahead without confirm.
    if (!data || !isDirty || window.confirm("Start a new scan? Unsaved changes to the current record will be lost.")) {
      setImages([]);
      setData(null);
      setError(null);
      setIsEditing(false);
      setPortalTab('metadata');
      setIsDirty(false);
      setActiveView('portal'); // Ensure we are on the portal view
    }
  };

  const handleSaveToGalleryAndDrive = async () => {
    if (!data) return;

    // Force exit edit mode so snapshot captures clean text, not inputs
    if (isEditing) {
      setIsEditing(false);
      // Wait for React to re-render the view
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    setIsSyncing(true);

    try {
      const zip = new JSZip();

      // 1. Generate Naming Convention
      // 1. Generate Naming Convention
      // Format: NNN_Title (e.g., 001_Singaravelan)
      const prefix = fileCounter.toString().padStart(3, '0');
      const title = data.core_identity.album_title || 'Album';
      const safeName = `${prefix}_${title}`.replace(/[^a-z0-9]/gi, '_').replace(/_{2,}/g, '_');

      // Increment counter for next time
      setFileCounter(prev => prev + 1);

      // 2. Add JSON Metadata
      // 2. Add JSON Metadata & 3. Add Cover Image & 4. Snapshot
      // Prepare data for server-side saving
      const folderName = safeName;
      let museumTagBase64: string | null = null;
      let infoSheetBase64: string | null = null;
      let pdfBase64: string | null = null;

      // Capture Museum Tag (Always, from hidden export div)
      const exportTag = document.getElementById('export-tag');
      if (exportTag) {
        try {
          const canvas = await html2canvas(exportTag, { scale: 2, backgroundColor: '#ffffff' });
          museumTagBase64 = canvas.toDataURL('image/png');
        } catch (e) {
          console.warn("Could not generate museum tag snapshot", e);
        }
      }

      // Capture Info Sheet (Only if visible on Metadata view)
      if (resultsRef.current && portalTab === 'metadata') {
        try {
          const canvas = await html2canvas(resultsRef.current, {
            backgroundColor: '#FACA78',
            scale: 2
          });
          infoSheetBase64 = canvas.toDataURL('image/png');
        } catch (e) {
          console.warn("Could not generate info sheet snapshot", e);
        }
      }

      // Generate PDF Compilation
      try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Helper to add image if exists
        const addImageToDoc = (imgData: string | undefined, title: string, yPos: number, height: number = 100) => {
          if (imgData) {
            doc.text(title, 10, yPos - 5);
            // simple fit to width logic
            const imgProps = doc.getImageProperties(imgData);
            const ratio = imgProps.width / imgProps.height;
            const w = 180;
            const h = w / ratio;
            // if h is too big for space, scale down
            doc.addImage(imgData, 'PNG', 15, yPos, w, h);
          }
        };

        doc.setFontSize(20);
        doc.text(`Archival Report: ${title}`, 10, 20);
        doc.setFontSize(12);
        doc.text(`Catalogued: ${data.siddvault_metadata.date_catalogued}`, 10, 30);

        // Page 1: Covers
        doc.setFontSize(16);
        doc.text("Sleeve Artwork", 10, 50);

        let y = 60;
        const front = images.find(img => img.category === 'front')?.preview;
        if (front) {
          const props = doc.getImageProperties(front);
          const w = 90; const h = w / (props.width / props.height);
          doc.text("Front Cover", 10, y - 2);
          doc.addImage(front, 'PNG', 10, y, w, h);

          const back = images.find(img => img.category === 'back')?.preview;
          if (back) {
            doc.text("Back Cover", 110, y - 2);
            doc.addImage(back, 'PNG', 110, y, w, h);
          }
        }

        // Page 2: Labels
        doc.addPage();
        doc.text("Media Labels", 10, 20);
        y = 30;
        const labelA = images.find(img => img.category === 'labelA')?.preview;
        if (labelA) {
          const props = doc.getImageProperties(labelA);
          const w = 80; const h = w / (props.width / props.height);
          doc.text("Side A", 10, y - 2);
          doc.addImage(labelA, 'PNG', 10, y, w, h);

          const labelB = images.find(img => img.category === 'labelB')?.preview;
          if (labelB) {
            doc.text("Side B", 110, y - 2);
            doc.addImage(labelB, 'PNG', 110, y, w, h);
          }
        }

        // Page 3: Museum Tag
        if (museumTagBase64) {
          doc.addPage();
          doc.text("Archival Museum Tag", 10, 20);
          const props = doc.getImageProperties(museumTagBase64);
          const w = 180; const h = w / (props.width / props.height);
          doc.addImage(museumTagBase64, 'PNG', 15, 30, w, h);
        }

        // Page 4: Full Metadata Sheet
        if (infoSheetBase64) {
          doc.addPage();
          doc.text("Detailed Metadata", 10, 20);
          const props = doc.getImageProperties(infoSheetBase64);
          const w = 190; const h = w / (props.width / props.height);
          doc.addImage(infoSheetBase64, 'PNG', 10, 30, w, h);
        }

        pdfBase64 = doc.output('datauristring');

      } catch (e) {
        console.error("PDF generation failed", e);
      }

      // 5. Send to Server for Local Save
      const payload = {
        folderName,
        metadata: data,
        // Send all images with desired filenames
        images: {
          'Front Cover': images.find(img => img.category === 'front')?.preview,
          'Back Cover': images.find(img => img.category === 'back')?.preview,
          'Label Side A': images.find(img => img.category === 'labelA')?.preview,
          'Label Side B': images.find(img => img.category === 'labelB')?.preview,
          'Museum Tag': museumTagBase64,
          'Info Sheet': infoSheetBase64,
          'Full Documentation': pdfBase64 // Will save as .pdf via updated server logic (to be done)
        }
      };

      console.log("Saving payload:", payload);

      const response = await fetch('/api/save-local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Server save failed");
      }

      // 7. Update Local State (Optimistic)
      const newSavedRecords = [data, ...savedRecords];
      setSavedRecords(newSavedRecords);
      // No need to save to localStorage as disk is source of truth
      // But we might want to re-fetch to ensure consistency:
      // fetchGallery(); // (optional optimization)

      // Do not clear the current view so user can still see what they saved
      setIsEditing(false);
      setIsDirty(false); // Mark as saved/clean

      // Use setTimeout to ensure React render cycle completes before blocking with alert
      setTimeout(() => {
        alert(`Record saved locally to Gallery/${folderName}`);
      }, 100);

    } catch (e: any) {
      console.error("Sync failed", e);
      setError(`Save failed: ${e.message}`);
      // Fallback save locally to app state even if disk save fails
      const newSavedRecords = [data, ...savedRecords];
      setSavedRecords(newSavedRecords);

      setSavedRecords(prev => [data, ...prev]);

      try {
        // Only try to save to localStorage as a temporary emergency backup if disk failed
        // But since we are moving away from localStorage, maybe just alert?
        // Let's keep the alert.
        // Use setTimeout to ensure React render cycle completes before blocking with alert
        setTimeout(() => {
          alert(`Saved to in-app memory (Disk save failed: ${e.message})`);
        }, 100);
      } catch (storageErr: any) {
        console.error("Storage failed in catch", storageErr);
        setTimeout(() => {
          alert(`CRITICAL: Disk save failed AND Browser memory full. Error: ${e.message}`);
        }, 100);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDownloadImage = async () => {
    if (resultsRef.current) {
      try {
        const canvas = await html2canvas(resultsRef.current, {
          backgroundColor: '#FACA78', // Ensure matching background
          scale: 2, // Higher resolution
        });
        const link = document.createElement('a');
        link.download = `SIDDVAULT-${data?.core_identity.album_title || 'Record'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (error) {
        console.error("Failed to download image", error);
        alert("Could not generate image. Please try again.");
      }
    }
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={setIsAuthenticated} />;
  }

  return (
    <div className="min-h-screen bg-[#F57F5B] text-white font-sans selection:bg-amber-500/30 flex flex-col animate-in fade-in duration-700">

      {/* Header */}
      <header className="border-b border-white/10 bg-[#F57F5B]/90 backdrop-blur-md sticky top-0 z-50 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-28 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-4 text-white cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setActiveView('gallery')}>
            <div className="relative">
              <Icons.Disc className={`relative z-10 ${isLoading ? 'animate-spin' : ''}`} size={42} />
              <div className="absolute inset-0 bg-white/20 blur-lg rounded-full"></div>
            </div>
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-wider leading-none">SIDDVAULT</h1>
              <p className="text-xs text-white/80 font-sans uppercase tracking-[0.3em] mt-1">Vinyl Intelligence System</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center bg-black/10 p-1.5 rounded-full border border-white/10">
            <button
              onClick={() => {
                if (data) {
                  if (window.confirm("Start a new scan? Unsaved changes will be lost.")) {
                    handleNewScan();
                  }
                } else {
                  setActiveView('portal');
                }
              }}
              disabled={isLoading}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 ${activeView === 'portal' ? 'bg-[#FACA78] text-[#794A3A] shadow-sm' : 'text-white/80 hover:text-white disabled:opacity-50'}`}
            >
              <Icons.Portal size={18} /> <span className="hidden md:inline">Portal</span>
            </button>
            <button
              onClick={() => setActiveView('gallery')}
              disabled={isLoading}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 ${activeView === 'gallery' ? 'bg-[#FACA78] text-[#794A3A] shadow-sm' : 'text-white/80 hover:text-white disabled:opacity-50'}`}
            >
              <Icons.Gallery size={18} /> <span className="hidden md:inline">Gallery</span>
              {savedRecords.length > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${activeView === 'gallery' ? 'bg-[#794A3A]/20' : 'bg-white/20'}`}>{savedRecords.length}</span>
              )}
            </button>
          </nav>

        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 md:py-12 w-full">

        {/* === GALLERY VIEW === */}
        {activeView === 'gallery' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-end justify-between mb-8 border-b border-white/20 pb-4">
              <div>
                <h2 className="font-serif text-4xl text-white">The Collection</h2>
                <p className="text-white/80 mt-1 text-sm">Archived Metadata & Digital Assets</p>
              </div>
            </div>
            <Gallery records={savedRecords} onUpdateRecord={handleGalleryUpdate} />
          </div>
        )}

        {/* === PORTAL VIEW === */}
        {activeView === 'portal' && (
          <>
            {/* Portal Intro (Only when clear) */}
            {!data && !isLoading && (
              <div className="text-center mb-12 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h2 className="font-serif text-4xl md:text-5xl text-white mb-6">Catalog New Artifact</h2>
                <p className="text-white/90 font-medium text-lg">
                  Upload detailed scans of the vinyl sleeve and labels. The system will extract metadata and grade condition.
                </p>
              </div>
            )}

            {/* Upload Section */}
            <div className={data ? 'hidden' : 'block transition-all duration-500'}>
              <ImageUploader
                images={images}
                onUpload={handleUpload}
                onRemove={handleRemove}
                isScanning={isLoading}
              />
            </div>

            {/* Magic Loader & Analysis Trigger */}
            {!data && (
              <div className="flex justify-center mb-12 min-h-[200px] items-center">
                {isLoading ? (
                  <MagicLoader />
                ) : (
                  <button
                    onClick={handleAnalyze}
                    disabled={images.length === 0}
                    className={`
                            group relative overflow-hidden rounded-full px-12 py-4 font-serif font-bold text-lg tracking-widest uppercase transition-all duration-500 shadow-xl
                            ${images.length > 0 ? 'bg-[#FACA78] text-[#794A3A] hover:scale-105 hover:shadow-lg' : 'bg-[#FACA78] bg-opacity-20 text-white/40 cursor-not-allowed border border-[#FACA78]/30'}
                        `}
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      <Icons.Scan />
                      Initialize Analysis
                    </span>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  </button>
                )}
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="max-w-2xl mx-auto mb-8 p-4 border border-white/30 bg-red-500/20 rounded-lg flex items-center gap-3 text-white backdrop-blur-md">
                <Icons.Alert size={20} />
                <p>{error}</p>
              </div>
            )}

            {/* Results View */}
            {data && !isLoading && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">

                {/* Results Header & Actions */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-2xl">
                  <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                    {[
                      { id: 'metadata', label: 'Metadata', icon: Icons.FileJson },
                      { id: 'tag', label: 'Museum Tag', icon: Icons.Tag },
                      { id: 'social', label: 'Social', icon: Icons.Share2 },
                      { id: 'json', label: 'JSON', icon: Icons.FileJson },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setPortalTab(tab.id as PortalTab)}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap
                            ${portalTab === tab.id ? 'bg-white text-[#F57F5B]' : 'text-white/70 hover:text-white'}
                        `}
                      >
                        <tab.icon size={14} />
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* New Scan Button */}
                    <button
                      onClick={handleNewScan}
                      className="flex items-center gap-2 px-4 py-2 rounded-full text-white hover:bg-white/10 text-xs font-bold uppercase tracking-wider transition-colors border border-white/30"
                      title="Start New Scan"
                    >
                      <Icons.PlusCircle size={14} /> <span className="hidden sm:inline">New Scan</span>
                    </button>

                    {/* Download Button */}
                    <button
                      onClick={handleDownloadImage}
                      className="flex items-center gap-2 px-4 py-2 rounded-full text-white hover:bg-white/10 text-xs font-bold uppercase tracking-wider transition-colors border border-white/30"
                      title="Download as Image"
                    >
                      <Icons.Download size={14} /> <span className="hidden sm:inline">Download</span>
                    </button>

                    {/* Edit Toggle */}
                    {(portalTab === 'metadata' || portalTab === 'tag') && (
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-colors flex-1 md:flex-auto justify-center ${isEditing ? 'bg-white text-[#F57F5B] border-white' : 'border-white/30 text-white hover:border-white'}`}
                      >
                        <Icons.Edit size={14} /> {isEditing ? 'Editing Active' : 'Edit Data'}
                      </button>
                    )}

                    {/* Save & Sync Button */}
                    <button
                      onClick={handleSaveToGalleryAndDrive}
                      disabled={isSyncing || !isDirty}
                      className="flex items-center gap-2 px-6 py-2 rounded-full bg-white hover:bg-gray-100 text-[#F57F5B] text-xs font-bold uppercase tracking-wider shadow-lg transition-all hover:scale-105 flex-1 md:flex-auto justify-center disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      {isSyncing ? (
                        <>
                          <Icons.Disc size={14} className="animate-spin" /> Syncing...
                        </>
                      ) : !isDirty ? (
                        <>
                          <Icons.Check size={14} /> Saved
                        </>
                      ) : (
                        <>
                          <Icons.Cloud size={14} /> Save to Vault
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Content Area - Now #FACA78 with Dark Brown Text */}
                <div ref={resultsRef} className="bg-[#FACA78] text-[#794A3A] border border-[#794A3A]/20 rounded-2xl p-6 md:p-10 min-h-[600px] shadow-2xl relative overflow-hidden">

                  {/* Editing Indicator Banner */}
                  {isEditing && (portalTab === 'metadata' || portalTab === 'tag') && (
                    <div className="absolute top-0 left-0 right-0 bg-white/50 border-b border-[#794A3A]/10 py-1 px-4 text-center text-[10px] text-[#794A3A] font-bold uppercase tracking-widest">
                      Edit Mode Active — Changes will be reflected in export
                    </div>
                  )}

                  {portalTab === 'metadata' && <MetadataView data={data} isEditing={isEditing} onUpdate={handleDataUpdate} />}

                  {portalTab === 'tag' && (
                    <div className="flex flex-col items-center">
                      <div className="bg-zinc-100 p-4 rounded shadow-lg transform hover:scale-[1.01] transition-transform duration-500">
                        <PrintableTag data={data} isEditing={isEditing} onUpdate={handleDataUpdate} />
                      </div>
                      <p className="mt-8 text-[#794A3A]/60 text-xs uppercase tracking-widest">4x3" Archival Standard Format</p>
                    </div>
                  )}

                  {portalTab === 'social' && <InstagramContent data={data} />}

                  {portalTab === 'json' && (
                    <div className="relative group">
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={() => navigator.clipboard.writeText(JSON.stringify(data, null, 2))}
                          className="text-xs bg-[#794A3A] hover:bg-[#794A3A]/80 px-3 py-1 rounded text-white transition-colors"
                        >
                          Copy JSON
                        </button>
                      </div>
                      <pre className="text-xs text-[#794A3A] font-mono overflow-x-auto p-4 bg-white/20 rounded-lg border border-[#794A3A]/10 max-h-[600px] overflow-y-auto">
                        {JSON.stringify(data, null, 2)}
                      </pre>
                    </div>
                  )}

                </div>

                {/* Restart Button (Bottom) */}
                <div className="mt-8 text-center">
                  <button
                    onClick={() => { setData(null); setImages([]); setIsEditing(false); }}
                    className="text-white/60 hover:text-white text-xs uppercase tracking-widest transition-colors font-bold"
                  >
                    Discard & Start Over
                  </button>
                </div>

                {/* Hidden Export Area - Always render specific artifacts for snapshotting */}
                {data && (
                  <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                    <div id="export-tag" className="bg-white p-8 w-[600px]">
                      <PrintableTag data={data} isEditing={false} />
                    </div>
                  </div>
                )}

              </div>
            )}
          </>
        )}
      </main>

      <footer className="py-6 text-center border-t border-white/10 mt-auto">
        <p className="text-[10px] text-white/60 font-sans uppercase tracking-widest">
          SIDDVAULT System v2.0 • <span className="text-white font-bold">Confidential</span>
        </p>
      </footer>
    </div>
  );
}

export default App;