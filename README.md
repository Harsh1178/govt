# JanConnect (जन कनेक्ट) — Bharat Setu Initiative

> **Citizen Voices. Smarter Development. One Platform.**  
> A Digital Public Good aggregating citizen requests, grievances, and infrastructure demands across India, powered by AI classification, real-time heatmaps, and official resolution workflows.

---

## 🌟 Key Features

### 👤 Citizen Portal
- **Simple & Secure Login**: Fast access with Name and Email credentials.
- **AI-Powered Complaint Tagging**: Automatically classifies and suggests the relevant government departments as citizens type `@` using local **Qwen2.5-1.5B** or **Gemini 1.5 Flash**.
- **Geo-Location & Camera Capture**: Automatic GPS geocoding and photo attachments.
- **Community Feed & Filters**: Explore, upvote, and filter citizen issues by city, area, or popularity.
- **Rewards System**: Earn civic engagement points and redeem brand discount coupons.

### 🏛️ Official Portal
- **Interactive India Demand Heatmap**:
  - State-level priority heatmap rendered with Leaflet.js.
  - Floating cursor analytics tooltip providing state demographics, demand scores, deficit breakdowns, and key projects.
  - Smooth hover transitions and instant response without page jumping.
- **Department Complaints Workflow**:
  - Live complaint feed filtered by the official's department.
  - **AI Clustering & Issue Grouping**: Groups similar complaints into clusters with priority badges (High/Medium/Low).
  - **Resolution Workflow**: Upload work completion/after photos, add resolution notes, and batch-update complaints with automated email alerts to citizens.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: Vanilla JavaScript (ES Modules), HTML5, CSS3, Leaflet.js (India GeoJSON maps).
- **Backend**: Node.js, Express.js, Nodemailer (Gmail SMTP).
- **Database & Storage**: Firebase Firestore (real-time sync) & Firebase Storage.
- **AI / LLM Integration**:
  - **Local Model**: Qwen2.5-1.5B-Instruct (GGUF quantized via llama.cpp or Ollama).
  - **Cloud LLM**: Google Gemini 1.5 Flash (`@google/generative-ai`).
  - **HuggingFace Inference API**: Optional fallback for cloud Qwen inference.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Git](https://git-scm.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/Harsh1178/govt.git
cd govt
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```
Fill in:
```env
GEMINI_API_KEY=your_gemini_api_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
PORT=3001
```

### 4. Start the Application
```bash
npm start
```
Open your browser and navigate to:
```
http://localhost:3001
```

---

## 📁 Project Structure

```
├── citizen/                       # Citizen Portal UI and scripts
│   ├── index.html                 # Main citizen dashboard
│   ├── script.js                  # Citizen portal logic & Firebase integration
│   ├── style.css                  # Citizen portal styles
│   └── list.txt                   # Department registry for autocomplete
├── official/                      # Official Portal
│   └── india development_demand/  # Demand Heatmap dashboard
│       ├── index.html             # Heatmap & department dashboard
│       ├── script.js              # Leaflet mapping, AI grouping, resolve workflows
│       ├── style.css              # Dashboard styling & cursor floating tooltip
│       └── india.geojson          # India state & district boundary data
├── index.html                     # JanConnect Landing Page & Role Selector
├── citizen-login.html             # Citizen login interface
├── official-login.html            # Official login interface
├── server.js                      # Express API, Qwen/Gemini AI endpoints, email service
├── package.json                   # Dependencies and scripts
└── README.md                      # Project documentation
```

---

## 📜 License
This project is open-source under the [MIT License](LICENSE).
