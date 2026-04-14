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
      products: {
        Row: {
          id: string
          created_at: string
          title: string
          price: number
          original_price: number | null
          stock_count: number | null
          rating: number
          category: string | null
          image_url: string | null
          image_url_2: string | null
          image_url_3: string | null
          image_hint: string | null
          description: string | null
          is_bestseller: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          price: number
          original_price?: number | null
          stock_count?: number | null
          rating?: number
          category?: string | null
          image_url?: string | null
          image_url_2?: string | null
          image_url_3?: string | null
          image_hint?: string | null
          description?: string | null
          is_bestseller?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          price?: number
          original_price?: number | null
          stock_count?: number | null
          rating?: number
          category?: string | null
          image_url?: string | null
          image_url_2?: string | null
          image_url_3?: string | null
          image_hint?: string | null
          description?: string | null
          is_bestseller?: boolean
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          created_at: string
          product_title: string
          price: number
          sender_name: string
          sender_number: string
          delivery_contact: string
          screenshot_url: string
          payment_method: string | null
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          product_title: string
          price: number
          sender_name: string
          sender_number: string
          delivery_contact: string
          screenshot_url: string
          payment_method?: string | null
          status?: string
        }
        Update: {
          id?: string
          created_at?: string
          product_title?: string
          price?: number
          sender_name?: string
          sender_number?: string
          delivery_contact?: string
          screenshot_url?: string
          payment_method?: string | null
          status?: string
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
