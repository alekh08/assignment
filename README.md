# 📋 Team Task Manager

A full-stack collaborative task management system with role-based access control, built with **FastAPI + MongoDB + React**.

---

## 🏗️ Project Structure

```
CRUD-operations/
├── backend/
│   ├── app/
│   │   ├── controllers/        # Business logic
│   │   │   ├── auth_controller.py
│   │   │   ├── project_controller.py
│   │   │   ├── task_controller.py
│   │   │   └── dashboard_controller.py
│   │   ├── models/             # Beanie MongoDB documents
│   │   │   ├── user.py
│   │   │   ├── project.py
│   │   │   └── task.py
│   │   ├── routes/             # FastAPI routers
│   │   │   ├── auth.py
│   │   │   ├── projects.py
│   │   │   ├── tasks.py
│   │   │   └── dashboard.py
│   │   ├── schemas/            # Pydantic request/response schemas
│   │   │   ├── auth.py
│   │   │   ├── project.py
│   │   │   └── task.py
│   │   ├── middleware/
│   │   │   └── auth.py         # JWT middleware
│   │   ├── utils/
│   │   │   ├── jwt.py          # Token creation/decoding
│   │   │   └── password.py     # bcrypt hashing
│   │   ├── database.py         # MongoDB connection
│   │   └── main.py             # FastAPI app entry
│   ├── requirements.txt
│   ├── Procfile                # Railway deployment
│   ├── .env.example
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── common/
│   │   │       └── Sidebar.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ProjectsPage.jsx
│   │   │   └── ProjectDetailPage.jsx
│   │   ├── services/
│   │   │   ├── api.js           # Axios instance
│   │   │   └── services.js      # API service calls
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env
│   └── .env.example
└── README.md
```

---

## 🚀 Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy env file
copy .env.example .env
# Edit .env with your MongoDB URI and secret key

# Run development server
uvicorn app.main:app --reload --port 8000
```

Backend will be live at: **http://localhost:8000**  
Swagger docs: **http://localhost:8000/docs**

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy env file
copy .env.example .env
# Edit VITE_API_URL if backend is not on localhost:8000

# Run dev server
npm run dev
```

Frontend will be live at: **http://localhost:5173**

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017` |
| `DATABASE_NAME` | Database name | `taskmanager` |
| `SECRET_KEY` | JWT signing key | Change in production! |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime | `1440` (24h) |
| `FRONTEND_URL` | CORS allowed origin | `http://localhost:5173` |

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000` |

---

## 📡 API Documentation

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register new user |
| POST | `/auth/login` | Login, returns JWT |

**Signup Request:**
```json
{ "name": "Jane Doe", "email": "jane@example.com", "password": "secret123" }
```

**Login Response:**
```json
{ "access_token": "eyJ...", "token_type": "bearer", "user": { "id": "...", "name": "Jane Doe", "email": "jane@example.com" } }
```

### Projects (🔒 Requires JWT)

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/projects` | Create project | Any |
| GET | `/projects` | List my projects | Any |
| POST | `/projects/{id}/add-member` | Add member | Admin |
| DELETE | `/projects/{id}/remove-member` | Remove member | Admin |
| GET | `/projects/{id}/members` | List members | Member |

### Tasks (🔒 Requires JWT)

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/tasks` | Create task | Member |
| GET | `/tasks?project_id=&my_tasks=` | List tasks | Member |
| PUT | `/tasks/{id}` | Update task | Assigned/Admin |
| DELETE | `/tasks/{id}` | Delete task | Admin |

### Dashboard (🔒 Requires JWT)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Get stats summary |

**Dashboard Response:**
```json
{
  "total_tasks": 12,
  "total_projects": 3,
  "by_status": { "todo": 4, "in_progress": 5, "done": 3 },
  "overdue_count": 2,
  "overdue_tasks": [...],
  "tasks_per_user": [{ "user_id": "...", "name": "Jane", "task_count": 5 }]
}
```

---

## 🚂 Railway Deployment

### Deploy Backend

1. **Push your code** to GitHub

2. **Create a new Railway project**:  
   Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub

3. **Add MongoDB**:  
   Railway → New Service → Database → MongoDB  
   Copy the `MONGO_PUBLIC_URL` connection string

4. **Set environment variables** in Railway dashboard:
   ```
   MONGO_URI=<your-railway-mongodb-url>
   DATABASE_NAME=taskmanager
   SECRET_KEY=<generate-a-long-random-string>
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   FRONTEND_URL=<your-frontend-url>
   ```

5. **Set the root directory** to `backend` in Railway service settings

6. **Railway will auto-detect** the `Procfile`:
   ```
   web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

### Deploy Frontend

**Option A: Railway**
1. Add a second service in same project → Deploy from GitHub
2. Set root directory to `frontend`
3. Set build command: `npm run build`
4. Set start command: `npx serve dist`
5. Set env variable: `VITE_API_URL=<your-backend-railway-url>`

**Option B: Vercel (recommended for frontend)**
```bash
cd frontend
npm run build
# Upload dist/ to Vercel or connect GitHub repo
```
Set environment variable `VITE_API_URL` to your Railway backend URL.

---

## 🔐 Security Notes

- Passwords are hashed with **bcrypt** (never stored in plaintext)
- JWT tokens expire in **24 hours** by default
- **CORS** is configured to allow only your frontend origin
- All routes except `/auth/*` require a valid JWT Bearer token
- Role-based access: only **Admins** can add/remove members and delete tasks

---

## 🎨 Features

- ✅ User Authentication (signup/login with JWT)
- ✅ Role-based access (Admin / Member)
- ✅ Project creation and member management
- ✅ Task CRUD with priority and status
- ✅ Kanban board (To Do / In Progress / Done)
- ✅ Task assignment to project members
- ✅ Overdue task detection and highlighting
- ✅ My Tasks / All Tasks filter
- ✅ Dashboard with aggregated stats
- ✅ Dark-themed modern UI

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI (Python) |
| Database | MongoDB + Beanie ODM |
| Auth | JWT (PyJWT) + bcrypt |
| Frontend | React + Vite |
| HTTP Client | Axios |
| Routing | React Router v6 |
| Notifications | react-hot-toast |
| Deployment | Railway |
