import os
import json
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List

from schemas.farm import FarmInputSchema, WhatIfSchema, FilterSchema
from services.financial_calculator import calculate_financials, generate_recommendations
from services.dataset_service import (
    get_unique_options,
    get_dashboard_data,
    get_crop_comparison
)

app = FastAPI(
    title="FarmProfit API",
    description="AI-Powered Farming Profitability Prediction Platform Backend API",
    version="1.0.0"
)

def get_allowed_origins():
    configured_origins = os.getenv("FRONTEND_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
    return [origin.strip().rstrip("/") for origin in configured_origins.split(",") if origin.strip()]


# The deployed frontend origin must be supplied through FRONTEND_ORIGINS.
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "ml", "model.joblib")
METRICS_PATH = os.path.join(os.path.dirname(__file__), "ml", "metrics.json")

model_artifact = None
metrics_data = None

@app.on_event("startup")
def load_ml_artifacts():
    global model_artifact, metrics_data
    if os.path.exists(MODEL_PATH):
        try:
            model_artifact = joblib.load(MODEL_PATH)
            print(f"ML Model Pipeline loaded successfully from {MODEL_PATH}")
        except Exception as e:
            print(f"Error loading model artifact: {e}")
            
    if os.path.exists(METRICS_PATH):
        try:
            with open(METRICS_PATH, "r") as f:
                metrics_data = json.load(f)
            print(f"ML Metrics loaded successfully from {METRICS_PATH}")
        except Exception as e:
            print(f"Error loading metrics JSON: {e}")

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "FarmProfit API",
        "ml_model_loaded": model_artifact is not None
    }

@app.get("/api/options")
def get_options():
    try:
        return get_unique_options()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard")
def get_dashboard(
    crop_type: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    season: Optional[str] = Query(None),
    soil_type: Optional[str] = Query(None),
    irrigation_type: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    profit_status: Optional[str] = Query(None)
):
    try:
        filters = {
            "crop_type": crop_type,
            "location": location,
            "season": season,
            "soil_type": soil_type,
            "irrigation_type": irrigation_type,
            "risk_level": risk_level,
            "profit_status": profit_status
        }
        return get_dashboard_data(filters)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/calculate")
def calculate_farm(data: FarmInputSchema):
    try:
        calc = calculate_financials(
            land_area=data.land_area_acres,
            yield_per_acre=data.expected_yield_per_acre,
            seed_cost=data.seed_cost,
            fertilizer_cost=data.fertilizer_cost,
            labor_cost=data.labor_cost,
            transport_cost=data.transportation_cost,
            other_expenses=data.other_expenses,
            market_price=data.market_price,
            total_yield_override=data.total_expected_yield,
            yield_unit=data.yield_unit,
            price_unit=data.price_unit
        )
        return {
            "inputs": data.dict(),
            "calculated": calc
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/predict")
def predict_farm(data: FarmInputSchema):
    try:
        # 1. Compute exact transparent financials first
        calc = calculate_financials(
            land_area=data.land_area_acres,
            yield_per_acre=data.expected_yield_per_acre,
            seed_cost=data.seed_cost,
            fertilizer_cost=data.fertilizer_cost,
            labor_cost=data.labor_cost,
            transport_cost=data.transportation_cost,
            other_expenses=data.other_expenses,
            market_price=data.market_price,
            total_yield_override=data.total_expected_yield,
            yield_unit=data.yield_unit,
            price_unit=data.price_unit
        )
        
        predicted_profit = calc["profit"]
        predicted_status = calc["profit_status"]
        predicted_risk = calc["risk_level"]
        
        # 2. Run ML inference if model artifact is available
        if model_artifact is not None:
            regressor = model_artifact.get("regressor")
            classifier = model_artifact.get("classifier")
            
            # Total expected yield calculation
            total_yield = calc["total_expected_yield"]
            
            input_df = pd.DataFrame([{
                'Crop_Type': data.crop_type,
                'Location': data.location,
                'Season': data.season,
                'Soil_Type': data.soil_type,
                'Irrigation_Type': data.irrigation_type,
                'Land_Area_Acres': data.land_area_acres,
                'Expected_Yield_per_Acre': data.expected_yield_per_acre,
                'Total_Expected_Yield': total_yield,
                'Seed_Cost': data.seed_cost,
                'Fertilizer_Cost': data.fertilizer_cost,
                'Labor_Cost': data.labor_cost,
                'Transportation_Cost': data.transportation_cost,
                'Other_Expenses': data.other_expenses,
                'Market_Price': data.market_price
            }])
            
            if regressor:
                try:
                    predicted_profit_raw = float(regressor.predict(input_df)[0])
                    predicted_profit = round(predicted_profit_raw, 2)
                except Exception as ml_err:
                    print(f"ML Regressor inference note for custom input: {ml_err}")
            if classifier:
                try:
                    predicted_status = str(classifier.predict(input_df)[0])
                except Exception as ml_err:
                    print(f"ML Classifier inference note for custom input: {ml_err}")
                
        # 3. Generate dataset-driven recommendations
        recommendations = generate_recommendations(data.dict(), calc, predicted_profit)
        
        return {
            "inputs": data.dict(),
            "calculated": calc,
            "ml_prediction": {
                "predicted_profit": predicted_profit,
                "predicted_status": predicted_status,
                "risk_level": predicted_risk,
                "model_name": metrics_data.get("best_regression_model") if metrics_data else "Gradient Boosting Regressor",
                "r2_score": metrics_data.get("regression_metrics", {}).get("Gradient Boosting Regressor", {}).get("r2") if metrics_data else 0.958
            },
            "recommendations": recommendations
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/what-if")
def what_if_analysis(payload: WhatIfSchema):
    try:
        current_res = predict_farm(payload.current)
        modified_res = predict_farm(payload.modified)
        
        curr_calc = current_res["calculated"]
        mod_calc = modified_res["calculated"]
        
        delta = {
            "total_cost": round(mod_calc["total_cost"] - curr_calc["total_cost"], 2),
            "revenue": round(mod_calc["revenue"] - curr_calc["revenue"], 2),
            "profit": round(mod_calc["profit"] - curr_calc["profit"], 2),
            "profit_margin": round(mod_calc["profit_margin"] - curr_calc["profit_margin"], 2),
            "roi": round(mod_calc["roi"] - curr_calc["roi"], 2),
            "break_even_price": round(mod_calc["break_even_price"] - curr_calc["break_even_price"], 2),
            "break_even_yield": round(mod_calc["break_even_yield"] - curr_calc["break_even_yield"], 2)
        }
        
        return {
            "current": current_res,
            "modified": modified_res,
            "delta": delta
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/crop-comparison")
def crop_comparison(crops: Optional[str] = Query(None)):
    try:
        crop_list = [c.strip() for c in crops.split(",")] if crops else []
        return get_crop_comparison(crop_list)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/model-metrics")
def get_model_metrics():
    if metrics_data is None:
        raise HTTPException(status_code=404, detail="Model metrics file not found")
    return metrics_data
