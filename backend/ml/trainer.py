import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score
)

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

MODEL_DIR = os.path.dirname(__file__)

CATEGORICAL_FEATURES = [
    'Crop_Type', 'Location', 'Season', 'Soil_Type', 'Irrigation_Type'
]

NUMERICAL_FEATURES = [
    'Land_Area_Acres', 'Expected_Yield_per_Acre', 'Total_Expected_Yield',
    'Seed_Cost', 'Fertilizer_Cost', 'Labor_Cost', 'Transportation_Cost',
    'Other_Expenses', 'Market_Price'
]

FEATURE_COLS = CATEGORICAL_FEATURES + NUMERICAL_FEATURES

def train_and_evaluate():
    dataset_path = find_dataset_path()
    print(f"Loading dataset from: {dataset_path}")
    df = pd.read_csv(dataset_path)
    
    # Handle missing values if any
    df = df.dropna(subset=FEATURE_COLS + ['Profit', 'Profit_Status'])
    
    X = df[FEATURE_COLS]
    y_reg = df['Profit']
    y_clf = df['Profit_Status']
    
    # Train-test split (80/20, fixed seed)
    X_train, X_test, y_reg_train, y_reg_test, y_clf_train, y_clf_test = train_test_split(
        X, y_reg, y_clf, test_size=0.2, random_state=42
    )
    
    # Preprocessor
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), NUMERICAL_FEATURES),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), CATEGORICAL_FEATURES)
        ]
    )
    
    # -----------------------------
    # 1. Regression Models Evaluation
    # -----------------------------
    reg_models = {
        'Linear Regression': LinearRegression(),
        'Random Forest Regressor': RandomForestRegressor(n_estimators=100, random_state=42),
        'Gradient Boosting Regressor': GradientBoostingRegressor(n_estimators=100, random_state=42)
    }
    
    reg_metrics = {}
    best_reg_name = None
    best_reg_r2 = -float('inf')
    best_reg_pipeline = None
    
    for name, model in reg_models.items():
        pipe = Pipeline([
            ('preprocessor', preprocessor),
            ('model', model)
        ])
        pipe.fit(X_train, y_reg_train)
        preds = pipe.predict(X_test)
        
        mae = float(mean_absolute_error(y_reg_test, preds))
        rmse = float(np.sqrt(mean_squared_error(y_reg_test, preds)))
        r2 = float(r2_score(y_reg_test, preds))
        
        reg_metrics[name] = {
            'mae': mae,
            'rmse': rmse,
            'r2': r2
        }
        
        if r2 > best_reg_r2:
            best_reg_r2 = r2
            best_reg_name = name
            best_reg_pipeline = pipe
            
    print("Regression Models Evaluation:")
    print(json.dumps(reg_metrics, indent=2))
    print(f"Best Regression Model: {best_reg_name} (R² = {best_reg_r2:.4f})")
    
    # -----------------------------
    # 2. Classification Models Evaluation
    # -----------------------------
    clf_models = {
        'Random Forest Classifier': RandomForestClassifier(n_estimators=100, random_state=42),
        'Gradient Boosting Classifier': GradientBoostingClassifier(n_estimators=100, random_state=42)
    }
    
    clf_metrics = {}
    best_clf_name = None
    best_clf_f1 = -float('inf')
    best_clf_pipeline = None
    
    for name, model in clf_models.items():
        pipe = Pipeline([
            ('preprocessor', preprocessor),
            ('model', model)
        ])
        pipe.fit(X_train, y_clf_train)
        preds = pipe.predict(X_test)
        
        acc = float(accuracy_score(y_clf_test, preds))
        prec = float(precision_score(y_clf_test, preds, average='weighted', zero_division=0))
        rec = float(recall_score(y_clf_test, preds, average='weighted', zero_division=0))
        f1 = float(f1_score(y_clf_test, preds, average='weighted', zero_division=0))
        
        clf_metrics[name] = {
            'accuracy': acc,
            'precision': prec,
            'recall': rec,
            'f1_score': f1
        }
        
        if f1 > best_clf_f1:
            best_clf_f1 = f1
            best_clf_name = name
            best_clf_pipeline = pipe
            
    print("Classification Models Evaluation:")
    print(json.dumps(clf_metrics, indent=2))
    print(f"Best Classification Model: {best_clf_name} (F1 = {best_clf_f1:.4f})")
    
    # -----------------------------
    # Feature Importances (from best RF / GB model)
    # -----------------------------
    feature_importances = []
    if hasattr(best_reg_pipeline.named_steps['model'], 'feature_importances_'):
        # Extract feature names after OneHotEncoding
        cat_encoder = best_reg_pipeline.named_steps['preprocessor'].named_transformers_['cat']
        encoded_cat_names = list(cat_encoder.get_feature_names_out(CATEGORICAL_FEATURES))
        all_feature_names = NUMERICAL_FEATURES + encoded_cat_names
        importances = best_reg_pipeline.named_steps['model'].feature_importances_
        
        feat_imp = sorted(zip(all_feature_names, importances), key=lambda x: x[1], reverse=True)
        feature_importances = [{"feature": name, "importance": float(imp)} for name, imp in feat_imp[:15]]
    
    # Save artifacts
    metrics_data = {
        "dataset_size": len(df),
        "train_size": len(X_train),
        "test_size": len(X_test),
        "features_used": FEATURE_COLS,
        "best_regression_model": best_reg_name,
        "best_classification_model": best_clf_name,
        "regression_metrics": reg_metrics,
        "classification_metrics": clf_metrics,
        "feature_importances": feature_importances
    }
    
    metrics_path = os.path.join(MODEL_DIR, "metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics_data, f, indent=2)
        
    model_artifact = {
        "regressor": best_reg_pipeline,
        "classifier": best_clf_pipeline,
        "feature_cols": FEATURE_COLS
    }
    
    joblib_path = os.path.join(MODEL_DIR, "model.joblib")
    joblib.dump(model_artifact, joblib_path)
    print(f"Successfully saved model pipeline to {joblib_path} and metrics to {metrics_path}")

if __name__ == "__main__":
    train_and_evaluate()
