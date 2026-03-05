# SkillMentor Platform

SkillMentor is a comprehensive mentorship booking and management system designed to connect students with expert mentors. The platform facilitates seamless session scheduling, payment confirmation, and professional profile management.

## 🚀 Features

### **Admin Portal**
- **Dashboard Overview**: Track platform activity and manage all entities.
- **Booking Management**: View all sessions, confirm payments, and mark sessions as complete.
- **Mentor Onboarding**: Create and manage professional mentor profiles.
- **Subject Management**: Categorize mentorship opportunities by creating and updating subjects.
- **Session Control**: Add meeting links (Zoom/Google Meet) to confirmed bookings.

### **Mentor Discovery**
- **Dynamic Profiles**: Detailed mentor profiles showcasing skills, experience, and reviews.
- **Search & Filter**: Find mentors by name or subject expertise.
- **Real-time Stats**: Track mentor enrollment counts and positive review percentages.

### **Student Experience**
- **Session Enrollment**: Seamlessly book sessions with preferred mentors.
- **Reviews & Ratings**: Provide feedback on sessions to ensure quality across the platform.
- **Personal Dashboard**: Track upcoming and past sessions.

---

## 🛠️ Tech Stack

### **Backend**
- **Framework**: Spring Boot 4.0.0 (Java 17)
- **Database**: PostgreSQL (Supabase/Local)
- **Caching**: Redis (Distributed caching support)
- **Security**: Spring Security + JWT (Auth0 Integration)
- **API Documentation**: SpringDoc OpenAPI 3 (Swagger UI)
- **Validation**: Jakarta Validation + Hibernate Validator
- **Utilities**: Lombok, ModelMapper, Jackson

### **Frontend**
- **Framework**: React 19 + Vite 7
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Authentication**: Clerk (Role-based access control)
- **UI Components**: Shadcn UI + Radix UI
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **Routing**: React Router 7

---

## 🏁 Getting Started

### **Local Development Setup**

#### **1. Clone the Repository**
```bash
git clone <repository-url>
cd skillmentor-platform
```

#### **2. Backend Setup**
Navigate to the backend directory and build the project using Maven.
```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```
*The API will be available at `http://localhost:8081`.*

#### **3. Frontend Setup**
Navigate to the frontend directory and install dependencies.
```bash
cd frontend
npm install
npm run dev
```
*The app will be available at `http://localhost:5173`.*

---

## 🔑 Environment Variables

### **Backend (`backend/src/main/resources/application.properties`)**
| Variable | Description | Default |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | `jdbc:postgresql://localhost:5432/skill_mentor_v2` |
| `DB_USERNAME` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |
| `PORT` | Server port | `8081` |

### **Frontend (`frontend/.env`)**
| Variable | Description |
| :--- | :--- |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk Publishable Key for Auth |
| `VITE_API_BASE_URL` | Backend API URL (e.g., `http://localhost:8081`) |

---

## 📑 API Documentation

The backend service includes built-in Swagger documentation for easy API exploration.

- **Swagger UI**: [http://localhost:8081/swagger-ui/index.html](http://localhost:8081/swagger-ui/index.html)
- **OpenAPI Spec**: `http://localhost:8081/v3/api-docs`

---

## 🌐 Deployed Links
- **Frontend**: [Link Coming Soon]
- **Backend Swagger**: [Link Coming Soon]

---

## 📁 Project Structure

```text
skillmentor-platform/
├── backend/                # Spring Boot Service
│   ├── src/main/java/      # Java Source Code
│   ├── src/main/resources/ # application.properties & static assets
│   └── pom.xml             # Maven Dependencies
├── frontend/               # React Vite Application
│   ├── src/components/     # Reusable UI Components
│   ├── src/pages/          # Main Application Views
│   ├── src/lib/            # Utility functions (utils, types)
│   ├── package.json        # NPM Dependencies
│   └── tailwind.config.js  # Styling Configuration
└── README.md               # Project Documentation
```
