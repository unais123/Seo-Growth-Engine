import React, { useState, useEffect } from 'react';
import { fixCodeBlock, runAudit } from '../services/geminiService';
import { Code, Check, AlertTriangle, ArrowRight, RefreshCw, Loader2, Zap, FolderInput } from 'lucide-react';
import { PLACEHOLDER_CODE } from '../constants';
import { AuditResult, AnalysisType, BusinessDetails } from '../types';

interface CodeFixerProps {
  onAuditComplete: (result: AuditResult) => void;
  bizDetails?: BusinessDetails;
  initialCode?: string;
}

const CodeFixer: React.FC<CodeFixerProps> = ({ onAuditComplete, bizDetails, initialCode }) => {
  const [code, setCode] = useState(PLACEHOLDER_CODE);
  const [fixedCode, setFixedCode] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'input' | 'review'>('input');

  // Sync initialCode prop to state when it changes
  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);

  const handleAudit = async () => {
    setLoading(true);
    try {
      const result = await runAudit(code, AnalysisType.CODE, bizDetails);
      onAuditComplete(result);
      setMode('review');
    } catch (error) {
      alert("Analysis failed. Please check API Key.");
    } finally {
      setLoading(false);
    }
  };

  const handleFix = async () => {
    setLoading(true);
    try {
      const result = await fixCodeBlock(code, "General SEO/AEO Improvements based on audit");
      setFixedCode(result.fixedCode || "");
      setExplanation(result.explanation || "");
    } catch (error) {
      alert("Fix failed.");
    } finally {
      setLoading(false);
    }
  };

  const processFolderUpload = async (files: FileList) => {
    let combinedCode = '';
    const fileArray = Array.from(files).sort((a, b) => (a.webkitRelativePath || a.name).localeCompare(b.webkitRelativePath || b.name));
    let processedCount = 0;

    for (const file of fileArray) {
      const path = file.webkitRelativePath || file.name;
      // Filter out node_modules, .git, etc
      if (path.includes('node_modules') || path.includes('.git') || path.includes('dist') || path.includes('build')) continue;
      // Filter extensions
      if (!/\.(html|htm|css|js|jsx|ts|tsx|json|php|py|rb|md|txt)$/i.test(file.name)) continue;
      
      if (file.size > 200000) continue; 

      const text = await file.text();
      combinedCode += `\n\n/* --- FILE: ${path} --- */\n\n`;
      combinedCode += text;
      processedCount++;

      if (combinedCode.length > 800000) {
        combinedCode += "\n\n/* ... (Truncated) ... */";
        break;
      }
    }
    return combinedCode;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      const text = await processFolderUpload(files);
      setCode(text);
      setFixedCode(null);
      setExplanation(null);
      setMode('input'); // Reset to input mode so user can run audit
    } catch (error) {
      alert("Failed to read folder.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-brand-600" />
            <h3 className="font-semibold text-slate-800">Source Code Optimizer</h3>
          </div>
          <div className="flex items-center gap-2">
             <label className="flex items-center gap-2 text-slate-500 hover:text-brand-600 cursor-pointer text-xs font-medium bg-white px-3 py-1.5 rounded border border-slate-200 shadow-sm transition-all">
               <FolderInput className="w-3 h-3" />
               Upload Folder
               <input 
                 type="file" 
                 className="hidden" 
                 {...({ webkitdirectory: "true", directory: "true" } as any)}
                 multiple
                 onChange={handleFileUpload} 
               />
             </label>
             {mode === 'review' && !fixedCode && (
               <button 
                  onClick={handleFix}
                  disabled={loading}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg text-xs font-medium transition-colors"
               >
                  {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  Auto-Fix Code
               </button>
             )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 h-[500px]">
          <div className="border-r border-slate-200 flex flex-col">
            <div className="p-2 text-xs font-semibold text-slate-500 bg-slate-50 uppercase tracking-wider">Original Source</div>
            <textarea 
              className="flex-1 w-full p-4 font-mono text-sm resize-none focus:outline-none focus:bg-slate-50"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              placeholder="Paste code or upload folder to scan..."
            />
          </div>
          
          <div className="flex flex-col bg-slate-50/50">
             <div className="p-2 text-xs font-semibold text-slate-500 bg-slate-50 border-b border-slate-200 uppercase tracking-wider flex justify-between">
                <span>Optimized Output</span>
                {fixedCode && <Check className="w-4 h-4 text-green-500" />}
             </div>
             {fixedCode ? (
                <textarea 
                  className="flex-1 w-full p-4 font-mono text-sm resize-none focus:outline-none bg-green-50/30 text-slate-800"
                  value={fixedCode}
                  readOnly
                />
             ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
                   {loading ? (
                       <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-500" />
                   ) : (
                       <>
                        <ArrowRight className="w-8 h-8 mb-2" />
                        <p className="text-sm">Click "Auto-Fix Code" after auditing to generate the optimized version.</p>
                       </>
                   )}
                </div>
             )}
          </div>
        </div>
      </div>
      
      {explanation && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <Check className="w-4 h-4" /> Changes Applied
            </h4>
            <p className="text-green-700 text-sm">{explanation}</p>
        </div>
      )}

      {mode === 'input' && (
        <div className="flex justify-end">
             <button 
                onClick={handleAudit}
                disabled={loading}
                className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg shadow-brand-500/30 transition-all flex items-center gap-2"
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                Run SEO Code Audit
            </button>
        </div>
      )}
    </div>
  );
};

export default CodeFixer;