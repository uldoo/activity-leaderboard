export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      members: {
        Row: {
          id: string;
          name: string;
          profile_emoji: string | null;
          is_active: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          profile_emoji?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          profile_emoji?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      activity_rules: {
        Row: {
          id: string;
          name: string;
          category: string;
          default_score: number;
          is_active: boolean | null;
          sort_order: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          default_score: number;
          is_active?: boolean | null;
          sort_order?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          default_score?: number;
          is_active?: boolean | null;
          sort_order?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      activities: {
        Row: {
          id: string;
          member_id: string | null;
          activity_rule_id: string | null;
          activity_type: string;
          category: string | null;
          score: number;
          activity_date: string;
          memo: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          member_id?: string | null;
          activity_rule_id?: string | null;
          activity_type: string;
          category?: string | null;
          score: number;
          activity_date: string;
          memo?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          member_id?: string | null;
          activity_rule_id?: string | null;
          activity_type?: string;
          category?: string | null;
          score?: number;
          activity_date?: string;
          memo?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'activities_member_id_fkey';
            columns: ['member_id'];
            isOneToOne: false;
            referencedRelation: 'members';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'activities_activity_rule_id_fkey';
            columns: ['activity_rule_id'];
            isOneToOne: false;
            referencedRelation: 'activity_rules';
            referencedColumns: ['id'];
          },
        ];
      };
      admins: {
        Row: {
          id: string;
          user_id: string | null;
          email: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          email: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          email?: string;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'admins_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Member = Database['public']['Tables']['members']['Row'];
export type MemberInsert = Database['public']['Tables']['members']['Insert'];
export type MemberUpdate = Database['public']['Tables']['members']['Update'];
export type ActivityRule = Database['public']['Tables']['activity_rules']['Row'];
export type ActivityRuleInsert = Database['public']['Tables']['activity_rules']['Insert'];
export type ActivityRuleUpdate = Database['public']['Tables']['activity_rules']['Update'];
export type Activity = Database['public']['Tables']['activities']['Row'];
export type ActivityInsert = Database['public']['Tables']['activities']['Insert'];
export type ActivityUpdate = Database['public']['Tables']['activities']['Update'];
export type Admin = Database['public']['Tables']['admins']['Row'];

export type ActivityWithMember = Activity & {
  member?: Member;
};
