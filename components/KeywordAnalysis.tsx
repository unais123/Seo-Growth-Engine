import React, { useState, useEffect } from 'react';
import { KeywordData } from '../types';
import { researchKeywords } from '../services/geminiService';
import { Target, TrendingUp, BarChart3, Search, Loader2, ArrowUpDown, RefreshCw, PenTool } from 'lucide-react';

interface KeywordAnalysisProps {
  keywords: KeywordData[];
  onCreatePost: (topic: string) => void;
}

const DifficultyBadge = ({ level }: { level: string }) => {
  const colors = {
    Hard: 'bg-red-100 text-red-700 border-red-200',
    Medium: 'bg-amber-100 text-amber-700 border-amber-200',
    Easy: 'bg-green-100 text-green-700 border-green-200',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colors[level as keyof typeof colors] || colors.Medium}`}>
      {level}
    </span>
  );
};

type SortField = 'keyword' | 'intent' | 'volume' | 'difficulty';
type SortOrder = 'asc' | 'desc';

const KeywordAnalysis: React.FC<KeywordAnalysisProps> = ({ keywords, onCreatePost }) => {
  const [list, setList] = useState<KeywordData[]>(keywords);
  const [seed, setSeed] = useState('');
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  useEffect(() => {
    setList(keywords);
  }, [keywords]);

  const handleResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seed.trim()) return;
    
    setLoading(true);
    try {
      const newKeywords = await researchKeywords(seed);
      setList(newKeywords);
      setSortField(null); // Reset sort
    } catch (error) {
      alert("Failed to research keywords. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getWeight = (val: string, type: 'diff' | 'vol') => {
    const map: Record<string, number> = type === 'diff' 
      ? { 'Hard': 3, 'Medium': 2, 'Easy': 1 }
      : { 'High': 3, 'Medium': 2, 'Low': 1 };
    return map[val] || 0;
  };

  const sortedList = [...list].sort((a, b) => {
    if (!sortField) return 0;

    let valA: string | number = a[sortField];
    let valB: string | number = b[sortField];

    if (sortField === 'difficulty') {
      valA = getWeight(a.difficulty, 'diff');
      valB = getWeight(b.difficulty, 'diff');
    } else if (sortField === 'volume') {
      valA = getWeight(a.volume, 'vol');
      valB = getWeight(b.volume, 'vol');
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-slate-300 ml-1 inline" />;
    return <ArrowUpDown className={`w-3 h-3 text-brand-600 ml-1 inline ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />;
  };

  return (
    <div className="space-y-6">
      {/* Research Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold text-slate-900">Keyword Research Tool</h2>
        </div>
        <p className="text-slate-600 mb-6">
          Enter a seed keyword to discover new opportunities, analyze intent, and find low-competition terms.
        </p>

        <form onSubmit={handleResearch} className="flex gap-2 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="e.g. digital marketing agency, vegan recipes"
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            disabled={loading || !seed}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Find Keywords'}
          </button>
        </form>
      </div>

      {/* Results Table */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
           <div className="flex items-center gap-2">
              <Target className="w-6 h-6 text-brand-600" />
              <h2 className="text-xl font-bold text-slate-900">
                {seed ? `Results for "${seed}"` : 'Target Keywords'}
              </h2>
           </div>
           {seed && (
             <button 
               onClick={() => { setSeed(''); setList(keywords); setSortField(null); }}
               className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
             >
               <RefreshCw className="w-3 h-3" /> Reset to Audit
             </button>
           )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th 
                  className="px-6 py-3 font-semibold cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('keyword')}
                >
                  Keyword {renderSortIcon('keyword')}
                </th>
                <th 
                  className="px-6 py-3 font-semibold cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('intent')}
                >
                  Search Intent {renderSortIcon('intent')}
                </th>
                <th 
                  className="px-6 py-3 font-semibold cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('volume')}
                >
                  Est. Volume {renderSortIcon('volume')}
                </th>
                <th 
                  className="px-6 py-3 font-semibold cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('difficulty')}
                >
                  Difficulty {renderSortIcon('difficulty')}
                </th>
                <th className="px-6 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedList.length > 0 ? (
                sortedList.map((kw, idx) => (
                  <tr key={idx} className="bg-white hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                      <Search className="w-3 h-3 text-slate-400" />
                      {kw.keyword}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs">
                        {kw.intent}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-700">
                        <BarChart3 className="w-4 h-4 text-slate-400" />
                        {kw.volume}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <DifficultyBadge level={kw.difficulty} />
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button 
                          onClick={() => onCreatePost(kw.keyword)}
                          className="flex items-center gap-1 ml-auto text-brand-600 hover:text-brand-800 font-medium text-xs hover:bg-brand-50 px-2 py-1 rounded transition-colors"
                       >
                          <PenTool className="w-3 h-3" /> Create Post
                       </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No keywords found. Try a different search term.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default KeywordAnalysis;