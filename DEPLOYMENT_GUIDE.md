# Deployment Guide

This repository has been configured to deploy the Frontend automatically to **GitHub Pages**.
However, this is a full-stack application (Frontend + Backend), and GitHub Pages only hosts static sites (Frontend).

## Status
- **Frontend**: Configured for GitHub Pages.
- **Backend**: Needs to be hosted separately (e.g., Render, Railway, Heroku).

## 1. Frontend Deployment (Done)
The GitHub Actions workflow `.github/workflows/deploy.yml` will automatically build and deploy the frontend to the `gh-pages` branch whenever you push to `main`.

You can view your deployed site at:
**https://codingmastersucks-del.github.io/AccurateAccountServices/**

## 2. Backend Deployment (Required)
Since your app uses a Node.js Express server (`Server` folder), you must deploy this folder to a backend hosting provider.

### Recommended Provider: Render.com
1. Create a new "Web Service" on [Render](https://render.com).
2. Connect your GitHub repository.
3. Settings:
   - **Root Directory**: `Server`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
4. Deploy. Render will give you a URL (e.g., `https://your-app-backend.onrender.com`).

## 3. Connecting Frontend to Backend
Once your backend is deployed, you need to tell the frontend to talk to the new backend URL instead of `localhost:3000`.

1. Open `src/config.ts`.
2. This file reads `VITE_API_BASE_URL` from the environment.
3. For local development, create a `.env` file in the root:
   ```
   VITE_API_BASE_URL=http://localhost:3000
   ```
4. For production (GitHub Pages):
   - Go to your GitHub Repo -> Settings -> Environments -> github-pages (or just Secrets/Variables).
   - Add a repository variable or secret named `VITE_API_BASE_URL` with your Render backend URL.
   **OR**
   - Directly edit `src/config.ts` if you want a quick fix:
     ```typescript
     const API_BASE_URL = 'https://your-new-backend-url.onrender.com';
     export default API_BASE_URL;
     ```

## Important Note
We have updated `Chat.tsx`, `LoginPopup.tsx`, and `UserData.tsx` to use the new configuration. You should ensure other files in `src` do not have hardcoded `http://localhost:3000`.
