# 🏥 SmartCare Flow - AI-Driven Hospital Operations System

**Hackathon Project**: Intelligent scheduling and queue optimization for hospital operations

---

## 🎯 Project Overview

SmartCare Flow is an **input-driven hospital operations management system** that uses AI-powered scheduling agents to optimize:
- Doctor availability management
- Appointment booking
- Walk-in patient queues
- Emergency prioritization
- Real-time workload balancing

### ✨ Key Features

✅ **100% Input-Driven** - No hardcoded behavior, all decisions based on real-time data  
✅ **Explainable AI** - Every decision logged with transparent reasoning  
✅ **Rule-Based Logic** - Deterministic, auditable decision-making  
✅ **Staff Override** - Human judgment always takes priority  
✅ **Real-Time Optimization** - Dynamic queue management  
✅ **Emergency Handling** - Instant prioritization protocols  

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (React)                   │
│              Lovable UI / Emergent                   │
└───────────────────┬─────────────────────────────────┘
                    │ REST API
┌───────────────────▼─────────────────────────────────┐
│              FastAPI Backend (Python)                │
│  ┌──────────────────────────────────────────────┐  │
│  │        AI Agent (Decision Engine)             │  │
│  │  • Observation  • Logic  • Recommendations    │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │          Services (Business Logic)            │  │
│  │  • Doctors  • Appointments  • Queue           │  │
│  └──────────────────────────────────────────────┘  │
└───────────────────┬─────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────┐
│            SQLite Database (Persistent)              │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+ (for frontend)
- Git

### Backend Setup

```bash
# 1. Clone repository
git clone <your-repo>
cd smartcare-flow/backend

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Initialize database
python -c "from core.database import init_database; init_database()"

# 5. Run server
python app.py

# Server runs at: http://localhost:8000
```

### Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Frontend runs at: http://localhost:5173
```

---

## 📂 Project Structure

```
smartcare-flow/
│
├── backend/
│   ├── app.py                    # FastAPI entry point
│   ├── core/
│   │   ├── config.py             # All thresholds & settings
│   │   ├── database.py           # SQLite manager
│   │   └── logger.py             # Structured logging
│   │
│   ├── ai_agent/                 # 🤖 AI DECISION ENGINE
│   │   ├── agent.py              # Main controller
│   │   ├── observation.py        # State reader
│   │   ├── decision_logic.py     # Rule-based logic
│   │   ├── recommendations.py    # Suggestion generator
│   │   └── audit_log.py          # Decision logging
│   │
│   ├── routes/                   # REST API endpoints
│   │   ├── doctors.py
│   │   ├── appointments.py
│   │   ├── walkins.py
│   │   ├── emergency.py
│   │   ├── availability.py
│   │   ├── ai_logs.py
│   │   └── reports.py
│   │
│   ├── services/                 # Business logic
│   │   ├── doctor_service.py
│   │   ├── appointment_service.py
│   │   ├── queue_service.py
│   │   └── emergency_service.py
│   │
│   ├── models/                   # Data schemas
│   └── data/                     # SQLite database
│
└── frontend/                     # React UI (Lovable)
```

---

## 🤖 AI Agent Workflow

```
User Input (Doctor Setup / Appointment / Walk-in)
   ↓
System State Update (Database)
   ↓
AI Observe (queues, loads, delays)
   ↓
AI Analyze (apply thresholds & rules)
   ↓
AI Decide (generate recommendation)
   ↓
Staff Accept / Override
   ↓
