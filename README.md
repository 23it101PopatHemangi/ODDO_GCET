# Dayflow HRMS - Human Resource Management System

A comprehensive Human Resource Management System built with React.js, Tailwind CSS, Node.js, Express.js, and MongoDB.

# ODDO GCET Project

## 📸 Output Screenshots

### Output 1
![Employee Dashboard](OUTPUTS/WhatsApp%20Image%202026-01-03%20at%205.01.28%20PM.jpeg)

### Output 2
![Employee's Profile](OUTPUTS/WhatsApp%20Image%202026-01-03%20at%205.02.19%20PM.jpeg)

### Output 3
![Sign in](OUTPUTS/WhatsApp%20Image%202026-01-03%20at%205.08.01%20PM.jpeg)

### Output 4
![Admin Dashboard](OUTPUTS/WhatsApp%20Image%202026-01-03%20at%205.09.45%20PM.jpeg)

### Output 5
![Leaves](OUTPUTS/WhatsApp%20Image%202026-01-03%20at%205.10.38%20PM.jpeg)

## Features

- **Authentication & Authorization**
  - User registration and login
  - Role-based access control (Admin, HR, Manager, Employee)
  - JWT-based authentication

- **Employee Management**
  - Add, edit, and delete employees
  - Employee profile management
  - Search and filter employees
  - Employee status tracking

- **Department Management**
  - Create and manage departments
  - Assign managers to departments
  - Track department budgets and locations

- **Attendance Management**
  - Check-in/Check-out functionality
  - Daily and weekly attendance tracking
  - Attendance status (Present, Absent, Late, Half-day, On-leave)
  - Working hours and overtime calculation

- **Leave Management**
  - Request leave (Sick, Vacation, Personal, Maternity, Paternity, etc.)
  - Leave approval workflow
  - Leave status tracking
  - Leave history

- **Payroll Management**
  - Generate payroll records
  - Calculate allowances and deductions
  - Overtime and bonus calculations
  - Monthly payroll processing

- **Reports & Analytics**
  - Attendance reports
  - Leave reports
  - Payroll reports
  - Department-wise analytics
  - Visual charts and graphs

## Tech Stack

### Frontend
- React.js 18
- Tailwind CSS 3
- React Router DOM
- Axios
- Recharts (for charts)
- React Icons

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs (password hashing)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher) or MongoDB Atlas
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dayflow-hrms
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```
   ```


5. **Run the application**
   
   From the root directory:
   ```bash
   npm run dev
   ```
   
   This will start both the server (port 5000) and client (port 3000) concurrently.

   Or run them separately:
   
   **Terminal 1 (Server):**
   ```bash
   cd server
   npm run dev
   ```
   
   **Terminal 2 (Client):**
   ```bash
   cd client
   npm start
   ```

## Default Access

After starting the application:

1. Navigate to `http://localhost:3000`
2. Register a new account with role "admin" or "hr" for full access
3. Or register as "employee" for limited access

## Project Structure

```
dayflow-hrms/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context (Auth)
│   │   ├── pages/          # Page components
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # Express backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Auth middleware
│   ├── index.js            # Server entry point
│   └── package.json
└── package.json           # Root package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get single employee
- `POST /api/employees` - Create employee (Admin/HR only)
- `PUT /api/employees/:id` - Update employee (Admin/HR only)
- `DELETE /api/employees/:id` - Delete employee (Admin/HR only)

### Departments
- `GET /api/departments` - Get all departments
- `GET /api/departments/:id` - Get single department
- `POST /api/departments` - Create department (Admin/HR only)
- `PUT /api/departments/:id` - Update department (Admin/HR only)
- `DELETE /api/departments/:id` - Delete department (Admin only)

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance/checkin` - Check in
- `POST /api/attendance/checkout` - Check out
- `POST /api/attendance` - Create attendance (Admin/HR only)
- `PUT /api/attendance/:id` - Update attendance (Admin/HR only)

### Leaves
- `GET /api/leaves` - Get leave requests
- `POST /api/leaves` - Create leave request
- `PUT /api/leaves/:id` - Approve/Reject leave (Admin/HR/Manager only)
- `DELETE /api/leaves/:id` - Delete leave request

### Payroll
- `GET /api/payroll` - Get payroll records
- `POST /api/payroll` - Create payroll (Admin/HR only)
- `PUT /api/payroll/:id` - Update payroll (Admin/HR only)
- `DELETE /api/payroll/:id` - Delete payroll (Admin/HR only)

### Reports
- `GET /api/reports/dashboard` - Dashboard statistics
- `GET /api/reports/attendance` - Attendance report
- `GET /api/reports/leaves` - Leave report
- `GET /api/reports/payroll` - Payroll report
- `GET /api/reports/departments` - Department report

## Features in Detail

### Role-Based Access Control
- **Admin**: Full access to all features
- **HR**: Can manage employees, departments, attendance, leaves, and payroll
- **Manager**: Can view reports and approve leaves
- **Employee**: Can view own profile, attendance, leaves, and payroll

### Security
- Password hashing with bcryptjs
- JWT token-based authentication
- Protected routes on both frontend and backend
- Input validation

## Development

### Adding New Features
1. Create model in `server/models/`
2. Create routes in `server/routes/`
3. Add route to `server/index.js`
4. Create page component in `client/src/pages/`
5. Add route to `client/src/App.js`

### Styling
The project uses Tailwind CSS with a light, modern color scheme. All components use consistent styling with:
- Light background gradients
- Rounded corners
- Shadow effects
- Responsive design

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in `.env` file
- Verify MongoDB Compass connection

### Port Already in Use
- Change PORT in server `.env` file
- Or kill the process using the port

### CORS Errors
- Ensure server is running on port 5000
- Check API base URL in `client/src/context/AuthContext.js`

## License

This project is open source and available under the MIT License.

## Support

For issues and questions, please create an issue in the repository.






