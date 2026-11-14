-- Tạo bảng channels trong PostgreSQL (Supabase)
CREATE TABLE IF NOT EXISTS channels (
    id VARCHAR(100) PRIMARY KEY,                         -- ID kênh (VD: 'UCX6OQ3DkcsbYNE6H8uQQuVA')
    name VARCHAR(255) NOT NULL,                          -- Tên kênh
    handle VARCHAR(100),                                 -- Handle/Custom URL (VD: '@MrBeast')
    avatar VARCHAR(255) DEFAULT 'default-channel-thumbnail.jpg', -- Ảnh đại diện
    banner VARCHAR(255) DEFAULT 'default-channel-banner.jpg',    -- Ảnh banner
    subscribers BIGINT DEFAULT 0,                        -- Số lượng người đăng ký
    subscribers_formatted VARCHAR(50),                   -- Chuỗi định dạng hiển thị (VD: '375M', '500K')
    category VARCHAR(100) NOT NULL,                      -- Danh mục (Entertainment, Game, VTuber, News, Tech...)
    videos_count INT DEFAULT 0,                          -- Số lượng video
    view_count BIGINT DEFAULT 0,                         -- Tổng số lượt xem kênh
    description TEXT,                                    -- Mô tả kênh
    url VARCHAR(255),                                    -- Đường dẫn YouTube Channel
    website VARCHAR(255),                                -- Trang web chính thức
    facebook VARCHAR(255),                               -- Link Facebook
    twitter VARCHAR(255),                                -- Link Twitter (X)
    tiktok VARCHAR(255),                                 -- Link TikTok
    published_at TIMESTAMP WITH TIME ZONE,               -- Ngày tạo kênh trên YouTube
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Ngày thêm vào DB
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP  -- Ngày cập nhật DB
);

-- Tạo Index hỗ trợ tìm kiếm và sắp xếp nhanh
CREATE INDEX IF NOT EXISTS idx_channels_category ON channels(category);
CREATE INDEX IF NOT EXISTS idx_channels_subscribers ON channels(subscribers DESC);
CREATE INDEX IF NOT EXISTS idx_channels_name_handle ON channels(name, handle);

-- Bật Row Level Security (RLS) và cho phép đọc/cập nhật qua Publishable Key
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'channels' AND policyname = 'Allow public read access on channels'
    ) THEN
        CREATE POLICY "Allow public read access on channels"
            ON channels
            FOR SELECT
            TO anon, authenticated
            USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'channels' AND policyname = 'Allow public update stats on channels'
    ) THEN
        CREATE POLICY "Allow public update stats on channels"
            ON channels
            FOR UPDATE
            TO anon, authenticated
            USING (true)
            WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'channels' AND policyname = 'Allow public insert on channels'
    ) THEN
        CREATE POLICY "Allow public insert on channels"
            ON channels
            FOR INSERT
            TO anon, authenticated
            WITH CHECK (true);
    END IF;
END
$$;

-- Thêm dữ liệu 21 kênh vào bảng channels
INSERT INTO channels (
    id, name, handle, avatar, banner, subscribers, subscribers_formatted, category, videos_count, view_count, description, url, website, facebook, twitter, tiktok, published_at
) VALUES
('UCX6OQ3DkcsbYNE6H8uQQuVA', 'MrBeast', '@MrBeast', 'default-channel-thumbnail.jpg', 'default-channel-banner.jpg', 375000000, '375M', 'Entertainment', 840, 0, 'Kênh giải trí lớn nhất thế giới của Jimmy Donaldson (MrBeast) với các thử thách quy mô lớn và hoạt động từ thiện.', 'https://youtube.com/@MrBeast', 'https://mrbeast.com', 'https://facebook.com/MrBeast6000', 'https://twitter.com/MrBeast', 'https://tiktok.com/@mrbeast', '2012-02-20T00:00:00Z'),

