import React, { useEffect, useRef } from 'react';
import type { AnalysisResult } from '../types';

// Let TypeScript know that Chart.js is available globally from the CDN script.
declare const Chart: any;

interface AnalysisChartsProps {
  analysisData: AnalysisResult;
}

// A color palette that fits the app's theme
const chartColors = ['#bb86fc', '#03dac6', '#cf6679', '#f2a365', '#a1c181', '#f4a261'];

const AnalysisCharts: React.FC<AnalysisChartsProps> = ({ analysisData }) => {
  const bpmChartRef = useRef<HTMLCanvasElement>(null);
  const stemsChartRef = useRef<HTMLCanvasElement>(null);
  const lufsChartRef = useRef<HTMLCanvasElement>(null);
  const chartInstances = useRef<{ bpm?: any; stems?: any; lufs?: any; }>({});

  useEffect(() => {
    if (!analysisData) return;

    // Wait for Chart.js to be available
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not loaded yet, retrying...');
      const timer = setTimeout(() => {
        if (typeof Chart !== 'undefined') {
          // Retry after Chart.js loads
          window.location.reload();
        }
      }, 1000);
      return () => clearTimeout(timer);
    }

    // Cleanup previous charts before creating new ones to prevent memory leaks
    if (chartInstances.current.bpm) chartInstances.current.bpm.destroy();
    if (chartInstances.current.stems) chartInstances.current.stems.destroy();
    if (chartInstances.current.lufs) chartInstances.current.lufs.destroy();


    // --- BPM Gauge Chart ---
    if (bpmChartRef.current) {
      const bpmCtx = bpmChartRef.current.getContext('2d');
      if (bpmCtx) {
        chartInstances.current.bpm = new Chart(bpmCtx, {
          type: 'doughnut',
          data: {
            datasets: [{
              data: [analysisData.bpm, 200 - analysisData.bpm], // Assuming a practical max of 200 BPM
              backgroundColor: ['#bb86fc', '#333'],
              borderColor: '#1e1e1e',
              borderWidth: 2,
              circumference: 180, // Half circle to make a gauge
              rotation: 270,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
              legend: { display: false },
              tooltip: { enabled: false },
            }
          }
        });
      }
    }
    
    // --- LUFS Gauge Chart ---
    if (lufsChartRef.current) {
        const lufsCtx = lufsChartRef.current.getContext('2d');
        if (lufsCtx) {
            const LUFS_MIN = -24;
            const LUFS_MAX = 0;
            const loudnessValue = Math.max(LUFS_MIN, Math.min(LUFS_MAX, analysisData.loudness));
            const dataValue = loudnessValue - LUFS_MIN;
            const range = LUFS_MAX - LUFS_MIN;
            chartInstances.current.lufs = new Chart(lufsCtx, {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: [dataValue, range - dataValue],
                        backgroundColor: ['#03dac6', '#333'], // Secondary color
                        borderColor: '#1e1e1e',
                        borderWidth: 2,
                        circumference: 180,
                        rotation: 270,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                        legend: { display: false },
                        tooltip: { enabled: false },
                    }
                }
            });
        }
    }

    // --- Instruments Doughnut Chart ---
    if (stemsChartRef.current && analysisData.instruments.length > 0) {
      const stemsCtx = stemsChartRef.current.getContext('2d');
      if (stemsCtx) {
        chartInstances.current.stems = new Chart(stemsCtx, {
          type: 'doughnut',
          data: {
            labels: analysisData.instruments,
            datasets: [{
              label: 'Instruments',
              data: analysisData.instruments.map(() => 1), // Give equal parts for each instrument
              backgroundColor: analysisData.instruments.map((_, i) => chartColors[i % chartColors.length]),
              borderColor: '#1e1e1e',
              borderWidth: 2,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: {
                position: 'right',
                labels: {
                  color: '#e0e0e0',
                  font: {
                    family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                  }
                }
              }
            }
          }
        });
      }
    }
    
    // Cleanup function to destroy charts on component unmount
    return () => {
      if (chartInstances.current.bpm) chartInstances.current.bpm.destroy();
      if (chartInstances.current.stems) chartInstances.current.stems.destroy();
      if (chartInstances.current.lufs) chartInstances.current.lufs.destroy();
    };

  }, [analysisData]);

  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
      {/* BPM Gauge */}
      <div className="bg-bkg/50 p-4 rounded-md h-48 flex flex-col items-center justify-center">
        <h3 className="font-semibold text-on-surface mb-2">Tempo</h3>
        <div className="relative w-full h-full">
            <canvas ref={bpmChartRef}></canvas>
            <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-primary pointer-events-none">
                {analysisData.bpm}
                <span className="text-lg ml-1 mt-2 text-on-surface-muted">BPM</span>
            </div>
        </div>
      </div>

      {/* LUFS Gauge */}
      <div className="bg-bkg/50 p-4 rounded-md h-48 flex flex-col items-center justify-center">
        <h3 className="font-semibold text-on-surface mb-2">Loudness</h3>
        <div className="relative w-full h-full">
            <canvas ref={lufsChartRef}></canvas>
            <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-secondary pointer-events-none">
                {analysisData.loudness.toFixed(1)}
                <span className="text-lg ml-1 mt-2 text-on-surface-muted">LUFS</span>
            </div>
        </div>
      </div>

      {/* Stems Chart */}
      <div className="bg-bkg/50 p-4 rounded-md h-48 flex flex-col items-center md:col-span-2">
        <h3 className="font-semibold text-on-surface mb-2">Instrumentation</h3>
        <div className="relative w-full h-full flex items-center justify-center">
          {analysisData.instruments.length > 0 ? (
            <canvas ref={stemsChartRef}></canvas>
          ) : (
            <p className="text-on-surface-muted">No instrument data available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisCharts;