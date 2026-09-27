# GenAI FinWise

FinWise is a comprehensive financial AI assistant and data engineering application. It combines a modern React frontend with a robust Node.js/Express backend, alongside a Python environment for heavy financial data parsing and AI/ML model integrations.

## Tech Stack

### Frontend & Backend 
- **Frontend Framework:** React 19, Vite
- **Styling:** Tailwind CSS
- **UI Components:** Lucide React, Recharts, Canvas Confetti, Framer Motion
- **Data Processing:** Papaparse (CSV), PDF.js (PDF), XLSX (Excel)
- **Backend Framework:** Express, Node.js (via `tsx`)
- **Database & Auth:** Firebase
- **AI Integration:** Google GenAI SDK

### Data Engineering & ML (Python)
The project includes a Python toolchain (see `requirements.txt`) designed for standalone financial data parsers, ML models, and APIs:
- **Frameworks:** FastAPI, Uvicorn
- **AI SDKs:** Google GenAI, GenerativeAI, Groq
- **Data Ingestion:** Pandas, openpyxl, xlrd, pdfplumber, pypdf
- **Cloud:** Firebase Admin, Google Cloud Firestore

## Prerequisites

- **Node.js** (v18+ recommended)
- **Python** (v3.10+ recommended, if running the Python data engineering tools)

## Getting Started

### 1. Install Node Dependencies

```bash
npm install
```

### 2. Install Python Dependencies (Optional, for Data Engineering)

```bash
python -m venv venv
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Environment Setup

Create a `.env` file in the root of the project and configure the necessary environment variables, including your Gemini API Key and Firebase configurations.

```env
GEMINI_API_KEY=your_gemini_api_key_here
# Add other required environment variables (e.g., Firebase config)
```

### 4. Run the Application locally

To start the development server (which concurrently handles the Express API and Vite React frontend):

```bash
npm run dev
```

The application will be running locally. Check the terminal output for the local port (typically `http://localhost:3000` or `http://localhost:5173` depending on configuration).

## Available Scripts (Node)

- `npm run dev`: Starts the development server using `tsx`.

