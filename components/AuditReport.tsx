import React, { useState } from 'react';
import { AuditResult, Recommendation } from '../types';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle, Zap, ShieldCheck, Info, Lightbulb, Settings, Globe, Search } from 'lucide-react';

interface AuditReportProps {
  data: AuditResult;
}

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    Fail: 'bg-red-100 text-red-700 border-red-200',
    Warning: 'bg-amber-100 text-amber-700 border-amber-200',
    Pass: 'bg-green-100 text-green-700 border-green-200',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[status as keyof typeof styles] || styles.Warning}`}>
      {status.toUpperCase()}
    </span>
  );
};

const AuditSection = ({ title, items, icon: Icon, description }: { title: string, items: Recommendation[], icon: any, description: string }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (items.length === 0) return null;

  // Sort: Fail first, then Warning, then Pass
  const sortedItems = [...items].sort((a, b) => {
    const priority = { Fail: 0, Warning: 1, Pass: 2 };
    return priority[a.status] - priority[b.status];
  });

  const failCount = items.filter(i => i.status === 'Fail').length;
  const passCount = items.filter(i => i.status === 'Pass').length;

  return (
    <div className="mb-6 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-slate-50 to-white hover:from-slate-100 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${failCount > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="text-left">
             <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
             <p className="text-xs text-slate-500">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex gap-2 text-xs font-medium">
              <span className="text-red-600 bg-red-50 px-2 py-1 rounded">{failCount} Issues</span>
              <span className="text-green-600 bg-green-50 px-2 py-1 rounded">{passCount} Passed</span>
           </div>
           {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </div>
      </button>
      
      {isOpen && (
        <div className="divide-y divide-slate-100">
          {sortedItems.map((rec, idx) => (
            <div key={idx} className="p-5 hover:bg-slate-50/50 transition-colors">
              <div className="flex gap-4 items-start">
                <div className="mt-1 flex-shrink-0">
                  {rec.status === 'Fail' && <AlertCircle className="w-5 h-5 text-red-500" />}
                  {rec.status === 'Warning' && <Zap className="w-5 h-5 text-amber-500" />}
                  {rec.status === 'Pass' && <CheckCircle className="w-5 h-5 text-green-500" />}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h4 className={`font-semibold text-base ${rec.status === 'Pass' ? 'text-slate-700' : 'text-slate-900'}`}>
                        {rec.title}
                    </h4>
                    <StatusBadge status={rec.status} />
                  </div>
                  
                  <p className="text-sm text-slate-600 leading-relaxed">{rec.description}</p>

                  {/* Solution Block - Show for all items to provide value/education */}
                  <div className="mt-3 bg-slate-50 rounded-lg border border-slate-200 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Lightbulb className="w-3 h-3 text-brand-600" />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {rec.status === 'Pass' ? 'Why this is good' : 'Solution & Example'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-800 font-medium">{rec.solution}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AuditReport: React.FC<AuditReportProps> = ({ data }) => {
  // Correct Order: Basic -> Technical -> Advanced -> AEO -> GEO
  const sections = [
    {
      title: "1. Basic SEO Foundation",
      key: 'Basic',
      description: "On-page essentials: Titles, Headings, Meta descriptions, and basic content structure.",
      icon: Search
    },
    {
      title: "2. Technical SEO",
      key: 'Technical',
      description: "Performance & Indexing: Page speed, Mobile responsiveness, HTTPS, Sitemap, Robots.txt.",
      icon: Settings
    },
    {
      title: "3. Advanced Growth SEO",
      key: 'Advanced',
      description: "Authority building: E-E-A-T signals, topic clusters, semantic relevance, and backlink profile.",
      icon: ShieldCheck
    },
    {
      title: "4. Answer Engine Optimization (AEO)",
      key: 'AEO',
      description: "AI Readiness: Optimizing for Featured Snippets, Voice Search, and AI Overviews.",
      icon: Zap
    },
    {
      title: "5. Local SEO (GEO)",
      key: 'GEO',
      description: "Location visibility: Google Business Profile, Local Keywords, and localized content.",
      icon: Globe
    }
  ];

  return (
    <div className="space-y-8">
      {/* Executive Summary */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-brand-500"></div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Executive Summary</h2>
        <p className="text-slate-600 leading-relaxed text-lg">{data.summary}</p>
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 gap-4">
        {sections.map((section) => (
            <AuditSection 
                key={section.key}
                title={section.title}
                description={section.description}
                items={data.recommendations.filter(r => r.category === section.key)}
                icon={section.icon}
            />
        ))}
      </div>
      
      <div className="text-center text-sm text-slate-400 mt-8">
        <p>Audit generated by AI-Powered SEO Automation Engine</p>
      </div>
    </div>
  );
};

export default AuditReport;