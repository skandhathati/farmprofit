from pydantic import BaseModel, Field
from typing import Optional, List

class FarmInputSchema(BaseModel):
    crop_type: str = Field(..., example="Rice")
    location: str = Field(..., example="Madhya Pradesh")
    season: str = Field(..., example="Kharif")
    land_area_acres: float = Field(..., gt=0, example=5.0)
    soil_type: str = Field(..., example="Black Soil")
    irrigation_type: str = Field(..., example="Drip")
    expected_yield_per_acre: float = Field(..., ge=0, example=30.0)
    total_expected_yield: Optional[float] = Field(None, ge=0, example=150.0)
    yield_unit: str = Field("Quintal", example="Quintal")
    seed_cost: float = Field(..., ge=0, example=12000.0)
    fertilizer_cost: float = Field(..., ge=0, example=45000.0)
    labor_cost: float = Field(..., ge=0, example=45000.0)
    transportation_cost: float = Field(..., ge=0, example=15000.0)
    other_expenses: float = Field(..., ge=0, example=15000.0)
    market_price: float = Field(..., ge=0, example=2100.0)
    price_unit: str = Field("INR_per_Quintal", example="INR_per_Quintal")

class WhatIfSchema(BaseModel):
    current: FarmInputSchema
    modified: FarmInputSchema

class FilterSchema(BaseModel):
    crop_type: Optional[str] = None
    location: Optional[str] = None
    season: Optional[str] = None
    soil_type: Optional[str] = None
    irrigation_type: Optional[str] = None
    risk_level: Optional[str] = None
    profit_status: Optional[str] = None

class CropComparisonRequest(BaseModel):
    crops: List[str]
