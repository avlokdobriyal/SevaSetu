# SevaSetu

**SevaSetu** is a comprehensive civic grievance management platform designed to bridge the gap between citizens and municipal authorities. It features a complete role-based workflow for reporting, tracking, and resolving municipal issues like sanitation, electricity, water supply, and road maintenance.

## 🌟 Key Features

* **Citizen Portal**: Easily file grievances with photo uploads, view tracking timelines, and rate workers once the issue is solved.
* **Worker Dashboard**: Workers can view their assigned tasks, update statuses, and get exact directions using an interactive map/location viewer.
* **Ward Member Dashboard**: Oversee ward-level issues, assign tasks to workers by specialization, and monitor grievance resolutions.
* **Mayor & Admin Dashboard**: City-wide analytical views with filtering to check total, solved, and pending complaints across different wards.
* **Public Ratings System**: A transparent, global rating page tracking the performance of ward members and their workers based on resolved issues.

## 🛠️ Tech Stack

* **Frontend**: React (Vite), Tailwind CSS, Lucide-React
* **Backend**: Node.js, Express.js
* **Database**: MongoDB (Mongoose)

---

## 🚀 How to Setup and Run Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/) installed on your machine.

### 1. Database Setup
Ensure your local MongoDB instance is running (usually on `mongodb://localhost:27017`). 

### 2. Backend Setup
Navigate to the backend directory, install dependencies, and start the server.
```bash
cd backend
npm install

# Create a .env file (optional, defaults to local dev settings)
# Example: 
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/sevasetu
# JWT_SECRET=your_jwt_secret

# (Optional) Seed the database with dummy users and data
node seed.js

# Start the backend server
npm run dev
```
*The backend should now be running on `http://localhost:5000`.*

### 3. Frontend Setup
Open a new terminal window, navigate to the frontend directory, install dependencies, and start the React app.
```bash
cd frontend
npm install

# Start the frontend development server
npm run dev
```
*The frontend should now be accessible on `http://localhost:5173`.*

## 👥 Default Seed Accounts (For Testing)
If you ran the `seed.js` script, you can log in with `password123` using:
* **Admin**: `admin@sevasetu.gov`
* **Mayor**: `mayor@sevasetu.gov`
* **Citizen**: `citizen1@example.com`
* **Ward Member**: `member0@sevasetu.gov` (Ward 1)
* **Worker**: `workerA0@sevasetu.gov` (Ward 1 - Electricity)
