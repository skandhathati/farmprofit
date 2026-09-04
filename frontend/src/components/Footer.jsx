import React from 'react';
import { Sprout, Heart, Shield, Cpu, ExternalLink } from 'lucide-react';

export default function Footer({ setActiveTab }) {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Col 1 */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
              <Sprout className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">FarmProfit</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            AI-powered farming profitability platform providing predictive intelligence, expense analysis, ROI estimation, and scenario planning for farmers.
          </p>
          <div className="flex items-center space-x-2 text-xs text-emerald-400">
            <Shield className="w-4 h-4" />
            <span>Dataset Verified (1,000 Farm Records)</span>
          </div>
        </div>

        {/* Col 2 */}
        <div>
          <h4 className="text-sm font-semibold text-white tracking-wide uppercase mb-4">Features</h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <button onClick={() => setActiveTab('calculator')} className="hover:text-emerald-400 transition-colors">
                Farm Profit Calculator
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('dashboard')} className="hover:text-emerald-400 transition-colors">
                Interactive Dashboard
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('what-if')} className="hover:text-emerald-400 transition-colors">
                What-If Scenario Tool
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('crop-comparison')} className="hover:text-emerald-400 transition-colors">
                Crop Comparison Matrix
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3 */}
        <div>
          <h4 className="text-sm font-semibold text-white tracking-wide uppercase mb-4">ML Intelligence</h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <button onClick={() => setActiveTab('model-performance')} className="hover:text-emerald-400 transition-colors">
                Gradient Boosting Regressor (R² 0.958)
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('model-performance')} className="hover:text-emerald-400 transition-colors">
                Random Forest Classifier (95% Accuracy)
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('model-performance')} className="hover:text-emerald-400 transition-colors">
                Feature Importance Analysis
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('about')} className="hover:text-emerald-400 transition-colors">
                Financial Logic Formulas
              </button>
            </li>
          </ul>
        </div>

        {/* Col 4 */}
        <div>
          <h4 className="text-sm font-semibold text-white tracking-wide uppercase mb-4">Platform Stack</h4>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2.5 py-1 bg-slate-800 rounded-md text-slate-300">FastAPI</span>
            <span className="px-2.5 py-1 bg-slate-800 rounded-md text-slate-300">React + Vite</span>
            <span className="px-2.5 py-1 bg-slate-800 rounded-md text-slate-300">Scikit-Learn</span>
            <span className="px-2.5 py-1 bg-slate-800 rounded-md text-slate-300">Tailwind CSS</span>
            <span className="px-2.5 py-1 bg-slate-800 rounded-md text-slate-300">Recharts</span>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-800/60 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
        <p>© 2026 FarmProfit Platform. Built for Data-Driven Farming Decisions.</p>
        <p className="flex items-center space-x-1 mt-2 sm:mt-0">
          <span>Designed with</span>
          <Heart className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400 inline" />
          <span>for agricultural innovation.</span>
        </p>
      </div>
    </footer>
  );
}
