# VAPT Report Automation System (VRAS) - GUI Edition

This project is a web-based GUI tool to help security teams manage VAPT reports. It allows importing scanner outputs, editing findings, adding evidence, and generating reports.

## Project Structure

- `backend/`: A FastAPI application that provides the API for the system.
- `frontend/`: A React application that provides the web-based GUI.
- `docker-compose.yml`: Orchestrates the backend, frontend, and a MinIO service for storage.

## Getting Started

### Prerequisites

- Docker
- Docker Compose

### Running the Application

1.  **Clone the repository** (or in this case, make sure you have the files in the correct structure).

2.  **Build and run the services using Docker Compose:**

    ```bash
    docker-compose up --build
    ```

3.  **Access the applications:**
    -   **Frontend (GUI):** [http://localhost:3000](http://localhost:3000)
    -   **Backend (API):** [http://localhost:8000/docs](http://localhost:8000/docs) for the OpenAPI documentation.
    -   **MinIO (Storage):** [http://localhost:9001](http://localhost:9001) with user `minioadmin` and password `minioadmin`.

## Usage

1.  Open the frontend in your browser.
2.  Use the dashboard to get an overview of your projects and findings.
3.  Upload scanner reports and manage findings.
4.  Add steps to reproduce and evidence (screenshots, etc.).
5.  Generate reports in PDF, HTML, or JSON format.
