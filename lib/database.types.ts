export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      api_tokens: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      challenges: {
        Row: {
          created_at: string
          description: string
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          estimated_time: number
          fts: unknown | null
          id: string
          initial_situation: string | null
          objective: string | null
          slug: string
          theme: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          estimated_time?: number
          fts?: unknown | null
          id?: string
          initial_situation?: string | null
          objective?: string | null
          slug: string
          theme: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          estimated_time?: number
          fts?: unknown | null
          id?: string
          initial_situation?: string | null
          objective?: string | null
          slug?: string
          theme?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenges_theme_fkey"
            columns: ["theme"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["slug"]
          },
        ]
      }
      email_category: {
        Row: {
          audienceId: string
          created_at: string
          description: string
          id: number
          name: string
        }
        Insert: {
          audienceId: string
          created_at?: string
          description: string
          id?: number
          name: string
        }
        Update: {
          audienceId?: string
          created_at?: string
          description?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      email_subscriptions: {
        Row: {
          category_id: number
          subscribed: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          category_id: number
          subscribed?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          category_id?: number
          subscribed?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_subscription_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "email_category"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
        }
        Relationships: []
      }
      themes: {
        Row: {
          description: string
          last_updated: string
          slug: string
          title: string
        }
        Insert: {
          description: string
          last_updated?: string
          slug: string
          title: string
        }
        Update: {
          description?: string
          last_updated?: string
          slug?: string
          title?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          challenge_id: string
          completed_at: string | null
          composite_key: string
          started_at: string | null
          status: Database["public"]["Enums"]["challenge_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          composite_key: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["challenge_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          composite_key?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["challenge_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenge_progress"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_submissions: {
        Row: {
          id: number
          payload: Json
          time: string
          user_progress: string
          validated: boolean
          working: boolean
        }
        Insert: {
          id?: number
          payload?: Json
          time?: string
          user_progress: string
          validated: boolean
          working: boolean
        }
        Update: {
          id?: number
          payload?: Json
          time?: string
          user_progress?: string
          validated?: boolean
          working?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "user_submissions_user_progress_fkey"
            columns: ["user_progress"]
            isOneToOne: false
            referencedRelation: "user_progress"
            referencedColumns: ["composite_key"]
          },
        ]
      }
    }
    Views: {
      challenge_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          description: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"] | null
          estimated_time: number | null
          fts: unknown | null
          id: string | null
          progress_updated_at: string | null
          slug: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["challenge_status"] | null
          theme: string | null
          title: string | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_api_token: {
        Args: { user_id: string; name: string }
        Returns: string
      }
      slugify: {
        Args: { text: string }
        Returns: string
      }
      tid: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      validate_token: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      challenge_status: "not_started" | "in_progress" | "completed"
      difficulty_level: "beginner" | "intermediate" | "advanced"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      challenge_status: ["not_started", "in_progress", "completed"],
      difficulty_level: ["beginner", "intermediate", "advanced"],
    },
  },
} as const
