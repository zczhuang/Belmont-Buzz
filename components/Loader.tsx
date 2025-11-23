import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4 text-slate-500">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      <p className="text-sm font-medium animate-pulse">Scouring local sources for events...</p>
    </div>
  );
};