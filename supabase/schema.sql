
-- PetRoutine Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USER MANAGEMENT
-- ============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(30) UNIQUE,
  display_name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  premium_expires_at TIMESTAMPTZ,
  notification_preferences JSONB DEFAULT '{"push_enabled": true, "email_enabled": true, "care_reminders": true, "medication_reminders": true, "vaccination_reminders": true, "appointment_reminders": true, "social_notifications": true, "reminder_time": "09:00"}'::jsonb,
  privacy_settings JSONB DEFAULT '{"profile_visibility": "public", "show_pets": true, "show_activity": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_username ON profiles(username);

-- ============================================
-- PETS
-- ============================================

CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  animal_type VARCHAR(20) NOT NULL CHECK (animal_type IN ('dog', 'cat', 'bird', 'rabbit', 'fish', 'other')),
  breed VARCHAR(100),
  gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
  date_of_birth DATE,
  weight DECIMAL(5,2),
  color VARCHAR(50),
  adoption_date DATE,
  notes TEXT,
  medical_info JSONB,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pets_user_id ON pets(user_id);

-- ============================================
-- CARE MANAGEMENT
-- ============================================

CREATE TABLE care_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(20) NOT NULL CHECK (category IN ('feeding', 'water', 'walking', 'exercise', 'bathing', 'grooming', 'cleaning', 'medication', 'general', 'custom')),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  recurrence VARCHAR(20) DEFAULT 'once' CHECK (recurrence IN ('once', 'daily', 'weekly', 'weekdays', 'weekends', 'custom')),
  recurrence_days INT[],
  notes TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_care_tasks_user_date ON care_tasks(user_id, scheduled_date);
CREATE INDEX idx_care_tasks_pet_date ON care_tasks(pet_id, scheduled_date);

CREATE TABLE care_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES care_tasks(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_care_logs_task_id ON care_logs(task_id);

-- ============================================
-- HEALTH MANAGEMENT
-- ============================================

CREATE TABLE health_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('weight', 'vaccination', 'medication', 'vet_visit', 'medical_note', 'observation')),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  veterinarian VARCHAR(100),
  clinic VARCHAR(100),
  notes TEXT,
  attachments JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_health_records_pet_date ON health_records(pet_id, date);

CREATE TABLE vaccinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vaccine_name VARCHAR(200) NOT NULL,
  date_administered DATE NOT NULL,
  next_due_date DATE,
  veterinarian VARCHAR(100),
  clinic VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vaccinations_pet_due ON vaccinations(pet_id, next_due_date);

CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  dosage VARCHAR(100),
  frequency VARCHAR(100),
  start_date DATE NOT NULL,
  end_date DATE,
  veterinarian VARCHAR(100),
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_medications_pet_active ON medications(pet_id, is_active);

CREATE TABLE vet_appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  date DATE NOT NULL,
  time TIME,
  clinic VARCHAR(100),
  veterinarian VARCHAR(100),
  notes TEXT,
  follow_up_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vet_appointments_pet_date ON vet_appointments(pet_id, date);

CREATE TABLE weight_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  weight DECIMAL(5,2) NOT NULL,
  unit VARCHAR(10) DEFAULT 'kg',
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_weight_records_pet_date ON weight_records(pet_id, date);

-- ============================================
-- SOCIAL COMMUNITY
-- ============================================

CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  hashtags TEXT[],
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);
CREATE INDEX idx_posts_public_created ON posts(is_public, created_at DESC) WHERE is_public = TRUE;

CREATE TABLE post_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('image', 'video')),
  "order" INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_post_id ON comments(post_id);

CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, comment_id)
);

CREATE TABLE saved_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);

CREATE TABLE hashtags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  post_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE post_hashtags (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  hashtag_id UUID NOT NULL REFERENCES hashtags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, hashtag_id)
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL CHECK (type IN ('care_reminder', 'medication_reminder', 'vaccination_due', 'appointment_reminder', 'new_follower', 'like', 'comment', 'mention', 'system')),
  title VARCHAR(200) NOT NULL,
  message TEXT,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read, created_at DESC);

CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  push_enabled BOOLEAN DEFAULT TRUE,
  email_enabled BOOLEAN DEFAULT TRUE,
  care_reminders BOOLEAN DEFAULT TRUE,
  medication_reminders BOOLEAN DEFAULT TRUE,
  vaccination_reminders BOOLEAN DEFAULT TRUE,
  appointment_reminders BOOLEAN DEFAULT TRUE,
  social_notifications BOOLEAN DEFAULT TRUE,
  reminder_time TIME DEFAULT '09:00',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SUBSCRIPTIONS
-- ============================================

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  plan VARCHAR(20) NOT NULL CHECK (plan IN ('free', 'plus')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'canceled', 'expired', 'pending')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  payment_provider VARCHAR(20),
  payment_provider_customer_id VARCHAR(100),
  payment_provider_subscription_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subscription_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MODERATION
-- ============================================

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reported_type VARCHAR(20) NOT NULL CHECK (reported_type IN ('post', 'comment', 'user')),
  reported_id UUID NOT NULL,
  reason VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_status ON reports(status);

CREATE TABLE blocked_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE vet_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Pets policies
CREATE POLICY "Users can view own pets" ON pets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pets" ON pets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pets" ON pets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pets" ON pets FOR DELETE USING (auth.uid() = user_id);

-- Care tasks policies
CREATE POLICY "Users can view own care tasks" ON care_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own care tasks" ON care_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own care tasks" ON care_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own care tasks" ON care_tasks FOR DELETE USING (auth.uid() = user_id);

-- Care logs policies
CREATE POLICY "Users can view own care logs" ON care_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own care logs" ON care_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Health records policies
CREATE POLICY "Users can view own health records" ON health_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own health records" ON health_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own health records" ON health_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own health records" ON health_records FOR DELETE USING (auth.uid() = user_id);

-- Vaccinations policies
CREATE POLICY "Users can view own vaccinations" ON vaccinations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vaccinations" ON vaccinations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vaccinations" ON vaccinations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own vaccinations" ON vaccinations FOR DELETE USING (auth.uid() = user_id);

-- Medications policies
CREATE POLICY "Users can view own medications" ON medications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own medications" ON medications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own medications" ON medications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own medications" ON medications FOR DELETE USING (auth.uid() = user_id);

-- Vet appointments policies
CREATE POLICY "Users can view own vet appointments" ON vet_appointments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vet appointments" ON vet_appointments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vet appointments" ON vet_appointments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own vet appointments" ON vet_appointments FOR DELETE USING (auth.uid() = user_id);

-- Weight records policies
CREATE POLICY "Users can view own weight records" ON weight_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own weight records" ON weight_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own weight records" ON weight_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own weight records" ON weight_records FOR DELETE USING (auth.uid() = user_id);

-- Posts policies (public posts visible to all, private only to owner)
CREATE POLICY "Public posts are viewable by everyone" ON posts FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can insert own posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid() = user_id);

-- Post media policies
CREATE POLICY "Post media viewable with post" ON post_media FOR SELECT USING (
  EXISTS (SELECT 1 FROM posts WHERE posts.id = post_media.post_id AND (posts.is_public = true OR posts.user_id = auth.uid()))
);
CREATE POLICY "Users can insert own post media" ON post_media FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM posts WHERE posts.id = post_media.post_id AND posts.user_id = auth.uid())
);
CREATE POLICY "Users can delete own post media" ON post_media FOR DELETE USING (
  EXISTS (SELECT 1 FROM posts WHERE posts.id = post_media.post_id AND posts.user_id = auth.uid())
);

-- Comments policies
CREATE POLICY "Comments viewable with post" ON comments FOR SELECT USING (
  EXISTS (SELECT 1 FROM posts WHERE posts.id = comments.post_id AND (posts.is_public = true OR posts.user_id = auth.uid()))
);
CREATE POLICY "Users can insert comments on viewable posts" ON comments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM posts WHERE posts.id = comments.post_id AND (posts.is_public = true OR posts.user_id = auth.uid()))
);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Likes policies
CREATE POLICY "Likes viewable with post" ON likes FOR SELECT USING (
  (post_id IS NOT NULL AND EXISTS (SELECT 1 FROM posts WHERE posts.id = likes.post_id AND (posts.is_public = true OR posts.user_id = auth.uid()))) OR
  (comment_id IS NOT NULL AND EXISTS (SELECT 1 FROM comments JOIN posts ON posts.id = comments.post_id WHERE comments.id = likes.comment_id AND (posts.is_public = true OR posts.user_id = auth.uid())))
);
CREATE POLICY "Users can insert own likes" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON likes FOR DELETE USING (auth.uid() = user_id);

