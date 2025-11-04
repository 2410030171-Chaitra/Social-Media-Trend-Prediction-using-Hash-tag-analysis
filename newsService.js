import axios from 'axios';

/**
 * Fetch news articles from NewsAPI and normalize into TrendSphere data shape
 * Requires environment variable NEWSAPI_KEY
 */
export async function getNewsTrends(topic) {
  try {
    const apiKey = process.env.NEWSAPI_KEY;
    if (!apiKey) {
      console.log('NewsAPI key not configured, using fallback data');
      return generateFallbackData(topic);
    }

    const q = topic.replace('#', '').trim();
    if (!q) return generateFallbackData(topic);

    // Query last 7 days
    const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const resp = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q,
        from,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 100
      },
      headers: { 'Authorization': apiKey }
    });

    const articles = resp.data?.articles || [];

    // Build daily counts (last 7 days)
    const dayCounts = Array.from({ length: 7 }, () => 0);
    const now = Date.now();
    for (const a of articles) {
      const t = new Date(a.publishedAt).getTime();
      const daysAgo = Math.floor((now - t) / (24 * 60 * 60 * 1000));
      if (daysAgo >= 0 && daysAgo < 7) dayCounts[6 - daysAgo] += 1; // newest at end
    }

    const volume = articles.length;
    const recent = dayCounts.slice(-2);
    const lastIndex = dayCounts.length - 2;
    const trend = recent.length >= 2 && dayCounts.at(lastIndex) > 0
      ? (recent.at(1) - recent.at(0)) / Math.max(1, recent.at(0))
      : 0;

    const topArticles = articles.slice(0, 8).map(a => ({
      title: a.title,
      source: a.source?.name,
      publishedAt: a.publishedAt,
      url: a.url
    }));

    return {
      source: 'News',
      volume,
      trend,
      data: dayCounts,
      topArticles,
      dataPoints: dayCounts.length
    };
  } catch (err) {
    console.error('NewsAPI error:', err.message || err);
    return generateFallbackData(topic);
  }
}

function generateFallbackData(topic) {
  const baseVolume = 10 + Math.floor(Math.random() * 50);
  return {
    source: null,
    volume: baseVolume,
    trend: (Math.random() - 0.5) * 0.2,
    data: Array.from({ length: 7 }, () => Math.max(0, baseVolume + (Math.random() - 0.5) * 10))
  };
}
