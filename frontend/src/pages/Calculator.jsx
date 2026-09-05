
import React, { useState, useEffect } from 'react';
import { 
  Calculator, Sprout, MapPin, Sun, Layers, Droplets, 
  DollarSign, TrendingUp, AlertCircle, Sparkles, CheckCircle2, 
  ChevronDown, Wand2
} from 'lucide-react';
import { getOptions, predictProfit } from '../services/api';
import { DEFAULT_OPTIONS, CROP_BENCHMARKS } from '../services/constants';
import PredictionResultModal from '../components/PredictionResultModal';

// Reusable SelectWithCustom component with proper dropdown arrow and custom typing support
function SelectWithCustom({ label, name, value, options: optionsList, onChange, placeholder, required, icon: Icon }) {
  const safeOptions = (optionsList && optionsList.length > 0) ? optionsList : (DEFAULT_OPTIONS[name] || []);
  const isCustom = safeOptions.length > 0 && !safeOptions.includes(value) && value !== '';
  const [showCustom, setShowCustom] = useState(isCustom);

  // Sync showCustom if value changes externally
  useEffect(() => {
    if (safeOptions.length > 0) {
      setShowCustom(!safeOptions.includes(value) && value !== '');
    }
  }, [value, safeOptions]);

  const handleSelectChange = (e) => {
    const selected = e.target.value;
    if (selected === '__custom__') {
      setShowCustom(true);
      onChange({ target: { name, value: '' } });
    } else {
      setShowCustom(false);
      onChange({ target: { name, value: selected } });
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="flex items-center justify-between text-xs font-semibold text-slate-300">
        <span className="flex items-center gap-1.5">
          {Icon && <Icon className="w-3.5 h-3.5 text-emerald-400" />}
          <span>{label} {required && <span className="text-rose-400">*</span>}</span>
        </span>
        <span className="text-[10px] text-slate-500 font-normal">Select or Custom</span>
      </label>

      <div className="relative">
        <select
          name={showCustom ? undefined : name}
          value={showCustom ? '__custom__' : value}
          onChange={handleSelectChange}
          className="w-full bg-slate-800/90 border border-slate-700 hover:border-slate-600 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 cursor-pointer pr-10"
        >
          <option value="" disabled>— Select {label} —</option>
          {safeOptions.map(opt => (
            <option key={opt} value={opt} className="bg-slate-900 text-white py-1">
              {opt}
            </option>
          ))}
          <option value="__custom__" className="bg-slate-900 text-emerald-400 font-medium">
            ✏️ Other (Type Custom...)
          </option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {showCustom && (
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder || `Type custom ${label.toLowerCase()}...`}
          className="w-full mt-1.5 bg-slate-900 border border-emerald-500/60 rounded-xl px-3.5 py-2 text-sm text-emerald-300 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 placeholder-slate-500"
          required={required}
          autoFocus
        />
      )}
    </div>
  );
}

