// trendServices.js - Real API integrations for trend data
import axios from 'axios';
import googleTrends from 'google-trends-api';
import Snoowrap from 'snoowrap';
import { getPredictionWithFallback } from './prophetService.js';
import { getNewsTrends } from './newsService.js';

// Feature flags
const ENABLE_TWITTER = String(process.env.ENABLE_TWITTER || 'false').toLowerCase() === 'true';

// ==================== TWITTER/X API ====================
function shouldSkipTwitter(bearerToken) {
  if (!ENABLE_TWITTER) {
    console.log('Twitter disabled via ENABLE_TWITTER=false; skipping Twitter fetch.');
    return true;
  }
  
  if (!bearerToken) {
    console.log('Twitter API not configured, using fallback data');
    return true;
  }
  
  return false;
}

function handleTwitterError(error) {
  if (error.response?.status === 429) {
    console.error('Twitter API error: Rate limit exceeded (429)');
    if (error.response?.headers?.['x-rate-limit-reset']) {
      const resetTime = new Date(error.response.headers['x-rate-limit-reset'] * 1000);
      console.error(`   Rate limit resets at: ${resetTime.toLocaleString()}`);
    }
    return;
  }
  
  if (error.response?.status === 403) {
    console.error('Twitter API error: Access forbidden (403) - Check your app permissions');
    return;
  }
  
  if (error.response?.status === 401) {
    console.error('Twitter API error: Authentication failed (401) - Invalid Bearer Token');
    return;
  }
  
  console.error('Twitter API error:', error.message);
  if (error.response?.data) {
    console.error('   Details:', JSON.stringify(error.response.data));
  }
}

export async function getTwitterTrends(topic) {
  try {
    const bearerToken = process.env.TWITTER_BEARER_TOKEN;
    
    if (shouldSkipTwitter(bearerToken)) {
      return generateFallbackData(topic);
    }

    // Twitter API v2 - Recent Search
    const response = await axios.get('https://api.twitter.com/2/tweets/search/recent', {
      headers: {
        'Authorization': `Bearer ${bearerToken}`
      },
      params: {
        query: topic.startsWith('#') ? topic : `#${topic}`,
        max_results: 100,
        'tweet.fields': 'created_at,public_metrics'
      }
    });

    if (response.data.data) {
      const tweets = response.data.data;
      const metrics = analyzeTweetMetrics(tweets);
      return {
        source: 'Twitter',
        volume: metrics.totalEngagement,
        trend: metrics.trend,
        data: metrics.hourlyData
      };
    }
  } catch (error) {
    handleTwitterError(error);
  }
  
  return generateFallbackData(topic);
}

function analyzeTweetMetrics(tweets) {
  const hourlyData = {};
  let totalEngagement = 0;

  for (const tweet of tweets) {
    const hour = new Date(tweet.created_at).getHours();
    const engagement = 
      (tweet.public_metrics?.like_count || 0) +
      (tweet.public_metrics?.retweet_count || 0) +
      (tweet.public_metrics?.reply_count || 0);
    
    totalEngagement += engagement;
    hourlyData[hour] = (hourlyData[hour] || 0) + engagement;
  }

  const trend = calculateTrend(Object.values(hourlyData));

  return { totalEngagement, trend, hourlyData };
}

