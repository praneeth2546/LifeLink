-- LifeLink Database Schema Implementation
-- Phase 6: Database Schema, API Design, and Core Backend Services

-- Create enum types for better data integrity
CREATE TYPE issue_status AS ENUM ('pending', 'in-progress', 'resolved');
CREATE TYPE issue_category AS ENUM ('roads-traffic', 'water-utilities', 'sanitation-waste', 'street-lighting', 'parks-recreation', 'public-safety', 'buildings-infrastructure', 'other');
CREATE TYPE issue_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE user_role AS ENUM ('citizen', 'authority');
CREATE TYPE notification_type AS ENUM ('status_update', 'new_upvote', 'new_comment', 'issue_resolved', 'authority_response');

-- Update profiles table to include LifeLink specific fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'citizen',
ADD COLUMN IF NOT EXISTS government_id text,
ADD COLUMN IF NOT EXISTS department text,
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{"email": true, "push": true, "sms": false}'::jsonb;

-- Create departments table for authority organization
CREATE TABLE IF NOT EXISTS public.departments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    description text,
    contact_email text,
    contact_phone text,
    jurisdiction_area text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create issues table - core table for issue reporting
CREATE TABLE IF NOT EXISTS public.issues (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text NOT NULL,
    category issue_category NOT NULL,
    status issue_status DEFAULT 'pending',
    priority issue_priority DEFAULT 'medium',
    location_description text NOT NULL,
    latitude decimal(10, 8),
    longitude decimal(11, 8),
    address text,
    priority_score integer DEFAULT 0,
    upvotes_count integer DEFAULT 0,
    comments_count integer DEFAULT 0,
    reported_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_department uuid REFERENCES public.departments(id) ON DELETE SET NULL,
    assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_anonymous boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create issue_photos table for multiple photo attachments
CREATE TABLE IF NOT EXISTS public.issue_photos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id uuid REFERENCES public.issues(id) ON DELETE CASCADE NOT NULL,
    photo_url text NOT NULL,
    caption text,
    is_primary boolean DEFAULT false,
    uploaded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Create issue_updates table for status timeline tracking
CREATE TABLE IF NOT EXISTS public.issue_updates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id uuid REFERENCES public.issues(id) ON DELETE CASCADE NOT NULL,
    status issue_status NOT NULL,
    message text NOT NULL,
    updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_internal boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- Create upvotes table for community engagement
CREATE TABLE IF NOT EXISTS public.issue_upvotes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id uuid REFERENCES public.issues(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(issue_id, user_id)
);

-- Create comments table for issue discussions
CREATE TABLE IF NOT EXISTS public.issue_comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id uuid REFERENCES public.issues(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content text NOT NULL,
    parent_comment_id uuid REFERENCES public.issue_comments(id) ON DELETE CASCADE,
    is_internal boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type notification_type NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    issue_id uuid REFERENCES public.issues(id) ON DELETE CASCADE,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_issues_status ON public.issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_category ON public.issues(category);
CREATE INDEX IF NOT EXISTS idx_issues_location ON public.issues(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_issues_priority_score ON public.issues(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON public.issues(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_issue_upvotes_issue_id ON public.issue_upvotes(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_comments_issue_id ON public.issue_comments(issue_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read);

-- Enable Row Level Security
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for departments (public readable, admin writable)
CREATE POLICY "Departments are publicly viewable" ON public.departments
    FOR SELECT USING (true);

CREATE POLICY "Only authorities can manage departments" ON public.departments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'authority'
        )
    );

-- RLS Policies for issues (public readable, user can create/edit own)
CREATE POLICY "Issues are publicly viewable" ON public.issues
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own issues" ON public.issues
    FOR INSERT WITH CHECK (
        reported_by = auth.uid() OR 
        (is_anonymous = true AND auth.uid() IS NOT NULL)
    );

CREATE POLICY "Users can update their own issues" ON public.issues
    FOR UPDATE USING (reported_by = auth.uid());

CREATE POLICY "Authorities can update assigned issues" ON public.issues
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'authority'
        )
    );

-- RLS Policies for issue_photos
CREATE POLICY "Issue photos are publicly viewable" ON public.issue_photos
    FOR SELECT USING (true);

CREATE POLICY "Users can add photos to issues" ON public.issue_photos
    FOR INSERT WITH CHECK (
        uploaded_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.issues 
            WHERE id = issue_id AND (reported_by = auth.uid() OR status != 'resolved')
        )
    );

-- RLS Policies for issue_updates
CREATE POLICY "Issue updates are publicly viewable" ON public.issue_updates
    FOR SELECT USING (NOT is_internal);

CREATE POLICY "Authorities can view all updates" ON public.issue_updates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'authority'
        )
    );

CREATE POLICY "Authorities can create updates" ON public.issue_updates
    FOR INSERT WITH CHECK (
        updated_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'authority'
        )
    );

-- RLS Policies for upvotes
CREATE POLICY "Upvotes are publicly viewable" ON public.issue_upvotes
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own upvotes" ON public.issue_upvotes
    FOR ALL USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- RLS Policies for comments
CREATE POLICY "Comments are publicly viewable" ON public.issue_comments
    FOR SELECT USING (NOT is_internal);

CREATE POLICY "Authorities can view internal comments" ON public.issue_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'authority'
        )
    );

CREATE POLICY "Users can create comments" ON public.issue_comments
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own comments" ON public.issue_comments
    FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Create functions for automatic updates
