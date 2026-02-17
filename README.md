# 🏥 SmartCare Flow  
### AI-Powered Hospital Queue & Appointment Management System

SmartCare Flow is an intelligent healthcare workflow system designed to optimize hospital operations by managing patient queues, appointments, walk-ins, and emergency prioritization using AI-driven decision logic.

---

## 🚀 Features

- 📅 Online Appointment Booking
- 🚶 Walk-in Patient Registration
- 🚑 Emergency Case Prioritization
- 🧠 AI-based Queue Optimization
- 👨‍⚕️ Doctor Availability Management
- 📊 Real-time Dashboard & Analytics
- 📝 AI Decision Logs
- 🔁 Automated Queue Adjustment
- 📉 Workload Monitoring System

---

## 🧠 AI Decision Engine

The system includes an AI Agent that:

- Monitors queue load in real-time
- Prioritizes emergency patients dynamically
- Recommends optimal patient scheduling
- Adjusts appointment flow based on doctor availability
- Logs decision-making for audit and transparency

---

## 🏗️ Tech Stack

| Layer        | Technology            |
|-------------|------------------------|
| Frontend     | React.js + TypeScript  |
| Backend      | Flask (Python)         |
| Database     | SQLite / SQLAlchemy    |
| AI Logic     | Custom Rule Engine     |
| API          | RESTful APIs           |
| Deployment   | Docker + Nginx         |
| DevOps       | GitHub Actions (CI/CD) |

---

## 📁 Project Structure

```
smartcare-flow/
│
├── backend/
├── frontend/
├── alembic/
├── deployment/
├── demo/
├── docs/
├── scripts/
├── .github/
├── .gitignore
├── alembic.ini
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/vinayak-7569/smartcare-flow.git
cd smartcare-flow
```

---

### 2️⃣ Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

---

### 3️⃣ Run Backend Server

```bash
python main.py
```

---

### 4️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🐳 Docker Deployment

```bash
cd deployment
docker-compose up --build
```

---

## 🔐 Environment Variables

Create a `.env` file inside `backend/` and configure the following:

```
DATABASE_URL=sqlite:///data/smartcare.db
SECRET_KEY=your_secret_key
```

---

## 📊 Dashboard Modules

- Doctor Setup
- Appointment Queue
- Emergency Queue
- AI Decision Logs
- Walk-In Registration
- Reports & Analytics

---

## 📌 Use Case

SmartCare Flow is suitable for:

- Clinics
- Hospitals
- Diagnostic Centers
- Healthcare Startups

It helps reduce patient wait times and improves operational efficiency.

---

## 📄 License

This project will be licensed under the MIT License.

---

## 👨‍💻 Author

**Vinayak**  
Machine Learning Engineer Aspirant  
GitHub: https://github.com/vinayak-7569

---

## ⭐ Contribute

Feel free to fork this repository and submit pull requests to improve the system.

