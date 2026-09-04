import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sliders, TrendingUp, TrendingDown, ArrowRight, RotateCcw, 
  Sparkles, DollarSign, CheckCircle2, AlertTriangle, BarChart3,
  Percent, ArrowUpRight, ArrowDownRight, Zap
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { runWhatIf } from '../services/api';

function calculateScenarioFinancials(data) {
  const seed = Number(data.seed_cost || 0);
  const fert = Number(data.fertilizer_cost || 0);
  const labor = Number(data.labor_cost || 0);
  const transport = Number(data.transportation_cost || 0);
  const other = Number(data.other_expenses || 0);
  const total_cost = seed + fert + labor + transport + other;

  const total_yield = Number(data.total_expected_yield || (data.land_area_acres * data.expected_yield_per_acre) || 0);
  const market_price = Number(data.market_price || 0);

  const yUnit = String(data.yield_unit || '').toLowerCase();
  const pUnit = String(data.price_unit || '').toLowerCase();
  
  let revenue = 0;
  if ((yUnit.includes('kg') || yUnit.includes('kilogram')) && pUnit.includes('quintal')) {
    revenue = (total_yield / 100.0) * market_price;
  } else if (yUnit.includes('quintal') && (pUnit.includes('kg') || pUnit.includes('kilogram'))) {
    revenue = (total_yield * 100.0) * market_price;
  } else {
    revenue = total_yield * market_price;
  }

  const profit = revenue - total_cost;
  const profit_margin = revenue > 0 ? (profit / revenue) * 100 : 0;
  const roi = total_cost > 0 ? (profit / total_cost) * 100 : 0;
  const break_even_price = total_yield > 0 ? (total_cost / total_yield) : 0;
  const break_even_yield = market_price > 0 ? (total_cost / market_price) : 0;

  let profit_status = "Profit";
  if (profit > 0) {
    profit_status = profit_margin >= 40 ? "High Profit" : profit_margin >= 20 ? "Moderate Profit" : "Profit";
  } else if (profit < 0) {
    profit_status = "Loss";
  } else {
    profit_status = "Break-even";
  }

  let risk_level = "Medium";
  if (profit <= 0 || profit_margin < 20) risk_level = "High";
  else if (profit_margin >= 45) risk_level = "Low";

  return {
    total_cost: Math.round(total_cost * 100) / 100,
    total_yield: Math.round(total_yield * 100) / 100,
    revenue: Math.round(revenue * 100) / 100,
    profit: Math.round(profit * 100) / 100,
    profit_margin: Math.round(profit_margin * 10) / 10,
    roi: Math.round(roi * 10) / 10,
    break_even_price: Math.round(break_even_price * 100) / 100,
    break_even_yield: Math.round(break_even_yield * 100) / 100,
    profit_status,
    risk_level
  };
}