-- Saved posts policies
CREATE POLICY "Users can view own saved posts" ON saved_posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saved posts" ON saved_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved posts" ON saved_posts FOR DELETE USING (auth.uid() = user_id);

-- Follows policies
CREATE POLICY "Follows viewable by involved users" ON follows FOR SELECT USING (auth.uid() = follower_id OR auth.uid() = following_id);
CREATE POLICY "Users can follow others" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON follows FOR DELETE USING (auth.uid() = follower_id);

-- Hashtags policies
CREATE POLICY "Hashtags viewable by everyone" ON hashtags FOR SELECT USING (true);

-- Post hashtags policies
CREATE POLICY "Post hashtags viewable with post" ON post_hashtags FOR SELECT USING (
  EXISTS (SELECT 1 FROM posts WHERE posts.id = post_hashtags.post_id AND (posts.is_public = true OR posts.user_id = auth.uid()))
);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT WITH CHECK (true);

-- Notification preferences policies
CREATE POLICY "Users can view own notification preferences" ON notification_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notification preferences" ON notification_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notification preferences" ON notification_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage subscriptions" ON subscriptions FOR ALL USING (auth.role() = 'service_role');

-- Reports policies
CREATE POLICY "Users can view own reports" ON reports FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "Users can insert reports" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Admins can view all reports" ON reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_premium = true) -- Simplified admin check
);

-- Blocked users policies
CREATE POLICY "Users can view own blocks" ON blocked_users FOR SELECT USING (auth.uid() = blocker_id);
CREATE POLICY "Users can insert blocks" ON blocked_users FOR INSERT WITH CHECK (auth.uid() = blocker_id);
CREATE POLICY "Users can delete own blocks" ON blocked_users FOR DELETE USING (auth.uid() = blocker_id);

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Create storage buckets (run in Supabase dashboard or via CLI)
-- INSERT INTO storage.buckets (id, name, public) VALUES 
--   ('avatars', 'avatars', true),
--   ('pet-images', 'pet-images', true),
--   ('post-images', 'post-images', true),
--   ('post-videos', 'post-videos', true),
--   ('health-documents', 'health-documents', false);

-- Storage policies for avatars
-- CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
-- CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for pet-images
-- CREATE POLICY "Pet images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'pet-images');
-- CREATE POLICY "Users can upload their own pet images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'pet-images' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can update their own pet images" ON storage.objects FOR UPDATE USING (bucket_id = 'pet-images' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can delete their own pet images" ON storage.objects FOR DELETE USING (bucket_id = 'pet-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for post-images
-- CREATE POLICY "Post images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'post-images');
-- CREATE POLICY "Users can upload their own post images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can delete their own post images" ON storage.objects FOR DELETE USING (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for post-videos
-- CREATE POLICY "Post videos are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'post-videos');
-- CREATE POLICY "Users can upload their own post videos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'post-videos' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can delete their own post videos" ON storage.objects FOR DELETE USING (bucket_id = 'post-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for health-documents
-- CREATE POLICY "Health documents are private" ON storage.objects FOR SELECT USING (bucket_id = 'health-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can upload their own health documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'health-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can delete their own health documents" ON storage.objects FOR DELETE USING (bucket_id = 'health-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION get_user_pet_count(user_id UUID)
RETURNS INT AS $$
DECLARE
  count INT;
BEGIN
  SELECT COUNT(*) INTO count FROM pets WHERE pets.user_id = user_id;
  RETURN count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_user_premium(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  premium BOOLEAN;
BEGIN
  SELECT is_premium INTO premium FROM profiles WHERE id = user_id;
  RETURN COALESCE(premium, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON pets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_care_tasks_updated_at BEFORE UPDATE ON care_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_health_records_updated_at BEFORE UPDATE ON health_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vaccinations_updated_at BEFORE UPDATE ON vaccinations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON medications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vet_appointments_updated_at BEFORE UPDATE ON vet_appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
