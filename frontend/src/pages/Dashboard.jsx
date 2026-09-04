import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3, Filter, RotateCcw, Sprout, DollarSign, TrendingUp,
  Shield, Activity, AlertCircle, Loader2, BarChart2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ScatterChart, Scatter, Legend, CartesianGrid
} from 'recharts';
import { getOptions, getDashboard } from '../services/api';
import { DEFAULT_OPTIONS } from '../services/constants';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#14b8a6'];
const RISK_COLORS = { Low: '#22c55e', Medium: '#f59e0b', High: '#ef4444' };

const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '12px',
    color: '#f8fafc',
    fontSize: '12px',
  },
  itemStyle: { color: '#94a3b8' },
};

function LoadingState() {
  return (
    <div className="py-20 text-center space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-white">Loading Dashboard...</h3>
        <p className="text-xs text-slate-400">Fetching farm statistics and visual chart analytics</p>
      </div>
      <div className="max-w-4xl mx-auto space-y-6 pt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="skeleton h-20 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton h-80 rounded-3xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyChartFallback({ message = "No data available for this chart" }) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center text-slate-500 space-y-2 py-12 border border-dashed border-slate-800 rounded-2xl bg-slate-950/30">
      <BarChart2 className="w-8 h-8 text-slate-600" />
      <span className="text-xs font-medium">{message}</span>
    </div>
  );
}

