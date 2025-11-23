
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Map, RefreshCw, AlertCircle, Search, Calendar, Filter } from 'lucide-react';
import { fetchBelmontEvents } from './services/geminiService';
import { EventCard } from './components/EventCard';
import { Loader } from './components/Loader';
import { SourceList } from './components/SourceList';
import { EventData, GroundingSource } from './types';

type TimeFilter = 'all' | 'now' | 'week' | 'month';

const App: React.FC = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeFilter, setActiveFilter] = useState<TimeFilter>('all');

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBelmontEvents();
      setEvents(data.events);
      setSources(data.sources);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      setError("Unable to load events right now. The AI scout is having trouble connecting to local sources.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
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
      className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border flex items-center gap-2
        ${activeFilter === value 
          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-200 ring-offset-1' 
          : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-slate-50'
        }`}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Navigation / Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-indigo-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Map className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Belmont Buzz</h1>
              <p className="text-xs text-indigo-600 font-medium">Family Event Scout</p>
            </div>
          </div>
          <button
            onClick={loadEvents}
            disabled={loading}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all
              ${loading 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg active:scale-95'
              }`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{loading ? 'Scouting...' : 'Refresh Events'}</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
            Discover Local Family Fun
          </h2>
          <p className="text-base text-slate-600">
            Curated events from Belmont libraries, schools, and major venues like Ticketmaster.
          </p>
          {lastUpdated && (
            <p className="text-xs text-slate-400 mt-2 uppercase tracking-widest">
              Last updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <div className="flex items-center bg-white p-1.5 rounded-full border border-slate-200 shadow-sm">
             <FilterButton label="All Events" value="all" />
             <FilterButton label="Today" value="now" />
             <FilterButton label="This Week" value="week" />
             <FilterButton label="This Month" value="month" icon={Calendar} />
          </div>
        </div>

        {/* Content Area */}
        {error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg max-w-2xl mx-auto">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 text-red-500 mr-3 mt-0.5" />
              <div>
                <h3 className="text-red-800 font-bold">Connection Error</h3>
                <p className="text-red-700 mt-1">{error}</p>
                <button 
                  onClick={loadEvents}
                  className="mt-4 text-red-700 font-semibold hover:text-red-800 underline text-sm"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        ) : loading ? (
          <Loader />
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No events found</h3>
            <p className="text-slate-500 max-w-md mx-auto mt-2">
              No events match your current filter. Try selecting "All Events" or refreshing the search.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
            
            <SourceList sources={sources} />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Belmont Buzz. Powered by Gemini 2.5 Flash & Google Search.
          </p>
          <p className="text-slate-400 text-xs mt-2">
            Events are aggregated automatically from sources like Ticketmaster, The Boston Calendar, Belmont Schools, and local town pages.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
