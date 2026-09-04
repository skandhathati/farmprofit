def calculate_financials(
    land_area: float,
    yield_per_acre: float,
    seed_cost: float,
    fertilizer_cost: float,
    labor_cost: float,
    transport_cost: float,
    other_expenses: float,
    market_price: float,
    total_yield_override: float = None,
    yield_unit: str = "Quintal",
    price_unit: str = "INR_per_Quintal"
):
    # Total Expected Yield (user override or land_area * yield_per_acre)
    total_yield = total_yield_override if (total_yield_override is not None and total_yield_override > 0) else (land_area * yield_per_acre)
    
    # Unit compatibility handling
    y_unit = str(yield_unit or "Quintal").strip().lower()
    p_unit = str(price_unit or "INR_per_Quintal").strip().lower()
    
    if ("kg" in y_unit or "kilogram" in y_unit) and ("quintal" in p_unit):
        # Yield is in kg, price is in ₹/Quintal (1 Quintal = 100 kg)
        revenue = (total_yield / 100.0) * market_price
    elif ("quintal" in y_unit) and ("kg" in p_unit or "kilogram" in p_unit):
        # Yield is in Quintal, price is in ₹/kg (1 Quintal = 100 kg)
        revenue = (total_yield * 100.0) * market_price
    else:
        # Standard compatible units (e.g. Quintal & INR_per_Quintal, or kg & INR_per_kg)
        revenue = total_yield * market_price

    # Total Cost = Seed + Fertilizer + Labor + Transportation + Other Expenses
    total_cost = seed_cost + fertilizer_cost + labor_cost + transport_cost + other_expenses
    
    # Net Profit = Revenue - Total Cost
    profit = revenue - total_cost
    
    # Profit Margin = (Profit / Revenue) * 100
    profit_margin = (profit / revenue * 100.0) if revenue > 0 else 0.0
    
    # ROI = (Profit / Total Cost) * 100
    roi = (profit / total_cost * 100.0) if total_cost > 0 else 0.0
    
    # Break-even Price = Total Cost / Total Expected Yield
    break_even_price = (total_cost / total_yield) if total_yield > 0 else 0.0
    
    # Break-even Yield = Total Cost / Market Price
    break_even_yield = (total_cost / market_price) if market_price > 0 else 0.0
    
    # Profit Status
    if profit > 0:
        if profit_margin >= 40:
            profit_status = "High Profit"
        elif profit_margin >= 20:
            profit_status = "Moderate Profit"
        else:
            profit_status = "Profit"
    elif profit < 0:
        profit_status = "Loss"
    else:
        profit_status = "Break-even"
        
    # Determine risk level based on margin & break-even cushion
    if profit <= 0:
        risk_level = "High"
    elif profit_margin < 20 or (market_price > 0 and (market_price - break_even_price) / market_price < 0.15):
        risk_level = "High"
    elif profit_margin < 45:
        risk_level = "Medium"
    else:
        risk_level = "Low"
        
    return {
        "total_expected_yield": round(total_yield, 2),
        "total_cost": round(total_cost, 2),
        "revenue": round(revenue, 2),
        "profit": round(profit, 2),
        "profit_margin": round(profit_margin, 2),
        "roi": round(roi, 2),
        "break_even_price": round(break_even_price, 2),
        "break_even_yield": round(break_even_yield, 2),
        "profit_status": profit_status,
        "risk_level": risk_level
    }

def generate_recommendations(inputs: dict, calculated: dict, predicted_profit: float = None):
    recs = []
    
    profit = calculated["profit"]
    total_cost = calculated["total_cost"]
    margin = calculated["profit_margin"]
    market_price = inputs.get("market_price", 0)
    be_price = calculated["break_even_price"]
    
    # 1. Profitability Status
    if profit > 0:
        recs.append(f"This scenario has positive estimated profitability with a calculated net return of ₹{profit:,.2f} ({margin:.1f}% profit margin).")
    elif profit < 0:
        recs.append(f"This scenario operates at an estimated net loss of ₹{abs(profit):,.2f}. Consider reducing operational expenses or securing higher market prices.")
    else:
        recs.append("This scenario is currently at financial break-even (zero net profit).")
        
    # 2. Cost Analysis
    seed = inputs.get("seed_cost", 0)
    fert = inputs.get("fertilizer_cost", 0)
    labor = inputs.get("labor_cost", 0)
    transport = inputs.get("transportation_cost", 0)
    other = inputs.get("other_expenses", 0)
    
    cost_map = {
        "Fertilizer": fert,
        "Labor": labor,
        "Seed": seed,
        "Transportation": transport,
        "Other Expenses": other
    }
    if total_cost > 0:
        max_cost_name = max(cost_map, key=cost_map.get)
        max_cost_pct = (cost_map[max_cost_name] / total_cost * 100)
        recs.append(f"Your {max_cost_name.lower()} cost represents the largest cost component at {max_cost_pct:.1f}% of total expenses.")
    
    # 3. Market Price vs Break-even
    if market_price > 0 and be_price > 0:
        cushion = ((market_price - be_price) / market_price) * 100
        if cushion < 15 and cushion >= 0:
            recs.append(f"The market price (₹{market_price:,.2f}) is close to your break-even price (₹{be_price:,.2f}). Market price volatility presents risk.")
        elif cushion >= 15:
            recs.append(f"Market price offers a healthy safety cushion of {cushion:.1f}% above your break-even price (₹{be_price:,.2f}).")
            
    # 4. Comparative Suggestion
    recs.append("Consider running What-If scenario analysis to test market price drop sensitivity or compare with alternative crops.")
    
    return recs
