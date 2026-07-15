# Task & Project Tracker

A minimal full-stack task/project tracker with an Express + TypeScript + MongoDB backend and a React + TypeScript + Vite frontend.

## Project Structure

```
.
├── backend/   # Express API (TypeScript, Mongoose, Zod)
└── frontend/  # React UI (TypeScript, Vite)
```

## Prerequisites

- [Node.js](https://nodejs.org/) v18+ (tested on v22)
- npm
- A MongoDB instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/ChathurK/Task-Project-Tracker-API-minimal-UI.git
cd Task-Project-Tracker-API-minimal-UI
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` and set your MongoDB connection string:

```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/tasktracker
```

Start the backend in development mode:

```bash
npm run dev
```

The API will be available at `http://localhost:5000` (or the `PORT` you configured).

### 3. Frontend

In a separate terminal:

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `frontend/.env` and point it at the backend API:

```
VITE_API_URL=http://localhost:5000
```

Start the frontend dev server:

```bash
npm run dev
```

Vite will print the local URL (typically `http://localhost:5173`).

Other useful scripts:

## Running the App

1. Start MongoDB (or ensure your Atlas cluster is reachable).
2. Start the backend: `cd backend && npm run dev`
3. Start the frontend: `cd frontend && npm run dev`
4. Open the frontend URL in your browser.
