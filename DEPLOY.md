# 🚀 SoundWave Deployment Guide

How to deploy this project for everyone to use online.

The project consists of two parts:
1. **Backend (Python)** - Handles music downloading and processing. (We will use Railway)
2. **Frontend (HTML/JS)** - The user interface. (We will use Vercel)

---

## Step 1: GitHub Repository

Upload your code to GitHub (if you haven't already).
1. Create a new repository on GitHub.
2. Push your code there.

---

## Step 2: Backend (Railway)

We need to put the Python code on a server.

1. Go to [Railway.app](https://railway.app) and log in with GitHub.
2. Click the **+ New Project** button.
3. Select **Deploy from GitHub repo** and choose your repository.
4. Click **Deploy Now**.
5. Railway will automatically detect and install using `Procfile` and `requirements.txt`.
6. Once deployment is finished:
   - Go to the **Settings** section.
   - Under **Networking**, click **Generate Domain**.
   - It will give you a long link (e.g., `soundwave-production.up.railway.app`).
   - ⚠️ **Copy this link!**

---

## Step 3: Configuration

Now we need to tell the frontend where the backend is.

1. Open the `config.js` file in your project.
2. Paste the link you got from Railway and update the line:

```javascript
window.API_BASE = 'https://your-railway-link.up.railway.app/api';
```

3. Save the changes and **push** to GitHub again.

---

## Step 4: Frontend (Vercel)

Now let's put the website itself online.

1. Go to [Vercel.com](https://vercel.com).
2. Select **Add New...** -> **Project**.
3. Select your GitHub repo and click **Import**.
4. Click the **Deploy** button.
5. In about a minute, your site will be live at `your-project.vercel.app`!

---

## 🛠️ Post-Deployment Check

1. Visit your Vercel link.
2. Paste a Spotify track URL.
3. If everything is configured correctly, the backend on Railway will process the request and your download will start.

---

🎉 **Congratulations!** Now your friends can visit your Vercel link and download music. The backend will be running on Railway.
