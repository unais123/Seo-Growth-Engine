import React, { useState } from 'react';
import { 
  Search, 
  Code, 
  BarChart2, 
  Globe, 
  Cpu, 
  ArrowRight, 
  Loader2,
  LayoutDashboard,
  Target,
  Link,
  Building2,
  MapPin,
  Briefcase,
  Upload,
  FolderInput,
  Lock,
  CheckCircle2
} from 'lucide-react';

import { runAudit } from './services/geminiService';
import { AuditResult, AnalysisType, BusinessDetails } from './types';

import ScoreChart from './components/ScoreChart';
import AuditReport from './components/AuditReport';
import BlogGenerator from './components/BlogGenerator';
import CodeFixer from './components/CodeFixer';
import KeywordAnalysis from './components/KeywordAnalysis';
import BacklinkStrategyView from './components/BacklinkStrategy';

// Define UI tabs
type Tab = 'dashboard' | 'report' | 'keywords' | 'backlinks' | 'blogs' | 'code';

function App() {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [inputType, setInputType] = useState<AnalysisType>(AnalysisType.URL);
  const [uploadedCode, setUploadedCode] = useState<string>('');
  
  // State for passing blog topic from Keywords tab to Blog tab
  const [pendingBlogTopic, setPendingBlogTopic] = useState<string | null>(null);
  
  // Business Context State
  const [bizDetails, setBizDetails] = useState<BusinessDetails>({
    name: '',
    industry: '',
    location: '',
    keywords: '',
    competitors: ''
  });

  // Validation: Check if required fields are filled
  const isBizContextValid = Boolean(
    bizDetails.name.trim() && 
    bizDetails.industry.trim() && 
    bizDetails.location.trim() && 
    bizDetails.keywords.trim()
  );

  const handleAnalyze = async () => {
    if (!url && inputType === AnalysisType.URL) return;
    if (!isBizContextValid) return;

    setIsAnalyzing(true);
    try {
      // Pass business details to the service
      const data = await runAudit(url, AnalysisType.URL, bizDetails);
      setResult(data);
      setActiveTab('dashboard');
    } catch (error) {
      alert("Analysis failed. Please ensure you have a valid API KEY in the environment or configured in code.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const processFolderUpload = async (files: FileList) => {
    let combinedCode = '';
    let fileCount = 0;
    
    const fileArray = Array.from(files).sort((a, b) => (a.webkitRelativePath || a.name).localeCompare(b.webkitRelativePath || b.name));

    for (const file of fileArray) {
      const path = file.webkitRelativePath || file.name;
      
      // Skip node_modules, git, and other non-source folders
      if (path.includes('node_modules') || path.includes('.git') || path.includes('dist') || path.includes('build') || path.includes('.next')) {
        continue;
      }

      // Only process text/code files
      const isCode = /\.(html|htm|css|js|jsx|ts|tsx|json|php|py|rb|md|txt)$/i.test(file.name);
      if (!isCode) continue;

      if (file.size > 200000) continue; // Skip individual files > 200KB to preserve context window

      try {
        const text = await file.text();
        combinedCode += `\n\n/* --- FILE: ${path} --- */\n\n`;
        combinedCode += text;
        fileCount++;

        // Limit total size to avoid API errors (approx 1MB text)
        if (combinedCode.length > 1000000) {
          combinedCode += "\n\n/* ... (Upload truncated due to size limit) ... */";
          break;
        }
      } catch (e) {
        console.warn(`Failed to read file ${path}`);
      }
    }

    if (fileCount === 0) {
      throw new Error("No valid code files found in the uploaded folder.");
    }

    return combinedCode;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isBizContextValid) return;

    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsAnalyzing(true);
    try {
      const text = await processFolderUpload(files);
      setUploadedCode(text);
      
      // Auto-run audit with the uploaded code
      const data = await runAudit(text, AnalysisType.CODE, bizDetails);
      setResult(data);
      // Redirect to dashboard to show full strategy, not just code editor
      setActiveTab('dashboard');
    } catch (error) {
      alert("Failed to read files or run analysis. " + (error as Error).message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCodeAuditStart = async () => {
    if (!isBizContextValid) return;

    // Manual switch to code tab without file
    setResult({
        summary: "Pending Code Analysis...",
        scores: { basic: 0, technical: 0, advanced: 0, aeo: 0, geo: 0 },
        recommendations: [],
        blogIdeas: [],
        keywords: [],
        backlinks: []
    });
    setActiveTab('code');
  };

  const handleCodeAuditResult = (data: AuditResult) => {
    setResult(data);
  };

  const handleCreatePost = (topic: string) => {
    setPendingBlogTopic(topic);
    setActiveTab('blogs');
  };

  const reset = () => {
    setResult(null);
    setUrl('');
    setUploadedCode('');
    setActiveTab('dashboard');
  };

  const handleBizChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBizDetails({ ...bizDetails, [e.target.name]: e.target.value });
  };

  // --- Render Functions ---

  const renderHero = () => (
    <div className="min-h-screen w-full flex flex-col items-center justify-start py-12 px-4 bg-slate-900 text-white relative overflow-x-hidden font-sans selection:bg-brand-500/30">
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-brand-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-5xl w-full text-center space-y-10 relative z-10">
        
        {/* Header Section */}
        <div className="space-y-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full text-sm font-medium text-brand-300 shadow-lg">
            <Cpu className="w-4 h-4" />
            <span className="tracking-wide">AI-POWERED SEO AUTOMATION</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
            Stop Paying for <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-blue-400 to-purple-400">
              SEO Agencies
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            The first <strong>Growth Engine</strong> that audits, strategizes, writes content, and fixes code automatically. 
            Master <strong>Basic, Advanced, AEO & GEO</strong> SEO in minutes.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl ring-1 ring-white/5">
          
          {/* Input Type Toggles */}
          <div className="flex justify-center mb-8">
            <div className="bg-slate-900/60 p-1.5 rounded-xl border border-white/5 inline-flex relative">
               <button 
                  onClick={() => setInputType(AnalysisType.URL)}
                  className={`relative z-10 flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${inputType === AnalysisType.URL ? 'text-white bg-slate-700 shadow-lg ring-1 ring-white/10' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <Globe className="w-4 h-4" /> Website URL
                </button>
                <button 
                  onClick={() => setInputType(AnalysisType.CODE)}
                  className={`relative z-10 flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${inputType === AnalysisType.CODE ? 'text-white bg-slate-700 shadow-lg ring-1 ring-white/10' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <Code className="w-4 h-4" /> Code Project
                </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 text-left">
             {/* Left Column: Inputs */}
             <div className="space-y-6 flex flex-col justify-center">
                {inputType === AnalysisType.URL ? (
                    <div className="space-y-4">
                       <label className="block text-sm font-medium text-slate-300 ml-1">
                          Enter Website to Audit
                       </label>
                       <div className="relative group">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-500 to-purple-500 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                          <div className="relative flex items-center bg-slate-900 rounded-xl border border-white/10 focus-within:border-brand-500/50 transition-colors">
                             <Search className="ml-4 w-5 h-5 text-slate-500" />
                             <input 
                                type="url" 
                                placeholder="https://www.yourbusiness.com"
                                className="w-full pl-3 pr-4 py-4 bg-transparent text-white placeholder:text-slate-600 focus:outline-none"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                              />
                          </div>
                       </div>
                       
                       <button 
                          onClick={handleAnalyze}
                          disabled={isAnalyzing || !url || !isBizContextValid}
                          className="w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white p-4 rounded-xl font-bold text-lg shadow-lg shadow-brand-900/50 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group"
                        >
                          {isAnalyzing ? (
                             <>
                               <Loader2 className="animate-spin w-5 h-5" /> Analyzing Engine...
                             </>
                          ) : (
                             <>
                               Generate Strategy <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                             </>
                          )}
                        </button>
                        {!isBizContextValid && url && (
                            <div className="flex items-center justify-center gap-2 text-amber-400 text-xs bg-amber-900/20 p-2 rounded-lg border border-amber-900/30">
                                <Lock className="w-3 h-3" /> Complete Business Context to unlock
                            </div>
                        )}
                    </div>
                ) : (
                   <div className="h-full flex flex-col">
                       <label className="block text-sm font-medium text-slate-300 ml-1 mb-2">
                          Upload Source Code
                       </label>
                       <div className={`flex-1 min-h-[160px] relative border-2 border-dashed border-white/10 rounded-xl bg-slate-900/50 hover:bg-slate-800/50 transition-all p-6 flex flex-col items-center justify-center text-center group ${!isBizContextValid ? 'opacity-50' : 'cursor-pointer border-brand-500/30 hover:border-brand-500/50'}`}>
                          {!isBizContextValid && (
                             <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-[1px] rounded-xl">
                                <Lock className="w-8 h-8 text-amber-500 mb-2" />
                                <span className="text-sm font-medium text-amber-100">Unlock by filling details</span>
                             </div>
                          )}
                          <input 
                            type="file" 
                            {...({ webkitdirectory: "true", directory: "true" } as any)}
                            multiple
                            onChange={handleFileUpload}
                            disabled={!isBizContextValid}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                          />
                          <FolderInput className="w-10 h-10 text-brand-500 mb-3 group-hover:scale-110 transition-transform" />
                          <p className="text-white font-medium">Upload Project Folder</p>
                          <p className="text-xs text-slate-500 mt-1">Supports HTML, JS, React, CSS</p>
                       </div>
                       <button 
                            onClick={handleCodeAuditStart}
                            disabled={!isBizContextValid}
                            className="mt-3 text-xs text-slate-500 hover:text-brand-400 transition-colors flex items-center justify-center gap-1 disabled:opacity-0"
                        >
                            <Code className="w-3 h-3" /> Open Manual Editor
                        </button>
                   </div>
                )}
             </div>

             {/* Right Column: Business Context */}
             <div className={`text-left bg-slate-900/30 rounded-2xl p-6 border transition-all duration-300 ${isBizContextValid ? 'border-green-500/20' : 'border-amber-500/20 shadow-[0_0_15px_-3px_rgba(245,158,11,0.1)]'}`}>
                <div className="flex items-center justify-between mb-6">
                   <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isBizContextValid ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
                         <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                         <h3 className="font-semibold text-white text-sm uppercase tracking-wide">Business Context</h3>
                         <p className="text-xs text-slate-500">Required for tailored strategy</p>
                      </div>
                   </div>
                   {isBizContextValid ? (
                      <div className="flex items-center gap-1 text-green-400 bg-green-500/10 px-2 py-1 rounded-full text-xs font-bold border border-green-500/20">
                         <CheckCircle2 className="w-3 h-3" /> READY
                      </div>
                   ) : (
                      <span className="text-[10px] font-bold bg-amber-500/10 text-amber-400 px-2 py-1 rounded border border-amber-500/20 animate-pulse">
                        REQUIRED STEP 1
                      </span>
                   )}
                </div>

                <div className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                         <label className="text-xs text-slate-400 font-medium ml-1">Business Name</label>
                         <input 
                            name="name"
                            placeholder="e.g. Acme Inc"
                            className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-lg text-sm text-white focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 focus:outline-none transition-all placeholder:text-slate-700"
                            value={bizDetails.name}
                            onChange={handleBizChange}
                         />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-xs text-slate-400 font-medium ml-1">Industry</label>
                         <input 
                            name="industry"
                            placeholder="e.g. SaaS"
                            className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-lg text-sm text-white focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 focus:outline-none transition-all placeholder:text-slate-700"
                            value={bizDetails.industry}
                            onChange={handleBizChange}
                         />
                      </div>
                   </div>
                   
                   <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 font-medium ml-1">Target Location</label>
                      <div className="relative">
                         <MapPin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                         <input 
                            name="location"
                            placeholder="e.g. New York, USA (or 'Global')"
                            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-white/10 rounded-lg text-sm text-white focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 focus:outline-none transition-all placeholder:text-slate-700"
                            value={bizDetails.location}
                            onChange={handleBizChange}
                         />
                      </div>
                   </div>

                   <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 font-medium ml-1">Core Keywords / Services</label>
                      <input 
                         name="keywords"
                         placeholder="e.g. web design, seo audit"
                         className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-lg text-sm text-white focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 focus:outline-none transition-all placeholder:text-slate-700"
                         value={bizDetails.keywords}
                         onChange={handleBizChange}
                      />
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Footer Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 opacity-70">
           {[
              { label: 'Deep SEO Audit', color: 'bg-blue-500' },
              { label: 'AEO Optimized', color: 'bg-purple-500' },
              { label: 'Local GEO Ranking', color: 'bg-green-500' },
              { label: 'Auto-Code Fixes', color: 'bg-amber-500' },
           ].map((feat, i) => (
              <div key={i} className="flex items-center justify-center gap-2 bg-white/5 border border-white/5 rounded-full py-2 px-4 backdrop-blur-sm">
                 <div className={`w-2 h-2 rounded-full ${feat.color} shadow-[0_0_8px_currentColor]`}></div>
                 <span className="text-xs font-semibold text-slate-300 tracking-wide">{feat.label}</span>
              </div>
           ))}
        </div>

      </div>
    </div>
  );

  const renderDashboard = () => {
    if (!result) return null;

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Navigation */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={reset}>
               <div className="bg-brand-600 text-white p-1.5 rounded-lg">
                  <Cpu className="w-5 h-5" />
               </div>
               <span className="font-bold text-slate-900 text-lg hidden sm:block">SEO Growth Engine</span>
            </div>
            
            <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto">
              {[
                { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
                { id: 'report', label: 'Audit', icon: BarChart2 },
                { id: 'keywords', label: 'Keywords', icon: Target },
                { id: 'backlinks', label: 'Backlinks', icon: Link },
                { id: 'blogs', label: 'AI Blogs', icon: Globe },
                { id: 'code', label: 'Code Optimizer', icon: Code },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as Tab)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === item.id 
                      ? 'bg-brand-50 text-brand-700' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              ))}
            </nav>
            
            <button 
              onClick={reset}
              className="text-sm text-slate-500 hover:text-slate-900 hidden sm:block"
            >
              New Audit
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                 <div className="bg-gradient-to-r from-brand-600 to-purple-700 rounded-2xl p-8 text-white shadow-lg">
                    <h2 className="text-2xl font-bold mb-2">Audit Complete</h2>
                    <p className="opacity-90 max-w-xl">{result.summary}</p>
                 </div>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                       <h3 className="text-slate-500 text-sm font-medium uppercase mb-2">Top Priority</h3>
                       <div className="text-3xl font-bold text-slate-900">
                          {result.recommendations.filter(r => r.impact === 'High').length}
                       </div>
                       <p className="text-sm text-red-500 mt-1 font-medium">Critical Issues Found</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                       <h3 className="text-slate-500 text-sm font-medium uppercase mb-2">Quick Wins</h3>
                       <div className="text-3xl font-bold text-slate-900">
                          {result.recommendations.filter(r => r.impact === 'Medium').length}
                       </div>
                       <p className="text-sm text-amber-500 mt-1 font-medium">Medium Impact Fixes</p>
                    </div>
                 </div>

                 <AuditReport data={result} />
              </div>
              
              <div className="space-y-6">
                 <ScoreChart scores={result.scores} />
                 
                 <div className="bg-indigo-900 text-white rounded-xl p-6 shadow-md">
                    <h3 className="font-bold text-lg mb-4">AEO Strategy Tip</h3>
                    <p className="text-sm text-indigo-100 mb-4">
                      To rank in AI Overviews, restructure your top pages to answer "What", "How", and "Why" questions in the first 60 words.
                    </p>
                    <button 
                      onClick={() => setActiveTab('blogs')}
                      className="w-full bg-white text-indigo-900 py-2 rounded-lg font-semibold text-sm hover:bg-indigo-50 transition"
                    >
                      Generate AEO Content
                    </button>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'report' && (
            <div className="max-w-4xl mx-auto">
               <AuditReport data={result} />
            </div>
          )}

          {activeTab === 'keywords' && (
             <KeywordAnalysis keywords={result.keywords} onCreatePost={handleCreatePost} />
          )}

          {activeTab === 'backlinks' && (
             <BacklinkStrategyView strategies={result.backlinks} />
          )}

          {activeTab === 'blogs' && (
             <BlogGenerator 
               ideas={result.blogIdeas} 
               context={url || "General Industry Context"} 
               initialTopic={pendingBlogTopic}
               onTopicCleared={() => setPendingBlogTopic(null)}
             />
          )}

          {activeTab === 'code' && (
             <CodeFixer 
                onAuditComplete={handleCodeAuditResult} 
                bizDetails={bizDetails} 
                initialCode={uploadedCode} 
             />
          )}

        </main>
      </div>
    );
  };

  return result ? renderDashboard() : renderHero();
}

export default App;