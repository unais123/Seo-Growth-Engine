import React, { useState, useEffect } from 'react';
import { generateBlogPost } from '../services/geminiService';
import { FileText, Loader2, PenTool } from 'lucide-react';

interface BlogGeneratorProps {
  ideas: string[];
  context: string;
  initialTopic?: string | null;
  onTopicCleared?: () => void;
}

const BlogGenerator: React.FC<BlogGeneratorProps> = ({ ideas, context, initialTopic, onTopicCleared }) => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (topic: string) => {
    setLoading(true);
    setSelectedTopic(topic);
    try {
      const result = await generateBlogPost(topic, context);
      setContent(result);
    } catch (e) {
      setContent("Error generating blog content. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTopic) {
      handleGenerate(initialTopic);
      if (onTopicCleared) {
        onTopicCleared();
      }
    }
  }, [initialTopic]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center gap-2 mb-2">
          <PenTool className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-bold text-slate-800">Daily Blog Generator</h2>
        </div>
        <p className="text-sm text-slate-500">
          Select a topic below to generate a full, SEO-optimized article with AEO snippets and Schema.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 min-h-[400px]">
        {/* Sidebar: Topics */}
        <div className="col-span-1 border-r border-slate-100 bg-slate-50 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Suggested Topics</h3>
          <div className="space-y-2">
            {ideas.map((idea, idx) => (
              <button
                key={idx}
                onClick={() => handleGenerate(idea)}
                disabled={loading}
                className={`w-full text-left p-3 rounded-lg text-sm transition-all duration-200 ${
                  selectedTopic === idea 
                    ? 'bg-purple-100 text-purple-700 border border-purple-200 shadow-sm' 
                    : 'bg-white hover:bg-white text-slate-600 border border-transparent hover:shadow-sm'
                }`}
              >
                {idea}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="col-span-2 p-6 overflow-y-auto max-h-[600px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Loader2 className="w-10 h-10 animate-spin mb-4 text-purple-500" />
              <p>Writing your SEO masterpiece...</p>
              {selectedTopic && <p className="text-xs mt-2 text-slate-500">Generating content for: "{selectedTopic}"</p>}
            </div>
          ) : content ? (
            <div className="prose prose-sm md:prose-base max-w-none prose-headings:text-slate-800 prose-p:text-slate-600">
              <h1 className="text-2xl font-bold text-brand-700 mb-4">{selectedTopic}</h1>
              <div className="whitespace-pre-wrap">{content}</div>
              <button 
                onClick={() => setContent('')}
                className="mt-6 text-sm text-slate-400 hover:text-slate-600 underline"
              >
                Clear
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50/50 rounded-lg border-2 border-dashed border-slate-200">
              <FileText className="w-12 h-12 mb-2 text-slate-300" />
              <p>Select a topic to generate content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogGenerator;