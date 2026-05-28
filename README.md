# 🪞 Myntra AI Style Mirror
### Virtual Try-On & Fit Prediction Platform

> An AI-powered fashion platform enabling users to virtually try on clothing and receive personalised fit predictions — built as a submission for the **Adobe India Hackathon**.

---

## 📌 Overview

Myntra AI Style Mirror is a full-stack web application that reimagines the online shopping experience. Users interact with an AI-driven interface to visualise how garments look on a model and receive size/fit recommendations based on body measurements — directly tackling the ~30% return rate caused by online sizing uncertainty.

---

## 🚀 Features

- 🧍 **Virtual Try-On** — AI-powered overlay of clothing items on user/model images
- 📐 **Fit Prediction Engine** — ML-based fit scoring from body measurements (`fit-ml-engine.js`)
- 🔐 **JWT Authentication** — Secure user registration, login, and protected route access
- 📧 **Email Notifications** — Nodemailer OTP/verification flows via `server.js`
- ⚡ **REST API** — Modular API layer under `/api` with Express.js route handling

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, CSS3, JavaScript |
| **Backend** | Node.js, Express.js (`app.js` / `server.js`) |
| **ML / AI Engine** | Custom fit prediction logic (`fit-ml-engine.js`) |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs |
| **Email Service** | Nodemailer |
| **Environment Config** | dotenv |
| **Utilities** | uuid, cors |

---

## 📂 Project Structure

```
myntra-ai-style-mirror/
├── app.js                        # Express app config & middleware setup
├── fit-ml-engine.js              # ML fit prediction logic
├── myntra-genai-enhanced.jsx     # Main React UI component
├── index.html                    # HTML entry point for Vite
├── styles.css                    # Global styles
├── vite.config.js                # Vite build config
├── test-api.js                   # API test runner
├── api/                          # API route handlers
├── assets/                       # Static model & product images
│   ├── model_wearing_dress.png
│   ├── model_wearing_kurta.png
│   ├── product_dress_floral.png
│   ├── product_kurta_green.png
│   └── user_model.png
├── dist/                         # Production build output (Vite)
├── package.json
└── .gitignore
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js v16+
- npm v8+

### Installation

```bash
# Clone the repository
git clone https://github.com/Raghvendrasingh-CS/Re-Imagine-Mobile-App.git
cd Re-Imagine-Mobile-App

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your values (see Environment Variables section below)
```

### Running the App

```bash
# Development mode (starts Express + Vite dev server)
npm run dev

# Build frontend for production
npm run build

# Preview production build
npm run preview
```

### Running Tests

```bash
# API tests
npm test

# Integration tests
npm run test:integration
```

---

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
JWT_SECRET=your_jwt_secret_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
NODE_ENV=development
```

---

## 🏆 Context

Built for the **Adobe India Hackathon** — cleared Round 1 competitive technical evaluation. The platform addresses a measurable e-commerce problem: roughly 30% of online fashion purchases are returned due to poor size and fit confidence.

---

## 👤 Author

**Raghvendra Singh** — B.Tech CSE, IIIT Kota (2024–2028)
- GitHub: [@Raghvendrasingh-CS](https://github.com/Raghvendrasingh-CS)
- LinkedIn: [linkedin.com/in/raghvendra-singh](https://linkedin.com/in/raghvendra-singh)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