// ==================== GOOGLE TRENDS API ====================
export async function getGoogleTrends(topic) {
  try {
    const keyword = topic.replace('#', '').trim();
    
    // Skip if keyword is too short or empty
    if (!keyword || keyword.length < 2) {
      console.log('Google Trends: Keyword too short:', keyword);
      return generateFallbackData(topic);
    }
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`🔍 Fetching Google Trends for: "${keyword}"`);
    
    // Request options for better reliability
    const options = {
      keyword,
      startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endTime: new Date(),
      geo: '', // Worldwide
      hl: 'en-US',
      timezone: 0
    };

    const result = await googleTrends.interestOverTime(options);

    // Validate response
    if (!result || typeof result !== 'string') {
      throw new Error('Invalid response from Google Trends');
    }

    // Parse JSON carefully
    let data;
    try {
      data = JSON.parse(result);
    } catch (parseError) {
      console.log('⚠️  Google Trends: JSON parse error, likely rate limited');
      console.log(`   Error details: ${parseError.message}`);
      return await handleGoogleTrendsRateLimit(keyword, topic);
    }
    
    // Extract timeline data
    if (data.default?.timelineData && data.default.timelineData.length > 0) {
      const timeline = data.default.timelineData;
      
      // Extract values properly
      const volumes = timeline.map(item => {
        if (item.value && Array.isArray(item.value)) {
          return Number.parseInt(item.value[0], 10) || 0;
        }
        if (typeof item.value === 'number') {
          return Number.parseInt(item.value, 10) || 0;
        }
        return 0;
      });
      
      // Get timestamps
      const timestamps = timeline.map(item => {
        return new Date(Number.parseInt(item.time, 10) * 1000);
      });
      
      // Calculate metrics
      const currentVolume = volumes[volumes.length - 1];
      const avgVolume = volumes.reduce((sum, val) => sum + val, 0) / volumes.length;
      const trend = calculateTrend(volumes);
      const trendPercentage = (trend * 100).toFixed(2);
      
      // Extract related queries
      const relatedQueries = extractRelatedQueries(data.default);
      
      console.log(`✅ Google Trends SUCCESS:`);
      console.log(`   📊 Current Volume: ${currentVolume}`);
      console.log(`   📈 Average Volume: ${avgVolume.toFixed(2)}`);
      console.log(`   📉 Trend: ${trendPercentage}%`);
      console.log(`   📅 Data Points: ${volumes.length}`);
      
      return {
        source: 'Google Trends',
        volume: currentVolume > 0 ? currentVolume : avgVolume,
        averageVolume: avgVolume,
        trend,
        trendPercentage,
        data: volumes,
        timestamps,
        relatedQueries,
        keyword,
        dataPoints: volumes.length
      };
    }
    
    // No data available for this keyword
    console.log(`⚠️  Google Trends: No data available for "${keyword}"`);
    return generateFallbackData(topic);
    
  } catch (error) {
    console.error(`❌ Google Trends error: ${error.message}`);
    return generateFallbackData(topic);
  }
}

// Handle rate limiting with exponential backoff
async function handleGoogleTrendsRateLimit(keyword, originalTopic) {
  console.log('⏳ Google Trends rate limited. Waiting 3 seconds...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  try {
    // Try with simpler request (daily granularity instead of hourly)
    const result = await googleTrends.interestOverTime({
      keyword,
      startTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days
      granularTimeResolution: false // Daily data
    });
    
    const data = JSON.parse(result);
    
    if (data.default?.timelineData && data.default.timelineData.length > 0) {
      const volumes = data.default.timelineData.map(item => {
        const val = Array.isArray(item.value) ? item.value[0] : item.value;
        return Number.parseInt(val, 10) || 0;
      });
      
      const recentVolumes = volumes.slice(-7); // Last 7 days
      const currentVolume = recentVolumes[recentVolumes.length - 1];
      const avgVolume = recentVolumes.reduce((sum, val) => sum + val, 0) / recentVolumes.length;
      const trend = calculateTrend(recentVolumes);
      
      console.log(`✅ Google Trends SUCCESS (retry with daily data)`);
      console.log(`   📊 Current Volume: ${currentVolume}`);
      
      return {
        source: 'Google Trends',
        volume: currentVolume > 0 ? currentVolume : avgVolume,
        trend,
        data: recentVolumes,
        keyword
      };
    }
  } catch (retryError) {
    console.log('❌ Google Trends retry failed, using fallback');
    console.log(`   Error details: ${retryError.message}`);
  }
  
  return generateFallbackData(originalTopic);
}

