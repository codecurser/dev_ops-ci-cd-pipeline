# Scalable Containerized E-Commerce Application

![Docker Integration](https://img.shields.io/badge/Docker-Enabled-blue?logo=docker)
![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?logo=github-actions)
![Node.js Backend](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js)
![Frontend](https://img.shields.io/badge/Frontend-Vanilla_JS-F7DF1E?logo=javascript)

A scalable, containerized e-commerce application demonstrating modern Continuous Integration and Continuous Deployment (CI/CD) practices. The project uses a lightweight microservices architecture built with a Vanilla HTML/CSS/JS frontend, a Node.js/Express backend, and SQLite for data persistence. Everything is fully orchestrated via Docker Compose and automated using GitHub Actions.

## 🏗️ Architecture

The application is decoupled into two primary containerized services:

1. **Frontend Service**:
   - Built with plain HTML5, CSS3 (using modern Custom Properties and Glassmorphism design), and Vanilla JavaScript.
   - Hosted incredibly efficiently inside an `nginx:alpine` Docker container.
2. **Backend Service**:
   - A robust Node.js and Express REST API.
   - Handles product fetching, user authentication using secure JWTs, and simulated order processing.
   - Operates entirely within a lightweight `node:20-alpine` Docker container.
3. **Database**:
   - Embedded SQLite initialized automatically inside the Backend Service runtime to ensure complete portability without the overhead of external database servers.

### 📂 Directory Structure

```text
dev_ops-ci-cd-pipeline/
├── .github/
│   └── workflows/
│       └── main.yml        # CI/CD Pipeline Configuration
├── backend/
│   ├── Dockerfile          # Backend container definition
│   ├── server.js           # Express REST API
│   └── package.json        
├── frontend/
│   ├── css/style.css       # Premium Glassmorphism UI styles
│   ├── js/app.js           # Vanilla JS state and API logic
│   ├── index.html          
│   ├── Dockerfile          # Frontend complete container definition
│   └── nginx.conf          # Nginx routing configuration
├── docker-compose.yml      # Master orchestration file
└── README.md
```

---

## 🚀 Getting Started Locally

You can spin up this application in a few minutes using either Docker or native Node.js environments. 

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running (Recommended).
- Alternately, [Node.js](https://nodejs.org/) v18+ if running natively.

### Option A: Using Docker Compose (The DevOps Way)

Orchestrating both containers using Docker is the recommended approach to guarantee consistent environments.

1. Clone the repository:
   ```bash
   git clone https://github.com/codecurser/dev_ops-ci-cd-pipeline.git
   cd dev_ops-ci-cd-pipeline
   ```
2. Build and run the containers in detached mode:
   ```bash
   docker-compose up -d --build
   ```
3. Open your browser:
   - UI Interface: [http://localhost](http://localhost) (or [http://localhost:80](http://localhost:80))
   - Backend API: `http://localhost:5000`

### Option B: Running Natively

If you do not have Docker running, you can run the microservices directly using local runtimes.

1. **Start the Backend API:**
   ```bash
   cd backend
   npm install
   npm start
   ```
   *The backend will initialize the SQLite database in memory and run on `localhost:5000`.*

2. **Start the Frontend UI:**
   Open a new terminal window:
   ```bash
   cd frontend
   npx serve . -l 8080
   ```
   *Visit `http://localhost:8080` in your web browser.*

---

## 🛠️ CI/CD Pipeline (GitHub Actions)

This repository includes a fully operational Continuous Integration / Continuous Deployment pipeline defined in `.github/workflows/main.yml`. 

Whenever a change is pushed to the `main` branch, the pipeline will execute the following stages autonomously:

1. **Build & Test**: Checks out the repository, setups the Node.js 20 environment, and cleanly installs the core backend dependencies to ensure the runtime is syntactically sound.
2. **Docker Build Layer**: Compiles immutable Docker Images (`my-ecommerce-backend:latest` and `my-ecommerce-frontend:latest`), verifying the container layer strategy works.
3. **Simulated Deployment**: Acts as a gateway to securely push artifacts to production targets (e.g., AWS ECR or an external VPS pipeline).

---

## 📡 API Endpoints

The Backend REST API routes follow standard structural patterns:

*   `GET /health` : Verify API Status.
*   `GET /api/products` : Retrieve catalog of items.
*   `POST /api/auth/register` : Create a new user (`username`, `password` body).
*   `POST /api/auth/login` : Login user and generate JWT Bearer Token.
*   `GET /api/orders` : (Protected) Retrieve the calling user's orders.
*   `POST /api/orders` : (Protected) Checkout current cart.

---

## 🤝 Project Contribution

Contributions, issues, and feature requests are always welcome! Feel free to fork this project and submit standard Pull Requests to the `main` branch; they will automatically be checked by the CI pipeline.
