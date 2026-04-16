# 🚀 Deployment Guide: MDM System

Follow these steps to deploy your project to **Render** (Backend) and **Vercel** (Frontend).

---

## 1. Backend: Render (Node.js)

1.  **Create a New Web Service** on Render.
2.  Connect your GitHub repository: `https://github.com/hackernikhil1234/MDM-System.git`.
3.  **Root Directory**: `backend`
4.  **Runtime**: `Node`
5.  **Build Command**: `npm install`
6.  **Start Command**: `npm start`
7.  **Environment Variables**:
    - `MONGO_URI`: Your MongoDB Atlas connection string (e.g., `mongodb+srv://...`)
    - `JWT_SECRET`: A long random string for security.
    - `FRONTEND_URL`: Your Vercel domain (e.g., `https://mdm-client.vercel.app`)

---

## 2. Frontend: Vercel (React)

1.  **Import Project** on Vercel.
2.  Connect your GitHub repository.
3.  **Root Directory**: `frontend`
4.  **Framework Preset**: `Create React App`
5.  **Environment Variables**:
    - `REACT_APP_API_URL`: Your Render service URL + `/api` (e.g., `https://mdm-server.onrender.com/api`)
    - `REACT_APP_SOCKET_URL`: Your Render service URL (e.g., `https://mdm-server.onrender.com`)

---

## 3. MongoDB Cloud (Atlas)

1.  Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  Create a **Free Cluster**.
3.  Add a **Database User** (username/password).
4.  **Network Access**: Allow access from `0.0.0.0/0` (required for Render/Vercel).
5.  Get your **Connection String** and use it for the `MONGO_URI` variable on Render.

---

## Troubleshooting
- **CORS Errors**: Ensure `FRONTEND_URL` on Render matches your exact Vercel URL (including `https://`).
- **Mixed Content**: Vercel and Render both use HTTPS by default, which is perfect.