// Extract related queries from Google Trends data
function extractRelatedQueries(defaultData) {
  const queries = [];
  
  if (defaultData.rankedList) {
    for (const list of defaultData.rankedList) {
      if (list.rankedKeyword) {
        const topQueries = list.rankedKeyword
          .slice(0, 5)
          .map(item => item.query || item.topic?.title)
          .filter(Boolean);
        queries.push(...topQueries);
      }
    }
  }
  
  return queries.slice(0, 5); // Return top 5 unique queries
}

// ==================== REDDIT API ====================
export async function getRedditTrends(topic) {
  try {
    const redditConfig = {
      userAgent: process.env.REDDIT_USER_AGENT || 'TrendSphere/1.0',
      clientId: process.env.REDDIT_CLIENT_ID,
      clientSecret: process.env.REDDIT_CLIENT_SECRET,
      username: process.env.REDDIT_USERNAME,
      password: process.env.REDDIT_PASSWORD
    };

    if (!redditConfig.clientId || !redditConfig.clientSecret) {
      console.log('Reddit API not configured, using fallback data');
      return generateFallbackData(topic);
    }

    const reddit = new Snoowrap(redditConfig);
    const keyword = topic.replace('#', '');
    
    // Search Reddit posts
    const posts = await reddit.search({
      query: keyword,
      time: 'week',
      sort: 'hot',
      limit: 100
    });

    const metrics = analyzeRedditPosts(posts);
    
    return {
      source: 'Reddit',
      volume: metrics.totalScore,
      trend: metrics.trend,
      data: metrics.dailyScores,
      topSubreddits: metrics.topSubreddits
    };
  } catch (error) {
    console.error('Reddit API error:', error.message);
  }
  
  return generateFallbackData(topic);
}

function analyzeRedditPosts(posts) {
  const dailyScores = {};
  const subreddits = {};
  let totalScore = 0;

  for (const post of posts) {
    const day = Math.floor((Date.now() - post.created_utc * 1000) / (24 * 60 * 60 * 1000));
    const score = post.score + post.num_comments;
    
    totalScore += score;
    dailyScores[day] = (dailyScores[day] || 0) + score;
    subreddits[post.subreddit.display_name] = (subreddits[post.subreddit.display_name] || 0) + 1;
  }

  const trend = calculateTrend(Object.values(dailyScores));
  const topSubreddits = Object.entries(subreddits)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name);

  return { totalScore, trend, dailyScores, topSubreddits };
}

// Helper function to calculate weighted trend
function calculateWeightedTrend(google, twitter, reddit, news) {
  const weights = {
    google: google?.source ? 0.5 : 0,
    twitter: (ENABLE_TWITTER && twitter?.source) ? 0.25 : 0,
    news: news?.source ? 0.15 : 0,
    reddit: reddit?.source ? 0.1 : 0
  };
  
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
  if (totalWeight === 0) return 0;
  
  return (
    (google?.trend || 0) * weights.google +
    (twitter?.trend || 0) * weights.twitter +
    (news?.trend || 0) * weights.news +
    (reddit?.trend || 0) * weights.reddit
  ) / totalWeight;
}

// Helper function to process Google Trends as primary source
function processGoogleTrendsPrimary(google, twitter, reddit, news) {
  console.log('\n🎯 Using Google Trends as primary data source');
  
  const combinedVolume = google.volume;
  
  // Use real Google Trends data if available, otherwise generate
  const historicalData = google.data && google.data.length > 0 
    ? interpolateToHourly(google.data, google.timestamps)
    : generateHistoricalData(google.volume, google.trend);
  
  const avgTrend = calculateWeightedTrend(google, twitter, reddit, news);
  
  return { combinedVolume, historicalData, avgTrend };
}

