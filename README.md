# CaseX 🔎

## Digital Crime Scene Investigation Platform

> **Every Detail Matters.**

CaseX is an interactive digital crime scene investigation platform designed to provide a modern and immersive interface for exploring fictional investigation cases.

The platform allows investigators to explore multiple cases, review evidence, examine suspects and witnesses, reconstruct timelines, monitor investigation progress, analyze CCTV information, review forensic findings, and connect investigation details through an interactive React-based interface.

CaseX combines problem-solving and logical investigation with modern front-end development concepts to create an engaging digital investigation experience.

---

## 👥 Team

| Member | Role |
|---|---|
| **Mayank Valecha** | Front-End Development |
| **Pulkit Gupta** | Front-End Development |

**Course:** Front-End Engineering-II  
**Evaluation:** Evaluation 1

---

## 🎯 Project Objective

The objective of CaseX is to demonstrate how modern front-end technologies can be used to create an interactive digital investigation environment.

The project focuses on:

- Structured HTML
- Modern CSS styling
- JavaScript / TypeScript interactions
- DOM concepts
- React components
- JSX / TSX
- Props
- State management
- `useState`
- `useEffect`
- Event handling
- Responsive user interfaces
- Reusable components
- Search and filtering
- Local Storage

---

## 🔍 Investigation Workflow

The CaseX investigation process follows this general flow:

```text
Landing Page
      ↓
Case Library
      ↓
Select Case
      ↓
Investigation Dashboard
      ↓
Crime Scene
      ↓
Evidence Locker
      ↓
Suspect Analysis
      ↓
Witness Interviews
      ↓
Timeline Investigation
      ↓
CCTV Surveillance
      ↓
Forensics Lab
      ↓
Detective Board
      ↓
AI Deduction Interface
      ↓
Investigation Conclusion
```

The investigator must examine and connect different pieces of information before reaching a conclusion.

---

# ✨ Features

## 🏠 Landing Page

A modern introduction to the CaseX investigation platform.

Features include:

- CaseX branding
- Investigation overview
- System information
- Explore Cases
- Sign-in interface

---

## 🗂️ Multiple Case Library

Users can explore multiple fictional investigation cases.

Each case can contain information such as:

- Case ID
- Case title
- Case type
- Location
- Status
- Priority
- Evidence count
- Suspect count
- Investigation progress

Users can search and filter available cases.

---

## 🔐 Authentication Interface

CaseX includes an investigator authentication experience.

Features include:

- Email authentication interface
- OTP verification interface
- Google Sign-In interface
- Sign-out functionality
- User profile
- Investigator information

---

## 📊 Investigation Dashboard

The dashboard provides an overview of the currently selected investigation.

It displays information such as:

- Case information
- Investigation progress
- Evidence statistics
- Suspect information
- Witness information
- Timeline information
- Recent investigation activity

---

## 🕵️ Crime Scene

An interactive crime scene interface where investigators can:

- Explore the scene
- Identify evidence
- Select evidence
- Inspect evidence
- Collect evidence
- View evidence details

---

## 🧪 Evidence Locker

A centralized interface for investigation evidence.

Features include:

- Evidence cards
- Evidence categories
- Evidence status
- Search
- Filtering
- Evidence details
- Collection status

---

## 👤 Suspect Matrix

A suspect analysis and comparison interface containing information such as:

- Suspect profiles
- Motive
- Alibi
- Risk level
- Evidence connections
- DNA information
- Fingerprint information

This allows investigators to compare information before forming conclusions.

---

## 👁️ Witness Interview

A dedicated interface for reviewing fictional witness information.

Investigators can:

- Review witness statements
- Check credibility
- Verify statements
- Flag statements
- Add investigator notes

---

## ⏱️ Timeline Builder

A chronological investigation timeline that helps reconstruct the sequence of events.

Users can examine:

- Time
- Event
- Description
- Source
- Investigation status

---

## 📹 CCTV Surveillance

A simulated CCTV investigation interface containing multiple camera feeds.

Features include:

- Camera selection
- Playback controls
- Timeline navigation
- Investigation clues
- Camera events

---

## 🧬 Forensics Lab

A forensic analysis interface displaying fictional investigation results such as:

- DNA analysis
- Fingerprint analysis
- Toxicology
- Ballistics

---

## 🧩 Detective Board

An interactive investigation workspace used to connect information from different parts of the case.

Investigators can analyze relationships between:

- Evidence
- Suspects
- Witnesses
- Motives
- Timeline events

---

## 🤖 AI Deduction Interface

An AI-style investigation analysis interface used to organize and present investigation findings.

It can display information related to:

