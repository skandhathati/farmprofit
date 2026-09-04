# FarmProfit — AI-Powered Farming Profitability Prediction Platform

FarmProfit is an end-to-end, AI-powered agricultural profitability prediction and decision-support web application. It helps farmers, agricultural extension officers, and agribusiness managers evaluate farming costs, predict net profit/loss, calculate ROI and break-even metrics, analyze what-if scenarios, and compare crops before making planting investments.

---

## 🌾 Problem Statement

High crop yield does not necessarily mean high profit. A farmer's final financial outcome is governed by multiple variables:
- Land area & crop selection
- Seed, fertilizer, labor, transportation, and ancillary expenses
- Market selling price and volume harvested
- Market volatility and weather/irrigation risks

FarmProfit brings transparent financial modeling and machine learning algorithms to historical farming data, eliminating guesswork and empowering data-driven agricultural decisions.

---

## 🚀 Features

1. **Home & Landing Experience**: Interactive introduction highlighting platform capabilities and dataset stats.
2. **Farm Calculator & ML Profit Predictor**: Multi-section input form (Basic info, Production, Costs, Market) with strict validation.
3. **Prediction Dashboard Modal**: Displays expected revenue, total expenses, ML predicted profit/loss, ROI, profit margin, break-even selling price, break-even yield volume, risk level, and dataset-backed recommendations.
4. **Interactive Analytics Dashboard**: Filter 1,000 farm records by Crop, Location, Season, Soil Type, Irrigation, Risk Level, and Profit Status across 8 Recharts visual charts.
5. **What-If Scenario Simulation**: Real-time sliders to modify expected yield, market prices, seed, fertilizer, labor, transport, and other costs side-by-side against baseline numbers.
6. **Crop Comparison Matrix**: Select multiple crops to compare average yields, costs, net profits, margins, ROI, and risk levels with highlight badges.
7. **ML Model Performance**: Transparency page documenting ML train-test splits, algorithm benchmarks (Linear Regression vs. Random Forest vs. Gradient Boosting), feature importance rankings, and empirical evaluation metrics (MAE, RMSE, R², Accuracy, Precision, Recall, F1-Score).
8. **About Page & Documentation**: Complete repository of financial formulas and system stack specifications.

---

## 📊 Dataset Information

- **Primary File**: `dataset/FarmProfit_1000_rows-1.csv`
- **Total Records**: 1,001 agricultural farm entries across India.
- **Fields**:
  - `Farm_ID`, `Crop_Type`, `Location`, `Season`, `Land_Area_Acres`, `Soil_Type`, `Irrigation_Type`
  - `Expected_Yield_per_Acre`, `Total_Expected_Yield`, `Yield_Unit`
  - `Seed_Cost`, `Fertilizer_Cost`, `Labor_Cost`, `Transportation_Cost`, `Other_Expenses`
  - `Market_Price`, `Price_Unit`, `Total_Cost`, `Revenue`, `Profit`
  - `Profit_Margin`, `ROI`, `Break_Even_Price`, `Break_Even_Yield`, `Risk_Level`, `Profit_Status`

---

## 🤖 Machine Learning Pipeline & Metrics

To avoid data leakage, target-derived columns (`Revenue`, `Total_Cost`, `Profit_Margin`, `ROI`, `Break_Even_Price`, `Break_Even_Yield`) were excluded from the model feature matrix. Models were trained strictly on underlying farm input attributes.

### 1. Regression Models (Target: `Profit`)
- **Linear Regression**: MAE = ₹116,746 | RMSE = ₹168,524 | R² = 0.8656
- **Random Forest Regressor**: MAE = ₹66,316 | RMSE = ₹105,765 | R² = 0.9471
- **Gradient Boosting Regressor (Selected)**: **MAE = ₹60,078 | RMSE = ₹94,042 | R² = 0.9582**

### 2. Classification Models (Target: `Profit_Status`)
- **Random Forest Classifier**: Accuracy = 93.5% | F1 = 0.9315
- **Gradient Boosting Classifier (Selected)**: **Accuracy = 95.0% | F1 = 0.9490**

---

## 📐 Financial Calculation Formulas

- $\text{Total Cost} = \text{Seed} + \text{Fertilizer} + \text{Labor} + \text{Transport} + \text{Other Expenses}$
- $\text{Revenue} = \text{Total Expected Yield} \times \text{Market Price}$
- $\text{Profit} = \text{Revenue} - \text{Total Cost}$
- $\text{Profit Margin (\%)} = \left(\frac{\text{Profit}}{\text{Revenue}}\right) \times 100$
- $\text{ROI (\%)} = \left(\frac{\text{Profit}}{\text{Total Cost}}\right) \times 100$
- $\text{Break-Even Price} = \frac{\text{Total Cost}}{\text{Total Expected Yield}}$
- $\text{Break-Even Yield} = \frac{\text{Total Cost}}{\text{Market Price}}$

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Lucide Icons, Axios.
- **Backend**: Python 3.10+, FastAPI, Uvicorn, Pydantic v2, Pandas, NumPy.
- **Machine Learning**: Scikit-Learn, Joblib, ColumnTransformer, OneHotEncoder, StandardScaler.

---

## 🔌 API Endpoints

- `GET /api/health`: Health status & ML model check.
- `GET /api/options`: Returns unique categorical options from dataset.
- `GET /api/dashboard`: Summary statistics and chart aggregations (supports query filters).
- `POST /api/calculate`: Transparent financial calculation.
- `POST /api/predict`: ML regression & classification inference + financial metrics + recommendations.
- `POST /api/what-if`: Side-by-side scenario comparison & delta math.
- `GET /api/crop-comparison`: Multi-crop comparative statistics.
- `GET /api/model-metrics`: Model evaluation scores & feature importances.

---

## 💻 Local Installation & Setup Instructions

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run ML model training script
python ml/trainer.py

# Start FastAPI application
python -m uvicorn main:app --host 127.0.0.1 --port 8080
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Open `http://127.0.0.1:3000` in your web browser.
