// prophetService.js - Prophet ML integration for TrendSphere
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Use Prophet ML to generate predictions
 * @param {Array<number>} historicalData - Array of historical values
 * @param {number} hoursAhead - Number of hours to predict (default: 24)
 * @returns {Promise<Object>} Prediction results with confidence intervals
 */
export async function getProphetPrediction(historicalData, hoursAhead = 24) {
    return new Promise((resolve, reject) => {
        // Validate input
        if (!historicalData || historicalData.length < 10) {
            console.log('⚠️  Insufficient data for Prophet, using fallback method');
            resolve({ useFallback: true });
            return;
        }

        const pythonScript = join(__dirname, 'prophet_predict.py');
        const args = [
            pythonScript,
            JSON.stringify(historicalData),
            hoursAhead.toString()
        ];

        console.log('🤖 Using Prophet ML for predictions...');
        
        const python = spawn('python', args);
        let output = '';
        let errorOutput = '';

        python.stdout.on('data', (data) => {
            output += data.toString();
        });

        python.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        python.on('close', (code) => {
            if (code !== 0) {
                console.error('❌ Prophet prediction failed:', errorOutput);
                resolve({ useFallback: true });
                return;
            }

            try {
                const result = JSON.parse(output);
                
                if (result.error || !result.predictions) {
                    console.error('❌ Prophet error:', result.error);
                    resolve({ useFallback: true });
                    return;
                }

                console.log('✅ Prophet prediction successful!');
                console.log(`   📊 Generated ${result.predictions.length} predictions`);
                console.log(`   🎯 Confidence: ${result.confidence}%`);
                
                resolve({
                    useFallback: false,
                    predictions: result.predictions,
                    lowerBound: result.lower_bound,
                    upperBound: result.upper_bound,
                    trend: result.trend,
                    confidence: result.confidence,
                    method: 'Prophet ML'
                });
            } catch (error) {
                console.error('❌ Failed to parse Prophet output:', error.message);
                resolve({ useFallback: true });
            }
        });

        // Timeout after 30 seconds
        setTimeout(() => {
            python.kill();
            console.error('❌ Prophet prediction timeout');
            resolve({ useFallback: true });
        }, 30000);
    });
}

/**
 * Get prediction with automatic fallback
 * Tries Prophet first, falls back to statistical method if it fails
 */
export async function getPredictionWithFallback(historicalData, trend, hoursAhead = 24) {
    try {
        const prophetResult = await getProphetPrediction(historicalData, hoursAhead);
        
        if (!prophetResult.useFallback) {
            return prophetResult;
        }
        
        // Fallback to statistical method
        console.log('📊 Using statistical fallback method');
        return {
            useFallback: true,
            predictions: generateStatisticalPrediction(historicalData, trend, hoursAhead),
            confidence: 70,
            method: 'Statistical'
        };
    } catch (error) {
        console.error('Error in prediction:', error.message);
        return {
            useFallback: true,
            predictions: generateStatisticalPrediction(historicalData, trend, hoursAhead),
            confidence: 60,
            method: 'Statistical (Error Fallback)'
        };
    }
}

/**
 * Statistical fallback prediction (your current method)
 */
function generateStatisticalPrediction(historical, trend, hoursAhead) {
    const lastValue = historical[historical.length - 1];
    const prediction = [];
    
    for (let i = 1; i <= hoursAhead; i++) {
        const trendEffect = trend * i * 0.05;
        const seasonality = Math.sin(i / 4) * 0.1;
        const noise = (Math.random() - 0.5) * 0.1;
        
        const predicted = lastValue * (1 + trendEffect + seasonality + noise);
        prediction.push(Math.max(0, Math.round(predicted)));
    }
    
    return prediction;
}
