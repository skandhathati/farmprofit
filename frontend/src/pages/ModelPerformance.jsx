import React, { useState, useEffect } from 'react';
import { 
  Cpu, Database, Target, Award, CheckCircle2, BarChart3, 
  Sparkles, Layers, ShieldCheck, Activity 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getModelMetrics } from '../services/api';

export default function ModelPerformance() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    getModelMetrics()
      .then(data => setMetrics(data))
      .catch(err => console.error("Error fetching model metrics:", err));
  }, []);

  if (!metrics) {
    return (
      <div className="py-20 text-center text-slate-400 space-y-3">
        <Cpu className="w-10 h-10 text-emerald-400 animate-spin mx-auto" />
        <p className="text-sm">Loading ML Model Metrics & Evaluation Data...</p>
      </div>
    );
  }

  const regMetrics = metrics.regression_metrics;
  const clfMetrics = metrics.classification_metrics;
  const bestReg = metrics.best_regression_model;
  const bestClf = metrics.best_classification_model;
  const featureImportances = metrics.feature_importances || [];

  // Format reg metrics for table comparison
  const regTable = Object.keys(regMetrics).map(modelName => ({
    name: modelName,
    mae: `₹${regMetrics[modelName].mae.toLocaleString(undefined, {maximumFractionDigits: 2})}`,
    rmse: `₹${regMetrics[modelName].rmse.toLocaleString(undefined, {maximumFractionDigits: 2})}`,
    r2: regMetrics[modelName].r2.toFixed(4),
    isBest: modelName === bestReg
  }));

  // Format clf metrics for table comparison
  const clfTable = Object.keys(clfMetrics).map(modelName => ({
    name: modelName,
    accuracy: `${(clfMetrics[modelName].accuracy * 100).toFixed(2)}%`,
    precision: `${(clfMetrics[modelName].precision * 100).toFixed(2)}%`,
    recall: `${(clfMetrics[modelName].recall * 100).toFixed(2)}%`,
    f1_score: `${(clfMetrics[modelName].f1_score * 100).toFixed(2)}%`,
    isBest: modelName === bestClf
  }));

  return (
    <div className="space-y-8 py-6">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400">
              <Cpu className="w-7 h-7" />
            </div>
            <span>Machine Learning Model Performance & Metrics</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Empirical validation results derived from training Gradient Boosting and Random Forest algorithms on 1,000 farming records.
          </p>
        </div>
      </div>

      {/* Dataset & Target Specification Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-bold mb-1">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Dataset Records</span>
          </div>
          <span className="text-2xl font-extrabold text-white">{metrics.dataset_size} Rows</span>
          <span className="text-[11px] text-slate-400 block mt-1">Train: {metrics.train_size} | Test: {metrics.test_size}</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-bold mb-1">
            <Target className="w-4 h-4 text-emerald-400" />
            <span>Regression Target</span>
          </div>
          <span className="text-2xl font-extrabold text-emerald-400">Profit (₹)</span>
          <span className="text-[11px] text-slate-400 block mt-1">Continuous net earnings</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-bold mb-1">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Best Regressor</span>
          </div>
          <span className="text-lg font-extrabold text-white">{bestReg}</span>
          <span className="text-[11px] text-emerald-400 font-bold block mt-1">
            R² Score: {regMetrics[bestReg]?.r2.toFixed(4)}
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-bold mb-1">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Best Classifier</span>
          </div>
          <span className="text-lg font-extrabold text-white">{bestClf}</span>
          <span className="text-[11px] text-teal-400 font-bold block mt-1">
            Accuracy: {(clfMetrics[bestClf]?.accuracy * 100).toFixed(1)}%
          </span>
        </div>

      </div>

      {/* Regression Model Evaluation Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span>1. Regression Models Evaluation (Target: Profit)</span>
          </h2>
          <span className="text-xs text-slate-400">Evaluated on 20% hold-out test set</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="pb-3">Model Architecture</th>
                <th className="pb-3">MAE (Mean Absolute Error)</th>
                <th className="pb-3">RMSE (Root Mean Sq Error)</th>
                <th className="pb-3">R² Score (Coeff. of Determination)</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-sm">
              {regTable.map(row => (
                <tr key={row.name} className={row.isBest ? 'bg-emerald-950/30' : ''}>
                  <td className="py-4 font-sans font-bold text-white flex items-center space-x-2">
                    <span>{row.name}</span>
                    {row.isBest && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold border border-emerald-500/30">
                        Selected Best
                      </span>
                    )}
                  </td>
                  <td className="py-4 text-slate-300">{row.mae}</td>
                  <td className="py-4 text-slate-300">{row.rmse}</td>
                  <td className="py-4 font-bold text-emerald-400">{row.r2}</td>
                  <td className="py-4 font-sans text-xs">
                    {row.isBest ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Production Model
                      </span>
                    ) : (
                      <span className="text-slate-400">Evaluated Benchmark</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Classification Model Evaluation Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-400" />
            <span>2. Classification Models Evaluation (Target: Profit Status)</span>
          </h2>
          <span className="text-xs text-slate-400">Multi-class classification validation</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="pb-3">Model Architecture</th>
                <th className="pb-3">Accuracy</th>
                <th className="pb-3">Precision (Weighted)</th>
                <th className="pb-3">Recall (Weighted)</th>
                <th className="pb-3">F1-Score (Weighted)</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-sm">
              {clfTable.map(row => (
                <tr key={row.name} className={row.isBest ? 'bg-teal-950/30' : ''}>
                  <td className="py-4 font-sans font-bold text-white flex items-center space-x-2">
                    <span>{row.name}</span>
                    {row.isBest && (
                      <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-400 text-[10px] font-extrabold border border-teal-500/30">
                        Selected Best
                      </span>
                    )}
                  </td>
                  <td className="py-4 font-bold text-emerald-400">{row.accuracy}</td>
                  <td className="py-4 text-slate-300">{row.precision}</td>
                  <td className="py-4 text-slate-300">{row.recall}</td>
                  <td className="py-4 font-bold text-teal-400">{row.f1_score}</td>
                  <td className="py-4 font-sans text-xs">
                    {row.isBest ? (
                      <span className="text-teal-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Production Classifier
                      </span>
                    ) : (
                      <span className="text-slate-400">Evaluated Benchmark</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Importance Chart */}
      {featureImportances.length > 0 && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Input Feature Importance Ranking</span>
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureImportances} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis type="category" dataKey="feature" stroke="#94a3b8" fontSize={11} width={120} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={v => [(v * 100).toFixed(2) + '%', 'Importance Weight']}
                />
                <Bar dataKey="importance" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

    </div>
  );
}
