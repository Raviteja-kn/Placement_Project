# GuestGrid – Vercel & MongoDB Atlas Deployment Guide

This guide walks you through connecting your **MongoDB Atlas ($50 Free Credits)** cluster and deploying your **GuestGrid Web Platform** to **Vercel** in under 5 minutes.

---

## 🗄️ Step 1: Set Up MongoDB Atlas ($50 Free Credit Cluster)

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. Click **Build a Database** and select **M0 (Free)** or apply your **$50 Atlas Credit** to create a Dedicated/Shared cluster in your preferred region (e.g., `AWS / Mumbai ap-south-1` or `Frankfurt`).
3. Under **Security > Database Access**:
   - Click **Add New Database User**.
   - Authentication Method: **Password**.
   - Username: `guestgrid_admin` (or your choice).
   - Password: Choose a strong password (e.g., `SecurePass2026!`). Note this down!
   - Role: **Read and write to any database**.
4. Under **Security > Network Access**:
   - Click **Add IP Address**.
   - Select **Allow Access from Anywhere** (`0.0.0.0/0`) — required for Vercel serverless functions.
   - Click **Confirm**.
5. Under **Database > Deployment > Databases**:
   - Click **Connect** on your cluster.
   - Select **Drivers** (Node.js).
   - Copy your connection string, which looks like:
     ```text
     mongodb+srv://guestgrid_admin:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
     ```
   - Replace `<password>` with your actual password and add `/guestgrid` before `?`:
     ```text
     mongodb+srv://guestgrid_admin:SecurePass2026!@cluster0.abcde.mongodb.net/guestgrid?retryWrites=true&w=majority
     ```

---

## 💻 Step 2: Configure Environment Variables Locally (Optional)

In `guestgrid/.env.local`:
```env
MONGODB_URI=mongodb+srv://guestgrid_admin:SecurePass2026!@cluster0.abcde.mongodb.net/guestgrid?retryWrites=true&w=majority
NEXTAUTH_SECRET=guestgrid-enterprise-auth-secret-key-placement-2026
NEXTAUTH_URL=http://localhost:3000
```

To run locally:
```bash
cd guestgrid
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Step 3: Deploy to Vercel (Free & Instant)

### Option A: Using GitHub (Recommended)
1. Push this folder to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "GuestGrid Full-Stack Platform"
   git remote add origin https://github.com/<your-username>/guestgrid.git
   git push -u origin main
   ```
2. Log in to [Vercel](https://vercel.com).
3. Click **Add New... > Project** and import your GitHub repository.
4. Set **Root Directory** to `guestgrid`.
5. Under **Environment Variables**, add the 3 variables:
   - `MONGODB_URI`: Your MongoDB Atlas URI from Step 1.
   - `NEXTAUTH_SECRET`: Any 32-character random string (e.g., `guestgrid-secret-2026-auth-token`).
   - `NEXTAUTH_URL`: Your Vercel production domain (e.g., `https://guestgrid.vercel.app` or leave blank during first deploy and update after).
6. Click **Deploy**. Vercel will build and deploy your site in ~45 seconds!

### Option B: Using Vercel CLI (From Terminal)
```bash
cd guestgrid
npx vercel
```
Follow the terminal prompts, select production deployment, and enter the environment variables when prompted.

---

## ⚡ Step 4: Immediate 1-Click Demo Testing

Once your site is live on Vercel:
1. Open your Vercel URL (e.g. `https://guestgrid.vercel.app`).
2. On the login screen, click **"Reset / Seed Demo Event Data"**.
   - This automatically initializes Tables 1–5, the Sharma Family, Friends Group, VIP guests, and the organizer login!
3. Click **"Autofill Credentials"** (or use `admin@guestgrid.com` / `admin123`).
4. Click **"Sign In to Dashboard"**.
5. You now have full access to:
   - **Executive Dashboard** with live capacity bars and attendance stats.
   - **Guest Registry** with real-time duplicate phone warnings.
   - **Table Seating Map** showing visual banquet floor status.
   - **Family & Groups Manager** preventing accidental family separation.
   - **Fast Reception Check-In Desk** for live guest arrival stamps.
   - **Audit Reports** with downloadable `.txt` files.
