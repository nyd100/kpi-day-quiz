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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      game_answers: {
        Row: {
          answer_id: string
          awarded_score: number
          id: string
          is_correct: boolean
          player_id: string
          question_id: number
          response_ms: number
          session_id: string
          submitted_at: string
        }
        Insert: {
          answer_id: string
          awarded_score?: number
          id?: string
          is_correct?: boolean
          player_id: string
          question_id: number
          response_ms?: number
          session_id: string
          submitted_at?: string
        }
        Update: {
          answer_id?: string
          awarded_score?: number
          id?: string
          is_correct?: boolean
          player_id?: string
          question_id?: number
          response_ms?: number
          session_id?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_answers_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "game_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      game_host_secrets: {
        Row: {
          created_at: string
          host_secret_hash: string
          session_id: string
        }
        Insert: {
          created_at?: string
          host_secret_hash: string
          session_id: string
        }
        Update: {
          created_at?: string
          host_secret_hash?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_host_secrets_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      game_player_secrets: {
        Row: {
          player_id: string
          player_secret_hash: string
        }
        Insert: {
          player_id: string
          player_secret_hash: string
        }
        Update: {
          player_id?: string
          player_secret_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_player_secrets_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: true
            referencedRelation: "game_players"
            referencedColumns: ["id"]
          },
        ]
      }
      game_players: {
        Row: {
          correct_count: number
          cumulative_response_ms: number
          display_name: string
          id: string
          is_virtual: boolean
          joined_at: string
          last_seen_at: string
          normalized_name: string
          session_id: string
          total_score: number
        }
        Insert: {
          correct_count?: number
          cumulative_response_ms?: number
          display_name: string
          id?: string
          is_virtual?: boolean
          joined_at?: string
          last_seen_at?: string
          normalized_name: string
          session_id: string
          total_score?: number
        }
        Update: {
          correct_count?: number
          cumulative_response_ms?: number
          display_name?: string
          id?: string
          is_virtual?: boolean
          joined_at?: string
          last_seen_at?: string
          normalized_name?: string
          session_id?: string
          total_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "game_players_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      game_session_question_keys: {
        Row: {
          correct_answer_id: string
          explanation: string | null
          position: number
          session_id: string
        }
        Insert: {
          correct_answer_id: string
          explanation?: string | null
          position: number
          session_id: string
        }
        Update: {
          correct_answer_id?: string
          explanation?: string | null
          position?: number
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_session_question_keys_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      game_session_questions: {
        Row: {
          answer_a: string
          answer_b: string
          answer_c: string
          answer_d: string
          category: string
          created_at: string
          duration_seconds: number
          executive_insight: string | null
          image_url: string | null
          pair_id: number | null
          position: number
          question_id: number | null
          scoring_mode: string
          session_id: string
          subtitle: string | null
          title: string
        }
        Insert: {
          answer_a: string
          answer_b: string
          answer_c: string
          answer_d: string
          category: string
          created_at?: string
          duration_seconds: number
          executive_insight?: string | null
          image_url?: string | null
          pair_id?: number | null
          position: number
          question_id?: number | null
          scoring_mode?: string
          session_id: string
          subtitle?: string | null
          title: string
        }
        Update: {
          answer_a?: string
          answer_b?: string
          answer_c?: string
          answer_d?: string
          category?: string
          created_at?: string
          duration_seconds?: number
          executive_insight?: string | null
          image_url?: string | null
          pair_id?: number | null
          position?: number
          question_id?: number | null
          scoring_mode?: string
          session_id?: string
          subtitle?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_session_questions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      game_sessions: {
        Row: {
          allow_late_join: boolean
          created_at: string
          current_question_index: number
          expires_at: string
          id: string
          phase: string
          pin: string
          question_ends_at: string | null
          question_started_at: string | null
          revealed_answer_id: string | null
          status: string
          title: string
          total_questions: number
          updated_at: string
        }
        Insert: {
          allow_late_join?: boolean
          created_at?: string
          current_question_index?: number
          expires_at?: string
          id?: string
          phase?: string
          pin: string
          question_ends_at?: string | null
          question_started_at?: string | null
          revealed_answer_id?: string | null
          status?: string
          title?: string
          total_questions?: number
          updated_at?: string
        }
        Update: {
          allow_late_join?: boolean
          created_at?: string
          current_question_index?: number
          expires_at?: string
          id?: string
          phase?: string
          pin?: string
          question_ends_at?: string | null
          question_started_at?: string | null
          revealed_answer_id?: string | null
          status?: string
          title?: string
          total_questions?: number
          updated_at?: string
        }
        Relationships: []
      }
      question_keys_private: {
        Row: {
          correct_answer_id: string
          explanation: string | null
          question_id: number
        }
        Insert: {
          correct_answer_id: string
          explanation?: string | null
          question_id: number
        }
        Update: {
          correct_answer_id?: string
          explanation?: string | null
          question_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "question_keys_private_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: true
            referencedRelation: "questions_public"
            referencedColumns: ["id"]
          },
        ]
      }
      questions_public: {
        Row: {
          answer_a: string
          answer_b: string
          answer_c: string
          answer_d: string
          category: string
          duration_seconds: number
          executive_insight: string | null
          id: number
          image_url: string | null
          is_enabled: boolean
          is_placeholder: boolean
          order_index: number
          pair_id: number | null
          scoring_mode: string
          subtitle: string | null
          title: string
        }
        Insert: {
          answer_a: string
          answer_b: string
          answer_c: string
          answer_d: string
          category: string
          duration_seconds: number
          executive_insight?: string | null
          id?: number
          image_url?: string | null
          is_enabled?: boolean
          is_placeholder?: boolean
          order_index?: number
          pair_id?: number | null
          scoring_mode?: string
          subtitle?: string | null
          title: string
        }
        Update: {
          answer_a?: string
          answer_b?: string
          answer_c?: string
          answer_d?: string
          category?: string
          duration_seconds?: number
          executive_insight?: string | null
          id?: number
          image_url?: string | null
          is_enabled?: boolean
          is_placeholder?: boolean
          order_index?: number
          pair_id?: number | null
          scoring_mode?: string
          subtitle?: string | null
          title?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      record_answer: {
        Args: {
          p_answer: string
          p_correct: boolean
          p_player: string
          p_question: number
          p_response_ms: number
          p_score: number
          p_session: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
