export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      active_sessions: {
        Row: {
          created_at: string | null
          id: string
          last_active: string | null
          session_token: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_active?: string | null
          session_token?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_active?: string | null
          session_token?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ads: {
        Row: {
          ad_type: string | null
          advertiser_id: string
          budget: number | null
          clicks: number | null
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          image_url: string
          impressions: number | null
          is_active: boolean | null
          link_url: string
          spent: number | null
          starts_at: string | null
          title: string
        }
        Insert: {
          ad_type?: string | null
          advertiser_id: string
          budget?: number | null
          clicks?: number | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          image_url: string
          impressions?: number | null
          is_active?: boolean | null
          link_url: string
          spent?: number | null
          starts_at?: string | null
          title: string
        }
        Update: {
          ad_type?: string | null
          advertiser_id?: string
          budget?: number | null
          clicks?: number | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string
          impressions?: number | null
          is_active?: boolean | null
          link_url?: string
          spent?: number | null
          starts_at?: string | null
          title?: string
        }
        Relationships: []
      }
      ai_conversations: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      albums: {
        Row: {
          artist_id: string
          cover_url: string | null
          created_at: string
          description: string | null
          genre: string | null
          id: string
          is_published: boolean | null
          release_date: string | null
          title: string
        }
        Insert: {
          artist_id: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          genre?: string | null
          id?: string
          is_published?: boolean | null
          release_date?: string | null
          title: string
        }
        Update: {
          artist_id?: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          genre?: string | null
          id?: string
          is_published?: boolean | null
          release_date?: string | null
          title?: string
        }
        Relationships: []
      }
      artist_applications: {
        Row: {
          artist_name: string
          bio: string | null
          created_at: string
          genre: string
          id: string
          portfolio_urls: string[] | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          sample_track_url: string | null
          social_links: Json | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          artist_name: string
          bio?: string | null
          created_at?: string
          genre: string
          id?: string
          portfolio_urls?: string[] | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sample_track_url?: string | null
          social_links?: Json | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          artist_name?: string
          bio?: string | null
          created_at?: string
          genre?: string
          id?: string
          portfolio_urls?: string[] | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sample_track_url?: string | null
          social_links?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      artist_earnings: {
        Row: {
          amount: number
          artist_id: string
          created_at: string
          earning_type: string
          id: string
          reference_id: string | null
          token_symbol: string
        }
        Insert: {
          amount: number
          artist_id: string
          created_at?: string
          earning_type: string
          id?: string
          reference_id?: string | null
          token_symbol?: string
        }
        Update: {
          amount?: number
          artist_id?: string
          created_at?: string
          earning_type?: string
          id?: string
          reference_id?: string | null
          token_symbol?: string
        }
        Relationships: []
      }
      artist_ranks: {
        Row: {
          bonus_rate: number | null
          created_at: string | null
          id: string
          rank_level: number | null
          total_earnings: number | null
          total_streams: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bonus_rate?: number | null
          created_at?: string | null
          id?: string
          rank_level?: number | null
          total_earnings?: number | null
          total_streams?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bonus_rate?: number | null
          created_at?: string | null
          id?: string
          rank_level?: number | null
          total_earnings?: number | null
          total_streams?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      auction_bids: {
        Row: {
          auction_id: string
          bid_amount: number
          bidder_id: string
          created_at: string | null
          id: string
        }
        Insert: {
          auction_id: string
          bid_amount: number
          bidder_id: string
          created_at?: string | null
          id?: string
        }
        Update: {
          auction_id?: string
          bid_amount?: number
          bidder_id?: string
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "auction_bids_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
        ]
      }
      auctions: {
        Row: {
          created_at: string | null
          current_bid: number | null
          current_bidder_id: string | null
          ends_at: string
          id: string
          item_id: string
          item_type: string
          reserve_price: number | null
          seller_id: string
          starting_price: number
          status: string | null
        }
        Insert: {
          created_at?: string | null
          current_bid?: number | null
          current_bidder_id?: string | null
          ends_at: string
          id?: string
          item_id: string
          item_type: string
          reserve_price?: number | null
          seller_id: string
          starting_price: number
          status?: string | null
        }
        Update: {
          created_at?: string | null
          current_bid?: number | null
          current_bidder_id?: string | null
          ends_at?: string
          id?: string
          item_id?: string
          item_type?: string
          reserve_price?: number | null
          seller_id?: string
          starting_price?: number
          status?: string | null
        }
        Relationships: []
      }
      audio_space_participants: {
        Row: {
          id: string
          joined_at: string | null
          left_at: string | null
          role: string | null
          space_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          left_at?: string | null
          role?: string | null
          space_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          left_at?: string | null
          role?: string | null
          space_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audio_space_participants_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "audio_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_spaces: {
        Row: {
          created_at: string | null
          description: string | null
          ended_at: string | null
          host_id: string
          id: string
          is_live: boolean | null
          max_participants: number | null
          scheduled_at: string | null
          started_at: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          host_id: string
          id?: string
          is_live?: boolean | null
          max_participants?: number | null
          scheduled_at?: string | null
          started_at?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          host_id?: string
          id?: string
          is_live?: boolean | null
          max_participants?: number | null
          scheduled_at?: string | null
          started_at?: string | null
          title?: string
        }
        Relationships: []
      }
      burn_records: {
        Row: {
          amount: number
          burn_type: string
          burned_at: string | null
          id: string
          source_activity: string | null
          token_symbol: string
        }
        Insert: {
          amount: number
          burn_type: string
          burned_at?: string | null
          id?: string
          source_activity?: string | null
          token_symbol: string
        }
        Update: {
          amount?: number
          burn_type?: string
          burned_at?: string | null
          id?: string
          source_activity?: string | null
          token_symbol?: string
        }
        Relationships: []
      }
      business_profiles: {
        Row: {
          business_name: string
          created_at: string | null
          description: string | null
          id: string
          industry: string | null
          is_verified: boolean | null
          logo_url: string | null
          user_id: string
          verified_at: string | null
          verified_by: string | null
          website_url: string | null
        }
        Insert: {
          business_name: string
          created_at?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          is_verified?: boolean | null
          logo_url?: string | null
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
          website_url?: string | null
        }
        Update: {
          business_name?: string
          created_at?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          is_verified?: boolean | null
          logo_url?: string | null
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      channel_members: {
        Row: {
          channel_id: string
          id: string
          joined_at: string
          role: string | null
          user_id: string
        }
        Insert: {
          channel_id: string
          id?: string
          joined_at?: string
          role?: string | null
          user_id: string
        }
        Update: {
          channel_id?: string
          id?: string
          joined_at?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_members_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
        ]
      }
      channels: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string | null
          id: string
          is_verified: boolean | null
          join_type: string
          member_count: number | null
          name: string
          owner_id: string
          type: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_verified?: boolean | null
          join_type?: string
          member_count?: number | null
          name: string
          owner_id: string
          type?: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_verified?: boolean | null
          join_type?: string
          member_count?: number | null
          name?: string
          owner_id?: string
          type?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          message_type: string | null
          room_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          message_type?: string | null
          room_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          message_type?: string | null
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          cover_url: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          type: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          type?: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          type?: string
        }
        Relationships: []
      }
      daily_plays: {
        Row: {
          id: string
          play_date: string
          plays_count: number | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          play_date?: string
          plays_count?: number | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          play_date?: string
          plays_count?: number | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          message_type: string | null
          read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          message_type?: string | null
          read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          message_type?: string | null
          read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      event_tickets: {
        Row: {
          benefits: string | null
          created_at: string
          currency: string
          event_id: string
          id: string
          price: number
          sold_quantity: number
          ticket_type: string
          total_quantity: number
        }
        Insert: {
          benefits?: string | null
          created_at?: string
          currency?: string
          event_id: string
          id?: string
          price: number
          sold_quantity?: number
          ticket_type?: string
          total_quantity?: number
        }
        Update: {
          benefits?: string | null
          created_at?: string
          currency?: string
          event_id?: string
          id?: string
          price?: number
          sold_quantity?: number
          ticket_type?: string
          total_quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          cover_url: string | null
          created_at: string | null
          description: string | null
          ends_at: string | null
          event_type: string | null
          id: string
          is_virtual: boolean | null
          location: string | null
          max_attendees: number | null
          organizer_id: string
          starts_at: string
          title: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          ends_at?: string | null
          event_type?: string | null
          id?: string
          is_virtual?: boolean | null
          location?: string | null
          max_attendees?: number | null
          organizer_id: string
          starts_at: string
          title: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          ends_at?: string | null
          event_type?: string | null
          id?: string
          is_virtual?: boolean | null
          location?: string | null
          max_attendees?: number | null
          organizer_id?: string
          starts_at?: string
          title?: string
        }
        Relationships: []
      }
      fee_collections: {
        Row: {
          activity_type: string
          burned_amount: number | null
          created_at: string | null
          fee_amount: number
          id: string
          original_amount: number
          partnership_pool_amount: number | null
          token_symbol: string
        }
        Insert: {
          activity_type: string
          burned_amount?: number | null
          created_at?: string | null
          fee_amount: number
          id?: string
          original_amount: number
          partnership_pool_amount?: number | null
          token_symbol: string
        }
        Update: {
          activity_type?: string
          burned_amount?: number | null
          created_at?: string | null
          fee_amount?: number
          id?: string
          original_amount?: number
          partnership_pool_amount?: number | null
          token_symbol?: string
        }
        Relationships: []
      }
      feed_posts: {
        Row: {
          comments_count: number | null
          content: string | null
          created_at: string
          id: string
          likes_count: number | null
          media_urls: string[] | null
          post_type: string | null
          shares_count: number | null
          user_id: string
        }
        Insert: {
          comments_count?: number | null
          content?: string | null
          created_at?: string
          id?: string
          likes_count?: number | null
          media_urls?: string[] | null
          post_type?: string | null
          shares_count?: number | null
          user_id: string
        }
        Update: {
          comments_count?: number | null
          content?: string | null
          created_at?: string
          id?: string
          likes_count?: number | null
          media_urls?: string[] | null
          post_type?: string | null
          shares_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      giveaway_entries: {
        Row: {
          created_at: string
          giveaway_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          giveaway_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          giveaway_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "giveaway_entries_giveaway_id_fkey"
            columns: ["giveaway_id"]
            isOneToOne: false
            referencedRelation: "giveaways"
            referencedColumns: ["id"]
          },
        ]
      }
      giveaways: {
        Row: {
          created_at: string
          creator_id: string
          current_entries: number | null
          description: string | null
          ends_at: string
          entry_requirements: Json | null
          id: string
          max_entries: number | null
          prize_description: string | null
          prize_type: string
          prize_value: number | null
          starts_at: string
          status: string
          title: string
          winner_id: string | null
        }
        Insert: {
          created_at?: string
          creator_id: string
          current_entries?: number | null
          description?: string | null
          ends_at: string
          entry_requirements?: Json | null
          id?: string
          max_entries?: number | null
          prize_description?: string | null
          prize_type: string
          prize_value?: number | null
          starts_at?: string
          status?: string
          title: string
          winner_id?: string | null
        }
        Update: {
          created_at?: string
          creator_id?: string
          current_entries?: number | null
          description?: string | null
          ends_at?: string
          entry_requirements?: Json | null
          id?: string
          max_entries?: number | null
          prize_description?: string | null
          prize_type?: string
          prize_value?: number | null
          starts_at?: string
          status?: string
          title?: string
          winner_id?: string | null
        }
        Relationships: []
      }
      learning_courses: {
        Row: {
          audio_url: string | null
          category: string | null
          cover_url: string | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          duration_minutes: number | null
          has_certification: boolean | null
          id: string
          instructor_id: string
          is_free: boolean | null
          is_published: boolean | null
          pdf_url: string | null
          price: number | null
          reward_thdr: number | null
          title: string
          total_hours: number | null
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          audio_url?: string | null
          category?: string | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          has_certification?: boolean | null
          id?: string
          instructor_id: string
          is_free?: boolean | null
          is_published?: boolean | null
          pdf_url?: string | null
          price?: number | null
          reward_thdr?: number | null
          title: string
          total_hours?: number | null
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          audio_url?: string | null
          category?: string | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          has_certification?: boolean | null
          id?: string
          instructor_id?: string
          is_free?: boolean | null
          is_published?: boolean | null
          pdf_url?: string | null
          price?: number | null
          reward_thdr?: number | null
          title?: string
          total_hours?: number | null
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      learning_lessons: {
        Row: {
          content: string | null
          course_id: string
          created_at: string | null
          duration_minutes: number | null
          id: string
          order_index: number
          title: string
          video_url: string | null
        }
        Insert: {
          content?: string | null
          course_id: string
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          order_index: number
          title: string
          video_url?: string | null
        }
        Update: {
          content?: string | null
          course_id?: string
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          order_index?: number
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "learning_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          course_id: string
          created_at: string | null
          id: string
          lesson_id: string | null
          progress_percent: number | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          course_id: string
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          progress_percent?: number | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          course_id?: string
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          progress_percent?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "learning_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "learning_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      liquidity_pools: {
        Row: {
          created_at: string | null
          fee_rate: number | null
          id: string
          pool_name: string
          reserve_a: number
          reserve_b: number
          token_a: string
          token_b: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fee_rate?: number | null
          id?: string
          pool_name: string
          reserve_a: number
          reserve_b: number
          token_a: string
          token_b: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fee_rate?: number | null
          id?: string
          pool_name?: string
          reserve_a?: number
          reserve_b?: number
          token_a?: string
          token_b?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      login_bonuses: {
        Row: {
          amount: number
          bonus_date: string
          claimed_at: string
          id: string
          user_id: string
        }
        Insert: {
          amount?: number
          bonus_date?: string
          claimed_at?: string
          id?: string
          user_id: string
        }
        Update: {
          amount?: number
          bonus_date?: string
          claimed_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      merch_purchases: {
        Row: {
          burned_amount: number
          buyer_id: string
          created_at: string | null
          id: string
          merch_id: string | null
          partnership_pool_amount: number
          platform_fee: number
          price: number
          seller_id: string
        }
        Insert: {
          burned_amount: number
          buyer_id: string
          created_at?: string | null
          id?: string
          merch_id?: string | null
          partnership_pool_amount: number
          platform_fee: number
          price: number
          seller_id: string
        }
        Update: {
          burned_amount?: number
          buyer_id?: string
          created_at?: string | null
          id?: string
          merch_id?: string | null
          partnership_pool_amount?: number
          platform_fee?: number
          price?: number
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "merch_purchases_merch_id_fkey"
            columns: ["merch_id"]
            isOneToOne: false
            referencedRelation: "merchs"
            referencedColumns: ["id"]
          },
        ]
      }
      merchs: {
        Row: {
          category: string | null
          cover_url: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          is_active: boolean | null
          price: number
          seller_id: string
          stock: number | null
          title: string
        }
        Insert: {
          category?: string | null
          cover_url?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          price: number
          seller_id: string
          stock?: number | null
          title: string
        }
        Update: {
          category?: string | null
          cover_url?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          price?: number
          seller_id?: string
          stock?: number | null
          title?: string
        }
        Relationships: []
      }
      moderation_actions: {
        Row: {
          action_type: string
          created_at: string | null
          id: string
          moderator_id: string
          reason: string | null
          resolved_at: string | null
          status: string | null
          target_content_id: string | null
          target_user_id: string | null
          votes_received: number | null
          votes_required: number | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          id?: string
          moderator_id: string
          reason?: string | null
          resolved_at?: string | null
          status?: string | null
          target_content_id?: string | null
          target_user_id?: string | null
          votes_received?: number | null
          votes_required?: number | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          id?: string
          moderator_id?: string
          reason?: string | null
          resolved_at?: string | null
          status?: string | null
          target_content_id?: string | null
          target_user_id?: string | null
          votes_received?: number | null
          votes_required?: number | null
        }
        Relationships: []
      }
      moderation_votes: {
        Row: {
          action_id: string
          created_at: string | null
          id: string
          moderator_id: string
          vote: string
        }
        Insert: {
          action_id: string
          created_at?: string | null
          id?: string
          moderator_id: string
          vote: string
        }
        Update: {
          action_id?: string
          created_at?: string | null
          id?: string
          moderator_id?: string
          vote?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderation_votes_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "moderation_actions"
            referencedColumns: ["id"]
          },
        ]
      }
      moderator_applications: {
        Row: {
          availability_hours: number | null
          created_at: string
          experience: string | null
          id: string
          languages: string[] | null
          motivation: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          availability_hours?: number | null
          created_at?: string
          experience?: string | null
          id?: string
          languages?: string[] | null
          motivation: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          availability_hours?: number | null
          created_at?: string
          experience?: string | null
          id?: string
          languages?: string[] | null
          motivation?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      moderator_ranks: {
        Row: {
          accuracy_score: number | null
          actions_completed: number | null
          bonus_rate: number | null
          created_at: string | null
          id: string
          rank_level: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accuracy_score?: number | null
          actions_completed?: number | null
          bonus_rate?: number | null
          created_at?: string | null
          id?: string
          rank_level?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accuracy_score?: number | null
          actions_completed?: number | null
          bonus_rate?: number | null
          created_at?: string | null
          id?: string
          rank_level?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      nft_listings: {
        Row: {
          artist_id: string
          audio_url: string | null
          category: string | null
          cover_url: string
          created_at: string
          currency: string
          description: string | null
          id: string
          is_active: boolean | null
          price: number
          remaining_supply: number | null
          title: string
          total_supply: number | null
        }
        Insert: {
          artist_id: string
          audio_url?: string | null
          category?: string | null
          cover_url: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          price?: number
          remaining_supply?: number | null
          title: string
          total_supply?: number | null
        }
        Update: {
          artist_id?: string
          audio_url?: string | null
          category?: string | null
          cover_url?: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          price?: number
          remaining_supply?: number | null
          title?: string
          total_supply?: number | null
        }
        Relationships: []
      }
      nft_purchases: {
        Row: {
          buyer_id: string
          currency: string
          id: string
          listing_id: string | null
          price: number
          purchased_at: string
          seller_id: string
        }
        Insert: {
          buyer_id: string
          currency?: string
          id?: string
          listing_id?: string | null
          price: number
          purchased_at?: string
          seller_id: string
        }
        Update: {
          buyer_id?: string
          currency?: string
          id?: string
          listing_id?: string | null
          price?: number
          purchased_at?: string
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nft_purchases_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "nft_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string
          dm_received: boolean | null
          earnings_updates: boolean | null
          email_notifications: boolean | null
          id: string
          new_comment: boolean | null
          new_follower: boolean | null
          new_release: boolean | null
          post_liked: boolean | null
          promotions: boolean | null
          push_notifications: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dm_received?: boolean | null
          earnings_updates?: boolean | null
          email_notifications?: boolean | null
          id?: string
          new_comment?: boolean | null
          new_follower?: boolean | null
          new_release?: boolean | null
          post_liked?: boolean | null
          promotions?: boolean | null
          push_notifications?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dm_received?: boolean | null
          earnings_updates?: boolean | null
          email_notifications?: boolean | null
          id?: string
          new_comment?: boolean | null
          new_follower?: boolean | null
          new_release?: boolean | null
          post_liked?: boolean | null
          promotions?: boolean | null
          push_notifications?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      poll_votes: {
        Row: {
          created_at: string | null
          id: string
          option_index: number
          poll_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_index: number
          poll_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          option_index?: number
          poll_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          created_at: string | null
          creator_id: string
          ends_at: string | null
          id: string
          is_active: boolean | null
          options: Json
          question: string
        }
        Insert: {
          created_at?: string | null
          creator_id: string
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          options: Json
          question: string
        }
        Update: {
          created_at?: string | null
          creator_id?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          options?: Json
          question?: string
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reactions: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          reaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          comments_count: number | null
          content: string | null
          created_at: string | null
          id: string
          likes_count: number | null
          media_urls: string[] | null
          post_type: string | null
          shares_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          id?: string
          likes_count?: number | null
          media_urls?: string[] | null
          post_type?: string | null
          shares_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          id?: string
          likes_count?: number | null
          media_urls?: string[] | null
          post_type?: string | null
          shares_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          full_name: string | null
          id: string
          ion_balance: number | null
          is_artist_pending: boolean | null
          is_moderator_pending: boolean | null
          phone: string | null
          referral_code: string | null
          referred_by: string | null
          thdr_balance: number | null
          tier: string
          total_likes: number | null
          total_streams: number | null
          updated_at: string
          user_id: string
          username: string | null
          web3_wallet_address: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          ion_balance?: number | null
          is_artist_pending?: boolean | null
          is_moderator_pending?: boolean | null
          phone?: string | null
          referral_code?: string | null
          referred_by?: string | null
          thdr_balance?: number | null
          tier?: string
          total_likes?: number | null
          total_streams?: number | null
          updated_at?: string
          user_id: string
          username?: string | null
          web3_wallet_address?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          ion_balance?: number | null
          is_artist_pending?: boolean | null
          is_moderator_pending?: boolean | null
          phone?: string | null
          referral_code?: string | null
          referred_by?: string | null
          thdr_balance?: number | null
          tier?: string
          total_likes?: number | null
          total_streams?: number | null
          updated_at?: string
          user_id?: string
          username?: string | null
          web3_wallet_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string | null
          id: string
          referred_id: string
          referrer_id: string
          reward_earned: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          referred_id: string
          referrer_id: string
          reward_earned?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          referred_id?: string
          referrer_id?: string
          reward_earned?: number | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          content_id: string | null
          content_type: string
          created_at: string
          description: string | null
          id: string
          reason: string
          reported_user_id: string | null
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          content_id?: string | null
          content_type: string
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reported_user_id?: string | null
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          content_id?: string | null
          content_type?: string
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reported_user_id?: string | null
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: []
      }
      reward_activities: {
        Row: {
          activity_type: string
          base_reward: number
          created_at: string | null
          final_reward: number
          id: string
          multiplier: number | null
          reference_id: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          base_reward: number
          created_at?: string | null
          final_reward: number
          id?: string
          multiplier?: number | null
          reference_id?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          base_reward?: number
          created_at?: string | null
          final_reward?: number
          id?: string
          multiplier?: number | null
          reference_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reward_multipliers: {
        Row: {
          description: string | null
          id: string
          multiplier: number
          role: string
          updated_at: string
        }
        Insert: {
          description?: string | null
          id?: string
          multiplier?: number
          role: string
          updated_at?: string
        }
        Update: {
          description?: string | null
          id?: string
          multiplier?: number
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string | null
          discount_applied: number | null
          expires_at: string
          id: string
          months_purchased: number
          plan_type: string
          price_paid: number
          starts_at: string | null
          token_used: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          discount_applied?: number | null
          expires_at: string
          id?: string
          months_purchased: number
          plan_type: string
          price_paid: number
          starts_at?: string | null
          token_used: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          discount_applied?: number | null
          expires_at?: string
          id?: string
          months_purchased?: number
          plan_type?: string
          price_paid?: number
          starts_at?: string | null
          token_used?: string
          user_id?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string
          id: string
          message: string
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          id?: string
          message: string
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          id?: string
          message?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ticket_delegations: {
        Row: {
          artist_id: string
          commission_percent: number
          created_at: string | null
          delegate_id: string
          event_id: string
          id: string
          max_tickets: number | null
          sold_tickets: number | null
          status: string | null
        }
        Insert: {
          artist_id: string
          commission_percent?: number
          created_at?: string | null
          delegate_id: string
          event_id: string
          id?: string
          max_tickets?: number | null
          sold_tickets?: number | null
          status?: string | null
        }
        Update: {
          artist_id?: string
          commission_percent?: number
          created_at?: string | null
          delegate_id?: string
          event_id?: string
          id?: string
          max_tickets?: number | null
          sold_tickets?: number | null
          status?: string | null
        }
        Relationships: []
      }
      ticket_purchases: {
        Row: {
          buyer_id: string
          id: string
          purchased_at: string
          qr_code: string | null
          quantity: number
          status: string
          ticket_id: string
          total_price: number
        }
        Insert: {
          buyer_id: string
          id?: string
          purchased_at?: string
          qr_code?: string | null
          quantity?: number
          status?: string
          ticket_id: string
          total_price: number
        }
        Update: {
          buyer_id?: string
          id?: string
          purchased_at?: string
          qr_code?: string | null
          quantity?: number
          status?: string
          ticket_id?: string
          total_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "ticket_purchases_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "event_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tips: {
        Row: {
          amount: number
          created_at: string
          from_user_id: string
          id: string
          message: string | null
          to_artist_id: string
          token_symbol: string
        }
        Insert: {
          amount: number
          created_at?: string
          from_user_id: string
          id?: string
          message?: string | null
          to_artist_id: string
          token_symbol?: string
        }
        Update: {
          amount?: number
          created_at?: string
          from_user_id?: string
          id?: string
          message?: string | null
          to_artist_id?: string
          token_symbol?: string
        }
        Relationships: []
      }
      token_prices: {
        Row: {
          id: string
          last_updated: string | null
          price_change_24h: number | null
          price_usd: number
          token_symbol: string
        }
        Insert: {
          id?: string
          last_updated?: string | null
          price_change_24h?: number | null
          price_usd: number
          token_symbol: string
        }
        Update: {
          id?: string
          last_updated?: string | null
          price_change_24h?: number | null
          price_usd?: number
          token_symbol?: string
        }
        Relationships: []
      }
      token_supply: {
        Row: {
          created_at: string | null
          current_supply: number
          id: string
          initial_supply: number
          pool_name: string
          token_symbol: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_supply: number
          id?: string
          initial_supply: number
          pool_name: string
          token_symbol: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_supply?: number
          id?: string
          initial_supply?: number
          pool_name?: string
          token_symbol?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      track_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          track_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          track_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          track_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "track_comments_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      track_reactions: {
        Row: {
          created_at: string
          id: string
          reaction_type: string
          track_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reaction_type: string
          track_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reaction_type?: string
          track_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "track_reactions_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      tracks: {
        Row: {
          album_id: string | null
          artist: string
          artist_id: string | null
          audio_url: string | null
          cover_url: string | null
          created_at: string
          duration: string | null
          genre: string | null
          id: string
          likes_count: number | null
          lyrics: string | null
          plays_count: number | null
          story: string | null
          title: string
          video_url: string | null
        }
        Insert: {
          album_id?: string | null
          artist: string
          artist_id?: string | null
          audio_url?: string | null
          cover_url?: string | null
          created_at?: string
          duration?: string | null
          genre?: string | null
          id?: string
          likes_count?: number | null
          lyrics?: string | null
          plays_count?: number | null
          story?: string | null
          title: string
          video_url?: string | null
        }
        Update: {
          album_id?: string | null
          artist?: string
          artist_id?: string | null
          audio_url?: string | null
          cover_url?: string | null
          created_at?: string
          duration?: string | null
          genre?: string | null
          id?: string
          likes_count?: number | null
          lyrics?: string | null
          plays_count?: number | null
          story?: string | null
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tracks_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions_ledger: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          fee_amount: number | null
          from_email: string | null
          from_user_id: string | null
          from_wallet_address: string | null
          id: string
          metadata: Json | null
          status: string | null
          to_email: string | null
          to_user_id: string | null
          to_wallet_address: string | null
          token_symbol: string
          transaction_hash: string
          transaction_type: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          fee_amount?: number | null
          from_email?: string | null
          from_user_id?: string | null
          from_wallet_address?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          to_email?: string | null
          to_user_id?: string | null
          to_wallet_address?: string | null
          token_symbol?: string
          transaction_hash?: string
          transaction_type: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          fee_amount?: number | null
          from_email?: string | null
          from_user_id?: string | null
          from_wallet_address?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          to_email?: string | null
          to_user_id?: string | null
          to_wallet_address?: string | null
          token_symbol?: string
          transaction_hash?: string
          transaction_type?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_name: string
          achievement_type: string
          description: string | null
          earned_at: string
          id: string
          reward_amount: number | null
          user_id: string
        }
        Insert: {
          achievement_name: string
          achievement_type: string
          description?: string | null
          earned_at?: string
          id?: string
          reward_amount?: number | null
          user_id: string
        }
        Update: {
          achievement_name?: string
          achievement_type?: string
          description?: string | null
          earned_at?: string
          id?: string
          reward_amount?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string | null
          id: string
          language: string | null
          music_preferences: Json | null
          notification_settings: Json | null
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          language?: string | null
          music_preferences?: Json | null
          notification_settings?: Json | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          language?: string | null
          music_preferences?: Json | null
          notification_settings?: Json | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          expires_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          expires_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          expires_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_wallets: {
        Row: {
          created_at: string | null
          id: string
          ion_balance: number | null
          thdr_balance: number | null
          updated_at: string | null
          usdt_balance: number | null
          user_id: string
          wallet_address: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          ion_balance?: number | null
          thdr_balance?: number | null
          updated_at?: string | null
          usdt_balance?: number | null
          user_id: string
          wallet_address: string
        }
        Update: {
          created_at?: string | null
          id?: string
          ion_balance?: number | null
          thdr_balance?: number | null
          updated_at?: string | null
          usdt_balance?: number | null
          user_id?: string
          wallet_address?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string | null
          fee: number | null
          from_user_id: string | null
          id: string
          reference_id: string | null
          status: string | null
          to_user_id: string | null
          token_symbol: string
          transaction_type: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          fee?: number | null
          from_user_id?: string | null
          id?: string
          reference_id?: string | null
          status?: string | null
          to_user_id?: string | null
          token_symbol: string
          transaction_type: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          fee?: number | null
          from_user_id?: string | null
          id?: string
          reference_id?: string | null
          status?: string | null
          to_user_id?: string | null
          token_symbol?: string
          transaction_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_artist_application: {
        Args: { p_admin_id: string; p_application_id: string }
        Returns: boolean
      }
      approve_moderator_application: {
        Args: { p_admin_id: string; p_application_id: string }
        Returns: boolean
      }
      burn_tokens: {
        Args: {
          p_amount: number
          p_burn_type: string
          p_source: string
          p_token: string
        }
        Returns: undefined
      }
      calculate_reward: {
        Args: {
          p_activity_type: string
          p_base_reward: number
          p_user_id: string
        }
        Returns: number
      }
      claim_login_bonus: { Args: { p_user_id: string }; Returns: boolean }
      generate_username: { Args: { p_email: string }; Returns: string }
      generate_wallet_address: { Args: never; Returns: string }
      grant_admin_role: {
        Args: { p_admin_id: string; p_user_email: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      process_platform_fee: {
        Args: { p_activity_type: string; p_amount: number; p_token: string }
        Returns: undefined
      }
      record_transaction: {
        Args: {
          p_amount: number
          p_description?: string
          p_fee?: number
          p_from_user_id: string
          p_to_user_id: string
          p_token?: string
          p_type: string
        }
        Returns: string
      }
      send_tip: {
        Args: {
          p_amount: number
          p_from_user: string
          p_message?: string
          p_to_artist: string
          p_token?: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "free"
        | "premium"
        | "vip"
        | "artist"
        | "moderator"
        | "business"
        | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "free",
        "premium",
        "vip",
        "artist",
        "moderator",
        "business",
        "admin",
      ],
    },
  },
} as const