('UCq-Fj5jknLsUf-MWSy4_brA', 'T-Series', '@tseries', 'tseries-channel-thumbnail.jpg', 'default-channel-banner.jpg', 285000000, '285M', 'Music', 21500, 0, 'Hãng thu âm và sản xuất phim hàng đầu Ấn Độ (Super Cassettes Industries Private Limited).', 'https://youtube.com/@tseries', 'https://tseries.com', 'https://facebook.com/tseriesmusic', 'https://twitter.com/TSeries', NULL, '2006-03-13T00:00:00Z'),

('UC-lHJZR3Gqxm24_Vd_AJ5Yw', 'PewDiePie', '@PewDiePie', 'pewdiepie-channel-thumbnail.jpg', 'default-channel-banner.jpg', 111000000, '111M', 'Game', 4790, 0, 'Kênh YouTube cá nhân nổi tiếng của Felix Kjellberg chuyên về bình luận game, meme và vlog.', 'https://youtube.com/@PewDiePie', 'https://pewdiepie.com', 'https://facebook.com/pewdiepie', 'https://twitter.com/pewdiepie', NULL, '2010-04-29T00:00:00Z'),

('UCGCZAYq5Xxojl_tSXcVJhiQ', 'ANN News Channel', '@ANNnewsCH', 'ann-news-channel-thumbnail.jpg', 'default-channel-banner.jpg', 3800000, '3.8M', 'News', 154000, 0, 'Kênh tin tức chính thức của mạng lưới All-Nippon News Network (TV Asahi) tại Nhật Bản.', 'https://youtube.com/@ANNnewsCH', 'https://news.tv-asahi.co.jp', NULL, 'https://twitter.com/tv_asahi_news', NULL, '2009-07-07T00:00:00Z'),

('UC8butISFwT-Wl7EV0hUK0BQ', 'FreeCodeCamp.org', '@freecodecamp', 'freecodecamp-channel-thumbnail.jpg', 'default-channel-banner.jpg', 10200000, '10.2M', 'Development', 1850, 0, 'Cộng đồng mã nguồn mở giúp mọi người học lập trình miễn phí thông qua các khóa học chuyên sâu.', 'https://youtube.com/@freecodecamp', 'https://www.freecodecamp.org', NULL, 'https://twitter.com/freecodecamp', NULL, '2014-12-16T00:00:00Z'),

('UCJFZiqLm7iJ0vEM18y4_bWw', 'Hololive Ch. hololive-VTuber', '@hololive', 'hololive-channel-thumbnail.jpg', 'hololive-channel-banner.jpg', 2500000, '2.5M', 'VTuber', 2100, 0, 'Kênh chính thức của nhóm nhạc thần tượng ảo VTuber Hololive Production thuộc COVER Corp.', 'https://youtube.com/@hololive', 'https://hololive.hololivepro.com', NULL, 'https://twitter.com/hololivetv', 'https://tiktok.com/@hololive_eng', '2016-05-02T00:00:00Z'),

('UC4YaOt1yT-ZeyB0OmxHgolA', 'Kizuna AI Channel', '@KizunaAI', 'kizuna-ai-channel-thumbnail.jpg', 'default-channel-banner.jpg', 3000000, '3.0M', 'VTuber', 1100, 0, 'Virtual YouTuber (VTuber) tiên phong trên thế giới với khẩu hiệu kết nối mọi người qua AI.', 'https://youtube.com/@KizunaAI', 'https://kizunaai.com', NULL, 'https://twitter.com/aichan_nel', 'https://tiktok.com/@kizunaai0630', '2016-10-19T00:00:00Z'),

('UCott96qGP5ADmsB_yNQMvDA', 'Muse Vietnam', '@MuseVN', 'musevn-channel-thumbnail.jpg', 'default-channel-banner.jpg', 1800000, '1.8M', 'Entertainment', 3200, 0, 'Kênh phát sóng Anime bản quyền chính thức của Muse Communication tại Việt Nam.', 'https://youtube.com/@MuseVN', NULL, 'https://facebook.com/museacg.vn', NULL, NULL, '2020-05-15T00:00:00Z'),

