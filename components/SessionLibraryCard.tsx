
import React, { useState, useRef } from 'react';
import type { LibraryItem, AnalysisResult, GeneratedLibraryItem } from '../types';
import { FolderIcon, DownloadIcon } from './icons';
import { createMidiBlob } from '../services/midiService';
import { generateFilename } from '../services/autoNamingService';

interface SessionLibraryCardProps {
  items: LibraryItem[];
  analysisResult: AnalysisResult | null;
}

const ITEM_HEIGHT = 88; // Estimated height for one item row including spacing
const VISIBLE_ITEMS_BUFFER = 3; // Render a few extra items above/below for smooth scrolling

const SessionLibraryCard: React.FC<SessionLibraryCardProps> = ({ items, analysisResult }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const handleDownload = (item: GeneratedLibraryItem) => {
    const { result, prompt } = item;
    if (!result?.tracks || result.tracks.length === 0) {
      alert("No MIDI data to download for this item.");
      return;
    }

    const bpm = result?.bpm || analysisResult?.bpm || 120;
    const blob = createMidiBlob(result.tracks, { bpm });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = generateFilename(prompt, analysisResult, 'midi');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };
  
  const containerHeight = scrollContainerRef.current?.clientHeight || 0;
  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - VISIBLE_ITEMS_BUFFER);
  const endIndex = Math.min(items.length, Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + VISIBLE_ITEMS_BUFFER);
  const visibleItems = items.slice(startIndex, endIndex);
  const totalHeight = items.length * ITEM_HEIGHT;

  return (
    <div className="bg-surface border border-surface-border rounded-lg p-6 mb-6 shadow-lg">
      <div className="flex items-center mb-4">
        <FolderIcon className="h-6 w-6 text-secondary mr-3" />
        <h2 className="text-xl font-bold text-secondary">Session Library</h2>
      </div>
      
      {items.length === 0 ? (
        <div className="text-center text-on-surface-muted py-8">
          Your analyzed and generated ideas will appear here.
        </div>
      ) : (
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="h-96 overflow-y-auto relative"
        >
          <div style={{ height: `${totalHeight}px` }} className="relative w-full">
            <div style={{ transform: `translateY(${startIndex * ITEM_HEIGHT}px)` }} className="absolute top-0 left-0 w-full pr-2">
              {visibleItems.map(item => (
                <div key={item.id} className="bg-bkg/50 p-4 rounded-md flex justify-between items-start gap-4 mb-3" style={{ height: `${ITEM_HEIGHT - 12}px` }}>
                  <div className="flex-1 min-w-0">
                    <span className={`text-xs font-bold uppercase ${item.type === 'analysis' ? 'text-primary' : 'text-secondary'}`}>
                      {item.type === 'analysis' ? 'Analyzed Audio' : 'Generated MIDI'}
                    </span>
                    <h3 className="font-semibold text-on-surface truncate" title={item.name}>{item.name}</h3>
                    <div className="flex items-center flex-wrap gap-x-4 text-sm text-on-surface-muted mt-1">
                      {item.type === 'analysis' ? (
                        <>
                          <span><strong>Key:</strong> {item.result.key}</span>
                          <span><strong>Genre:</strong> {item.result.genre}</span>
                          <span><strong>BPM:</strong> {item.result.bpm}</span>
                        </>
                      ) : (
                         <>
                          <span><strong>BPM:</strong> {item.result.bpm || 'N/A'}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {item.type === 'generation' && (
                    <button 
                      onClick={() => handleDownload(item)} 
                      className="flex-shrink-0 flex items-center space-x-2 text-bkg bg-primary hover:bg-primary/90 transition-colors px-3 py-2 rounded-full font-semibold shadow-md hover:shadow-lg"
                      title="Download MIDI"
                    >
                      <DownloadIcon />
                      <span className="text-sm">Download</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionLibraryCard;
