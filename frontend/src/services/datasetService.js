import datasetRecords from './datasetData.json';

export function computeClientDashboard(filters = {}) {
  let df = [...datasetRecords];

  const filterMappings = [
    ['crop_type', 'Crop_Type'],
    ['location', 'Location'],
    ['season', 'Season'],
    ['soil_type', 'Soil_Type'],
    ['irrigation_type', 'Irrigation_Type'],
    ['risk_level', 'Risk_Level'],
    ['profit_status', 'Profit_Status']
  ];

  for (const [paramName, colName] of filterMappings) {
    const val = filters[paramName];
    if (val && String(val).trim() !== '') {
      const valStr = String(val).trim().toLowerCase();
      if (valStr !== 'all' && !valStr.startsWith('all ')) {
        df = df.filter(row => String(row[colName] || '').trim().toLowerCase() === valStr);
      }
    }
  }

  const total_farms = df.length;
  if (total_farms === 0) {
    return {
      summary: {
        total_farms: 0,
        avg_profit: 0,
        avg_roi: 0,
        avg_revenue: 0,
        avg_cost: 0,
        most_profitable_crop: 'N/A',
        lowest_risk_crop: 'N/A',
        profitable_records: 0
      },
      charts: {
        profit_by_crop: [],
        revenue_vs_cost: [],
        cost_breakdown: [],
        roi_by_crop: [],
        profit_margin_by_crop: [],
        risk_distribution: [],
        yield_vs_profit: [],
        price_vs_profit: []
      }
    };
  }

  const sumProfit = df.reduce((acc, r) => acc + (Number(r.Profit) || 0), 0);
  const sumRoi = df.reduce((acc, r) => acc + (Number(r.ROI) || 0), 0);
  const sumRev = df.reduce((acc, r) => acc + (Number(r.Revenue) || 0), 0);
  const sumCost = df.reduce((acc, r) => acc + (Number(r.Total_Cost) || 0), 0);
  const profitable_records = df.filter(r => (Number(r.Profit) || 0) > 0).length;

  const avg_profit = sumProfit / total_farms;
  const avg_roi = sumRoi / total_farms;
  const avg_revenue = sumRev / total_farms;
  const avg_cost = sumCost / total_farms;

  // Group by crop
  const cropMap = {};
  df.forEach(r => {
    const crop = r.Crop_Type || 'Unknown';
    if (!cropMap[crop]) {
      cropMap[crop] = {
        crop,
        count: 0,
        sumProfit: 0,
        sumRevenue: 0,
        sumCost: 0,
        sumMargin: 0,
        sumRoi: 0,
        lowRiskCount: 0
      };
    }
    const c = cropMap[crop];
    c.count += 1;
    c.sumProfit += Number(r.Profit) || 0;
    c.sumRevenue += Number(r.Revenue) || 0;
    c.sumCost += Number(r.Total_Cost) || 0;
    c.sumMargin += Number(r.Profit_Margin) || 0;
    c.sumRoi += Number(r.ROI) || 0;
    if (r.Risk_Level === 'Low') c.lowRiskCount += 1;
  });

  const cropStats = Object.values(cropMap).map(c => ({
    crop: c.crop,
    avg_profit: Math.round((c.sumProfit / c.count) * 100) / 100,
    avg_revenue: Math.round((c.sumRevenue / c.count) * 100) / 100,
    avg_cost: Math.round((c.sumCost / c.count) * 100) / 100,
    avg_margin: Math.round((c.sumMargin / c.count) * 100) / 100,
    avg_roi: Math.round((c.sumRoi / c.count) * 100) / 100,
    lowRiskPct: c.lowRiskCount / c.count
  }));

  const most_profitable_crop = cropStats.length > 0 
    ? [...cropStats].sort((a, b) => b.avg_profit - a.avg_profit)[0].crop 
    : 'N/A';

  const lowest_risk_crop = cropStats.length > 0 
    ? [...cropStats].sort((a, b) => b.lowRiskPct - a.lowRiskPct)[0].crop 
    : 'N/A';

  // Cost breakdown
  const cost_breakdown = [
    { name: 'Seed Cost', value: Math.round(df.reduce((acc, r) => acc + (Number(r.Seed_Cost) || 0), 0)) },
    { name: 'Fertilizer Cost', value: Math.round(df.reduce((acc, r) => acc + (Number(r.Fertilizer_Cost) || 0), 0)) },
    { name: 'Labor Cost', value: Math.round(df.reduce((acc, r) => acc + (Number(r.Labor_Cost) || 0), 0)) },
    { name: 'Transportation Cost', value: Math.round(df.reduce((acc, r) => acc + (Number(r.Transportation_Cost) || 0), 0)) },
    { name: 'Other Expenses', value: Math.round(df.reduce((acc, r) => acc + (Number(r.Other_Expenses) || 0), 0)) }
  ];

  // Risk distribution
  const riskCounts = { Low: 0, Medium: 0, High: 0 };
  df.forEach(r => {
    if (riskCounts[r.Risk_Level] !== undefined) riskCounts[r.Risk_Level] += 1;
    else riskCounts['Medium'] += 1;
  });
  const risk_distribution = Object.entries(riskCounts).map(([risk_level, count]) => ({ risk_level, count }));

  // Scatter samples
  const scatterSamples = df.slice(0, 150);
  const yield_vs_profit = scatterSamples.map(r => ({
    crop: r.Crop_Type,
    yield: Math.round((Number(r.Total_Expected_Yield) || 0) * 100) / 100,
    profit: Math.round((Number(r.Profit) || 0) * 100) / 100
  }));

  const price_vs_profit = scatterSamples.map(r => ({
    crop: r.Crop_Type,
    market_price: Math.round((Number(r.Market_Price) || 0) * 100) / 100,
    profit: Math.round((Number(r.Profit) || 0) * 100) / 100
  }));

  return {
    summary: {
      total_farms,
      avg_profit: Math.round(avg_profit),
      avg_roi: Math.round(avg_roi * 10) / 10,
      avg_revenue: Math.round(avg_revenue),
      avg_cost: Math.round(avg_cost),
      most_profitable_crop,
      lowest_risk_crop,
      profitable_records
    },
    charts: {
      profit_by_crop: cropStats.map(c => ({ crop: c.crop, avg_profit: c.avg_profit })),
      revenue_vs_cost: cropStats.map(c => ({ crop: c.crop, avg_revenue: c.avg_revenue, avg_cost: c.avg_cost })),
      cost_breakdown,
      roi_by_crop: cropStats.map(c => ({ crop: c.crop, avg_roi: c.avg_roi })),
      profit_margin_by_crop: cropStats.map(c => ({ crop: c.crop, avg_margin: c.avg_margin })),
      risk_distribution,
      yield_vs_profit,
      price_vs_profit
    }
  };
}
