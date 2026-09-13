# Attendly — Minimal Attendance Tracker

> **Effortless, ultra-fast, and minimal attendance management system built for modern colleges and institutions.**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

---

## ⚡ Key Highlights

- **<30s Attendance Flow**: Mark daily classes in seconds with **[Mark All Present]**, **[Mark All Absent]**, and sticky count summaries (`38 Present · 4 Absent`).
- **"Can I Skip?" Predictive Calculator**: Mathematical projection engine computing exact maximum absences allowed or consecutive classes needed to return above requirement ($\ge 75\%$), with interactive what-if sliders.
- **Tamper-Evident Audit Trail**: Roll call history with required justification logs for any past attendance correction.
- **Roster Management & CSV Support**: Drag-and-drop CSV import with template generator, student roster filtering, and instant CSV attendance report exports.
- **Supabase Cloud Backend**: PostgreSQL DDL schema with Row Level Security (RLS) policies and in-app cloud synchronization.
- **Minimalist Linear/Notion Aesthetics**: Clean typography, light/dark themes, responsive mobile navigation, and zero dashboard clutter.

---

## 🏗️ Architecture & Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Vanilla CSS Design System with custom CSS variables (monochrome base `#FAFAFA` / `#09090B`, accent `#4F46E5`, emerald/amber/rose status indicators)
- **Icons**: `lucide-react`
- **Celebrations**: `canvas-confetti`
- **Backend Database**: Supabase PostgreSQL with RLS policies

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/nonimousmusic/attedance-tracker.git
cd attedance-tracker

# Install dependencies
npm install
```

### 3. Environment Setup (Optional for Supabase)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your Supabase project credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
*(If no credentials are provided, Attendly automatically runs in offline/local-storage demo mode with rich pre-seeded college data).*

### 4. Database Setup (Supabase)
1. Open the [Supabase SQL Editor](https://supabase.com/dashboard).
2. Copy and execute [`supabase/schema.sql`](./supabase/schema.sql).
3. In the Attendly web interface, go to **Settings** and click **Seed Supabase from Local** to populate initial courses and student records!

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 👨‍💻 User Roles & Experiences

You can switch between roles in real-time from the navigation bar:

| Role | Capabilities |
|---|---|
| **👨‍🏫 Teacher** | "Today's classes" agenda, rapid attendance marking, past lecture roll calls, audit corrections, CSV reports. |
| **👨‍🎓 Student** | Overall attendance gauge, subject progress bars, "Can I Skip?" simulator, monthly attendance calendar. |
| **👨‍💼 Admin** | Institution-wide analytics, faculty roster, course compliance monitoring, and at-risk student intervention alerts. |

---

## 📜 License

MIT License. Designed with simplicity in mind.
