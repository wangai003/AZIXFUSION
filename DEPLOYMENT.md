# Deploying MERN Marketplace to Vercel

This guide will walk you through deploying both the frontend (React) and backend (Node.js/Express) of your marketplace to Vercel, step by step.

---

## Prerequisites
- Vercel account ([sign up here](https://vercel.com/signup))
- Vercel CLI installed (`npm i -g vercel`)
- GitHub/GitLab/Bitbucket account (for repo import)
- MongoDB Atlas or remote MongoDB URI

---

## 1. Prepare Your Codebase
- Ensure your code is pushed to a remote Git repository (GitHub, GitLab, Bitbucket).
- Both `frontend/` and `backend/` folders should be in the root of your repo.

---

## 2. Deploy the Backend (Express API)

### a. Import Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **New Project**.
2. Select your repo and import it.
3. In the project settings, set the **Root Directory** to `backend`.

### b. Configure Environment Variables
- Add the following environment variables in Vercel:
  - `MONGODB_URI` (your MongoDB Atlas connection string)
  - `JWT_SECRET` (your JWT secret)
  - Any other variables from your `.env`

### c. Set Build & Output Settings
- **Build Command:** `npm install`
- **Output Directory:** Leave blank (Express apps don't need a static output)
- **Install Command:** `npm install`
- **Start Command:** `npm start` or `node index.js`

### d. Set Vercel to Use Node.js
- In `backend/vercel.json`, ensure:
```json
{
  "version": 2,
  "builds": [
    { "src": "index.js", "use": "@vercel/node" }
  ]
}
```

### e. Deploy
- Click **Deploy**. Wait for build and deployment to finish.
- Note the backend API URL (e.g., `https://your-backend.vercel.app/api`).

---

## 3. Deploy the Frontend (React)

### a. Import Project
1. In Vercel, create a new project for the frontend (or add as a monorepo project).
2. Set the **Root Directory** to `frontend`.

### b. Configure Environment Variables
- Add `REACT_APP_API_URL` (pointing to your backend API URL from above)
- Any other variables from your frontend `.env`

### c. Set Build & Output Settings
- **Build Command:** `npm run build`
- **Output Directory:** `build`

### d. Deploy
- Click **Deploy**. Wait for build and deployment to finish.
- Your frontend will be live at a Vercel URL (e.g., `https://your-frontend.vercel.app`)

---

## 4. Connect Frontend to Backend
- Ensure `REACT_APP_API_URL` in frontend points to the deployed backend URL.
- Test all flows (auth, products, orders, messaging, etc).

---

## 5. Troubleshooting
- **CORS errors:** Make sure your backend sets CORS headers to allow requests from your frontend domain.
- **Environment variables:** Double-check spelling and values in Vercel dashboard.
- **Build errors:** Check Vercel logs for missing dependencies or misconfigurations.
- **API not found:** Ensure backend is deployed and URL is correct in frontend config.

---

## 6. (Optional) Monorepo Setup
- You can deploy both frontend and backend as separate projects from the same repo.
- Or, use Vercel monorepo settings to manage both under one project.

---

## 7. Useful Links
- [Vercel Docs: Node.js](https://vercel.com/docs/concepts/functions/serverless-functions/runtimes/nodejs)
- [Vercel Docs: React](https://vercel.com/docs/concepts/projects/overview)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

---

## Done!
Your marketplace is now live on Vercel. Share your URLs and start onboarding users, sellers, and providers! 