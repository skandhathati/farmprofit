import React, { useEffect, useState } from 'react';
import { 
  Sprout, TrendingUp, DollarSign, Scale, Sliders, ShieldCheck, 
  BarChart3, ArrowRight, Sparkles, Activity, Database, Cpu
} from 'lucide-react';
import { getDashboard, getHealth } from '../services/api';

export default function Home({ setActiveTab }) {
  const [stats, setStats] = useState(null);
  const [apiOnline, setApiOnline] = useState(null);

  useEffect(() => {
    // Check API health
    getHealth()
      .then(data => setApiOnline(data.ml_model_loaded))
      .catch(() => setApiOnline(false));

    // Load dashboard summary stats
    getDashboard()
      .then(data => setStats(data.summary))
      .catch(err => console.error('Error fetching stats:', err));
  }, []);

  const features = [
    {
      title: 'Understand Farming Costs',
      desc: 'Track seed, fertilizer, labor, transport, and ancillary expenses in detail.',
      icon: DollarSign,
      colorClass: 'text-emerald-400',
      bgClass: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30',
    },
    {
      title: 'Estimate Potential Revenue',
      desc: 'Calculate total yield and market earnings dynamically based on regional prices.',
      icon: TrendingUp,
      colorClass: 'text-blue-400',
      bgClass: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30',
    },
    {
      title: 'Predict Profit or Loss',
      desc: 'ML Gradient Boosting model trained on 1,000 verified farm records. R² = 0.958.',
      icon: Sparkles,
      colorClass: 'text-amber-400',
      bgClass: 'from-amber-500/20 to-orange-500/10 border-amber-500/30',
    },
    {
      title: 'Compare Different Crops',
      desc: 'Side-by-side analysis of yield, ROI, risk levels, and profit margins.',
      icon: Scale,
      colorClass: 'text-purple-400',
      bgClass: 'from-purple-500/20 to-pink-500/10 border-purple-500/30',
    },
    {
      title: 'Analyze Risk Levels',
      desc: 'Assess price sensitivity, margin cushions, and market volatility risks.',
      icon: ShieldCheck,
      colorClass: 'text-cyan-400',
      bgClass: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30',
    },
    {
      title: 'What-If Scenario Simulation',
      desc: 'Modify cost sliders, expected yields, and prices to see profit impact in real-time.',
      icon: Sliders,
      colorClass: 'text-rose-400',
      bgClass: 'from-rose-500/20 to-red-500/10 border-rose-500/30',
    },
  ];

  const steps = [
    { num: '1', title: 'Enter Farm Details', desc: 'Input crop type, land area, yield estimates, and costs.' },
    { num: '2', title: 'ML Prediction', desc: 'Gradient Boosting model predicts profit alongside exact financial calculations.' },
    { num: '3', title: 'Simulate Scenarios', desc: 'Use What-If sliders to stress-test yields and market prices.' },
    { num: '4', title: 'Optimize Crop Choice', desc: 'Compare crops to find the highest ROI and lowest risk option.' },
  ];

  return (
    <div className="space-y-24 py-6">

      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden pt-12 pb-20 rounded-3xl glass-panel border border-emerald-500/20 px-6 sm:px-12 text-center bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-emerald-950/20 glow-emerald">

        {/* Ambient glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">

          {/* API Status + Platform badge */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-Driven Agricultural Profitability Platform</span>
            </div>

            {apiOnline !== null && (
              <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
                apiOnline 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}>
                <span className={`w-2 h-2 rounded-full ${apiOnline ? 'bg-emerald-400 animate-pulse-slow' : 'bg-rose-400'}`} />
                <span>{apiOnline ? 'API & ML Model Online' : 'API Offline'}</span>
              </div>
            )}
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white leading-none">
            Farm<span className="text-gradient">Profit</span>
          </h1>

          <p className="text-xl sm:text-2xl font-bold text-slate-200 tracking-wide">
            Predict. Compare. Plan. Profit.
          </p>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            An intelligent farming profitability platform that helps farmers estimate costs, revenue, 
            profit, risk, and return — before making critical farming decisions.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setActiveTab('calculator')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-extrabold text-base shadow-xl shadow-emerald-900/40 transition-all transform hover:-translate-y-0.5 btn-glow-emerald flex items-center justify-center space-x-2"
            >
              <span>Calculate Profit</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl glass-card text-white hover:bg-slate-800/80 font-bold text-base border border-slate-700 transition-all flex items-center justify-center space-x-2"
            >
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <span>Explore Dashboard</span>
            </button>
          </div>

          {/* Live Dataset Stats */}
          {stats ? (
            <div className="mt-16 pt-12 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {[
                { label: 'Total Farm Records', value: stats.total_farms.toLocaleString(), icon: Database, color: 'text-white' },
                { label: 'Average Farm Profit', value: `₹${Math.round(stats.avg_profit).toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-400' },
                { label: 'Average Farm ROI', value: `${stats.avg_roi}%`, icon: Activity, color: 'text-emerald-400' },
                { label: 'Most Profitable Crop', value: stats.most_profitable_crop, icon: Sprout, color: 'text-amber-400' },
              ].map((s, i) => (
                <div key={i} className="glass-card p-4 rounded-2xl border border-slate-800/60 text-left">
                  <div className="flex items-center space-x-2 mb-2">
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                    <span className="text-[11px] font-medium text-slate-400">{s.label}</span>
                  </div>
                  <span className={`text-xl sm:text-2xl font-extrabold ${s.color}`}>{s.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-16 pt-12 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton h-20 rounded-2xl" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── Why FarmProfit Section ─── */}
      <section className="space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Platform Capabilities</span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Why FarmProfit?</h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            High yield does not guarantee high income. FarmProfit turns complex farm inputs into clear financial clarity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className={`glass-card p-6 rounded-2xl space-y-4 border bg-gradient-to-br ${f.bgClass} glow-border`}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.bgClass} flex items-center justify-center border`}>
                  <Icon className={`w-6 h-6 ${f.colorClass}`} />
                </div>
                <h3 className="text-lg font-bold text-white">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── ML Model Highlight ─── */}
      <section className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 space-y-6 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              Machine Learning Engine
            </span>
            <h2 className="text-2xl font-bold text-white">Powered by Gradient Boosting Regressor</h2>
            <p className="text-sm text-slate-400 max-w-lg">
              Trained on 1,000 verified agricultural records from across India. Model evaluation is empirical — no fabricated accuracy claims.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('model-performance')}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl glass-card text-sm font-bold text-white border border-slate-700 hover:bg-slate-800 transition-all whitespace-nowrap"
          >
            <span>View Model Metrics</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'R² Score', value: '0.958', sub: 'Gradient Boosting (Best)', color: 'text-emerald-400' },
            { label: 'MAE', value: '₹60,078', sub: 'Mean Absolute Error', color: 'text-blue-400' },
            { label: 'Classifier Accuracy', value: '95.0%', sub: 'Profit Status Prediction', color: 'text-amber-400' },
            { label: 'F1-Score', value: '0.9490', sub: 'Weighted Average', color: 'text-teal-400' },
          ].map((m, i) => (
            <div key={i} className="glass-card p-4 rounded-2xl border border-slate-800/60 text-center">
              <span className={`text-2xl font-extrabold ${m.color} block`}>{m.value}</span>
              <span className="text-xs font-bold text-white block mt-1">{m.label}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">{m.sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 4-Step Decision Flow ─── */}
      <section className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 space-y-8">
        <div className="max-w-3xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Smart Decision Flow</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">How Farmers Use FarmProfit</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={i} className="glass-card p-5 rounded-2xl space-y-3 relative">
              <span className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 font-extrabold flex items-center justify-center text-base border border-emerald-500/30">
                {s.num}
              </span>
              <h4 className="font-bold text-white text-sm">{s.title}</h4>
              <p className="text-xs text-slate-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
