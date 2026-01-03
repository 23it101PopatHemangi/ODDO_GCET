# Quick Setup Guide

## Step 1: Install Dependencies

Run this command from the root directory to install all dependencies:

```bash
npm run install-all
```

Or manually:

```bash
# Root
npm install

# Server
cd server
npm install

# Client
cd ../client
npm install
```

## Step 2: Setup MongoDB

### Option A: Local MongoDB
1. Make sure MongoDB is installed and running
2. MongoDB should be accessible at `mongodb://localhost:27017`

### Option B: MongoDB Compass
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. The database `dayflow-hrms` will be created automatically

### Option C: MongoDB Atlas (Cloud)
1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster and get your connection string
3. Update the `.env` file with your Atlas connection string

## Step 3: Configure Environment Variables

1. Navigate to the `server` folder
2. Create a `.env` file (copy from `.env.example` if it exists)
3. Add the following:

```env
MONGODB_URI=mongodb://localhost:27017/dayflow-hrms
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

**Important:** Change `JWT_SECRET` to a random secure string in production!

## Step 4: Start the Application

### Option A: Run Both Together (Recommended)
From the root directory:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend app on http://localhost:3000

### Option B: Run Separately

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

## Step 5: Access the Application

1. Open your browser and go to: http://localhost:3000
2. Register a new account
3. Choose your role:
   - **Admin** - Full access to everything
   - **HR** - Can manage employees, departments, attendance, leaves, payroll
   - **Manager** - Can view reports and approve leaves
   - **Employee** - Limited access to own data

## Troubleshooting

### Port 3000 or 5000 already in use?
- Kill the process using the port, or
- Change the port in `.env` (server) or `package.json` (client)

### MongoDB connection error?
- Check if MongoDB is running
- Verify connection string in `.env`
- Make sure MongoDB Compass is connected

### Module not found errors?
- Delete `node_modules` folders
- Delete `package-lock.json` files
- Run `npm install` again in each directory

### CORS errors?
- Make sure backend is running on port 5000
- Check API URL in `client/src/context/AuthContext.js`

## First Steps After Setup

1. **Create an Admin Account**
   - Register with role "admin"
   - This gives you full access

2. **Create Departments**
   - Go to Departments page
   - Add your company departments

3. **Add Employees**
   - Go to Employees page
   - Add employee records
   - Assign them to departments

4. **Test Features**
   - Try check-in/check-out
   - Request a leave
   - Generate payroll records
   - View reports

## Production Deployment

Before deploying to production:

1. Change `JWT_SECRET` to a strong random string
2. Set `NODE_ENV=production`
3. Update MongoDB connection string
4. Build the React app: `cd client && npm run build`
5. Use a process manager like PM2 for the server
6. Set up proper CORS for your domain
7. Use environment variables for all sensitive data

## Need Help?

Check the main README.md for detailed documentation and API endpoints.

