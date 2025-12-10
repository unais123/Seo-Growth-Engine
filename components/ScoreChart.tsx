import React from 'react';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { SeoScore } from '../types';

interface ScoreChartProps {
  scores: SeoScore;
}

const ScoreChart: React.FC<ScoreChartProps> = ({ scores }) => {
  const data = [
    { name: 'Basic SEO', score: scores.basic, fill: '#3b82f6' },
    { name: 'Technical SEO', score: scores.technical, fill: '#f59e0b' },
    { name: 'Advanced SEO', score: scores.advanced, fill: '#8b5cf6' },
    { name: 'AEO', score: scores.aeo, fill: '#ec4899' },
    { name: 'GEO', score: scores.geo, fill: '#10b981' },
  ];

  return (
    <div className="w-full h-80 bg-white rounded-xl shadow-sm border border-slate-100 p-4">
      <h3 className="text-lg font-semibold text-slate-800 mb-2">Performance Overview</h3>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" barSize={15} data={data}>
          <RadialBar
            label={{ position: 'insideStart', fill: '#fff' }}
            background
            dataKey="score"
          />
          <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{ right: 0 }} />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreChart;