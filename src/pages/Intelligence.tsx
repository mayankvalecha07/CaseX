import React, { useState, useEffect, useCallback } from 'react';
import { intelligenceApi } from '../services/intelligenceApi';
import { weatherApi, PRESET_INVESTIGATION_LOCATIONS, WeatherLocationOption } from '../services/weatherApi';
import { ExternalIntelligenceItem, WeatherConditionData } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { Pagination } from '../components/ui/Pagination';
import {
  Globe,
  CloudSun,
  Wind,
  Droplets,
  Thermometer,
  RefreshCw,
  Search,
  Filter,
  Eye,
  ShieldAlert,
  ArrowRight,
  Database,
  Calendar,
  AlertTriangle,
  Compass
} from 'lucide-react';

export const Intelligence: React.FC = () => {
  // Weather API State
  const [selectedLocation, setSelectedLocation] = useState<WeatherLocationOption>(PRESET_INVESTIGATION_LOCATIONS[0]);
  const [weatherData, setWeatherData] = useState<WeatherConditionData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Intelligence Records State
  const [records, setRecords] = useState<ExternalIntelligenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Filtering, Search, Pagination
  const [rawSearch, setRawSearch] = useState('');
  const debouncedSearch = useDebounce(rawSearch, 300);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Detail Modal
  const [selectedRecord, setSelectedRecord] = useState<ExternalIntelligenceItem | null>(null);

  // Fetch Weather
  const fetchWeather = useCallback(async () => {
    setWeatherLoading(true);
    setWeatherError(null);
    try {
      const data = await weatherApi.getCurrentWeather(
        selectedLocation.latitude,
        selectedLocation.longitude,
        selectedLocation.name
      );
      setWeatherData(data);
    } catch (err: any) {
      setWeatherError(err.message || 'Failed to fetch meteorological data from Open-Meteo.');
    } finally {
      setWeatherLoading(false);
    }
  }, [selectedLocation]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  // Fetch Intelligence Records
  const fetchRecords = useCallback(async (isRetry: boolean = false) => {
    setLoading(true);
    setError(null);
    setIsRetrying(isRetry);
    try {
      const data = await intelligenceApi.getRecords(30);
      setRecords(data);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch intelligence records from external REST endpoint.');
    } finally {
      setLoading(false);
      setIsRetrying(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords(false);
  }, [fetchRecords]);

  // Filtered Records
  const filteredRecords = records.filter(r => {
    const q = debouncedSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      r.title.toLowerCase().includes(q) ||
      r.body.toLowerCase().includes(q) ||
      (r.category && r.category.toLowerCase().includes(q));
    const matchesCat = categoryFilter === 'ALL' || r.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Categories list
  const categories = Array.from(new Set(records.map(r => r.category).filter(Boolean)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 font-mono animate-in fade-in duration-200">
      {/* Detail Modal */}
      <Modal
        isOpen={Boolean(selectedRecord)}
        onClose={() => setSelectedRecord(null)}
        title={selectedRecord ? `EXTERNAL INTEL RECORD #${selectedRecord.id}` : 'RECORD DETAILS'}
      >
        {selectedRecord && (
          <div className="space-y-4 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                {selectedRecord.category}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-slate-300">
                SOURCE: {selectedRecord.source}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                RELIABILITY: {selectedRecord.reliability}%
              </span>
            </div>

            <h3 className="font-hud font-bold text-sm text-white tracking-wide">
              {selectedRecord.title}
            </h3>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <span className="text-[10px] text-slate-500 block font-bold uppercase">
                DECRYPTED TELEMETRY PAYLOAD
              </span>
              <p className="text-slate-200 leading-relaxed text-xs whitespace-pre-line">
                {selectedRecord.body}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
              <span className="font-bold block mb-0.5">REST API SIMULATION DISCLOSURE</span>
              This record was retrieved via real HTTP GET request from JSONPlaceholder demonstration API and enriched with investigation metadata.
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={() => setSelectedRecord(null)}>
                CLOSE
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
              REST API INTEGRATION LAYER
            </span>
          </div>
          <h1 className="font-hud font-bold text-2xl text-white tracking-wide">
            EXTERNAL INTELLIGENCE & METEOROLOGICAL TELEMETRY
          </h1>
          <p className="text-xs text-slate-400">
            Demonstrating live REST API integration, Open-Meteo real weather data, debounced querying, and asynchronous state handling.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              fetchWeather();
              fetchRecords(true);
            }}
            disabled={loading || weatherLoading || isRetrying}
            icon={<RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRetrying || loading ? 'animate-spin' : ''}`} />}
            className="text-xs"
          >
            {isRetrying ? 'FETCHING...' : 'SYNC REMOTE APIS'}
          </Button>
        </div>
      </div>

      {/* SECTION 1: THIRD-PARTY OPEN-METEO WEATHER API PANEL */}
      <div className="rounded-2xl bg-slate-900/80 border border-cyan-500/30 p-5 sm:p-6 backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <CloudSun className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-hud font-bold text-sm sm:text-base text-white tracking-wider">
                  ATMOSPHERIC & ENVIRONMENTAL CONDITIONS
                </h2>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-400/30">
                  OPEN-METEO API
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Real environmental metrics for crime scene forensic reconstruction and atmospheric trace behavior.
              </p>
            </div>
          </div>

          {/* Location Selector */}
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400 shrink-0" />
            <select
              value={selectedLocation.id}
              onChange={e => {
                const target = PRESET_INVESTIGATION_LOCATIONS.find(l => l.id === e.target.value);
                if (target) setSelectedLocation(target);
              }}
              className="bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs outline-none focus:border-cyan-400 cursor-pointer"
            >
              {PRESET_INVESTIGATION_LOCATIONS.map(loc => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Weather Content */}
        {weatherLoading ? (
          <div className="py-8">
            <LoadingSpinner label="CONNECTING TO OPEN-METEO WEATHER RADAR..." size="sm" />
          </div>
        ) : weatherError ? (
          <div className="pt-4">
            <ErrorState
              title="METEOROLOGICAL SENSOR ERROR"
              message={weatherError}
              onRetry={fetchWeather}
            />
          </div>
        ) : weatherData ? (
          <div className="pt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-slate-500 text-[10px] block flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-cyan-400" /> AMBIENT TEMPERATURE
              </span>
              <span className="text-white font-bold text-lg block">
                {weatherData.temperature}°C
              </span>
              <span className="text-[10px] text-slate-400 block">
                Feels like {weatherData.apparentTemperature}°C
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-slate-500 text-[10px] block flex items-center gap-1.5">
                <CloudSun className="w-3.5 h-3.5 text-amber-400" /> ATMOSPHERIC CONDITION
              </span>
              <span className="text-white font-bold text-xs block leading-tight line-clamp-1 mt-1">
                {weatherData.conditionText}
              </span>
              <span className="text-[10px] text-slate-400 block">
                WMO Code: {weatherData.weatherCode}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-slate-500 text-[10px] block flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" /> RELATIVE HUMIDITY
              </span>
              <span className="text-white font-bold text-lg block">
                {weatherData.relativeHumidity}%
              </span>
              <span className="text-[10px] text-slate-400 block">
                {weatherData.relativeHumidity > 70 ? 'High trace evaporation' : 'Stable surface friction'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-slate-500 text-[10px] block flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-emerald-400" /> WIND VELOCITY
              </span>
              <span className="text-white font-bold text-lg block">
                {weatherData.windSpeed} km/h
              </span>
              <span className="text-[10px] text-slate-400 block">
                Updated: {weatherData.time}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {/* SECTION 2: EXTERNAL INTELLIGENCE BULLETINS (JSONPlaceholder REST API) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-hud font-bold text-base text-white tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>EXTERNAL INTELLIGENCE RECORDS</span>
            </h2>
            <span className="text-[11px] text-slate-500">
              Fetched via REST GET from JSONPlaceholder demonstration endpoint ({filteredRecords.length} records available)
            </span>
          </div>

          {lastUpdated && (
            <span className="text-[10px] text-slate-500">
              LAST SYNCED: {lastUpdated}
            </span>
          )}
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
          <div className="flex-1 w-full sm:w-auto relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={rawSearch}
              onChange={e => {
                setRawSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Debounced search across external intelligence records..."
              className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white text-xs outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={categoryFilter}
              onChange={e => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="ALL">ALL CATEGORIES</option>
              {categories.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Intelligence Records Content */}
        {loading ? (
          <SkeletonLoader count={6} type="card" />
        ) : error ? (
          <ErrorState
            title="REST API COMMUNICATION FAILED"
            message={error}
            onRetry={() => fetchRecords(true)}
            isRetrying={isRetrying}
          />
        ) : filteredRecords.length === 0 ? (
          <EmptyState
            icon={<Search className="w-8 h-8 text-slate-500" />}
            title="NO MATCHING INTELLIGENCE BULLETINS"
            description={`Zero records match search query "${rawSearch}".`}
            actionLabel="CLEAR FILTER"
            onAction={() => {
              setRawSearch('');
              setCategoryFilter('ALL');
            }}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedRecords.map(item => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-cyan-400/40 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-400/30">
                        RECORD #{item.id}
                      </span>
                      <span className="font-bold px-2 py-0.5 rounded bg-white/5 text-slate-400">
                        {item.category}
                      </span>
                    </div>

                    <h3 className="font-hud font-bold text-xs text-white group-hover:text-cyan-300 line-clamp-2 leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {item.body}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-400 font-bold">
                      {item.reliability}% CERTITUDE
                    </span>

                    <button
                      onClick={() => setSelectedRecord(item)}
                      className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer"
                    >
                      <span>VIEW DETAILS</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Component */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={p => setCurrentPage(p)}
              pageSize={pageSize}
              onPageSizeChange={sz => {
                setPageSize(sz);
                setCurrentPage(1);
              }}
              totalItems={filteredRecords.length}
            />
          </>
        )}
      </div>
    </div>
  );
};
