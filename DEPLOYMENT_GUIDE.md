# Deployment Guide (Vercel + Render)

This guide helps you deploy your full-stack application.
- **Frontend**: Host on **Vercel** (Free, fast, custom URLs like `your-app.vercel.app`).
- **Backend**: Host on **Render** (as previously configured).

## 1. Frontend Deployment (Vercel)
Vercel is ideal because it hides your GitHub username and handles React routing perfectly.

### Steps:
1.  Go to [https://vercel.com/signup](https://vercel.com/signup) and log in with GitHub.
2.  Click **"Add New..."** -> **Project**.
3.  Import your repository `AccurateAccountServices`.
4.  **Configure Project:**
    - **Framework Preset**: Vite (should be auto-detected).
    - **Root Directory**: `./` (default).
    - **Build Command**: `npm run build` (default).
    - **Output Directory**: `dist` (default).
5.  **Environment Variables (Important!)**:
    - Add a new variable named `VITE_API_BASE_URL`.
    - Value: `https://accurateaccountservices-1.onrender.com` (Your Render Backend URL).
6.  Click **Deploy**.

Once finished, Vercel will give you a URL like `https://accurate-account-services.vercel.app`.

## 2. Backend Deployment (Render)
*If you haven't done this yet, see `DATABASE_SETUP.md` first.*

1.  Your backend should be running on Render.
2.  Ensure you have set the ENV variables (`DB_HOST`, etc.) in Render Dashboard.

## 3. Connecting them
- The Frontend on Vercel knows how to talk to the Backend because you set `VITE_API_BASE_URL` in Step 1.
- If you need to change the backend URL in the future, just update the Environment Variable in Vercel settings and redeploy.
