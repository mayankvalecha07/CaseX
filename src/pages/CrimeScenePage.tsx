import React, { useState, useRef } from 'react';
import { useCase } from '../context/CaseContext';
import { CrimeSceneHotspot } from '../types';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  ScanEye,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sun,
  Flame,
  Sparkles,
  ShieldAlert,
  FolderOpen,
  CheckCircle,
  Eye,
  Crosshair,
  Compass,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CrimeScenePage: React.FC = () => {
  const { selectedCase, inspectHotspot, collectHotspot } = useCase();

  const [spectrumMode, setSpectrumMode] = useState<'NORMAL' | 'UV' | 'IR'>('NORMAL');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedHotspot, setSelectedHotspot] = useState<CrimeSceneHotspot | null>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<CrimeSceneHotspot | null>(null);

  if (!selectedCase) {
    return <div className="p-8 text-center font-mono text-cyan-400">NO CASE SELECTED</div>;
  }

  const { crimeScene } = selectedCase;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.2));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoomLevel(1);

  const handleHotspotClick = (hotspot: CrimeSceneHotspot) => {
    setSelectedHotspot(hotspot);
    if (!hotspot.inspected) {
      inspectHotspot(hotspot.id);
    }
  };

  const handleInspect = () => {
    if (selectedHotspot) {
      inspectHotspot(selectedHotspot.id);
      setSelectedHotspot((prev) => (prev ? { ...prev, inspected: true } : null));
    }
  };

  const handleCollect = () => {
    if (selectedHotspot) {
      collectHotspot(selectedHotspot.id);
      setSelectedHotspot((prev) => (prev ? { ...prev, collected: true, inspected: true } : null));
    }
  };

  // Filter hotspots based on current spectrum mode
  const visibleHotspots = crimeScene.hotspots.filter((h) => {
    if (spectrumMode === 'NORMAL') return !h.uvOnly && !h.irOnly;
    if (spectrumMode === 'UV') return !h.irOnly; // UV reveals normal + UV
    if (spectrumMode === 'IR') return !h.uvOnly; // IR reveals normal + IR
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header & Controls Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold">
              3D CRIME SCENE RECONSTRUCTION // #{selectedCase.id}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-hud text-white">
            {crimeScene.name}
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Dimensions: {crimeScene.dimensions} • {crimeScene.environmentDescription}
          </p>
        </div>

        {/* Toolbar controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Spectrum Filter Modes */}
          <div className="flex items-center p-1 rounded-2xl bg-white/5 border border-white/10">
            <button
              onClick={() => setSpectrumMode('NORMAL')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wider transition-all cursor-pointer ${
                spectrumMode === 'NORMAL'
                  ? 'bg-cyan-400 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>NORMAL</span>
            </button>

            <button
              onClick={() => setSpectrumMode('UV')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wider transition-all cursor-pointer ${
                spectrumMode === 'UV'
                  ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                  : 'text-slate-400 hover:text-purple-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>UV LUMINESCENT</span>
            </button>

            <button
              onClick={() => setSpectrumMode('IR')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wider transition-all cursor-pointer ${
                spectrumMode === 'IR'
                  ? 'bg-rose-600 text-white shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                  : 'text-slate-400 hover:text-rose-300'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>INFRARED (IR)</span>
            </button>
          </div>

          {/* Zoom Buttons */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/5 border border-white/10">
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-mono text-cyan-400 px-1 font-bold">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Crime Scene Canvas Container */}
      <div className="relative w-full h-[520px] sm:h-[580px] bg-[#050505] rounded-2xl border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] select-none">
        {/* Optical Spectrum Screen Filter Overlay */}
        <div
          className={`absolute inset-0 pointer-events-none z-10 transition-all duration-300 ${
            spectrumMode === 'UV'
              ? 'bg-purple-950/40 mix-blend-color-dodge uv-mode'
              : spectrumMode === 'IR'
              ? 'bg-rose-950/40 mix-blend-color-dodge ir-mode'
              : 'scanline'
          }`}
        />

        {/* HUD Coordinate Grid Overlay */}
        <div className="absolute inset-0 forensic-grid opacity-30 pointer-events-none" />

        {/* Top-Left Mode Indicator */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-none">
          <Badge
            variant={
              spectrumMode === 'UV'
                ? 'purple'
                : spectrumMode === 'IR'
                ? 'red'
                : 'cyan'
            }
            size="sm"
            dot
          >
            SENSOR SPECTRUM: {spectrumMode}
          </Badge>
          <span className="text-[10px] font-mono text-slate-400 px-2.5 py-0.5 rounded-full bg-black/60 border border-white/10">
            {visibleHotspots.length} HOTSPOTS DETECTED
          </span>
        </div>

        {/* Top-Right Compass / Orientation */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-none">
          <div className="p-2 rounded-xl bg-black/60 border border-white/10 text-cyan-400 flex items-center gap-1 text-[10px] font-mono">
            <Compass className="w-3.5 h-3.5 animate-spin-slow" />
            <span>GRID NORTH // 042°</span>
          </div>
        </div>

        {/* Transform Zoom Container */}
        <div
          className="relative w-full h-full transition-transform duration-200 origin-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Fictional Architectural Blueprint / Isometric Forensic Rendering Canvas */}
          <svg className="w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="none">
            {/* Room Floor Plan Blueprint Lines */}
            <defs>
              <linearGradient id="grid-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#082f49" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#020617" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Room Perimeter Walls */}
            <polygon
              points="100,80 900,80 950,520 50,520"
              fill="url(#grid-grad)"
              stroke="#0284c7"
              strokeWidth="2"
              strokeDasharray="4 2"
            />

            {/* Isometric Room Partitions */}
            <line x1="100" y1="80" x2="350" y2="280" stroke="#0369a1" strokeWidth="1.5" />
            <line x1="900" y1="80" x2="650" y2="280" stroke="#0369a1" strokeWidth="1.5" />
            <line x1="350" y1="280" x2="650" y2="280" stroke="#0369a1" strokeWidth="1.5" />

            {/* Crime scene objects outlines */}
            {/* Vault / Safe Plinth */}
            <rect
              x="420"
              y="180"
              width="160"
              height="110"
              rx="6"
              fill="#0f172a"
              stroke="#38bdf8"
              strokeWidth="2"
            />
            <circle cx="500" cy="235" r="30" fill="#0284c7" fillOpacity="0.2" stroke="#38bdf8" strokeWidth="1.5" />

            {/* Executive Desk / Centerpiece */}
            <polygon
              points="200,340 420,340 400,440 180,440"
              fill="#1e293b"
              fillOpacity="0.7"
              stroke="#64748b"
              strokeWidth="1.5"
            />

            {/* Balcony / Terrace threshold */}
            <polygon
              points="750,140 920,140 880,260 710,260"
              fill="#0c4a6e"
              fillOpacity="0.3"
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeDasharray="5 5"
            />

            {/* Entrance Doorway */}
            <line x1="50" y1="520" x2="180" y2="520" stroke="#f43f5e" strokeWidth="3" />
            <text x="70" y="550" fill="#f43f5e" fontSize="12" fontFamily="monospace">
              ENTRY ACCESS [BREACHED]
            </text>

            {/* Laser Line Traces (UV mode highlights) */}
            {spectrumMode === 'UV' && (
              <g opacity="0.8">
                <line x1="420" y1="200" x2="800" y2="180" stroke="#c084fc" strokeWidth="2" strokeDasharray="3 3" />
                <line x1="480" y1="240" x2="720" y2="420" stroke="#c084fc" strokeWidth="1.5" />
                <circle cx="800" cy="180" r="14" fill="#c084fc" fillOpacity="0.3" stroke="#a855f7" />
              </g>
            )}

            {/* Thermal Hotspots (IR mode highlights) */}
            {spectrumMode === 'IR' && (
              <g opacity="0.85">
                <circle cx="500" cy="235" r="45" fill="#f43f5e" fillOpacity="0.4" filter="blur(6px)" />
                <circle cx="280" cy="380" r="35" fill="#fb923c" fillOpacity="0.4" filter="blur(6px)" />
              </g>
            )}
          </svg>

          {/* Interactive Crime Scene Hotspots Elements */}
          {visibleHotspots.map((hotspot) => {
            const isHovered = hoveredHotspot?.id === hotspot.id;
            return (
              <div
                key={hotspot.id}
                style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer"
                onClick={() => handleHotspotClick(hotspot)}
                onMouseEnter={() => setHoveredHotspot(hotspot)}
                onMouseLeave={() => setHoveredHotspot(null)}
              >
                <div className="relative group">
                  {/* Radar Pulse Effect */}
                  {!hotspot.inspected && (
                    <span className="absolute -inset-2 rounded-full bg-cyan-400/40 animate-ping" />
                  )}

                  {/* Marker Pin */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-lg transition-all duration-200 ${
                      hotspot.collected
                        ? 'bg-emerald-950/90 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                        : hotspot.inspected
                        ? 'bg-cyan-950/90 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                        : 'bg-rose-950/90 border-rose-400 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.5)]'
                    }`}
                  >
                    <Crosshair className="w-5 h-5" />
                  </div>

                  {/* Hover Floating Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 rounded-lg bg-[#090d16] border border-cyan-500/40 shadow-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-40 text-center">
                    <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase block">
                      {hotspot.type} • {hotspot.importance}
                    </span>
                    <p className="text-xs font-bold font-hud text-white truncate mt-0.5">
                      {hotspot.name}
                    </p>
                    <div className="flex items-center justify-center gap-1 mt-1 text-[9px] font-mono text-slate-400">
                      <span>STATUS:</span>
                      <span
                        className={`font-bold ${
                          hotspot.collected
                            ? 'text-emerald-400'
                            : hotspot.inspected
                            ? 'text-cyan-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {hotspot.collected
                          ? 'COLLECTED'
                          : hotspot.inspected
                          ? 'INSPECTED'
                          : 'UNINSPECTED'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Legend */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-black/70 border border-white/10 backdrop-blur-md text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Uninspected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span>Inspected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>Collected & Secured</span>
            </div>
          </div>

          <span className="text-cyan-400 italic">
            * Switch to UV/IR mode to detect concealed traces & micro-residue.
          </span>
        </div>
      </div>

      {/* Hotspot Inspection Modal */}
      <Modal
        isOpen={!!selectedHotspot}
        onClose={() => setSelectedHotspot(null)}
        title={`HOTSPOT ANALYSIS // ${selectedHotspot?.name}`}
        subtitle={`CRIME SCENE COORD [${selectedHotspot?.x}%, ${selectedHotspot?.y}%]`}
        maxWidth="lg"
      >
        {selectedHotspot && (
          <div className="space-y-5 font-sans">
            <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    selectedHotspot.importance === 'CRITICAL'
                      ? 'red'
                      : selectedHotspot.importance === 'HIGH'
                      ? 'amber'
                      : 'cyan'
                  }
                  size="sm"
                >
                  {selectedHotspot.importance} IMPORTANCE
                </Badge>
                <Badge variant="blue" size="sm">
                  {selectedHotspot.type}
                </Badge>
              </div>

              <span className="text-xs font-mono text-cyan-400">
                DISCOVERED: {selectedHotspot.discoveredAt}
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-mono text-slate-400 uppercase font-bold">
                PHYSICAL OBSERVATION
              </h4>
              <p className="text-sm font-mono text-slate-200 bg-white/5 p-3.5 rounded-xl border border-white/10">
                {selectedHotspot.description}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-mono text-cyan-400 uppercase font-bold">
                FORENSIC DETAILS & ANALYSIS
              </h4>
              <p className="text-xs sm:text-sm font-mono text-cyan-100 bg-cyan-500/10 p-3.5 rounded-xl border border-cyan-400/20 leading-relaxed">
                {selectedHotspot.details}
              </p>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono">
              <span className="text-slate-400">CURRENT STATUS:</span>
              <Badge
                variant={
                  selectedHotspot.collected
                    ? 'emerald'
                    : selectedHotspot.inspected
                    ? 'cyan'
                    : 'red'
                }
                size="md"
                dot
              >
                {selectedHotspot.collected
                  ? 'COLLECTED TO EVIDENCE LOCKER'
                  : selectedHotspot.inspected
                  ? 'INSPECTED & LOGGED'
                  : 'UNINSPECTED'}
              </Badge>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-white/10">
              <Button variant="ghost" size="sm" onClick={() => setSelectedHotspot(null)}>
                CLOSE
              </Button>

              {!selectedHotspot.inspected && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleInspect}
                  icon={<Eye className="w-3.5 h-3.5" />}
                >
                  MARK INSPECTED
                </Button>
              )}

              {!selectedHotspot.collected && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCollect}
                  icon={<FolderOpen className="w-3.5 h-3.5" />}
                >
                  COLLECT EVIDENCE
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
