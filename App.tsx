
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Map, RefreshCw, AlertCircle, Search, Calendar, Filter, Database, Sparkles } from 'lucide-react';
import { fetchBelmontEvents } from './services/geminiService';
import { EventCard } from './components/EventCard';
import { Loader } from './components/Loader';
import { SourceList } from './components/SourceList';
import { EventData, GroundingSource } from './types';

type TimeFilter = 'all' | 'now' | 'week' | 'month';

const CACHE_KEY = 'belmont_events_cache_v1';

// Helper to determine the freshness cutoff (Last Sunday at 6:00 AM)
const getLastSundayMorning = (): Date => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday
  const currentHour = now.getHours();
  
  const lastSunday = new Date(now);
  
  // Calculate days to subtract to get to the previous Sunday (or today if it is Sunday)
  // If today is Sunday (0), we subtract 0 days initially.
  const daysToSubtract = dayOfWeek === 0 ? 0 : dayOfWeek;
  lastSunday.setDate(now.getDate() - daysToSubtract);
  lastSunday.setHours(6, 0, 0, 0); // 6:00 AM cutoff

  // Edge Case: If it IS Sunday but before 6 AM, the valid data is from the PREVIOUS week's Sunday.
  if (dayOfWeek === 0 && currentHour < 6) {
    lastSunday.setDate(lastSunday.getDate() - 7);
  }

  return lastSunday;
};

