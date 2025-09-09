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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      access_cards: {
        Row: {
          access_zones: string[] | null
          card_number: string
          card_type: string
          created_at: string
          district_id: string | null
          expiry_date: string | null
          id: string
          is_active: boolean
          issued_date: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          access_zones?: string[] | null
          card_number: string
          card_type?: string
          created_at?: string
          district_id?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean
          issued_date?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          access_zones?: string[] | null
          card_number?: string
          card_type?: string
          created_at?: string
          district_id?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean
          issued_date?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "access_cards_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_cards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_access_cards_district_id"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      access_logs: {
        Row: {
          access_time: string
          access_type: string
          card_id: string | null
          created_at: string
          district_id: string | null
          door_controller_id: string | null
          failure_reason: string | null
          id: string
          location: string
          success: boolean
          user_id: string | null
        }
        Insert: {
          access_time?: string
          access_type: string
          card_id?: string | null
          created_at?: string
          district_id?: string | null
          door_controller_id?: string | null
          failure_reason?: string | null
          id?: string
          location: string
          success?: boolean
          user_id?: string | null
        }
        Update: {
          access_time?: string
          access_type?: string
          card_id?: string | null
          created_at?: string
          district_id?: string | null
          door_controller_id?: string | null
          failure_reason?: string | null
          id?: string
          location?: string
          success?: boolean
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "access_logs_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "access_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_logs_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_access_logs_card_id"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "access_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      advertisements: {
        Row: {
          advertiser_id: string
          business_name: string
          category: string
          click_count: number | null
          condition_status: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          currency: string | null
          description: string | null
          district_id: string | null
          end_date: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          is_in_stock: boolean | null
          low_stock_alert: number | null
          price: number | null
          product_dimensions: string | null
          product_type: string | null
          product_weight: number | null
          return_policy: string | null
          service_areas: string[] | null
          shipping_cost: number | null
          shipping_required: boolean | null
          start_date: string | null
          stock_quantity: number | null
          tags: string[] | null
          title: string
          updated_at: string
          warranty_period: string | null
          website_url: string | null
        }
        Insert: {
          advertiser_id: string
          business_name: string
          category?: string
          click_count?: number | null
          condition_status?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          district_id?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          is_in_stock?: boolean | null
          low_stock_alert?: number | null
          price?: number | null
          product_dimensions?: string | null
          product_type?: string | null
          product_weight?: number | null
          return_policy?: string | null
          service_areas?: string[] | null
          shipping_cost?: number | null
          shipping_required?: boolean | null
          start_date?: string | null
          stock_quantity?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string
          warranty_period?: string | null
          website_url?: string | null
        }
        Update: {
          advertiser_id?: string
          business_name?: string
          category?: string
          click_count?: number | null
          condition_status?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          district_id?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          is_in_stock?: boolean | null
          low_stock_alert?: number | null
          price?: number | null
          product_dimensions?: string | null
          product_type?: string | null
          product_weight?: number | null
          return_policy?: string | null
          service_areas?: string[] | null
          shipping_cost?: number | null
          shipping_required?: boolean | null
          start_date?: string | null
          stock_quantity?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          warranty_period?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "advertisements_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      announcement_bookmarks: {
        Row: {
          announcement_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          announcement_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          announcement_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_bookmarks_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_announcement_bookmarks_announcement_id"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      announcement_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      announcement_comments: {
        Row: {
          announcement_id: string
          content: string
          created_at: string | null
          edited_at: string | null
          id: string
          is_edited: boolean | null
          parent_comment_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          announcement_id: string
          content: string
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          parent_comment_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          announcement_id?: string
          content?: string
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          parent_comment_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_comments_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcement_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "announcement_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_announcement_comments_announcement_id"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_announcement_comments_parent_id"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "announcement_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      announcement_polls: {
        Row: {
          allow_multiple_votes: boolean
          announcement_id: string
          created_at: string
          created_by: string
          description: string | null
          expires_at: string | null
          id: string
          is_anonymous: boolean
          title: string
          updated_at: string
        }
        Insert: {
          allow_multiple_votes?: boolean
          announcement_id: string
          created_at?: string
          created_by: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_anonymous?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          allow_multiple_votes?: boolean
          announcement_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_anonymous?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_polls_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      announcement_reactions: {
        Row: {
          announcement_id: string
          created_at: string | null
          id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          announcement_id: string
          created_at?: string | null
          id?: string
          reaction_type: string
          user_id: string
        }
        Update: {
          announcement_id?: string
          created_at?: string | null
          id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_reactions_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      announcement_read_receipts: {
        Row: {
          announcement_id: string
          id: string
          read_at: string | null
          read_percentage: number | null
          user_id: string
        }
        Insert: {
          announcement_id: string
          id?: string
          read_at?: string | null
          read_percentage?: number | null
          user_id: string
        }
        Update: {
          announcement_id?: string
          id?: string
          read_at?: string | null
          read_percentage?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_read_receipts_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      announcement_views: {
        Row: {
          announcement_id: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string
          viewed_at: string | null
        }
        Insert: {
          announcement_id: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id: string
          viewed_at?: string | null
        }
        Update: {
          announcement_id?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcement_views_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          attachments: Json | null
          author_id: string | null
          community_id: string | null
          content: string
          content_en: string | null
          content_ms: string | null
          created_at: string | null
          district_id: string | null
          expire_at: string | null
          id: string
          image_url: string | null
          images: Json | null
          is_pinned: boolean | null
          is_published: boolean | null
          is_urgent: boolean | null
          publish_at: string | null
          reading_time_minutes: number | null
          scope: string | null
          title: string
          title_en: string | null
          title_ms: string | null
          type: Database["public"]["Enums"]["announcement_type"] | null
          updated_at: string | null
        }
        Insert: {
          attachments?: Json | null
          author_id?: string | null
          community_id?: string | null
          content: string
          content_en?: string | null
          content_ms?: string | null
          created_at?: string | null
          district_id?: string | null
          expire_at?: string | null
          id?: string
          image_url?: string | null
          images?: Json | null
          is_pinned?: boolean | null
          is_published?: boolean | null
          is_urgent?: boolean | null
          publish_at?: string | null
          reading_time_minutes?: number | null
          scope?: string | null
          title: string
          title_en?: string | null
          title_ms?: string | null
          type?: Database["public"]["Enums"]["announcement_type"] | null
          updated_at?: string | null
        }
        Update: {
          attachments?: Json | null
          author_id?: string | null
          community_id?: string | null
          content?: string
          content_en?: string | null
          content_ms?: string | null
          created_at?: string | null
          district_id?: string | null
          expire_at?: string | null
          id?: string
          image_url?: string | null
          images?: Json | null
          is_pinned?: boolean | null
          is_published?: boolean | null
          is_urgent?: boolean | null
          publish_at?: string | null
          reading_time_minutes?: number | null
          scope?: string | null
          title?: string
          title_en?: string | null
          title_ms?: string | null
          type?: Database["public"]["Enums"]["announcement_type"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcements_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_announcements_community_id"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_announcements_district_id"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      application_communications: {
        Row: {
          application_id: string | null
          attachments: string[] | null
          created_at: string | null
          id: string
          is_internal: boolean | null
          message: string
          message_type: string | null
          read_by: string[] | null
          sender_id: string | null
          subject: string | null
        }
        Insert: {
          application_id?: string | null
          attachments?: string[] | null
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          message: string
          message_type?: string | null
          read_by?: string[] | null
          sender_id?: string | null
          subject?: string | null
        }
        Update: {
          application_id?: string | null
          attachments?: string[] | null
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          message?: string
          message_type?: string | null
          read_by?: string[] | null
          sender_id?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_communications_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "service_provider_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_communications_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      application_documents: {
        Row: {
          application_id: string | null
          document_name: string
          document_type: string
          expiry_date: string | null
          file_size: number | null
          file_url: string
          id: string
          is_verified: boolean | null
          mime_type: string | null
          notes: string | null
          upload_date: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          application_id?: string | null
          document_name: string
          document_type: string
          expiry_date?: string | null
          file_size?: number | null
          file_url: string
          id?: string
          is_verified?: boolean | null
          mime_type?: string | null
          notes?: string | null
          upload_date?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          application_id?: string | null
          document_name?: string
          document_type?: string
          expiry_date?: string | null
          file_size?: number | null
          file_url?: string
          id?: string
          is_verified?: boolean | null
          mime_type?: string | null
          notes?: string | null
          upload_date?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "service_provider_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_documents_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      assets: {
        Row: {
          asset_type: string
          assigned_to: string | null
          brand: string | null
          condition_status: string | null
          created_at: string | null
          current_value: number | null
          description: string | null
          district_id: string | null
          documents: string[] | null
          id: string
          is_active: boolean | null
          last_maintenance_date: string | null
          location: string
          maintenance_schedule: string | null
          model: string | null
          name: string
          next_maintenance_date: string | null
          photos: string[] | null
          purchase_date: string | null
          purchase_price: number | null
          serial_number: string | null
          updated_at: string | null
          warranty_expiry: string | null
        }
        Insert: {
          asset_type: string
          assigned_to?: string | null
          brand?: string | null
          condition_status?: string | null
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          district_id?: string | null
          documents?: string[] | null
          id?: string
          is_active?: boolean | null
          last_maintenance_date?: string | null
          location: string
          maintenance_schedule?: string | null
          model?: string | null
          name: string
          next_maintenance_date?: string | null
          photos?: string[] | null
          purchase_date?: string | null
          purchase_price?: number | null
          serial_number?: string | null
          updated_at?: string | null
          warranty_expiry?: string | null
        }
        Update: {
          asset_type?: string
          assigned_to?: string | null
          brand?: string | null
          condition_status?: string | null
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          district_id?: string | null
          documents?: string[] | null
          id?: string
          is_active?: boolean | null
          last_maintenance_date?: string | null
          location?: string
          maintenance_schedule?: string | null
          model?: string | null
          name?: string
          next_maintenance_date?: string | null
          photos?: string[] | null
          purchase_date?: string | null
          purchase_price?: number | null
          serial_number?: string | null
          updated_at?: string | null
          warranty_expiry?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          district_id: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          timestamp: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          district_id?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          district_id?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_approvals: {
        Row: {
          approval_notes: string | null
          approval_status: string
          approved_at: string | null
          approver_id: string
          booking_id: string
          created_at: string
          escalated: boolean
          escalated_at: string | null
          escalated_to: string | null
          id: string
          rejection_reason: string | null
        }
        Insert: {
          approval_notes?: string | null
          approval_status?: string
          approved_at?: string | null
          approver_id: string
          booking_id: string
          created_at?: string
          escalated?: boolean
          escalated_at?: string | null
          escalated_to?: string | null
          id?: string
          rejection_reason?: string | null
        }
        Update: {
          approval_notes?: string | null
          approval_status?: string
          approved_at?: string | null
          approver_id?: string
          booking_id?: string
          created_at?: string
          escalated?: boolean
          escalated_at?: string | null
          escalated_to?: string | null
          id?: string
          rejection_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_approvals_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_conflicts: {
        Row: {
          booking_id_1: string
          booking_id_2: string
          conflict_type: string
          detected_at: string
          id: string
          resolution_notes: string | null
          resolved: boolean
          resolved_at: string | null
          resolved_by: string | null
          severity: string
        }
        Insert: {
          booking_id_1: string
          booking_id_2: string
          conflict_type?: string
          detected_at?: string
          id?: string
          resolution_notes?: string | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
        }
        Update: {
          booking_id_1?: string
          booking_id_2?: string
          conflict_type?: string
          detected_at?: string
          id?: string
          resolution_notes?: string | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_conflicts_booking_id_1_fkey"
            columns: ["booking_id_1"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_conflicts_booking_id_2_fkey"
            columns: ["booking_id_2"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_reminders: {
        Row: {
          booking_id: string
          created_at: string
          id: string
          is_active: boolean
          notification_method: string
          reminder_type: string
          scheduled_for: string
          sent_at: string | null
          updated_at: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          notification_method?: string
          reminder_type?: string
          scheduled_for: string
          sent_at?: string | null
          updated_at?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          notification_method?: string
          reminder_type?: string
          scheduled_for?: string
          sent_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_reminders_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_waitlist: {
        Row: {
          created_at: string
          facility_id: string
          id: string
          offer_expires_at: string | null
          offered_at: string | null
          priority: number
          purpose: string | null
          requested_date: string
          requested_end_time: string
          requested_start_time: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          facility_id: string
          id?: string
          offer_expires_at?: string | null
          offered_at?: string | null
          priority?: number
          purpose?: string | null
          requested_date: string
          requested_end_time: string
          requested_start_time: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          facility_id?: string
          id?: string
          offer_expires_at?: string | null
          offered_at?: string | null
          priority?: number
          purpose?: string | null
          requested_date?: string
          requested_end_time?: string
          requested_start_time?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_waitlist_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          booking_date: string
          created_at: string | null
          duration_hours: number
          end_time: string
          facility_id: string | null
          id: string
          notes: string | null
          purpose: string | null
          start_time: string
          status: Database["public"]["Enums"]["booking_status"] | null
          total_amount: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          booking_date: string
          created_at?: string | null
          duration_hours: number
          end_time: string
          facility_id?: string | null
          id?: string
          notes?: string | null
          purpose?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          booking_date?: string
          created_at?: string | null
          duration_hours?: number
          end_time?: string
          facility_id?: string | null
          id?: string
          notes?: string | null
          purpose?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_bookings_facility_id"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      bulk_operations: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_count: number | null
          error_details: Json | null
          filters_applied: Json | null
          id: string
          items_affected: number | null
          operation_type: string
          performed_by: string | null
          started_at: string | null
          status: string | null
          success_count: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_count?: number | null
          error_details?: Json | null
          filters_applied?: Json | null
          id?: string
          items_affected?: number | null
          operation_type: string
          performed_by?: string | null
          started_at?: string | null
          status?: string | null
          success_count?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_count?: number | null
          error_details?: Json | null
          filters_applied?: Json | null
          id?: string
          items_affected?: number | null
          operation_type?: string
          performed_by?: string | null
          started_at?: string | null
          status?: string | null
          success_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bulk_operations_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_types: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cctv_cameras: {
        Row: {
          camera_type: string | null
          created_at: string | null
          district_id: string | null
          id: string
          is_active: boolean | null
          location: string
          name: string
          night_vision: boolean | null
          pan_tilt_zoom: boolean | null
          recording_enabled: boolean | null
          resolution: string | null
          stream_url: string | null
          updated_at: string | null
        }
        Insert: {
          camera_type?: string | null
          created_at?: string | null
          district_id?: string | null
          id?: string
          is_active?: boolean | null
          location: string
          name: string
          night_vision?: boolean | null
          pan_tilt_zoom?: boolean | null
          recording_enabled?: boolean | null
          resolution?: string | null
          stream_url?: string | null
          updated_at?: string | null
        }
        Update: {
          camera_type?: string | null
          created_at?: string | null
          district_id?: string | null
          id?: string
          is_active?: boolean | null
          location?: string
          name?: string
          night_vision?: boolean | null
          pan_tilt_zoom?: boolean | null
          recording_enabled?: boolean | null
          resolution?: string | null
          stream_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cctv_cameras_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      chart_colors: {
        Row: {
          category: string | null
          created_at: string
          hex_color: string
          id: string
          is_active: boolean
          name: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          hex_color: string
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          hex_color?: string
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string
          edited_at: string | null
          file_url: string | null
          id: string
          is_deleted: boolean
          is_edited: boolean
          message_text: string
          message_type: string
          reply_to_id: string | null
          room_id: string
          sender_id: string | null
        }
        Insert: {
          created_at?: string
          edited_at?: string | null
          file_url?: string | null
          id?: string
          is_deleted?: boolean
          is_edited?: boolean
          message_text: string
          message_type?: string
          reply_to_id?: string | null
          room_id: string
          sender_id?: string | null
        }
        Update: {
          created_at?: string
          edited_at?: string | null
          file_url?: string | null
          id?: string
          is_deleted?: boolean
          is_edited?: boolean
          message_text?: string
          message_type?: string
          reply_to_id?: string | null
          room_id?: string
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_chat_messages_room_id"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_room_members: {
        Row: {
          id: string
          is_admin: boolean
          joined_at: string
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_admin?: boolean
          joined_at?: string
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_admin?: boolean
          joined_at?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_room_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_room_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_chat_room_members_room_id"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          district_id: string | null
          id: string
          is_active: boolean
          is_private: boolean
          max_members: number | null
          name: string
          room_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          district_id?: string | null
          id?: string
          is_active?: boolean
          is_private?: boolean
          max_members?: number | null
          name: string
          room_type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          district_id?: string | null
          id?: string
          is_active?: boolean
          is_private?: boolean
          max_members?: number | null
          name?: string
          room_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_analytics: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          room_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          room_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          room_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_analytics_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      communities: {
        Row: {
          address: string | null
          admin_id: string | null
          community_type: string | null
          created_at: string | null
          description: string | null
          district_id: string | null
          established_date: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          occupied_units: number | null
          postal_code: string | null
          status: string | null
          total_units: number | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          admin_id?: string | null
          community_type?: string | null
          created_at?: string | null
          description?: string | null
          district_id?: string | null
          established_date?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          occupied_units?: number | null
          postal_code?: string | null
          status?: string | null
          total_units?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          admin_id?: string | null
          community_type?: string | null
          created_at?: string | null
          description?: string | null
          district_id?: string | null
          established_date?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          occupied_units?: number | null
          postal_code?: string | null
          status?: string | null
          total_units?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communities_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_activities: {
        Row: {
          activity_type: string
          created_at: string | null
          created_by: string | null
          current_participants: number | null
          date_time: string | null
          description: string | null
          district_id: string | null
          end_time: string | null
          id: string
          image_url: string | null
          is_published: boolean | null
          location: string | null
          max_participants: number | null
          priority: string | null
          registration_deadline: string | null
          registration_required: boolean | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          created_by?: string | null
          current_participants?: number | null
          date_time?: string | null
          description?: string | null
          district_id?: string | null
          end_time?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          location?: string | null
          max_participants?: number | null
          priority?: string | null
          registration_deadline?: string | null
          registration_required?: boolean | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          created_by?: string | null
          current_participants?: number | null
          date_time?: string | null
          description?: string | null
          district_id?: string | null
          end_time?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          location?: string | null
          max_participants?: number | null
          priority?: string | null
          registration_deadline?: string | null
          registration_required?: boolean | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_activities_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_features: {
        Row: {
          community_id: string | null
          created_at: string | null
          enabled_at: string | null
          enabled_by: string | null
          id: string
          is_enabled: boolean
          module_name: string
          notes: string | null
          updated_at: string | null
        }
        Insert: {
          community_id?: string | null
          created_at?: string | null
          enabled_at?: string | null
          enabled_by?: string | null
          id?: string
          is_enabled?: boolean
          module_name: string
          notes?: string | null
          updated_at?: string | null
        }
        Update: {
          community_id?: string | null
          created_at?: string | null
          enabled_at?: string | null
          enabled_by?: string | null
          id?: string
          is_enabled?: boolean
          module_name?: string
          notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "district_features_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_group_memberships: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          left_at: string | null
          notes: string | null
          role: string
          status: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          left_at?: string | null
          notes?: string | null
          role?: string
          status?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          left_at?: string | null
          notes?: string | null
          role?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_group_memberships_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "community_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      community_groups: {
        Row: {
          category: string | null
          contact_info: string | null
          created_at: string
          description: string | null
          district_id: string | null
          group_type: string
          id: string
          is_active: boolean
          leader_id: string | null
          max_members: number | null
          meeting_frequency: string | null
          meeting_schedule: string | null
          membership_fee: number | null
          name: string
          requires_approval: boolean
          updated_at: string
        }
        Insert: {
          category?: string | null
          contact_info?: string | null
          created_at?: string
          description?: string | null
          district_id?: string | null
          group_type?: string
          id?: string
          is_active?: boolean
          leader_id?: string | null
          max_members?: number | null
          meeting_frequency?: string | null
          meeting_schedule?: string | null
          membership_fee?: number | null
          name: string
          requires_approval?: boolean
          updated_at?: string
        }
        Update: {
          category?: string | null
          contact_info?: string | null
          created_at?: string
          description?: string | null
          district_id?: string | null
          group_type?: string
          id?: string
          is_active?: boolean
          leader_id?: string | null
          max_members?: number | null
          meeting_frequency?: string | null
          meeting_schedule?: string | null
          membership_fee?: number | null
          name?: string
          requires_approval?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_groups_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_groups_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_updates: {
        Row: {
          affected_areas: string[] | null
          created_at: string | null
          created_by: string | null
          details: Json | null
          district_id: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          message: string
          priority: string | null
          start_date: string | null
          title: string
          update_type: string
          updated_at: string | null
        }
        Insert: {
          affected_areas?: string[] | null
          created_at?: string | null
          created_by?: string | null
          details?: Json | null
          district_id?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          message: string
          priority?: string | null
          start_date?: string | null
          title: string
          update_type: string
          updated_at?: string | null
        }
        Update: {
          affected_areas?: string[] | null
          created_at?: string | null
          created_by?: string | null
          details?: Json | null
          district_id?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          message?: string
          priority?: string | null
          start_date?: string | null
          title?: string
          update_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_updates_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      complaint_escalations: {
        Row: {
          complaint_id: string
          created_at: string
          escalated_by: string
          escalated_to: string | null
          escalation_reason: string
          from_department: string
          id: string
          notes: string | null
          responded_at: string | null
          status: string | null
          to_department: string
        }
        Insert: {
          complaint_id: string
          created_at?: string
          escalated_by: string
          escalated_to?: string | null
          escalation_reason: string
          from_department: string
          id?: string
          notes?: string | null
          responded_at?: string | null
          status?: string | null
          to_department: string
        }
        Update: {
          complaint_id?: string
          created_at?: string
          escalated_by?: string
          escalated_to?: string | null
          escalation_reason?: string
          from_department?: string
          id?: string
          notes?: string | null
          responded_at?: string | null
          status?: string | null
          to_department?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaint_escalations_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      complaint_notifications: {
        Row: {
          complaint_id: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          notification_type: string
          read_at: string | null
          recipient_id: string
          sent_at: string | null
          sent_via: string[] | null
        }
        Insert: {
          complaint_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          notification_type: string
          read_at?: string | null
          recipient_id: string
          sent_at?: string | null
          sent_via?: string[] | null
        }
        Update: {
          complaint_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          notification_type?: string
          read_at?: string | null
          recipient_id?: string
          sent_at?: string | null
          sent_via?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "complaint_notifications_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      complaint_responses: {
        Row: {
          attachments: string[] | null
          complaint_id: string
          created_at: string
          id: string
          internal_comments: string | null
          is_internal: boolean
          responder_id: string
          response_text: string
          response_type: string
          status_update: string | null
          updated_at: string
        }
        Insert: {
          attachments?: string[] | null
          complaint_id: string
          created_at?: string
          id?: string
          internal_comments?: string | null
          is_internal?: boolean
          responder_id: string
          response_text: string
          response_type?: string
          status_update?: string | null
          updated_at?: string
        }
        Update: {
          attachments?: string[] | null
          complaint_id?: string
          created_at?: string
          id?: string
          internal_comments?: string | null
          is_internal?: boolean
          responder_id?: string
          response_text?: string
          response_type?: string
          status_update?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaint_responses_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          assigned_to: string | null
          auto_escalated: boolean | null
          category: string
          complainant_id: string | null
          created_at: string | null
          description: string
          district_id: string | null
          escalated_at: string | null
          escalated_by: string | null
          escalation_level: number | null
          id: string
          location: string | null
          photos: string[] | null
          priority: Database["public"]["Enums"]["complaint_priority"] | null
          resolution: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["complaint_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          auto_escalated?: boolean | null
          category: string
          complainant_id?: string | null
          created_at?: string | null
          description: string
          district_id?: string | null
          escalated_at?: string | null
          escalated_by?: string | null
          escalation_level?: number | null
          id?: string
          location?: string | null
          photos?: string[] | null
          priority?: Database["public"]["Enums"]["complaint_priority"] | null
          resolution?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["complaint_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          auto_escalated?: boolean | null
          category?: string
          complainant_id?: string | null
          created_at?: string | null
          description?: string
          district_id?: string | null
          escalated_at?: string | null
          escalated_by?: string | null
          escalation_level?: number | null
          id?: string
          location?: string | null
          photos?: string[] | null
          priority?: Database["public"]["Enums"]["complaint_priority"] | null
          resolution?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["complaint_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "complaints_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_complainant_id_fkey"
            columns: ["complainant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_metrics: {
        Row: {
          created_at: string | null
          district_id: string | null
          icon_name: string | null
          id: string
          metric_type: string
          metric_value: string
          status: string | null
          trend_text: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          district_id?: string | null
          icon_name?: string | null
          id?: string
          metric_type: string
          metric_value: string
          status?: string | null
          trend_text?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          district_id?: string | null
          icon_name?: string | null
          id?: string
          metric_type?: string
          metric_value?: string
          status?: string | null
          trend_text?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_metrics_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      deliveries: {
        Row: {
          collected_at: string | null
          collected_by: string | null
          collection_method: string | null
          courier_company: string | null
          created_at: string | null
          delivery_date: string
          delivery_time: string | null
          district_id: string | null
          id: string
          notes: string | null
          package_type: string | null
          photos: string[] | null
          received_by_staff: string | null
          recipient_id: string
          sender_name: string
          status: string | null
          tracking_number: string | null
          updated_at: string | null
        }
        Insert: {
          collected_at?: string | null
          collected_by?: string | null
          collection_method?: string | null
          courier_company?: string | null
          created_at?: string | null
          delivery_date: string
          delivery_time?: string | null
          district_id?: string | null
          id?: string
          notes?: string | null
          package_type?: string | null
          photos?: string[] | null
          received_by_staff?: string | null
          recipient_id: string
          sender_name: string
          status?: string | null
          tracking_number?: string | null
          updated_at?: string | null
        }
        Update: {
          collected_at?: string | null
          collected_by?: string | null
          collection_method?: string | null
          courier_company?: string | null
          created_at?: string | null
          delivery_date?: string
          delivery_time?: string | null
          district_id?: string | null
          id?: string
          notes?: string | null
          package_type?: string | null
          photos?: string[] | null
          received_by_staff?: string | null
          recipient_id?: string
          sender_name?: string
          status?: string | null
          tracking_number?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      department_types: {
        Row: {
          code: string
          created_at: string
          description: string | null
          icon_name: string | null
          id: string
          is_active: boolean
          name_en: string
          name_ms: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean
          name_en: string
          name_ms: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean
          name_en?: string
          name_ms?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      directory_contacts: {
        Row: {
          category: string
          created_at: string
          district_id: string | null
          email: string | null
          hours: string
          id: string
          is_active: boolean
          location: string
          name: string
          phone: string
          role: string
          status: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          district_id?: string | null
          email?: string | null
          hours: string
          id?: string
          is_active?: boolean
          location: string
          name: string
          phone: string
          role: string
          status?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          district_id?: string | null
          email?: string | null
          hours?: string
          id?: string
          is_active?: boolean
          location?: string
          name?: string
          phone?: string
          role?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "directory_contacts_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_moderation_actions: {
        Row: {
          action_type: string
          created_at: string | null
          discussion_id: string | null
          id: string
          moderator_id: string
          notes: string | null
          reason: string | null
          reply_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          discussion_id?: string | null
          id?: string
          moderator_id: string
          notes?: string | null
          reason?: string | null
          reply_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          discussion_id?: string | null
          id?: string
          moderator_id?: string
          notes?: string | null
          reason?: string | null
          reply_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discussion_moderation_actions_discussion_id_fkey"
            columns: ["discussion_id"]
            isOneToOne: false
            referencedRelation: "discussions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_moderation_actions_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_moderation_actions_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "discussion_replies"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_replies: {
        Row: {
          author_id: string | null
          content: string
          created_at: string | null
          discussion_id: string | null
          id: string
          parent_reply_id: string | null
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string | null
          discussion_id?: string | null
          id?: string
          parent_reply_id?: string | null
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string | null
          discussion_id?: string | null
          id?: string
          parent_reply_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discussion_replies_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_replies_discussion_id_fkey"
            columns: ["discussion_id"]
            isOneToOne: false
            referencedRelation: "discussions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_replies_parent_reply_id_fkey"
            columns: ["parent_reply_id"]
            isOneToOne: false
            referencedRelation: "discussion_replies"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_reports: {
        Row: {
          created_at: string | null
          discussion_id: string | null
          id: string
          reply_id: string | null
          report_details: string | null
          report_reason: string
          reported_by: string
          resolution_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          discussion_id?: string | null
          id?: string
          reply_id?: string | null
          report_details?: string | null
          report_reason: string
          reported_by: string
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          discussion_id?: string | null
          id?: string
          reply_id?: string | null
          report_details?: string | null
          report_reason?: string
          reported_by?: string
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discussion_reports_discussion_id_fkey"
            columns: ["discussion_id"]
            isOneToOne: false
            referencedRelation: "discussions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_reports_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "discussion_replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_reports_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      discussions: {
        Row: {
          author_id: string | null
          category: string
          content: string
          created_at: string | null
          district_id: string | null
          id: string
          is_locked: boolean | null
          is_pinned: boolean | null
          is_reported: boolean | null
          last_reply_at: string | null
          moderated_at: string | null
          moderated_by: string | null
          moderation_reason: string | null
          moderation_status: string | null
          replies_count: number | null
          report_count: number | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          author_id?: string | null
          category: string
          content: string
          created_at?: string | null
          district_id?: string | null
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          is_reported?: boolean | null
          last_reply_at?: string | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_reason?: string | null
          moderation_status?: string | null
          replies_count?: number | null
          report_count?: number | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          author_id?: string | null
          category?: string
          content?: string
          created_at?: string | null
          district_id?: string | null
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          is_reported?: boolean | null
          last_reply_at?: string | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_reason?: string | null
          moderation_status?: string | null
          replies_count?: number | null
          report_count?: number | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "discussions_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussions_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussions_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      districts: {
        Row: {
          address: string | null
          area_km2: number | null
          city: string | null
          communities_count: number | null
          coordinator_id: string | null
          country: string | null
          created_at: string | null
          description: string | null
          established_date: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          population: number | null
          postal_code: string | null
          state: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          area_km2?: number | null
          city?: string | null
          communities_count?: number | null
          coordinator_id?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          established_date?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          population?: number | null
          postal_code?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          area_km2?: number | null
          city?: string | null
          communities_count?: number | null
          coordinator_id?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          established_date?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          population?: number | null
          postal_code?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          access_roles: string[] | null
          created_at: string | null
          description: string | null
          district_id: string | null
          document_type: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          is_public: boolean | null
          tags: string[] | null
          title: string
          updated_at: string | null
          uploaded_by: string | null
          version: string | null
        }
        Insert: {
          access_roles?: string[] | null
          created_at?: string | null
          description?: string | null
          district_id?: string | null
          document_type: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          is_public?: boolean | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          uploaded_by?: string | null
          version?: string | null
        }
        Update: {
          access_roles?: string[] | null
          created_at?: string | null
          description?: string | null
          district_id?: string | null
          document_type?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          is_public?: boolean | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          uploaded_by?: string | null
          version?: string | null
        }
        Relationships: []
      }
      door_controllers: {
        Row: {
          access_zones: string[] | null
          controller_type: string
          created_at: string
          district_id: string | null
          id: string
          ip_address: unknown | null
          is_online: boolean
          last_heartbeat: string | null
          location: string
          mac_address: string | null
          name: string
          updated_at: string
        }
        Insert: {
          access_zones?: string[] | null
          controller_type?: string
          created_at?: string
          district_id?: string | null
          id?: string
          ip_address?: unknown | null
          is_online?: boolean
          last_heartbeat?: string | null
          location: string
          mac_address?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          access_zones?: string[] | null
          controller_type?: string
          created_at?: string
          district_id?: string | null
          id?: string
          ip_address?: unknown | null
          is_online?: boolean
          last_heartbeat?: string | null
          location?: string
          mac_address?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "door_controllers_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      enhanced_audit_logs: {
        Row: {
          action: string
          district_id: string | null
          id: string
          ip_address: unknown | null
          module_name: string | null
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string | null
          session_id: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
          user_role: Database["public"]["Enums"]["enhanced_user_role"] | null
        }
        Insert: {
          action: string
          district_id?: string | null
          id?: string
          ip_address?: unknown | null
          module_name?: string | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
          user_role?: Database["public"]["Enums"]["enhanced_user_role"] | null
        }
        Update: {
          action?: string
          district_id?: string | null
          id?: string
          ip_address?: unknown | null
          module_name?: string | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
          user_role?: Database["public"]["Enums"]["enhanced_user_role"] | null
        }
        Relationships: [
          {
            foreignKeyName: "enhanced_audit_logs_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      enhanced_user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          district_id: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          role: Database["public"]["Enums"]["enhanced_user_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          district_id?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          role: Database["public"]["Enums"]["enhanced_user_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          district_id?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          role?: Database["public"]["Enums"]["enhanced_user_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enhanced_user_roles_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      escalation_rules: {
        Row: {
          category: string | null
          conditions: Json | null
          created_at: string | null
          from_level: number
          from_roles: Database["public"]["Enums"]["enhanced_user_role"][] | null
          id: string
          is_active: boolean | null
          module_name: string
          priority: string
          to_level: number
          to_roles: Database["public"]["Enums"]["enhanced_user_role"][] | null
        }
        Insert: {
          category?: string | null
          conditions?: Json | null
          created_at?: string | null
          from_level: number
          from_roles?:
            | Database["public"]["Enums"]["enhanced_user_role"][]
            | null
          id?: string
          is_active?: boolean | null
          module_name: string
          priority: string
          to_level: number
          to_roles?: Database["public"]["Enums"]["enhanced_user_role"][] | null
        }
        Update: {
          category?: string | null
          conditions?: Json | null
          created_at?: string | null
          from_level?: number
          from_roles?:
            | Database["public"]["Enums"]["enhanced_user_role"][]
            | null
          id?: string
          is_active?: boolean | null
          module_name?: string
          priority?: string
          to_level?: number
          to_roles?: Database["public"]["Enums"]["enhanced_user_role"][] | null
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          attendance_status: string | null
          event_id: string | null
          id: string
          notes: string | null
          registration_date: string | null
          user_id: string | null
        }
        Insert: {
          attendance_status?: string | null
          event_id?: string | null
          id?: string
          notes?: string | null
          registration_date?: string | null
          user_id?: string | null
        }
        Update: {
          attendance_status?: string | null
          event_id?: string | null
          id?: string
          notes?: string | null
          registration_date?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          description: string
          district_id: string | null
          end_date: string | null
          end_time: string | null
          event_type: string
          id: string
          is_registration_required: boolean | null
          location: string | null
          max_participants: number | null
          organizer_id: string | null
          registration_fee: number | null
          start_date: string
          start_time: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          district_id?: string | null
          end_date?: string | null
          end_time?: string | null
          event_type?: string
          id?: string
          is_registration_required?: boolean | null
          location?: string | null
          max_participants?: number | null
          organizer_id?: string | null
          registration_fee?: number | null
          start_date: string
          start_time?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          district_id?: string | null
          end_date?: string | null
          end_time?: string | null
          event_type?: string
          id?: string
          is_registration_required?: boolean | null
          location?: string | null
          max_participants?: number | null
          organizer_id?: string | null
          registration_fee?: number | null
          start_date?: string
          start_time?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      facilities: {
        Row: {
          amenities: string[] | null
          capacity: number | null
          created_at: string | null
          description: string | null
          district_id: string | null
          hourly_rate: number | null
          id: string
          image: string | null
          images: string[] | null
          is_available: boolean | null
          location: string | null
          name: string
          operating_hours: Json | null
          rules: string[] | null
          updated_at: string | null
        }
        Insert: {
          amenities?: string[] | null
          capacity?: number | null
          created_at?: string | null
          description?: string | null
          district_id?: string | null
          hourly_rate?: number | null
          id?: string
          image?: string | null
          images?: string[] | null
          is_available?: boolean | null
          location?: string | null
          name: string
          operating_hours?: Json | null
          rules?: string[] | null
          updated_at?: string | null
        }
        Update: {
          amenities?: string[] | null
          capacity?: number | null
          created_at?: string | null
          description?: string | null
          district_id?: string | null
          hourly_rate?: number | null
          id?: string
          image?: string | null
          images?: string[] | null
          is_available?: boolean | null
          location?: string | null
          name?: string
          operating_hours?: Json | null
          rules?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "facilities_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      facility_buffer_times: {
        Row: {
          buffer_after_minutes: number
          buffer_before_minutes: number
          cleaning_time_minutes: number
          created_at: string
          facility_id: string
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          buffer_after_minutes?: number
          buffer_before_minutes?: number
          cleaning_time_minutes?: number
          created_at?: string
          facility_id: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          buffer_after_minutes?: number
          buffer_before_minutes?: number
          cleaning_time_minutes?: number
          created_at?: string
          facility_id?: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "facility_buffer_times_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: true
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      facility_configurations: {
        Row: {
          booking_rules: Json
          created_at: string
          equipment_list: Json | null
          facility_id: string
          id: string
          operating_hours: Json
          peak_hours: Json
          pricing_tiers: Json
          safety_requirements: string | null
          updated_at: string
        }
        Insert: {
          booking_rules?: Json
          created_at?: string
          equipment_list?: Json | null
          facility_id: string
          id?: string
          operating_hours?: Json
          peak_hours?: Json
          pricing_tiers?: Json
          safety_requirements?: string | null
          updated_at?: string
        }
        Update: {
          booking_rules?: Json
          created_at?: string
          equipment_list?: Json | null
          facility_id?: string
          id?: string
          operating_hours?: Json
          peak_hours?: Json
          pricing_tiers?: Json
          safety_requirements?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "facility_configurations_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      facility_equipment: {
        Row: {
          condition_status: string
          created_at: string
          equipment_type: string
          facility_id: string
          id: string
          is_active: boolean
          last_maintenance_date: string | null
          maintenance_interval_days: number | null
          model: string | null
          name: string
          next_maintenance_date: string | null
          purchase_date: string | null
          qr_code: string | null
          serial_number: string | null
          updated_at: string
          warranty_expiry: string | null
        }
        Insert: {
          condition_status?: string
          created_at?: string
          equipment_type: string
          facility_id: string
          id?: string
          is_active?: boolean
          last_maintenance_date?: string | null
          maintenance_interval_days?: number | null
          model?: string | null
          name: string
          next_maintenance_date?: string | null
          purchase_date?: string | null
          qr_code?: string | null
          serial_number?: string | null
          updated_at?: string
          warranty_expiry?: string | null
        }
        Update: {
          condition_status?: string
          created_at?: string
          equipment_type?: string
          facility_id?: string
          id?: string
          is_active?: boolean
          last_maintenance_date?: string | null
          maintenance_interval_days?: number | null
          model?: string | null
          name?: string
          next_maintenance_date?: string | null
          purchase_date?: string | null
          qr_code?: string | null
          serial_number?: string | null
          updated_at?: string
          warranty_expiry?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "facility_equipment_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      facility_supplies: {
        Row: {
          category: string
          created_at: string
          current_stock: number
          expiry_date: string | null
          facility_id: string
          id: string
          is_active: boolean
          item_name: string
          last_restocked_date: string | null
          maximum_stock: number
          minimum_stock: number
          supplier: string | null
          unit_cost: number | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          current_stock?: number
          expiry_date?: string | null
          facility_id: string
          id?: string
          is_active?: boolean
          item_name: string
          last_restocked_date?: string | null
          maximum_stock?: number
          minimum_stock?: number
          supplier?: string | null
          unit_cost?: number | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          current_stock?: number
          expiry_date?: string | null
          facility_id?: string
          id?: string
          is_active?: boolean
          item_name?: string
          last_restocked_date?: string | null
          maximum_stock?: number
          minimum_stock?: number
          supplier?: string | null
          unit_cost?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "facility_supplies_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      facility_types: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      facility_usage_analytics: {
        Row: {
          booking_id: string | null
          created_at: string
          facility_id: string
          id: string
          occupancy_rate: number | null
          peak_usage_time: string | null
          revenue_generated: number
          usage_date: string
          usage_hours: number
          user_satisfaction_rating: number | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          facility_id: string
          id?: string
          occupancy_rate?: number | null
          peak_usage_time?: string | null
          revenue_generated?: number
          usage_date: string
          usage_hours?: number
          user_satisfaction_rating?: number | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          facility_id?: string
          id?: string
          occupancy_rate?: number | null
          peak_usage_time?: string | null
          revenue_generated?: number
          usage_date?: string
          usage_hours?: number
          user_satisfaction_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "facility_usage_analytics_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facility_usage_analytics_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      facility_work_orders: {
        Row: {
          actual_cost: number | null
          actual_duration_hours: number | null
          after_photos: string[] | null
          assigned_to: string | null
          before_photos: string[] | null
          complaint_id: string | null
          completed_at: string | null
          completion_notes: string | null
          created_at: string
          created_by: string
          description: string
          district_id: string | null
          equipment_id: string | null
          estimated_cost: number | null
          estimated_duration_hours: number | null
          facility_id: string
          id: string
          maintenance_schedule_id: string | null
          parts_needed: Json | null
          priority: string
          required_skills: string[] | null
          safety_requirements: string | null
          scheduled_end: string | null
          scheduled_start: string | null
          started_at: string | null
          status: string
          title: string
          updated_at: string
          vendor_info: Json | null
          work_order_type: string
        }
        Insert: {
          actual_cost?: number | null
          actual_duration_hours?: number | null
          after_photos?: string[] | null
          assigned_to?: string | null
          before_photos?: string[] | null
          complaint_id?: string | null
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string
          created_by: string
          description: string
          district_id?: string | null
          equipment_id?: string | null
          estimated_cost?: number | null
          estimated_duration_hours?: number | null
          facility_id: string
          id?: string
          maintenance_schedule_id?: string | null
          parts_needed?: Json | null
          priority?: string
          required_skills?: string[] | null
          safety_requirements?: string | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          started_at?: string | null
          status?: string
          title: string
          updated_at?: string
          vendor_info?: Json | null
          work_order_type?: string
        }
        Update: {
          actual_cost?: number | null
          actual_duration_hours?: number | null
          after_photos?: string[] | null
          assigned_to?: string | null
          before_photos?: string[] | null
          complaint_id?: string | null
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string
          created_by?: string
          description?: string
          district_id?: string | null
          equipment_id?: string | null
          estimated_cost?: number | null
          estimated_duration_hours?: number | null
          facility_id?: string
          id?: string
          maintenance_schedule_id?: string | null
          parts_needed?: Json | null
          priority?: string
          required_skills?: string[] | null
          safety_requirements?: string | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          started_at?: string | null
          status?: string
          title?: string
          updated_at?: string
          vendor_info?: Json | null
          work_order_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "facility_work_orders_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facility_work_orders_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "facility_equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facility_work_orders_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facility_work_orders_maintenance_schedule_id_fkey"
            columns: ["maintenance_schedule_id"]
            isOneToOne: false
            referencedRelation: "maintenance_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          category: string | null
          created_at: string | null
          district_id: string | null
          feedback_type: string | null
          id: string
          is_anonymous: boolean | null
          message: string
          priority: string | null
          rating: number | null
          responded_at: string | null
          responded_by: string | null
          response: string | null
          status: string | null
          submitted_by: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          district_id?: string | null
          feedback_type?: string | null
          id?: string
          is_anonymous?: boolean | null
          message: string
          priority?: string | null
          rating?: number | null
          responded_at?: string | null
          responded_by?: string | null
          response?: string | null
          status?: string | null
          submitted_by?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          district_id?: string | null
          feedback_type?: string | null
          id?: string
          is_anonymous?: boolean | null
          message?: string
          priority?: string | null
          rating?: number | null
          responded_at?: string | null
          responded_by?: string | null
          response?: string | null
          status?: string | null
          submitted_by?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      file_shares: {
        Row: {
          created_at: string | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id: string
          is_deleted: boolean | null
          room_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id?: string
          is_deleted?: boolean | null
          room_id: string
          sender_id: string
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          is_deleted?: boolean | null
          room_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_shares_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_accounts: {
        Row: {
          account_code: string
          account_name: string
          account_type: string
          created_at: string | null
          description: string | null
          district_id: string | null
          id: string
          is_active: boolean | null
          parent_account_id: string | null
          updated_at: string | null
        }
        Insert: {
          account_code: string
          account_name: string
          account_type: string
          created_at?: string | null
          description?: string | null
          district_id?: string | null
          id?: string
          is_active?: boolean | null
          parent_account_id?: string | null
          updated_at?: string | null
        }
        Update: {
          account_code?: string
          account_name?: string
          account_type?: string
          created_at?: string | null
          description?: string | null
          district_id?: string | null
          id?: string
          is_active?: boolean | null
          parent_account_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_accounts_parent_account_id_fkey"
            columns: ["parent_account_id"]
            isOneToOne: false
            referencedRelation: "financial_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_records: {
        Row: {
          amount: number
          approved_by: string | null
          budget_category: string | null
          category: string
          created_at: string | null
          currency: string | null
          description: string
          district_id: string | null
          fiscal_month: number | null
          fiscal_year: number | null
          id: string
          is_recurring: boolean | null
          payment_method: string | null
          receipt_url: string | null
          recorded_by: string | null
          recurring_frequency: string | null
          reference_number: string | null
          transaction_date: string
          transaction_type: string
          updated_at: string | null
          vendor_supplier: string | null
        }
        Insert: {
          amount: number
          approved_by?: string | null
          budget_category?: string | null
          category: string
          created_at?: string | null
          currency?: string | null
          description: string
          district_id?: string | null
          fiscal_month?: number | null
          fiscal_year?: number | null
          id?: string
          is_recurring?: boolean | null
          payment_method?: string | null
          receipt_url?: string | null
          recorded_by?: string | null
          recurring_frequency?: string | null
          reference_number?: string | null
          transaction_date: string
          transaction_type: string
          updated_at?: string | null
          vendor_supplier?: string | null
        }
        Update: {
          amount?: number
          approved_by?: string | null
          budget_category?: string | null
          category?: string
          created_at?: string | null
          currency?: string | null
          description?: string
          district_id?: string | null
          fiscal_month?: number | null
          fiscal_year?: number | null
          id?: string
          is_recurring?: boolean | null
          payment_method?: string | null
          receipt_url?: string | null
          recorded_by?: string | null
          recurring_frequency?: string | null
          reference_number?: string | null
          transaction_date?: string
          transaction_type?: string
          updated_at?: string | null
          vendor_supplier?: string | null
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          account_id: string
          amount: number
          approved_at: string | null
          approved_by: string | null
          attachments: string[] | null
          created_at: string | null
          description: string
          district_id: string | null
          id: string
          notes: string | null
          payment_method: string | null
          processed_by: string | null
          receipt_number: string | null
          reference_id: string | null
          reference_type: string | null
          status: string | null
          transaction_code: string
          transaction_date: string
          transaction_type: string
          updated_at: string | null
        }
        Insert: {
          account_id: string
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          attachments?: string[] | null
          created_at?: string | null
          description: string
          district_id?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          processed_by?: string | null
          receipt_number?: string | null
          reference_id?: string | null
          reference_type?: string | null
          status?: string | null
          transaction_code: string
          transaction_date?: string
          transaction_type: string
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          attachments?: string[] | null
          created_at?: string | null
          description?: string
          district_id?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          processed_by?: string | null
          receipt_number?: string | null
          reference_id?: string | null
          reference_type?: string | null
          status?: string | null
          transaction_code?: string
          transaction_date?: string
          transaction_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "financial_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      floor_plan_migrations: {
        Row: {
          created_at: string
          from_floor_plan_id: string | null
          id: string
          migration_data: Json | null
          migration_type: string
          notes: string | null
          performed_at: string
          performed_by: string | null
          to_floor_plan_id: string
          units_affected: number
        }
        Insert: {
          created_at?: string
          from_floor_plan_id?: string | null
          id?: string
          migration_data?: Json | null
          migration_type?: string
          notes?: string | null
          performed_at?: string
          performed_by?: string | null
          to_floor_plan_id: string
          units_affected?: number
        }
        Update: {
          created_at?: string
          from_floor_plan_id?: string | null
          id?: string
          migration_data?: Json | null
          migration_type?: string
          notes?: string | null
          performed_at?: string
          performed_by?: string | null
          to_floor_plan_id?: string
          units_affected?: number
        }
        Relationships: [
          {
            foreignKeyName: "floor_plan_migrations_from_floor_plan_id_fkey"
            columns: ["from_floor_plan_id"]
            isOneToOne: false
            referencedRelation: "floor_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "floor_plan_migrations_to_floor_plan_id_fkey"
            columns: ["to_floor_plan_id"]
            isOneToOne: false
            referencedRelation: "floor_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      floor_plans: {
        Row: {
          created_at: string
          created_by: string | null
          district_id: string | null
          id: string
          image_url: string
          is_active: boolean
          name: string
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          district_id?: string | null
          id?: string
          image_url: string
          is_active?: boolean
          name: string
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          district_id?: string | null
          id?: string
          image_url?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "floor_plans_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      frequency_types: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          interval_days: number | null
          is_active: boolean
          name: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          interval_days?: number | null
          is_active?: boolean
          name: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          interval_days?: number | null
          is_active?: boolean
          name?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      group_memberships: {
        Row: {
          group_id: string | null
          id: string
          is_active: boolean | null
          joined_at: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          group_id?: string | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          group_id?: string | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_memberships_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "community_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_types: {
        Row: {
          code: string
          created_at: string
          description: string | null
          icon_name: string | null
          id: string
          is_active: boolean
          name: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      household_accounts: {
        Row: {
          created_at: string | null
          created_by: string
          id: string
          is_active: boolean | null
          linked_account_id: string
          permissions: Json | null
          primary_account_id: string
          relationship_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: string
          is_active?: boolean | null
          linked_account_id: string
          permissions?: Json | null
          primary_account_id: string
          relationship_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: string
          is_active?: boolean | null
          linked_account_id?: string
          permissions?: Json | null
          primary_account_id?: string
          relationship_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "household_accounts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "household_accounts_linked_account_id_fkey"
            columns: ["linked_account_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "household_accounts_primary_account_id_fkey"
            columns: ["primary_account_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      image_assets: {
        Row: {
          asset_type: string
          bucket_id: string
          created_at: string | null
          description: string | null
          file_path: string
          file_size: number | null
          id: string
          is_active: boolean | null
          mime_type: string | null
          name: string
          reference_id: string | null
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          asset_type: string
          bucket_id: string
          created_at?: string | null
          description?: string | null
          file_path: string
          file_size?: number | null
          id?: string
          is_active?: boolean | null
          mime_type?: string | null
          name: string
          reference_id?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          asset_type?: string
          bucket_id?: string
          created_at?: string | null
          description?: string | null
          file_path?: string
          file_size?: number | null
          id?: string
          is_active?: boolean | null
          mime_type?: string | null
          name?: string
          reference_id?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "image_assets_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          brand: string | null
          category: string
          created_at: string | null
          current_stock: number
          description: string | null
          district_id: string | null
          expiry_date: string | null
          id: string
          is_active: boolean | null
          item_name: string
          last_restocked: string | null
          maximum_stock: number | null
          minimum_stock: number | null
          notes: string | null
          storage_location: string
          supplier: string | null
          unit: string
          unit_price: number | null
          updated_at: string | null
        }
        Insert: {
          brand?: string | null
          category: string
          created_at?: string | null
          current_stock?: number
          description?: string | null
          district_id?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          item_name: string
          last_restocked?: string | null
          maximum_stock?: number | null
          minimum_stock?: number | null
          notes?: string | null
          storage_location: string
          supplier?: string | null
          unit: string
          unit_price?: number | null
          updated_at?: string | null
        }
        Update: {
          brand?: string | null
          category?: string
          created_at?: string | null
          current_stock?: number
          description?: string | null
          district_id?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          item_name?: string
          last_restocked?: string | null
          maximum_stock?: number | null
          minimum_stock?: number | null
          notes?: string | null
          storage_location?: string
          supplier?: string | null
          unit?: string
          unit_price?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      inventory_categories: {
        Row: {
          created_at: string | null
          description: string | null
          district_id: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_category_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          district_id?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_category_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          district_id?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_category_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "inventory_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          barcode: string | null
          category_id: string
          created_at: string | null
          current_stock: number | null
          description: string | null
          district_id: string | null
          expiry_tracking: boolean | null
          id: string
          is_active: boolean | null
          item_code: string
          maximum_stock: number | null
          minimum_stock: number | null
          name: string
          photos: string[] | null
          reorder_level: number | null
          storage_location: string | null
          supplier_contact: string | null
          supplier_name: string | null
          unit_cost: number | null
          unit_of_measure: string | null
          updated_at: string | null
        }
        Insert: {
          barcode?: string | null
          category_id: string
          created_at?: string | null
          current_stock?: number | null
          description?: string | null
          district_id?: string | null
          expiry_tracking?: boolean | null
          id?: string
          is_active?: boolean | null
          item_code: string
          maximum_stock?: number | null
          minimum_stock?: number | null
          name: string
          photos?: string[] | null
          reorder_level?: number | null
          storage_location?: string | null
          supplier_contact?: string | null
          supplier_name?: string | null
          unit_cost?: number | null
          unit_of_measure?: string | null
          updated_at?: string | null
        }
        Update: {
          barcode?: string | null
          category_id?: string
          created_at?: string | null
          current_stock?: number | null
          description?: string | null
          district_id?: string | null
          expiry_tracking?: boolean | null
          id?: string
          is_active?: boolean | null
          item_code?: string
          maximum_stock?: number | null
          minimum_stock?: number | null
          name?: string
          photos?: string[] | null
          reorder_level?: number | null
          storage_location?: string | null
          supplier_contact?: string | null
          supplier_name?: string | null
          unit_cost?: number | null
          unit_of_measure?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "inventory_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          id: string
          inventory_id: string | null
          moved_by: string | null
          movement_date: string | null
          movement_type: string
          new_stock: number
          notes: string | null
          previous_stock: number
          quantity: number
          reason: string | null
          reference_document: string | null
        }
        Insert: {
          id?: string
          inventory_id?: string | null
          moved_by?: string | null
          movement_date?: string | null
          movement_type: string
          new_stock: number
          notes?: string | null
          previous_stock: number
          quantity: number
          reason?: string | null
          reference_document?: string | null
        }
        Update: {
          id?: string
          inventory_id?: string | null
          moved_by?: string | null
          movement_date?: string | null
          movement_type?: string
          new_stock?: number
          notes?: string | null
          previous_stock?: number
          quantity?: number
          reason?: string | null
          reference_document?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transactions: {
        Row: {
          approved_by: string | null
          batch_number: string | null
          created_at: string | null
          expiry_date: string | null
          id: string
          item_id: string
          notes: string | null
          performed_by: string
          quantity: number
          reference_id: string | null
          reference_type: string | null
          total_cost: number | null
          transaction_code: string
          transaction_date: string | null
          transaction_type: string
          unit_cost: number | null
        }
        Insert: {
          approved_by?: string | null
          batch_number?: string | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          item_id: string
          notes?: string | null
          performed_by: string
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
          total_cost?: number | null
          transaction_code: string
          transaction_date?: string | null
          transaction_type: string
          unit_cost?: number | null
        }
        Update: {
          approved_by?: string | null
          batch_number?: string | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          item_id?: string
          notes?: string | null
          performed_by?: string
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
          total_cost?: number | null
          transaction_code?: string
          transaction_date?: string | null
          transaction_type?: string
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          district_id: string | null
          due_date: string
          id: string
          invoice_date: string
          invoice_number: string
          notes: string | null
          payment_terms: string | null
          status: string
          subtotal: number
          tax_amount: number
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          district_id?: string | null
          due_date: string
          id?: string
          invoice_date?: string
          invoice_number: string
          notes?: string | null
          payment_terms?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          district_id?: string | null
          due_date?: string
          id?: string
          invoice_date?: string
          invoice_number?: string
          notes?: string | null
          payment_terms?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      item_promotions: {
        Row: {
          created_at: string | null
          id: string
          item_id: string | null
          promotion_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          promotion_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          promotion_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "item_promotions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "marketplace_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_promotions_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotional_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_requests: {
        Row: {
          actual_cost: number | null
          assigned_to: string | null
          category: string
          completed_at: string | null
          created_at: string | null
          description: string
          district_id: string | null
          estimated_cost: number | null
          id: string
          labor_hours: number | null
          location: string | null
          parts_needed: string[] | null
          photos: string[] | null
          priority: Database["public"]["Enums"]["complaint_priority"] | null
          requested_by: string | null
          scheduled_date: string | null
          status: Database["public"]["Enums"]["complaint_status"] | null
          title: string
          updated_at: string | null
          work_order_number: string | null
        }
        Insert: {
          actual_cost?: number | null
          assigned_to?: string | null
          category: string
          completed_at?: string | null
          created_at?: string | null
          description: string
          district_id?: string | null
          estimated_cost?: number | null
          id?: string
          labor_hours?: number | null
          location?: string | null
          parts_needed?: string[] | null
          photos?: string[] | null
          priority?: Database["public"]["Enums"]["complaint_priority"] | null
          requested_by?: string | null
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["complaint_status"] | null
          title: string
          updated_at?: string | null
          work_order_number?: string | null
        }
        Update: {
          actual_cost?: number | null
          assigned_to?: string | null
          category?: string
          completed_at?: string | null
          created_at?: string | null
          description?: string
          district_id?: string | null
          estimated_cost?: number | null
          id?: string
          labor_hours?: number | null
          location?: string | null
          parts_needed?: string[] | null
          photos?: string[] | null
          priority?: Database["public"]["Enums"]["complaint_priority"] | null
          requested_by?: string | null
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["complaint_status"] | null
          title?: string
          updated_at?: string | null
          work_order_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_requests_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_schedules: {
        Row: {
          actual_duration_hours: number | null
          assigned_to: string | null
          completed_at: string | null
          completion_notes: string | null
          cost: number | null
          created_at: string
          description: string | null
          equipment_id: string | null
          estimated_duration_hours: number | null
          facility_id: string | null
          id: string
          maintenance_type: string
          next_maintenance_date: string | null
          priority: string
          scheduled_date: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          actual_duration_hours?: number | null
          assigned_to?: string | null
          completed_at?: string | null
          completion_notes?: string | null
          cost?: number | null
          created_at?: string
          description?: string | null
          equipment_id?: string | null
          estimated_duration_hours?: number | null
          facility_id?: string | null
          id?: string
          maintenance_type: string
          next_maintenance_date?: string | null
          priority?: string
          scheduled_date: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          actual_duration_hours?: number | null
          assigned_to?: string | null
          completed_at?: string | null
          completion_notes?: string | null
          cost?: number | null
          created_at?: string
          description?: string | null
          equipment_id?: string | null
          estimated_duration_hours?: number | null
          facility_id?: string | null
          id?: string
          maintenance_type?: string
          next_maintenance_date?: string | null
          priority?: string
          scheduled_date?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_schedules_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "facility_equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_schedules_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_technicians: {
        Row: {
          created_at: string | null
          current_tasks: number | null
          district_id: string | null
          id: string
          is_active: boolean | null
          name: string
          specialization: string[] | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_tasks?: number | null
          district_id?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          specialization?: string[] | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_tasks?: number | null
          district_id?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          specialization?: string[] | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      marketplace_analytics: {
        Row: {
          avg_order_value: number | null
          created_at: string | null
          date: string
          district_id: string | null
          id: string
          top_category: string | null
          total_items_sold: number | null
          total_orders: number | null
          total_revenue: number | null
          unique_buyers: number | null
          unique_sellers: number | null
        }
        Insert: {
          avg_order_value?: number | null
          created_at?: string | null
          date: string
          district_id?: string | null
          id?: string
          top_category?: string | null
          total_items_sold?: number | null
          total_orders?: number | null
          total_revenue?: number | null
          unique_buyers?: number | null
          unique_sellers?: number | null
        }
        Update: {
          avg_order_value?: number | null
          created_at?: string | null
          date?: string
          district_id?: string | null
          id?: string
          top_category?: string | null
          total_items_sold?: number | null
          total_orders?: number | null
          total_revenue?: number | null
          unique_buyers?: number | null
          unique_sellers?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_analytics_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      marketplace_conversations: {
        Row: {
          buyer_id: string | null
          chat_room_id: string | null
          created_at: string | null
          id: string
          item_id: string | null
          seller_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          buyer_id?: string | null
          chat_room_id?: string | null
          created_at?: string | null
          id?: string
          item_id?: string | null
          seller_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          buyer_id?: string | null
          chat_room_id?: string | null
          created_at?: string | null
          id?: string
          item_id?: string | null
          seller_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_conversations_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_conversations_chat_room_id_fkey"
            columns: ["chat_room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_conversations_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "marketplace_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_conversations_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_disputes: {
        Row: {
          community_id: string | null
          complainant_id: string
          created_at: string
          description: string
          dispute_type: string
          district_id: string | null
          evidence_urls: Json | null
          id: string
          item_id: string | null
          order_id: string | null
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          respondent_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          community_id?: string | null
          complainant_id: string
          created_at?: string
          description: string
          dispute_type: string
          district_id?: string | null
          evidence_urls?: Json | null
          id?: string
          item_id?: string | null
          order_id?: string | null
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          respondent_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          community_id?: string | null
          complainant_id?: string
          created_at?: string
          description?: string
          dispute_type?: string
          district_id?: string | null
          evidence_urls?: Json | null
          id?: string
          item_id?: string | null
          order_id?: string | null
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          respondent_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_disputes_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_disputes_complainant_id_fkey"
            columns: ["complainant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_disputes_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_disputes_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_disputes_respondent_id_fkey"
            columns: ["respondent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_favorites: {
        Row: {
          created_at: string
          id: string
          item_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          user_id?: string
        }
        Relationships: []
      }
      marketplace_items: {
        Row: {
          allow_backorder: boolean | null
          category: string
          category_id: string | null
          condition: string | null
          created_at: string | null
          description: string | null
          dimensions: Json | null
          district_id: string | null
          id: string
          image: string | null
          images: string[] | null
          is_active: boolean | null
          is_available: boolean | null
          is_in_stock: boolean | null
          location: string | null
          low_stock_threshold: number | null
          price: number
          seller_id: string | null
          seller_type: string
          service_areas: string[] | null
          service_type: string | null
          shipping_required: boolean | null
          sku: string | null
          sold_count: number | null
          stock_quantity: number | null
          title: string
          track_inventory: boolean | null
          updated_at: string | null
          view_count: number | null
          weight: number | null
        }
        Insert: {
          allow_backorder?: boolean | null
          category: string
          category_id?: string | null
          condition?: string | null
          created_at?: string | null
          description?: string | null
          dimensions?: Json | null
          district_id?: string | null
          id?: string
          image?: string | null
          images?: string[] | null
          is_active?: boolean | null
          is_available?: boolean | null
          is_in_stock?: boolean | null
          location?: string | null
          low_stock_threshold?: number | null
          price: number
          seller_id?: string | null
          seller_type?: string
          service_areas?: string[] | null
          service_type?: string | null
          shipping_required?: boolean | null
          sku?: string | null
          sold_count?: number | null
          stock_quantity?: number | null
          title: string
          track_inventory?: boolean | null
          updated_at?: string | null
          view_count?: number | null
          weight?: number | null
        }
        Update: {
          allow_backorder?: boolean | null
          category?: string
          category_id?: string | null
          condition?: string | null
          created_at?: string | null
          description?: string | null
          dimensions?: Json | null
          district_id?: string | null
          id?: string
          image?: string | null
          images?: string[] | null
          is_active?: boolean | null
          is_available?: boolean | null
          is_in_stock?: boolean | null
          location?: string | null
          low_stock_threshold?: number | null
          price?: number
          seller_id?: string | null
          seller_type?: string
          service_areas?: string[] | null
          service_type?: string | null
          shipping_required?: boolean | null
          sku?: string | null
          sold_count?: number | null
          stock_quantity?: number | null
          title?: string
          track_inventory?: boolean | null
          updated_at?: string | null
          view_count?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_items_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_items_seller_id_profiles_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_listings: {
        Row: {
          category: string
          condition: Database["public"]["Enums"]["marketplace_condition"] | null
          created_at: string | null
          description: string
          district_id: string | null
          id: string
          images: string[] | null
          is_available: boolean | null
          is_featured: boolean | null
          price: number
          seller_id: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          condition?:
            | Database["public"]["Enums"]["marketplace_condition"]
            | null
          created_at?: string | null
          description: string
          district_id?: string | null
          id?: string
          images?: string[] | null
          is_available?: boolean | null
          is_featured?: boolean | null
          price: number
          seller_id?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          condition?:
            | Database["public"]["Enums"]["marketplace_condition"]
            | null
          created_at?: string | null
          description?: string
          district_id?: string | null
          id?: string
          images?: string[] | null
          is_available?: boolean | null
          is_featured?: boolean | null
          price?: number
          seller_id?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listings_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_orders: {
        Row: {
          buyer_id: string
          created_at: string
          delivered_at: string | null
          delivered_date: string | null
          discount_amount: number | null
          id: string
          item_id: string
          notes: string | null
          order_date: string
          payment_status: string
          promotion_code_id: string | null
          quantity: number
          seller_id: string
          shipped_at: string | null
          shipped_date: string | null
          shipping_address: Json | null
          shipping_cost: number | null
          shipping_method_id: string | null
          status: string
          total_amount: number
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          delivered_at?: string | null
          delivered_date?: string | null
          discount_amount?: number | null
          id?: string
          item_id: string
          notes?: string | null
          order_date?: string
          payment_status?: string
          promotion_code_id?: string | null
          quantity?: number
          seller_id: string
          shipped_at?: string | null
          shipped_date?: string | null
          shipping_address?: Json | null
          shipping_cost?: number | null
          shipping_method_id?: string | null
          status?: string
          total_amount: number
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          delivered_at?: string | null
          delivered_date?: string | null
          discount_amount?: number | null
          id?: string
          item_id?: string
          notes?: string | null
          order_date?: string
          payment_status?: string
          promotion_code_id?: string | null
          quantity?: number
          seller_id?: string
          shipped_at?: string | null
          shipped_date?: string | null
          shipping_address?: Json | null
          shipping_cost?: number | null
          shipping_method_id?: string | null
          status?: string
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_orders_promotion_code_id_fkey"
            columns: ["promotion_code_id"]
            isOneToOne: false
            referencedRelation: "promotional_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_orders_shipping_method_id_fkey"
            columns: ["shipping_method_id"]
            isOneToOne: false
            referencedRelation: "shipping_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_minutes: {
        Row: {
          action_items: Json | null
          agenda: string
          approved_at: string | null
          approved_by: string | null
          attendees: string[] | null
          chairperson: string | null
          created_at: string | null
          created_by: string | null
          decisions: string
          discussions: string
          district_id: string | null
          id: string
          location: string | null
          meeting_date: string
          meeting_time: string | null
          meeting_title: string
          meeting_type: string
          next_meeting_date: string | null
          secretary: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          action_items?: Json | null
          agenda: string
          approved_at?: string | null
          approved_by?: string | null
          attendees?: string[] | null
          chairperson?: string | null
          created_at?: string | null
          created_by?: string | null
          decisions: string
          discussions: string
          district_id?: string | null
          id?: string
          location?: string | null
          meeting_date: string
          meeting_time?: string | null
          meeting_title: string
          meeting_type: string
          next_meeting_date?: string | null
          secretary?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          action_items?: Json | null
          agenda?: string
          approved_at?: string | null
          approved_by?: string | null
          attendees?: string[] | null
          chairperson?: string | null
          created_at?: string | null
          created_by?: string | null
          decisions?: string
          discussions?: string
          district_id?: string | null
          id?: string
          location?: string | null
          meeting_date?: string
          meeting_time?: string | null
          meeting_title?: string
          meeting_type?: string
          next_meeting_date?: string | null
          secretary?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      message_reactions: {
        Row: {
          created_at: string | null
          id: string
          message_id: string
          reaction_emoji: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message_id: string
          reaction_emoji: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message_id?: string
          reaction_emoji?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      module_activities: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string
          description: string | null
          district_id: string | null
          id: string
          metadata: Json | null
          module_name: string
          performed_by: string | null
          performed_by_role: string | null
          reference_id: string | null
          reference_table: string | null
          user_id: string
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string
          description?: string | null
          district_id?: string | null
          id?: string
          metadata?: Json | null
          module_name: string
          performed_by?: string | null
          performed_by_role?: string | null
          reference_id?: string | null
          reference_table?: string | null
          user_id: string
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string
          description?: string | null
          district_id?: string | null
          id?: string
          metadata?: Json | null
          module_name?: string
          performed_by?: string | null
          performed_by_role?: string | null
          reference_id?: string | null
          reference_table?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_activities_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          announcements: boolean | null
          bookings: boolean | null
          complaints: boolean | null
          created_at: string | null
          emergencies: boolean | null
          events: boolean | null
          id: string
          maintenance: boolean | null
          marketplace: boolean | null
          mentions: boolean | null
          messages: boolean | null
          security: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          announcements?: boolean | null
          bookings?: boolean | null
          complaints?: boolean | null
          created_at?: string | null
          emergencies?: boolean | null
          events?: boolean | null
          id?: string
          maintenance?: boolean | null
          marketplace?: boolean | null
          mentions?: boolean | null
          messages?: boolean | null
          security?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          announcements?: boolean | null
          bookings?: boolean | null
          complaints?: boolean | null
          created_at?: string | null
          emergencies?: boolean | null
          events?: boolean | null
          id?: string
          maintenance?: boolean | null
          marketplace?: boolean | null
          mentions?: boolean | null
          messages?: boolean | null
          security?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notification_routing: {
        Row: {
          category: string | null
          created_at: string | null
          delay_minutes: number | null
          event_type: string
          id: string
          is_active: boolean | null
          module_name: string
          notification_methods: string[] | null
          priority: string | null
          target_roles:
            | Database["public"]["Enums"]["enhanced_user_role"][]
            | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          delay_minutes?: number | null
          event_type: string
          id?: string
          is_active?: boolean | null
          module_name: string
          notification_methods?: string[] | null
          priority?: string | null
          target_roles?:
            | Database["public"]["Enums"]["enhanced_user_role"][]
            | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          delay_minutes?: number | null
          event_type?: string
          id?: string
          is_active?: boolean | null
          module_name?: string
          notification_methods?: string[] | null
          priority?: string | null
          target_roles?:
            | Database["public"]["Enums"]["enhanced_user_role"][]
            | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          delivery_method: string[] | null
          district_id: string | null
          expires_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          notification_type: string | null
          priority: string | null
          read_at: string | null
          recipient_id: string | null
          recipient_roles: string[] | null
          recipient_type: string | null
          reference_id: string | null
          reference_table: string | null
          scheduled_at: string | null
          sent_at: string | null
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          delivery_method?: string[] | null
          district_id?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          notification_type?: string | null
          priority?: string | null
          read_at?: string | null
          recipient_id?: string | null
          recipient_roles?: string[] | null
          recipient_type?: string | null
          reference_id?: string | null
          reference_table?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          delivery_method?: string[] | null
          district_id?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          notification_type?: string | null
          priority?: string | null
          read_at?: string | null
          recipient_id?: string | null
          recipient_roles?: string[] | null
          recipient_type?: string | null
          reference_id?: string | null
          reference_table?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          title?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          item_id: string
          order_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          order_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          order_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "marketplace_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          currency: string
          id: string
          notes: string | null
          payment_status: string
          shipping_address: Json | null
          status: string
          stripe_session_id: string | null
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          payment_status?: string
          shipping_address?: Json | null
          status?: string
          stripe_session_id?: string | null
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          payment_status?: string
          shipping_address?: Json | null
          status?: string
          stripe_session_id?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      panic_alerts: {
        Row: {
          alert_status: string
          created_at: string
          district_id: string | null
          id: string
          location_address: string | null
          location_latitude: number | null
          location_longitude: number | null
          notes: string | null
          responded_by: string | null
          response_time: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_status?: string
          created_at?: string
          district_id?: string | null
          id?: string
          location_address?: string | null
          location_latitude?: number | null
          location_longitude?: number | null
          notes?: string | null
          responded_by?: string | null
          response_time?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_status?: string
          created_at?: string
          district_id?: string | null
          id?: string
          location_address?: string | null
          location_latitude?: number | null
          location_longitude?: number | null
          notes?: string | null
          responded_by?: string | null
          response_time?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "panic_alerts_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      parking_slots: {
        Row: {
          assigned_user_id: string | null
          created_at: string | null
          district_id: string | null
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          is_occupied: boolean | null
          monthly_rate: number | null
          slot_number: string
          slot_type: string | null
          updated_at: string | null
          vehicle_plate: string | null
          zone: string
        }
        Insert: {
          assigned_user_id?: string | null
          created_at?: string | null
          district_id?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          is_occupied?: boolean | null
          monthly_rate?: number | null
          slot_number: string
          slot_type?: string | null
          updated_at?: string | null
          vehicle_plate?: string | null
          zone: string
        }
        Update: {
          assigned_user_id?: string | null
          created_at?: string | null
          district_id?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          is_occupied?: boolean | null
          monthly_rate?: number | null
          slot_number?: string
          slot_type?: string | null
          updated_at?: string | null
          vehicle_plate?: string | null
          zone?: string
        }
        Relationships: []
      }
      payment_plans: {
        Row: {
          created_at: string
          frequency: string
          id: string
          installment_amount: number
          installments: number
          invoice_id: string | null
          next_due_date: string
          paid_installments: number
          start_date: string
          status: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          frequency?: string
          id?: string
          installment_amount: number
          installments?: number
          invoice_id?: string | null
          next_due_date: string
          paid_installments?: number
          start_date?: string
          status?: string
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          frequency?: string
          id?: string
          installment_amount?: number
          installments?: number
          invoice_id?: string | null
          next_due_date?: string
          paid_installments?: number
          start_date?: string
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_plans_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          description: string | null
          district_id: string | null
          due_date: string | null
          id: string
          payment_date: string | null
          payment_method: string | null
          payment_type: string
          receipt_url: string | null
          reference_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          district_id?: string | null
          due_date?: string | null
          id?: string
          payment_date?: string | null
          payment_method?: string | null
          payment_type: string
          receipt_url?: string | null
          reference_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          district_id?: string | null
          due_date?: string | null
          id?: string
          payment_date?: string | null
          payment_method?: string | null
          payment_type?: string
          receipt_url?: string | null
          reference_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          created_at: string | null
          district_id: string | null
          id: string
          measurement_date: string
          metric_name: string
          metric_type: string
          metric_value: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          district_id?: string | null
          id?: string
          measurement_date: string
          metric_name: string
          metric_type: string
          metric_value: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          district_id?: string | null
          id?: string
          measurement_date?: string
          metric_name?: string
          metric_type?: string
          metric_value?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_metrics_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_options: {
        Row: {
          created_at: string
          id: string
          option_order: number
          option_text: string
          poll_id: string
          vote_count: number
        }
        Insert: {
          created_at?: string
          id?: string
          option_order?: number
          option_text: string
          poll_id: string
          vote_count?: number
        }
        Update: {
          created_at?: string
          id?: string
          option_order?: number
          option_text?: string
          poll_id?: string
          vote_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "announcement_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          id: string
          poll_id: string | null
          rating: number | null
          selected_options: number[] | null
          user_id: string
          voted_at: string | null
        }
        Insert: {
          id?: string
          poll_id?: string | null
          rating?: number | null
          selected_options?: number[] | null
          user_id: string
          voted_at?: string | null
        }
        Update: {
          id?: string
          poll_id?: string | null
          rating?: number | null
          selected_options?: number[] | null
          user_id?: string
          voted_at?: string | null
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
          created_by: string | null
          description: string
          district_id: string | null
          end_date: string
          id: string
          is_active: boolean | null
          is_anonymous: boolean | null
          options: Json
          poll_type: string | null
          start_date: string | null
          title: string
          total_votes: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description: string
          district_id?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          is_anonymous?: boolean | null
          options: Json
          poll_type?: string | null
          start_date?: string | null
          title: string
          total_votes?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string
          district_id?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          is_anonymous?: boolean | null
          options?: Json
          poll_type?: string | null
          start_date?: string | null
          title?: string
          total_votes?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      priority_levels: {
        Row: {
          category: string | null
          code: string
          color_class: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          severity_level: number | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          code: string
          color_class?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          severity_level?: number | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          code?: string
          color_class?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          severity_level?: number | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      product_analytics: {
        Row: {
          cart_adds: number | null
          conversion_rate: number | null
          created_at: string | null
          date: string
          favorites_count: number | null
          id: string
          item_id: string | null
          purchases: number | null
          revenue: number | null
          views_count: number | null
        }
        Insert: {
          cart_adds?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          date: string
          favorites_count?: number | null
          id?: string
          item_id?: string | null
          purchases?: number | null
          revenue?: number | null
          views_count?: number | null
        }
        Update: {
          cart_adds?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          date?: string
          favorites_count?: number | null
          id?: string
          item_id?: string | null
          purchases?: number | null
          revenue?: number | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_analytics_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "marketplace_items"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          created_at: string | null
          description: string | null
          description_ms: string | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          name: string
          name_ms: string | null
          parent_id: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          description_ms?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          name_ms?: string | null
          parent_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          description_ms?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          name_ms?: string | null
          parent_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      product_recommendations: {
        Row: {
          created_at: string | null
          id: string
          item_id: string | null
          recommendation_type: string | null
          score: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          recommendation_type?: string | null
          score?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          recommendation_type?: string | null
          score?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_recommendations_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "marketplace_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_recommendations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          comment: string | null
          created_at: string
          helpful_count: number | null
          id: string
          is_verified_purchase: boolean | null
          item_id: string
          rating: number
          reviewer_id: string
          seller_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          item_id: string
          rating: number
          reviewer_id: string
          seller_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          item_id?: string
          rating?: number
          reviewer_id?: string
          seller_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "marketplace_items"
            referencedColumns: ["id"]
          },
        ]
      }
      product_shares: {
        Row: {
          id: string
          item_id: string | null
          platform: string | null
          shared_at: string | null
          shared_by: string | null
        }
        Insert: {
          id?: string
          item_id?: string | null
          platform?: string | null
          shared_at?: string | null
          shared_by?: string | null
        }
        Update: {
          id?: string
          item_id?: string | null
          platform?: string | null
          shared_at?: string | null
          shared_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_shares_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "marketplace_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_shares_shared_by_fkey"
            columns: ["shared_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_privacy_settings: {
        Row: {
          allow_event_invites: boolean | null
          allow_messages: boolean | null
          created_at: string | null
          id: string
          profile_visibility: string | null
          show_address: boolean | null
          show_email: boolean | null
          show_full_name: boolean | null
          show_phone: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          allow_event_invites?: boolean | null
          allow_messages?: boolean | null
          created_at?: string | null
          id?: string
          profile_visibility?: string | null
          show_address?: boolean | null
          show_email?: boolean | null
          show_full_name?: boolean | null
          show_phone?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          allow_event_invites?: boolean | null
          allow_messages?: boolean | null
          created_at?: string | null
          id?: string
          profile_visibility?: string | null
          show_address?: boolean | null
          show_email?: boolean | null
          show_full_name?: boolean | null
          show_phone?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_privacy_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: string | null
          address: string | null
          age: number | null
          agree_declare: boolean | null
          avatar_url: string | null
          community_id: string | null
          community_status: boolean | null
          created_at: string | null
          created_by: string | null
          district_id: string | null
          dob: string | null
          education_level: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          ethnic_id: string | null
          full_name: string | null
          gender: string | null
          id: string
          identity_no: string | null
          identity_no_type: string | null
          income_range: string | null
          interests: string[] | null
          is_active: boolean | null
          is_searchable: boolean | null
          join_date: string | null
          language: string | null
          language_preference: string | null
          marital_status: string | null
          membership_id: string | null
          mobile_no: string | null
          nationality_id: string | null
          occupation_id: string | null
          oku_status: boolean | null
          pdpa_declare: boolean | null
          phone: string | null
          primary_role: Database["public"]["Enums"]["app_role"] | null
          profile_bio: string | null
          race_id: string | null
          register_method: string | null
          registration_status: boolean | null
          skills: string[] | null
          socio_id: string | null
          spouse_dob: string | null
          spouse_full_name: string | null
          spouse_gender: string | null
          spouse_identity_no: string | null
          spouse_identity_no_type: string | null
          spouse_mobile_no: string | null
          spouse_occupation: string | null
          spouse_workplace: string | null
          status_entrepreneur: boolean | null
          status_membership: string | null
          supervision: string | null
          theme: string | null
          theme_preference: string | null
          type_sector: string | null
          unit_number: string | null
          updated_at: string | null
          updated_by: string | null
          user_id: string
          vehicle_plate_number: string | null
        }
        Insert: {
          account_status?: string | null
          address?: string | null
          age?: number | null
          agree_declare?: boolean | null
          avatar_url?: string | null
          community_id?: string | null
          community_status?: boolean | null
          created_at?: string | null
          created_by?: string | null
          district_id?: string | null
          dob?: string | null
          education_level?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          ethnic_id?: string | null
          full_name?: string | null
          gender?: string | null
          id: string
          identity_no?: string | null
          identity_no_type?: string | null
          income_range?: string | null
          interests?: string[] | null
          is_active?: boolean | null
          is_searchable?: boolean | null
          join_date?: string | null
          language?: string | null
          language_preference?: string | null
          marital_status?: string | null
          membership_id?: string | null
          mobile_no?: string | null
          nationality_id?: string | null
          occupation_id?: string | null
          oku_status?: boolean | null
          pdpa_declare?: boolean | null
          phone?: string | null
          primary_role?: Database["public"]["Enums"]["app_role"] | null
          profile_bio?: string | null
          race_id?: string | null
          register_method?: string | null
          registration_status?: boolean | null
          skills?: string[] | null
          socio_id?: string | null
          spouse_dob?: string | null
          spouse_full_name?: string | null
          spouse_gender?: string | null
          spouse_identity_no?: string | null
          spouse_identity_no_type?: string | null
          spouse_mobile_no?: string | null
          spouse_occupation?: string | null
          spouse_workplace?: string | null
          status_entrepreneur?: boolean | null
          status_membership?: string | null
          supervision?: string | null
          theme?: string | null
          theme_preference?: string | null
          type_sector?: string | null
          unit_number?: string | null
          updated_at?: string | null
          updated_by?: string | null
          user_id: string
          vehicle_plate_number?: string | null
        }
        Update: {
          account_status?: string | null
          address?: string | null
          age?: number | null
          agree_declare?: boolean | null
          avatar_url?: string | null
          community_id?: string | null
          community_status?: boolean | null
          created_at?: string | null
          created_by?: string | null
          district_id?: string | null
          dob?: string | null
          education_level?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          ethnic_id?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          identity_no?: string | null
          identity_no_type?: string | null
          income_range?: string | null
          interests?: string[] | null
          is_active?: boolean | null
          is_searchable?: boolean | null
          join_date?: string | null
          language?: string | null
          language_preference?: string | null
          marital_status?: string | null
          membership_id?: string | null
          mobile_no?: string | null
          nationality_id?: string | null
          occupation_id?: string | null
          oku_status?: boolean | null
          pdpa_declare?: boolean | null
          phone?: string | null
          primary_role?: Database["public"]["Enums"]["app_role"] | null
          profile_bio?: string | null
          race_id?: string | null
          register_method?: string | null
          registration_status?: boolean | null
          skills?: string[] | null
          socio_id?: string | null
          spouse_dob?: string | null
          spouse_full_name?: string | null
          spouse_gender?: string | null
          spouse_identity_no?: string | null
          spouse_identity_no_type?: string | null
          spouse_mobile_no?: string | null
          spouse_occupation?: string | null
          spouse_workplace?: string | null
          status_entrepreneur?: boolean | null
          status_membership?: string | null
          supervision?: string | null
          theme?: string | null
          theme_preference?: string | null
          type_sector?: string | null
          unit_number?: string | null
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string
          vehicle_plate_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      promotion_usage: {
        Row: {
          discount_amount: number
          id: string
          order_id: string | null
          promotion_id: string | null
          used_at: string | null
          user_id: string | null
        }
        Insert: {
          discount_amount: number
          id?: string
          order_id?: string | null
          promotion_id?: string | null
          used_at?: string | null
          user_id?: string | null
        }
        Update: {
          discount_amount?: number
          id?: string
          order_id?: string | null
          promotion_id?: string | null
          used_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promotion_usage_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "marketplace_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_usage_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotional_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      promotional_codes: {
        Row: {
          applies_to: string | null
          code: string
          created_at: string | null
          created_by: string | null
          current_uses: number | null
          description: string | null
          discount_type: string | null
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          minimum_order_amount: number | null
          name: string
          per_user_limit: number | null
          starts_at: string | null
          updated_at: string | null
        }
        Insert: {
          applies_to?: string | null
          code: string
          created_at?: string | null
          created_by?: string | null
          current_uses?: number | null
          description?: string | null
          discount_type?: string | null
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          minimum_order_amount?: number | null
          name: string
          per_user_limit?: number | null
          starts_at?: string | null
          updated_at?: string | null
        }
        Update: {
          applies_to?: string | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          current_uses?: number | null
          description?: string | null
          discount_type?: string | null
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          minimum_order_amount?: number | null
          name?: string
          per_user_limit?: number | null
          starts_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promotional_codes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth_key: string
          created_at: string | null
          device_type: string | null
          endpoint: string
          id: string
          is_active: boolean | null
          p256dh_key: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auth_key: string
          created_at?: string | null
          device_type?: string | null
          endpoint: string
          id?: string
          is_active?: boolean | null
          p256dh_key: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auth_key?: string
          created_at?: string | null
          device_type?: string | null
          endpoint?: string
          id?: string
          is_active?: boolean | null
          p256dh_key?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      quality_inspections: {
        Row: {
          completed_date: string | null
          created_at: string | null
          district_id: string | null
          findings: string | null
          id: string
          inspection_type: string
          inspector_id: string | null
          location: string
          next_inspection_date: string | null
          passed: boolean | null
          recommendations: string | null
          scheduled_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          completed_date?: string | null
          created_at?: string | null
          district_id?: string | null
          findings?: string | null
          id?: string
          inspection_type: string
          inspector_id?: string | null
          location: string
          next_inspection_date?: string | null
          passed?: boolean | null
          recommendations?: string | null
          scheduled_date: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          completed_date?: string | null
          created_at?: string | null
          district_id?: string | null
          findings?: string | null
          id?: string
          inspection_type?: string
          inspector_id?: string | null
          location?: string
          next_inspection_date?: string | null
          passed?: boolean | null
          recommendations?: string | null
          scheduled_date?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quality_inspections_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      recent_activities: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string | null
          district_id: string | null
          id: string
          reference_id: string | null
          reference_table: string | null
          status: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          description?: string | null
          district_id?: string | null
          id?: string
          reference_id?: string | null
          reference_table?: string | null
          status?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          description?: string | null
          district_id?: string | null
          id?: string
          reference_id?: string | null
          reference_table?: string | null
          status?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recent_activities_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_bookings: {
        Row: {
          created_at: string
          days_of_week: number[] | null
          end_date: string | null
          end_time: string
          facility_id: string
          id: string
          next_booking_date: string | null
          purpose: string | null
          recurrence_interval: number
          recurrence_pattern: string
          start_date: string
          start_time: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          days_of_week?: number[] | null
          end_date?: string | null
          end_time: string
          facility_id: string
          id?: string
          next_booking_date?: string | null
          purpose?: string | null
          recurrence_interval?: number
          recurrence_pattern: string
          start_date: string
          start_time: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          days_of_week?: number[] | null
          end_date?: string | null
          end_time?: string
          facility_id?: string
          id?: string
          next_booking_date?: string | null
          purpose?: string | null
          recurrence_interval?: number
          recurrence_pattern?: string
          start_date?: string
          start_time?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_bookings_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      reference_types: {
        Row: {
          category: string
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          category: string
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          category?: string
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      review_helpfulness: {
        Row: {
          created_at: string
          id: string
          is_helpful: boolean
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_helpful: boolean
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_helpful?: boolean
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_helpfulness_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "product_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      role_approval_steps: {
        Row: {
          approver_id: string | null
          approver_role: Database["public"]["Enums"]["user_role"]
          comments: string | null
          completed_at: string | null
          created_at: string
          id: string
          request_id: string
          requirement_type: Database["public"]["Enums"]["approval_requirement"]
          status: string
          step_order: number
        }
        Insert: {
          approver_id?: string | null
          approver_role: Database["public"]["Enums"]["user_role"]
          comments?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          request_id: string
          requirement_type: Database["public"]["Enums"]["approval_requirement"]
          status?: string
          step_order: number
        }
        Update: {
          approver_id?: string | null
          approver_role?: Database["public"]["Enums"]["user_role"]
          comments?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          request_id?: string
          requirement_type?: Database["public"]["Enums"]["approval_requirement"]
          status?: string
          step_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "role_approval_steps_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "role_change_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      role_audit_logs: {
        Row: {
          action: string
          district_id: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          new_role: Database["public"]["Enums"]["user_role"] | null
          old_role: Database["public"]["Enums"]["user_role"] | null
          performed_by: string
          reason: string | null
          request_id: string | null
          timestamp: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          district_id?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_role?: Database["public"]["Enums"]["user_role"] | null
          old_role?: Database["public"]["Enums"]["user_role"] | null
          performed_by: string
          reason?: string | null
          request_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          district_id?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_role?: Database["public"]["Enums"]["user_role"] | null
          old_role?: Database["public"]["Enums"]["user_role"] | null
          performed_by?: string
          reason?: string | null
          request_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_audit_logs_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_audit_logs_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "role_change_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      role_change_history: {
        Row: {
          change_reason: string | null
          changed_by: string | null
          created_at: string | null
          district_id: string | null
          id: string
          new_role: Database["public"]["Enums"]["enhanced_user_role"]
          old_role: Database["public"]["Enums"]["enhanced_user_role"] | null
          user_id: string
        }
        Insert: {
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string | null
          district_id?: string | null
          id?: string
          new_role: Database["public"]["Enums"]["enhanced_user_role"]
          old_role?: Database["public"]["Enums"]["enhanced_user_role"] | null
          user_id: string
        }
        Update: {
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string | null
          district_id?: string | null
          id?: string
          new_role?: Database["public"]["Enums"]["enhanced_user_role"]
          old_role?: Database["public"]["Enums"]["enhanced_user_role"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_change_history_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      role_change_requests: {
        Row: {
          activated_at: string | null
          approval_requirements:
            | Database["public"]["Enums"]["approval_requirement"][]
            | null
          approved_at: string | null
          approved_by: string | null
          assigned_approver_id: string | null
          attachments: string[] | null
          created_at: string
          current_user_role: Database["public"]["Enums"]["user_role"]
          district_id: string | null
          expires_at: string | null
          id: string
          justification: string | null
          reason: string
          rejection_reason: string | null
          request_type: string
          requested_user_role: Database["public"]["Enums"]["user_role"]
          requester_id: string
          required_approver_role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["role_request_status"]
          target_user_id: string
          updated_at: string
        }
        Insert: {
          activated_at?: string | null
          approval_requirements?:
            | Database["public"]["Enums"]["approval_requirement"][]
            | null
          approved_at?: string | null
          approved_by?: string | null
          assigned_approver_id?: string | null
          attachments?: string[] | null
          created_at?: string
          current_user_role: Database["public"]["Enums"]["user_role"]
          district_id?: string | null
          expires_at?: string | null
          id?: string
          justification?: string | null
          reason: string
          rejection_reason?: string | null
          request_type?: string
          requested_user_role: Database["public"]["Enums"]["user_role"]
          requester_id: string
          required_approver_role: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["role_request_status"]
          target_user_id: string
          updated_at?: string
        }
        Update: {
          activated_at?: string | null
          approval_requirements?:
            | Database["public"]["Enums"]["approval_requirement"][]
            | null
          approved_at?: string | null
          approved_by?: string | null
          assigned_approver_id?: string | null
          attachments?: string[] | null
          created_at?: string
          current_user_role?: Database["public"]["Enums"]["user_role"]
          district_id?: string | null
          expires_at?: string | null
          id?: string
          justification?: string | null
          reason?: string
          rejection_reason?: string | null
          request_type?: string
          requested_user_role?: Database["public"]["Enums"]["user_role"]
          requester_id?: string
          required_approver_role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["role_request_status"]
          target_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_change_requests_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      role_hierarchy: {
        Row: {
          color_code: string | null
          created_at: string | null
          description: string | null
          display_name: string
          level: number
          permission_level: Database["public"]["Enums"]["permission_level"]
          role: Database["public"]["Enums"]["enhanced_user_role"]
        }
        Insert: {
          color_code?: string | null
          created_at?: string | null
          description?: string | null
          display_name: string
          level: number
          permission_level: Database["public"]["Enums"]["permission_level"]
          role: Database["public"]["Enums"]["enhanced_user_role"]
        }
        Update: {
          color_code?: string | null
          created_at?: string | null
          description?: string | null
          display_name?: string
          level?: number
          permission_level?: Database["public"]["Enums"]["permission_level"]
          role?: Database["public"]["Enums"]["enhanced_user_role"]
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          can_approve: boolean | null
          can_create: boolean | null
          can_delete: boolean | null
          can_read: boolean | null
          can_update: boolean | null
          created_at: string | null
          id: string
          module_id: string
          restrictions: Json | null
          role: Database["public"]["Enums"]["enhanced_user_role"]
        }
        Insert: {
          can_approve?: boolean | null
          can_create?: boolean | null
          can_delete?: boolean | null
          can_read?: boolean | null
          can_update?: boolean | null
          created_at?: string | null
          id?: string
          module_id: string
          restrictions?: Json | null
          role: Database["public"]["Enums"]["enhanced_user_role"]
        }
        Update: {
          can_approve?: boolean | null
          can_create?: boolean | null
          can_delete?: boolean | null
          can_read?: boolean | null
          can_update?: boolean | null
          created_at?: string | null
          id?: string
          module_id?: string
          restrictions?: Json | null
          role?: Database["public"]["Enums"]["enhanced_user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "system_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      security_alerts: {
        Row: {
          alert_type: string
          created_at: string
          description: string | null
          district_id: string | null
          id: string
          location_description: string | null
          location_latitude: number | null
          location_longitude: number | null
          reporter_id: string
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          alert_type?: string
          created_at?: string
          description?: string | null
          district_id?: string | null
          id?: string
          location_description?: string | null
          location_latitude?: number | null
          location_longitude?: number | null
          reporter_id: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          description?: string | null
          district_id?: string | null
          id?: string
          location_description?: string | null
          location_latitude?: number | null
          location_longitude?: number | null
          reporter_id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      security_patrols: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          checkpoints_completed: string[] | null
          created_at: string | null
          district_id: string | null
          id: string
          notes: string | null
          officer_id: string | null
          patrol_route: string
          scheduled_end: string
          scheduled_start: string
          status: string | null
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          checkpoints_completed?: string[] | null
          created_at?: string | null
          district_id?: string | null
          id?: string
          notes?: string | null
          officer_id?: string | null
          patrol_route: string
          scheduled_end: string
          scheduled_start: string
          status?: string | null
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          checkpoints_completed?: string[] | null
          created_at?: string | null
          district_id?: string | null
          id?: string
          notes?: string | null
          officer_id?: string | null
          patrol_route?: string
          scheduled_end?: string
          scheduled_start?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_patrols_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_ratings: {
        Row: {
          average_rating: number | null
          five_star_count: number | null
          four_star_count: number | null
          id: string
          one_star_count: number | null
          seller_id: string
          three_star_count: number | null
          total_reviews: number | null
          two_star_count: number | null
          updated_at: string
        }
        Insert: {
          average_rating?: number | null
          five_star_count?: number | null
          four_star_count?: number | null
          id?: string
          one_star_count?: number | null
          seller_id: string
          three_star_count?: number | null
          total_reviews?: number | null
          two_star_count?: number | null
          updated_at?: string
        }
        Update: {
          average_rating?: number | null
          five_star_count?: number | null
          four_star_count?: number | null
          id?: string
          one_star_count?: number | null
          seller_id?: string
          three_star_count?: number | null
          total_reviews?: number | null
          two_star_count?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      sensor_readings: {
        Row: {
          id: string
          is_alert: boolean | null
          sensor_id: string | null
          timestamp: string | null
          value: number
        }
        Insert: {
          id?: string
          is_alert?: boolean | null
          sensor_id?: string | null
          timestamp?: string | null
          value: number
        }
        Update: {
          id?: string
          is_alert?: boolean | null
          sensor_id?: string | null
          timestamp?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "sensor_readings_sensor_id_fkey"
            columns: ["sensor_id"]
            isOneToOne: false
            referencedRelation: "sensors"
            referencedColumns: ["id"]
          },
        ]
      }
      sensors: {
        Row: {
          created_at: string | null
          district_id: string | null
          id: string
          is_active: boolean | null
          location: string
          max_threshold: number | null
          min_threshold: number | null
          name: string
          type: string
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          district_id?: string | null
          id?: string
          is_active?: boolean | null
          location: string
          max_threshold?: number | null
          min_threshold?: number | null
          name: string
          type: string
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          district_id?: string | null
          id?: string
          is_active?: boolean | null
          location?: string
          max_threshold?: number | null
          min_threshold?: number | null
          name?: string
          type?: string
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sensors_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      service_appointments: {
        Row: {
          actual_cost: number | null
          appointment_date: string
          appointment_time: string
          client_id: string | null
          created_at: string | null
          district_id: string | null
          duration_minutes: number | null
          estimated_cost: number | null
          id: string
          notes: string | null
          provider_id: string | null
          service_type: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          actual_cost?: number | null
          appointment_date: string
          appointment_time: string
          client_id?: string | null
          created_at?: string | null
          district_id?: string | null
          duration_minutes?: number | null
          estimated_cost?: number | null
          id?: string
          notes?: string | null
          provider_id?: string | null
          service_type: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_cost?: number | null
          appointment_date?: string
          appointment_time?: string
          client_id?: string | null
          created_at?: string | null
          district_id?: string | null
          duration_minutes?: number | null
          estimated_cost?: number | null
          id?: string
          notes?: string | null
          provider_id?: string | null
          service_type?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_appointments_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_appointments_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          color_code: string | null
          created_at: string | null
          description: string | null
          district_id: string | null
          estimated_response_time: unknown | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          requires_approval: boolean | null
        }
        Insert: {
          color_code?: string | null
          created_at?: string | null
          description?: string | null
          district_id?: string | null
          estimated_response_time?: unknown | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          requires_approval?: boolean | null
        }
        Update: {
          color_code?: string | null
          created_at?: string | null
          description?: string | null
          district_id?: string | null
          estimated_response_time?: unknown | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          requires_approval?: boolean | null
        }
        Relationships: []
      }
      service_provider_applications: {
        Row: {
          applicant_id: string | null
          business_address: string
          business_description: string | null
          business_name: string
          business_references: Json | null
          business_registration_number: string | null
          business_type: string
          contact_email: string
          contact_person: string
          contact_phone: string
          created_at: string | null
          district_id: string | null
          experience_years: number | null
          id: string
          insurance_info: Json | null
          operating_hours: Json | null
          priority: string | null
          rejection_reason: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          service_areas: string[] | null
          service_categories: string[] | null
          services_offered: string[] | null
          social_media: Json | null
          status: string | null
          tax_id: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          applicant_id?: string | null
          business_address: string
          business_description?: string | null
          business_name: string
          business_references?: Json | null
          business_registration_number?: string | null
          business_type: string
          contact_email: string
          contact_person: string
          contact_phone: string
          created_at?: string | null
          district_id?: string | null
          experience_years?: number | null
          id?: string
          insurance_info?: Json | null
          operating_hours?: Json | null
          priority?: string | null
          rejection_reason?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_areas?: string[] | null
          service_categories?: string[] | null
          services_offered?: string[] | null
          social_media?: Json | null
          status?: string | null
          tax_id?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          applicant_id?: string | null
          business_address?: string
          business_description?: string | null
          business_name?: string
          business_references?: Json | null
          business_registration_number?: string | null
          business_type?: string
          contact_email?: string
          contact_person?: string
          contact_phone?: string
          created_at?: string | null
          district_id?: string | null
          experience_years?: number | null
          id?: string
          insurance_info?: Json | null
          operating_hours?: Json | null
          priority?: string | null
          rejection_reason?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_areas?: string[] | null
          service_categories?: string[] | null
          services_offered?: string[] | null
          social_media?: Json | null
          status?: string | null
          tax_id?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_provider_applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_provider_applications_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_provider_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_provider_businesses: {
        Row: {
          business_address: string | null
          business_email: string | null
          business_name: string
          business_phone: string | null
          business_registration_number: string | null
          business_type: string | null
          created_at: string | null
          id: string
          is_verified: boolean | null
          license_expiry: string | null
          license_number: string | null
          service_areas: string[] | null
          updated_at: string | null
          user_id: string
          verification_documents: Json | null
        }
        Insert: {
          business_address?: string | null
          business_email?: string | null
          business_name: string
          business_phone?: string | null
          business_registration_number?: string | null
          business_type?: string | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          license_expiry?: string | null
          license_number?: string | null
          service_areas?: string[] | null
          updated_at?: string | null
          user_id: string
          verification_documents?: Json | null
        }
        Update: {
          business_address?: string | null
          business_email?: string | null
          business_name?: string
          business_phone?: string | null
          business_registration_number?: string | null
          business_type?: string | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          license_expiry?: string | null
          license_number?: string | null
          service_areas?: string[] | null
          updated_at?: string | null
          user_id?: string
          verification_documents?: Json | null
        }
        Relationships: []
      }
      service_provider_profiles: {
        Row: {
          application_id: string | null
          approved_at: string | null
          average_rating: number | null
          business_address: string | null
          business_description: string | null
          business_name: string
          business_type: string
          compliance_status: string | null
          contact_email: string
          contact_phone: string
          created_at: string | null
          district_id: string | null
          featured: boolean | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          logo_url: string | null
          operating_hours: Json | null
          service_areas: string[] | null
          service_categories: string[] | null
          service_pricing: Json | null
          services_offered: string[] | null
          social_media: Json | null
          subscription_tier: string | null
          total_reviews: number | null
          updated_at: string | null
          user_id: string | null
          website_url: string | null
        }
        Insert: {
          application_id?: string | null
          approved_at?: string | null
          average_rating?: number | null
          business_address?: string | null
          business_description?: string | null
          business_name: string
          business_type: string
          compliance_status?: string | null
          contact_email: string
          contact_phone: string
          created_at?: string | null
          district_id?: string | null
          featured?: boolean | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          operating_hours?: Json | null
          service_areas?: string[] | null
          service_categories?: string[] | null
          service_pricing?: Json | null
          services_offered?: string[] | null
          social_media?: Json | null
          subscription_tier?: string | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string | null
          website_url?: string | null
        }
        Update: {
          application_id?: string | null
          approved_at?: string | null
          average_rating?: number | null
          business_address?: string | null
          business_description?: string | null
          business_name?: string
          business_type?: string
          compliance_status?: string | null
          contact_email?: string
          contact_phone?: string
          created_at?: string | null
          district_id?: string | null
          featured?: boolean | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          operating_hours?: Json | null
          service_areas?: string[] | null
          service_categories?: string[] | null
          service_pricing?: Json | null
          services_offered?: string[] | null
          social_media?: Json | null
          subscription_tier?: string | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_provider_profiles_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "service_provider_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_provider_profiles_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_provider_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_providers: {
        Row: {
          business_name: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          description: string | null
          district_id: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          license_number: string | null
          operating_hours: Json | null
          rating: number | null
          service_areas: string[] | null
          service_category: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          business_name: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          district_id?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          license_number?: string | null
          operating_hours?: Json | null
          rating?: number | null
          service_areas?: string[] | null
          service_category: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          business_name?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          district_id?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          license_number?: string | null
          operating_hours?: Json | null
          rating?: number | null
          service_areas?: string[] | null
          service_category?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_providers_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          actual_cost: number | null
          assigned_at: string | null
          assigned_to: string | null
          attachments: string[] | null
          category_id: string
          completed_at: string | null
          completion_notes: string | null
          created_at: string | null
          description: string
          district_id: string | null
          estimated_cost: number | null
          id: string
          location: string | null
          photos: string[] | null
          preferred_date: string | null
          preferred_time: string | null
          priority: string | null
          request_number: string
          requester_id: string
          started_at: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_cost?: number | null
          assigned_at?: string | null
          assigned_to?: string | null
          attachments?: string[] | null
          category_id: string
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string | null
          description: string
          district_id?: string | null
          estimated_cost?: number | null
          id?: string
          location?: string | null
          photos?: string[] | null
          preferred_date?: string | null
          preferred_time?: string | null
          priority?: string | null
          request_number: string
          requester_id: string
          started_at?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_cost?: number | null
          assigned_at?: string | null
          assigned_to?: string | null
          attachments?: string[] | null
          category_id?: string
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string | null
          description?: string
          district_id?: string | null
          estimated_cost?: number | null
          id?: string
          location?: string | null
          photos?: string[] | null
          preferred_date?: string | null
          preferred_time?: string | null
          priority?: string | null
          request_number?: string
          requester_id?: string
          started_at?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_wishlists: {
        Row: {
          created_at: string | null
          id: string
          owner_id: string | null
          permission_level: string | null
          shared_with: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          owner_id?: string | null
          permission_level?: string | null
          shared_with?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          owner_id?: string | null
          permission_level?: string | null
          shared_with?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_wishlists_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_wishlists_shared_with_fkey"
            columns: ["shared_with"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_methods: {
        Row: {
          base_rate: number
          created_at: string | null
          description: string | null
          district_id: string | null
          estimated_days_max: number | null
          estimated_days_min: number | null
          free_shipping_threshold: number | null
          id: string
          is_active: boolean | null
          name: string
          per_kg_rate: number | null
        }
        Insert: {
          base_rate: number
          created_at?: string | null
          description?: string | null
          district_id?: string | null
          estimated_days_max?: number | null
          estimated_days_min?: number | null
          free_shipping_threshold?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          per_kg_rate?: number | null
        }
        Update: {
          base_rate?: number
          created_at?: string | null
          description?: string | null
          district_id?: string | null
          estimated_days_max?: number | null
          estimated_days_min?: number | null
          free_shipping_threshold?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          per_kg_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shipping_methods_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_rates: {
        Row: {
          created_at: string | null
          free_threshold: number | null
          id: string
          rate: number
          shipping_method_id: string | null
          shipping_zone_id: string | null
        }
        Insert: {
          created_at?: string | null
          free_threshold?: number | null
          id?: string
          rate: number
          shipping_method_id?: string | null
          shipping_zone_id?: string | null
        }
        Update: {
          created_at?: string | null
          free_threshold?: number | null
          id?: string
          rate?: number
          shipping_method_id?: string | null
          shipping_zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipping_rates_shipping_method_id_fkey"
            columns: ["shipping_method_id"]
            isOneToOne: false
            referencedRelation: "shipping_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipping_rates_shipping_zone_id_fkey"
            columns: ["shipping_zone_id"]
            isOneToOne: false
            referencedRelation: "shipping_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_zones: {
        Row: {
          created_at: string | null
          districts: Json | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          districts?: Json | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          districts?: Json | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      shopping_cart: {
        Row: {
          added_at: string
          id: string
          item_id: string
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          item_id: string
          quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          added_at?: string
          id?: string
          item_id?: string
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_cart_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "marketplace_items"
            referencedColumns: ["id"]
          },
        ]
      }
      sla_configurations: {
        Row: {
          auto_escalation_enabled: boolean | null
          category: string | null
          created_at: string | null
          id: string
          level_0_timeout_hours: number | null
          level_1_timeout_hours: number | null
          level_2_timeout_hours: number | null
          module_name: string
          priority: string
          updated_at: string | null
        }
        Insert: {
          auto_escalation_enabled?: boolean | null
          category?: string | null
          created_at?: string | null
          id?: string
          level_0_timeout_hours?: number | null
          level_1_timeout_hours?: number | null
          level_2_timeout_hours?: number | null
          module_name: string
          priority: string
          updated_at?: string | null
        }
        Update: {
          auto_escalation_enabled?: boolean | null
          category?: string | null
          created_at?: string | null
          id?: string
          level_0_timeout_hours?: number | null
          level_1_timeout_hours?: number | null
          level_2_timeout_hours?: number | null
          module_name?: string
          priority?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      staff: {
        Row: {
          address: string | null
          certifications: string[] | null
          created_at: string | null
          department: string
          district_id: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          employee_id: string
          employment_type: string | null
          full_name: string
          hire_date: string
          id: string
          is_active: boolean | null
          phone: string
          position: string
          salary: number | null
          shift_schedule: Json | null
          skills: string[] | null
          supervisor_id: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          certifications?: string[] | null
          created_at?: string | null
          department: string
          district_id?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employee_id: string
          employment_type?: string | null
          full_name: string
          hire_date: string
          id?: string
          is_active?: boolean | null
          phone: string
          position: string
          salary?: number | null
          shift_schedule?: Json | null
          skills?: string[] | null
          supervisor_id?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          certifications?: string[] | null
          created_at?: string | null
          department?: string
          district_id?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employee_id?: string
          employment_type?: string | null
          full_name?: string
          hire_date?: string
          id?: string
          is_active?: boolean | null
          phone?: string
          position?: string
          salary?: number | null
          shift_schedule?: Json | null
          skills?: string[] | null
          supervisor_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      status_types: {
        Row: {
          category: string
          code: string
          color_class: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_final: boolean | null
          name: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          category: string
          code: string
          color_class?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_final?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          category?: string
          code?: string
          color_class?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_final?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      system_configurations: {
        Row: {
          config_key: string
          config_value: Json
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          config_key: string
          config_value: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      system_metrics: {
        Row: {
          category: string
          created_at: string | null
          district_id: string | null
          id: string
          measurement_date: string | null
          measurement_time: string | null
          metadata: Json | null
          metric_name: string
          metric_type: string
          metric_value: number | null
          subcategory: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          district_id?: string | null
          id?: string
          measurement_date?: string | null
          measurement_time?: string | null
          metadata?: Json | null
          metric_name: string
          metric_type: string
          metric_value?: number | null
          subcategory?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          district_id?: string | null
          id?: string
          measurement_date?: string | null
          measurement_time?: string | null
          metadata?: Json | null
          metric_name?: string
          metric_type?: string
          metric_value?: number | null
          subcategory?: string | null
        }
        Relationships: []
      }
      system_modules: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          display_name: string
          icon_name: string | null
          id: string
          is_active: boolean | null
          module_name: string
          route_path: string | null
          sort_order: number | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          description?: string | null
          display_name: string
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          module_name: string
          route_path?: string | null
          sort_order?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          display_name?: string
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          module_name?: string
          route_path?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          is_editable: boolean | null
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_editable?: boolean | null
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_editable?: boolean | null
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      transaction_types: {
        Row: {
          category: string | null
          code: string
          color_class: string | null
          created_at: string
          description: string | null
          icon_name: string | null
          id: string
          is_active: boolean
          name: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          code: string
          color_class?: string | null
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          code?: string
          color_class?: string | null
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      typing_indicators: {
        Row: {
          id: string
          room_id: string
          started_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          room_id: string
          started_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          room_id?: string
          started_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "typing_indicators_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      unit_coordinate_backups: {
        Row: {
          backup_reason: string
          created_at: string
          created_by: string | null
          floor_plan_id: string
          id: string
          unit_data: Json
        }
        Insert: {
          backup_reason?: string
          created_at?: string
          created_by?: string | null
          floor_plan_id: string
          id?: string
          unit_data: Json
        }
        Update: {
          backup_reason?: string
          created_at?: string
          created_by?: string | null
          floor_plan_id?: string
          id?: string
          unit_data?: Json
        }
        Relationships: []
      }
      units: {
        Row: {
          address: string | null
          community_id: string | null
          coordinates_x: number
          coordinates_y: number
          created_at: string
          created_by: string | null
          district_id: string | null
          email: string | null
          floor_plan_id: string | null
          height: number | null
          id: string
          notes: string | null
          occupancy_status: string | null
          owner_name: string
          phone_number: string | null
          unit_number: string
          unit_type: string
          updated_at: string
          width: number | null
        }
        Insert: {
          address?: string | null
          community_id?: string | null
          coordinates_x: number
          coordinates_y: number
          created_at?: string
          created_by?: string | null
          district_id?: string | null
          email?: string | null
          floor_plan_id?: string | null
          height?: number | null
          id?: string
          notes?: string | null
          occupancy_status?: string | null
          owner_name: string
          phone_number?: string | null
          unit_number: string
          unit_type?: string
          updated_at?: string
          width?: number | null
        }
        Update: {
          address?: string | null
          community_id?: string | null
          coordinates_x?: number
          coordinates_y?: number
          created_at?: string
          created_by?: string | null
          district_id?: string | null
          email?: string | null
          floor_plan_id?: string | null
          height?: number | null
          id?: string
          notes?: string | null
          occupancy_status?: string | null
          owner_name?: string
          phone_number?: string | null
          unit_number?: string
          unit_type?: string
          updated_at?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "units_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_floor_plan_id_fkey"
            columns: ["floor_plan_id"]
            isOneToOne: false
            referencedRelation: "floor_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      units_of_measure: {
        Row: {
          abbreviation: string | null
          category: string | null
          code: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          abbreviation?: string | null
          category?: string | null
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          abbreviation?: string | null
          category?: string | null
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      user_marketplace_analytics: {
        Row: {
          amount_spent: number | null
          created_at: string | null
          date: string
          id: string
          items_favorited: number | null
          items_purchased: number | null
          items_viewed: number | null
          session_duration: number | null
          user_id: string | null
        }
        Insert: {
          amount_spent?: number | null
          created_at?: string | null
          date: string
          id?: string
          items_favorited?: number | null
          items_purchased?: number | null
          items_viewed?: number | null
          session_duration?: number | null
          user_id?: string | null
        }
        Update: {
          amount_spent?: number | null
          created_at?: string | null
          date?: string
          id?: string
          items_favorited?: number | null
          items_purchased?: number | null
          items_viewed?: number | null
          session_duration?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_marketplace_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_presence: {
        Row: {
          current_room_id: string | null
          last_seen: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          current_room_id?: string | null
          last_seen?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          current_room_id?: string | null
          last_seen?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_presence_current_room_id_fkey"
            columns: ["current_room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          community_id: string | null
          created_at: string | null
          district_id: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          community_id?: string | null
          created_at?: string | null
          district_id?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          community_id?: string | null
          created_at?: string | null
          district_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_services: {
        Row: {
          availability: string | null
          category: string
          contact_method: string
          created_at: string
          description: string | null
          email: string | null
          id: string
          is_active: boolean
          location: string | null
          phone_number: string | null
          price_range: string | null
          service_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          availability?: string | null
          category: string
          contact_method?: string
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          phone_number?: string | null
          price_range?: string | null
          service_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          availability?: string | null
          category?: string
          contact_method?: string
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          phone_number?: string | null
          price_range?: string | null
          service_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      utility_readings: {
        Row: {
          consumption: number | null
          cost_per_unit: number | null
          created_at: string
          district_id: string | null
          id: string
          is_estimated: boolean
          meter_id: string
          previous_reading: number | null
          reading_date: string
          reading_value: number
          total_cost: number | null
          unit: string
          user_id: string | null
          utility_type: string
        }
        Insert: {
          consumption?: number | null
          cost_per_unit?: number | null
          created_at?: string
          district_id?: string | null
          id?: string
          is_estimated?: boolean
          meter_id: string
          previous_reading?: number | null
          reading_date?: string
          reading_value: number
          total_cost?: number | null
          unit?: string
          user_id?: string | null
          utility_type: string
        }
        Update: {
          consumption?: number | null
          cost_per_unit?: number | null
          created_at?: string
          district_id?: string | null
          id?: string
          is_estimated?: boolean
          meter_id?: string
          previous_reading?: number | null
          reading_date?: string
          reading_value?: number
          total_cost?: number | null
          unit?: string
          user_id?: string | null
          utility_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "utility_readings_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "utility_readings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      video_calls: {
        Row: {
          call_type: string
          created_at: string | null
          duration_minutes: number | null
          ended_at: string | null
          id: string
          initiated_by: string
          participants: Json | null
          room_id: string
          started_at: string | null
          status: string
        }
        Insert: {
          call_type?: string
          created_at?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          initiated_by: string
          participants?: Json | null
          room_id: string
          started_at?: string | null
          status?: string
        }
        Update: {
          call_type?: string
          created_at?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          initiated_by?: string
          participants?: Json | null
          room_id?: string
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_calls_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      visitor_access_logs: {
        Row: {
          access_type: string
          created_at: string | null
          gate_location: string | null
          id: string
          notes: string | null
          photos: Json | null
          qr_data: Json | null
          scan_timestamp: string | null
          scanned_by: string | null
          visitor_id: string
        }
        Insert: {
          access_type: string
          created_at?: string | null
          gate_location?: string | null
          id?: string
          notes?: string | null
          photos?: Json | null
          qr_data?: Json | null
          scan_timestamp?: string | null
          scanned_by?: string | null
          visitor_id: string
        }
        Update: {
          access_type?: string
          created_at?: string | null
          gate_location?: string | null
          id?: string
          notes?: string | null
          photos?: Json | null
          qr_data?: Json | null
          scan_timestamp?: string | null
          scanned_by?: string | null
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visitor_access_logs_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "visitors"
            referencedColumns: ["id"]
          },
        ]
      }
      visitor_approvals: {
        Row: {
          approval_reason: string | null
          approval_status: string
          approved_at: string | null
          approver_id: string
          created_at: string | null
          id: string
          updated_at: string | null
          visitor_id: string
        }
        Insert: {
          approval_reason?: string | null
          approval_status?: string
          approved_at?: string | null
          approver_id: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          visitor_id: string
        }
        Update: {
          approval_reason?: string | null
          approval_status?: string
          approved_at?: string | null
          approver_id?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visitor_approvals_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "visitors"
            referencedColumns: ["id"]
          },
        ]
      }
      visitor_blacklist: {
        Row: {
          added_by: string | null
          created_at: string
          district_id: string | null
          ic_number: string | null
          id: string
          is_active: boolean | null
          phone_number: string | null
          reason: string
        }
        Insert: {
          added_by?: string | null
          created_at?: string
          district_id?: string | null
          ic_number?: string | null
          id?: string
          is_active?: boolean | null
          phone_number?: string | null
          reason: string
        }
        Update: {
          added_by?: string | null
          created_at?: string
          district_id?: string | null
          ic_number?: string | null
          id?: string
          is_active?: boolean | null
          phone_number?: string | null
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "visitor_blacklist_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      visitor_entries: {
        Row: {
          approved_by: string | null
          created_at: string | null
          district_id: string | null
          entry_point: string | null
          entry_time: string | null
          exit_time: string | null
          id: string
          purpose_of_visit: string | null
          security_officer_id: string | null
          vehicle_plate: string | null
          visitor_id: string | null
        }
        Insert: {
          approved_by?: string | null
          created_at?: string | null
          district_id?: string | null
          entry_point?: string | null
          entry_time?: string | null
          exit_time?: string | null
          id?: string
          purpose_of_visit?: string | null
          security_officer_id?: string | null
          vehicle_plate?: string | null
          visitor_id?: string | null
        }
        Update: {
          approved_by?: string | null
          created_at?: string | null
          district_id?: string | null
          entry_point?: string | null
          entry_time?: string | null
          exit_time?: string | null
          id?: string
          purpose_of_visit?: string | null
          security_officer_id?: string | null
          vehicle_plate?: string | null
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visitor_entries_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitor_entries_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "visitors"
            referencedColumns: ["id"]
          },
        ]
      }
      visitor_logs: {
        Row: {
          action: string
          id: string
          location: string | null
          notes: string | null
          performed_by: string | null
          timestamp: string
          visitor_id: string | null
        }
        Insert: {
          action: string
          id?: string
          location?: string | null
          notes?: string | null
          performed_by?: string | null
          timestamp?: string
          visitor_id?: string | null
        }
        Update: {
          action?: string
          id?: string
          location?: string | null
          notes?: string | null
          performed_by?: string | null
          timestamp?: string
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visitor_logs_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "visitors"
            referencedColumns: ["id"]
          },
        ]
      }
      visitor_notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          notification_type: string
          read_at: string | null
          recipient_id: string
          sent_at: string | null
          title: string
          visitor_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          notification_type: string
          read_at?: string | null
          recipient_id: string
          sent_at?: string | null
          title: string
          visitor_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          notification_type?: string
          read_at?: string | null
          recipient_id?: string
          sent_at?: string | null
          title?: string
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visitor_notifications_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "visitors"
            referencedColumns: ["id"]
          },
        ]
      }
      visitor_photos: {
        Row: {
          created_at: string | null
          id: string
          photo_type: string
          photo_url: string
          uploaded_at: string | null
          uploaded_by: string
          visitor_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          photo_type?: string
          photo_url: string
          uploaded_at?: string | null
          uploaded_by: string
          visitor_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          photo_type?: string
          photo_url?: string
          uploaded_at?: string | null
          uploaded_by?: string
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visitor_photos_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "visitors"
            referencedColumns: ["id"]
          },
        ]
      }
      visitor_registrations: {
        Row: {
          actual_checkin: string | null
          actual_checkout: string | null
          approval_status: string
          approved_at: string | null
          approved_by: string | null
          community_id: string | null
          created_at: string
          district_id: string | null
          host_id: string
          host_unit: string
          id: string
          rejection_reason: string | null
          security_notes: string | null
          updated_at: string
          visit_date: string
          visit_purpose: string | null
          visit_time_from: string
          visit_time_to: string
          visitor_ic: string | null
          visitor_name: string
          visitor_phone: string | null
          visitor_vehicle: string | null
        }
        Insert: {
          actual_checkin?: string | null
          actual_checkout?: string | null
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          community_id?: string | null
          created_at?: string
          district_id?: string | null
          host_id: string
          host_unit: string
          id?: string
          rejection_reason?: string | null
          security_notes?: string | null
          updated_at?: string
          visit_date: string
          visit_purpose?: string | null
          visit_time_from: string
          visit_time_to: string
          visitor_ic?: string | null
          visitor_name: string
          visitor_phone?: string | null
          visitor_vehicle?: string | null
        }
        Update: {
          actual_checkin?: string | null
          actual_checkout?: string | null
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          community_id?: string | null
          created_at?: string
          district_id?: string | null
          host_id?: string
          host_unit?: string
          id?: string
          rejection_reason?: string | null
          security_notes?: string | null
          updated_at?: string
          visit_date?: string
          visit_purpose?: string | null
          visit_time_from?: string
          visit_time_to?: string
          visitor_ic?: string | null
          visitor_name?: string
          visitor_phone?: string | null
          visitor_vehicle?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visitor_registrations_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitor_registrations_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitor_registrations_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitor_registrations_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      visitors: {
        Row: {
          approval_required: boolean | null
          approved_by: string | null
          auto_approve: boolean | null
          check_in_time: string | null
          check_out_time: string | null
          company_name: string | null
          created_at: string | null
          emergency_contact: string | null
          expected_duration_hours: number | null
          host_id: string | null
          id: string
          notes: string | null
          purpose: string | null
          qr_code_data: Json | null
          security_clearance: string | null
          status: Database["public"]["Enums"]["visitor_status"] | null
          updated_at: string | null
          vehicle_plate: string | null
          visit_date: string
          visit_time: string | null
          visitor_ic: string | null
          visitor_name: string
          visitor_phone: string | null
          visitor_type: string | null
        }
        Insert: {
          approval_required?: boolean | null
          approved_by?: string | null
          auto_approve?: boolean | null
          check_in_time?: string | null
          check_out_time?: string | null
          company_name?: string | null
          created_at?: string | null
          emergency_contact?: string | null
          expected_duration_hours?: number | null
          host_id?: string | null
          id?: string
          notes?: string | null
          purpose?: string | null
          qr_code_data?: Json | null
          security_clearance?: string | null
          status?: Database["public"]["Enums"]["visitor_status"] | null
          updated_at?: string | null
          vehicle_plate?: string | null
          visit_date: string
          visit_time?: string | null
          visitor_ic?: string | null
          visitor_name: string
          visitor_phone?: string | null
          visitor_type?: string | null
        }
        Update: {
          approval_required?: boolean | null
          approved_by?: string | null
          auto_approve?: boolean | null
          check_in_time?: string | null
          check_out_time?: string | null
          company_name?: string | null
          created_at?: string | null
          emergency_contact?: string | null
          expected_duration_hours?: number | null
          host_id?: string | null
          id?: string
          notes?: string | null
          purpose?: string | null
          qr_code_data?: Json | null
          security_clearance?: string | null
          status?: Database["public"]["Enums"]["visitor_status"] | null
          updated_at?: string | null
          vehicle_plate?: string | null
          visit_date?: string
          visit_time?: string | null
          visitor_ic?: string | null
          visitor_name?: string
          visitor_phone?: string | null
          visitor_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visitors_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitors_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_messages: {
        Row: {
          audio_url: string
          created_at: string | null
          duration_seconds: number
          id: string
          is_deleted: boolean | null
          room_id: string
          sender_id: string
          transcript: string | null
        }
        Insert: {
          audio_url: string
          created_at?: string | null
          duration_seconds: number
          id?: string
          is_deleted?: boolean | null
          room_id: string
          sender_id: string
          transcript?: string | null
        }
        Update: {
          audio_url?: string
          created_at?: string | null
          duration_seconds?: number
          id?: string
          is_deleted?: boolean | null
          room_id?: string
          sender_id?: string
          transcript?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist_items: {
        Row: {
          added_at: string
          id: string
          product_id: string
          wishlist_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          product_id: string
          wishlist_id: string
        }
        Update: {
          added_at?: string
          id?: string
          product_id?: string
          wishlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_wishlist_items_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "marketplace_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_wishlist_items_wishlist"
            columns: ["wishlist_id"]
            isOneToOne: false
            referencedRelation: "wishlists"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_public: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_public?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      work_order_activities: {
        Row: {
          activity_type: string
          created_at: string
          description: string
          id: string
          metadata: Json | null
          performed_by: string
          work_order_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          performed_by: string
          work_order_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          performed_by?: string
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_order_activities_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_order_activities_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      work_order_escalations: {
        Row: {
          created_at: string
          escalated_by: string
          escalated_to: string | null
          escalation_reason: string
          from_department: string
          id: string
          notes: string | null
          responded_at: string | null
          status: string | null
          to_department: string
          work_order_id: string
        }
        Insert: {
          created_at?: string
          escalated_by: string
          escalated_to?: string | null
          escalation_reason: string
          from_department: string
          id?: string
          notes?: string | null
          responded_at?: string | null
          status?: string | null
          to_department: string
          work_order_id: string
        }
        Update: {
          created_at?: string
          escalated_by?: string
          escalated_to?: string | null
          escalation_reason?: string
          from_department?: string
          id?: string
          notes?: string | null
          responded_at?: string | null
          status?: string | null
          to_department?: string
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_order_escalations_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      work_orders: {
        Row: {
          actual_cost: number | null
          actual_hours: number | null
          assigned_to: string | null
          complaint_id: string | null
          completed_at: string | null
          completion_notes: string | null
          created_at: string
          created_by: string
          description: string
          district_id: string | null
          estimated_cost: number | null
          estimated_hours: number | null
          id: string
          location: string
          materials_needed: string[] | null
          notes: string | null
          photos: string[] | null
          priority: Database["public"]["Enums"]["work_order_priority"]
          scheduled_date: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["work_order_status"]
          title: string
          updated_at: string
          work_order_type: Database["public"]["Enums"]["work_order_type"]
        }
        Insert: {
          actual_cost?: number | null
          actual_hours?: number | null
          assigned_to?: string | null
          complaint_id?: string | null
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string
          created_by: string
          description: string
          district_id?: string | null
          estimated_cost?: number | null
          estimated_hours?: number | null
          id?: string
          location: string
          materials_needed?: string[] | null
          notes?: string | null
          photos?: string[] | null
          priority?: Database["public"]["Enums"]["work_order_priority"]
          scheduled_date?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["work_order_status"]
          title: string
          updated_at?: string
          work_order_type?: Database["public"]["Enums"]["work_order_type"]
        }
        Update: {
          actual_cost?: number | null
          actual_hours?: number | null
          assigned_to?: string | null
          complaint_id?: string | null
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string
          created_by?: string
          description?: string
          district_id?: string | null
          estimated_cost?: number | null
          estimated_hours?: number | null
          id?: string
          location?: string
          materials_needed?: string[] | null
          notes?: string | null
          photos?: string[] | null
          priority?: Database["public"]["Enums"]["work_order_priority"]
          scheduled_date?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["work_order_status"]
          title?: string
          updated_at?: string
          work_order_type?: Database["public"]["Enums"]["work_order_type"]
        }
        Relationships: [
          {
            foreignKeyName: "work_orders_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_states: {
        Row: {
          assigned_role:
            | Database["public"]["Enums"]["enhanced_user_role"]
            | null
          assigned_to: string | null
          created_at: string | null
          current_level: number | null
          escalation_count: number | null
          id: string
          is_overdue: boolean | null
          last_escalated_at: string | null
          reference_id: string
          reference_table: string
          sla_due_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          assigned_role?:
            | Database["public"]["Enums"]["enhanced_user_role"]
            | null
          assigned_to?: string | null
          created_at?: string | null
          current_level?: number | null
          escalation_count?: number | null
          id?: string
          is_overdue?: boolean | null
          last_escalated_at?: string | null
          reference_id: string
          reference_table: string
          sla_due_at?: string | null
          status: string
          updated_at?: string | null
        }
        Update: {
          assigned_role?:
            | Database["public"]["Enums"]["enhanced_user_role"]
            | null
          assigned_to?: string | null
          created_at?: string | null
          current_level?: number | null
          escalation_count?: number | null
          id?: string
          is_overdue?: boolean | null
          last_escalated_at?: string | null
          reference_id?: string
          reference_table?: string
          sla_due_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auto_escalate_complaints: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_typing_indicators: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_direct_chat: {
        Args: { other_user_id: string }
        Returns: string
      }
      create_service_provider_application_on_signup: {
        Args: {
          p_applicant_id: string
          p_business_address: string
          p_business_name: string
          p_business_type: string
          p_contact_email: string
          p_contact_person: string
          p_contact_phone: string
          p_district_id: string
          p_experience_years?: number
        }
        Returns: string
      }
      create_work_order_from_complaint: {
        Args: {
          p_assigned_to?: string
          p_complaint_id: string
          p_description: string
          p_location?: string
          p_priority?: Database["public"]["Enums"]["work_order_priority"]
          p_title: string
          p_work_order_type?: Database["public"]["Enums"]["work_order_type"]
        }
        Returns: string
      }
      escalate_workflow: {
        Args: {
          p_reason?: string
          p_reference_id: string
          p_reference_table: string
        }
        Returns: boolean
      }
      get_announcement_content: {
        Args: {
          p_content_en: string
          p_content_fallback: string
          p_content_ms: string
          p_language?: string
        }
        Returns: string
      }
      get_announcement_title: {
        Args: {
          p_language?: string
          p_title_en: string
          p_title_fallback: string
          p_title_ms: string
        }
        Returns: string
      }
      get_approval_requirements: {
        Args: {
          current_user_role: Database["public"]["Enums"]["user_role"]
          requested_user_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: Database["public"]["Enums"]["approval_requirement"][]
      }
      get_complaint_recipients: {
        Args: {
          p_category: string
          p_district_id: string
          p_escalation_level?: number
        }
        Returns: {
          priority_order: number
          role: Database["public"]["Enums"]["enhanced_user_role"]
          user_id: string
        }[]
      }
      get_current_user_role_safe: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_enabled_modules_for_user: {
        Args: Record<PropertyKey, never>
        Returns: {
          category: string
          display_name: string
          module_name: string
        }[]
      }
      get_enabled_modules_for_user_by_role: {
        Args: Record<PropertyKey, never>
        Returns: {
          category: string
          display_name: string
          module_name: string
        }[]
      }
      get_image_url: {
        Args: { bucket_name: string; file_path: string }
        Returns: string
      }
      get_module_id: {
        Args: { module_name: string }
        Returns: string
      }
      get_pending_role_requests_for_approver: {
        Args: { approver_user_id: string }
        Returns: {
          created_at: string
          district_name: string
          justification: string
          reason: string
          request_id: string
          requester_email: string
          requester_name: string
          requirements: Database["public"]["Enums"]["approval_requirement"][]
          user_current_role: Database["public"]["Enums"]["user_role"]
          user_requested_role: Database["public"]["Enums"]["user_role"]
        }[]
      }
      get_primary_account_id: {
        Args: { check_user_id?: string }
        Returns: string
      }
      get_required_approver_role: {
        Args: {
          current_user_role: Database["public"]["Enums"]["user_role"]
          requested_user_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_sla_timeout: {
        Args: {
          p_category: string
          p_level?: number
          p_module_name: string
          p_priority: string
        }
        Returns: number
      }
      get_user_community: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_district: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_highest_role: {
        Args: { check_user_id?: string }
        Returns: Database["public"]["Enums"]["enhanced_user_role"]
      }
      get_user_profile_with_privacy: {
        Args: { target_user_id: string; viewer_id?: string }
        Returns: {
          avatar_url: string
          can_invite: boolean
          can_message: boolean
          email: string
          full_name: string
          id: string
          interests: string[]
          phone: string
          profile_bio: string
          skills: string[]
        }[]
      }
      get_user_role: {
        Args: { district_id?: string; user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_user_role_info: {
        Args: { check_user_id?: string }
        Returns: {
          color_code: string
          description: string
          display_name: string
          level: number
          permission_level: Database["public"]["Enums"]["permission_level"]
          role: Database["public"]["Enums"]["enhanced_user_role"]
        }[]
      }
      get_user_role_level: {
        Args: { check_user_id?: string }
        Returns: number
      }
      has_enhanced_role: {
        Args: {
          check_role: Database["public"]["Enums"]["enhanced_user_role"]
          check_user_id?: string
        }
        Returns: boolean
      }
      has_household_permission: {
        Args: { check_user_id?: string; permission_name: string }
        Returns: boolean
      }
      has_module_permission: {
        Args: {
          check_user_id?: string
          module_name: string
          permission_type: string
        }
        Returns: boolean
      }
      has_role: {
        Args:
          | { _role: Database["public"]["Enums"]["app_role"]; _user_id: string }
          | { check_role: Database["public"]["Enums"]["app_role"] }
          | { check_role: Database["public"]["Enums"]["user_role"] }
        Returns: boolean
      }
      has_role_compat: {
        Args: { check_role: Database["public"]["Enums"]["user_role"] }
        Returns: boolean
      }
      has_role_level_or_higher: {
        Args: { check_user_id?: string; min_level: number }
        Returns: boolean
      }
      is_module_enabled_for_community: {
        Args: { community_id?: string; module_name: string }
        Returns: boolean
      }
      is_module_enabled_for_district: {
        Args: { district_id?: string; module_name: string }
        Returns: boolean
      }
      is_user_account_approved: {
        Args: { user_id?: string }
        Returns: boolean
      }
      manage_workflow_state: {
        Args: {
          p_assigned_role?: Database["public"]["Enums"]["enhanced_user_role"]
          p_assigned_to?: string
          p_category?: string
          p_priority?: string
          p_reference_id: string
          p_reference_table: string
          p_status: string
        }
        Returns: string
      }
      mark_complaint_notification_read: {
        Args: { notification_id: string }
        Returns: boolean
      }
      process_workflow_escalations: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      recalculate_community_unit_counts: {
        Args: { community_uuid: string }
        Returns: undefined
      }
      service_provider_serves_area: {
        Args: { area_id: string; provider_id: string }
        Returns: boolean
      }
      setup_service_provider: {
        Args: {
          p_business_name: string
          p_business_type?: string
          p_service_areas?: string[]
        }
        Returns: string
      }
      update_user_presence: {
        Args: { p_room_id?: string; p_status: string; p_user_id: string }
        Returns: undefined
      }
      user_is_room_admin: {
        Args: { check_room_id: string; check_user_id?: string }
        Returns: boolean
      }
      user_is_room_member: {
        Args: { check_room_id: string; check_user_id?: string }
        Returns: boolean
      }
    }
    Enums: {
      announcement_type:
        | "general"
        | "maintenance"
        | "security"
        | "event"
        | "emergency"
      app_role:
        | "state_admin"
        | "district_coordinator"
        | "community_admin"
        | "facility_manager"
        | "security_officer"
        | "maintenance_staff"
        | "resident"
        | "service_provider"
        | "community_leader"
        | "state_service_manager"
      approval_requirement:
        | "community_voting"
        | "business_verification"
        | "interview_process"
        | "background_check"
        | "performance_evaluation"
        | "multi_level_approval"
      booking_status: "pending" | "confirmed" | "cancelled" | "completed"
      complaint_priority: "low" | "medium" | "high" | "urgent"
      complaint_status: "pending" | "in_progress" | "resolved" | "closed"
      enhanced_user_role:
        | "state_admin"
        | "district_coordinator"
        | "community_admin"
        | "facility_manager"
        | "security_officer"
        | "maintenance_staff"
        | "service_provider"
        | "community_leader"
        | "state_service_manager"
        | "resident"
        | "spouse"
        | "tenant"
      marketplace_condition: "new" | "excellent" | "good" | "fair" | "poor"
      permission_level: "full_access" | "standard_access" | "limited_access"
      role_request_status:
        | "pending"
        | "under_review"
        | "approved"
        | "rejected"
        | "on_probation"
        | "active"
        | "expired"
      user_role:
        | "admin"
        | "security"
        | "manager"
        | "resident"
        | "state_admin"
        | "district_coordinator"
        | "community_admin"
        | "facility_manager"
        | "maintenance_staff"
        | "service_provider"
        | "community_leader"
        | "state_service_manager"
      visitor_status:
        | "pending"
        | "approved"
        | "denied"
        | "checked_in"
        | "checked_out"
      work_order_priority: "low" | "medium" | "high" | "urgent"
      work_order_status:
        | "pending"
        | "assigned"
        | "in_progress"
        | "completed"
        | "cancelled"
      work_order_type:
        | "maintenance"
        | "repair"
        | "inspection"
        | "emergency"
        | "general"
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
      announcement_type: [
        "general",
        "maintenance",
        "security",
        "event",
        "emergency",
      ],
      app_role: [
        "state_admin",
        "district_coordinator",
        "community_admin",
        "facility_manager",
        "security_officer",
        "maintenance_staff",
        "resident",
        "service_provider",
        "community_leader",
        "state_service_manager",
      ],
      approval_requirement: [
        "community_voting",
        "business_verification",
        "interview_process",
        "background_check",
        "performance_evaluation",
        "multi_level_approval",
      ],
      booking_status: ["pending", "confirmed", "cancelled", "completed"],
      complaint_priority: ["low", "medium", "high", "urgent"],
      complaint_status: ["pending", "in_progress", "resolved", "closed"],
      enhanced_user_role: [
        "state_admin",
        "district_coordinator",
        "community_admin",
        "facility_manager",
        "security_officer",
        "maintenance_staff",
        "service_provider",
        "community_leader",
        "state_service_manager",
        "resident",
        "spouse",
        "tenant",
      ],
      marketplace_condition: ["new", "excellent", "good", "fair", "poor"],
      permission_level: ["full_access", "standard_access", "limited_access"],
      role_request_status: [
        "pending",
        "under_review",
        "approved",
        "rejected",
        "on_probation",
        "active",
        "expired",
      ],
      user_role: [
        "admin",
        "security",
        "manager",
        "resident",
        "state_admin",
        "district_coordinator",
        "community_admin",
        "facility_manager",
        "maintenance_staff",
        "service_provider",
        "community_leader",
        "state_service_manager",
      ],
      visitor_status: [
        "pending",
        "approved",
        "denied",
        "checked_in",
        "checked_out",
      ],
      work_order_priority: ["low", "medium", "high", "urgent"],
      work_order_status: [
        "pending",
        "assigned",
        "in_progress",
        "completed",
        "cancelled",
      ],
      work_order_type: [
        "maintenance",
        "repair",
        "inspection",
        "emergency",
        "general",
      ],
    },
  },
} as const
