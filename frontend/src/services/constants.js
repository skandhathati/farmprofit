export const DEFAULT_OPTIONS = {
  crops: [
    'Chilli',
    'Cotton',
    'Groundnut',
    'Maize',
    'Onion',
    'Potato',
    'Rice',
    'Sugarcane',
    'Tomato',
    'Wheat'
  ],
  locations: [
    'Andhra Pradesh',
    'Karnataka',
    'Madhya Pradesh',
    'Maharashtra',
    'Punjab',
    'Tamil Nadu',
    'Telangana',
    'Uttar Pradesh'
  ],
  seasons: [
    'Kharif',
    'Rabi',
    'Zaid'
  ],
  soil_types: [
    'Alluvial',
    'Black Soil',
    'Clay',
    'Loamy',
    'Red Soil',
    'Sandy'
  ],
  irrigation_types: [
    'Borewell',
    'Canal',
    'Drip',
    'Rainfed',
    'Sprinkler'
  ],
  risk_levels: [
    'Low',
    'Medium',
    'High'
  ],
  profit_statuses: [
    'High Profit',
    'Moderate Profit',
    'Profit',
    'Loss',
    'Break-even'
  ],
  yield_units: [
    'Quintal',
    'kg',
    'Ton',
    'Bags'
  ],
  price_units: [
    'INR_per_Quintal',
    'INR_per_kg',
    'INR_per_Ton'
  ]
};

export const CROP_BENCHMARKS = {
  'Rice': {
    expected_yield_per_acre: 25.1,
    seed_cost: 10550,
    fertilizer_cost: 43140,
    labor_cost: 65340,
    transportation_cost: 17870,
    other_expenses: 18730,
    market_price: 2250,
    soil_type: 'Black Soil',
    irrigation_type: 'Drip',
    season: 'Kharif'
  },
  'Wheat': {
    expected_yield_per_acre: 21.4,
    seed_cost: 9800,
    fertilizer_cost: 43040,
    labor_cost: 52490,
    transportation_cost: 17390,
    other_expenses: 17310,
    market_price: 2315,
    soil_type: 'Alluvial',
    irrigation_type: 'Sprinkler',
    season: 'Rabi'
  },
  'Cotton': {
    expected_yield_per_acre: 12.8,
    seed_cost: 16120,
    fertilizer_cost: 52390,
    labor_cost: 75650,
    transportation_cost: 19490,
    other_expenses: 19960,
    market_price: 6890,
    soil_type: 'Black Soil',
    irrigation_type: 'Drip',
    season: 'Kharif'
  },
  'Sugarcane': {
    expected_yield_per_acre: 70.2,
    seed_cost: 26600,
    fertilizer_cost: 62000,
    labor_cost: 71560,
    transportation_cost: 42310,
    other_expenses: 24880,
    market_price: 3260,
    soil_type: 'Loamy',
    irrigation_type: 'Canal',
    season: 'Kharif'
  },
  'Potato': {
    expected_yield_per_acre: 99.9,
    seed_cost: 46880,
    fertilizer_cost: 58000,
    labor_cost: 76130,
    transportation_cost: 27010,
    other_expenses: 21830,
    market_price: 1665,
    soil_type: 'Red Soil',
    irrigation_type: 'Sprinkler',
    season: 'Rabi'
  },
  'Tomato': {
    expected_yield_per_acre: 117.5,
    seed_cost: 24380,
    fertilizer_cost: 58570,
    labor_cost: 98120,
    transportation_cost: 31450,
    other_expenses: 26720,
    market_price: 1285,
    soil_type: 'Sandy',
    irrigation_type: 'Drip',
    season: 'Zaid'
  },
  'Onion': {
    expected_yield_per_acre: 87.5,
    seed_cost: 33410,
    fertilizer_cost: 50850,
    labor_cost: 75250,
    transportation_cost: 28770,
    other_expenses: 22890,
    market_price: 1930,
    soil_type: 'Black Soil',
    irrigation_type: 'Sprinkler',
    season: 'Zaid'
  },
  'Maize': {
    expected_yield_per_acre: 29.7,
    seed_cost: 10170,
    fertilizer_cost: 49890,
    labor_cost: 51860,
    transportation_cost: 18620,
    other_expenses: 18200,
    market_price: 1980,
    soil_type: 'Loamy',
    irrigation_type: 'Borewell',
    season: 'Kharif'
  },
  'Groundnut': {
    expected_yield_per_acre: 14.9,
    seed_cost: 17030,
    fertilizer_cost: 35300,
    labor_cost: 59040,
    transportation_cost: 15480,
    other_expenses: 13820,
    market_price: 5765,
    soil_type: 'Red Soil',
    irrigation_type: 'Canal',
    season: 'Kharif'
  },
  'Chilli': {
    expected_yield_per_acre: 13.1,
    seed_cost: 24610,
    fertilizer_cost: 53560,
    labor_cost: 82780,
    transportation_cost: 20780,
    other_expenses: 20590,
    market_price: 9585,
    soil_type: 'Black Soil',
    irrigation_type: 'Sprinkler',
    season: 'Rabi'
  }
};
