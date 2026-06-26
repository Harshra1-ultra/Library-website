# The Study Point Library Website & Cabin Booking Portal

A premium, modern, responsive, and fully functional single-file Single-Page Application (SPA) portal for **The Study Point Library** (Gaya-Fatehpur State Highway, Bihar). This portal features a simulated state manager, a real-time cabin booking slot selector with conflict-checking, a seat map layout with live availability indicators, auth modals (register, login, verify, password reset), a student profile dashboard, and a password-protected administrative dashboard.

---

## 📂 Project Structure

```bash
├── index.html         # Unified SPA layout (Styles, State, Auth, Seat Map, Cabin Wizard, Admin & Student dashboards)
├── README.md          # Setup and instructions manual
```

---

## 🚀 How to Run Locally

### Double-Click to Start
Simply double-click **`index.html`** in your file manager or right-click and select "Open with" your favorite web browser (Chrome, Edge, Firefox, Safari).

No Node.js servers, npm installs, or MongoDB setups are required for basic usage, as it simulates all interactions locally in the browser using `localStorage`.

---

## 🔑 Default Simulated Credentials

### 1. Student Account
- **Email**: `student@thestudypointlibrary.com`
- **Password**: `studentpassword`

### 2. Admin Account
- **Email**: `admin@thestudypointlibrary.com`
- **Password**: `adminpassword`

---

## 📱 Features Implemented

1. **Attractive Hero Landing Page**: Clean glassmorphism cards, dynamic navigation links, timings widgets, and call-to-action buttons.
2. **Dynamic Seat Visualizer**: Visual representation of the study hall seating layout showing total seats, current occupants, and available spaces.
3. **Simulated Authentication System**: Full student sign-up, sign-in, log-out, simulated email verification token alert, and password reset code workflow.
4. **Interactive Student Dashboard**:
   - **Overview**: Remaining pass days, active cabin number, and booking logs.
   - **Cabin Booking**: A slot selector calendar grid that checks for overlaps to prevent double bookings.
   - **Billing**: Membership pass upgrade options with simulated QR code payments.
   - **Profile**: Account settings and verification status.
   - **Reviews**: Submission form for student testimonials.
5. **Admin Control Panel**:
   - Approve, reject, or block student cabin bookings.
   - Configure metadata (Library name, taglines, timings, maps coordinates, and phone numbers).
   - Saved configurations persist automatically in the browser (`localStorage`).
