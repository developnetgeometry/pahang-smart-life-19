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
          location: string | null
          photos: string[] | null
          priority: Database["public"]["Enums"]["complaint_priority"] | null
          requested_by: string | null
          scheduled_date: string | null
          status: Database["public"]["Enums"]["complaint_status"] | null
          title: string
          updated_at: string | null
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
          location?: string | null
          photos?: string[] | null
          priority?: Database["public"]["Enums"]["complaint_priority"] | null
          requested_by?: string | null
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["complaint_status"] | null
          title: string
          updated_at?: string | null
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
          location?: string | null
          photos?: string[] | null
          priority?: Database["public"]["Enums"]["complaint_priority"] | null
          requested_by?: string | null
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["complaint_status"] | null
          title?: string
          updated_at?: string | null
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
          phone: string | null
          theme: string | null
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
          phone?: string | null
          theme?: string | null
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
          phone?: string | null
          theme?: string | null
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
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          district_id: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          district_id?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          district_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      get_user_district: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: { district_id?: string; user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_role: {
        Args: { check_role: Database["public"]["Enums"]["user_role"] }
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
      booking_status: "pending" | "confirmed" | "cancelled" | "completed"
      complaint_priority: "low" | "medium" | "high" | "urgent"
      complaint_status: "pending" | "in_progress" | "resolved" | "closed"
      marketplace_condition: "new" | "excellent" | "good" | "fair" | "poor"
      user_role: "admin" | "security" | "manager" | "resident"
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
      booking_status: ["pending", "confirmed", "cancelled", "completed"],
      complaint_priority: ["low", "medium", "high", "urgent"],
      complaint_status: ["pending", "in_progress", "resolved", "closed"],
      marketplace_condition: ["new", "excellent", "good", "fair", "poor"],
      user_role: ["admin", "security", "manager", "resident"],
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
