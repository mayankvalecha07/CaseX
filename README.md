# CaseX 🔎

## Digital Crime Scene Investigation Platform

> **Every Detail Matters.**

CaseX is an interactive digital crime scene investigation platform designed to provide a modern and immersive environment for exploring fictional investigation cases.

The platform allows investigators to explore cases, review evidence, examine suspects and witnesses, reconstruct timelines, track investigation progress, and use analytical tools to reach logical conclusions.

CaseX combines an investigation-style user experience with modern front-end development concepts to create an engaging and technically rich web application.

---

## 👥 Team

| Member | Role |
|---|---|
| Mayank Valecha | Front-End Development |
| Team Member | Front-End Development |

**Course:** Front-End Engineering  
**Project:** CaseX – Digital Crime Scene Investigation Platform

---

## 🎯 Project Objective

The main objective of CaseX is to demonstrate how modern front-end technologies can be used to build an interactive digital investigation environment.

The project focuses on creating a structured and responsive interface while demonstrating important web-development concepts including:

- Semantic HTML
- Modern CSS
- JavaScript / TypeScript
- DOM concepts
- React
- JSX / TSX
- Functional Components
- Props
- State Management
- `useState`
- `useEffect`
- Context API
- Event Handling
- Responsive Design
- Reusable Components

---

## 🔍 What is CaseX?

CaseX simulates the workflow of a fictional criminal investigation.

The user acts as a digital investigator and interacts with different investigation modules to understand a case.

The general investigation process is:

**Select Case → Study Case → Investigate Evidence → Examine Suspects → Analyze Information → Build Connections → Reach a Conclusion**

Instead of simply displaying information, CaseX provides an interactive interface where different pieces of case information can be explored and analyzed.

---

## ✨ Major Features

### 📁 Case Management

Users can browse available investigation cases and select a case for further investigation.

The case system provides structured information such as:

- Case title
- Case details
- Case status
- Investigation information
- Case progress

---

### 🔎 Case Investigation

Each case provides an investigation environment where users can explore available information and continue through different stages of the investigation.

---

### 🧪 Evidence Analysis

CaseX provides an organized system for examining evidence connected to an investigation.

Evidence can be displayed through reusable interface components, making it easier for investigators to review important information.

---

### 👤 Suspect Analysis

Suspect information is organized into profiles so investigators can examine individuals connected with a case.

The interface helps users compare available information before forming conclusions.

---

### 🗣️ Witness Information

Witness-related information provides additional context to the investigation and helps users understand different perspectives surrounding a case.

---

### 🕒 Investigation Timeline

Timeline-based information helps reconstruct the sequence of important events associated with an investigation.

This allows investigators to understand:

- What happened
- When it happened
- How different events may be connected

---

### 🧠 Deduction & Analysis

CaseX includes analytical investigation features designed to help users combine information from different parts of the case.

The purpose is to encourage logical reasoning instead of immediately revealing an answer.

---

### 🔐 Authentication Interface

The application contains an authentication interface and authentication-related components for managing the investigator experience.

---

### 📊 Investigation Progress

CaseX provides visual indicators and progress-related components to help users understand their progress through an investigation.

---

### 🔍 Search

Search functionality helps investigators quickly locate relevant information within the application.

---

### 🔔 Interactive Feedback

Reusable interface elements such as:

- Modals
- Toast notifications
- Buttons
- Badges
- Progress bars
- Search bars
- Statistic cards

provide visual feedback and improve the overall user experience.

---

## ⚛️ React Concepts Used

CaseX demonstrates several important React concepts.

### JSX / TSX

The user interface is created using React's component-based syntax.

### Functional Components

The application is divided into multiple reusable functional components.

Examples include components for:

- Cases
- Authentication
- Layout
- Buttons
- Modals
- Search
- Progress
- Statistics

### Props

Props are used to pass information between components.

This makes components reusable because the same component can display different information depending on the data provided to it.

### State

State is used to manage information that can change while the application is running.

### useState

`useState` is used to manage dynamic interface information and user interactions.

### useEffect

`useEffect` is used when a component needs to perform an action in response to loading or changes in application data.

### Context API

The project contains React Context for managing information that needs to be shared across multiple components.

The project includes contexts such as:

- Authentication Context
- Case Context

---

## 🧩 Reusable Components

CaseX follows a component-based architecture.

The project contains reusable components such as:

- Auth Modal
- Case Card
- Case Grid
- Case Preview Modal
- Case Selector Modal
- Badge
- Button
- Modal
- Progress Bar
- Search Bar
- Stat Card
- Toast
- Header
- Footer
- Sidebar

Reusable components help reduce duplicated code and make the application easier to maintain.

---

## 🏗️ Project Structure

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