('UClOf1XXinvZsy4wKPAkro2A', 'PlayOverwatch', '@PlayOverwatch', 'play-overwatch-channel-thumbnail.jpg', 'default-channel-banner.jpg', 3600000, '3.6M', 'Game', 890, 0, 'Kênh YouTube chính thức của tựa game bắn súng đồng đội Overwatch từ Blizzard Entertainment.', 'https://youtube.com/@PlayOverwatch', 'https://overwatch.blizzard.com', 'https://facebook.com/PlayOverwatch', 'https://twitter.com/PlayOverwatch', NULL, '2014-11-07T00:00:00Z'),

('UC9nK195uN_z_4L0Qj7x1l0w', 'SBS Drama', '@sbsdrama', 'sbs-channel-thumbnail.jpg', 'default-channel-banner.jpg', 7200000, '7.2M', 'Entertainment', 45000, 0, 'Kênh phim truyền hình chính thức của đài truyền hình SBS Hàn Quốc.', 'https://youtube.com/@sbsdrama', 'https://www.sbs.co.kr', 'https://facebook.com/sbsNOW', NULL, NULL, '2012-08-22T00:00:00Z'),

('UCuP2vJ6_0nB9H_P1o5_P3wA', 'Vexsper', '@vexsper', 'vexsper-channel-thumbnail.jpg', 'default-channel-banner.jpg', 500000, '500K', 'Development', 150, 0, 'Kênh chia sẻ kiến thức lập trình, phát triển phần mềm và công nghệ hiện đại.', 'https://youtube.com/@vexsper', NULL, NULL, 'https://twitter.com/vexsper', NULL, '2021-03-10T00:00:00Z'),

('UCVia_crjzJylRmGq7SHTiaw', 'Hearthstone', '@Hearthstone', 'hearthstone-channel-thumbnail.jpg', 'hearthstone-channel-banner.jpg', 496000, '496K', 'Game', 1680, 0, 'Kênh chính thức của trò chơi thẻ bài chiến thuật Hearthstone lấy bối cảnh vũ trụ Warcraft.', 'https://youtube.com/@Hearthstone', 'https://us.shop.battle.net/en-us/family/hearthstone', NULL, NULL, NULL, '2013-03-22T00:00:00Z'),

('UCkWnwVAYGshTEVDPZ451kBQ', 'essie ch.', '@essiech', 'essie-channel-thumbnail.jpg', 'essie-channel-banner.jpg', 75400, '75.4K', 'VTuber', 497, 0, 'Kênh sáng tạo nội dung và stream của VTuber essie.', 'https://www.youtube.com/@essiech', NULL, NULL, 'https://x.com/essie_ch', NULL, '2021-07-01T00:00:00Z'),

('UCp-9F3MEliOQ2sbAnG0OqLQ', 'Gawr Gura Ch. hololive-EN', '@GawrGura', 'gawr-gura-channel-thumbnail.jpg', 'gawr-gura-channel-banner.jpg', 4590000, '4.59M', 'VTuber', 565, 0, 'Kênh VTuber Gawr Gura thuộc thế hệ Hololive English -Myth-.', 'https://www.youtube.com/@GawrGura', NULL, NULL, 'https://x.com/gawrgura', NULL, '2020-07-16T00:00:00Z'),

('UCCzUftO8KOVkV4wQG1vkU1g', 'Marine Ch. 宝鐘マリン', '@HoushouMarine', 'houshou-marine-channel-thumbnail.jpg', 'houshou-marine-channel-banner.jpg', 4440000, '4.44M', 'VTuber', 565, 0, 'Kênh chính thức của thuyền trưởng Houshou Marine thuộc Hololive Fantasy (Gen 3).', 'https://www.youtube.com/@HoushouMarine', NULL, NULL, NULL, NULL, '2019-07-22T00:00:00Z'),

('UC5CwaMl1eIgY8h02uZw7u8A', 'Suisei Channel', '@HoshimachiSuisei', 'hoshimachi-suisei-channel-thumbnail.jpg', 'hoshimachi-suisei-channel-banner.jpg', 75400, '75.4K', 'VTuber', 497, 0, 'Kênh âm nhạc và livestream của thần tượng ảo Hoshimachi Suisei thuộc Hololive Gen 0.', 'https://www.youtube.com/@HoshimachiSuisei', NULL, NULL, NULL, NULL, '2018-03-18T00:00:00Z'),

