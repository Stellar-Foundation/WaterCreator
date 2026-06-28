# 🌊 Water Creator

**Water Creator** is an AI-Powered Social Media Command Center designed to help digital creators, marketers, and solopreneurs design, generate, schedule, and optimize content across multiple channels from a single unified workspace.

---

## ✨ Key Features

### 1. ✍️ Single-Composer Cross-Platform Creator
*   **Agnostic Drafting**: Compose core posts and convert them with one click into platform-specific variations optimized for **Instagram**, **LinkedIn**, **TikTok**, **YouTube**, **X (Twitter)**, and more.
*   **Intelligent Validation**: Automatic checks for platform-specific character limits, image size compatibility, and tag recommendations.

### 2. 🎭 AI Avatar Video Studio
*   **Video Presenters**: Create high-retention horizontal or portrait video scripts and generate virtual presenters powered by advanced AI.
*   **Custom Prompting**: Command an interactive avatar script generator to craft compelling intro hooks, educational body text, and conversion-focused calls-to-action.

### 3. 📊 Analytics Central & Engagement Heatmap
*   **Unified Metric Tracking**: A comprehensive 30-day overview of aggregate impressions, reach, followers, and engagement rates.
*   **Interactive Engagement Heatmap**: A visual GitHub-style grid mapping day-by-day publishing volume and interaction density to reveal your highest-performing posting windows.

### 4. 🏆 Platform ROI Comparison Engine
*   **Dynamic Efficiency Calculator**: Weights audience growth speed, engagement density, and production friction (such as editing complexity or script overhead) to calculate an overall efficiency rating out of 100%.
*   **Interactive Optimizers**: Rotate focus modes (`Balanced`, `Audience Growth`, or `Engagement Intensity`) to receive precise, AI-driven tactical directions tailored to your top-performing platform.

### 5. 🔥 Grounded "Trending Topics" Widget
*   **Live Web Sourcing**: Sourced using the latest Google Search Grounding with Gemini. Enter any custom niche (e.g., *B2B SaaS*, *Fitness*, *Generative AI*) to fetch real-world news and viral themes from the past week.
*   **Actionable Content Hooks**: Every detected trend contains real sentiment analysis, exact web source citations, and custom-tailored post concepts you can send directly to your Composer.

---

## 🛠️ Technology Stack

*   **Frontend**: React (Vite), TypeScript, Tailwind CSS, Lucide Icons, Framer Motion (`motion/react`).
*   **Backend**: Node.js & Express Server with bundled execution.
*   **AI Engine**: `@google/genai` TypeScript SDK (utilizing `gemini-3.5-flash` with Google Search tool grounding).
*   **Bundling & Build**: Vite for frontend compilation and `esbuild` for compiling backend typescript (`server.ts`) into a production-ready CJS file.

---

## ⚙️ Development & Installation

### Prerequisite Configuration
Ensure you configure your environment variables by copying the example template:
```bash
cp .env.example .env
```
Provide your `GEMINI_API_KEY` inside `.env` to enable AI scriptwriting, search grounding, and the trending topics finder.

### Running in Development
Boot up both the Express backend proxy and Vite's frontend assets with hot module reloading:
```bash
npm run dev
```
The server binds to port `3000` on your host.

### Building for Production
Bundle the client assets into static distribution files, and compile the custom server into a bundled Node asset:
```bash
npm run build
```
Once successfully built, trigger the compiled production service:
```bash
npm start
```

---

*Crafted with precision for modern creators.*
