# 📱 Enterprise MDM Platform

A high-performance, event-driven Mobile Device Management (MDM) system built for managing extensive fleets of enterprise devices.

## 🏗️ System Architecture

```text
[Devices / 📱] <---> [ 🌐 Load Balancer (Vercel/Render) ]
                              |
                     [ 🚀 Node.js API Cluster ]
                      /          |           \
         [ 🧠 Redis ]   [ 📥 Message Queue ]    [ 📊 Prom/Grafana ]
          (Caching)      /                 \          (Metrics)
                        /                   \
        [ 🐘 MongoDB ]             [ ⚙️ Background Workers ]
    (Primary Data Source)         (Batched OTA Updates / Logs)
```

## 🛠️ Core Technologies Breakdown
* **Frontend UI:** React.js, Material UI, Recharts (Data Viz).
* **API Gateway:** Node.js, Express (Opted for high I/O concurrency). Set up strictly with Helmet & express-rate-limit.
* **Message Queue:** BullMQ leveraging Redis. Separates heavy UI requests from intense background network calls scaling linearly.
* **Cache Layer:** Upstash / Native Redis caching instance (Significantly reduces MongoDB load on heavy `GET /devices` and analytical metric aggregate polling).
* **Database Pipeline:** MongoDB Atlas (Mongoose) with explicit compound indexing for linear scaling `(O(log N))`.
* **Telemetry & Logging:** Prometheus (Time-series aggregations) and Winston Daily-Rotated robust structural logging for Datadog/Splunk ingestion compatibility.

## 🚀 Deployment Operations

1. **Provision Environments:**
   * **MongoDB Atlas:** Replicaset connection URI -> `MONGO_URI`
   * **Redis Instance:** Remote or hosted -> `REDIS_URL`

2. **Frontend Deployment (Vercel):**
   * Link your GitHub repository.
   * Root Directory: `frontend`
   * Build Command: `npm run build`
   * Automatically inherits our GitHub Actions CI/CD Pipeline.

3. **Backend Rest API & Worker (Render/AWS):**
   * Deploy the Node.js API Cluster directly routing via HTTPS mapping to port `5000`.
   * Configure the secondary start script: `npm run start:worker` to handle async background loads mapped via BullMQ.

## 🔒 Security Posture & Standards
- API endpoints strictly guarded by `Helmet` and `express-rate-limit` to prevent DDoS layer 7 network attacks.
- Input validation sanitization strictly enforced via robust API controllers and `xss-clean` middleware, mitigating generic NoSQL injections.
- Authentication tokens (JWT) encrypted with standard expiration timelines alongside comprehensive Hierarchical RBAC definitions preventing downstream privilege escalations.

---
*Created as part of an Advanced Enterprise Upgrade Project.*