('UC1DCedRgGHBdm81E1llLhOQ', 'Pekora Ch. 兎田ぺこら', '@usadapekora', 'usada-pekora-channel-thumbnail.jpg', 'usada-pekora-channel-banner.jpg', 75400, '75.4K', 'VTuber', 497, 0, 'Kênh livestream game và giải trí của Usada Pekora thuộc Hololive Fantasy (Gen 3).', 'https://www.youtube.com/@usadapekora', NULL, NULL, NULL, NULL, '2019-07-07T00:00:00Z'),

('UC-hM6YJuNYVAmUWxeIr9FeA', 'Miko Ch. さくらみこ', '@SakuraMiko', 'sakura-miko-channel-thumbnail.jpg', 'sakura-miko-channel-banner.jpg', 75400, '75.4K', 'VTuber', 497, 0, 'Kênh chính thức của Elite VTuber Sakura Miko thuộc Hololive Gen 0.', 'https://www.youtube.com/@usadapekora', NULL, NULL, NULL, NULL, '2018-04-25T00:00:00Z'),

('UC7jHm3zfoSZWV5d1cxfJ-BA', 'Ngọc Trinh Official', '@ngoctrinhofficial9626', 'ngoc-trinh-channel-thumbnail.jpg', 'ngoc-trinh-channel-banner.jpg', 75400, '75.4K', 'Entertainment', 341, 0, 'Kênh vlog đời sống, thời trang và giải trí chính thức của Ngọc Trinh.', 'https://www.youtube.com/@ngoctrinhofficial9626', NULL, NULL, NULL, NULL, '2019-02-14T00:00:00Z'),

('UCfdNM3NAhaBOXCafH7krzrA', 'The Infographics Show', '@TheInfographicsShow', 'the-infographics-show-channel-thumbnail.jpg', 'the-infographics-show-channel-banner.jpg', 75400, '75.4K', 'News', 6391, 0, 'Kênh video đồ họa thông tin (infographics) giải thích kiến thức, lịch sử và tin tức thú vị.', 'https://www.youtube.com/@TheInfographicsShow', NULL, NULL, NULL, NULL, '2011-04-06T00:00:00Z'),

('UCTF0ldaORTbCfx2ahvFfYWg', 'Phê Game', '@daylaphegame', 'phe-game-channel-thumbnail.jpg', 'phe-game-channel-banner.jpg', 75400, '75.4K', 'Entertainment', 6391, 0, 'Kênh phân tích cốt truyện game, đánh giá game và tin tức làng game chuyên sâu tại Việt Nam.', 'https://www.youtube.com/@daylaphegame', NULL, NULL, NULL, NULL, '2020-01-12T00:00:00Z'),

('UCabsTV34JwALXKGMqHpvUiA', 'VTV24', '@vtv24', 'default-channel-thumbnail.jpg', 'default-channel-banner.jpg', 7010000, '7.01M', 'News', 61395, 6038805887, 'Kênh YouTube chính thức của Ban Thời sự - Đài Truyền Hình Việt Nam', 'https://youtube.com/@vtv24', NULL, NULL, NULL, NULL, '2016-02-17T07:33:02Z'),

('UC7c3Kb6jYCRj4JOHHZTxKsQ', 'GitHub', '@github', 'default-channel-thumbnail.jpg', 'default-channel-banner.jpg', 710000, '710K', 'Development', 3081, 43195246, 'GitHub is the AI-powered developer platform to build, scale, and deliver secure software.', 'https://youtube.com/@github', NULL, NULL, NULL, NULL, '2010-07-28T18:50:31Z'),

('UCFtEEv80fQVKkD4h1PF-Xqw', 'Microsoft', '@microsoft', 'default-channel-thumbnail.jpg', 'default-channel-banner.jpg', 2170000, '2.17M', 'Development', 796, 212790975, 'Our mission is to empower every person and every organization on the planet to achieve more.', 'https://youtube.com/@microsoft', NULL, NULL, NULL, NULL, '2006-02-13T05:21:44Z'),

