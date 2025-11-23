
import React from 'react';
import { MapPin, Ticket, Globe, ExternalLink, Music, BookOpen, Trees, Palette, Trophy, Users } from 'lucide-react';
import { EventData } from '../types';

interface EventCardProps {
  event: EventData;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  // Logic to determine a high-quality placeholder image based on tags/title
  const getEventImage = (evt: EventData) => {
    const text = (evt.title + ' ' + evt.tags.join(' ')).toLowerCase();
    
    const images: Record<string, string> = {
      music: 'https://images.unsplash.com/photo-1501612780327-45045538702b?auto=format&fit=crop&w=800&q=80', // Concert/Music
      concert: 'https://images.unsplash.com/photo-1459749411177-287ce512e940?auto=format&fit=crop&w=800&q=80',
      art: 'https://images.unsplash.com/photo-1560439514-e960a3ef5019?auto=format&fit=crop&w=800&q=80', // Museum/Art
      museum: 'https://images.unsplash.com/photo-1560439514-e960a3ef5019?auto=format&fit=crop&w=800&q=80',
      library: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=80', // Library
      book: 'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?auto=format&fit=crop&w=800&q=80', // Storytime
      sport: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80', // Sports
      soccer: 'https://images.unsplash.com/photo-1518091043069-c61bbc48177a?auto=format&fit=crop&w=800&q=80',
      outdoor: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=800&q=80', // Nature
      nature: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80',
      food: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', // Food
      theater: 'https://images.unsplash.com/photo-1503095392269-2d609236f385?auto=format&fit=crop&w=800&q=80', // Theater
      halloween: 'https://images.unsplash.com/photo-1508361001413-7a9dca21d08a?auto=format&fit=crop&w=800&q=80',
      christmas: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=800&q=80',
      holiday: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=800&q=80',
      school: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80',
      default: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80' // Family walking
    };

    if (text.includes('halloween') || text.includes('pumpkin')) return images.halloween;
    if (text.includes('christmas') || text.includes('santa')) return images.christmas;
    if (text.includes('music') || text.includes('concert') || text.includes('live')) return images.music;
    if (text.includes('art') || text.includes('paint') || text.includes('exhibit')) return images.art;
    if (text.includes('library') || text.includes('story')) return images.library;
    if (text.includes('sport') || text.includes('run') || text.includes('game')) return images.sport;
    if (text.includes('nature') || text.includes('hike') || text.includes('park') || text.includes('walk')) return images.nature;
    if (text.includes('food') || text.includes('eat') || text.includes('dinner')) return images.food;
    if (text.includes('theater') || text.includes('play') || text.includes('show')) return images.theater;
    if (text.includes('school')) return images.school;

    return images.default;
  };

  const getTagStyle = (tag: string) => {
    const t = tag.toLowerCase();
    if (t.includes('free')) return 'bg-green-100 text-green-700 border-green-200';
    if (t.includes('paid') || t.includes('ticket')) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (t.includes('music')) return 'bg-purple-100 text-purple-700 border-purple-200';
    if (t.includes('out')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };

  const getIcon = (tag: string) => {
    const t = tag.toLowerCase();
    if (t.includes('music')) return <Music className="w-3 h-3 mr-1" />;
    if (t.includes('book') || t.includes('story')) return <BookOpen className="w-3 h-3 mr-1" />;
    if (t.includes('art')) return <Palette className="w-3 h-3 mr-1" />;
    if (t.includes('sport')) return <Trophy className="w-3 h-3 mr-1" />;
    if (t.includes('out')) return <Trees className="w-3 h-3 mr-1" />;
    return <Users className="w-3 h-3 mr-1" />;
  };

  const isTicketed = event.sourceType?.toLowerCase().includes('ticket') || 
                     event.sourceType?.toLowerCase().includes('eventbrite') ||
                     event.tags.some(t => t.toLowerCase().includes('paid'));

  const imageUrl = getEventImage(event);

  // Parse date for the calendar badge
  const dateObj = event.isoDate ? new Date(event.isoDate) : new Date();
  const month = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
  const day = dateObj.getDate();

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col overflow-hidden h-full transform hover:-translate-y-1 relative">
      
      {/* Image Header */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={event.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
        
        {/* Date Badge */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 text-center shadow-lg border border-slate-100">
          <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">{month}</span>
          <span className="block text-xl font-black text-indigo-600 leading-none">{day}</span>
        </div>

        {/* Source Badge */}
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase backdrop-blur-md shadow-sm border border-white/20
          ${isTicketed ? 'bg-indigo-600/90 text-white' : 'bg-white/90 text-slate-600'}`}>
          {isTicketed ? 'Ticketed' : 'Community'}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        {/* Title */}
        <div className="mb-2">
           {event.sourceUrl ? (
            <a 
              href={event.sourceUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-lg font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors flex items-start gap-2"
            >
              {event.title}
              <ExternalLink className="w-4 h-4 mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400" />
            </a>
          ) : (
            <h3 className="text-lg font-bold text-slate-900 leading-snug">
              {event.title}
            </h3>
          )}
        </div>

        {/* Location & Time */}
        <div className="space-y-2 mb-4">
            <p className="text-sm font-medium text-slate-500">{event.date}</p>
          <div className="flex items-start text-slate-600 text-sm">
            <MapPin className="w-4 h-4 mr-1.5 text-indigo-500 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
          {event.description}
        </p>

        {/* Footer: Tags & Source Link */}
        <div className="mt-auto">
          <div className="flex flex-wrap gap-2 mb-4">
            {event.tags.slice(0, 3).map((tag, idx) => (
              <span 
                key={idx} 
                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border flex items-center ${getTagStyle(tag)}`}
              >
                {getIcon(tag)}
                {tag}
              </span>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
             {event.sourceType && (
                <div className="flex items-center text-xs text-slate-400 font-medium">
                   {isTicketed ? <Ticket className="w-3 h-3 mr-1.5" /> : <Globe className="w-3 h-3 mr-1.5" />}
                   {event.sourceType}
                </div>
             )}
             
             {event.sourceUrl && (
               <a 
                  href={event.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold flex items-center group/link"
               >
                 Details
                 <ExternalLink className="w-3 h-3 ml-1 transform group-hover/link:translate-x-0.5 transition-transform" />
               </a>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
