# 🛡️ Custom API Bot Defense & Gateway

A full-stack, microservice-based API abuse detector built as a learning project to explore backend security, system architecture, and data visualization. 

This project acts as a Reverse Proxy Gateway that intercepts incoming web traffic, analyzes behavioral patterns using a decoupled Python engine, and drops malicious requests before they can reach a core application. It is designed to prevent basic scraping and scalping, while providing a real-time dashboard to track the system's effectiveness.

## 💡 How It Works: An Example Scenario

**The Problem: The Sneaker Bot**
Imagine an e-commerce store is launching a limited-edition sneaker. 
A malicious user sets up a bot to refresh the checkout page 50 times a second, hoping to buy the entire stock the millisecond it goes live, locking out real human customers.

**The Solution: The API Gateway in Action**
1. **Interception:** The bot sends its first 50 requests. Instead of hitting the store's database, they hit this Gateway.
2. **Analysis:** The Gateway asks the Redis Cache how many times this IP has visited. It sees 50 requests in 1 second and sends that data to the Python Brain.
3. **Scoring:** The Python Brain calculates a Threat Score of `0.99` (Extremely High Risk) because humans cannot click that fast.
4. **Action:** The Gateway instantly drops the connection, returning a `403 Forbidden` error to the bot. 
5. **The Result:** The store's servers remain perfectly stable, the real human customers get to buy their sneakers, and the business saves money on wasted server computing power.

## 🚀 Key Features

* **Traffic Interception:** Sits in front of a web app and proxies safe traffic while dropping flagged connections.
* **Low-Latency Rate Limiting:** Utilizes **Redis** to track user IP request volumes in memory.
* **Decoupled Analytics Brain:** A standalone **Python/FastAPI** service that calculates Risk Scores based on traffic patterns.
* **Geographic Threat Tracking:** Maps incoming IP addresses to physical locations to identify where traffic is originating.
* **Real-Time Dashboard:** A **React/Recharts** frontend that visualizes live attacks, threat origins, and total traffic volume, translating technical blocks into estimated "costs saved."
* **Audit Logging:** Cloud-hosted storage of all security events via **MongoDB Atlas**.

## 🏗️ System Architecture

This project was built to understand how microservices communicate:

1. **The Gateway (Node.js/Express):** Uses `http-proxy-middleware` to intercept traffic. Acts as the primary router.
2. **The Cache (Redis):** Tracks incoming IP addresses and request counts.
3. **The Analytics Engine (Python/FastAPI):** Receives traffic data from the Gateway and returns a calculated Threat Score.
4. **The Database (MongoDB):** Stores the outcomes of high-risk interactions for historical analysis.
5. **The Frontend (React/Vite):** Polls the backend to visualize the data dynamically.

## 💻 Tech Stack

* **Frontend:** React.js, Vite, Recharts, Axios
* **Gateway Backend:** Node.js, Express, `http-proxy-middleware`, `geoip-lite`
* **Analytics Backend:** Python, FastAPI, Uvicorn
* **Database & Caching:** MongoDB Atlas, Mongoose, Redis
* **Dev Tools:** Concurrently (for single-terminal startup)

## 🛠️ Getting Started (Local Development)

### Prerequisites
* Node.js (v18+)
* Python (v3.10+)
* A running local Redis Server (`sudo service redis-server start` on WSL/Ubuntu)
* A MongoDB Atlas connection string

### Installation
1. Clone the repository.
2. Install Node dependencies for the Gateway and Dashboard:
   ```bash
   npm install
   cd react-dashboard && npm install
   
3. Install Python dependencies:
   ```bash
   cd python-analyzer
   pip install fastapi uvicorn
   
4. Set up your MongoDB URI in the index.js file.

### Running the System
   You can spin up the entire microservice ecosystem with a single command from the root directory:
   ```
   npm start
   ```
Dashboard URL: http://localhost:5173

Gateway Proxy: http://localhost:3000

<img width="1903" height="865" alt="image" src="https://github.com/user-attachments/assets/bccbd310-e9c4-49eb-99b2-de317e07ab7a" />

<img width="1903" height="866" alt="image" src="https://github.com/user-attachments/assets/ef058fb2-5bb0-4c71-a784-c5c863c60efe" />


