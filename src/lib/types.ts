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

export interface Assignment {
  id: string;
  user_id: string;
  title: string;
  urls: string[];
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  total_earning: number;
  today_earning: number;
  current_balance: number;
  referral_bonus: number;
  referral_code: string;
  referred_by: string | null;
  current_plan: string | null;
  created_at: string;
}

export interface Plan {
  id: string;
  name: string;
  investment: number;
  daily_earning: number;
  daily_assignments: number;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  plan_id: string;
  payment_uid: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  account_info: {
    bank_name: string;
    holder_name: string;
    account_number: string;
  };
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  url: string;
  created_at: string;
}

export interface Video {
  id: string;
  title: string;
  url: string;
  created_at: string;
}