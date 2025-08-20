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
        ]
      }
      announcements: {
        Row: {
          author_id: string | null
          content: string
          created_at: string | null
          district_id: string | null
          expire_at: string | null
          id: string
          is_published: boolean | null
          is_urgent: boolean | null
          publish_at: string | null
          title: string
          type: Database["public"]["Enums"]["announcement_type"] | null
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string | null
          district_id?: string | null
          expire_at?: string | null
          id?: string
          is_published?: boolean | null
          is_urgent?: boolean | null
          publish_at?: string | null
          title: string
          type?: Database["public"]["Enums"]["announcement_type"] | null
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string | null
          district_id?: string | null
          expire_at?: string | null
          id?: string
          is_published?: boolean | null
          is_urgent?: boolean | null
          publish_at?: string | null
          title?: string
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
        ]
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
        ]
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
      complaints: {
        Row: {
          assigned_to: string | null
          category: string
          complainant_id: string | null
          created_at: string | null
          description: string
          district_id: string | null
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
          category: string
          complainant_id?: string | null
          created_at?: string | null
          description: string
          district_id?: string | null
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
          category?: string
          complainant_id?: string | null
          created_at?: string | null
          description?: string
          district_id?: string | null
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
          last_reply_at: string | null
          replies_count: number | null
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
          last_reply_at?: string | null
          replies_count?: number | null
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
          last_reply_at?: string | null
          replies_count?: number | null
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
        ]
      }
      districts: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          postal_code: string | null
          state: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          postal_code?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          postal_code?: string | null
          state?: string | null
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
      emergency_contacts: {
        Row: {
          address: string | null
          contact_type: string
          created_at: string | null
          district_id: string | null
          id: string
          is_24_hours: boolean | null
          name: string
          phone_number: string
          priority_level: number | null
          services: string[] | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact_type: string
          created_at?: string | null
          district_id?: string | null
          id?: string
          is_24_hours?: boolean | null
          name: string
          phone_number: string
          priority_level?: number | null
          services?: string[] | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact_type?: string
          created_at?: string | null
          district_id?: string | null
          id?: string
          is_24_hours?: boolean | null
          name?: string
          phone_number?: string
          priority_level?: number | null
          services?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
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
      incident_reports: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          description: string
          district_id: string | null
          documents: string[] | null
          follow_up_date: string | null
          follow_up_required: boolean | null
          id: string
          incident_date: string
          incident_time: string | null
          incident_type: string
          location: string
          photos: string[] | null
          reported_by: string | null
          resolution: string | null
          resolved_at: string | null
          severity: string | null
          status: string | null
          title: string
          updated_at: string | null
          witnesses: string[] | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          description: string
          district_id?: string | null
          documents?: string[] | null
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          incident_date: string
          incident_time?: string | null
          incident_type: string
          location: string
          photos?: string[] | null
          reported_by?: string | null
          resolution?: string | null
          resolved_at?: string | null
          severity?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          witnesses?: string[] | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          description?: string
          district_id?: string | null
          documents?: string[] | null
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          incident_date?: string
          incident_time?: string | null
          incident_type?: string
          location?: string
          photos?: string[] | null
          reported_by?: string | null
          resolution?: string | null
          resolved_at?: string | null
          severity?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          witnesses?: string[] | null
        }
        Relationships: []
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
      marketplace_items: {
        Row: {
          category: string
          condition: string | null
          created_at: string | null
          description: string | null
          district_id: string | null
          id: string
          images: string[] | null
          is_available: boolean | null
          location: string | null
          price: number
          seller_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          condition?: string | null
          created_at?: string | null
          description?: string | null
          district_id?: string | null
          id?: string
          images?: string[] | null
          is_available?: boolean | null
          location?: string | null
          price: number
          seller_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          condition?: string | null
          created_at?: string | null
          description?: string | null
          district_id?: string | null
          id?: string
          images?: string[] | null
          is_available?: boolean | null
          location?: string | null
          price?: number
          seller_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_items_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
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
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          district_id: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          language: string | null
          language_preference: string | null
          phone: string | null
          primary_role: Database["public"]["Enums"]["app_role"] | null
          theme: string | null
          theme_preference: string | null
          unit_number: string | null
          updated_at: string | null
          vehicle_plate_number: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          district_id?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean | null
          language?: string | null
          language_preference?: string | null
          phone?: string | null
          primary_role?: Database["public"]["Enums"]["app_role"] | null
          theme?: string | null
          theme_preference?: string | null
          unit_number?: string | null
          updated_at?: string | null
          vehicle_plate_number?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          district_id?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          language_preference?: string | null
          phone?: string | null
          primary_role?: Database["public"]["Enums"]["app_role"] | null
          theme?: string | null
          theme_preference?: string | null
          unit_number?: string | null
          updated_at?: string | null
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
      system_modules: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          is_active: boolean | null
          module_name: string
          route_path: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          module_name: string
          route_path?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          module_name?: string
          route_path?: string | null
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
      visitors: {
        Row: {
          approved_by: string | null
          check_in_time: string | null
          check_out_time: string | null
          created_at: string | null
          host_id: string | null
          id: string
          notes: string | null
          purpose: string | null
          status: Database["public"]["Enums"]["visitor_status"] | null
          updated_at: string | null
          vehicle_plate: string | null
          visit_date: string
          visit_time: string | null
          visitor_ic: string | null
          visitor_name: string
          visitor_phone: string | null
        }
        Insert: {
          approved_by?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string | null
          host_id?: string | null
          id?: string
          notes?: string | null
          purpose?: string | null
          status?: Database["public"]["Enums"]["visitor_status"] | null
          updated_at?: string | null
          vehicle_plate?: string | null
          visit_date: string
          visit_time?: string | null
          visitor_ic?: string | null
          visitor_name: string
          visitor_phone?: string | null
        }
        Update: {
          approved_by?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string | null
          host_id?: string | null
          id?: string
          notes?: string | null
          purpose?: string | null
          status?: Database["public"]["Enums"]["visitor_status"] | null
          updated_at?: string | null
          vehicle_plate?: string | null
          visit_date?: string
          visit_time?: string | null
          visitor_ic?: string | null
          visitor_name?: string
          visitor_phone?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_approval_requirements: {
        Args: {
          current_user_role: Database["public"]["Enums"]["user_role"]
          requested_user_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: Database["public"]["Enums"]["approval_requirement"][]
      }
      get_current_user_role_safe: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_module_id: {
        Args: { module_name: string }
        Returns: string
      }
      get_required_approver_role: {
        Args: {
          current_user_role: Database["public"]["Enums"]["user_role"]
          requested_user_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_user_district: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_highest_role: {
        Args: { check_user_id?: string }
        Returns: Database["public"]["Enums"]["enhanced_user_role"]
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
    },
  },
} as const