CREATE OR REPLACE FUNCTION public.update_issue_priority_score()
RETURNS TRIGGER AS $$
BEGIN
    -- Update priority score based on upvotes, age, and category
    UPDATE public.issues 
    SET priority_score = (
        upvotes_count * 10 + 
        CASE 
            WHEN category IN ('public-safety', 'water-utilities') THEN 50
            WHEN category IN ('roads-traffic', 'street-lighting') THEN 30
            ELSE 10
        END +
        CASE 
            WHEN priority = 'urgent' THEN 100
            WHEN priority = 'high' THEN 75
            WHEN priority = 'medium' THEN 50
            ELSE 25
        END +
        -- Age factor (newer issues get slight boost)
        GREATEST(0, 20 - EXTRACT(days FROM (now() - created_at)))::integer
    )
    WHERE id = COALESCE(NEW.issue_id, OLD.issue_id, NEW.id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create function to update upvote counts
CREATE OR REPLACE FUNCTION public.update_upvotes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.issues 
        SET upvotes_count = upvotes_count + 1
        WHERE id = NEW.issue_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.issues 
        SET upvotes_count = upvotes_count - 1
        WHERE id = OLD.issue_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create function to update comments count
CREATE OR REPLACE FUNCTION public.update_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.issues 
        SET comments_count = comments_count + 1
        WHERE id = NEW.issue_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.issues 
        SET comments_count = comments_count - 1
        WHERE id = OLD.issue_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create function to automatically create notifications
CREATE OR REPLACE FUNCTION public.create_notification()
RETURNS TRIGGER AS $$
DECLARE
    issue_reporter uuid;
    notification_title text;
    notification_message text;
BEGIN
    -- Get the issue reporter
    SELECT reported_by INTO issue_reporter
    FROM public.issues 
    WHERE id = NEW.issue_id;
    
    -- Create notifications based on the trigger context
    IF TG_TABLE_NAME = 'issue_updates' THEN
        notification_title := 'Issue Status Updated';
        notification_message := 'Your reported issue status changed to: ' || NEW.status;
        
        INSERT INTO public.notifications (user_id, type, title, message, issue_id)
        VALUES (issue_reporter, 'status_update', notification_title, notification_message, NEW.issue_id);
        
    ELSIF TG_TABLE_NAME = 'issue_upvotes' THEN
        notification_title := 'New Upvote';
        notification_message := 'Someone upvoted your reported issue';
        
        -- Don't notify if user upvoted their own issue
        IF issue_reporter != NEW.user_id THEN
            INSERT INTO public.notifications (user_id, type, title, message, issue_id)
            VALUES (issue_reporter, 'new_upvote', notification_title, notification_message, NEW.issue_id);
        END IF;
        
    ELSIF TG_TABLE_NAME = 'issue_comments' THEN
        notification_title := 'New Comment';
        notification_message := 'Someone commented on your reported issue';
        
        -- Don't notify if user commented on their own issue
        IF issue_reporter != NEW.user_id THEN
            INSERT INTO public.notifications (user_id, type, title, message, issue_id)
            VALUES (issue_reporter, 'new_comment', notification_title, notification_message, NEW.issue_id);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_issue_priority_on_upvote
    AFTER INSERT OR DELETE ON public.issue_upvotes
    FOR EACH ROW EXECUTE FUNCTION public.update_issue_priority_score();

CREATE TRIGGER update_issue_priority_on_issue_change
    AFTER INSERT OR UPDATE ON public.issues
    FOR EACH ROW EXECUTE FUNCTION public.update_issue_priority_score();

CREATE TRIGGER update_upvotes_count_trigger
    AFTER INSERT OR DELETE ON public.issue_upvotes
    FOR EACH ROW EXECUTE FUNCTION public.update_upvotes_count();

CREATE TRIGGER update_comments_count_trigger
    AFTER INSERT OR DELETE ON public.issue_comments
    FOR EACH ROW EXECUTE FUNCTION public.update_comments_count();

CREATE TRIGGER create_notification_on_update
    AFTER INSERT ON public.issue_updates
    FOR EACH ROW EXECUTE FUNCTION public.create_notification();

CREATE TRIGGER create_notification_on_upvote
    AFTER INSERT ON public.issue_upvotes
    FOR EACH ROW EXECUTE FUNCTION public.create_notification();

CREATE TRIGGER create_notification_on_comment
    AFTER INSERT ON public.issue_comments
    FOR EACH ROW EXECUTE FUNCTION public.create_notification();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add timestamp triggers
CREATE TRIGGER update_issues_updated_at
    BEFORE UPDATE ON public.issues
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_departments_updated_at
    BEFORE UPDATE ON public.departments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample departments
INSERT INTO public.departments (name, description, contact_email) VALUES
('Road Maintenance', 'Responsible for road repairs, potholes, and traffic infrastructure', 'roads@cityservices.gov'),
('Water Department', 'Water supply, sewage, and utilities management', 'water@cityservices.gov'),
('Sanitation Services', 'Waste collection, recycling, and cleanliness', 'sanitation@cityservices.gov'),
('Parks & Recreation', 'Parks, playgrounds, and recreational facilities', 'parks@cityservices.gov'),
('Public Safety', 'Emergency services and public safety concerns', 'safety@cityservices.gov'),
('Street Lighting', 'Street lights and electrical infrastructure', 'lighting@cityservices.gov')
ON CONFLICT (name) DO NOTHING;