function ChartCard({ title, icon: Icon, iconColor, hasData = true, children }) {
  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <span>{title}</span>
      </h3>
      <div className="h-72">
        {hasData ? children : <EmptyChartFallback />}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  const [filters, setFilters] = useState({
    crop_type: '',
    location: '',
    season: '',
    soil_type: '',
    irrigation_type: '',
    risk_level: '',
    profit_status: '',
  });

  useEffect(() => {
    getOptions()
      .then(opt => setOptions(opt ?? {}))
      .catch(err => console.error('Error fetching options:', err));
  }, []);

  const fetchDashboard = useCallback(() => {
    setLoading(true);
    setError(null);
    getDashboard(filters)
      .then(data => {
        setDashboardData(data ?? {});
      })
      .catch(err => {
        console.error('Dashboard fetch error:', err);
        setError('Unable to load dashboard data. Please verify backend server status.');
      })
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleFilterChange = e => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      crop_type: '', location: '', season: '',
      soil_type: '', irrigation_type: '', risk_level: '', profit_status: '',
    });
  };

  const summary = dashboardData?.summary;
  const charts = dashboardData?.charts;

  const filterFields = [
    { key: 'crop_type', label: 'Crop', optKey: 'crops', all: 'All Crops' },
    { key: 'location', label: 'Location', optKey: 'locations', all: 'All Locations' },
    { key: 'season', label: 'Season', optKey: 'seasons', all: 'All Seasons' },
    { key: 'soil_type', label: 'Soil Type', optKey: 'soil_types', all: 'All Soil Types' },
    { key: 'irrigation_type', label: 'Irrigation', optKey: 'irrigation_types', all: 'All Irrigation' },
    { key: 'risk_level', label: 'Risk Level', optKey: 'risk_levels', all: 'All Risk' },
    { key: 'profit_status', label: 'Profit Status', optKey: 'profit_statuses', all: 'All Statuses' },
  ];

  const summaryCards = [
    { label: 'Total Farms', value: summary?.total_farms?.toLocaleString() ?? '0', color: 'text-white' },
    { label: 'Avg Profit', value: summary?.avg_profit != null ? `₹${Math.round(summary.avg_profit).toLocaleString()}` : '₹0', color: 'text-emerald-400' },
    { label: 'Avg ROI', value: summary?.avg_roi != null ? `${summary.avg_roi}%` : '0%', color: 'text-emerald-400' },
    { label: 'Avg Revenue', value: summary?.avg_revenue != null ? `₹${Math.round(summary.avg_revenue).toLocaleString()}` : '₹0', color: 'text-blue-400' },
    { label: 'Avg Cost', value: summary?.avg_cost != null ? `₹${Math.round(summary.avg_cost).toLocaleString()}` : '₹0', color: 'text-rose-400' },
    { label: 'Top Profitable Crop', value: summary?.most_profitable_crop ?? 'N/A', color: 'text-amber-400' },
    { label: 'Lowest Risk Crop', value: summary?.lowest_risk_crop ?? 'N/A', color: 'text-teal-400' },
    { label: 'Profitable Records', value: summary?.profitable_records?.toLocaleString() ?? '0', color: 'text-emerald-400' },
  ];

  const hasProfitByCrop = Array.isArray(charts?.profit_by_crop) && charts.profit_by_crop.length > 0;
  const hasRevVsCost = Array.isArray(charts?.revenue_vs_cost) && charts.revenue_vs_cost.length > 0;
  const hasCostBreakdown = Array.isArray(charts?.cost_breakdown) && charts.cost_breakdown.length > 0;
  const hasRoiByCrop = Array.isArray(charts?.roi_by_crop) && charts.roi_by_crop.length > 0;
  const hasMarginByCrop = Array.isArray(charts?.profit_margin_by_crop) && charts.profit_margin_by_crop.length > 0;
  const hasRiskDist = Array.isArray(charts?.risk_distribution) && charts.risk_distribution.length > 0;
  const hasYieldVsProfit = Array.isArray(charts?.yield_vs_profit) && charts.yield_vs_profit.length > 0;
  const hasPriceVsProfit = Array.isArray(charts?.price_vs_profit) && charts.price_vs_profit.length > 0;

  return (
    <div className="space-y-8 py-6">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400">
              <BarChart3 className="w-7 h-7" />
            </div>
            Agricultural Analytics Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Explore 1,000 dataset records with dynamic multi-dimensional filters and 8 interactive charts.
          </p>
        </div>
        <button
          onClick={resetFilters}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl glass-card text-xs font-semibold text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-800 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
          <span>Reset All Filters</span>
        </button>
      </div>

      {/* ── Filter Toolbar ── */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-emerald-400" />
          <span>Dashboard Filters</span>
          {loading && <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin ml-2" />}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {filterFields.map(f => (
            <div key={f.key}>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">{f.label}</label>
              <select
                name={f.key}
                value={filters[f.key]}
                onChange={handleFilterChange}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="">{f.all}</option>
                {options?.[f.optKey]?.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* ── Error State ── */}
      {error && (
        <div className="p-6 rounded-3xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-sm space-y-3 glass-panel">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-rose-400 flex-shrink-0" />
            <div>
              <span className="font-bold block text-base text-white">Unable to load dashboard data</span>
              <span className="text-xs text-rose-300/80">{error}</span>
            </div>
          </div>
          <button
            onClick={fetchDashboard}
            className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold hover:bg-rose-500/30 transition-all flex items-center space-x-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry Loading Dashboard</span>
          </button>
        </div>
      )}

      {/* ── Loading State ── */}
      {loading && !dashboardData && <LoadingState />}

      {/* ── Summary Cards ── */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {summaryCards.map((card, i) => (
            <div key={i} className="glass-card p-4 rounded-2xl border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 block mb-1">{card.label}</span>
              <span className={`text-xl font-extrabold ${card.color}`}>{card.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── 8 Interactive Charts ── */}
      {!loading && charts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* 1: Profit by Crop */}
          <ChartCard title="Chart 1 — Average Profit by Crop (₹)" icon={BarChart3} iconColor="text-emerald-400" hasData={hasProfitByCrop}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.profit_by_crop} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="crop" stroke="#475569" fontSize={11} tick={{ fill: '#94a3b8' }} />
                <YAxis stroke="#475569" fontSize={11} tick={{ fill: '#94a3b8' }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip {...TOOLTIP_STYLE} formatter={v => [`₹${Number(v).toLocaleString()}`, 'Avg Profit']} />
                <Bar dataKey="avg_profit" fill="#22c55e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 2: Revenue vs Cost */}
          <ChartCard title="Chart 2 — Revenue vs Total Cost by Crop (₹)" icon={TrendingUp} iconColor="text-blue-400" hasData={hasRevVsCost}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.revenue_vs_cost} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="crop" stroke="#475569" fontSize={11} tick={{ fill: '#94a3b8' }} />
                <YAxis stroke="#475569" fontSize={11} tick={{ fill: '#94a3b8' }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip {...TOOLTIP_STYLE} formatter={v => `₹${Number(v).toLocaleString()}`} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                <Bar dataKey="avg_revenue" name="Avg Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avg_cost" name="Avg Cost" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 3: Cost Breakdown Donut */}
          <ChartCard title="Chart 3 — Aggregate Cost Breakdown" icon={DollarSign} iconColor="text-amber-400" hasData={hasCostBreakdown}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.cost_breakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                >
                  {charts.cost_breakdown?.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...TOOLTIP_STYLE} formatter={v => [`₹${Number(v).toLocaleString()}`, 'Total']} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 4: ROI by Crop */}
          <ChartCard title="Chart 4 — Average ROI by Crop (%)" icon={Activity} iconColor="text-emerald-400" hasData={hasRoiByCrop}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.roi_by_crop} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="crop" stroke="#475569" fontSize={11} tick={{ fill: '#94a3b8' }} />
                <YAxis stroke="#475569" fontSize={11} tick={{ fill: '#94a3b8' }} unit="%" />
                <Tooltip {...TOOLTIP_STYLE} formatter={v => [`${v}%`, 'Avg ROI']} />
                <Bar dataKey="avg_roi" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 5: Profit Margin by Crop */}
          <ChartCard title="Chart 5 — Average Profit Margin by Crop (%)" icon={DollarSign} iconColor="text-purple-400" hasData={hasMarginByCrop}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.profit_margin_by_crop} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="crop" stroke="#475569" fontSize={11} tick={{ fill: '#94a3b8' }} />
                <YAxis stroke="#475569" fontSize={11} tick={{ fill: '#94a3b8' }} unit="%" />
                <Tooltip {...TOOLTIP_STYLE} formatter={v => [`${v}%`, 'Avg Margin']} />
                <Bar dataKey="avg_margin" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 6: Risk Distribution Pie */}
          <ChartCard title="Chart 6 — Risk Level Distribution" icon={Shield} iconColor="text-rose-400" hasData={hasRiskDist}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.risk_distribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="count"
                  nameKey="risk_level"
                  label={({ risk_level, percent }) => (risk_level ? `${risk_level} ${((percent || 0) * 100).toFixed(0)}%` : '')}
                  labelLine={false}
                >
                  {charts.risk_distribution?.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={RISK_COLORS[entry?.risk_level] || COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip {...TOOLTIP_STYLE} formatter={(v, name, props) => [v, props?.payload?.risk_level ?? name]} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} formatter={(value, entry) => entry?.payload?.risk_level ?? value} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 7: Yield vs Profit Scatter */}
          <ChartCard title="Chart 7 — Total Expected Yield vs Net Profit" icon={Sprout} iconColor="text-teal-400" hasData={hasYieldVsProfit}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="yield"
                  name="Yield (Qtl)"
                  stroke="#475569"
                  fontSize={11}
                  tick={{ fill: '#94a3b8' }}
                  label={{ value: 'Yield (Quintals)', position: 'insideBottom', offset: -2, fill: '#64748b', fontSize: 10 }}
                />
                <YAxis
                  dataKey="profit"
                  name="Profit (₹)"
                  stroke="#475569"
                  fontSize={11}
                  tick={{ fill: '#94a3b8' }}
                  tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  {...TOOLTIP_STYLE}
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (!payload?.length) return null;
                    const d = payload[0]?.payload;
                    if (!d) return null;
                    return (
                      <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs space-y-1">
                        <p className="text-emerald-400 font-bold">{d.crop ?? 'Farm'}</p>
                        <p className="text-slate-300">Yield: {d.yield ?? 0} Qtl</p>
                        <p className="text-slate-300">Profit: ₹{Number(d.profit ?? 0).toLocaleString()}</p>
                      </div>
                    );
                  }}
                />
                <Scatter name="Farms" data={charts.yield_vs_profit} fill="#06b6d4" opacity={0.75} />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 8: Market Price vs Profit Scatter */}
          <ChartCard title="Chart 8 — Market Price vs Net Profit" icon={DollarSign} iconColor="text-emerald-400" hasData={hasPriceVsProfit}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="market_price"
                  name="Market Price (₹)"
                  stroke="#475569"
                  fontSize={11}
                  tick={{ fill: '#94a3b8' }}
                  label={{ value: 'Market Price (₹/Qtl)', position: 'insideBottom', offset: -2, fill: '#64748b', fontSize: 10 }}
                />
                <YAxis
                  dataKey="profit"
                  name="Profit (₹)"
                  stroke="#475569"
                  fontSize={11}
                  tick={{ fill: '#94a3b8' }}
                  tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  {...TOOLTIP_STYLE}
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (!payload?.length) return null;
                    const d = payload[0]?.payload;
                    if (!d) return null;
                    return (
                      <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs space-y-1">
                        <p className="text-emerald-400 font-bold">{d.crop ?? 'Farm'}</p>
                        <p className="text-slate-300">Price: ₹{Number(d.market_price ?? 0).toLocaleString()}/Qtl</p>
                        <p className="text-slate-300">Profit: ₹{Number(d.profit ?? 0).toLocaleString()}</p>
                      </div>
                    );
                  }}
                />
                <Scatter name="Farms" data={charts.price_vs_profit} fill="#10b981" opacity={0.75} />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartCard>

        </div>
      )}

      {/* ── Empty State when filtered results return 0 rows ── */}
      {!loading && summary?.total_farms === 0 && (
        <div className="py-16 text-center glass-panel rounded-3xl border border-slate-800 space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No matching records found.</h3>
            <p className="text-slate-400 text-xs font-medium">Try changing your filters or click Reset Filters.</p>
          </div>
          <button
            onClick={resetFilters}
            className="px-5 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-500/30 transition-all inline-flex items-center space-x-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      )}

    </div>
  );
}
