import React from 'react';
import { 
  Info, Sprout, DollarSign, Calculator, Cpu, ShieldCheck, 
  Layers, CheckCircle2, ArrowUpRight 
} from 'lucide-react';

export default function About({ setActiveTab }) {
  const formulas = [
    {
      name: "Total Farming Cost (₹)",
      formula: "Seed Cost + Fertilizer Cost + Labor Cost + Transportation Cost + Other Expenses",
      desc: "Comprehensive sum of all operational, input, and logistial expenses."
    },
    {
      name: "Expected Revenue (₹)",
      formula: "Total Expected Yield (Quintals) × Market Price (₹ per Quintal)",
      desc: "Gross revenue generated from selling the entire harvested crop volume."
    },
    {
      name: "Net Profit / Loss (₹)",
      formula: "Expected Revenue - Total Farming Cost",
      desc: "Net bottom-line financial yield. Positive values indicate net profit; negative values represent a loss."
    },
    {
      name: "Profit Margin (%)",
      formula: "(Net Profit / Expected Revenue) × 100",
      desc: "Percentage of total gross revenue retained as net earnings after all cost deductions."
    },
    {
      name: "Return on Investment (ROI %)",
      formula: "(Net Profit / Total Farming Cost) × 100",
      desc: "Capital efficiency metric showing net return per rupee invested in farming expenses."
    },
    {
      name: "Break-Even Price (₹ / Quintal)",
      formula: "Total Farming Cost / Total Expected Yield",
      desc: "Minimum market selling price required to recover total farming expenses."
    },
    {
      name: "Break-Even Yield (Quintals)",
      formula: "Total Farming Cost / Market Price",
      desc: "Minimum physical yield required to cover total operational expenses."
    }
  ];

  return (
    <div className="space-y-12 py-6">
      
      {/* Page Title */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400">
            <Info className="w-7 h-7" />
          </div>
          <span>About FarmProfit Platform</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Architectural documentation, financial formulas, dataset methodology, and platform design.
        </p>
      </div>

      {/* Problem Statement & Mission */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Sprout className="w-5 h-5 text-emerald-400" />
          <span>Core Mission & Agricultural Problem Statement</span>
        </h2>
        <p className="text-slate-300 text-sm leading-relaxed">
          In traditional farming, decisions are often driven by yield expectations alone. However, a high crop yield does not automatically equate to high financial profit. Final farming profit depends on a complex interplay of land area, seed genetics, fertilizer dosage, labor wages, transportation logistics, ancillary costs, and volatile market prices.
        </p>
        <p className="text-slate-300 text-sm leading-relaxed">
          <strong>FarmProfit</strong> bridges this decision gap by providing real-time financial transparency, machine-learning predictive modeling, scenario simulation, and multi-crop comparison tools so farmers can plan profitability before sowing seeds.
        </p>
      </div>

      {/* Financial Calculation Logic & Formulas */}
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-white">Financial Calculation Formulas</h2>
          <p className="text-xs text-slate-400">Transparent, deterministic formulas embedded in the platform backend</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {formulas.map((item, idx) => (
            <div key={idx} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-base font-bold text-emerald-400">{item.name}</h3>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-xs text-white">
                {item.formula}
              </div>
              <p className="text-xs text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Technology Stack Grid */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-400" />
          <span>Full-Stack Platform Architecture</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">Frontend Layer</span>
            <h4 className="font-bold text-white text-base">React 18 + Vite + Tailwind CSS</h4>
            <p className="text-xs text-slate-400">
              Responsive glassmorphism UI with Recharts dynamic data visualization and Lucide iconography.
            </p>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">Backend Layer</span>
            <h4 className="font-bold text-white text-base">FastAPI + Python 3.10+</h4>
            <p className="text-xs text-slate-400">
              High-performance asynchronous API endpoints with Pydantic schema validation and Pandas data services.
            </p>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">Machine Learning Layer</span>
            <h4 className="font-bold text-white text-base">Scikit-Learn + Joblib</h4>
            <p className="text-xs text-slate-400">
              Gradient Boosting Regressor (R² = 0.958) and Classifier (95% Accuracy) trained on 1,000 verified farm records.
            </p>
          </div>

        </div>
      </div>

      {/* Call to action */}
      <div className="glass-panel p-8 rounded-3xl border border-emerald-500/30 text-center space-y-4 bg-gradient-to-r from-emerald-950/30 via-slate-900 to-emerald-950/30">
        <h3 className="text-2xl font-bold text-white">Ready to calculate your farm profit?</h3>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          Start entering your farm details or explore dataset analytics on the dashboard.
        </p>
        <button
          onClick={() => setActiveTab('calculator')}
          className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-bold text-sm inline-flex items-center space-x-2 shadow-lg shadow-emerald-950/40"
        >
          <span>Open Farm Calculator</span>
          <ArrowUpRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>

    </div>
  );
}