('UCdoadna9HFHsxXWhafhNvKw', 'AWS Events', '@awseventschannel', 'default-channel-thumbnail.jpg', 'default-channel-banner.jpg', 185000, '185K', 'Development', 13099, 76330148, 'The official YouTube channel for AWS Events and Webinars.', 'https://youtube.com/@awseventschannel', NULL, NULL, NULL, NULL, '2013-12-16T22:33:33Z'),

('UCV03SRZXJEz-hchIAogeJOg', 'Claude', '@claude', 'default-channel-thumbnail.jpg', 'default-channel-banner.jpg', 747000, '747K', 'Development', 248, 361287754, 'The AI for problem solvers. Built by Anthropic to be safe, accurate, and secure.', 'https://youtube.com/@claude', NULL, NULL, NULL, NULL, '2026-01-22T16:44:50.349Z'),

('UCK8sQmJBp8GCxrOtXWBpyEA', 'Google', '@google', 'default-channel-thumbnail.jpg', 'default-channel-banner.jpg', 14700000, '14.7M', 'Development', 2797, 6754676963, 'Here to help. Reimagining how AI can make your life better and help you explore your creativity.', 'https://youtube.com/@google', NULL, NULL, NULL, NULL, '2005-09-18T22:37:10Z'),

('UCs5Y5_7XK8HLDX0SLNwkd3w', 'Visual Studio Code', '@code', 'default-channel-thumbnail.jpg', 'default-channel-banner.jpg', 1040000, '1.04M', 'Development', 1569, 98336849, 'The open source AI code editor. Free download and documentation: https://code.visualstudio.com', 'https://youtube.com/@code', NULL, NULL, NULL, NULL, '2016-05-27T18:11:37Z'),

('UClyA28-01x4z60eWQ2kiNbA', 'Sơn Tùng M-TP Official', '@sontungmtp', 'default-channel-thumbnail.jpg', 'default-channel-banner.jpg', 11900000, '11.9M', 'Music', 221, 3781654917, 'Son Tung M-TP Official YouTube Channel - Property of Sơn Tùng M-TP', 'https://youtube.com/@sontungmtp', NULL, NULL, NULL, NULL, '2015-01-21T02:38:32Z'),

('UChUJa1JyBc7Lc4orkiNKKQg', 'J97', '@j97imjack', 'default-channel-thumbnail.jpg', 'default-channel-banner.jpg', 6500000, '6.5M', 'Music', 71, 1138792115, 'J97 Youtube Channel Official - Jack - Phương Tuấn', 'https://youtube.com/@j97imjack', NULL, NULL, NULL, NULL, '2020-02-17T07:35:05.089Z'),

('UCeHcqX7bQeRhqoHEu3ELZJg', 'Cờ Tướng Đam mê', '@cotuongdamme_official', 'default-channel-thumbnail.jpg', 'default-channel-banner.jpg', 324000, '324K', 'Game', 2480, 355637302, 'Kênh tuyển tập các trận chiến kinh điển của các danh thủ hàng đầu.', 'https://youtube.com/@cotuongdamme_official', NULL, NULL, NULL, NULL, '2009-03-08T20:28:46Z')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    handle = EXCLUDED.handle,
    avatar = EXCLUDED.avatar,
    banner = EXCLUDED.banner,
    subscribers = EXCLUDED.subscribers,
    subscribers_formatted = EXCLUDED.subscribers_formatted,
    category = EXCLUDED.category,
    videos_count = EXCLUDED.videos_count,
    view_count = EXCLUDED.view_count,
    description = EXCLUDED.description,
    url = EXCLUDED.url,
    website = EXCLUDED.website,
    facebook = EXCLUDED.facebook,
    twitter = EXCLUDED.twitter,
    tiktok = EXCLUDED.tiktok,
    published_at = EXCLUDED.published_at,
    updated_at = CURRENT_TIMESTAMP;
