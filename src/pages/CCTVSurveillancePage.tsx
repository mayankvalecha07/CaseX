import React, { useState, useEffect } from 'react';
import { useCase } from '../context/CaseContext';
import { CCTVFeed } from '../types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  Video,
  Play,
  Pause,
  Camera,
  RotateCcw,
  Sun,
  Eye,
  Crosshair,
  Maximize2,
  ShieldAlert,
  FastForward
} from 'lucide-react';

export const CCTVSurveillancePage: React.FC = () => {
  const { selectedCase, showToast } = useCase();
  const [selectedFeedId, setSelectedFeedId] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [currentTimeSec, setCurrentTimeSec] = useState(120); // 0 to 300 sec
  const [filterMode, setFilterMode] = useState<'STANDARD' | 'NIGHT_VISION' | 'THERMAL'>('STANDARD');

  useEffect(() => {
    if (selectedCase && selectedCase.cctvFeeds.length > 0 && !selectedFeedId) {
      setSelectedFeedId(selectedCase.cctvFeeds[0].id);
    }
  }, [selectedCase, selectedFeedId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTimeSec((prev) => (prev >= 300 ? 0 : prev + 1 * playbackSpeed));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  if (!selectedCase) {
    return <div className="p-8 text-center font-mono text-cyan-400">NO CASE SELECTED</div>;
  }

  const activeFeed = selectedCase.cctvFeeds.find((f) => f.id === selectedFeedId) || selectedCase.cctvFeeds[0];

  const handleCaptureSnapshot = () => {
    showToast(`CCTV Frame Captured at timestamp [${activeFeed?.recordedTime || '00:00:00'}]. Logged to forensic cache.`);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-mono text-rose-400 uppercase tracking-widest font-bold">
              OPTICAL SURVEILLANCE MATRIX // #{selectedCase.id}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-hud text-white">
            CCTV ARCHIVE & SURVEILLANCE FEEDS
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Synchronized multi-channel optical playback, timestamp telemetry, and facial anomaly detection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCaptureSnapshot}
            icon={<Camera className="w-4 h-4 text-cyan-400" />}
          >
            CAPTURE CLUE FRAME
          </Button>
        </div>
      </div>

      {/* Main CCTV Monitor & Multi-channel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Primary Viewport */}
        <div className="lg:col-span-3 space-y-4">
          <div className="relative w-full h-[400px] sm:h-[480px] bg-black rounded-2xl border border-cyan-500/30 overflow-hidden shadow-2xl flex flex-col justify-between p-4 select-none">
            {/* Screen filter overlays */}
            <div
              className={`absolute inset-0 pointer-events-none z-10 transition-all ${
                filterMode === 'NIGHT_VISION'
                  ? 'bg-emerald-950/60 mix-blend-color-dodge'
                  : filterMode === 'THERMAL'
                  ? 'bg-rose-950/60 mix-blend-color-dodge'
                  : 'scanline'
              }`}
            />
            <div className="absolute inset-0 forensic-grid opacity-30 pointer-events-none" />

            {/* Top OSD Bar */}
            <div className="relative z-20 flex items-center justify-between text-xs font-mono text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="font-bold text-white font-hud tracking-wider uppercase">
                  {activeFeed?.cameraName} [{activeFeed?.location}]
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-400">
                  {activeFeed?.resolution}
                </span>
              </div>

              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-cyan-400 font-bold">
                  REC // 2026-08-22 {activeFeed?.recordedTime}
                </span>
                <span className="text-slate-400">FPS: 30.0</span>
              </div>
            </div>

            {/* Simulated Live Camera Visual Graphic Canvas */}
            <div className="relative z-0 flex-1 flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full border border-cyan-500/40 flex items-center justify-center text-cyan-400 animate-pulse">
                    <Crosshair className="w-12 h-12" />
                  </div>
                  {activeFeed?.anomalyDetected && (
                    <div className="absolute -top-3 -right-6 px-2 py-0.5 rounded bg-rose-950 border border-rose-500 text-rose-300 text-[10px] font-mono font-bold animate-bounce">
                      ANOMALY DETECTED
                    </div>
                  )}
                </div>

                <div className="max-w-md mx-auto p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-300">
                  <p className="font-bold text-white mb-1">OPTICAL LOG:</p>
                  <p className="text-cyan-200">{activeFeed?.details}</p>
                </div>
              </div>
            </div>

            {/* Bottom Playback HUD Bar */}
            <div className="relative z-20 space-y-2 pt-3 border-t border-slate-800/80">
              {/* Scrubber track */}
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-cyan-400">{formatTime(currentTimeSec)}</span>
                <input
                  type="range"
                  min="0"
                  max="300"
                  value={currentTimeSec}
                  onChange={(e) => setCurrentTimeSec(Number(e.target.value))}
                  className="flex-1 accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <span className="text-slate-400">05:00</span>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-white hover:text-cyan-400 transition-colors cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => setCurrentTimeSec(0)}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Rewind"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  {/* Playback speed */}
                  <div className="flex items-center p-1 rounded-lg bg-slate-900 border border-slate-700 text-[10px] font-mono">
                    {[1, 2, 4].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => setPlaybackSpeed(spd)}
                        className={`px-2 py-0.5 rounded cursor-pointer ${
                          playbackSpeed === spd
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {spd}X
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filter mode switcher */}
                <div className="flex items-center gap-1 text-[10px] font-mono">
                  {(['STANDARD', 'NIGHT_VISION', 'THERMAL'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setFilterMode(m)}
                      className={`px-2 py-1 rounded cursor-pointer ${
                        filterMode === m
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 font-bold'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Feeds Selection List */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono text-cyan-400 uppercase font-bold tracking-wider">
            AVAILABLE OPTICAL CHANNELS ({selectedCase.cctvFeeds.length})
          </h4>

          <div className="space-y-3">
            {selectedCase.cctvFeeds.map((feed) => {
              const isSelected = feed.id === selectedFeedId;
              return (
                <div
                  key={feed.id}
                  onClick={() => setSelectedFeedId(feed.id)}
                  className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                      : 'bg-[#090d16]/90 border-slate-800/80 hover:border-cyan-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold font-hud text-white">
                      {feed.cameraName}
                    </span>
                    {feed.anomalyDetected && (
                      <Badge variant="red" size="sm">
                        ALERT
                      </Badge>
                    )}
                  </div>

                  <p className="text-[11px] font-mono text-cyan-400 truncate">{feed.location}</p>
                  <p className="text-[10px] font-mono text-slate-400 mt-1 line-clamp-2">
                    {feed.details}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