// Helper function to process fallback sources
function processFallbackSources(google, twitter, reddit, news) {
  console.log('\n⚠️  Google Trends not available, using combined fallback');
  
  const weights = {
    twitter: (ENABLE_TWITTER && twitter?.source) ? 0.45 : 0,
    news: news?.source ? 0.25 : 0,
    google: google?.source ? 0.2 : 0,
    reddit: reddit?.source ? 0.1 : 0
  };
  
  let combinedVolume = 
    (twitter.volume || 0) * weights.twitter +
    (news.volume || 0) * weights.news +
    (google.volume || 0) * weights.google +
    (reddit.volume || 0) * weights.reddit;
    
  if (combinedVolume === 0) {
    combinedVolume = 50; // Default fallback volume
  }
  
  const trends = [twitter?.trend, news?.trend, google?.trend, reddit?.trend]
    .filter(t => t !== undefined);
  const avgTrend = trends.length > 0 
    ? trends.reduce((sum, t) => sum + t, 0) / trends.length 
    : 0;
  
  // Use real data if available, otherwise generate with trend
  const historicalData = generateHistoricalData(combinedVolume, avgTrend);
  
  return { combinedVolume, historicalData, avgTrend };
}

// Helper function to log active sources
function logActiveSources(google, twitter, reddit, news, sourceCount) {
  console.log(`\n📊 Active data sources: ${sourceCount}/4`);
  if (google?.source) console.log('   ✅ Google Trends');
  else if (!google) console.log('   ⚠️ Google result was null/undefined');
  if (twitter?.source) console.log('   ✅ Twitter');
  else if (!twitter) console.log('   ⚠️ Twitter result was null/undefined');
  if (reddit?.source) console.log('   ✅ Reddit');
  else if (!reddit) console.log('   ⚠️ Reddit result was null/undefined');
  if (news?.source) console.log('   ✅ News');
  else if (!news) console.log('   ⚠️ News result was null/undefined or key not provided');
}

// Helper function to determine trend direction
function getTrendDirection(avgTrend) {
  if (avgTrend > 0.1) {
    return 'rising';
  } else if (avgTrend < -0.1) {
    return 'falling';
  } else {
    return 'stable';
  }
}

// Helper function to determine primary source
function getPrimarySource(google, sourceCount) {
  if (google?.source) {
    return 'Google Trends';
  } else if (sourceCount > 0) {
    return 'Multiple Sources';
  } else {
    return 'Simulated Data';
  }
}

// Helper function to log analysis results
function logAnalysisResults(combinedVolume, trendDirection, trendPercentage, confidence) {
  console.log(`\n📈 Analysis Results:`);
  console.log(`   Current Volume: ${Math.round(combinedVolume)}`);
  console.log(`   Trend Direction: ${trendDirection}`);
  console.log(`   Trend Percentage: ${trendPercentage}%`);
  console.log(`   Confidence: ${confidence}%`);
  console.log('='.repeat(50) + '\n');
}

// ==================== AGGREGATED TRENDS ====================
export async function getAggregatedTrends(topic) {
  console.log(`\n🔍 Fetching aggregated trends for: ${topic}`);
  console.log('='.repeat(50));
  
  // Fetch from all sources in parallel
  const [twitter, google, reddit, news] = await Promise.all([
    getTwitterTrends(topic),
    getGoogleTrends(topic),
    getRedditTrends(topic),
    getNewsTrends(topic)
  ]);

  // Count active sources
  const activeSources = [twitter, google, reddit, news].filter(s => s?.source);
  const sourceCount = activeSources.length;
  
  logActiveSources(google, twitter, reddit, news, sourceCount);
  
  // Process data based on available sources
  const result = google?.source === 'Google Trends'
    ? processGoogleTrendsPrimary(google, twitter, reddit, news)
    : processFallbackSources(google, twitter, reddit, news);
  
  const { combinedVolume, historicalData, avgTrend } = result;

  // Generate 24-hour prediction using Prophet ML (with fallback)
  const predictionResult = await getPredictionWithFallback(historicalData, avgTrend, 24);
  const predictedData = predictionResult.predictions;
  const predictedLower = predictionResult.lowerBound || null;
  const predictedUpper = predictionResult.upperBound || null;
  
  // Calculate confidence (Prophet gives higher confidence)
  let confidence = calculateConfidence([twitter, google, reddit, news]);
  if (predictionResult.method === 'Prophet ML') {
    confidence = Math.min(95, predictionResult.confidence);
  }
  
  // Determine trend direction and percentage
  const trendDirection = getTrendDirection(avgTrend);
  const trendPercentage = (avgTrend * 100).toFixed(2);
  
  logAnalysisResults(combinedVolume, trendDirection, trendPercentage, confidence);
  
  // Log prediction method
  if (predictionResult.method) {
    console.log(`   🤖 Prediction Method: ${predictionResult.method}`);
  }

  const primarySource = getPrimarySource(google, sourceCount);

  return {
    topic,
    sources: {
      twitter: twitter?.source ? twitter : null,
      google: google?.source ? google : null,
      reddit: reddit?.source ? reddit : null,
      news: news?.source ? news : null
    },
    currentVolume: Math.round(combinedVolume),
    trend: trendDirection,
    trendPercentage,
    historicalData,
    predictedData,
    predictedLowerBound: predictedLower,
    predictedUpperBound: predictedUpper,
    confidence,
    activeSourceCount: sourceCount,
    primarySource
  };
}

