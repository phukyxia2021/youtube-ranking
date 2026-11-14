// Cấu hình kết nối Supabase từ file supabase.txt
const SUPABASE_CONFIG = {
    url: 'https://rgddiapkfdyrkyzldjve.supabase.co',
    publishableKey: 'sb_publishable_AFKSTK_Ms_usyYn4mYUaug_AUEaYyCX'
};

// Cấu hình YouTube Data API v3 từ file youtube.txt
const YOUTUBE_API_CONFIG = {
    endpoint: 'https://www.googleapis.com/youtube/v3/channels',
    part: 'snippet,statistics',
    apiKey: 'AIzaSyCgBhWHaYXD40n8wWztliO8Sm4mB78RvOs'
};

// Khởi tạo Supabase Client (nếu thư viện @supabase/supabase-js đã được nạp)
const supabaseClient = (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function')
    ? window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.publishableKey)
    : null;

// Dữ liệu mặc định (fallback) được trích xuất từ file data-channels.sql (21 kênh)
const CHANNELS_DATA = [
    {
        id: 'UCX6OQ3DkcsbYNE6H8uQQuVA',
        name: 'MrBeast',
        handle: '@MrBeast',
        avatar: 'default-channel-thumbnail.jpg',
        banner: 'default-channel-banner.jpg',
        subscribers: 375000000,
        subscribers_formatted: '375M',
        category: 'Entertainment',
        videos_count: 840,
        view_count: 0,
        description: 'Kênh giải trí lớn nhất thế giới của Jimmy Donaldson (MrBeast) với các thử thách quy mô lớn và hoạt động từ thiện.',
        url: 'https://youtube.com/@MrBeast',
        website: 'https://mrbeast.com',
        facebook: 'https://facebook.com/MrBeast6000',
        twitter: 'https://twitter.com/MrBeast',
        tiktok: 'https://tiktok.com/@mrbeast',
        published_at: '2012-02-20T00:00:00Z'
    },
    {
        id: 'UCq-Fj5jknLsUf-MWSy4_brA',
        name: 'T-Series',
        handle: '@tseries',
        avatar: 'tseries-channel-thumbnail.jpg',
        banner: 'default-channel-banner.jpg',
        subscribers: 285000000,
        subscribers_formatted: '285M',
        category: 'Music',
        videos_count: 21500,
        view_count: 0,
        description: 'Hãng thu âm và sản xuất phim hàng đầu Ấn Độ (Super Cassettes Industries Private Limited).',
        url: 'https://youtube.com/@tseries',
        website: 'https://tseries.com',
        facebook: 'https://facebook.com/tseriesmusic',
        twitter: 'https://twitter.com/TSeries',
        tiktok: null,
        published_at: '2006-03-13T00:00:00Z'
    },
    {
        id: 'UC-lHJZR3Gqxm24_Vd_AJ5Yw',
        name: 'PewDiePie',
        handle: '@PewDiePie',
        avatar: 'pewdiepie-channel-thumbnail.jpg',
        banner: 'default-channel-banner.jpg',
        subscribers: 111000000,
        subscribers_formatted: '111M',
        category: 'Game',
        videos_count: 4790,
        view_count: 0,
        description: 'Kênh YouTube cá nhân nổi tiếng của Felix Kjellberg chuyên về bình luận game, meme và vlog.',
        url: 'https://youtube.com/@PewDiePie',
        website: 'https://pewdiepie.com',
        facebook: 'https://facebook.com/pewdiepie',
        twitter: 'https://twitter.com/pewdiepie',
        tiktok: null,
        published_at: '2010-04-29T00:00:00Z'
    },
    {
        id: 'UCGCZAYq5Xxojl_tSXcVJhiQ',
        name: 'ANN News Channel',
        handle: '@ANNnewsCH',
        avatar: 'ann-news-channel-thumbnail.jpg',
        banner: 'default-channel-banner.jpg',
        subscribers: 3800000,
        subscribers_formatted: '3.8M',
        category: 'News',
        videos_count: 154000,
        view_count: 0,
        description: 'Kênh tin tức chính thức của mạng lưới All-Nippon News Network (TV Asahi) tại Nhật Bản.',
        url: 'https://youtube.com/@ANNnewsCH',
        website: 'https://news.tv-asahi.co.jp',
        facebook: null,
        twitter: 'https://twitter.com/tv_asahi_news',
        tiktok: null,
        published_at: '2009-07-07T00:00:00Z'
    },
    {
        id: 'UC8butISFwT-Wl7EV0hUK0BQ',
        name: 'FreeCodeCamp.org',
        handle: '@freecodecamp',
        avatar: 'freecodecamp-channel-thumbnail.jpg',
        banner: 'default-channel-banner.jpg',
        subscribers: 10200000,
        subscribers_formatted: '10.2M',
        category: 'Development',
        videos_count: 1850,
        view_count: 0,
        description: 'Cộng đồng mã nguồn mở giúp mọi người học lập trình miễn phí thông qua các khóa học chuyên sâu.',
        url: 'https://youtube.com/@freecodecamp',
        website: 'https://www.freecodecamp.org',
        facebook: null,
        twitter: 'https://twitter.com/freecodecamp',
        tiktok: null,
        published_at: '2014-12-16T00:00:00Z'
    },
    {
        id: 'UCJFZiqLm7iJ0vEM18y4_bWw',
        name: 'Hololive Ch. hololive-VTuber',
        handle: '@hololive',
        avatar: 'hololive-channel-thumbnail.jpg',
        banner: 'hololive-channel-banner.jpg',
        subscribers: 2500000,
        subscribers_formatted: '2.5M',
        category: 'VTuber',
        videos_count: 2100,
        view_count: 0,
        description: 'Kênh chính thức của nhóm nhạc thần tượng ảo VTuber Hololive Production thuộc COVER Corp.',
        url: 'https://youtube.com/@hololive',
        website: 'https://hololive.hololivepro.com',
        facebook: null,
        twitter: 'https://twitter.com/hololivetv',
        tiktok: 'https://tiktok.com/@hololive_eng',
        published_at: '2016-05-02T00:00:00Z'
    },
    {
        id: 'UC4YaOt1yT-ZeyB0OmxHgolA',
        name: 'Kizuna AI Channel',
        handle: '@KizunaAI',
        avatar: 'kizuna-ai-channel-thumbnail.jpg',
        banner: 'default-channel-banner.jpg',
        subscribers: 3000000,
        subscribers_formatted: '3.0M',
        category: 'VTuber',
        videos_count: 1100,
        view_count: 0,
        description: 'Virtual YouTuber (VTuber) tiên phong trên thế giới với khẩu hiệu kết nối mọi người qua AI.',
        url: 'https://youtube.com/@KizunaAI',
        website: 'https://kizunaai.com',
        facebook: null,
        twitter: 'https://twitter.com/aichan_nel',
        tiktok: 'https://tiktok.com/@kizunaai0630',
        published_at: '2016-10-19T00:00:00Z'
    },
    {
        id: 'UCott96qGP5ADmsB_yNQMvDA',
        name: 'Muse Vietnam',
        handle: '@MuseVN',
        avatar: 'musevn-channel-thumbnail.jpg',
        banner: 'default-channel-banner.jpg',
        subscribers: 1800000,
        subscribers_formatted: '1.8M',
        category: 'Entertainment',
        videos_count: 3200,
        view_count: 0,
        description: 'Kênh phát sóng Anime bản quyền chính thức của Muse Communication tại Việt Nam.',
        url: 'https://youtube.com/@MuseVN',
        website: null,
        facebook: 'https://facebook.com/museacg.vn',
        twitter: null,
        tiktok: null,
        published_at: '2020-05-15T00:00:00Z'
    },
    {
        id: 'UClOf1XXinvZsy4wKPAkro2A',
        name: 'PlayOverwatch',
        handle: '@PlayOverwatch',
        avatar: 'play-overwatch-channel-thumbnail.jpg',
        banner: 'default-channel-banner.jpg',
        subscribers: 3600000,
        subscribers_formatted: '3.6M',
        category: 'Game',
        videos_count: 890,
        view_count: 0,
        description: 'Kênh YouTube chính thức của tựa game bắn súng đồng đội Overwatch từ Blizzard Entertainment.',
        url: 'https://youtube.com/@PlayOverwatch',
        website: 'https://overwatch.blizzard.com',
        facebook: 'https://facebook.com/PlayOverwatch',
        twitter: 'https://twitter.com/PlayOverwatch',
        tiktok: null,
        published_at: '2014-11-07T00:00:00Z'
    },
    {
        id: 'UC9nK195uN_z_4L0Qj7x1l0w',
        name: 'SBS Drama',
        handle: '@sbsdrama',
        avatar: 'sbs-channel-thumbnail.jpg',
        banner: 'default-channel-banner.jpg',
        subscribers: 7200000,
        subscribers_formatted: '7.2M',
        category: 'Entertainment',
        videos_count: 45000,
        view_count: 0,
        description: 'Kênh phim truyền hình chính thức của đài truyền hình SBS Hàn Quốc.',
        url: 'https://youtube.com/@sbsdrama',
        website: 'https://www.sbs.co.kr',
        facebook: 'https://facebook.com/sbsNOW',
        twitter: null,
        tiktok: null,
        published_at: '2012-08-22T00:00:00Z'
    },
    {
        id: 'UCuP2vJ6_0nB9H_P1o5_P3wA',
        name: 'Vexsper',
        handle: '@vexsper',
        avatar: 'vexsper-channel-thumbnail.jpg',
        banner: 'default-channel-banner.jpg',
        subscribers: 500000,
        subscribers_formatted: '500K',
        category: 'Development',
        videos_count: 150,
        view_count: 0,
        description: 'Kênh chia sẻ kiến thức lập trình, phát triển phần mềm và công nghệ hiện đại.',
        url: 'https://youtube.com/@vexsper',
        website: null,
        facebook: null,
        twitter: 'https://twitter.com/vexsper',
        tiktok: null,
        published_at: '2021-03-10T00:00:00Z'
    },
    {
        id: 'UCVia_crjzJylRmGq7SHTiaw',
        name: 'Hearthstone',
        handle: '@Hearthstone',
        avatar: 'hearthstone-channel-thumbnail.jpg',
        banner: 'hearthstone-channel-banner.jpg',
        subscribers: 496000,
        subscribers_formatted: '496K',
        category: 'Game',
        videos_count: 1680,
        view_count: 0,
        description: 'Kênh chính thức của trò chơi thẻ bài chiến thuật Hearthstone lấy bối cảnh vũ trụ Warcraft.',
        url: 'https://youtube.com/@Hearthstone',
        website: 'https://us.shop.battle.net/en-us/family/hearthstone',
        facebook: null,
        twitter: null,
        tiktok: null,
        published_at: '2013-03-22T00:00:00Z'
    },
    {
        id: 'UCkWnwVAYGshTEVDPZ451kBQ',
        name: 'essie ch.',
        handle: '@essiech',
        avatar: 'essie-channel-thumbnail.jpg',
        banner: 'essie-channel-banner.jpg',
        subscribers: 75400,
        subscribers_formatted: '75.4K',
        category: 'VTuber',
        videos_count: 497,
        view_count: 0,
        description: 'Kênh sáng tạo nội dung và stream của VTuber essie.',
        url: 'https://www.youtube.com/@essiech',
        website: null,
        facebook: null,
        twitter: 'https://x.com/essie_ch',
        tiktok: null,
        published_at: '2021-07-01T00:00:00Z'
    },
    {
        id: 'UCp-9F3MEliOQ2sbAnG0OqLQ',
        name: 'Gawr Gura Ch. hololive-EN',
        handle: '@GawrGura',
        avatar: 'gawr-gura-channel-thumbnail.jpg',
        banner: 'gawr-gura-channel-banner.jpg',
        subscribers: 4590000,
        subscribers_formatted: '4.59M',
        category: 'VTuber',
        videos_count: 565,
        view_count: 0,
        description: 'Kênh VTuber Gawr Gura thuộc thế hệ Hololive English -Myth-.',
        url: 'https://www.youtube.com/@GawrGura',
        website: null,
        facebook: null,
        twitter: 'https://x.com/gawrgura',
        tiktok: null,
        published_at: '2020-07-16T00:00:00Z'
    },
    {
        id: 'UCCzUftO8KOVkV4wQG1vkU1g',
        name: 'Marine Ch. 宝鐘マリン',
        handle: '@HoushouMarine',
        avatar: 'houshou-marine-channel-thumbnail.jpg',
        banner: 'houshou-marine-channel-banner.jpg',
        subscribers: 4440000,
        subscribers_formatted: '4.44M',
        category: 'VTuber',
        videos_count: 565,
        view_count: 0,
        description: 'Kênh chính thức của thuyền trưởng Houshou Marine thuộc Hololive Fantasy (Gen 3).',
        url: 'https://www.youtube.com/@HoushouMarine',
        website: null,
        facebook: null,
        twitter: null,
        tiktok: null,
        published_at: '2019-07-22T00:00:00Z'
    },
    {
        id: 'UC5CwaMl1eIgY8h02uZw7u8A',
        name: 'Suisei Channel',
        handle: '@HoshimachiSuisei',
        avatar: 'hoshimachi-suisei-channel-thumbnail.jpg',
        banner: 'hoshimachi-suisei-channel-banner.jpg',
        subscribers: 75400,
        subscribers_formatted: '75.4K',
        category: 'VTuber',
        videos_count: 497,
        view_count: 0,
        description: 'Kênh âm nhạc và livestream của thần tượng ảo Hoshimachi Suisei thuộc Hololive Gen 0.',
        url: 'https://www.youtube.com/@HoshimachiSuisei',
        website: null,
        facebook: null,
        twitter: null,
        tiktok: null,
        published_at: '2018-03-18T00:00:00Z'
    },
    {
        id: 'UC1DCedRgGHBdm81E1llLhOQ',
        name: 'Pekora Ch. 兎田ぺこら',
        handle: '@usadapekora',
        avatar: 'usada-pekora-channel-thumbnail.jpg',
        banner: 'usada-pekora-channel-banner.jpg',
        subscribers: 75400,
        subscribers_formatted: '75.4K',
        category: 'VTuber',
        videos_count: 497,
        view_count: 0,
        description: 'Kênh livestream game và giải trí của Usada Pekora thuộc Hololive Fantasy (Gen 3).',
        url: 'https://www.youtube.com/@usadapekora',
        website: null,
        facebook: null,
        twitter: null,
        tiktok: null,
        published_at: '2019-07-07T00:00:00Z'
    },
    {
        id: 'UC-hM6YJuNYVAmUWxeIr9FeA',
        name: 'Miko Ch. さくらみこ',
        handle: '@SakuraMiko',
        avatar: 'sakura-miko-channel-thumbnail.jpg',
        banner: 'sakura-miko-channel-banner.jpg',
        subscribers: 75400,
        subscribers_formatted: '75.4K',
        category: 'VTuber',
        videos_count: 497,
        view_count: 0,
        description: 'Kênh chính thức của Elite VTuber Sakura Miko thuộc Hololive Gen 0.',
        url: 'https://www.youtube.com/@usadapekora',
        website: null,
        facebook: null,
        twitter: null,
        tiktok: null,
        published_at: '2018-04-25T00:00:00Z'
    },
    {
        id: 'UC7jHm3zfoSZWV5d1cxfJ-BA',
        name: 'Ngọc Trinh Official',
        handle: '@ngoctrinhofficial9626',
        avatar: 'ngoc-trinh-channel-thumbnail.jpg',
        banner: 'ngoc-trinh-channel-banner.jpg',
        subscribers: 75400,
        subscribers_formatted: '75.4K',
        category: 'Entertainment',
        videos_count: 341,
        view_count: 0,
        description: 'Kênh vlog đời sống, thời trang và giải trí chính thức của Ngọc Trinh.',
        url: 'https://www.youtube.com/@ngoctrinhofficial9626',
        website: null,
        facebook: null,
        twitter: null,
        tiktok: null,
        published_at: '2019-02-14T00:00:00Z'
    },
    {
        id: 'UCfdNM3NAhaBOXCafH7krzrA',
        name: 'The Infographics Show',
        handle: '@TheInfographicsShow',
        avatar: 'the-infographics-show-channel-thumbnail.jpg',
        banner: 'the-infographics-show-channel-banner.jpg',
        subscribers: 75400,
        subscribers_formatted: '75.4K',
        category: 'News',
        videos_count: 6391,
        view_count: 0,
        description: 'Kênh video đồ họa thông tin (infographics) giải thích kiến thức, lịch sử và tin tức thú vị.',
        url: 'https://www.youtube.com/@TheInfographicsShow',
        website: null,
        facebook: null,
        twitter: null,
        tiktok: null,
        published_at: '2011-04-06T00:00:00Z'
    },
    {
        id: 'UCTF0ldaORTbCfx2ahvFfYWg',
        name: 'Phê Game',
        handle: '@daylaphegame',
        avatar: 'phe-game-channel-thumbnail.jpg',
        banner: 'phe-game-channel-banner.jpg',
        subscribers: 75400,
        subscribers_formatted: '75.4K',
        category: 'Entertainment',
        videos_count: 6391,
        view_count: 0,
        description: 'Kênh phân tích cốt truyện game, đánh giá game và tin tức làng game chuyên sâu tại Việt Nam.',
        url: 'https://www.youtube.com/@daylaphegame',
        website: null,
        facebook: null,
        twitter: null,
        tiktok: null,
        published_at: '2020-01-12T00:00:00Z'
    },
    {
        id: 'UCabsTV34JwALXKGMqHpvUiA',
        name: 'VTV24',
        handle: '@vtv24',
        avatar: 'default-channel-thumbnail.jpg',
        banner: 'default-channel-banner.jpg',
        subscribers: 7010000,
        subscribers_formatted: '7.01M',
        category: 'News',
        videos_count: 61395,
        view_count: 6038805887,
        description: 'Kênh YouTube chính thức của Ban Thời sự - Đài Truyền Hình Việt Nam',
        url: 'https://youtube.com/@vtv24',
        website: null,
        facebook: null,
        twitter: null,
        tiktok: null,
        published_at: '2016-02-17T07:33:02Z'
    },
    {
        id: 'UC7c3Kb6jYCRj4JOHHZTxKsQ',
        name: 'GitHub',
        handle: '@github',
        avatar: 'default-channel-thumbnail.jpg',
        banner: 'default-channel-banner.jpg',
        subscribers: 710000,
        subscribers_formatted: '710K',
        category: 'Development',
        videos_count: 3081,
        view_count: 43195246,
        description: 'GitHub is the AI-powered developer platform to build, scale, and deliver secure software.',
        url: 'https://youtube.com/@github',
        website: null,
        facebook: null,
        twitter: null,
        tiktok: null,
        published_at: '2010-07-28T18:50:31Z'
    },
    {
        id: 'UCFtEEv80fQVKkD4h1PF-Xqw',
        name: 'Microsoft',
        handle: '@microsoft',
        avatar: 'default-channel-thumbnail.jpg',
        banner: 'default-channel-banner.jpg',
        subscribers: 2170000,
        subscribers_formatted: '2.17M',
        category: 'Development',
        videos_count: 796,
        view_count: 212790975,
        description: 'Our mission is to empower every person and every organization on the planet to achieve more.',
        url: 'https://youtube.com/@microsoft',
        website: null,
        facebook: null,
        twitter: null,
        tiktok: null,
        published_at: '2006-02-13T05:21:44Z'
    },
    {
        id: 'UCdoadna9HFHsxXWhafhNvKw',
        name: 'AWS Events',
        handle: '@awseventschannel',
        avatar: 'default-channel-thumbnail.jpg',
        banner: 'default-channel-banner.jpg',
        subscribers: 185000,
        subscribers_formatted: '185K',
        category: 'Development',
        videos_count: 13099,
        view_count: 76330148,
        description: 'The official YouTube channel for AWS Events and Webinars.',
        url: 'https://youtube.com/@awseventschannel',
        website: null,
        facebook: null,
        twitter: null,
        tiktok: null,
        published_at: '2013-12-16T22:33:33Z'
    },
    {
        id: 'UCV03SRZXJEz-hchIAogeJOg',
        name: 'Claude',
        handle: '@claude',
        avatar: 'default-channel-thumbnail.jpg',
        banner: 'default-channel-banner.jpg',
        subscribers: 747000,
        subscribers_formatted: '747K',
        category: 'Development',
        videos_count: 248,
        view_count: 361287754,
        description: 'The AI for problem solvers. Built by Anthropic to be safe, accurate, and secure.',
        url: 'https://youtube.com/@claude',
        website: null,
        facebook: null,
        twitter: null,
        tiktok: null,
        published_at: '2026-01-22T16:44:50.349Z'
    },
    {
        id: 'UCK8sQmJBp8GCxrOtXWBpyEA',
        name: 'Google',
        handle: '@google',
        avatar: 'default-channel-thumbnail.jpg',
        banner: 'default-channel-banner.jpg',
        subscribers: 14700000,
        subscribers_formatted: '14.7M',
        category: 'Development',
        videos_count: 2797,
        view_count: 6754676963,
        description: 'Here to help. Reimagining how AI can make your life better and help you explore your creativity.',
        url: 'https://youtube.com/@google',
        website: null,
        facebook: null,
        twitter: null,
        tiktok: null,
        published_at: '2005-09-18T22:37:10Z'
    },
    {
        id: 'UCs5Y5_7XK8HLDX0SLNwkd3w',
        name: 'Visual Studio Code',
        handle: '@code',
        avatar: 'default-channel-thumbnail.jpg',
        banner: 'default-channel-banner.jpg',
        subscribers: 1040000,
        subscribers_formatted: '1.04M',
        category: 'Development',
        videos_count: 1569,
        view_count: 98336849,
        description: 'The open source AI code editor. Free download and documentation: https://code.visualstudio.com',
        url: 'https://youtube.com/@code',
        website: null,
        facebook: null,
        twitter: null,
        tiktok: null,
        published_at: '2016-05-27T18:11:37Z'
    },
    {
        id: 'UClyA28-01x4z60eWQ2kiNbA',
        name: 'Sơn Tùng M-TP Official',
        handle: '@sontungmtp',
        avatar: 'default-channel-thumbnail.jpg',
        banner: 'default-channel-banner.jpg',
        subscribers: 11900000,
        subscribers_formatted: '11.9M',
        category: 'Music',
        videos_count: 221,
        view_count: 3781654917,
        description: 'Son Tung M-TP Official YouTube Channel - Property of Sơn Tùng M-TP',
        url: 'https://youtube.com/@sontungmtp',
        website: null,
        facebook: null,
        twitter: null,
        tiktok: null,
        published_at: '2015-01-21T02:38:32Z'
    },
    {
        id: 'UChUJa1JyBc7Lc4orkiNKKQg',
        name: 'J97',
        handle: '@j97imjack',
        avatar: 'default-channel-thumbnail.jpg',
        banner: 'default-channel-banner.jpg',
        subscribers: 6500000,
        subscribers_formatted: '6.5M',
        category: 'Music',
        videos_count: 71,
        view_count: 1138792115,
        description: 'J97 Youtube Channel Official - Jack - Phương Tuấn',
        url: 'https://youtube.com/@j97imjack',
        website: null,
        facebook: null,
        twitter: null,
        tiktok: null,
        published_at: '2020-02-17T07:35:05.089Z'
    },
    {
        id: 'UCeHcqX7bQeRhqoHEu3ELZJg',
        name: 'Cờ Tướng Đam mê',
        handle: '@cotuongdamme_official',
        avatar: 'default-channel-thumbnail.jpg',
        banner: 'default-channel-banner.jpg',
        subscribers: 324000,
        subscribers_formatted: '324K',
        category: 'Game',
        videos_count: 2480,
        view_count: 355637302,
        description: 'Kênh tuyển tập các trận chiến kinh điển của các danh thủ hàng đầu.',
        url: 'https://youtube.com/@cotuongdamme_official',
        website: null,
        facebook: null,
        twitter: null,
        tiktok: null,
        published_at: '2009-03-08T20:28:46Z'
    }
];

