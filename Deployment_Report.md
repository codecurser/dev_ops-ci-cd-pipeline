# Scalable Containerized E-Commerce Application: Deployment Report

---

## 1. Introduction to DevOps & CI/CD
DevOps represents a cultural and technical evolution in software engineering, aiming to bridge the gap between Development (Dev) and IT Operations (Ops). By prioritizing communication, integration, and automation, DevOps allows organizations to deliver applications and services at high velocity. 

**Continuous Integration and Continuous Deployment (CI/CD)** form the backbone of the DevOps lifecycle:
- **Continuous Integration (CI)** focuses on automatically merging code changes into a central repository and subsequently running automated tests to ensure no regressions occur.
- **Continuous Deployment (CD)** automates the release process, pushing validated code automatically into production environments (such as Docker containers or cloud servers) without manual intervention.

## 2. Problem Statement
Historically, developing and deploying e-commerce platforms involved monolithic architectures and highly manual processes. This caused several crucial problems:
- **Environment Inconsistency:** Code that functioned cleanly on a developer's desktop often crashed in the production environment due to mismatched OS dependencies or package versions.
- **Human Error:** Manual file transfers (via FTP or SSH) routinely led to configuration errors or missing files.
- **Slow Delivery:** Releasing new features was heavily gated by manual approval and slow deployment overhead, preventing the platform from rapidly responding to market demands.

**Solution:** This project addresses these issues by decoupling the e-commerce architecture into frontend and backend microservices, containing both within isolated `Docker` containers, and automating the testing and delivery pipeline using `GitHub Actions`.

## 3. System Architecture Diagram

```mermaid
graph TD
    subgraph CI/CD Pipeline (GitHub Actions)
        A[Git Push to Main] -->|Triggers| B(Install Dependencies)
        B --> C[Verify Backend Integrity]
        C -->|Success| D(Build Docker Images)
        D --> E{Cloud Deployment}
    end

    subgraph Production Environment (Docker Compose)
        F[Nginx Container] -->|Serves| G[Vanilla HTML/CSS/JS UI]
        H[Node.js Container] -->|Serves| I[Express REST API]
        I -.->|In-Memory| J[(SQLite Database)]
        G <-->|REST over HTTP| I
    end

    E -->|Uploads Images To| F
    E -->|Uploads Images To| H
```

## 4. Tools & Technologies
The following modern stack was utilized to construct the isolated architecture and automated delivery pipeline:
- **Frontend Development**: HTML5, Vanilla CSS3 (Glassmorphism UI), Vanilla JavaScript.
- **Backend Development**: Node.js, Express.js.
- **Security & Authentication**: JSON Web Tokens (JWT) for stateless API authentication.
- **Database**: SQLite (Embedded into the backend container for standalone portability).
- **Containerization**: Docker, Docker Compose (for multi-container orchestration).
- **Web Server**: Nginx (alpine lightweight image) to serve frontend UI assets securely. 
- **CI/CD Orchestration**: GitHub Actions.

## 5. Implementation Steps
The project was executed through the systematic rollout of the following phases:
1. **Frontend Construction**: A responsive, premium dark-themed UI was developed entirely in native JavaScript and CSS to manage product rendering, authentication forms, and dynamic cart state management.
2. **Backend Construction**: A Node.js API layer was provisioned with endpoints spanning `GET /products`, `POST /auth/register`, and `POST /orders`.
3. **Database Integration**: SQLite was embedded directly into the Express server, initiating schemas and seeding arbitrary product data upon server initialization.
4. **Containerization Strategy**: Two independent `Dockerfile` architectures were built. The frontend utilizes lightweight `nginx:alpine`, and the backend utilizes `node:20-alpine`. 
5. **Orchestration**: A unified `docker-compose.yml` was configured to map container volumes and expose correct ports (`80` for UI, `5000` for API).
6. **Automation**: The `.github/workflows/main.yml` was implemented linking exactly to the `main` directory of the repository to listen for developer commits.

## 6. Pipeline Workflow
The CI/CD layout implemented in GitHub Actions operates sequentially out of `.github/workflows/main.yml`:
1. **Code Checkout (`actions/checkout@v4`)**: Synchronizes the latest user commits to the cloud runner.
2. **Environment Setup**: Provisions Node v20 dynamically inside the GitHub agent.
3. **Dependency Syncing**: Executes `npm install` within the target directory evaluating whether the `package.json` configurations have fatal crashes.
4. **Image Compilation**: Triggers the Docker Daemon inside the runner to compile `my-ecommerce-frontend:latest` and `my-ecommerce-backend:latest`.
5. **Deployment Rollout**: Verifies the branch context is `main` and simulates a production registry push. 

## 7. Output Screenshots

*(Note: Replace these markdown placeholders with actual images of the final web application and pipelines)*

- **Figure 7.1:** [Placeholder: Screenshot of the dynamic product UI and Glassmorphism Shopping Cart]
- **Figure 7.2:** [Placeholder: Screenshot of the successful GitHub Actions tab displaying a green checkmark pipeline run]
- **Figure 7.3:** [Placeholder: Screenshot of the terminal output confirming `docker-compose up` successful container launches]

## 8. Challenges Faced
One major technical challenge occurred during the Docker Containerization phase specifically relating to environment contexts.

**The Issue**: Upon booting `docker-compose up`, the `Backend API` immediately crashed entirely and entered a restart loop. The logs outputted an `Exec format error` targeting the `sqlite3.node` binding.
**Diagnostic Analysis**: Because a global `.dockerignore` file wasn't present inside the backend build context, the `COPY . .` command swept up the local host's (Windows OS) `node_modules` folder and pushed it directly inside the Alpine Linux Docker container. Since SQLite contains natively compiled C-bindings, a Node module built structurally for Windows cannot execute on Alpine Linux.
**Resolution**: A robust `.dockerignore` configuration explicitly blocking `node_modules/` was embedded natively inside the `/backend` directory. When rebuilt, Docker securely installed the Linux-native SQLite packages leading to perfect container stability.

## 9. Conclusion
This project successfully achieved its goal: constructing a horizontally scalable e-commerce application governed thoroughly by modern DevOps philosophies. By abandoning local-machine dependency execution in favor of strict `Docker` containerization, the environment is inherently reproducible across any cloud network worldwide. Furthermore, the inclusion of a GitHub Actions CI/CD framework validates that code deliveries happen consistently, intelligently, and without the requirement of dangerous manual interactions. 

## 10. Future Enhancement
While this setup effectively replicates a functional microservices pipeline, it can be extended using the following enterprise upgrades:
1. **Cloud Kubernetes Integration**: Upgrading the orchestration framework from Docker Compose to Amazon EKS (Kubernetes) to allow seamless load balancing and intelligent auto-scaling of the Nginx frontend based on web traffic.
2. **Production External Database**: Replacing the embedded SQLite implementation with an external managed database, such as Amazon RDS (PostgreSQL) guaranteeing data durability external to the container life-cycles. 
3. **Automated E2E Testing Pipeline**: Injecting functional Cypress End-to-End tests inside the GitHub Actions pipeline prior to allowing the final image deployments to happen, assuring UI logic functions alongside pure package validation.