- Evidence synthesis
- Suspect correlation
- Timeline analysis
- Investigation findings
- Probability indicators

The purpose of this module is to help investigators reason about collected information rather than immediately revealing a conclusion.

---

## 👤 Investigator Profile

Users can access their investigator profile containing:

- Profile information
- Investigator ID
- Investigation statistics
- Previous investigations
- Account settings

---

# ⚛️ React Concepts Demonstrated

CaseX demonstrates important React fundamentals required for modern front-end development.

## JSX / TSX

JSX/TSX is used to build the application's component-based user interface.

## Functional Components

The interface is divided into reusable functional components.

Examples include:

```text
CaseCard
CaseGrid
AuthModal
Button
Modal
ProgressBar
SearchBar
StatCard
Toast
Header
Footer
Sidebar
```

## Props

Props allow information to be passed from one component to another.

This allows the same component to display different data without rewriting the component.

## State

State stores information that can change while the application is running.

## useState

`useState` is used to manage changing values and interactive UI behaviour.

## useEffect

`useEffect` is used to perform actions when components load or when particular application values change.

## Context API

CaseX uses React Context to share important information between different parts of the application.

Examples include:

```text
AuthContext
CaseContext
```

---

# 🛠️ Technology Stack

## Frontend

- React
- TypeScript
- Vite
- HTML5
- CSS3
- JavaScript / ES6+
- JSX / TSX

## UI & Interaction

- Responsive CSS
- Reusable React Components
- React Hooks
- Interactive Modals
- Search and Filtering
- Local Storage

## Development Tools

- Visual Studio Code
- Git
- GitHub
- npm

---

# 📁 Project Structure

```text
CaseX/
│
├── src/
│   ├── components/
│   │   ├── auth/
│   │   ├── cases/
│   │   ├── common/
│   │   └── layout/
│   │
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── CaseContext.tsx
│   │
│   ├── data/
│   │   └── cases.ts
│   │
│   ├── pages/
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── server.ts
├── metadata.json
├── .gitignore
├── .env.example
└── README.md
```

---

# 🎨 Front-End Concepts

CaseX demonstrates:

### HTML
- Structured page content
- Forms
- Interactive elements
- Semantic organization

### CSS
- Box Model
- Flexbox
- CSS Grid
- Responsive layouts
- Media queries
- Modern UI styling

### JavaScript / TypeScript
- Variables
- Functions
- Arrays
- Objects
- Conditions
- Event handling
- Data manipulation

### React
- JSX / TSX
- Functional Components
- Props
- State
- `useState`
- `useEffect`
- Context API
- Conditional rendering
- List rendering
- Reusable components

---

# 📱 Responsive Design

CaseX is designed to work across different screen sizes.

The interface uses:

- Flexbox
- CSS Grid
- Responsive layouts
- Media queries
- Adaptive navigation
- Responsive components

This allows the application to provide a consistent investigation experience on different screen sizes.

---

# 🚀 Running the Project

## 1. Clone the repository

```bash
git clone <your-repository-url>
```

## 2. Open the project folder

```bash
cd CaseX
```

## 3. Install dependencies

```bash
npm install
```

## 4. Configure environment variables

If required, create a `.env` file based on:

```text
.env.example
```

Add the required environment values to `.env`.

**Never upload real API keys or the `.env` file to GitHub.**

## 5. Start the development server

```bash
npm run dev
```

Open the local URL displayed by Vite in the terminal.

---

# 🌐 Git & GitHub

Git and GitHub are used for version control and project hosting.

Basic Git workflow:

```bash
git add .
git commit -m "Describe your changes"
git push
```

Git helps track project changes while GitHub provides an online repository for storing and managing the project.

---

# 🎓 Learning Outcomes

Through CaseX, the project demonstrates practical understanding of:

- Building structured web interfaces
- Responsive web design
- JavaScript interactions
- DOM concepts
- React component architecture
- Reusable components
- Props
- State management
- React Hooks
- Context API
- Search and filtering
- Organizing project files
- Git and GitHub
- Building an interactive problem-solving application

---

# 🔮 Future Improvements

Future versions of CaseX could include:

- Additional investigation cases
- More advanced evidence analysis
- Enhanced timeline reconstruction
- More detailed suspect comparison
- Additional forensic modules
- Improved accessibility
- More advanced investigation analytics
- Expanded deduction capabilities

---

# ⚠️ Disclaimer

CaseX is an educational front-end engineering project.

All cases, suspects, evidence, witnesses, forensic information and investigation scenarios presented within CaseX are fictional and are intended solely for educational and demonstration purposes.

---

# 🔎 CaseX

### Digital Crime Scene Investigation Platform

> **Every Detail Matters.**