/**
 * Tải danh sách kênh từ bảng `channels` trên Supabase.
 * Nếu thành công và có dữ liệu, cập nhật trực tiếp mảng CHANNELS_DATA.
 */
async function fetchChannelsFromSupabase() {
    try {
        let rows = null;

        if (supabaseClient) {
            const { data, error } = await supabaseClient
                .from('channels')
                .select('*')
                .order('subscribers', { ascending: false });

            if (error) throw error;
            rows = data;
        } else {
            const endpoint = SUPABASE_CONFIG.url + '/rest/v1/channels?select=*&order=subscribers.desc';
            const response = await fetch(endpoint, {
                headers: {
                    'apikey': SUPABASE_CONFIG.publishableKey,
                    'Accept': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('HTTP ' + response.status + ': ' + response.statusText);
            }
            rows = await response.json();
        }

        if (Array.isArray(rows) && rows.length > 0) {
            CHANNELS_DATA.length = 0;
            rows.forEach(function (row) {
                CHANNELS_DATA.push(Object.assign({
                    subscribers: 0,
                    subscribers_formatted: '0',
                    videos_count: 0,
                    view_count: 0
                }, row, {
                    subscribers: Number(row.subscribers) || 0,
                    videos_count: Number(row.videos_count) || 0,
                    view_count: Number(row.view_count) || 0
                }));
            });
            return { data: CHANNELS_DATA, source: 'supabase', error: null };
        }

        return { data: CHANNELS_DATA, source: 'local-empty', error: null };
    } catch (err) {
        console.warn('[Supabase] Không thể tải bảng channels từ Supabase, sử dụng dữ liệu dự phòng cục bộ:', err);
        return { data: CHANNELS_DATA, source: 'local-fallback', error: err };
    }
}

/**
 * Định dạng số lượng người đăng ký thành chuỗi rút gọn (VD: 375M, 4.59M, 75.4K)
 */
function formatSubscribersCount(subscribers) {
    const num = Number(subscribers) || 0;
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(2).replace(/\.?0+$/, '') + 'B';
    }
    if (num >= 1000000) {
        const decimals = num >= 100000000 ? 0 : (num >= 10000000 ? 1 : 2);
        return (num / 1000000).toFixed(decimals).replace(/\.?0+$/, '') + 'M';
    }
    if (num >= 1000) {
        const str = (num / 1000).toFixed(num >= 100000 ? 0 : 1).replace(/\.0$/, '');
        return str + 'K';
    }
    return String(num);
}

/**
 * Gọi YouTube Data API v3 để lấy thống kê mới nhất (subscribers, subscribers_formatted, videos_count, view_count)
 * và tự động cập nhật vào bảng `channels` trong Supabase cũng như mảng CHANNELS_DATA hiện tại.
 *
 * @param {string[]} [targetIds] Danh sách Channel ID cần cập nhật (mặc định là toàn bộ CHANNELS_DATA)
 */
async function syncChannelsWithYouTubeAPI(targetIds) {
    const ids = Array.isArray(targetIds) && targetIds.length > 0
        ? targetIds
        : CHANNELS_DATA.map(function (c) { return c.id; }).filter(Boolean);

    if (ids.length === 0) {
        return { updatedCount: 0, supabaseSynced: false, error: new Error('Không có Channel ID nào để cập nhật.') };
    }

    const statsById = {};
    const batchSize = 50; // YouTube API cho phép tối đa 50 ID mỗi request

    for (let i = 0; i < ids.length; i += batchSize) {
        const chunk = ids.slice(i, i + batchSize);
        const url = YOUTUBE_API_CONFIG.endpoint +
            '?part=' + encodeURIComponent(YOUTUBE_API_CONFIG.part) +
            '&id=' + encodeURIComponent(chunk.join(',')) +
            '&key=' + encodeURIComponent(YOUTUBE_API_CONFIG.apiKey);

        const response = await fetch(url);
        if (!response.ok) {
            const errBody = await response.text();
            throw new Error('YouTube API lỗi HTTP ' + response.status + ': ' + errBody);
        }

        const payload = await response.json();
        const items = Array.isArray(payload.items) ? payload.items : [];

        items.forEach(function (item) {
            const stats = item.statistics || {};
            const snippet = item.snippet || {};
            const subscribers = Number(stats.subscriberCount || 0);
            const videosCount = Number(stats.videoCount || 0);
            const viewCount = Number(stats.viewCount || 0);

            statsById[item.id] = {
                id: item.id,
                subscribers: subscribers,
                subscribers_formatted: formatSubscribersCount(subscribers),
                videos_count: videosCount,
                view_count: viewCount,
                published_at: snippet.publishedAt || null,
                updated_at: new Date().toISOString()
            };
        });
    }

    const updatedRowsForDb = [];
    const nowIso = new Date().toISOString();

    CHANNELS_DATA.forEach(function (channel) {
        const latest = statsById[channel.id];
        if (latest) {
            channel.subscribers = latest.subscribers;
            channel.subscribers_formatted = latest.subscribers_formatted;
            channel.videos_count = latest.videos_count;
            channel.view_count = latest.view_count;
            if (!channel.published_at && latest.published_at) {
                channel.published_at = latest.published_at;
            }
            channel.updated_at = nowIso;

            updatedRowsForDb.push({
                id: channel.id,
                name: channel.name,
                handle: channel.handle || null,
                avatar: channel.avatar || 'default-channel-thumbnail.jpg',
                banner: channel.banner || 'default-channel-banner.jpg',
                subscribers: channel.subscribers,
                subscribers_formatted: channel.subscribers_formatted,
                category: channel.category,
                videos_count: channel.videos_count,
                view_count: channel.view_count,
                description: channel.description || null,
                url: channel.url || null,
                website: channel.website || null,
                facebook: channel.facebook || null,
                twitter: channel.twitter || null,
                tiktok: channel.tiktok || null,
                published_at: channel.published_at || null,
                updated_at: nowIso
            });
        }
    });

    let supabaseSynced = false;
    let supabaseError = null;

    if (updatedRowsForDb.length > 0) {
        try {
            if (supabaseClient) {
                const { error } = await supabaseClient
                    .from('channels')
                    .upsert(updatedRowsForDb, { onConflict: 'id' });

                if (error) throw error;
                supabaseSynced = true;
            } else {
                const endpoint = SUPABASE_CONFIG.url + '/rest/v1/channels?on_conflict=id';
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_CONFIG.publishableKey,
                        'Authorization': 'Bearer ' + SUPABASE_CONFIG.publishableKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'resolution=merge-duplicates,return=minimal'
                    },
                    body: JSON.stringify(updatedRowsForDb)
                });
                if (!res.ok) {
                    const errText = await res.text();
                    throw new Error('HTTP ' + res.status + ': ' + errText);
                }
                supabaseSynced = true;
            }
        } catch (dbErr) {
            console.warn('[Supabase] Không thể ghi dữ liệu cập nhật lên Supabase:', dbErr);
            supabaseError = dbErr;
        }
    }

    return {
        updatedCount: Object.keys(statsById).length,
        totalChannels: ids.length,
        supabaseSynced: supabaseSynced,
        supabaseError: supabaseError,
        statsById: statsById,
        channels: CHANNELS_DATA
    };
}


