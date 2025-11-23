import React from 'react';
import { ExternalLink } from 'lucide-react';
import { GroundingSource } from '../types';

interface SourceListProps {
  sources: GroundingSource[];
}

export const SourceList: React.FC<SourceListProps> = ({ sources }) => {
  if (sources.length === 0) return null;

  return (
    <div className="mt-12 border-t border-slate-200 pt-8">
      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center">
        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
        Verified Sources
      </h4>
      <div className="flex flex-wrap gap-3">
        {sources.map((source, idx) => (
          <a
            key={idx}
            href={source.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1.5 rounded-md bg-slate-100 text-slate-600 text-xs hover:bg-slate-200 hover:text-slate-900 transition-colors truncate max-w-xs"
            title={source.title}
          >
            <ExternalLink className="w-3 h-3 mr-1.5" />
            {source.title || new URL(source.uri).hostname}
          </a>
        ))}
      </div>
    </div>
  );
};