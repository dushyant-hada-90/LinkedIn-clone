# LinkedIn Clone (Full-Stack MERN)

A full-stack LinkedIn-like social networking application built to practice real-world backend architecture, authentication, and scalable React UI patterns. This project focuses on **clean separation of concerns**, **industry-standard folder structure**, and **production-style workflows**.

---

## Purpose

This repository is a learning-driven but production-oriented project intended to:
- Design and implement a real-world social networking backend using Node.js and Express.
- Build a modular, scalable React frontend with clear page/component separation.
- Practice authentication, media handling, and user-to-user interactions similar to LinkedIn.
- Demonstrate architectural decisions clearly for reviewers and interviewers.

---

## Tech Stack

### Frontend
- React (Vite)
- Context API for global state management
- Axios for API communication
- CSS for styling

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT-based authentication
- Cloudinary for image/media storage
- Multer for file uploads

---

## Architecture Overview

The project follows a **frontend–backend separation** with a clear, maintainable structure.

### Backend Architecture

- `models/` — Mongoose schemas (User, Post, Connection)
- `controllers/` — Business logic isolated from routing
- `routes/` — Thin routing layer mapping endpoints to controllers
- `middlewares/` — Authentication and file-upload middleware
- `config/` — Database connection, JWT helpers, Cloudinary setup

This structure ensures the backend remains modular, testable, and easy to extend.

### Frontend Architecture

- `pages/` — Route-level components (Home, Profile, Network, Login, Signup)
- `components/` — Reusable UI components
- `context/` — Global state (authentication and user data)
- `assets/` — Static images and icons

The frontend uses a **page-driven architecture** with centralized global state to avoid excessive prop drilling.

---

## Key Features

- User authentication with JWT and protected routes
- User profile creation and editing
- Post creation with image uploads
- Connection requests (send / accept / reject)
- Persistent login using cookies
- Modular backend and scalable frontend structure

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (local or cloud)
- Cloudinary account (for media uploads)

### Installation

1. Clone the repository
```bash
git clone <repo-url>
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Configure environment variables
- Create a `.env` file in both `backend/` and `frontend/` as required
- Never commit secrets to version control

5. Run the application
```bash
# backend
npm run dev

# frontend
npm run dev
```

---

## Project Status

This project is under active development and is primarily intended for **learning, experimentation, and portfolio demonstration**.

---

## Security Notes

- Do not commit `.env` files or credentials
- Follow best practices for authentication and API security
- Rate-limiting and validation should be added before production use

---

## Contact

For questions, feedback, or improvements, feel free to open an issue or reach out to the repository maintainer.
