# Premium Ebook Store

A modern, high-performance digital storefront built with **Next.js 15**, **Tailwind CSS**, and **Supabase**.

## 🚀 Features

- **Dynamic Catalog**: Manage digital products directly via Supabase.
- **Dynamic Payment Methods**: Support for Easypaisa, JazzCash, and Banks managed via DB.
- **Verification System**: Professional checkout workflow with admin verification.
- **Admin Panel**: Management tools for orders, users, and content.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + ShadCN UI
- **Backend/Database**: Supabase
- **Authentication**: Supabase Auth

## 🌐 Deployment (Netlify)

When deploying to Netlify, ensure you add the following **Environment Variables** in your Site Settings:

1. `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL.
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anonymous Key.
3. `NEXT_PUBLIC_ADMIN_EMAIL`: `itxprince440@gmail.com` (or your chosen admin email).
4. `NEXT_PUBLIC_BASE_URL`: Your deployed site URL (e.g., `https://your-site.netlify.app`).

## 📦 Local Development

1. Clone the repository.
2. Create a `.env.local` file with the variables listed above.
3. Run `npm install`.
4. Run `npm run dev`.

## 📄 License
MIT
