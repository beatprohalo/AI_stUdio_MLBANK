
import React from 'react';
import { ChipIcon } from './icons';

interface StatusPanelCardProps {
  sessionFileCount: number;
  lastActivity: Date | null;
  learningStatus: boolean;
  aiCoreModel: string;
  onModelChange: (model: string) => void;
  gpuAcceleration: boolean;
  onGpuToggle: () => void;
  cpuCores: string;
  onCpuCoresChange: (cores: string) => void;
}

const StatusItem: React.FC<{ label: string; value: React.ReactNode; color?: string }> = ({ label, value, color = 'text-green-400' }) => (
  <div>
    <span className="text-on-surface-muted">{label.padEnd(16, '.')}:</span>
    <span className={`font-bold ${color}`}>{value}</span>
  </div>
);

const StatusPanelCard: React.FC<StatusPanelCardProps> = ({ 
  sessionFileCount, 
  lastActivity, 
  learningStatus, 
  aiCoreModel, 
  onModelChange,
  gpuAcceleration,
  onGpuToggle,
  cpuCores,
  onCpuCoresChange
}) => {
  return (
    <div className="bg-black border-2 border-surface-border rounded-lg p-4 mb-6 shadow-lg font-mono text-sm">
      <div className="flex items-center mb-3">
        <ChipIcon className="h-5 w-5 text-green-400 mr-2" />
        <h2 className="text-base font-bold text-green-400 tracking-widest">SYSTEM STATUS</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
        <StatusItem label="SYSTEM" value="ONLINE" />
        <StatusItem label="DATABASE" value="OK" />
        <div>
            <label htmlFor="ai-core-select" className="text-on-surface-muted">AI CORE.........:</label>
            <select
                id="ai-core-select"
                value={aiCoreModel}
                onChange={(e) => onModelChange(e.target.value)}
                className="bg-black text-green-400 font-bold font-mono border-0 focus:ring-0 ml-2 p-0 appearance-none cursor-pointer"
            >
                <option value="gemini-2.5-flash">GEMINI-2.5-FLASH</option>
                <option value="Llama3-8B">LLAMA3-8B-LOCAL</option>
                <option value="Mistral-7B">MISTRAL-7B-LOCAL</option>
                <option value="Phi-3-mini">PHI-3-MINI-LOCAL</option>
            </select>
        </div>
        <StatusItem label="SESSION FILES" value={sessionFileCount.toString().padStart(3, '0')} />
        <StatusItem 
          label="LEARNING" 
          value={learningStatus ? 'ACTIVE' : 'INACTIVE'} 
          color={learningStatus ? 'text-green-400' : 'text-yellow-400'} 
        />
        <StatusItem 
          label="LAST ACTIVITY" 
          value={lastActivity ? lastActivity.toLocaleTimeString() : 'N/A'} 
        />
         <div>
          <span className="text-on-surface-muted">GPU ACCEL.......:</span>
          <button onClick={onGpuToggle} className={`font-bold ml-2 focus:outline-none ${gpuAcceleration ? 'text-green-400' : 'text-yellow-400'}`}>
            {gpuAcceleration ? 'ENABLED' : 'DISABLED'}
          </button>
        </div>
        <div>
          <label htmlFor="cpu-core-select" className="text-on-surface-muted">CPU CORES.......:</label>
          <select
            id="cpu-core-select"
            value={cpuCores}
            onChange={(e) => onCpuCoresChange(e.target.value)}
            className="bg-black text-green-400 font-bold font-mono border-0 focus:ring-0 ml-2 p-0 appearance-none cursor-pointer"
          >
            <option value="auto">AUTO</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="4+">4+</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default StatusPanelCard;
