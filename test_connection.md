# Connection Test Guide

## Configuration Status ✅

The frontend and backend are configured to connect:

### Frontend Configuration:
- **Environment file**: `frontend/.env.local` ✅
- **API URL**: `http://localhost:8000` ✅
- **API Prefix**: `/api` ✅
- **Frontend Port**: `8080` (from vite.config.ts)

### Backend Configuration:
- **Backend Port**: `8000` ✅
- **CORS Origins**: Includes `http://localhost:8080` ✅
- **API Routes**: All prefixed with `/api` ✅

## To Test the Connection:

### Step 1: Start the Backend
```bash
cd backend
python main.py
# or
python app.py
```

You should see:
```
🚀 Starting SmartCare Flow Backend...
✅ Database initialized
🤖 AI Agent ready
🏥 System operational
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### Step 2: Start the Frontend (in a new terminal)
```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:8080/
```

### Step 3: Test the Connection

1. **Test Backend Health Check**:
   Open browser: http://localhost:8000/health
   Should return: `{"status": "healthy", "database": "connected", ...}`

2. **Test from Frontend Console**:
   Open browser DevTools (F12) → Console tab
   Run:
   ```javascript
   fetch('http://localhost:8000/api/dashboard/stats')
     .then(r => r.json())
     .then(console.log)
     .catch(console.error)
   ```

3. **Check Network Tab**:
   - Open DevTools → Network tab
   - Navigate the frontend app
   - Look for requests to `http://localhost:8000/api/*`
   - Status should be 200 (not CORS errors)

## Troubleshooting:

- **CORS Error**: Make sure backend is running and CORS includes port 8080
- **404 Error**: Check that backend routes are registered with `/api` prefix
- **Connection Refused**: Verify backend is running on port 8000
- **Environment Variable Not Found**: Restart Vite dev server after creating `.env.local`

