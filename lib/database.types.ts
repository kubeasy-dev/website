export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      achievements: {
        Row: {
          description: string;
          id: string;
          logo_url: string;
          name: string;
        };
        Insert: {
          description: string;
          id?: string;
          logo_url: string;
          name: string;
        };
        Update: {
          description?: string;
          id?: string;
          logo_url?: string;
          name?: string;
        };
        Relationships: [];
      };
      api_token: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      challenges: {
        Row: {
          content: string;
          created_at: string | null;
          description: string;
          difficulty: Database["public"]["Enums"]["difficulty_level"];
          estimated_time: number;
          fts: unknown | null;
          id: string;
          slug: string | null;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          content: string;
          created_at?: string | null;
          description: string;
          difficulty: Database["public"]["Enums"]["difficulty_level"];
          estimated_time?: number;
          fts?: unknown | null;
          id?: string;
          slug?: string | null;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          content?: string;
          created_at?: string | null;
          description?: string;
          difficulty?: Database["public"]["Enums"]["difficulty_level"];
          estimated_time?: number;
          fts?: unknown | null;
          id?: string;
          slug?: string | null;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      user_achievements: {
        Row: {
          achievement_id: string;
          earned_at: string | null;
          user_id: string;
        };
        Insert: {
          achievement_id: string;
          earned_at?: string | null;
          user_id: string;
        };
        Update: {
          achievement_id?: string;
          earned_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey";
            columns: ["achievement_id"];
            isOneToOne: false;
            referencedRelation: "achievements";
            referencedColumns: ["id"];
          },
        ];
      };
      user_progress: {
        Row: {
          challenge_id: string;
          completed_at: string | null;
          started_at: string | null;
          status: Database["public"]["Enums"]["challenge_status"] | null;
          user_id: string;
        };
        Insert: {
          challenge_id: string;
          completed_at?: string | null;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["challenge_status"] | null;
          user_id: string;
        };
        Update: {
          challenge_id?: string;
          completed_at?: string | null;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["challenge_status"] | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_progress_challenge_id_fkey";
            columns: ["challenge_id"];
            isOneToOne: false;
            referencedRelation: "challenge_progress";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_progress_challenge_id_fkey";
            columns: ["challenge_id"];
            isOneToOne: false;
            referencedRelation: "challenges";
            referencedColumns: ["id"];
          },
        ];
      };
      user_stats: {
        Row: {
          challenges_terminated: number;
          exp: number;
          user_id: string;
        };
        Insert: {
          challenges_terminated?: number;
          exp?: number;
          user_id: string;
        };
        Update: {
          challenges_terminated?: number;
          exp?: number;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      challenge_progress: {
        Row: {
          completed_at: string | null;
          description: string | null;
          difficulty: Database["public"]["Enums"]["difficulty_level"] | null;
          estimated_time: number | null;
          fts: unknown | null;
          id: string | null;
          slug: string | null;
          started_at: string | null;
          status: Database["public"]["Enums"]["challenge_status"] | null;
          title: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      create_api_token: {
        Args: { user_id: string; name: string };
        Returns: string;
      };
      tid: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      validate_token: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
    };
    Enums: {
      challenge_status: "not_started" | "in_progress" | "completed";
      difficulty_level: "beginner" | "intermediate" | "advanced";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] & Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] & Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      challenge_status: ["not_started", "in_progress", "completed"],
      difficulty_level: ["beginner", "intermediate", "advanced"],
    },
  },
} as const;
