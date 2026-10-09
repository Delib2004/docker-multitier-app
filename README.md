# Dockerized Multi-Tier Application

Frontend (nginx) + backend (Node.js API) + MySQL database, run with Docker Compose and then on Kubernetes (Minikube).
The database can be swapped for Amazon RDS.

    Browser -> frontend (nginx) -> /api -> backend (Node.js) -> MySQL

## 1. Run with Docker Compose
    copy .env.example .env       (PowerShell; use cp on Linux/Mac) and edit the passwords
    docker compose up --build
Open http://localhost:8080, save a few messages, then run `docker compose down` and `up` again:
the messages are still there because of the `db_data` volume.

Useful commands: `docker compose ps`, `docker compose logs backend`, `docker images`
(compare image sizes to see the benefit of multi-stage builds).

## 2. Push images to Docker Hub
    docker login
    docker build -t YOUR_DOCKERHUB_USER/multitier-backend:1.0 ./backend
    docker build -t YOUR_DOCKERHUB_USER/multitier-frontend:1.0 ./frontend
    docker push YOUR_DOCKERHUB_USER/multitier-backend:1.0
    docker push YOUR_DOCKERHUB_USER/multitier-frontend:1.0

## 3. Deploy to Kubernetes with Minikube
Replace `YOUR_DOCKERHUB_USER` in `k8s/backend.yaml` and `k8s/frontend.yaml`, then:
    minikube start
    kubectl apply -f k8s/
    kubectl get pods
    minikube service frontend       # opens the app in your browser
Try `kubectl scale deployment backend --replicas=3` and `kubectl delete pod <a-backend-pod>` to watch Kubernetes self-heal.

## 4. Swap MySQL for Amazon RDS
1. Create an RDS MySQL instance (free-tier template) with a security group that allows port 3306 from where the app runs.
2. Set `DB_HOST` to the RDS endpoint and use the RDS username/password.
   - Compose: delete the `db` service and point `DB_HOST` at the endpoint.
   - Kubernetes: delete `k8s/mysql.yaml` and set `DB_HOST` in `k8s/backend.yaml`.
3. Delete the RDS instance when you finish to avoid charges.

## What you will learn
Multi-stage Dockerfiles, Compose networking and health checks, volumes, Kubernetes Deployments and Services, Secrets, and managed databases.
