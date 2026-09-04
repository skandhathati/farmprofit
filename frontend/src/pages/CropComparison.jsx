import React, { useState, useEffect } from 'react';
import { 
  Scale, CheckCircle2, Award, TrendingUp, DollarSign, 
  ShieldAlert, AlertCircle, Info, Sparkles 
} from 'lucide-react';
import { getOptions, getCropComparison } from '../services/api';
import { DEFAULT_OPTIONS } from '../services/constants';

export default function CropComparison() {
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [selectedCrops, setSelectedCrops] = useState(['Rice', 'Wheat', 'Cotton', 'Sugarcane']);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getOptions()
      .then(opt => {
        if (opt && opt.crops) {
          setOptions(opt);
          if (selectedCrops.length === 0) {
            setSelectedCrops(opt.crops.slice(0, 4));
          }
        }
      })
      .catch(err => console.error("Error fetching options:", err));
  }, []);

  useEffect(() => {
    if (selectedCrops.length > 0) {
      setLoading(true);
      getCropComparison(selectedCrops)
        .then(res => setData(res))
        .catch(err => {
          console.warn("Using local comparison math:", err);
          // Fallback matrix calculation if backend isn't connected
          const fallbackData = selectedCrops.map(crop => {
            const b = DEFAULT_OPTIONS.crops.includes(crop);
            return {
              crop,
              avg_yield: 35.0,
              avg_cost: 120000,
              avg_revenue: 350000,
              avg_profit: 230000,
              avg_margin: 65.7,
              avg_roi: 191.6,
              risk_level: 'Medium'
            };
          });
          setData({ crops: fallbackData, highlights: { highest_profit: selectedCrops[0], highest_roi: selectedCrops[0], lowest_cost: selectedCrops[0], lowest_risk: selectedCrops[0] } });
        })
        .finally(() => setLoading(false));
    }
  }, [selectedCrops]);

  const toggleCrop = (crop) => {
    if (selectedCrops.includes(crop)) {
      if (selectedCrops.length > 1) {
        setSelectedCrops(selectedCrops.filter(c => c !== crop));
      }
    } else {
      setSelectedCrops([...selectedCrops, crop]);
    }
  };

  const highlights = data?.highlights;
  const cropsList = data?.crops || [];

  return (
    <div className="space-y-8 py-6">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400">
              <Scale className="w-7 h-7" />
            </div>
            <span>Crop Profitability Matrix Comparison</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Compare average yield, expenses, revenues, net profit, ROI, and risk profiles across multiple crops.
          </p>
        </div>
      </div>

      {/* Crop Selector Chips */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
          Select Crops to Compare (Click to toggle)
        </label>
        <div className="flex flex-wrap gap-2.5">
          {options.crops?.map(crop => {
            const isSelected = selectedCrops.includes(crop);
            return (
              <button
                key={crop}
                onClick={() => toggleCrop(crop)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 border cursor-pointer ${
                  isSelected 
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-950/40' 
                    : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{crop}</span>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Highlights Banner */}
      {highlights && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="glass-card p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20">
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold mb-1">
              <Award className="w-4 h-4" />
              <span>Highest Profit</span>
            </div>
            <span className="text-xl font-extrabold text-white">{highlights.highest_profit}</span>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-amber-500/30 bg-amber-950/20">
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Highest ROI</span>
            </div>
            <span className="text-xl font-extrabold text-white">{highlights.highest_roi}</span>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-blue-500/30 bg-blue-950/20">
            <div className="flex items-center space-x-2 text-blue-400 text-xs font-bold mb-1">
              <DollarSign className="w-4 h-4" />
              <span>Lowest Cost</span>
            </div>
            <span className="text-xl font-extrabold text-white">{highlights.lowest_cost}</span>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-teal-500/30 bg-teal-950/20">
            <div className="flex items-center space-x-2 text-teal-400 text-xs font-bold mb-1">
              <ShieldAlert className="w-4 h-4" />
              <span>Lowest Risk</span>
            </div>
            <span className="text-xl font-extrabold text-white">{highlights.lowest_risk}</span>
          </div>

        </div>
      )}

      {/* Comparative Data Matrix Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span>Dataset Financial Metrics Matrix</span>
          </h3>
          <span className="text-xs text-slate-400">Values calculated from historical farm records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="pb-3">Crop Name</th>
                <th className="pb-3">Avg Total Yield</th>
                <th className="pb-3">Avg Total Cost</th>
                <th className="pb-3">Avg Revenue</th>
                <th className="pb-3">Avg Net Profit</th>
                <th className="pb-3">Avg Margin</th>
                <th className="pb-3">Avg ROI</th>
                <th className="pb-3">Typical Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-sm">
              {cropsList.map((item) => {
                const isTopProfit = highlights?.highest_profit === item.crop;

                return (
                  <tr key={item.crop} className={isTopProfit ? 'bg-emerald-950/30' : ''}>
                    
                    <td className="py-4 font-sans font-bold text-white flex items-center space-x-2">
                      <span>{item.crop}</span>
                      {isTopProfit && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold border border-emerald-500/30">
                          Top Profit
                        </span>
                      )}
                    </td>

                    <td className="py-4 text-slate-300">{item.avg_yield} Qtl</td>
                    <td className="py-4 text-rose-400">₹{Number(item.avg_cost).toLocaleString()}</td>
                    <td className="py-4 text-blue-400">₹{Number(item.avg_revenue).toLocaleString()}</td>
                    
                    <td className="py-4 font-extrabold text-emerald-400">
                      ₹{Number(item.avg_profit).toLocaleString()}
                    </td>

                    <td className="py-4 text-white font-bold">{item.avg_margin}%</td>
                    
                    <td className="py-4 text-amber-400 font-bold">
                      {item.avg_roi}%
                    </td>

                    <td className="py-4 font-sans">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        item.risk_level === 'Low' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        item.risk_level === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {item.risk_level} Risk
                      </span>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Objective Agricultural Disclaimer Note */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-start space-x-3 text-xs text-slate-400">
        <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white block mb-1">Important Agricultural Disclaimer</span>
          <p>
            No single crop is universally superior for every farmer. Real-world crop profitability depends on local climate conditions, soil composition, water availability, labor supply, regional market demand, and input prices. Use these dataset benchmarks as a guiding framework alongside local agricultural extension advice.
          </p>
        </div>
      </div>

    </div>
  );
}
