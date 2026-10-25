import React, { useState, useEffect, useRef } from 'react';
import { useCase } from '../context/CaseContext';
import { CCTVFeed } from '../types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Camera, Crosshair, Search, Video, StopCircle, Upload } from 'lucide-react';

export const CCTVSurveillancePage: React.FC = () => {
  const { selectedCase, captureCCTVClue, addCCTVFeed, updateCCTVFeed } = useCase();
  const [selectedFeedId, setSelectedFeedId] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [filterMode, setFilterMode] = useState<'STANDARD' | 'NIGHT_VISION' | 'THERMAL'>('STANDARD');
  const [cameraQuery, setCameraQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [cameraNameInput, setCameraNameInput] = useState('');
  const [cameraLocationInput, setCameraLocationInput] = useState('');
  const [streamUrlInput, setStreamUrlInput] = useState('');
  const [streamError, setStreamError] = useState('');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [localArchiveUrl, setLocalArchiveUrl] = useState('');
  const [localArchiveName, setLocalArchiveName] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const localArchiveUrlRef = useRef('');

  useEffect(() => {
    if (selectedCase && !selectedCase.cctvFeeds.some(feed => feed.id === selectedFeedId)) {
      setSelectedFeedId(selectedCase.cctvFeeds[0]?.id || '');
    }
  }, [selectedCase, selectedFeedId]);

  const activeFeed = selectedCase?.cctvFeeds.find((f) => f.id === selectedFeedId) || selectedCase?.cctvFeeds[0];
  const safeStreamUrl = (() => {
    if (!activeFeed?.streamUrl) return '';
    try {
      const url = new URL(activeFeed.streamUrl);
      return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.toString() : '';
    } catch { return ''; }
  })();
  const hasVideoSource = Boolean(safeStreamUrl || localArchiveUrl || localStream);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = localStream;
    if (!localStream && video.src !== (localArchiveUrl || safeStreamUrl)) video.src = localArchiveUrl || safeStreamUrl;
    video.playbackRate = playbackSpeed;
    if (!hasVideoSource) {
      video.pause();
      video.srcObject = null;
      video.removeAttribute('src');
      video.load();
      return;
    }
    if (isPlaying) void video.play().catch(() => setIsPlaying(false));
    else video.pause();
  }, [safeStreamUrl, localArchiveUrl, localStream, hasVideoSource, isPlaying, playbackSpeed]);

  useEffect(() => () => {
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    if (localArchiveUrlRef.current) URL.revokeObjectURL(localArchiveUrlRef.current);
  }, []);

  if (!selectedCase) {
    return <div className="p-8 text-center font-mono text-cyan-400">NO CASE SELECTED</div>;
  }

  const stopLocalSource = () => {
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    localStreamRef.current = null;
    setLocalStream(null);
    if (localArchiveUrlRef.current) URL.revokeObjectURL(localArchiveUrlRef.current);
    localArchiveUrlRef.current = '';
    setLocalArchiveUrl('');
    setLocalArchiveName('');
    setIsPlaying(false);
  };

  const startDeviceCamera = async () => {
    setStreamError('');
    stopLocalSource();
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Live device camera access is unavailable in this browser or page context.');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      localStreamRef.current = stream;
      setLocalStream(stream);
      setIsPlaying(true);
    } catch (error) {
      setStreamError(error instanceof Error ? error.message : 'Camera permission was denied or the device camera is unavailable.');
    }
  };

  const handleArchiveUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setStreamError('Choose a supported video recording file.');
      event.target.value = '';
      return;
    }
    stopLocalSource();
    const objectUrl = URL.createObjectURL(file);
    localArchiveUrlRef.current = objectUrl;
    setLocalArchiveUrl(objectUrl);
    setLocalArchiveName(file.name);
    setIsPlaying(true);
    setStreamError('');
    event.target.value = '';
  };

  const visibleFeeds = selectedCase.cctvFeeds.filter(feed => {
    const query = cameraQuery.trim().toLowerCase();
    const matchesQuery = !query || [feed.id, feed.camCode, feed.cameraName, feed.location, feed.locationName].some(value => value?.toLowerCase().includes(query));
    const matchesStatus = statusFilter === 'ALL' || (feed.status || 'ARCHIVED') === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const handleCaptureSnapshot = () => {
    if (!activeFeed || !hasVideoSource || !videoRef.current || videoRef.current.readyState < 2) return;
    const video = videoRef.current;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
      updateCCTVFeed(selectedCase.id, activeFeed.id, { snapshotUrl: canvas.toDataURL('image/jpeg', 0.82), clueCaptured: true });
      captureCCTVClue(activeFeed.id);
    } catch {
      setStreamError('The stream host blocks browser snapshots (CORS). Playback still works; enable same-origin/CORS access to capture frames.');
    }
  };

  const handleAddCamera = (event: React.FormEvent) => {
    event.preventDefault();
    if (!cameraNameInput.trim() || !cameraLocationInput.trim()) return;
    let streamUrl: string;
    try {
      const parsed = new URL(streamUrlInput.trim());
      if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error('Use an authorized HTTP(S) video URL without embedded credentials.');
      streamUrl = parsed.toString();
    } catch (error) {
      setStreamError(error instanceof Error ? error.message : 'Enter a valid HTTP(S) video URL.');
      return;
    }
    const nextIndex = selectedCase.cctvFeeds.length + 1;
    stopLocalSource();
    const newFeedId = addCCTVFeed(selectedCase.id, {
      camCode: `CAM-${String(nextIndex).padStart(2, '0')}`,
      cameraName: cameraNameInput.trim(),
      location: cameraLocationInput.trim(),
      locationName: cameraLocationInput.trim(),
      streamUrl,
      timestamp: new Date().toISOString(),
      recordedTime: 'Live browser stream',
      resolution: 'Source dependent',
      details: 'Authorized browser-playable camera stream configured by the investigator.',
      status: 'ONLINE',
      anomalyDetected: false,
      playbackDuration: 0
    });
    setCameraNameInput(''); setCameraLocationInput(''); setStreamUrlInput(''); setStreamError('');
    setStatusFilter('ALL');
    setCameraQuery('');
    setSelectedFeedId(newFeedId);
    setIsPlaying(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-mono text-rose-400 uppercase tracking-widest font-bold">
              AUTHORIZED CAMERA ARCHIVE // #{selectedCase.id}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-hud text-white">
            CCTV ARCHIVE & SURVEILLANCE FEEDS
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Play an authorized network feed, open a local recording, or preview this device camera. Network cameras must provide a browser-playable HTTP(S) source; RTSP needs a relay.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 rounded-lg bg-slate-900 border border-slate-700 px-2 py-1.5 text-[10px] font-mono text-slate-400">FILTER
            <select value={filterMode} onChange={event => setFilterMode(event.target.value as typeof filterMode)} className="bg-transparent text-cyan-300 outline-none">
              <option value="STANDARD">Standard</option><option value="NIGHT_VISION">Night vision</option><option value="THERMAL">Thermal</option>
            </select>
          </label>
          <label className="flex items-center gap-1.5 rounded-lg bg-slate-900 border border-slate-700 px-2 py-1.5 text-[10px] font-mono text-slate-400">SPEED
            <select value={playbackSpeed} onChange={event => setPlaybackSpeed(Number(event.target.value))} className="bg-transparent text-cyan-300 outline-none">
              {[0.5, 1, 1.5, 2].map(speed => <option key={speed} value={speed}>{speed}×</option>)}
            </select>
          </label>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCaptureSnapshot}
            disabled={!hasVideoSource}
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
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="font-bold text-white font-hud tracking-wider uppercase">
                  {localStream ? 'LOCAL DEVICE CAMERA' : activeFeed?.cameraName} [{activeFeed?.location}]
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-400">
                  {activeFeed?.resolution}
                </span>
              </div>

              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-cyan-400 font-bold">
                  {localStream ? 'THIS DEVICE CAMERA' : localArchiveUrl ? `LOCAL RECORDING · ${localArchiveName}` : safeStreamUrl ? 'CONNECTED NETWORK STREAM' : 'NO VIDEO SOURCE'} // {activeFeed?.timestamp || selectedCase.incidentDate}
                </span>
                <span className="text-slate-400">{isPlaying && hasVideoSource ? 'PLAYING' : 'PAUSED'}</span>
              </div>
            </div>

            {hasVideoSource ? (
              <div className="relative z-0 flex-1 min-h-0 flex items-center justify-center bg-black">
                <video ref={videoRef} src={localStream ? undefined : localArchiveUrl || safeStreamUrl} controls playsInline className="max-h-full max-w-full w-full h-full object-contain" onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onError={() => { setStreamError('This source could not be played. Check the video codec, URL, network access, and CORS policy.'); if (safeStreamUrl && activeFeed) updateCCTVFeed(selectedCase.id, activeFeed.id, { status: 'CORRUPTED' }); }} />
              </div>
            ) : (
            <div className="relative z-0 flex-1 flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full border border-slate-700 flex items-center justify-center text-slate-500">
                    <Crosshair className="w-12 h-12" />
                  </div>
                  {activeFeed?.anomalyDetected && (
                    <div className="absolute -top-3 -right-6 px-2 py-0.5 rounded bg-rose-950 border border-rose-500 text-rose-300 text-[10px] font-mono font-bold animate-bounce">
                      ANOMALY DETECTED
                    </div>
                  )}
                </div>

                <div className="max-w-md mx-auto p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-300">
                  <p className="font-bold text-white mb-1">NO VIDEO SOURCE SELECTED</p>
                  <p className="text-slate-300">Choose a network camera, open a video archive, or start this device’s camera preview. Unconfigured camera metadata has no footage.</p>
                </div>
              </div>
            </div>
            )}
            {streamError && <p role="alert" className="relative z-20 text-xs text-rose-300 bg-rose-950/80 px-3 py-2 rounded-lg">{streamError}</p>}

          </div>
        </div>

        {/* Sidebar Feeds Selection List */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono text-cyan-400 uppercase font-bold tracking-wider">
            AVAILABLE OPTICAL CHANNELS ({selectedCase.cctvFeeds.length})
          </h4>

          <div className="space-y-2">
            <form onSubmit={handleAddCamera} className="space-y-2 p-3 rounded-xl border border-cyan-500/20 bg-cyan-950/10">
              <p className="text-[10px] font-mono font-bold text-cyan-300 uppercase">Local camera &amp; recording</p>
              <Button type="button" size="sm" variant="outline" onClick={startDeviceCamera} icon={<Video className="w-3.5 h-3.5" />} className="w-full">USE THIS DEVICE CAMERA</Button>
              {hasVideoSource && <Button type="button" size="sm" variant="ghost" onClick={stopLocalSource} icon={<StopCircle className="w-3.5 h-3.5" />} className="w-full">STOP LOCAL PLAYBACK</Button>}
              <label className="flex items-center justify-center gap-2 w-full rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 hover:border-cyan-400/50 cursor-pointer"><Upload className="w-3.5 h-3.5" /> OPEN VIDEO RECORDING<input type="file" accept="video/*" onChange={handleArchiveUpload} className="sr-only" /></label>
              {localArchiveName && <p className="text-[10px] text-slate-500 truncate">Loaded locally: {localArchiveName} (not uploaded)</p>}
              <p className="text-[9px] leading-relaxed text-slate-500">Device camera permissions are requested by the browser. Local recordings stay in this browser session.</p>
              <p className="pt-2 border-t border-white/5 text-[10px] font-mono font-bold text-cyan-300 uppercase">Network camera stream</p>
              <input required value={cameraNameInput} onChange={event => setCameraNameInput(event.target.value)} placeholder="Camera name" aria-label="Camera name" className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-xs text-white" />
              <input required value={cameraLocationInput} onChange={event => setCameraLocationInput(event.target.value)} placeholder="Location" aria-label="Camera location" className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-xs text-white" />
              <input required type="url" value={streamUrlInput} onChange={event => setStreamUrlInput(event.target.value)} placeholder="https://authorized-host/camera.mp4" aria-label="Authorized camera stream URL" className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-xs text-white" />
              {streamError && <p className="text-[10px] text-rose-300">{streamError}</p>}
              <Button type="submit" size="sm" variant="outline" className="w-full">CONNECT STREAM</Button>
            </form>
            <label className="relative block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input value={cameraQuery} onChange={event => setCameraQuery(event.target.value)} placeholder="Search camera or location" aria-label="Search cameras" className="w-full rounded-lg bg-black/30 border border-white/10 py-2 pl-9 pr-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400" />
            </label>
            <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)} aria-label="Filter cameras by status" className="w-full rounded-lg bg-[#0a0f1d] border border-white/10 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400">
              <option value="ALL">All camera statuses</option>
              <option value="ONLINE">Online</option>
              <option value="INTERFERENCE">Interference</option>
              <option value="ARCHIVED">Archived / simulated</option>
              <option value="CORRUPTED">Corrupted</option>
            </select>
          </div>

          <div className="space-y-3">
            {visibleFeeds.length === 0 ? <div className="rounded-xl border border-white/10 p-4 text-xs text-slate-500">No cameras match these filters.</div> : visibleFeeds.map((feed) => {
              const isSelected = feed.id === selectedFeedId;
              return (
              <button
                type="button"
                  key={feed.id}
                  onClick={() => { stopLocalSource(); setSelectedFeedId(feed.id); setStreamError(''); setIsPlaying(true); }}
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
                  <p className="text-[9px] font-mono uppercase tracking-wider text-slate-500 mt-1">{feed.camCode || feed.id} · {feed.streamUrl ? (feed.status || 'ONLINE') : 'NO VIDEO SOURCE'}</p>
                  <p className="text-[10px] font-mono text-slate-400 mt-1 line-clamp-2">
                    {feed.details}
                  </p>
              </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
