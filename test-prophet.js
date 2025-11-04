// test-prophet.js - Test Prophet ML integration
import { getPredictionWithFallback } from './prophetService.js';

async function testProphet() {
    console.log('🧪 Testing Prophet ML Integration\n');
    
    // Generate sample historical data (7 days = 168 hours)
    const historicalData = [];
    for (let i = 0; i < 168; i++) {
        const baseValue = 80;
        const trend = i * 0.1; // Slight upward trend
        const seasonality = Math.sin(i / 24 * Math.PI) * 10; // Daily pattern
        const noise = (Math.random() - 0.5) * 5;
        historicalData.push(Math.round(baseValue + trend + seasonality + noise));
    }
    
    console.log(`📊 Historical data points: ${historicalData.length}`);
    console.log(`   First value: ${historicalData[0]}`);
    console.log(`   Last value: ${historicalData[historicalData.length - 1]}`);
    console.log(`   Average: ${Math.round(historicalData.reduce((a, b) => a + b) / historicalData.length)}\n`);
    
    // Test Prophet prediction
    const avgTrend = 0.05; // 5% upward trend
    const result = await getPredictionWithFallback(historicalData, avgTrend, 24);
    
    console.log('\n📈 Prediction Results:');
    console.log(`   Method: ${result.method}`);
    console.log(`   Confidence: ${result.confidence}%`);
    console.log(`   Predictions generated: ${result.predictions.length}`);
    console.log(`   First prediction: ${result.predictions[0]}`);
    console.log(`   Last prediction (24h): ${result.predictions[23]}`);
    
    if (result.lowerBound && result.upperBound) {
        console.log(`\n🎯 Confidence Interval (hour 24):`);
        console.log(`   Lower bound: ${result.lowerBound[23]}`);
        console.log(`   Prediction: ${result.predictions[23]}`);
        console.log(`   Upper bound: ${result.upperBound[23]}`);
    }
    
    console.log('\n✅ Test complete!');
    process.exit(0);
}

testProphet().catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
});