AI Log Decision (audit trail)
```

### Decision Logic Rules

1. **Appointment Assignment**
   - Find doctors in same department
   - Select least busy (lowest queue)
   - Detect conflicts if queue > threshold
   - Never force assignment if all overloaded

2. **Walk-in Processing**
   - Assign to least busy doctor
   - High priority → insert in middle of queue
   - Normal priority → end of queue
   - Suggest redistribution if overload detected

3. **Emergency Protocol**
   - Immediate priority (position 1)
   - Same department preferred
   - Cross-department if necessary
   - Lock from rescheduling

4. **Overload Detection**
   - Queue length > HIGH_THRESHOLD
   - Suggest redistribution to available doctors
   - Only for NORMAL priority patients
   - Staff approval required

---

## 📡 API Endpoints

### Doctors
```
POST   /api/doctors                 # Create doctor
GET    /api/doctors                 # List all doctors
GET    /api/doctors/{id}            # Get doctor details
PATCH  /api/doctors/{id}            # Update doctor
DELETE /api/doctors/{id}            # Delete doctor
GET    /api/doctors/{id}/queue      # Get current queue
GET    /api/doctors/{id}/workload   # Get workload analysis
```

### Appointments
```
POST   /api/appointments/book       # Book appointment (AI-optimized)
GET    /api/appointments            # List appointments
GET    /api/appointments/{id}       # Get appointment
PATCH  /api/appointments/{id}       # Update appointment
POST   /api/appointments/{id}/staff-action  # Record staff decision
DELETE /api/appointments/{id}       # Cancel appointment
```

### Walk-ins
```
POST   /api/walkins/register        # Register walk-in
GET    /api/walkins                 # List walk-ins
PATCH  /api/walkins/{id}            # Update status
```

### Emergency
```
POST   /api/emergency/register      # Register emergency
GET    /api/emergency               # List emergencies
```

### AI Logs
```
GET    /api/ai-logs                 # View all AI decisions
GET    /api/ai-logs/{id}            # Get specific decision
GET    /api/ai-logs/stats           # AI performance metrics
```

---

## 🎨 UI Screens (Frontend Integration)

1. **Dashboard** → `/api/dashboard` - KPIs, charts, system overview
2. **Doctor Setup** → `/api/doctors` - Admin panel for doctor management
3. **Appointments** → `/api/appointments` - Booking interface
4. **Walk-ins** → `/api/walkins` - Registration desk
5. **Emergency** → `/api/emergency` - Emergency queue
6. **Availability** → `/api/availability` - Real-time doctor status
7. **AI Logs** → `/api/ai-logs` - Explainability dashboard
8. **Reports** → `/api/reports` - Analytics & insights

---

## 🧪 Testing

```bash
# Run all tests
pytest

# Test specific module
pytest tests/test_ai_agent.py

# Test with coverage
pytest --cov=. --cov-report=html
```

---

## 🎯 Hackathon Demo Script

### 1. Setup Demo (2 min)
- Show clean dashboard
- Add 3-4 doctors in different departments
- Set shift timings

### 2. Normal Flow (3 min)
- Book 2-3 appointments → Show AI assignment
- Register walk-in → Show queue update
- Demonstrate AI log transparency

### 3. Overload Scenario (2 min)
- Add 8+ walk-ins to one doctor
- Show AI detecting overload
- Display redistribution recommendation
- Accept recommendation → Show queue rebalance

### 4. Emergency Handling (2 min)
- Register emergency case
- Show instant prioritization
- Demonstrate protocol activation in logs

### 5. Analytics (1 min)
- Show before/after wait times
- Display workload balance charts
- Highlight AI efficiency metrics

---

## 🔧 Configuration

Edit `core/config.py` to customize:

```python
# Queue thresholds
QUEUE_THRESHOLD_LOW = 3
QUEUE_THRESHOLD_MEDIUM = 5
QUEUE_THRESHOLD_HIGH = 8

# Time settings
AVG_CONSULTATION_TIME = 15  # minutes
EMERGENCY_RESPONSE_TIME = 5  # minutes

# Departments
DEPARTMENTS = [
    "General Medicine",
    "Cardiology",
    "Orthopedics",
    # Add more...
]
```

---

## 🏆 Hackathon Judging Points

✅ **Technical Excellence**
- Clean architecture with separation of concerns
- Scalable, maintainable codebase
- Proper error handling and logging

✅ **AI/ML Innovation**
- Novel rule-based scheduling agent
- Explainable AI with full audit trail
- Real-time adaptive decision-making

✅ **Real-World Impact**
- Solves actual hospital pain points
- Staff-friendly with override capability
- Reduces patient wait times

✅ **User Experience**
- Intuitive UI for hospital staff
- Real-time updates
- Clear AI recommendations

✅ **Presentation Quality**
- Live demo with realistic scenarios
- Clear explanation of AI logic
- Visual analytics and metrics

---

## 📊 Performance Metrics

Track system performance:
- Average wait time reduction
- Doctor workload balance
- Emergency response time
- AI recommendation acceptance rate
- System uptime and reliability

---

## 🛡️ Safety & Ethics

- **No Medical Decisions**: System handles scheduling only
- **Human Override**: Staff can override all AI suggestions
- **Transparent Logs**: All decisions auditable
- **Data Privacy**: No sensitive medical data stored
- **Fail-Safe Design**: System degrades gracefully

---

## 🚢 Deployment

### Docker
```bash
docker build -t smartcare-flow .
docker run -p 8000:8000 smartcare-flow
```

### Cloud (Render / Railway / Fly.io)
```bash
# Already includes deployment configs
# Just connect your git repo
```

---

## 📄 License

MIT License - Free for educational and commercial use

---

## 👥 Team

Your team details here

---

## 🙏 Acknowledgments

Built for [Hackathon Name] 2025

---

## 📞 Support

For questions or issues:
- Email: your-email@example.com
- GitHub Issues: [link]

---

**🎉 Ready to win the hackathon! Good luck! 🏆**