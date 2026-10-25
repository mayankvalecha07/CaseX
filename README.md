# CASEX 2.0 — Digital Crime Scene Investigation Platform
**Every Detail Matters.**
CaseX 2.0 is a web-based digital crime scene investigation platform designed to organize fictional investigation cases, evidence records, suspects, witnesses, and related investigation information through a structured interface.
The project demonstrates modern front-end engineering concepts, reusable React components, application routing, state management, and API integration.
## Features
- **Investigation Dashboard** — Access the main investigation workspace.
- **Case Management** — Browse and manage investigation cases.
- **Evidence Management** — Organize evidence-related records.
- **Suspect Records** — View suspect information associated with investigations.
- **Witness Records** — Organize witness-related information.
- **Investigation Timeline** — Review chronological case events where implemented.
- **Investigation Modules** — Access the available investigation sections.
- **Authentication** — Email OTP authentication, if configured and enabled in the current version.
- **Profile and Settings** — Manage supported profile information and preferences.
- **Responsive Interface** — A forensic-inspired interface designed for convenient navigation.
*Features may vary depending on the modules implemented in the current version.*
## Technology Stack
The project uses technologies such as:
- React.js
- TypeScript
- React Router
- React Context API, where implemented
- CSS
- Vite
- Node.js backend for authentication, where configured
- REST API integration, where implemented
## Project Structure
CaseX-2.0/
├── public/
├── src/
├── assets/
├── server.ts
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── .env.example
├── .gitignore
└── README.md
*The structure above is illustrative. Your actual folders and files may differ.*
## Getting Started
### Prerequisites
Install the following before running the project:
- Node.js
- npm
- Git (optional)
### 1. Open the Project Folder
cd CaseX-2.0
### 2. Install Dependencies
npm install
### 3. Configure Environment Variables
If the project requires environment variables, create a local `.env` file using `.env.example` as a reference.
Add your own required configuration values locally. **Never commit `.env` or expose passwords, email app passwords, API keys, or other secrets to GitHub.**
### 4. Start the Development Server
npm run dev
Open the local URL displayed in your terminal.
### 5. Backend Setup (If Required)
If email OTP authentication or other backend functionality requires the Node.js server, configure its environment variables and start it using the appropriate command defined in `package.json` or the project's documentation.
Do not assume the backend starts automatically with the frontend.
## Development
To create a production build, if supported by the project scripts:
npm run build
To run any configured linting or testing scripts, check the available commands in `package.json`.
## Security Notes
- Keep `.env` out of version control.
- Never publish passwords or API credentials.
- Use `.env.example` to document required environment variable names without real secret values.
- Configure email authentication and backend services before using features that depend on them.
- Use fictional investigation data for demonstrations.
## Project Purpose
CaseX 2.0 was developed as a Front-End Engineering project to demonstrate practical web development concepts, including component-based architecture, routing, state management, user-interface design, and application integration.
## Team Members
**Pulkit Gupta** — JavaScript & React Development
**Mayank Valecha** — HTML & CSS Design
## Academic Information
- **Project:** CaseX 2.0
- **Subject:** Front-End Engineering
- **Evaluation:** Front-End Engineering-II
- **Project Type:** Academic Web Application
## Disclaimer
CaseX 2.0 is an academic project using fictional investigation scenarios. It is not an official law-enforcement system and should not be treated as a substitute for professional forensic investigation or legal procedures.

---

**CaseX 2.0 — Every Detail Matters.**
