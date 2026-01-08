---
description: How to deploy the Linka application to Vercel
---

# Deploying to Vercel

Follow these steps to deploy your Vite + React application to Vercel.

## 1. Prepare Environment Variables
Ensure you have the following keys ready from your `.env` or Supabase/Notion dashboards:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_NOTION_CLIENT_ID` (if applicable)

## 2. Deploy via Vercel CLI (Recommended for fast iterations)
// turbo
1. Install Vercel CLI if you haven't: `npm i -g vercel`
2. Run `vercel` in the project root.
3. Follow the prompts (Select "Production" if ready).
4. Add your environment variables when prompted or via `vercel env add`.

## 3. Deploy via GitHub (Recommended for Production)
1. Push your code to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) and click **"Add New" -> "Project"**.
3. Import your repository.
4. **Framework Preset**: Vercel should automatically detect **Vite**.
5. **Environment Variables**: Expand this section and add all your `VITE_` keys.
6. Click **Deploy**.

## 4. Final Verification
1. Once deployed, visit the provided URL.
2. Check the browser console for any environment variable errors.
3. Test the login and Notion sync flows.