export default function WhatIfAnalysis({ initialData }) {
  const defaultCurrent = useMemo(() => initialData || {
    crop_type: 'Rice',
    location: 'Madhya Pradesh',
    season: 'Kharif',
    land_area_acres: 5.0,
    soil_type: 'Black Soil',
    irrigation_type: 'Drip',
    expected_yield_per_acre: 25.1,
    total_expected_yield: 125.5,
    yield_unit: 'Quintal',
    seed_cost: 10550.0,
    fertilizer_cost: 43140.0,
    labor_cost: 65340.0,
    transportation_cost: 17870.0,
    other_expenses: 18730.0,
    market_price: 2250.0,
    price_unit: 'INR_per_Quintal'
  }, [initialData]);

  const [current, setCurrent] = useState(defaultCurrent);
  const [modified, setModified] = useState(defaultCurrent);

  // Sync state if initialData changes
  useEffect(() => {
    if (initialData) {
      setCurrent(initialData);
      setModified(initialData);
    }
  }, [initialData]);

  // Real-time instantaneous calculations
  const currCalc = useMemo(() => calculateScenarioFinancials(current), [current]);
  const modCalc = useMemo(() => calculateScenarioFinancials(modified), [modified]);

  const delta = useMemo(() => ({
    total_cost: Math.round((modCalc.total_cost - currCalc.total_cost) * 100) / 100,
    revenue: Math.round((modCalc.revenue - currCalc.revenue) * 100) / 100,
    profit: Math.round((modCalc.profit - currCalc.profit) * 100) / 100,
    profit_margin: Math.round((modCalc.profit_margin - currCalc.profit_margin) * 10) / 10,
    roi: Math.round((modCalc.roi - currCalc.roi) * 10) / 10,
    break_even_price: Math.round((modCalc.break_even_price - currCalc.break_even_price) * 100) / 100,
    break_even_yield: Math.round((modCalc.break_even_yield - currCalc.break_even_yield) * 100) / 100
  }), [currCalc, modCalc]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const val = value === '' ? 0 : parseFloat(value) || 0;
    setModified(prev => {
      const next = { ...prev, [name]: val };
      if (name === 'expected_yield_per_acre' || name === 'land_area_acres') {
        next.total_expected_yield = parseFloat(((next.land_area_acres || 5.0) * (next.expected_yield_per_acre || 0)).toFixed(2));
      }
      return next;
    });
  };

  const applyPresetScenario = (type) => {
    setModified(prev => {
      const next = { ...prev };
      if (type === 'yield_plus_10') {
        next.total_expected_yield = Math.round(Number(prev.total_expected_yield || 100) * 1.1 * 100) / 100;
      } else if (type === 'price_minus_10') {
        next.market_price = Math.round(Number(prev.market_price || 1000) * 0.9 * 100) / 100;
      } else if (type === 'price_plus_15') {
        next.market_price = Math.round(Number(prev.market_price || 1000) * 1.15 * 100) / 100;
      } else if (type === 'fert_minus_15') {
        next.fertilizer_cost = Math.round(Number(prev.fertilizer_cost || 10000) * 0.85);
      } else if (type === 'labor_plus_20') {
        next.labor_cost = Math.round(Number(prev.labor_cost || 10000) * 1.20);
      }
      return next;
    });
  };

  const resetModified = () => {
    setModified(current);
  };

  const chartData = [
    { metric: 'Total Cost (₹)', Current: currCalc.total_cost, Modified: modCalc.total_cost },
    { metric: 'Revenue (₹)', Current: currCalc.revenue, Modified: modCalc.revenue },
    { metric: 'Net Profit (₹)', Current: currCalc.profit, Modified: modCalc.profit },
  ];

  // Dynamic slider limits
  const maxYield = Math.max(500, Math.round(Number(current.total_expected_yield || 150) * 3));
  const maxPrice = Math.max(15000, Math.round(Number(current.market_price || 2000) * 3));
  const maxSeed = Math.max(100000, Math.round(Number(current.seed_cost || 15000) * 3));
  const maxFert = Math.max(150000, Math.round(Number(current.fertilizer_cost || 40000) * 3));
  const maxLabor = Math.max(200000, Math.round(Number(current.labor_cost || 60000) * 3));
  const maxTransport = Math.max(80000, Math.round(Number(current.transportation_cost || 15000) * 3));
  const maxOther = Math.max(80000, Math.round(Number(current.other_expenses || 15000) * 3));

  return (
    <div className="space-y-8 py-6">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400">
              <Sliders className="w-7 h-7" />
            </div>
            <span>What-If Scenario Simulation Analysis</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Adjust sliders or type exact numerical values to simulate profit sensitivity, break-even shifts, and financial deltas in real-time.
          </p>
        </div>

        <button
          onClick={resetModified}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl glass-card text-xs font-bold text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-800 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
          <span>Reset to Baseline</span>
        </button>
      </div>

      {/* Quick Stress-Test Scenarios */}
      <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-slate-800 space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>One-Click Simulation Stress-Tests</span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => applyPresetScenario('yield_plus_10')}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+10% Yield Harvest Surge</span>
          </button>
          <button
            onClick={() => applyPresetScenario('price_minus_10')}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>-10% Market Price Drop</span>
          </button>
          <button
            onClick={() => applyPresetScenario('price_plus_15')}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+15% Market Price Rally</span>
          </button>
          <button
            onClick={() => applyPresetScenario('fert_minus_15')}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-amber-950/60 text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>-15% Fertilizer Expense Saved</span>
          </button>
          <button
            onClick={() => applyPresetScenario('labor_plus_20')}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+20% Labor Inflation Surge</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Sliders & Numeric Input Controls (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-400" />
              <span>Modified Scenario Parameters</span>
            </h2>
            <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              {modified.crop_type} ({modified.land_area_acres} Acres)
            </span>
          </div>

          {/* Field 1: Total Expected Yield */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-300">Total Yield ({modified.yield_unit})</span>
              <input
                type="number"
                name="total_expected_yield"
                step="any"
                min="0"
                value={modified.total_expected_yield || ''}
                onChange={handleInputChange}
                className="w-28 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-right text-xs text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
            <input
              type="range"
              name="total_expected_yield"
              min="1"
              max={maxYield}
              step="1"
              value={modified.total_expected_yield || 0}
              onChange={handleInputChange}
              className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* Field 2: Market Price */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-300">Market Price (₹)</span>
              <input
                type="number"
                name="market_price"
                step="any"
                min="0"
                value={modified.market_price || ''}
                onChange={handleInputChange}
                className="w-28 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-right text-xs text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
            <input
              type="range"
              name="market_price"
              min="100"
              max={maxPrice}
              step="10"
              value={modified.market_price || 0}
              onChange={handleInputChange}
              className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* Field 3: Seed Cost */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-300">Seed Cost (₹)</span>
              <input
                type="number"
                name="seed_cost"
                step="any"
                min="0"
                value={modified.seed_cost || ''}
                onChange={handleInputChange}
                className="w-28 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-right text-xs text-amber-400 font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
            <input
              type="range"
              name="seed_cost"
              min="0"
              max={maxSeed}
              step="250"
              value={modified.seed_cost || 0}
              onChange={handleInputChange}
              className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* Field 4: Fertilizer Cost */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-300">Fertilizer Cost (₹)</span>
              <input
                type="number"
                name="fertilizer_cost"
                step="any"
                min="0"
                value={modified.fertilizer_cost || ''}
                onChange={handleInputChange}
                className="w-28 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-right text-xs text-amber-400 font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
            <input
              type="range"
              name="fertilizer_cost"
              min="0"
              max={maxFert}
              step="500"
              value={modified.fertilizer_cost || 0}
              onChange={handleInputChange}
              className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* Field 5: Labor Cost */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-300">Labor Cost (₹)</span>
              <input
                type="number"
                name="labor_cost"
                step="any"
                min="0"
                value={modified.labor_cost || ''}
                onChange={handleInputChange}
                className="w-28 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-right text-xs text-amber-400 font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
            <input
              type="range"
              name="labor_cost"
              min="0"
              max={maxLabor}
              step="500"
              value={modified.labor_cost || 0}
              onChange={handleInputChange}
              className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* Field 6: Transportation Cost */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-300">Transportation Cost (₹)</span>
              <input
                type="number"
                name="transportation_cost"
                step="any"
                min="0"
                value={modified.transportation_cost || ''}
                onChange={handleInputChange}
                className="w-28 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-right text-xs text-amber-400 font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
            <input
              type="range"
              name="transportation_cost"
              min="0"
              max={maxTransport}
              step="500"
              value={modified.transportation_cost || 0}
              onChange={handleInputChange}
              className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* Field 7: Other Expenses */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-300">Other Expenses (₹)</span>
              <input
                type="number"
                name="other_expenses"
                step="any"
                min="0"
                value={modified.other_expenses || ''}
                onChange={handleInputChange}
                className="w-28 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-right text-xs text-amber-400 font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
            <input
              type="range"
              name="other_expenses"
              min="0"
              max={maxOther}
              step="500"
              value={modified.other_expenses || 0}
              onChange={handleInputChange}
              className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

        </div>

        {/* Right Column: Comparative Results & Delta Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Delta Highlight Banner */}
          <div className={`p-6 rounded-3xl border flex items-center justify-between shadow-xl transition-all ${
            delta.profit >= 0
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}>
            <div className="flex items-center space-x-4">
              <div className={`p-3.5 rounded-2xl ${delta.profit >= 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                {delta.profit >= 0 ? <TrendingUp className="w-8 h-8" /> : <TrendingDown className="w-8 h-8" />}
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider font-extrabold opacity-80 block">Net Profit Impact</span>
                <span className="text-3xl font-black text-white tracking-tight">
                  {delta.profit >= 0 ? `+₹${Math.round(delta.profit).toLocaleString()}` : `-₹${Math.abs(Math.round(delta.profit)).toLocaleString()}`}
                </span>
                <span className="text-xs block mt-1">
                  {delta.profit >= 0 
                    ? 'Scenario adjustments increase net profit over baseline.' 
                    : 'Scenario adjustments decrease net profit compared to baseline.'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block mb-1">New Profit Margin</span>
              <span className="text-2xl font-black text-white">{modCalc.profit_margin}%</span>
              <span className={`text-xs block font-bold mt-0.5 ${delta.profit_margin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {delta.profit_margin >= 0 ? `+${delta.profit_margin}%` : `${delta.profit_margin}%`}
              </span>
            </div>
          </div>

          {/* Detailed Side-by-Side Comparison Table */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <span>Side-by-Side Financial Comparison</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                    <th className="pb-3">Financial Metric</th>
                    <th className="pb-3">Baseline</th>
                    <th className="pb-3">Modified</th>
                    <th className="pb-3">Net Difference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-sm">
                  
                  <tr>
                    <td className="py-3 font-sans font-medium text-slate-300">Total Farming Cost</td>
                    <td className="py-3 text-slate-300">₹{Math.round(currCalc.total_cost).toLocaleString()}</td>
                    <td className="py-3 text-white font-bold">₹{Math.round(modCalc.total_cost).toLocaleString()}</td>
                    <td className={`py-3 font-bold ${delta.total_cost <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {delta.total_cost > 0 ? `+₹${Math.round(delta.total_cost).toLocaleString()}` : `₹${Math.round(delta.total_cost).toLocaleString()}`}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 font-sans font-medium text-slate-300">Expected Revenue</td>
                    <td className="py-3 text-slate-300">₹{Math.round(currCalc.revenue).toLocaleString()}</td>
                    <td className="py-3 text-white font-bold">₹{Math.round(modCalc.revenue).toLocaleString()}</td>
                    <td className={`py-3 font-bold ${delta.revenue >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {delta.revenue > 0 ? `+₹${Math.round(delta.revenue).toLocaleString()}` : `₹${Math.round(delta.revenue).toLocaleString()}`}
                    </td>
                  </tr>

                  <tr className="bg-slate-800/40">
                    <td className="py-3 font-sans font-bold text-white">Calculated Net Profit</td>
                    <td className="py-3 font-bold text-slate-200">₹{Math.round(currCalc.profit).toLocaleString()}</td>
                    <td className="py-3 font-bold text-emerald-400">₹{Math.round(modCalc.profit).toLocaleString()}</td>
                    <td className={`py-3 font-extrabold ${delta.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {delta.profit > 0 ? `+₹${Math.round(delta.profit).toLocaleString()}` : `₹${Math.round(delta.profit).toLocaleString()}`}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 font-sans font-medium text-slate-300">Profit Margin (%)</td>
                    <td className="py-3 text-slate-300">{currCalc.profit_margin}%</td>
                    <td className="py-3 text-white font-bold">{modCalc.profit_margin}%</td>
                    <td className={`py-3 font-bold ${delta.profit_margin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {delta.profit_margin > 0 ? `+${delta.profit_margin}%` : `${delta.profit_margin}%`}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 font-sans font-medium text-slate-300">Return on Investment (ROI)</td>
                    <td className="py-3 text-slate-300">{currCalc.roi}%</td>
                    <td className="py-3 text-white font-bold">{modCalc.roi}%</td>
                    <td className={`py-3 font-bold ${delta.roi >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {delta.roi > 0 ? `+${delta.roi}%` : `${delta.roi}%`}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 font-sans font-medium text-slate-300">Break-Even Price</td>
                    <td className="py-3 text-slate-300">₹{Math.round(currCalc.break_even_price).toLocaleString()}</td>
                    <td className="py-3 text-amber-400 font-bold">₹{Math.round(modCalc.break_even_price).toLocaleString()}</td>
                    <td className="py-3 text-slate-400">₹{delta.break_even_price}</td>
                  </tr>

                  <tr>
                    <td className="py-3 font-sans font-medium text-slate-300">Break-Even Yield</td>
                    <td className="py-3 text-slate-300">{Math.round(currCalc.break_even_yield).toLocaleString()}</td>
                    <td className="py-3 text-teal-400 font-bold">{Math.round(modCalc.break_even_yield).toLocaleString()}</td>
                    <td className="py-3 text-slate-400">{delta.break_even_yield}</td>
                  </tr>

                  <tr>
                    <td className="py-3 font-sans font-medium text-slate-300">Profit Status</td>
                    <td className="py-3 text-slate-300">{currCalc.profit_status}</td>
                    <td className="py-3 font-bold text-white">{modCalc.profit_status}</td>
                    <td className="py-3 text-slate-400">{modCalc.risk_level} Risk</td>
                  </tr>

                </tbody>
              </table>
            </div>
          </div>

          {/* Bar Chart Comparison */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <span>Scenario Financial Comparison Chart</span>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="metric" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    formatter={v => [`₹${Math.round(Number(v)).toLocaleString()}`, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                  <Bar dataKey="Current" name="Baseline" fill="#64748b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Modified" name="Modified Scenario" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
