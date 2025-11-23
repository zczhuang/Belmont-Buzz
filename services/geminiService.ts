
import { GoogleGenAI } from "@google/genai";
import { FetchResult, EventData, GroundingSource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchBelmontEvents = async (): Promise<FetchResult> => {
  try {
    // We update the prompt to ask for specific sources (Ticketmaster) and structured date formats.
    const prompt = `
      Find upcoming family-friendly events in Belmont, MA (and immediate surroundings like Arlington/Cambridge) for the next 45 days.
      
      SOURCES TO SCAN:
      1. Local: Belmont Public Library, Town of Belmont, Belmont Recreation Department, Belmont Public Schools.
      2. Regional: The Boston Calendar (https://www.thebostoncalendar.com/), Community Centers.
      3. Major/Paid: Ticketmaster, Eventbrite, and local theaters for family shows, kid concerts, or plays.
      
      Provide a curated list of 10-15 events.
      
      STRICTLY format each event using this template with explicit separators:
      
      ||EVENT_START||
      TITLE: [Event Name]
      DATE_DISPLAY: [Friendly date format, e.g., Saturday, Oct 14 at 10:00 AM]
      ISO_DATE: [ISO 8601 format date-time, e.g., 2023-10-14T10:00:00]
      LOCATION: [Specific Location]
      DESCRIPTION: [A concise 1-2 sentence description suitable for parents]
      TAGS: [Comma separated tags, e.g., Outdoors, Storytime, Music, Paid, Free]
      SOURCE_TYPE: [e.g. Local, Ticketmaster, Eventbrite, Library, Boston Calendar, Belmont Rec, Schools]
      SOURCE_URL: [Direct URL to the event details page if available, otherwise the main organization URL]
      ||EVENT_END||

      Do not add any markdown formatting (like bolding headers) inside the template fields. Keep it raw text. Ensure the ISO_DATE is accurate to the current year.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    
    // Parse Grounding Sources
    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    chunks.forEach((chunk: any) => {
      if (chunk.web?.uri && chunk.web?.title) {
        sources.push({
          uri: chunk.web.uri,
          title: chunk.web.title
        });
      }
    });

    // Parse Events from Text
    const events: EventData[] = [];
    const eventBlocks = text.split('||EVENT_START||').slice(1); // Skip preamble

    eventBlocks.forEach((block, index) => {
      const content = block.split('||EVENT_END||')[0];
      
      const titleMatch = content.match(/TITLE:\s*(.+)/);
      const dateDisplayMatch = content.match(/DATE_DISPLAY:\s*(.+)/);
      const isoDateMatch = content.match(/ISO_DATE:\s*(.+)/);
      const locationMatch = content.match(/LOCATION:\s*(.+)/);
      const descMatch = content.match(/DESCRIPTION:\s*(.+)/);
      const tagsMatch = content.match(/TAGS:\s*(.+)/);
      const sourceMatch = content.match(/SOURCE_TYPE:\s*(.+)/);
      const urlMatch = content.match(/SOURCE_URL:\s*(.+)/);

      // Fallback for old DATE format if DATE_DISPLAY is missing (model quirk handling)
      const dateValue = dateDisplayMatch ? dateDisplayMatch[1].trim() : (content.match(/DATE:\s*(.+)/)?.[1].trim() || "");

      if (titleMatch && dateValue) {
        events.push({
          id: `evt-${index}-${Date.now()}`,
          title: titleMatch[1].trim(),
          date: dateValue,
          isoDate: isoDateMatch ? isoDateMatch[1].trim() : undefined,
          location: locationMatch ? locationMatch[1].trim() : 'Belmont, MA',
          description: descMatch ? descMatch[1].trim() : 'No description available.',
          tags: tagsMatch ? tagsMatch[1].split(',').map(t => t.trim()) : ['Family'],
          sourceType: sourceMatch ? sourceMatch[1].trim() : 'Local',
          sourceUrl: urlMatch ? urlMatch[1].trim() : undefined
        });
      }
    });

    return {
      events,
      sources: removeDuplicateSources(sources),
      rawText: text
    };

  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
};

const removeDuplicateSources = (sources: GroundingSource[]): GroundingSource[] => {
  const seen = new Set();
  return sources.filter(s => {
    const duplicate = seen.has(s.uri);
    seen.add(s.uri);
    return !duplicate;
  });
};
