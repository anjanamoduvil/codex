# Trio AI - Business Intelligence Dashboard

![Trio AI](https://img.shields.io/badge/Status-Active-brightgreen)
![Tech Stack](https://img.shields.io/badge/Tech-React_|_Node.js_|_SQLite_|_Gemini_AI-blue)

Trio AI is a premium, AI-powered business intelligence dashboard designed to give founders and business owners deep, actionable insights into their growth, marketing, and financial health. Powered by Google's Gemini AI, Trio acts as your personal executive advisor.

## 🌌 The Cyber Aurora Experience
The application is designed with a state-of-the-art **Cyber Aurora Dark Theme**. It features deep space backgrounds, glowing neon accents (Cyan, Purple, Pink), frosted glassmorphism panels, and smooth micro-animations to create a premium, futuristic user experience.

---

## 🚀 Key Features

### 🧠 Dynamic AI Engine
- **Tailored Strategies:** Input your business profile (industry, goals, status) and financials. The backend connects to the Gemini AI API to generate highly specific Growth Strategies and Marketing Focus areas.
- **Actionable Roadmap:** The AI generates a checklist of actionable steps. As you check them off, your **Trio Health Score** dynamically increases.

### 💰 Interactive Financial Simulator
- Enter your income based on flexible frequencies (**Per Day, Per Month, or Per Year**).
- Open the Finance Insights modal to find an **Interactive Projection Simulator**. 
- Tweak your income numbers, hit "Apply Strategy", and the backend silently recalculates your data. Watch your Growth and Marketing charts instantly update to reflect your new financial projections!

### 📊 Advanced Data Visualization
- **Recharts Integration:** Beautiful, responsive Line Charts, Bar Charts, and Pie Charts that visualize your revenue growth, marketing spend allocation, and profit margins.
- **Trio Health Score:** An animated, circular SVG dial that calculates your overall business health based on your runway and task completion.

### 💬 Embedded AI Advisor
- Click on any insight card to open a massive frosted-glass modal.
- Chat directly with the **AI Advisor** specifically about that topic (Growth, Marketing, or Finance) while viewing your charts.

---

## 💻 Technology Stack

**Frontend (Client)**
- **React (Vite):** Lightning-fast development and optimized production builds.
- **Tailwind CSS:** Utility-first styling for the complex glassmorphism and neon glows.
- **Framer Motion:** Fluid animations, layout transitions, and bouncy tooltips.
- **Recharts:** Composable charting library built on React components.
- **React Router:** For seamless, Single Page Application (SPA) navigation.

**Backend (Server)**
- **Node.js & Express:** Robust server handling API routes and AI interactions.
- **SQLite:** Lightweight, serverless database for storing user accounts, business profiles, and financial metrics.
- **JSON Web Tokens (JWT):** Secure user authentication and route protection.
- **Google Generative AI (Gemini):** The core intelligence engine driving the insights and chat capabilities.

---

## 🛠️ Local Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- A Google Gemini API Key

### 1. Clone the Repository
```bash
git clone https://github.com/anjanamoduvil/codex.git
cd codex
```

### 2. Setup the Backend
```bash
cd backend
npm install
```
- Create a `.env` file in the `backend` directory.
- Add your secret keys:
```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_google_gemini_api_key
```
- Start the backend server:
```bash
npm run dev
```
*(The server will run on `http://localhost:5000` and auto-initialize the SQLite database).*

### 3. Setup the Frontend
Open a new terminal window.
```bash
cd frontend
npm install
```
- Start the Vite development server:
```bash
npm run dev
```
*(The frontend will run on `http://localhost:5173`).*

---

## 💡 How to Use the App
1. **Sign Up:** Create a new account.
2. **Onboarding:** Fill out your Business Profile and Financial Snapshot.
3. **Generate:** Click the glowing "Generate" button on the Smart Dock to trigger the AI analysis.
4. **Explore:** Click on the summary cards to view your interactive charts and chat with the AI Advisor!

---
*Built with ❤️ and AI.*
