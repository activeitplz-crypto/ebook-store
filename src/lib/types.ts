
export interface Product {
  id: string;
  title: string;
  price: number;
  original_price?: number;
  stock_count?: number;
  rating: number;
  category: string | null;
  image_url: string | null;
  image_hint: string | null;
  description?: string | null;
  created_at: string;
  is_bestseller: boolean;
}

export interface Review {
  id: string;
  product_id: string;
  name: string;
  rating: number;
  content: string;
  created_at: string;
}

export interface Order {
  id: string;
  product_title: string;
  price: number;
  sender_name: string;
  sender_number: string;
  delivery_contact: string;
  screenshot_url: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  image_url: string;
  button_text: string;
  button_link: string;
  created_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  order_index: number;
  created_at: string;
}
