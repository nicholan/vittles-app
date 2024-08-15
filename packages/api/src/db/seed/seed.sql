-- Users
INSERT INTO users (auth_id, username, email, bio, profile_picture_url)
VALUES 
('auth0|5f50a4ef1c9d4400168d25ea', 'wanderlust99', 'explorer@example.com', 'World traveler and adventure seeker.', 'https://example.com/profiles/wanderlust99.png'),
('auth0|5f50a4ef1c9d4400168d25eb', 'tech_guru', 'innovator@example.com', 'Passionate about technology and the future.', 'https://example.com/profiles/tech_guru.png'),
('auth0|5f50a4ef1c9d4400168d25ec', 'foodie_jane', 'foodlover@example.com', 'Culinary enthusiast and amateur chef.', 'https://example.com/profiles/foodie_jane.png'),
('auth0|5f50a4ef1c9d4400168d25ed', 'bookworm_sam', 'reader@example.com', 'Avid reader and book reviewer.', 'https://example.com/profiles/bookworm_sam.png'),
('auth0|5f50a4ef1c9d4400168d25ee', 'gamer_gal', 'gamer@example.com', 'Lover of all things gaming.', 'https://example.com/profiles/gamer_gal.png'),
('auth0|5f50a4ef1c9d4400168d25ef', 'nature_nick', 'naturelover@example.com', 'Environmental advocate and hiker.', 'https://example.com/profiles/nature_nick.png'),
('auth0|5f50a4ef1c9d4400168d25f0', 'photog_joe', 'photog@example.com', 'Professional photographer and visual storyteller.', 'https://example.com/profiles/photog_joe.png'),
('auth0|5f50a4ef1c9d4400168d25f1', 'musician_mary', 'musician@example.com', 'Singer-songwriter and music lover.', 'https://example.com/profiles/musician_mary.png'),
('auth0|5f50a4ef1c9d4400168d25f2', 'fitness_felix', 'fitness@example.com', 'Personal trainer and fitness enthusiast.', 'https://example.com/profiles/fitness_felix.png');

-- Chambers
INSERT INTO chambers (name, description)
VALUES 
('travelenthusiasts', 'A place to share travel experiences and tips.'),
('techinnovators', 'Discuss the latest trends in technology.'),
('culinarydelights', 'Share recipes and food adventures.'),
('bookclub', 'Discuss and review the latest reads.'),
('gamersunite', 'A hub for all things gaming.'),
('natureexplorers', 'For those who love the great outdoors.'),
('photographypros', 'A community for photographers to share their work.'),
('musicmakers', 'A place to discuss and share music.'),
('fitnessfanatics', 'Connect with others who are passionate about fitness.');

-- Posts
INSERT INTO posts (title, content, author_id, chamber_name, slug)
VALUES 
-- Original Posts
('Top 10 Must-Visit Places in Europe', 'Europe is full of beautiful destinations. Here are my top 10...', 1, 'travelenthusiasts', 'top-10-must-visit-places-in-europe-abc123'),
('The Future of AI', 'Artificial intelligence is transforming the world. Let''s explore...', 2, 'techinnovators', 'the-future-of-ai-def456'),
('Best Homemade Pizza Recipe', 'I have perfected the art of making pizza at home. Here''s how...', 3, 'culinarydelights', 'best-homemade-pizza-recipe-ghi789'),
('5 Must-Read Books of 2024', 'These are the books you can''t miss this year...', 4, 'bookclub', '5-must-read-books-of-2024-jkl012'),
('Top 10 Upcoming Games', 'Here''s a list of games to look out for in the coming months...', 5, 'gamersunite', 'top-10-upcoming-games-mno345'),
('Hiking Tips for Beginners', 'If you''re new to hiking, these tips will help you get started...', 6, 'natureexplorers', 'hiking-tips-for-beginners-pqr678'),
('How to Capture Stunning Landscape Photos', 'Learn the techniques for capturing breathtaking landscapes...', 7, 'photographypros', 'how-to-capture-stunning-landscape-photos-stu901'),
('Songwriting 101', 'Here are some tips to improve your songwriting...', 8, 'musicmakers', 'songwriting-101-vwx234'),
('The Ultimate Home Workout Plan', 'Stay fit with this simple and effective home workout routine...', 9, 'fitnessfanatics', 'the-ultimate-home-workout-plan-yza567'),