// ==================== UTILITY FUNCTIONS ====================
function calculateTrend(dataPoints) {
  if (dataPoints.length < 2) return 0;
  
  const recent = dataPoints.slice(-3);
  const older = dataPoints.slice(0, 3);
  
  const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
  const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
  
  if (olderAvg === 0) return recentAvg > 0 ? 1 : 0;
  
  return (recentAvg - olderAvg) / olderAvg;
}

function generateHistoricalData(currentVolume, trendValue = 0) {
  const data = [];
  const hours = 168; // 7 days
  
  // Use topic-specific seed based on volume to create variation
  const seed = currentVolume % 1000;
  const basePattern = Math.sin(seed) > 0 ? 1 : -1;
  
  // Create more realistic variation based on trend
  const trendFactor = trendValue || 0;
  const volatility = 0.15 + Math.abs(trendFactor) * 0.1; // Higher volatility for trending topics
  
  let currentVal = currentVolume * 0.8; // Start at 80% of current
  
  for (let i = 0; i < hours; i++) {
    // Daily cycle (24h pattern) + weekly pattern + trend + noise
    const dailyCycle = Math.sin(i / 24 * Math.PI * 2) * 0.15;
    const weeklyCycle = Math.sin(i / 168 * Math.PI * 2) * 0.1 * basePattern;
    const trendEffect = (trendFactor * i / hours) * 0.5;
    const noise = (Math.random() - 0.5) * volatility;
    
    const change = dailyCycle + weeklyCycle + trendEffect + noise;
    currentVal = Math.max(10, currentVal * (1 + change));
    
    data.push(Math.round(currentVal));
  }
  
  // Normalize to end near currentVolume
  const endValue = data.at(-1);
  const scaleFactor = currentVolume / endValue;
  return data.map(v => Math.round(v * scaleFactor));
}

// Helper to find surrounding data point indices
function findSurroundingIndices(timestamps, targetTime) {
  let beforeIdx = -1;
  let afterIdx = -1;
  
  for (let i = 0; i < timestamps.length; i++) {
    const pointTime = timestamps[i].getTime();
    if (pointTime <= targetTime) beforeIdx = i;
    if (pointTime >= targetTime && afterIdx === -1) afterIdx = i;
  }
  
  return { beforeIdx, afterIdx };
}

// Helper to calculate interpolated value
function calculateInterpolatedValue(dataPoints, timestamps, beforeIdx, afterIdx, targetTime) {
  if (beforeIdx >= 0 && afterIdx >= 0 && beforeIdx !== afterIdx) {
    const beforeTime = timestamps[beforeIdx].getTime();
    const afterTime = timestamps[afterIdx].getTime();
    const beforeVal = dataPoints[beforeIdx];
    const afterVal = dataPoints[afterIdx];
    
    const ratio = (targetTime - beforeTime) / (afterTime - beforeTime);
    return Math.round(beforeVal + (afterVal - beforeVal) * ratio);
  } else if (beforeIdx >= 0) {
    return dataPoints[beforeIdx];
  } else if (afterIdx >= 0) {
    return dataPoints[afterIdx];
  }
  return dataPoints[0];
}

