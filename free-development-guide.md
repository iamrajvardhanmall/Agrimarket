# AgriMarket AI - Zero-Cost Free Deployment Guide

> **Note**: The complete, detailed step-by-step deployment guide is located at:
> [`docs/free-development-guide.md`](file:///d:/Agrimarket/docs/free-development-guide.md)

---

## Quick Summary

1. **Frontend (`frontend/`)**:
   - Status: Already deployed on **Vercel** (`https://agrimarket-gold.vercel.app`) ✅
   - Config: Needs `VITE_API_BASE_URL` pointing to your Render backend URL.

2. **Backend (`backend/`)**:
   - **Do NOT deploy to Vercel**: Vercel serverless has a 250MB limit that rejects `scikit-learn` & `pandas`.
   - **Deploy to Render.com** (100% Free Web Service):
     - Repository: `iamrajvardhanmall/Agrimarket`
     - Branch: `Raj`
     - Root Directory: `backend`
     - Build Command: `pip install -r requirements.txt`
     - Start Command: `python manage.py runserver 0.0.0.0:$PORT`
     - Free Instance

3. **Database (MongoDB Atlas M0)**:
   - Reset user password to clean alphanumeric (e.g., `Raj07072005M` — no `@` or `#`).
   - URI: `mongodb+srv://rajvardhanmall_db_user:<YOUR_PASSWORD>@agrimarketai.iobm0ic.mongodb.net/agrimarket?retryWrites=true&w=majority`
   - IP Whitelist: `0.0.0.0/0` (Allow from anywhere).

For full step-by-step instructions with tables, screenshots guidance, and troubleshooting, read [`docs/free-development-guide.md`](file:///d:/Agrimarket/docs/free-development-guide.md).

