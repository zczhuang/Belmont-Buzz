
export interface EventData {
  id: string;
  title: string;
  date: string;
  isoDate?: string;
  location: string;
  description: string;
  tags: string[];
  sourceType?: string;
  sourceUrl?: string;
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface FetchResult {
  events: EventData[];
  sources: GroundingSource[];
  rawText?: string;
}
