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
      audit_events: {
        Row: {
          action: Database["public"]["Enums"]["audit_action_enum"]
          actor_id: string
          created_at: string
          id: string
          metadata: Json | null
          target_record_id: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action_enum"]
          actor_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          target_record_id?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action_enum"]
          actor_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          target_record_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          course_code: string
          course_name: string
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          course_code: string
          course_name: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          course_code?: string
          course_name?: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      grade_records: {
        Row: {
          block_index: number
          corrects_record_id: string | null
          course_id: string
          created_at: string
          grade: string
          id: string
          prev_hash: string
          record_hash: string
          signature: string
          signed_by: string
          student_id: string
        }
        Insert: {
          block_index: number
          corrects_record_id?: string | null
          course_id: string
          created_at?: string
          grade: string
          id: string
          prev_hash: string
          record_hash: string
          signature: string
          signed_by: string
          student_id: string
        }
        Update: {
          block_index?: number
          corrects_record_id?: string | null
          course_id?: string
          created_at?: string
          grade?: string
          id?: string
          prev_hash?: string
          record_hash?: string
          signature?: string
          signed_by?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grade_records_corrects_record_id_fkey"
            columns: ["corrects_record_id"]
            isOneToOne: false
            referencedRelation: "grade_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grade_records_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grade_records_signed_by_fkey"
            columns: ["signed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grade_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          created_at: string
          department: string
          id: string
          name: string
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department: string
          id?: string
          name: string
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string
          id?: string
          name?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          password_hash: string | null
          public_key: string
          role: Database["public"]["Enums"]["role_enum"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          password_hash?: string | null
          public_key: string
          role?: Database["public"]["Enums"]["role_enum"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          password_hash?: string | null
          public_key?: string
          role?: Database["public"]["Enums"]["role_enum"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      audit_action_enum:
        | "GRADE_CREATED"
        | "GRADE_CORRECTED"
        | "VERIFICATION_RUN"
        | "TAMPER_DETECTED"
      role_enum: "FACULTY" | "REGISTRAR" | "ADMIN"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"]
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T]
