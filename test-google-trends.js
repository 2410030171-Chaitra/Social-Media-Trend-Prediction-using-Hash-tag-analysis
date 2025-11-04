// Test Google Trends API
import { getGoogleTrends } from './trendServices.js';

console.log('Testing Google Trends API...\n');

try {
  console.log('1. Testing with popular topic: "AI"');
  const result1 = await getGoogleTrends('AI');
  console.log('Result:', result1.source ? '✅ SUCCESS' : '⚠️ FALLBACK');
  console.log('Data points:', result1.data ? result1.data.length : 0);
  console.log('Volume:', result1.volume);
  console.log('Trend:', result1.trend);
  console.log('');

  console.log('2. Testing with hashtag: "#JavaScript"');
  const result2 = await getGoogleTrends('#JavaScript');
  console.log('Result:', result2.source ? '✅ SUCCESS' : '⚠️ FALLBACK');
  console.log('Data points:', result2.data ? result2.data.length : 0);
  console.log('');

  console.log('3. Testing with another topic: "Climate Change"');
  const result3 = await getGoogleTrends('Climate Change');
  console.log('Result:', result3.source ? '✅ SUCCESS' : '⚠️ FALLBACK');
  console.log('Data points:', result3.data ? result3.data.length : 0);
  console.log('');

  console.log('✅ Test complete!');
  console.log('\nNote: If showing FALLBACK, it might be due to:');
  console.log('  - Rate limiting from Google (wait a minute and try again)');
  console.log('  - Network issues');
  console.log('  - Topic has very low search volume');
  
} catch (error) {
  console.error('❌ Test failed:', error instanceof Error ? error.message : String(error));
}

