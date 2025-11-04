// test-apis.js - Test which APIs are connected and working
import dotenv from 'dotenv';
import { getGoogleTrends, getTwitterTrends, getRedditTrends } from './trendServices.js';

dotenv.config();

console.log('🔍 Testing TrendSphere API Connections...\n');
console.log('='.repeat(50));

// Helper function to test Google Trends
async function testGoogleTrends(results) {
  console.log('\n1️⃣ Testing Google Trends API...');
  try {
    const data = await getGoogleTrends('AI');
    if (data.source === 'Google Trends') {
      console.log('   ✅ Google Trends: CONNECTED');
      console.log(`   📊 Volume: ${data.volume}`);
      results.connected.push('Google Trends (FREE - No API key needed)');
    } else {
      console.log('   ⚠️  Google Trends: Using fallback data');
      results.notConfigured.push('Google Trends (has issues, using fallback)');
    }
  } catch (error) {
    console.log('   ❌ Google Trends: ERROR');
    console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
    results.errors.push({ api: 'Google Trends', error: error instanceof Error ? error.message : String(error) });
  }
}

// Helper function to test Twitter API
async function testTwitter(results) {
  console.log('\n2️⃣ Testing Twitter/X API...');
  const twitterToken = process.env.TWITTER_BEARER_TOKEN;
  if (!twitterToken || twitterToken === 'your_twitter_bearer_token') {
    console.log('   ⚠️  Twitter: NOT CONFIGURED');
    console.log('   ℹ️  Set TWITTER_BEARER_TOKEN in .env to enable');
    results.notConfigured.push('Twitter (API key not configured)');
  } else {
    try {
      const data = await getTwitterTrends('AI');
      if (data.source === 'Twitter') {
        console.log('   ✅ Twitter: CONNECTED');
        console.log(`   📊 Volume: ${data.volume}`);
        results.connected.push('Twitter');
      } else {
        console.log('   ⚠️  Twitter: Using fallback data');
        results.notConfigured.push('Twitter (configured but failing)');
      }
    } catch (error) {
      console.log('   ❌ Twitter: ERROR');
      console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
      results.errors.push({ api: 'Twitter', error: error instanceof Error ? error.message : String(error) });
    }
  }
}

// Helper function to test Reddit API
async function testReddit(results) {
  console.log('\n3️⃣ Testing Reddit API...');
  const redditId = process.env.REDDIT_CLIENT_ID;
  const redditSecret = process.env.REDDIT_CLIENT_SECRET;
  if (!redditId || !redditSecret || redditId === 'your_reddit_client_id') {
    console.log('   ⚠️  Reddit: NOT CONFIGURED');
    console.log('   ℹ️  Set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET in .env to enable');
    results.notConfigured.push('Reddit (API keys not configured)');
  } else {
    try {
      const data = await getRedditTrends('AI');
      if (data.source === 'Reddit') {
        console.log('   ✅ Reddit: CONNECTED');
        console.log(`   📊 Volume: ${data.volume}`);
        results.connected.push('Reddit');
      } else {
        console.log('   ⚠️  Reddit: Using fallback data');
        results.notConfigured.push('Reddit (configured but failing)');
      }
    } catch (error) {
      console.log('   ❌ Reddit: ERROR');
      console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
      results.errors.push({ api: 'Reddit', error: error instanceof Error ? error.message : String(error) });
    }
  }
}

// Main test function
async function testAPIs() {
  const results = {
    connected: [],
    notConfigured: [],
    errors: []
  };

  // Run all tests
  await testGoogleTrends(results);
  await testTwitter(results);
  await testReddit(results);

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 SUMMARY:');
  console.log('='.repeat(50));
  
  console.log(`\n✅ Connected APIs: ${results.connected.length}/3`);
  if (results.connected.length > 0) {
    for (const api of results.connected) {
      console.log(`   • ${api}`);
    }
  }

  if (results.notConfigured.length > 0) {
    console.log(`\n⚠️  Not Configured: ${results.notConfigured.length}/3`);
    for (const api of results.notConfigured) {
      console.log(`   • ${api}`);
    }
  }

  if (results.errors.length > 0) {
    console.log(`\n❌ Errors: ${results.errors.length}`);
    for (const error of results.errors) {
      console.log(`   • ${error.api}: ${error.error}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('\n💡 Tips:');
  console.log('   • Google Trends works without API keys (FREE)');
  console.log('   • Add Reddit API for better data (FREE)');
  console.log('   • Add Twitter API for social trends (FREE tier)');
  console.log('\n📖 See API_SETUP_GUIDE.md for setup instructions\n');

  process.exit(0);
}

try {
  await testAPIs();
} catch (error) {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
}
