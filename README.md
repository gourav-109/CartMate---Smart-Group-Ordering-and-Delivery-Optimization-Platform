# 🛒 CartMate — Proximity Group Ordering MVP (SIH Hackathon)

**CartMate** matches nearby users placing small quick-commerce orders (specifically **Blinkit**) so they can combine into a single checkout and split shared handling fees proportionally based on item contribution.

---

## 🌟 Key Features

1. **Blinkit Proportional Cost Split**:
   $$\text{Member Share}_i = \frac{\text{Item MRP}_i}{\text{Total Combined MRP}}$$
   $$\text{Final Payment}_i = \text{Member Share}_i \times \text{Combined Order Checkout Total}$$
   $$\text{Net Savings}_i = \text{Standalone Individual Total}_i - \text{Final Payment}_i$$
   - *Example*: User 1 (MRP ₹93, standalone ₹128) & User 2 (MRP ₹123, standalone ₹158) combined checkout ₹221 $\rightarrow$ User 1 pays **₹95.15** (saves **₹32.85**), User 2 pays **₹125.85** (saves **₹32.15**).

2. **Mandatory Post Fields**:
   - Total MRP (`totalMrp`)
   - Standalone Fee (`standaloneTotal`)
   - Combined Total (`combinedOrderTotal`)
   - Locality Name (`localityName`)
   - Deadline (`deadline`, max 48 hours)
   - Itemized list is optional.

3. **Active Cart Session & Live Green Savings Preview**:
   - Floating active cart bar allows users to input their current Blinkit basket.
   - All nearby feed cards automatically calculate and display projected combined cost and **Net Green Fee Savings**.

4. **Group Limit & Join Request Flow**:
   - Maximum **4 participants** per order post.
   - Join/Chat requests sent by users do **not** increase participant count until the postee explicitly reviews and accepts them.

5. **1-Hour Order Disappearance Rules**:
   - *Deadline Expiry*: Auto-closes upon reaching deadline, stays on home feed for 1 hour post-closing, then hides.
   - *Full Order / Completion*: Stays on home feed until marked `COMPLETED`. Hides 1 hour after completion.
   - *Manual Closure*: Stays on home feed for 1 hour post-closure, then hides.

6. **Suggested Geographic Midpoint**:
   - Automatically computes average latitude/longitude across members to suggest an ideal meeting spot.

7. **Real-time Group Chat (Socket.IO)**:
   - Live room-based chat for participants to discuss meeting locations and payment confirmation.

---

## 🚀 Quick Start Guide

### 1. Start Backend Server
```bash
cd backend
npm install
npm run seed     # Populates mock users & Blinkit orders
npm run dev      # Starts server on http://localhost:5000
```
*Note: Backend automatically uses `mongodb-memory-server` if no `MONGODB_URI` is supplied in environment!*

### 2. Start Frontend App
```bash
cd frontend
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

---

## 🔑 Demo Quick-Login Credentials

| User Name | Email | Password | Locality |
| :--- | :--- | :--- | :--- |
| **Aarav Sharma** (Poster) | `aarav@example.com` | `password123` | Koramangala 4th Block, Bengaluru |
| **Priya Patel** | `priya@example.com` | `password123` | Koramangala 5th Block, Bengaluru |
| **Rohan Verma** | `rohan@example.com` | `password123` | Koramangala 6th Block, Bengaluru |
| **Ananya Gupta** | `ananya@example.com` | `password123` | HSR Layout Sector 1, Bengaluru |

---

## 📡 REST API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Register new user with locality & location |
| `POST` | `/api/auth/login` | Authenticate user & get JWT token |
| `GET` | `/api/auth/me` | Fetch current user profile |
| `POST` | `/api/requests` | Post new Blinkit order request & initialize group |
| `GET` | `/api/requests/nearby` | Fetch nearby orders sorted by proximity with 1-hr window filtering |
| `POST` | `/api/requests/:id/join-request` | Send join/chat request to postee |
| `GET` | `/api/requests/:id/join-requests` | Postee views pending join requests |
| `PATCH` | `/api/requests/:id/respond-request` | Postee accepts/rejects applicant (updates count, max 4) |
| `PATCH` | `/api/requests/:id/status` | Mark request `CLOSED` or `COMPLETED` |
| `GET` | `/api/groups/:id` | Fetch group details, members, split matrix & midpoint |
| `POST` | `/api/groups/:id/finalize-cost` | Re-compute and persist proportional fee split |
| `PATCH` | `/api/groups/:id/toggle-settled` | Toggle settled status per member |
| `GET` | `/api/groups/:id/messages` | Fetch chat message history |
