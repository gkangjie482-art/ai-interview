export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      api_rate_limits: {
        Row: {
          key: string;
          request_count: number;
          window_start: string;
        };
        ComputedFields: never;
        Insert: {
          key: string;
          request_count?: number;
          window_start: string;
        };
        Update: {
          key?: string;
          request_count?: number;
          window_start?: string;
        };
        Relationships: [];
      };
      chat_usage_events: {
        Row: {
          cost_usd: number;
          created_at: string;
          id: string;
          input_tokens: number;
          metadata: Json | null;
          model: string;
          occurred_at: string;
          output_tokens: number;
          prompt_name: string | null;
          session_id: string | null;
          total_tokens: number;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          cost_usd?: number;
          created_at?: string;
          id?: string;
          input_tokens?: number;
          metadata?: Json | null;
          model: string;
          occurred_at?: string;
          output_tokens?: number;
          prompt_name?: string | null;
          session_id?: string | null;
          total_tokens?: number;
          user_id: string;
        };
        Update: {
          cost_usd?: number;
          created_at?: string;
          id?: string;
          input_tokens?: number;
          metadata?: Json | null;
          model?: string;
          occurred_at?: string;
          output_tokens?: number;
          prompt_name?: string | null;
          session_id?: string | null;
          total_tokens?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      interview_messages: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          interview_session_id: string;
          role: Database["public"]["Enums"]["interview_role_enum"];
        };
        ComputedFields: never;
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          interview_session_id: string;
          role: Database["public"]["Enums"]["interview_role_enum"];
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          interview_session_id?: string;
          role?: Database["public"]["Enums"]["interview_role_enum"];
        };
        Relationships: [
          {
            foreignKeyName: "interview_messages_interview_session_id_fkey";
            columns: ["interview_session_id"];
            isOneToOne: false;
            referencedRelation: "interview_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      interview_questions: {
        Row: {
          created_at: string;
          follow_up_guide: string | null;
          id: string;
          interview_id: string;
          question: string;
          question_order: number;
          quick_replies: string[] | null;
          target_audience: string | null;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          follow_up_guide?: string | null;
          id?: string;
          interview_id: string;
          question: string;
          question_order: number;
          quick_replies?: string[] | null;
          target_audience?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          follow_up_guide?: string | null;
          id?: string;
          interview_id?: string;
          question?: string;
          question_order?: number;
          quick_replies?: string[] | null;
          target_audience?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "interview_questions_interview_id_fkey";
            columns: ["interview_id"];
            isOneToOne: false;
            referencedRelation: "interviews";
            referencedColumns: ["id"];
          },
        ];
      };
      interview_rating_feedbacks: {
        Row: {
          created_at: string;
          id: string;
          interview_session_id: string;
          tag: Database["public"]["Enums"]["interview_feedback_tag_enum"];
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          id?: string;
          interview_session_id: string;
          tag: Database["public"]["Enums"]["interview_feedback_tag_enum"];
        };
        Update: {
          created_at?: string;
          id?: string;
          interview_session_id?: string;
          tag?: Database["public"]["Enums"]["interview_feedback_tag_enum"];
        };
        Relationships: [
          {
            foreignKeyName: "interview_rating_feedbacks_interview_session_id_fkey";
            columns: ["interview_session_id"];
            isOneToOne: false;
            referencedRelation: "interview_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      interview_report: {
        Row: {
          admin_unpublished_at: string | null;
          content_richness: Json | null;
          created_at: string;
          id: string;
          interview_session_id: string;
          is_data_reuse_consented: boolean;
          is_public_by_admin: boolean;
          is_public_by_user: boolean;
          moderation_reasoning: string | null;
          moderation_score: number | null;
          moderation_status:
            | Database["public"]["Enums"]["moderation_status_enum"]
            | null;
          opinions: Json | null;
          opinions_reextracted_at: string | null;
          role:
            | Database["public"]["Enums"]["interview_report_role_enum"]
            | null;
          role_description: string | null;
          role_title: string | null;
          stance: Database["public"]["Enums"]["stance_type_enum"] | null;
          summary: string | null;
          total_content_richness: number | null;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          admin_unpublished_at?: string | null;
          content_richness?: Json | null;
          created_at?: string;
          id?: string;
          interview_session_id: string;
          is_data_reuse_consented?: boolean;
          is_public_by_admin?: boolean;
          is_public_by_user?: boolean;
          moderation_reasoning?: string | null;
          moderation_score?: number | null;
          moderation_status?: never;
          opinions?: Json | null;
          opinions_reextracted_at?: string | null;
          role?:
            | Database["public"]["Enums"]["interview_report_role_enum"]
            | null;
          role_description?: string | null;
          role_title?: string | null;
          stance?: Database["public"]["Enums"]["stance_type_enum"] | null;
          summary?: string | null;
          total_content_richness?: never;
          updated_at?: string;
        };
        Update: {
          admin_unpublished_at?: string | null;
          content_richness?: Json | null;
          created_at?: string;
          id?: string;
          interview_session_id?: string;
          is_data_reuse_consented?: boolean;
          is_public_by_admin?: boolean;
          is_public_by_user?: boolean;
          moderation_reasoning?: string | null;
          moderation_score?: number | null;
          moderation_status?: never;
          opinions?: Json | null;
          opinions_reextracted_at?: string | null;
          role?:
            | Database["public"]["Enums"]["interview_report_role_enum"]
            | null;
          role_description?: string | null;
          role_title?: string | null;
          stance?: Database["public"]["Enums"]["stance_type_enum"] | null;
          summary?: string | null;
          total_content_richness?: never;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "interview_report_interview_session_id_fkey";
            columns: ["interview_session_id"];
            isOneToOne: true;
            referencedRelation: "interview_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      interview_sessions: {
        Row: {
          archived_at: string | null;
          completed_at: string | null;
          created_at: string;
          id: string;
          interview_id: string;
          langfuse_session_id: string | null;
          rating: number | null;
          started_at: string;
          updated_at: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          archived_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          interview_id: string;
          langfuse_session_id?: string | null;
          rating?: number | null;
          started_at?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          archived_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          interview_id?: string;
          langfuse_session_id?: string | null;
          rating?: number | null;
          started_at?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "interview_sessions_interview_id_fkey";
            columns: ["interview_id"];
            isOneToOne: false;
            referencedRelation: "interviews";
            referencedColumns: ["id"];
          },
        ];
      };
      interviews: {
        Row: {
          background: string | null;
          chat_model: string | null;
          closes_at: string | null;
          created_at: string;
          deleted_at: string | null;
          description: string | null;
          estimated_duration: number | null;
          featured_order: number;
          id: string;
          is_featured: boolean;
          mode: Database["public"]["Enums"]["interview_mode_enum"];
          name: string;
          prompt_overrides: Json | null;
          publish_status: Database["public"]["Enums"]["interview_publish_status_enum"];
          published_at: string | null;
          show_prompt: boolean;
          slug: string;
          status: Database["public"]["Enums"]["interview_status_enum"];
          summary: string | null;
          themes: string[] | null;
          thumbnail_url: string | null;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          background?: string | null;
          chat_model?: string | null;
          closes_at?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          description?: string | null;
          estimated_duration?: number | null;
          featured_order?: number;
          id?: string;
          is_featured?: boolean;
          mode?: Database["public"]["Enums"]["interview_mode_enum"];
          name: string;
          prompt_overrides?: Json | null;
          publish_status?: Database["public"]["Enums"]["interview_publish_status_enum"];
          published_at?: string | null;
          show_prompt?: boolean;
          slug: string;
          status?: Database["public"]["Enums"]["interview_status_enum"];
          summary?: string | null;
          themes?: string[] | null;
          thumbnail_url?: string | null;
          updated_at?: string;
        };
        Update: {
          background?: string | null;
          chat_model?: string | null;
          closes_at?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          description?: string | null;
          estimated_duration?: number | null;
          featured_order?: number;
          id?: string;
          is_featured?: boolean;
          mode?: Database["public"]["Enums"]["interview_mode_enum"];
          name?: string;
          prompt_overrides?: Json | null;
          publish_status?: Database["public"]["Enums"]["interview_publish_status_enum"];
          published_at?: string | null;
          show_prompt?: boolean;
          slug?: string;
          status?: Database["public"]["Enums"]["interview_status_enum"];
          summary?: string | null;
          themes?: string[] | null;
          thumbnail_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      preview_tokens: {
        Row: {
          created_at: string;
          created_by: string | null;
          expires_at: string;
          id: string;
          interview_id: string;
          token: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          created_by?: string | null;
          expires_at: string;
          id?: string;
          interview_id: string;
          token: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          expires_at?: string;
          id?: string;
          interview_id?: string;
          token?: string;
        };
        Relationships: [
          {
            foreignKeyName: "preview_tokens_interview_id_fkey";
            columns: ["interview_id"];
            isOneToOne: false;
            referencedRelation: "interviews";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      bulk_publish_reports: {
        Args: {
          p_interview_id: string;
          p_max_moderation_score: number;
          p_min_content_richness: number;
        };
        Returns: number;
      };
      count_bulk_publish_targets: {
        Args: {
          p_interview_id: string;
          p_max_moderation_score: number;
          p_min_content_richness: number;
        };
        Returns: number;
      };
      count_public_reports_by_interview_ids: {
        Args: { p_interview_ids: string[] };
        Returns: {
          interview_id: string;
          report_count: number;
        }[];
      };
      count_sessions_by_interview_ids: {
        Args: { p_interview_ids: string[] };
        Returns: {
          interview_id: string;
          session_count: number;
        }[];
      };
      extract_assistant_question_id: {
        Args: { content: string };
        Returns: string;
      };
      find_sessions_ordered_by_message_count: {
        Args: {
          p_ascending?: boolean;
          p_interview_id: string;
          p_limit?: number;
          p_offset?: number;
          p_role?: string;
          p_stance?: string;
          p_status?: string;
          p_visibility?: string;
        };
        Returns: {
          session_id: string;
        }[];
      };
      find_sessions_ordered_by_moderation_score: {
        Args: {
          p_ascending?: boolean;
          p_interview_id: string;
          p_limit?: number;
          p_offset?: number;
          p_role?: string;
          p_stance?: string;
          p_status?: string;
          p_visibility?: string;
        };
        Returns: {
          session_id: string;
        }[];
      };
      find_sessions_ordered_by_total_content_richness: {
        Args: {
          p_ascending?: boolean;
          p_interview_id: string;
          p_limit?: number;
          p_offset?: number;
          p_role?: string;
          p_stance?: string;
          p_status?: string;
          p_visibility?: string;
        };
        Returns: {
          session_id: string;
        }[];
      };
      get_admin_users: {
        Args: Record<PropertyKey, never>;
        Returns: {
          created_at: string;
          email: string;
          id: string;
          last_sign_in_at: string;
        }[];
      };
      get_chat_usage_metrics: {
        Args: { p_from?: string; p_interview_id?: string; p_to?: string };
        Returns: {
          event_count: number;
          prompt_name: string;
          total_cost_usd: number;
          total_tokens: number;
          unique_session_count: number;
          unique_user_count: number;
        }[];
      };
      get_interview_message_counts: {
        Args: { session_ids: string[] };
        Returns: {
          interview_session_id: string;
          message_count: number;
        }[];
      };
      get_interview_metrics: {
        Args: { p_interview_id?: string };
        Returns: {
          completed_count: number;
          completion_rate: number;
          conducted_count: number;
          interview_id: string;
          interview_name: string;
          public_count: number;
          total_duration_seconds: number;
          total_duration_seconds_under_1h: number;
        }[];
      };
      get_interview_statistics: {
        Args: { p_interview_id: string };
        Returns: {
          avg_cost_usd: number;
          avg_message_count: number;
          avg_rating: number;
          avg_total_content_richness: number;
          completed_sessions: number;
          feedback_irrelevant_questions: number;
          feedback_misunderstood: number;
          feedback_not_aligned: number;
          feedback_other: number;
          feedback_too_many_questions: number;
          median_duration_seconds: number;
          public_by_user_count: number;
          role_daily_life_affected_count: number;
          role_general_citizen_count: number;
          role_subject_expert_count: number;
          role_work_related_count: number;
          stance_against_count: number;
          stance_for_count: number;
          stance_neutral_count: number;
          total_cost_usd: number;
          total_duration_seconds: number;
          total_duration_seconds_under_1h: number;
          total_sessions: number;
        }[];
      };
      get_question_answer_counts: {
        Args: { p_interview_id: string };
        Returns: {
          answered_session_count: number;
          asked_session_count: number;
          question: string;
          question_id: string;
          question_order: number;
        }[];
      };
      increment_api_rate_limit: {
        Args: { p_key: string; p_limit: number; p_window_start: string };
        Returns: boolean;
      };
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      sum_chat_usage_cost: {
        Args: { from_iso: string; to_iso: string };
        Returns: number;
      };
      unpublish_reports_by_interview_id: {
        Args: { p_interview_id: string };
        Returns: undefined;
      };
    };
    Enums: {
      interview_feedback_tag_enum:
        | "irrelevant_questions"
        | "not_aligned"
        | "misunderstood"
        | "too_many_questions"
        | "other";
      interview_mode_enum: "loop" | "bulk" | "targeted";
      interview_publish_status_enum: "draft" | "published";
      interview_report_role_enum:
        | "subject_expert"
        | "work_related"
        | "daily_life_affected"
        | "general_citizen";
      interview_role_enum: "assistant" | "user";
      interview_status_enum: "public" | "closed";
      moderation_status_enum: "ok" | "warning" | "ng";
      stance_type_enum:
        | "for"
        | "against"
        | "neutral"
        | "conditional_for"
        | "conditional_against"
        | "considering"
        | "continued_deliberation"
        | "free_vote";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      interview_feedback_tag_enum: [
        "irrelevant_questions",
        "not_aligned",
        "misunderstood",
        "too_many_questions",
        "other",
      ],
      interview_mode_enum: ["loop", "bulk", "targeted"],
      interview_publish_status_enum: ["draft", "published"],
      interview_report_role_enum: [
        "subject_expert",
        "work_related",
        "daily_life_affected",
        "general_citizen",
      ],
      interview_role_enum: ["assistant", "user"],
      interview_status_enum: ["public", "closed"],
      moderation_status_enum: ["ok", "warning", "ng"],
      stance_type_enum: [
        "for",
        "against",
        "neutral",
        "conditional_for",
        "conditional_against",
        "considering",
        "continued_deliberation",
        "free_vote",
      ],
    },
  },
} as const;
