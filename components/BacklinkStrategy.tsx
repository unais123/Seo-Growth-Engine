import React from 'react';
import { BacklinkStrategy } from '../types';
import { Link, ExternalLink, Lightbulb, Send } from 'lucide-react';

interface BacklinkStrategyProps {
  strategies: BacklinkStrategy[];
}

const BacklinkStrategyCard: React.FC<{ strategy: BacklinkStrategy }> = ({ strategy }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
        <div className="flex gap-3">
          <div className="bg-brand-100 text-brand-600 p-2 rounded-lg h-fit">
            <Link className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">{strategy.type}</h3>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Authority Building</span>
          </div>
        </div>
        <ExternalLink className="w-4 h-4 text-slate-400" />
      </div>
      
      <div className="p-5 space-y-4">
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
             <Lightbulb className="w-3 h-3" /> Strategy
          </h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            {strategy.description}
          </p>
        </div>

        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
          <h4 className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-2 flex items-center gap-1">
             <Send className="w-3 h-3" /> Example / Outreach Idea
          </h4>
          <p className="text-sm text-slate-700 italic border-l-2 border-brand-300 pl-3">
            "{strategy.example}"
          </p>
        </div>
      </div>
    </div>
  );
};

const BacklinkStrategyView: React.FC<BacklinkStrategyProps> = ({ strategies }) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-brand-700 to-brand-900 rounded-2xl p-8 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Backlink & Authority Roadmap</h2>
        <p className="opacity-90 max-w-2xl">
          Off-page SEO is crucial for ranking. Use these tailored strategies to build trust and authority for your specific niche. 
          Focus on quality over quantity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {strategies.map((strategy, idx) => (
          <BacklinkStrategyCard key={idx} strategy={strategy} />
        ))}
      </div>
    </div>
  );
};

export default BacklinkStrategyView;
