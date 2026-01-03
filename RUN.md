# Commands to Run Dayflow HRMS

## Quick Start (Recommended)

Run both server and client together:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend app on http://localhost:3000

---

## Alternative: Run Separately

### Terminal 1 - Backend Server
```bash
cd server
npm run dev
```

### Terminal 2 - Frontend Client
```bash
cd client
npm start
```

---

## First Time Setup

If you haven't installed dependencies yet:

```bash
# Install all dependencies (root, server, and client)
npm run install-all
```

Or install manually:
```bash
# Root dependencies
npm install

# Server dependencies
cd server
npm install

# Client dependencies
cd client
npm install
```

---

## Prerequisites Check

Before running, make sure:

1. **MongoDB is running:**
   - Local MongoDB: `mongodb://localhost:27017`
   - Or MongoDB Compass connected
   - Or MongoDB Atlas connection string in `.env`

2. **Environment file exists:**
   - `server/.env` file should exist
   - If not, copy from `server/.env.example`

---

## Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health

---

## Stop the Application

Press `Ctrl + C` in the terminal where it's running.

---

## Troubleshooting Commands

### Check if ports are in use:
```powershell
# Windows PowerShell
Get-NetTCPConnection -LocalPort 3000
Get-NetTCPConnection -LocalPort 5000
```

### Check Node processes:
```powershell
Get-Process node
```

### Kill Node processes (if needed):
```powershell
Stop-Process -Name node -Force
```

### Check MongoDB connection:
```powershell
# Test MongoDB connection
mongosh mongodb://localhost:27017
```

