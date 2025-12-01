export interface NewsSourceConfig {
    id: string
    name: string
    url: string
    bias: 'LEFT' | 'RIGHT' | 'CENTER'
    enabled: boolean
}

export const DEFAULT_SOURCES: NewsSourceConfig[] = [
    // LEFT / PROGRESSIVE SOURCES
    {
        id: 'cnn',
        name: 'CNN',
        url: 'http://rss.cnn.com/rss/cnn_topstories.rss',
        bias: 'LEFT',
        enabled: true
    },
    {
        id: 'cnbc',
        name: 'CNBC',
        url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html',
        bias: 'LEFT',
        enabled: true
    },
    {
        id: 'nytimes',
        name: 'New York Times',
        url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
        bias: 'LEFT',
        enabled: true
    },
    {
        id: 'abc',
        name: 'ABC News',
        url: 'https://abcnews.go.com/abcnews/topstories',
        bias: 'LEFT',
        enabled: true
    },
    {
        id: 'cbs',
        name: 'CBS News',
        url: 'https://www.cbsnews.com/latest/rss/main',
        bias: 'LEFT',
        enabled: true
    },

    // RIGHT / CONSERVATIVE SOURCES
    {
        id: 'fox',
        name: 'Fox News',
        url: 'http://feeds.foxnews.com/foxnews/latest',
        bias: 'RIGHT',
        enabled: true
    },
    {
        id: 'breitbart',
        name: 'Breitbart',
        url: 'http://feeds.feedburner.com/breitbart',
        bias: 'RIGHT',
        enabled: true
    },
    {
        id: 'newsmax',
        name: 'Newsmax',
        url: 'https://www.newsmax.com/rss/Headline/76',
        bias: 'RIGHT',
        enabled: true
    },
    {
        id: 'dailywire',
        name: 'The Daily Wire',
        url: 'https://www.dailywire.com/feeds/rss.xml',
        bias: 'RIGHT',
        enabled: true
    },
    {
        id: 'nationalreview',
        name: 'National Review',
        url: 'https://www.nationalreview.com/feed/',
        bias: 'RIGHT',
        enabled: true
    },
    {
        id: 'nypost',
        name: 'New York Post',
        url: 'https://nypost.com/feed/',
        bias: 'RIGHT',
        enabled: true
    },
    {
        id: 'federalist',
        name: 'The Federalist',
        url: 'https://thefederalist.com/feed/',
        bias: 'RIGHT',
        enabled: true
    },
    {
        id: 'washexaminer',
        name: 'Washington Examiner',
        url: 'https://www.washingtonexaminer.com/feed',
        bias: 'RIGHT',
        enabled: true
    },

    // CENTER / BUSINESS (Kept for balance and context)
    {
        id: 'reuters',
        name: 'Reuters',
        url: 'https://www.reutersagency.com/feed/',
        bias: 'CENTER',
        enabled: true
    },
    {
        id: 'wsj',
        name: 'Wall Street Journal',
        url: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml',
        bias: 'CENTER',
        enabled: true
    }
]