export default function CalculatorPage({ setActiveTab, setWhatIfData }) {
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
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
  });

  useEffect(() => {
    getOptions()
      .then(opt => {
        if (opt && Object.keys(opt).length > 0) {
          setOptions(prev => ({
            crops: opt.crops?.length ? opt.crops : prev.crops,
            locations: opt.locations?.length ? opt.locations : prev.locations,
            seasons: opt.seasons?.length ? opt.seasons : prev.seasons,
            soil_types: opt.soil_types?.length ? opt.soil_types : prev.soil_types,
            irrigation_types: opt.irrigation_types?.length ? opt.irrigation_types : prev.irrigation_types,
            risk_levels: opt.risk_levels?.length ? opt.risk_levels : prev.risk_levels,
            profit_statuses: opt.profit_statuses?.length ? opt.profit_statuses : prev.profit_statuses,
            yield_units: prev.yield_units,
            price_units: prev.price_units
          }));
        }
      })
      .catch(err => {
        console.warn("Using built-in dataset options:", err);
      });
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Quick crop preset loader
  const applyCropPreset = (cropName) => {
    const benchmark = CROP_BENCHMARKS[cropName];
    if (benchmark) {
      setFormData(prev => {
        const acres = prev.land_area_acres || 5.0;
        const yieldPerAcre = benchmark.expected_yield_per_acre;
        const totalYield = parseFloat((acres * yieldPerAcre).toFixed(2));
        return {
          ...prev,
          crop_type: cropName,
          expected_yield_per_acre: yieldPerAcre,
          total_expected_yield: totalYield,
          seed_cost: benchmark.seed_cost,
          fertilizer_cost: benchmark.fertilizer_cost,
          labor_cost: benchmark.labor_cost,
          transportation_cost: benchmark.transportation_cost,
          other_expenses: benchmark.other_expenses,
          market_price: benchmark.market_price,
          soil_type: benchmark.soil_type || prev.soil_type,
          irrigation_type: benchmark.irrigation_type || prev.irrigation_type,
          season: benchmark.season || prev.season
        };
      });
      showToast(`Applied average dataset benchmark values for ${cropName}!`);
    } else {
      setFormData(prev => ({ ...prev, crop_type: cropName }));
    }
  };

  // Update form fields and automatically compute yield & previews
  const handleChange = (e) => {
    const { name, value } = e.target;
    const numFields = [
      'land_area_acres', 'expected_yield_per_acre', 'total_expected_yield',
      'seed_cost', 'fertilizer_cost', 'labor_cost', 'transportation_cost',
      'other_expenses', 'market_price'
    ];
    
    let parsedValue = value;
    if (numFields.includes(name)) {
      if (value === '') {
        parsedValue = 0;
      } else {
        const val = parseFloat(value);
        parsedValue = isNaN(val) ? 0 : val;
      }
    }

    setFormData(prev => {
      const nextState = { ...prev, [name]: parsedValue };
      
      // Auto-recalculate total yield when land area or yield per acre changes
      if (name === 'land_area_acres' || name === 'expected_yield_per_acre') {
        const acres = name === 'land_area_acres' ? parsedValue : prev.land_area_acres;
        const yieldPerAcre = name === 'expected_yield_per_acre' ? parsedValue : prev.expected_yield_per_acre;
        nextState.total_expected_yield = parseFloat((acres * yieldPerAcre).toFixed(2));
      }
      return nextState;
    });
  };

  const handleCalculateOnly = (e) => {
    if (e) e.preventDefault();
    setError(null);

    // Validation
    if (formData.land_area_acres <= 0) {
      setError("Please enter a valid positive land area (greater than 0 acres).");
      return;
    }
    if (formData.expected_yield_per_acre < 0 || formData.total_expected_yield < 0) {
      setError("Please enter a valid non-negative expected yield.");
      return;
    }
    if (formData.market_price < 0) {
      setError("Please enter a valid non-negative market price.");
      return;
    }
    if (formData.seed_cost < 0 || formData.fertilizer_cost < 0 || formData.labor_cost < 0 || formData.transportation_cost < 0 || formData.other_expenses < 0) {
      setError("Cost expenses cannot be negative.");
      return;
    }

    const seed = Number(formData.seed_cost || 0);
    const fert = Number(formData.fertilizer_cost || 0);
    const labor = Number(formData.labor_cost || 0);
    const transport = Number(formData.transportation_cost || 0);
    const other = Number(formData.other_expenses || 0);
    const total_cost = seed + fert + labor + transport + other;
    const total_yield = Number(formData.total_expected_yield || (formData.land_area_acres * formData.expected_yield_per_acre) || 0);
    const market_price = Number(formData.market_price || 0);
    
    let revenue = total_yield * market_price;
    const yUnit = String(formData.yield_unit || '').toLowerCase();
    const pUnit = String(formData.price_unit || '').toLowerCase();
    if ((yUnit.includes('kg') || yUnit.includes('kilogram')) && pUnit.includes('quintal')) {
      revenue = (total_yield / 100.0) * market_price;
    } else if (yUnit.includes('quintal') && (pUnit.includes('kg') || pUnit.includes('kilogram'))) {
      revenue = (total_yield * 100.0) * market_price;
    }
    
    const profit = revenue - total_cost;
    const profit_margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    const roi = total_cost > 0 ? (profit / total_cost) * 100 : 0;
    const break_even_price = total_yield > 0 ? total_cost / total_yield : 0;
    const break_even_yield = market_price > 0 ? total_cost / market_price : 0;
    
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

    const calcResult = {
      inputs: formData,
      calculated: {
        total_expected_yield: roundNum(total_yield),
        total_cost: roundNum(total_cost),
        revenue: roundNum(revenue),
        profit: roundNum(profit),
        profit_margin: roundNum(profit_margin),
        roi: roundNum(roi),
        break_even_price: roundNum(break_even_price),
        break_even_yield: roundNum(break_even_yield),
        profit_status,
        risk_level
      },
      ml_prediction: {
        predicted_profit: roundNum(profit),
        predicted_status: profit_status,
        risk_level: risk_level,
        model_name: "Financial Calculation Model",
        r2_score: 1.0
      },
      recommendations: [
        profit > 0 
          ? `Calculated positive net profit of ₹${roundNum(profit).toLocaleString()} (${roundNum(profit_margin)}% margin).`
          : `Calculated net loss of ₹${Math.abs(roundNum(profit)).toLocaleString()}. Consider optimizing largest expenses or improving yield.`,
        `Break-even selling price is ₹${roundNum(break_even_price).toLocaleString()} per ${formData.yield_unit}.`,
        `Break-even yield threshold is ${roundNum(break_even_yield).toLocaleString()} ${formData.yield_unit}.`
      ]
    };
    setResult(calcResult);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (formData.land_area_acres <= 0) {
      setError("Please enter a valid positive land area (greater than 0 acres).");
      return;
    }
    if (formData.expected_yield_per_acre < 0 || formData.total_expected_yield < 0) {
      setError("Please enter a valid non-negative expected yield.");
      return;
    }
    if (formData.market_price < 0) {
      setError("Please enter a valid non-negative market price.");
      return;
    }
    if (formData.seed_cost < 0 || formData.fertilizer_cost < 0 || formData.labor_cost < 0 || formData.transportation_cost < 0 || formData.other_expenses < 0) {
      setError("Cost expenses cannot be negative.");
      return;
    }

    setLoading(true);

    try {
      const res = await predictProfit(formData);
      setResult(res);
    } catch (err) {
      console.warn("Backend prediction API unreachable or error:", err);
      // Generate instant calculation fallback
      handleCalculateOnly();
      setError("Prediction service is currently unavailable. Displaying financial calculations.");
    } finally {
      setLoading(false);
    }
  };

  const roundNum = (v) => Math.round(Number(v || 0) * 100) / 100;

  // Live Calculations Preview
  const seed = Number(formData.seed_cost || 0);
  const fert = Number(formData.fertilizer_cost || 0);
  const labor = Number(formData.labor_cost || 0);
  const transport = Number(formData.transportation_cost || 0);
  const other = Number(formData.other_expenses || 0);
  const liveCost = seed + fert + labor + transport + other;

  const liveYield = Number(formData.total_expected_yield || (formData.land_area_acres * formData.expected_yield_per_acre) || 0);
  const mktPrice = Number(formData.market_price || 0);

  const yUnit = String(formData.yield_unit || '').toLowerCase();
  const pUnit = String(formData.price_unit || '').toLowerCase();
  let liveRevenue = 0;
  if ((yUnit.includes('kg') || yUnit.includes('kilogram')) && pUnit.includes('quintal')) {
    liveRevenue = (liveYield / 100.0) * mktPrice;
  } else if (yUnit.includes('quintal') && (pUnit.includes('kg') || pUnit.includes('kilogram'))) {
    liveRevenue = (liveYield * 100.0) * mktPrice;
  } else {
    liveRevenue = liveYield * mktPrice;
  }

  const liveProfit = liveRevenue - liveCost;

  return (
    <div className="space-y-8 py-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-500 text-slate-950 px-4 py-2.5 rounded-2xl shadow-xl font-bold text-xs flex items-center space-x-2 border border-emerald-300">
          <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400">
              <Calculator className="w-7 h-7" />
            </div>
            <span>Farm Profitability Calculator & Predictor</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Choose from all 10 dataset crops, locations, seasons, soil types, and irrigation methods or enter custom values.
          </p>
        </div>

        {/* Live Automatic Financial Preview */}
        <div className="glass-card px-5 py-3 rounded-2xl border border-slate-800 flex items-center space-x-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Est. Revenue</span>
            <span className="text-emerald-400 font-extrabold text-sm">₹{Math.round(liveRevenue).toLocaleString()}</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Expenses</span>
            <span className="text-rose-400 font-extrabold text-sm">₹{Math.round(liveCost).toLocaleString()}</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Live Net Profit</span>
            <span className={`font-extrabold text-sm ${liveProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ₹{Math.round(liveProfit).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Crop Selector Bar */}
      <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <Wand2 className="w-4 h-4 text-emerald-400" />
            <span>Quick Crop Selector (Click to load dataset averages)</span>
          </div>
          <span className="text-[11px] text-slate-500">10 Crops in Dataset</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {options.crops?.map(crop => (
            <button
              key={crop}
              type="button"
              onClick={() => applyCropPreset(crop)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                formData.crop_type === crop
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-md shadow-emerald-950/40'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-800'
              }`}
            >
              {crop}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-sm flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Basic Farm Information */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sprout className="w-5 h-5 text-emerald-400" />
              <span>1. Farm Basic Information</span>
            </h2>
            <span className="text-xs text-slate-400">Select any option from the full list or type custom</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Crop Type */}
            <SelectWithCustom
              label="Crop Type"
              name="crop_type"
              value={formData.crop_type}
              options={options.crops}
              onChange={handleChange}
              placeholder="e.g. Dragon Fruit, Saffron"
              icon={Sprout}
              required
            />

            {/* Location */}
            <SelectWithCustom
              label="Location / State"
              name="location"
              value={formData.location}
              options={options.locations}
              onChange={handleChange}
              placeholder="e.g. Kerala, Bihar"
              icon={MapPin}
              required
            />

            {/* Season */}
            <SelectWithCustom
              label="Season"
              name="season"
              value={formData.season}
              options={options.seasons}
              onChange={handleChange}
              placeholder="e.g. Summer, Monsoon"
              icon={Sun}
              required
            />

            {/* Land Area */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Land Area (Acres) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                name="land_area_acres"
                step="any"
                min="0.01"
                value={formData.land_area_acres || ''}
                onChange={handleChange}
                placeholder="e.g. 5.0"
                className="w-full bg-slate-800/90 border border-slate-700 hover:border-slate-600 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
                required
              />
            </div>

            {/* Soil Type */}
            <SelectWithCustom
              label="Soil Type"
              name="soil_type"
              value={formData.soil_type}
              options={options.soil_types}
              onChange={handleChange}
              placeholder="e.g. Laterite, Sandy Loam"
              icon={Layers}
              required
            />

            {/* Irrigation Type */}
            <SelectWithCustom
              label="Irrigation Type"
              name="irrigation_type"
              value={formData.irrigation_type}
              options={options.irrigation_types}
              onChange={handleChange}
              placeholder="e.g. Flood, Center Pivot"
              icon={Droplets}
              required
            />

          </div>
        </div>

        {/* Section 2: Production Information */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>2. Crop Production & Expected Yield</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Expected Yield per Acre <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                name="expected_yield_per_acre"
                step="any"
                min="0"
                value={formData.expected_yield_per_acre || ''}
                onChange={handleChange}
                placeholder="e.g. 25.0"
                className="w-full bg-slate-800/90 border border-slate-700 hover:border-slate-600 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>Total Expected Yield <span className="text-rose-400">*</span></span>
                <span className="text-[10px] text-emerald-400 font-normal">Acres × Yield/Acre</span>
              </label>
              <input
                type="number"
                name="total_expected_yield"
                step="any"
                min="0"
                value={formData.total_expected_yield || ''}
                onChange={handleChange}
                placeholder="e.g. 125.0"
                className="w-full bg-slate-800/90 border border-slate-700 hover:border-slate-600 rounded-xl px-3.5 py-2.5 text-sm text-emerald-400 font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Yield Unit</label>
              <div className="relative">
                <select
                  name="yield_unit"
                  value={formData.yield_unit}
                  onChange={handleChange}
                  className="w-full bg-slate-800/90 border border-slate-700 hover:border-slate-600 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 cursor-pointer pr-10"
                >
                  <option value="Quintal">Quintal</option>
                  <option value="kg">kg (Kilogram)</option>
                  <option value="Ton">Ton</option>
                  <option value="Bags">Bags</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Cost Breakdown */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-rose-400" />
              <h2 className="text-lg font-bold text-white">3. Cost Breakdown (₹)</h2>
            </div>
            <span className="text-xs font-extrabold text-rose-400">Total Expenses: ₹{liveCost.toLocaleString()}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Seed Cost (₹) *</label>
              <input
                type="number"
                name="seed_cost"
                min="0"
                step="any"
                value={formData.seed_cost || ''}
                onChange={handleChange}
                placeholder="e.g. 10000"
                className="w-full bg-slate-800/90 border border-slate-700 hover:border-slate-600 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Fertilizer Cost (₹) *</label>
              <input
                type="number"
                name="fertilizer_cost"
                min="0"
                step="any"
                value={formData.fertilizer_cost || ''}
                onChange={handleChange}
                placeholder="e.g. 40000"
                className="w-full bg-slate-800/90 border border-slate-700 hover:border-slate-600 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Labor Cost (₹) *</label>
              <input
                type="number"
                name="labor_cost"
                min="0"
                step="any"
                value={formData.labor_cost || ''}
                onChange={handleChange}
                placeholder="e.g. 60000"
                className="w-full bg-slate-800/90 border border-slate-700 hover:border-slate-600 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Transportation (₹) *</label>
              <input
                type="number"
                name="transportation_cost"
                min="0"
                step="any"
                value={formData.transportation_cost || ''}
                onChange={handleChange}
                placeholder="e.g. 15000"
                className="w-full bg-slate-800/90 border border-slate-700 hover:border-slate-600 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Other Expenses (₹) *</label>
              <input
                type="number"
                name="other_expenses"
                min="0"
                step="any"
                value={formData.other_expenses || ''}
                onChange={handleChange}
                placeholder="e.g. 15000"
                className="w-full bg-slate-800/90 border border-slate-700 hover:border-slate-600 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 4: Market Price Information */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span>4. Market Price Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Market Price (₹) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                name="market_price"
                min="0"
                step="any"
                value={formData.market_price || ''}
                onChange={handleChange}
                placeholder="e.g. 2250"
                className="w-full bg-slate-800/90 border border-slate-700 hover:border-slate-600 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Price Unit</label>
              <div className="relative">
                <select
                  name="price_unit"
                  value={formData.price_unit}
                  onChange={handleChange}
                  className="w-full bg-slate-800/90 border border-slate-700 hover:border-slate-600 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer pr-10"
                >
                  <option value="INR_per_Quintal">INR_per_Quintal (₹/Qtl)</option>
                  <option value="INR_per_kg">INR_per_kg (₹/kg)</option>
                  <option value="INR_per_Ton">INR_per_Ton (₹/Ton)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-2">
          <button
            type="button"
            onClick={handleCalculateOnly}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-card border border-emerald-500/40 text-emerald-300 font-extrabold text-base hover:bg-emerald-500/10 transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Calculator className="w-5 h-5 text-emerald-400" />
            <span>Calculate Profit</span>
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-extrabold text-base shadow-xl shadow-emerald-950/50 transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-3 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>Predicting Profitability...</span>
            ) : (
              <>
                <Sparkles className="w-5 h-5 stroke-[2.5]" />
                <span>Predict Profit (ML)</span>
              </>
            )}
          </button>
        </div>

      </form>

      {/* Result Modal */}
      {result && (
        <PredictionResultModal
          result={result}
          onClose={() => setResult(null)}
          onOpenWhatIf={() => {
            if (setWhatIfData) setWhatIfData(formData);
            setActiveTab('what-if');
          }}
        />
      )}

    </div>
  );
}
