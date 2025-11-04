#!/usr/bin/env python3
"""
Prophet ML Prediction Script for TrendSphere
Uses Facebook's Prophet for time-series forecasting
"""

import sys
import json
import warnings
from datetime import datetime, timedelta
import pandas as pd
from prophet import Prophet

# Suppress Prophet's verbose output
warnings.filterwarnings('ignore')

def calculate_base_confidence(interval_width_pct):
    """Calculate base confidence from interval width percentage"""
    if interval_width_pct < 20:
        return 95
    elif interval_width_pct < 30:
        return 88
    elif interval_width_pct < 40:
        return 80
    elif interval_width_pct < 60:
        return 72
    else:
        return 65

def calculate_data_bonus(data_points):
    """Calculate bonus/penalty based on data quantity"""
    if data_points >= 168:  # Full week
        return 0
    elif data_points >= 100:
        return -3
    elif data_points >= 50:
        return -5
    else:
        return -8

def calculate_volatility_penalty(trend_values):
    """Calculate penalty based on trend volatility"""
    if len(trend_values) <= 1:
        return 0
    
    trend_std = pd.Series(trend_values).std()
    trend_mean = pd.Series(trend_values).mean()
    
    if trend_mean == 0:
        return 0
    
    volatility = (trend_std / abs(trend_mean)) * 100
    if volatility > 50:
        return -5
    elif volatility > 30:
        return -3
    else:
        return 0

def calculate_dynamic_confidence(predictions, historical_data):
    """
    Calculate dynamic confidence based on prediction quality
    
    Args:
        predictions: Prophet prediction dataframe
        historical_data: Original historical data points
    
    Returns:
        Confidence score (60-95)
    """
    avg_prediction = predictions['yhat'].mean()
    avg_lower = predictions['yhat_lower'].mean()
    avg_upper = predictions['yhat_upper'].mean()
    
    if avg_prediction <= 0:
        return 70  # Default for edge cases
    
    # Calculate confidence interval width
    interval_width_pct = ((avg_upper - avg_lower) / avg_prediction) * 100
    
    # Get base confidence from interval width
    base_confidence = calculate_base_confidence(interval_width_pct)
    
    # Adjust for data quantity
    data_bonus = calculate_data_bonus(len(historical_data))
    
    # Calculate volatility penalty
    trend_values = predictions['trend'].tolist()
    volatility_penalty = calculate_volatility_penalty(trend_values)
    
    # Final confidence calculation
    confidence = max(60, min(95, base_confidence + data_bonus + volatility_penalty))
    return confidence

def prepare_prophet_dataframe(historical_data):
    """Prepare dataframe for Prophet training"""
    df = pd.DataFrame()
    now = datetime.now()
    dates = [now - timedelta(hours=i) for i in range(len(historical_data)-1, -1, -1)]
    df['ds'] = dates
    df['y'] = historical_data
    return df

def predict_trend(historical_data, hours_ahead=24):
    """
    Use Prophet to predict future trend values
    
    Args:
        historical_data: List of historical values (e.g., last 168 hours = 7 days)
        hours_ahead: Number of hours to predict (default: 24)
    
    Returns:
        Dictionary with predictions and confidence intervals
    """
    try:
        # Prepare data for Prophet
        df = prepare_prophet_dataframe(historical_data)
        
        # Initialize and train Prophet model
        model = Prophet(
            changepoint_prior_scale=0.05,
            seasonality_prior_scale=10,
            seasonality_mode='multiplicative',
            daily_seasonality=True,
            weekly_seasonality=True,
            interval_width=0.80
        )
        
        model.fit(df)
        
        # Create future dataframe and make predictions
        future = model.make_future_dataframe(periods=hours_ahead, freq='H')
        forecast = model.predict(future)
        predictions = forecast.tail(hours_ahead)
        
        # Calculate dynamic confidence
        confidence = calculate_dynamic_confidence(predictions, historical_data)
        
        # Prepare results
        result = {
            'predictions': predictions['yhat'].round(2).tolist(),
            'lower_bound': predictions['yhat_lower'].round(2).tolist(),
            'upper_bound': predictions['yhat_upper'].round(2).tolist(),
            'trend': predictions['trend'].round(2).tolist(),
            'confidence': int(round(confidence))
        }
        
        return result
        
    except Exception as e:
        # Return error if Prophet fails
        return {
            'error': str(e),
            'predictions': None
        }

def main():
    """Main function to handle input/output"""
    try:
        # Read input from command line arguments
        if len(sys.argv) < 2:
            print(json.dumps({
                'error': 'No historical data provided',
                'predictions': None
            }))
            sys.exit(1)
        
        # Parse historical data from JSON
        historical_data = json.loads(sys.argv[1])
        
        # Get hours ahead (default: 24)
        hours_ahead = int(sys.argv[2]) if len(sys.argv) > 2 else 24
        
        # Validate input
        if not historical_data or len(historical_data) < 10:
            print(json.dumps({
                'error': 'Insufficient historical data (need at least 10 data points)',
                'predictions': None
            }))
            sys.exit(1)
        
        # Make predictions
        result = predict_trend(historical_data, hours_ahead)
        
        # Output result as JSON
        print(json.dumps(result))
        
    except json.JSONDecodeError as e:
        print(json.dumps({
            'error': f'Invalid JSON input: {str(e)}',
            'predictions': None
        }))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({
            'error': f'Prediction failed: {str(e)}',
            'predictions': None
        }))
        sys.exit(1)

if __name__ == '__main__':
    main()
