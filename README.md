# 🛒 Cartmate — Proximity Group Ordering & Cost-Split Platform

**Cartmate** connects nearby hostel residents and neighbors (such as NIT Jamshedpur campus residents) placing quick-commerce orders (specifically **Blinkit**) so they can combine orders into a single checkout, eliminate small-cart surcharges, and split shared handling fees proportionally based on item contribution.

---

## 🌟 Key Features & Capabilities

1. **Blinkit Proportional Cost Split Matrix**:
   $$\text{Member Share}_i = \frac{\text{Item MRP}_i}{\text{Total Combined MRP}}$$
   $$\text{Final Payment}_i = \text{Member Share}_i \times \text{Combined Order Total}$$
   $$\text{Net Savings}_i = \text{Individual Standalone Total}_i - \text{Final Payment}_i$$
   - Displays actual member names, verified user IDs (`#CM-84920`), trust scores, and settlement status.

2. **Request to Join Order Flow**:
   - Distinct, clearly visible **"Request to Join Order"** button on feed cards and group detail views.
   - Non-members can submit their cart MRP, standalone fee, and a note to the host.
   - Host reviews and accepts applicants in the join requests drawer.

3. **NIT Jamshedpur Location Accuracy & Interactive Map Picker**:
   - Accurately centered on **NIT Jamshedpur** (`86.1438, 22.7780`).
   - Interactive Leaflet OpenStreetMap address picker with pin dropping and live browser GPS detection.
   - Quick campus landmark chips: Hostel 1, Hostel 4 Canteen, Hostel 9, Computer Center, Outer Circle Gate, Adityapur Market.

4. **Strict 5 km Discovery Radius Cap**:
   - Nearby order discovery is strictly capped at a maximum of 5 km radius.

5. **Order Deletion & History Archiving**:
   - Immediate deletion from active feeds with full retention in the user's **Order History** tab.
   - Preserves completed order numbers, participants, items, and cost breakdowns in user history.

6. **Order Lifecycle & Manual Mark Completed**:
   - Hosts can mark orders **Completed** or **Closed** at any member count (1 to 4 members).
   - Unique Order Number (`#CM-ORD-...`) generated for every order post.

7. **Vibrant & Dark Mode Themes**:
   - Dynamic theme switcher supporting Vibrant Neon palette and Sleek Dark theme with smooth animations.

8. **Self-Profile & Verified Community Ratings**:
   - Dedicated **"My Profile"** page to view and edit profile details, bio, and campus location.
   - Profile stats: Completed orders count, verified trust rating (1-5 stars & reviews), unique randomly generated user ID.
   - In-app rating modal to review and rate co-members after order completion.

9. **Multi-Cart Session Switcher**:
   - Users can maintain multiple saved cart profiles (e.g. "Evening Hostel Snacks", "Late Night Munchies") and switch active carts anytime.
   - Feed cards dynamically compute green fee savings previews for the selected active cart.

10. **Email Verification OTP**:
    - 6-digit OTP verification flow during account registration.

---

## 🚀 Quick Start Guide

### 1. Start Backend Server
```bash
cd backend
npm install
npm run dev      # Starts server on http://localhost:5000 (auto-connects MongoMemoryServer & seeds data)
```

### 2. Start Frontend App
```bash
cd frontend
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

---

## 🔑 Demo Quick-Login Credentials (NIT Jamshedpur)

| User Name | Email | Password | Locality / Landmark |
| :--- | :--- | :--- | :--- |
| **Aarav Sharma** (Host) | `aarav@example.com` | `password123` | Hostel 1, NIT Jamshedpur |
| **Priya Patel** | `priya@example.com` | `password123` | Hostel 4 Canteen, NIT Jamshedpur |
| **Rohan Verma** | `rohan@example.com` | `password123` | Outer Circle Gate, NIT Jamshedpur |
| **Ananya Gupta** | `ananya@example.com` | `password123` | Adityapur Local Market, Jamshedpur |

---

## 📡 REST API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/send-otp` | Generate email OTP verification code |
| `POST` | `/api/auth/signup` | Register new user with locality & coordinates |
| `POST` | `/api/auth/login` | Authenticate user & get JWT token |
| `GET` | `/api/auth/me` | Fetch current user profile |
| `PATCH` | `/api/auth/profile` | Update profile name, locality, bio, coordinates |
| `POST` | `/api/auth/users/:id/rate` | Submit 1-5 star rating and review comment |
| `GET` | `/api/auth/users/:id` | Fetch public user profile and reviews |
| `POST` | `/api/requests` | Post new Blinkit order request with unique orderNumber |
| `GET` | `/api/requests/nearby` | Fetch nearby orders capped at 5 km radius |
| `GET` | `/api/requests/my-requests` | Fetch user's active, history, and joined orders |
| `PUT` | `/api/requests/:id` | Edit order details (items, deadline, MRP, locality) |
| `DELETE` | `/api/requests/:id` | Delete post from active feed & archive to history |
| `POST` | `/api/requests/:id/join-request` | Send join request to host |
| `GET` | `/api/requests/:id/join-requests` | Host views pending join requests |
| `PATCH` | `/api/requests/:id/respond-request` | Host accepts or rejects join request |
| `PATCH` | `/api/requests/:id/status` | Mark request `CLOSED` or `COMPLETED` |
| `GET` | `/api/groups/:id` | Fetch group details, member names & split matrix |
| `POST` | `/api/groups/:id/finalize-cost` | Finalize proportional cost split |
| `PATCH` | `/api/groups/:id/toggle-settled` | Toggle settlement status per member |
| `GET` | `/api/groups/:id/messages` | Fetch chat message history |
