
import React from 'react';
import { Calendar, MapPin, Tag, Ticket, Globe, ExternalLink } from 'lucide-react';
import { EventData } from '../types';

interface EventCardProps {
  event: EventData;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  // Helper to get a random pastel color class for the tag to add variety
  const getTagColor = (index: number) => {
    const colors = [
      'bg-blue-100 text-blue-700',
      'bg-green-100 text-green-700',
      'bg-purple-100 text-purple-700',
      'bg-orange-100 text-orange-700',
      'bg-pink-100 text-pink-700',
    ];
    return colors[index % colors.length];
  };

  const isTicketed = event.sourceType?.toLowerCase().includes('ticket') || 
                     event.sourceType?.toLowerCase().includes('eventbrite') ||
                     event.tags.some(t => t.toLowerCase().includes('paid'));

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col overflow-hidden h-full transform hover:-translate-y-1 relative">
      {/* Source Badge */}
      {event.sourceType && (
        <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-lg text-[10px] font-bold tracking-wider uppercase z-10 
          ${isTicketed ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
          {isTicketed ? 'Ticketed' : 'Community'}
        </div>
      )}

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-3 pr-6">
          {event.sourceUrl ? (
            <a 
              href={event.sourceUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xl font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors hover:underline decoration-2 underline-offset-2"
            >
              {event.title}
              <ExternalLink className="inline-block w-4 h-4 ml-2 mb-1 opacity-50" />
            </a>
          ) : (
            <h3 className="text-xl font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">
              {event.title}
            </h3>
          )}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-slate-600 text-sm">
            <Calendar className="w-4 h-4 mr-2 text-indigo-500 flex-shrink-0" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center text-slate-600 text-sm">
            <MapPin className="w-4 h-4 mr-2 text-indigo-500 flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
          {event.sourceType && (
            event.sourceUrl ? (
              <a 
                href={event.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-indigo-600 text-xs mt-1 font-medium hover:underline"
              >
                {isTicketed ? <Ticket className="w-3 h-3 mr-2" /> : <Globe className="w-3 h-3 mr-2" />}
                <span>Source: {event.sourceType}</span>
              </a>
            ) : (
              <div className="flex items-center text-slate-500 text-xs mt-1">
                {isTicketed ? <Ticket className="w-3 h-3 mr-2" /> : <Globe className="w-3 h-3 mr-2" />}
                <span>Source: {event.sourceType}</span>
              </div>
            )
          )}
        </div>

        <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1">
          {event.description}
        </p>

        <div className="flex flex-wrap gap-2 mt-auto">
          {event.tags.map((tag, idx) => (
            <span 
              key={idx} 
              className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center ${getTagColor(idx)}`}
            >
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
