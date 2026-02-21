# Signalist - Stock & Cryptocurrency Tracking Platform

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2-blue?style=flat-square&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-6.21-green?style=flat-square&logo=mongodb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)

A modern web application to track real-time stock and cryptocurrency prices, build personalized watchlists, receive price alerts, and stay informed with AI-powered market news summaries.

## 🌟 Features

- **Real-Time Market Data** - Live stock/crypto prices powered by Finnhub API
- **Personalized Watchlist** - Add/remove stocks with optimistic UI updates
- **Smart Alerts** - Price-based notifications via email
- **AI News Summaries** - Daily market digests personalized by Gemini AI
- **Google OAuth** - Seamless authentication and user profiles
- **TradingView Charts** - Interactive technical analysis widgets
- **Responsive Design** - Mobile-first dark mode interface

## 🛠️ Tech Stack

**Frontend:** Next.js 16 | React 19 | Tailwind CSS 4 | Radix UI | Zustand

**Backend:** Node.js | MongoDB | Mongoose | Better Auth | Inngest

**External APIs:** Finnhub | TradingView | Google Gemini | Nodemailer

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- API keys: Finnhub, Gemini, Google OAuth

### Installation

```bash
# Clone repo
git clone https://github.com/TungDuongTa/stock-crypto-tracker.git
cd signalist

# Install dependencies
npm install
```
Environment Setup
Create a .env file in the root directory with the following variables:
```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0

# Authentication
BETTER_AUTH_SECRET=your_random_secret_key_here
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# APIs
NEXT_PUBLIC_FINNHUB_API_KEY=your_finnhub_api_key
FINNHUB_API_KEY=your_finnhub_api_key
GEMINI_API_KEY=your_gemini_api_key

# Email Service
NODEMAILER_EMAIL=your_gmail@gmail.com
NODEMAILER_PASSWORD=your_app_specific_password

# Application
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
```
Run Development Server
```bash
npm run dev
```


