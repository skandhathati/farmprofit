import React from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, PieChart, ShieldAlert, 
  CheckCircle2, AlertTriangle, Scale, Lightbulb, ArrowRight, X, Cpu, Calculator
} from 'lucide-react';

export default function PredictionResultModal({ result, onClose, onOpenWhatIf }) {
  if (!result) return null;

  const { calculated, ml_prediction, recommendations } = result;
  const isProfitable = calculated.profit > 0;
  const isLoss = calculated.profit < 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl glass-panel bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-2xl ${isProfitable ? 'bg-emerald-500/20 text-emerald-400' : isLoss ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
              {isProfitable ? <TrendingUp className="w-6 h-6" /> : isLoss ? <TrendingDown className="w-6 h-6" /> : <Scale className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Profitability Analysis Result</h2>
              <p className="text-xs text-slate-400">Direct Financial Calculations & Machine Learning Prediction</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Profit Status Alert Banner */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between ${
          isProfitable 
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
            : isLoss
            ? 'bg-rose-950/40 border-rose-500/30 text-rose-300'
            : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
        }`}>
          <div className="flex items-center space-x-3">
            {isProfitable ? <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" /> : <AlertTriangle className="w-6 h-6 text-rose-400 flex-shrink-0" />}
            <div>
              <span className="font-bold text-base block">
                {isProfitable ? "Positive Profitability Estimated!" : isLoss ? "Potential Financial Loss Warning!" : "Financial Break-Even Point"}
              </span>
              <span className="text-xs opacity-90">
                {isProfitable 
                  ? `Your projected revenue (₹${calculated.revenue.toLocaleString()}) exceeds total cost (₹${calculated.total_cost.toLocaleString()}) by ₹${calculated.profit.toLocaleString()} (${calculated.profit_margin}% margin).`
                  : isLoss
                  ? `Your projected expenses (₹${calculated.total_cost.toLocaleString()}) exceed revenue (₹${calculated.revenue.toLocaleString()}) by ₹${Math.abs(calculated.profit).toLocaleString()}.`
                  : `Your projected revenue matches total farming cost exactly.`
                }
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider ${
              calculated.profit_status.includes('Profit') ? 'bg-emerald-500 text-slate-950' :
              calculated.profit_status === 'Loss' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-slate-950'
            }`}>
              {calculated.profit_status}
            </span>
          </div>
        </div>

        {/* Primary Financial Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Expected Revenue */}
          <div className="glass-card p-4 rounded-2xl border border-slate-800">
            <span className="text-xs font-medium text-slate-400 block mb-1">Expected Revenue</span>
            <span className="text-xl font-extrabold text-emerald-400">₹{calculated.revenue.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500 block mt-1">Yield × Market Price</span>
          </div>

          {/* Total Cost */}
          <div className="glass-card p-4 rounded-2xl border border-slate-800">
            <span className="text-xs font-medium text-slate-400 block mb-1">Total Farming Cost</span>
            <span className="text-xl font-extrabold text-rose-400">₹{calculated.total_cost.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500 block mt-1">Sum of 5 expense inputs</span>
          </div>

          {/* Calculated Net Profit */}
          <div className="glass-card p-4 rounded-2xl border border-slate-800 bg-slate-800/40">
            <div className="flex items-center space-x-1 mb-1">
              <Calculator className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-semibold text-white block">Calculated Profit</span>
            </div>
            <span className={`text-xl font-extrabold ${isProfitable ? 'text-emerald-400' : isLoss ? 'text-rose-400' : 'text-amber-400'}`}>
              ₹{calculated.profit.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">Revenue − Total Cost</span>
          </div>

          {/* ML Predicted Profit (Separated & Labeled) */}
          <div className="glass-card p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20">
            <div className="flex items-center space-x-1 mb-1">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-semibold text-amber-400 block">ML Predicted Profit</span>
            </div>
            <span className="text-xl font-extrabold text-white">
              ₹{ml_prediction.predicted_profit.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-400 block mt-1">{ml_prediction.model_name} Estimate</span>
          </div>

          {/* ROI */}
          <div className="glass-card p-4 rounded-2xl border border-slate-800">
            <span className="text-xs font-medium text-slate-400 block mb-1">Return on Investment (ROI)</span>
            <span className={`text-xl font-extrabold ${calculated.roi > 0 ? 'text-emerald-400' : calculated.roi < 0 ? 'text-rose-400' : 'text-amber-400'}`}>
              {calculated.roi}%
            </span>
            <span className="text-[10px] text-slate-500 block mt-1">(Profit / Total Cost) × 100</span>
          </div>

          {/* Profit Margin */}
          <div className="glass-card p-4 rounded-2xl border border-slate-800">
            <span className="text-xs font-medium text-slate-400 block mb-1">Profit Margin</span>
            <span className="text-lg font-bold text-white">{calculated.profit_margin}%</span>
            <span className="text-[10px] text-slate-500 block mt-1">(Profit / Revenue) × 100</span>
          </div>

          {/* Break-even Price */}
          <div className="glass-card p-4 rounded-2xl border border-slate-800">
            <span className="text-xs font-medium text-slate-400 block mb-1">Break-Even Price</span>
            <span className="text-lg font-bold text-amber-400">₹{calculated.break_even_price.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500 block mt-1">Total Cost / Yield</span>
          </div>

          {/* Break-even Yield */}
          <div className="glass-card p-4 rounded-2xl border border-slate-800">
            <span className="text-xs font-medium text-slate-400 block mb-1">Break-Even Yield</span>
            <span className="text-lg font-bold text-teal-400">{calculated.break_even_yield.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500 block mt-1">Total Cost / Market Price</span>
          </div>

        </div>

        {/* Dataset Recommendation System Section */}
        {recommendations && recommendations.length > 0 && (
          <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 bg-slate-900/60 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <span>Financial & Agricultural Recommendations</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {recommendations.map((rec, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-semibold"
          >
            Modify Inputs
          </button>
          
          <button
            onClick={() => {
              onClose();
              if (onOpenWhatIf) onOpenWhatIf();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-bold text-sm flex items-center justify-center space-x-2"
          >
            <span>Run What-If Scenario</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