// New function: Interpolate sparse Google Trends data to hourly
function interpolateToHourly(dataPoints, timestamps) {
  if (!dataPoints || dataPoints.length < 2) {
    return generateHistoricalData(dataPoints?.[0] || 50);
  }
  
  const hourlyData = [];
  const totalHours = 168;
  
  // If we have timestamps, use them for interpolation
  if (timestamps && timestamps.length === dataPoints.length) {
    const now = Date.now();
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
    
    for (let hour = 0; hour < totalHours; hour++) {
      const targetTime = sevenDaysAgo + (hour * 60 * 60 * 1000);
      const { beforeIdx, afterIdx } = findSurroundingIndices(timestamps, targetTime);
      const value = calculateInterpolatedValue(dataPoints, timestamps, beforeIdx, afterIdx, targetTime);
      hourlyData.push(value);
    }
    
    return hourlyData;
  }
  
  // Simple linear interpolation if no timestamps
  const step = (dataPoints.length - 1) / (totalHours - 1);
  for (let i = 0; i < totalHours; i++) {
    const index = i * step;
    const lowerIdx = Math.floor(index);
    const upperIdx = Math.ceil(index);
    
    if (lowerIdx === upperIdx || upperIdx >= dataPoints.length) {
      hourlyData.push(dataPoints[lowerIdx]);
    } else {
      const ratio = index - lowerIdx;
      const interpolated = dataPoints[lowerIdx] + (dataPoints[upperIdx] - dataPoints[lowerIdx]) * ratio;
      hourlyData.push(Math.round(interpolated));
    }
  }
  
  return hourlyData;
}

function generatePrediction(historical, trend) {
  const lastValue = historical[historical.length - 1];
  const prediction = [];
  
  for (let i = 1; i <= 24; i++) {
    const trendEffect = trend * i * 0.05;
    const seasonality = Math.sin(i / 4) * 0.1;
    const noise = (Math.random() - 0.5) * 0.1;
    
    const predicted = lastValue * (1 + trendEffect + seasonality + noise);
    prediction.push(Math.max(0, Math.round(predicted)));
  }
  
  return prediction;
}

function calculateConfidence(sources) {
  const activeSources = sources.filter(s => s?.source).length;
  const baseConfidence = 40;
  const perSourceBonus = 15;
  
  return Math.min(95, baseConfidence + (activeSources * perSourceBonus));
}

function generateFallbackData(topic) {
  const baseVolume = 30 + Math.floor(Math.random() * 70);
  const trend = (Math.random() - 0.5) * 0.4;
  
  return {
    source: null,
    volume: baseVolume,
    trend,
    data: Array.from({ length: 24 }, () => 
      Math.max(0, baseVolume + (Math.random() - 0.5) * 20)
    )
  };
}

// ==================== GLOBAL TRENDING TOPICS ====================
export async function getGlobalTrending() {
  try {
    // Try to get Twitter trending topics if enabled
    if (ENABLE_TWITTER && process.env.TWITTER_BEARER_TOKEN) {
      const response = await axios.get('https://api.twitter.com/2/trends/place', {
        headers: { 'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}` },
        params: { id: 1 } // Worldwide
      });
      
      if (response.data?.data) {
        return response.data.data.slice(0, 10);
      }
    }
    
    // Fallback to predefined trending topics
    return [
      { name: '#AI', volume: 1250000, change: '+45%' },
      { name: '#ClimateChange', volume: 890000, change: '+23%' },
      { name: '#Crypto', volume: 750000, change: '-12%' },
      { name: '#SpaceX', volume: 620000, change: '+67%' },
      { name: '#TechNews', volume: 550000, change: '+15%' }
    ];
  } catch (error) {
    console.error('Error fetching global trends:', error.message);
    return [];
  }
}
