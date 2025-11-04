// Quick script to test Twitter API status
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

console.log('\n🔍 Checking Twitter API Status...\n');

if (!TWITTER_BEARER_TOKEN) {
    console.log('❌ Twitter Bearer Token not found in .env file');
    process.exit(1);
}

try {
    // Try a simple search with minimal data
    const response = await axios.get('https://api.twitter.com/2/tweets/search/recent', {
        headers: {
            'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`
        },
        params: {
            query: '#AI -is:retweet lang:en',
            'tweet.fields': 'public_metrics,author_id',
            'user.fields': 'username,name,public_metrics,verified',
            'expansions': 'author_id',
            'max_results': 10
        }
    });

    if (response.data?.data) {
        console.log('✅ Twitter API is WORKING!');
        console.log(`📊 Found ${response.data.data.length} recent tweets`);
        
        if (response.data.includes?.users) {
            console.log(`👥 Found ${response.data.includes.users.length} users posting about #AI\n`);
            console.log('🎉 You can now search for real influencers!\n');
            console.log('Example real influencers from this test:');
            for (const [i, user] of response.data.includes.users.slice(0, 3).entries()) {
                console.log(`   ${i + 1}. @${user.username} - ${user.name}`);
                console.log(`      Followers: ${(user.public_metrics.followers_count / 1000).toFixed(1)}K`);
                if (user.verified) console.log(`      ✓ Verified`);
            }
        }
    }
} catch (error) {
    if (error.response?.status === 429) {
        console.log('⏰ Rate limit still active (429 error)');
        console.log('⏳ Please wait 15 minutes from your last search');
        console.log('\n💡 Tip: The limit resets 15 minutes after your FIRST request in the window');
        console.log('   Not 15 minutes from now!\n');
    } else if (error.response?.status === 401) {
        console.log('❌ Authentication failed - Check your Bearer Token');
    } else {
        console.log('❌ Error:', error.message);
        if (error.response?.data) {
            console.log('   Details:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

