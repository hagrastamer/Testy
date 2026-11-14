
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
          is_premium: boolean;
          premium_expires_at: string | null;
          notification_preferences: Json | null;
          privacy_settings: Json | null;
        };
        Insert: {
          id: string;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
          is_premium?: boolean;
          premium_expires_at?: string | null;
          notification_preferences?: Json | null;
          privacy_settings?: Json | null;
        };
        Update: {
          id?: string;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
          is_premium?: boolean;
          premium_expires_at?: string | null;
          notification_preferences?: Json | null;
          privacy_settings?: Json | null;
        };
      };
      pets: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          animal_type: string;
          breed: string | null;
          gender: string | null;
          date_of_birth: string | null;
          weight: number | null;
          color: string | null;
          adoption_date: string | null;
          notes: string | null;
          medical_info: Json | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          animal_type: string;
          breed?: string | null;
          gender?: string | null;
          date_of_birth?: string | null;
          weight?: number | null;
          color?: string | null;
          adoption_date?: string | null;
          notes?: string | null;
          medical_info?: Json | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          animal_type?: string;
          breed?: string | null;
          gender?: string | null;
          date_of_birth?: string | null;
          weight?: number | null;
          color?: string | null;
          adoption_date?: string | null;
          notes?: string | null;
          medical_info?: Json | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      care_tasks: {
        Row: {
          id: string;
          pet_id: string;
          user_id: string;
          title: string;
          description: string | null;
          category: string;
          scheduled_date: string;
          scheduled_time: string | null;
          recurrence: string;
          recurrence_days: number[] | null;
          notes: string | null;
          is_completed: boolean;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          pet_id: string;
          user_id: string;
          title: string;
          description?: string | null;
          category: string;
          scheduled_date: string;
          scheduled_time?: string | null;
          recurrence?: string;
          recurrence_days?: number[] | null;
          notes?: string | null;
          is_completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          pet_id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          category?: string;
          scheduled_date?: string;
          scheduled_time?: string | null;
          recurrence?: string;
          recurrence_days?: number[] | null;
          notes?: string | null;
          is_completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      care_logs: {
        Row: {
          id: string;
          task_id: string;
          pet_id: string;
          user_id: string;
          completed_at: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          pet_id: string;
          user_id: string;
          completed_at?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          pet_id?: string;
          user_id?: string;
          completed_at?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
      health_records: {
        Row: {
          id: string;
          pet_id: string;
          user_id: string;
          type: string;
          title: string;
          description: string | null;
          date: string;
          veterinarian: string | null;
          clinic: string | null;
          notes: string | null;
          attachments: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          pet_id: string;
          user_id: string;
          type: string;
          title: string;
          description?: string | null;
          date: string;
          veterinarian?: string | null;
          clinic?: string | null;
          notes?: string | null;
          attachments?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          pet_id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          description?: string | null;
          date?: string;
          veterinarian?: string | null;
          clinic?: string | null;
          notes?: string | null;
          attachments?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      vaccinations: {
        Row: {
          id: string;
          pet_id: string;
          user_id: string;
          vaccine_name: string;
          date_administered: string;
          next_due_date: string | null;
          veterinarian: string | null;
          clinic: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          pet_id: string;
          user_id: string;
          vaccine_name: string;
          date_administered: string;
          next_due_date?: string | null;
          veterinarian?: string | null;
          clinic?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          pet_id?: string;
          user_id?: string;
          vaccine_name?: string;
          date_administered?: string;
          next_due_date?: string | null;
          veterinarian?: string | null;
          clinic?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      medications: {
        Row: {
          id: string;
          pet_id: string;
          user_id: string;
          name: string;
          dosage: string | null;
          frequency: string | null;
          start_date: string;
          end_date: string | null;
          veterinarian: string | null;
          notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          pet_id: string;
          user_id: string;
          name: string;
          dosage?: string | null;
          frequency?: string | null;
          start_date: string;
          end_date?: string | null;
          veterinarian?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          pet_id?: string;
          user_id?: string;
          name?: string;
          dosage?: string | null;
          frequency?: string | null;
          start_date?: string;
          end_date?: string | null;
          veterinarian?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      vet_appointments: {
        Row: {
          id: string;
          pet_id: string;
          user_id: string;
          title: string;
          date: string;
          time: string | null;
          clinic: string | null;
          veterinarian: string | null;
          notes: string | null;
          follow_up_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          pet_id: string;
          user_id: string;
          title: string;
          date: string;
          time?: string | null;
          clinic?: string | null;
          veterinarian?: string | null;
          notes?: string | null;
          follow_up_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          pet_id?: string;
          user_id?: string;
          title?: string;
          date?: string;
          time?: string | null;
          clinic?: string | null;
          veterinarian?: string | null;
          notes?: string | null;
          follow_up_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      weight_records: {
        Row: {
          id: string;
          pet_id: string;
          user_id: string;
          weight: number;
          unit: string;
          date: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          pet_id: string;
          user_id: string;
          weight: number;
          unit?: string;
          date: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          pet_id?: string;
          user_id?: string;
          weight?: number;
          unit?: string;
          date?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          pet_id: string | null;
          content: string;
          hashtags: string[] | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          pet_id?: string | null;
          content: string;
          hashtags?: string[] | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          pet_id?: string | null;
          content?: string;
          hashtags?: string[] | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      post_media: {
        Row: {
          id: string;
          post_id: string;
          url: string;
          type: string;
          order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          url: string;
          type: string;
          order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          url?: string;
          type?: string;
          order?: number;
          created_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          content: string;
          parent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          content: string;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          content?: string;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      likes: {
        Row: {
          id: string;
          user_id: string;
          post_id: string | null;
          comment_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id?: string | null;
          comment_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          post_id?: string | null;
          comment_id?: string | null;
          created_at?: string;
        };
      };
      saved_posts: {
        Row: {
          id: string;
          user_id: string;
          post_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          post_id?: string;
          created_at?: string;
        };
      };
      follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
      };
      hashtags: {
        Row: {
          id: string;
          name: string;
          post_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          post_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          post_count?: number;
          created_at?: string;
        };
      };
      post_hashtags: {
        Row: {
          post_id: string;
          hashtag_id: string;
        };
        Insert: {
          post_id: string;
          hashtag_id: string;
        };
        Update: {
          post_id?: string;
          hashtag_id?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string | null;
          data: Json | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          message?: string | null;
          data?: Json | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          message?: string | null;
          data?: Json | null;
          is_read?: boolean;
          created_at?: string;
        };
      };
      notification_preferences: {
        Row: {
          id: string;
          user_id: string;
          push_enabled: boolean;
          email_enabled: boolean;
          care_reminders: boolean;
          medication_reminders: boolean;
          vaccination_reminders: boolean;
          appointment_reminders: boolean;
          social_notifications: boolean;
          reminder_time: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          push_enabled?: boolean;
          email_enabled?: boolean;
          care_reminders?: boolean;
          medication_reminders?: boolean;
          vaccination_reminders?: boolean;
          appointment_reminders?: boolean;
          social_notifications?: boolean;
          reminder_time?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          push_enabled?: boolean;
          email_enabled?: boolean;
          care_reminders?: boolean;
          medication_reminders?: boolean;
          vaccination_reminders?: boolean;
          appointment_reminders?: boolean;
          social_notifications?: boolean;
          reminder_time?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: string;
          status: string;
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end: boolean;
          payment_provider: string | null;
          payment_provider_customer_id: string | null;
          payment_provider_subscription_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan: string;
          status: string;
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end?: boolean;
          payment_provider?: string | null;
          payment_provider_customer_id?: string | null;
          payment_provider_subscription_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan?: string;
          status?: string;
          current_period_start?: string;
          current_period_end?: string;
          cancel_at_period_end?: boolean;
          payment_provider?: string | null;
          payment_provider_customer_id?: string | null;
          payment_provider_subscription_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscription_events: {
        Row: {
          id: string;
          subscription_id: string;
          event_type: string;
          payload: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          subscription_id: string;
          event_type: string;
          payload: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          subscription_id?: string;
          event_type?: string;
          payload?: Json;
          created_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          reported_type: string;
          reported_id: string;
          reason: string;
          description: string | null;
          status: string;
          resolved_by: string | null;
          resolved_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          reported_type: string;
          reported_id: string;
          reason: string;
          description?: string | null;
          status?: string;
          resolved_by?: string | null;
          resolved_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          reporter_id?: string;
          reported_type?: string;
          reported_id?: string;
          reason?: string;
          description?: string | null;
          status?: string;
          resolved_by?: string | null;
          resolved_at?: string | null;
          created_at?: string;
        };
      };
      blocked_users: {
        Row: {
          id: string;
          blocker_id: string;
          blocked_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          blocker_id: string;
          blocked_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          blocker_id?: string;
          blocked_id?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_user_pet_count: {
        Args: { user_id: string };
        Returns: number;
      };
      is_user_premium: {
        Args: { user_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      pet_animal_type: 'dog' | 'cat' | 'bird' | 'rabbit' | 'fish' | 'other';
      care_category: 'feeding' | 'water' | 'walking' | 'exercise' | 'bathing' | 'grooming' | 'cleaning' | 'medication' | 'general' | 'custom';
      health_record_type: 'weight' | 'vaccination' | 'medication' | 'vet_visit' | 'medical_note' | 'observation';
      subscription_plan: 'free' | 'plus';
      subscription_status: 'active' | 'canceled' | 'expired' | 'pending';
      report_status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
      notification_type: 'care_reminder' | 'medication_reminder' | 'vaccination_due' | 'appointment_reminder' | 'new_follower' | 'like' | 'comment' | 'mention' | 'system';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