-- Duplicated Posts
('Top 10 Must-Visit Places in Europe', 'Europe is full of beautiful destinations. Here are my top 10...', 1, 'travelenthusiasts', 'top-10-must-visit-places-in-europe-bcd234'),
('The Future of AI', 'Artificial intelligence is transforming the world. Let''s explore...', 2, 'techinnovators', 'the-future-of-ai-efg567'),
('Best Homemade Pizza Recipe', 'I have perfected the art of making pizza at home. Here''s how...', 3, 'culinarydelights', 'best-homemade-pizza-recipe-hij890'),
('5 Must-Read Books of 2024', 'These are the books you can''t miss this year...', 4, 'bookclub', '5-must-read-books-of-2024-klm345'),
('Top 10 Upcoming Games', 'Here''s a list of games to look out for in the coming months...', 5, 'gamersunite', 'top-10-upcoming-games-nop678'),
('Hiking Tips for Beginners', 'If you''re new to hiking, these tips will help you get started...', 6, 'natureexplorers', 'hiking-tips-for-beginners-qrt901'),
('How to Capture Stunning Landscape Photos', 'Learn the techniques for capturing breathtaking landscapes...', 7, 'photographypros', 'how-to-capture-stunning-landscape-photos-uvw234'),
('Songwriting 101', 'Here are some tips to improve your songwriting...', 8, 'musicmakers', 'songwriting-101-xyz567'),
('The Ultimate Home Workout Plan', 'Stay fit with this simple and effective home workout routine...', 9, 'fitnessfanatics', 'the-ultimate-home-workout-plan-abc890'),

-- More Duplicated Posts
('Top 10 Must-Visit Places in Europe', 'Europe is full of beautiful destinations. Here are my top 10...', 1, 'travelenthusiasts', 'top-10-must-visit-places-in-europe-cde345'),
('The Future of AI', 'Artificial intelligence is transforming the world. Let''s explore...', 2, 'techinnovators', 'the-future-of-ai-fgh678'),
('Best Homemade Pizza Recipe', 'I have perfected the art of making pizza at home. Here''s how...', 3, 'culinarydelights', 'best-homemade-pizza-recipe-ijk901'),
('5 Must-Read Books of 2024', 'These are the books you can''t miss this year...', 4, 'bookclub', '5-must-read-books-of-2024-mno234'),
('Top 10 Upcoming Games', 'Here''s a list of games to look out for in the coming months...', 5, 'gamersunite', 'top-10-upcoming-games-opq567'),
('Hiking Tips for Beginners', 'If you''re new to hiking, these tips will help you get started...', 6, 'natureexplorers', 'hiking-tips-for-beginners-rst890'),
('How to Capture Stunning Landscape Photos', 'Learn the techniques for capturing breathtaking landscapes...', 7, 'photographypros', 'how-to-capture-stunning-landscape-photos-vwx345'),
('Songwriting 101', 'Here are some tips to improve your songwriting...', 8, 'musicmakers', 'songwriting-101-yza678'),
('The Ultimate Home Workout Plan', 'Stay fit with this simple and effective home workout routine...', 9, 'fitnessfanatics', 'the-ultimate-home-workout-plan-bcd901');

-- Comments
INSERT INTO comments (content, author_id, post_id)
VALUES 
('Great list! I would also add Amsterdam.', 2, 1),
('AI will definitely play a huge role in healthcare.', 3, 2),
('I tried this recipe and it was amazing!', 1, 3),
('Can''t wait to read these!', 5, 4),
('So hyped for these games!', 9, 5),
('Thanks for the tips, I''m just starting out.', 7, 6),
('I love landscape photography, great article!', 6, 7),
('These tips are golden!', 4, 8),
('This workout plan is exactly what I needed.', 8, 9);

-- Nested Comments
INSERT INTO comments (content, author_id, post_id, parent_comment_id)
VALUES 
('Amsterdam is indeed a great place! The canals are beautiful.', 1, 1, 1),
('I agree, the potential is incredible.', 4, 2, 2),
('Glad you liked it!', 3, 3, 3),
('Let me know what you think of them.', 4, 4, 4),
('Which game are you most excited about?', 5, 5, 5),
('Happy hiking!', 6, 6, 6),
('Thanks for the feedback!', 7, 7, 7),
('Keep writing amazing songs!', 8, 8, 8),
('Stay strong and keep going!', 9, 9, 9);
