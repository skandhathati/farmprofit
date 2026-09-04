import os
import pandas as pd
import numpy as np

def find_dataset_path():
    candidates = [
        os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dataset", "FarmProfit_1000_rows-1.csv"),
        os.path.join(os.path.dirname(__file__), "..", "..", "dataset", "FarmProfit_1000_rows-1.csv"),
        os.path.join(os.path.dirname(__file__), "..", "dataset", "FarmProfit_1000_rows-1.csv"),
        os.path.join(os.getcwd(), "frontend", "dataset", "FarmProfit_1000_rows-1.csv"),
        os.path.join(os.getcwd(), "dataset", "FarmProfit_1000_rows-1.csv"),
        os.path.join(os.getcwd(), "FarmProfit_1000_rows-1.csv"),
    ]
    for path in candidates:
        abs_path = os.path.abspath(path)
        if os.path.exists(abs_path):
            return abs_path
    raise FileNotFoundError("FarmProfit_1000_rows-1.csv not found in any expected location.")

_df_cache = None

def get_df():
    global _df_cache
    if _df_cache is None:
        dataset_path = find_dataset_path()
        df = pd.read_csv(dataset_path)
        # Ensure correct numeric datatypes for calculations
        num_cols = [
            'Land_Area_Acres', 'Expected_Yield_per_Acre', 'Total_Expected_Yield',
            'Seed_Cost', 'Fertilizer_Cost', 'Labor_Cost', 'Transportation_Cost',
            'Other_Expenses', 'Market_Price', 'Total_Cost', 'Revenue', 'Profit',
            'Profit_Margin', 'ROI', 'Break_Even_Price', 'Break_Even_Yield'
        ]
        for col in num_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
        _df_cache = df
    return _df_cache

def get_unique_options():
    df = get_df()
    return {
        "crops": sorted([str(x).strip() for x in df['Crop_Type'].dropna().unique() if str(x).strip()]),
        "locations": sorted([str(x).strip() for x in df['Location'].dropna().unique() if str(x).strip()]),
        "seasons": sorted([str(x).strip() for x in df['Season'].dropna().unique() if str(x).strip()]),
        "soil_types": sorted([str(x).strip() for x in df['Soil_Type'].dropna().unique() if str(x).strip()]),
        "irrigation_types": sorted([str(x).strip() for x in df['Irrigation_Type'].dropna().unique() if str(x).strip()]),
        "risk_levels": sorted([str(x).strip() for x in df['Risk_Level'].dropna().unique() if str(x).strip()]),
        "profit_statuses": sorted([str(x).strip() for x in df['Profit_Status'].dropna().unique() if str(x).strip()])
    }

def filter_dataframe(df, filters: dict):
    filtered = df.copy()
    filter_mappings = [
        ("crop_type", "Crop_Type"),
        ("location", "Location"),
        ("season", "Season"),
        ("soil_type", "Soil_Type"),
        ("irrigation_type", "Irrigation_Type"),
        ("risk_level", "Risk_Level"),
        ("profit_status", "Profit_Status"),
    ]
    
    for param_name, col_name in filter_mappings:
        val = filters.get(param_name)
        if val is not None and str(val).strip() != "":
            val_str = str(val).strip()
            # Ignore "All" / "All <Category>" placeholder values
            if val_str.lower() == "all" or val_str.lower().startswith("all "):
                continue
            
            # Case-insensitive & whitespace-stripped matching
            mask = filtered[col_name].astype(str).str.strip().str.lower() == val_str.lower()
            filtered = filtered[mask]
            
    return filtered