const App: React.FC = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeFilter, setActiveFilter] = useState<TimeFilter>('all');
  const [fromCache, setFromCache] = useState<boolean>(false);

  const loadEvents = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    setFromCache(false);

    try {
      const cutoffTime = getLastSundayMorning();
      const cachedDataString = localStorage.getItem(CACHE_KEY);

      // 1. Try to load from Cache first if we aren't forcing a refresh
      if (!forceRefresh && cachedDataString) {
        try {
          const cached = JSON.parse(cachedDataString);
          const cacheTime = new Date(cached.timestamp);

          // If the cache is newer than the last Sunday 6 AM cutoff, use it.
          if (cacheTime > cutoffTime) {
            console.log("Loading from cache...");
            setEvents(cached.events);
            setSources(cached.sources);
            setLastUpdated(cacheTime);
            setFromCache(true);
            setLoading(false);
            return; // Exit early, no API call needed
          } else {
            console.log("Cache is stale (older than last Sunday). Refreshing...");
          }
        } catch (e) {
          console.warn("Error parsing cache, proceeding to fetch.");
        }
      }

      // 2. Fetch fresh data if cache is missing, stale, or forceRefresh is true
      const data = await fetchBelmontEvents();
      
      const timestamp = new Date();
      setEvents(data.events);
      setSources(data.sources);
      setLastUpdated(timestamp);
      
      // 3. Update Cache
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        timestamp: timestamp.getTime(),
        events: data.events,
        sources: data.sources
      }));

    } catch (err) {
      console.error(err);
      
      // Fallback: If network fails, try to show stale cache if it exists
      const cachedDataString = localStorage.getItem(CACHE_KEY);
      if (cachedDataString) {
        try {
          const cached = JSON.parse(cachedDataString);
          setEvents(cached.events);
          setSources(cached.sources);
          setLastUpdated(new Date(cached.timestamp));
          setFromCache(true);
          setError("Network error. Showing cached events from previous fetch.");
        } catch (e) {
          setError("Unable to connect to event scout. Please try again later.");
        }
      } else {
        setError("Unable to load events right now. The AI scout is having trouble connecting to local sources.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents(false); // Initial load, prefers cache
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredEvents = useMemo(() => {
    if (activeFilter === 'all') return events;

    const now = new Date();
    // Reset hours for cleaner comparisons
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return events.filter(event => {
      if (!event.isoDate) return true; // Keep events without ISO date just in case
      const eventDate = new Date(event.isoDate);
      
      if (isNaN(eventDate.getTime())) return true; // Keep if invalid date parse

      if (activeFilter === 'now') {
        // Today and Tomorrow
        const tomorrowEnd = new Date(todayStart);
        tomorrowEnd.setDate(todayStart.getDate() + 2);
        return eventDate >= todayStart && eventDate < tomorrowEnd;
      }
      
      if (activeFilter === 'week') {
        // Next 7 days
        const weekEnd = new Date(todayStart);
        weekEnd.setDate(todayStart.getDate() + 7);
        return eventDate >= todayStart && eventDate < weekEnd;
      }

      if (activeFilter === 'month') {
        // Current calendar month
        return eventDate.getMonth() === todayStart.getMonth() && eventDate.getFullYear() === todayStart.getFullYear();
      }

      return true;
    }).sort((a, b) => {
        // Sort filtered events by date ascending
        const dateA = a.isoDate ? new Date(a.isoDate).getTime() : 0;
        const dateB = b.isoDate ? new Date(b.isoDate).getTime() : 0;
        return dateA - dateB;
    });
  }, [events, activeFilter]);

  const FilterButton = ({ label, value, icon: Icon }: { label: string, value: TimeFilter, icon?: any }) => (
    <button
      onClick={() => setActiveFilter(value)}
      className={`relative px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 border flex items-center gap-2
        ${activeFilter === value 
          ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200 transform scale-105' 
          : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50'
        }`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navigation / Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-indigo-100/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-indigo-200">
              <Map className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none">Belmont<span className="text-indigo-600">Buzz</span></h1>
              <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">Family Event Scout</p>
            </div>
          </div>
          <button
            onClick={() => loadEvents(true)}
            disabled={loading}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all border
              ${loading 
                ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed' 
                : 'bg-white text-indigo-600 border-indigo-100 hover:bg-indigo-50 hover:border-indigo-200 shadow-sm hover:shadow-md active:scale-95'
              }`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{loading ? 'Scouting...' : 'Fresh Scan'}</span>
          </button>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <div className="relative bg-indigo-900 text-white overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=2000&q=80" 
              className="w-full h-full object-cover opacity-20"
              alt="Family fun background"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-900 via-indigo-900/80 to-indigo-900/60"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-800/50 border border-indigo-700 text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-6 backdrop-blur-sm">
              <Sparkles className="w-3 h-3 mr-2 text-yellow-400" />
              Discover What's Happening
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6">
              Your Weekend,<br/><span className="text-indigo-300">Sorted.</span>
            </h2>
            <p className="text-lg sm:text-xl text-indigo-100 max-w-2xl mx-auto mb-8 font-light leading-relaxed">
              Curated family-friendly events from Belmont libraries, schools, and major venues like Ticketmaster.
            </p>
            
            {lastUpdated && (
              <div className="inline-flex items-center bg-indigo-950/50 backdrop-blur-md rounded-lg px-4 py-2 border border-indigo-800">
                  <p className="text-xs text-indigo-300">
                    <span className="opacity-70">Last Updated:</span> <span className="text-white font-medium">{lastUpdated.toLocaleDateString()}</span> <span className="opacity-50 mx-1">•</span> <span className="text-white font-medium">{lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </p>
                  {fromCache && (
                      <span className="ml-3 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 uppercase tracking-wide">
                          <Database className="w-3 h-3 mr-1" />
                          Cached
                      </span>
                  )}
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 -mt-8 relative z-10">
          
          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <div className="flex items-center bg-white p-2 rounded-full shadow-xl shadow-indigo-900/5 border border-slate-100 overflow-x-auto max-w-full">
               <FilterButton label="All Events" value="all" />
               <FilterButton label="Today" value="now" />
               <FilterButton label="This Week" value="week" />
               <FilterButton label="This Month" value="month" icon={Calendar} />
            </div>
          </div>

          {/* Content Area */}
          {error ? (
            <div className="bg-white border border-red-100 rounded-2xl p-8 max-w-2xl mx-auto mb-12 shadow-sm text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-red-500 mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Connection Issue</h3>
              <p className="text-slate-500 mb-6">{error}</p>
              <button 
                onClick={() => loadEvents(true)}
                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                Try Force Refresh
              </button>
            </div>
          ) : null}

          {loading ? (
            <Loader />
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 text-slate-300 mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No events found</h3>
              <p className="text-slate-500 max-w-md mx-auto mt-2">
                No events match your current filter. Try selecting "All Events" or refreshing the search.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
              
              <SourceList sources={sources} />
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center items-center space-x-2 mb-4 opacity-50">
             <Map className="w-5 h-5" />
             <span className="font-bold text-lg">BelmontBuzz</span>
          </div>
          <p className="text-slate-500 text-sm mb-4">
            © {new Date().getFullYear()} Belmont Buzz. Powered by Gemini 2.5 Flash & Google Search.
          </p>
          <p className="text-slate-400 text-xs max-w-xl mx-auto leading-relaxed">
            Events are aggregated automatically from sources like Ticketmaster, The Boston Calendar, Belmont Schools, and local town pages.
            Updates automatically every Sunday morning. Images are illustrative.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
