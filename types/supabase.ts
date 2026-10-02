// Generated from the Supabase schema (MCP generate_typescript_types). Regenerate after
// schema changes rather than editing by hand.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      addresses: {
        Row: {
          area: string;
          city: string;
          created_at: string;
          full_name: string;
          house_number: string;
          id: string;
          is_default: boolean;
          landmark: string;
          phone: string;
          pincode: string;
          state: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          area: string;
          city: string;
          created_at?: string;
          full_name: string;
          house_number: string;
          id?: string;
          is_default?: boolean;
          landmark?: string;
          phone: string;
          pincode: string;
          state: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          area?: string;
          city?: string;
          created_at?: string;
          full_name?: string;
          house_number?: string;
          id?: string;
          is_default?: boolean;
          landmark?: string;
          phone?: string;
          pincode?: string;
          state?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      cart_items: {
        Row: {
          added_at: string;
          product_id: string;
          quantity: number;
          user_id: string;
        };
        Insert: {
          added_at?: string;
          product_id: string;
          quantity: number;
          user_id?: string;
        };
        Update: {
          added_at?: string;
          product_id?: string;
          quantity?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          created_at: string;
          description: string;
          image_path: string | null;
          name: string;
          slug: string;
          sort_order: number;
          tint: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string;
          image_path?: string | null;
          name: string;
          slug: string;
          sort_order?: number;
          tint?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          image_path?: string | null;
          name?: string;
          slug?: string;
          sort_order?: number;
          tint?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      coupons: {
        Row: {
          code: string;
          created_at: string;
          description: string;
          expires_at: string | null;
          is_active: boolean;
          min_order_value: number;
          type: string;
          updated_at: string;
          usage_count: number;
          usage_limit: number | null;
          value: number;
        };
        Insert: {
          code: string;
          created_at?: string;
          description?: string;
          expires_at?: string | null;
          is_active?: boolean;
          min_order_value?: number;
          type: string;
          updated_at?: string;
          usage_count?: number;
          usage_limit?: number | null;
          value: number;
        };
        Update: {
          code?: string;
          created_at?: string;
          description?: string;
          expires_at?: string | null;
          is_active?: boolean;
          min_order_value?: number;
          type?: string;
          updated_at?: string;
          usage_count?: number;
          usage_limit?: number | null;
          value?: number;
        };
        Relationships: [];
      };
      order_events: {
        Row: {
          created_at: string;
          id: number;
          note: string | null;
          order_id: string;
          status: string;
        };
        Insert: {
          created_at?: string;
          id?: never;
          note?: string | null;
          order_id: string;
          status: string;
        };
        Update: {
          created_at?: string;
          id?: never;
          note?: string | null;
          order_id?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_events_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          id: number;
          image_path: string | null;
          order_id: string;
          price: number;
          product_id: string | null;
          product_slug: string;
          quantity: number;
          title: string;
        };
        Insert: {
          id?: never;
          image_path?: string | null;
          order_id: string;
          price: number;
          product_id?: string | null;
          product_slug: string;
          quantity: number;
          title: string;
        };
        Update: {
          id?: never;
          image_path?: string | null;
          order_id?: string;
          price?: number;
          product_id?: string | null;
          product_slug?: string;
          quantity?: number;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          address: Json;
          cancelled_at: string | null;
          customer_email: string | null;
          customer_name: string;
          delivery_charge: number;
          id: string;
          payment_method: string;
          payment_status: string;
          placed_at: string;
          status: string;
          subtotal: number;
          total: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          address: Json;
          cancelled_at?: string | null;
          customer_email?: string | null;
          customer_name?: string;
          delivery_charge: number;
          id: string;
          payment_method?: string;
          payment_status?: string;
          placed_at?: string;
          status?: string;
          subtotal: number;
          total: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          address?: Json;
          cancelled_at?: string | null;
          customer_email?: string | null;
          customer_name?: string;
          delivery_charge?: number;
          id?: string;
          payment_method?: string;
          payment_status?: string;
          placed_at?: string;
          status?: string;
          subtotal?: number;
          total?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      payouts: {
        Row: {
          amount: number;
          created_at: string;
          id: string;
          order_count: number;
          paid_at: string | null;
          period_end: string;
          period_start: string;
          status: string;
        };
        Insert: {
          amount?: number;
          created_at?: string;
          id?: string;
          order_count?: number;
          paid_at?: string | null;
          period_end: string;
          period_start: string;
          status?: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          id?: string;
          order_count?: number;
          paid_at?: string | null;
          period_end?: string;
          period_start?: string;
          status?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          brand: string;
          category_slug: string;
          cons: string[];
          created_at: string;
          description: string;
          extra_image_paths: string[];
          id: string;
          image_path: string | null;
          is_top_pick: boolean;
          low_stock_threshold: number;
          mrp: number | null;
          price: number;
          pros: string[];
          rating: number | null;
          rating_count: number | null;
          short_description: string;
          sku: string;
          slug: string;
          specs: Json;
          status: string;
          stock: number;
          title: string;
          updated_at: string;
        };
        Insert: {
          brand?: string;
          category_slug: string;
          cons?: string[];
          created_at?: string;
          description?: string;
          extra_image_paths?: string[];
          id?: string;
          image_path?: string | null;
          is_top_pick?: boolean;
          low_stock_threshold?: number;
          mrp?: number | null;
          price: number;
          pros?: string[];
          rating?: number | null;
          rating_count?: number | null;
          short_description?: string;
          sku: string;
          slug: string;
          specs?: Json;
          status?: string;
          stock?: number;
          title: string;
          updated_at?: string;
        };
        Update: {
          brand?: string;
          category_slug?: string;
          cons?: string[];
          created_at?: string;
          description?: string;
          extra_image_paths?: string[];
          id?: string;
          image_path?: string | null;
          is_top_pick?: boolean;
          low_stock_threshold?: number;
          mrp?: number | null;
          price?: number;
          pros?: string[];
          rating?: number | null;
          rating_count?: number | null;
          short_description?: string;
          sku?: string;
          slug?: string;
          specs?: Json;
          status?: string;
          stock?: number;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_slug_fkey";
            columns: ["category_slug"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["slug"];
          },
        ];
      };
      profiles: {
        Row: {
          contact_email: string | null;
          created_at: string;
          email: string | null;
          full_name: string;
          id: string;
          phone: string;
          updated_at: string;
        };
        Insert: {
          contact_email?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string;
          id: string;
          phone?: string;
          updated_at?: string;
        };
        Update: {
          contact_email?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string;
          id?: string;
          phone?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      return_requests: {
        Row: {
          amount: number;
          id: string;
          order_id: string;
          order_item_id: number | null;
          product_slug: string;
          product_title: string;
          reason: string;
          requested_at: string;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          amount: number;
          id?: string;
          order_id: string;
          order_item_id?: number | null;
          product_slug: string;
          product_title: string;
          reason: string;
          requested_at?: string;
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          amount?: number;
          id?: string;
          order_id?: string;
          order_item_id?: number | null;
          product_slug?: string;
          product_title?: string;
          reason?: string;
          requested_at?: string;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "return_requests_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "return_requests_order_item_id_fkey";
            columns: ["order_item_id"];
            isOneToOne: false;
            referencedRelation: "order_items";
            referencedColumns: ["id"];
          },
        ];
      };
      store_settings: {
        Row: {
          cod_limit: number;
          contact_email: string;
          delivery_charge: number;
          delivery_days_max: number;
          delivery_days_min: number;
          free_delivery_above: number;
          id: boolean;
          is_cod_enabled: boolean;
          return_window_days: number;
          store_name: string;
          support_phone: string;
          updated_at: string;
          whatsapp_number: string;
        };
        Insert: {
          cod_limit?: number;
          contact_email?: string;
          delivery_charge?: number;
          delivery_days_max?: number;
          delivery_days_min?: number;
          free_delivery_above?: number;
          id?: boolean;
          is_cod_enabled?: boolean;
          return_window_days?: number;
          store_name?: string;
          support_phone?: string;
          updated_at?: string;
          whatsapp_number?: string;
        };
        Update: {
          cod_limit?: number;
          contact_email?: string;
          delivery_charge?: number;
          delivery_days_max?: number;
          delivery_days_min?: number;
          free_delivery_above?: number;
          id?: boolean;
          is_cod_enabled?: boolean;
          return_window_days?: number;
          store_name?: string;
          support_phone?: string;
          updated_at?: string;
          whatsapp_number?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      cancel_order: { Args: { p_order_id: string }; Returns: undefined };
      place_order: { Args: { p_address_id: string }; Returns: string };
      set_order_status: {
        Args: { p_order_id: string; p_status: string };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];