def get_dashboard_data(filters: dict = None):
    df = get_df()
    if filters:
        df = filter_dataframe(df, filters)
        
    total_farms = len(df)
    if total_farms == 0:
        return {
            "summary": {
                "total_farms": 0,
                "avg_profit": 0,
                "avg_roi": 0,
                "avg_revenue": 0,
                "avg_cost": 0,
                "most_profitable_crop": "N/A",
                "lowest_risk_crop": "N/A",
                "profitable_records": 0
            },
            "charts": {
                "profit_by_crop": [],
                "revenue_vs_cost": [],
                "cost_breakdown": [],
                "roi_by_crop": [],
                "profit_margin_by_crop": [],
                "risk_distribution": [],
                "yield_vs_profit": [],
                "price_vs_profit": []
            }
        }
        
    avg_profit = float(df['Profit'].mean())
    avg_roi = float(df['ROI'].mean())
    avg_revenue = float(df['Revenue'].mean())
    avg_cost = float(df['Total_Cost'].mean())
    profitable_records = int((df['Profit'] > 0).sum())
    
    # Crop aggregations on filtered df
    crop_stats = df.groupby('Crop_Type').agg(
        avg_profit=('Profit', 'mean'),
        avg_roi=('ROI', 'mean'),
        low_risk_count=('Risk_Level', lambda x: (x == 'Low').sum()),
        total_count=('Farm_ID', 'count')
    ).reset_index()
    
    most_profitable_crop = crop_stats.loc[crop_stats['avg_profit'].idxmax()]['Crop_Type'] if len(crop_stats) > 0 else "N/A"
    
    # Lowest risk crop: highest percentage of Low risk records
    crop_stats['low_risk_pct'] = crop_stats['low_risk_count'] / crop_stats['total_count']
    lowest_risk_crop = crop_stats.loc[crop_stats['low_risk_pct'].idxmax()]['Crop_Type'] if len(crop_stats) > 0 else "N/A"
    
    # Chart Data 1: Profit by Crop
    profit_by_crop = df.groupby('Crop_Type')['Profit'].mean().reset_index()
    profit_by_crop.columns = ['crop', 'avg_profit']
    profit_by_crop['avg_profit'] = profit_by_crop['avg_profit'].round(2)
    
    # Chart Data 2: Revenue vs Total Cost by Crop
    rev_cost = df.groupby('Crop_Type').agg(
        avg_revenue=('Revenue', 'mean'),
        avg_cost=('Total_Cost', 'mean')
    ).reset_index()
    rev_cost.columns = ['crop', 'avg_revenue', 'avg_cost']
    rev_cost['avg_revenue'] = rev_cost['avg_revenue'].round(2)
    rev_cost['avg_cost'] = rev_cost['avg_cost'].round(2)
    
    # Chart Data 3: Cost Breakdown (Sum across filtered dataset)
    cost_breakdown = [
        {"name": "Seed Cost", "value": round(float(df['Seed_Cost'].sum()), 2)},
        {"name": "Fertilizer Cost", "value": round(float(df['Fertilizer_Cost'].sum()), 2)},
        {"name": "Labor Cost", "value": round(float(df['Labor_Cost'].sum()), 2)},
        {"name": "Transportation Cost", "value": round(float(df['Transportation_Cost'].sum()), 2)},
        {"name": "Other Expenses", "value": round(float(df['Other_Expenses'].sum()), 2)}
    ]
    
    # Chart Data 4: ROI by Crop
    roi_by_crop = df.groupby('Crop_Type')['ROI'].mean().reset_index()
    roi_by_crop.columns = ['crop', 'avg_roi']
    roi_by_crop['avg_roi'] = roi_by_crop['avg_roi'].round(2)
    
    # Chart Data 5: Profit Margin by Crop
    margin_by_crop = df.groupby('Crop_Type')['Profit_Margin'].mean().reset_index()
    margin_by_crop.columns = ['crop', 'avg_margin']
    margin_by_crop['avg_margin'] = margin_by_crop['avg_margin'].round(2)
    
    # Chart Data 6: Risk Distribution
    risk_dist = df['Risk_Level'].value_counts().reset_index()
    risk_dist.columns = ['risk_level', 'count']
    
    # Chart Data 7: Yield vs Profit (Sample 150 points if large)
    scatter_df = df.sample(min(150, len(df)), random_state=42) if len(df) > 150 else df
    yield_vs_profit = [
        {"crop": str(r["Crop_Type"]), "yield": round(float(r["Total_Expected_Yield"]), 2), "profit": round(float(r["Profit"]), 2)}
        for _, r in scatter_df.iterrows()
    ]
    
    # Chart Data 8: Market Price vs Profit
    price_vs_profit = [
        {"crop": str(r["Crop_Type"]), "market_price": round(float(r["Market_Price"]), 2), "profit": round(float(r["Profit"]), 2)}
        for _, r in scatter_df.iterrows()
    ]
    
    return {
        "summary": {
            "total_farms": total_farms,
            "avg_profit": round(avg_profit, 2),
            "avg_roi": round(avg_roi, 2),
            "avg_revenue": round(avg_revenue, 2),
            "avg_cost": round(avg_cost, 2),
            "most_profitable_crop": str(most_profitable_crop),
            "lowest_risk_crop": str(lowest_risk_crop),
            "profitable_records": profitable_records
        },
        "charts": {
            "profit_by_crop": profit_by_crop.to_dict('records'),
            "revenue_vs_cost": rev_cost.to_dict('records'),
            "cost_breakdown": cost_breakdown,
            "roi_by_crop": roi_by_crop.to_dict('records'),
            "profit_margin_by_crop": margin_by_crop.to_dict('records'),
            "risk_distribution": risk_dist.to_dict('records'),
            "yield_vs_profit": yield_vs_profit,
            "price_vs_profit": price_vs_profit
        }
    }

def get_crop_comparison(crop_list: list):
    df = get_df()
    if crop_list and len(crop_list) > 0:
        clean_crops = [str(c).strip().lower() for c in crop_list if str(c).strip()]
        df = df[df['Crop_Type'].astype(str).str.strip().str.lower().isin(clean_crops)]
        
    stats = df.groupby('Crop_Type').agg(
        avg_yield=('Total_Expected_Yield', 'mean'),
        avg_cost=('Total_Cost', 'mean'),
        avg_revenue=('Revenue', 'mean'),
        avg_profit=('Profit', 'mean'),
        avg_margin=('Profit_Margin', 'mean'),
        avg_roi=('ROI', 'mean'),
        record_count=('Farm_ID', 'count')
    ).reset_index()
    
    risk_modes = df.groupby('Crop_Type')['Risk_Level'].agg(lambda x: x.mode()[0] if not x.empty else 'Medium').to_dict()
    
    result = []
    for _, row in stats.iterrows():
        crop = row['Crop_Type']
        result.append({
            "crop": crop,
            "avg_yield": round(float(row['avg_yield']), 2),
            "avg_cost": round(float(row['avg_cost']), 2),
            "avg_revenue": round(float(row['avg_revenue']), 2),
            "avg_profit": round(float(row['avg_profit']), 2),
            "avg_margin": round(float(row['avg_margin']), 2),
            "avg_roi": round(float(row['avg_roi']), 2),
            "risk_level": risk_modes.get(crop, "Medium")
        })
        
    highlights = {}
    if result:
        highlights["highest_profit"] = max(result, key=lambda x: x["avg_profit"])["crop"]
        highlights["highest_roi"] = max(result, key=lambda x: x["avg_roi"])["crop"]
        highlights["lowest_cost"] = min(result, key=lambda x: x["avg_cost"])["crop"]
        risk_rank = {"Low": 1, "Medium": 2, "High": 3}
        highlights["lowest_risk"] = min(result, key=lambda x: risk_rank.get(x["risk_level"], 2))["crop"]
        
    return {
        "crops": result,
        "highlights": highlights
    }
