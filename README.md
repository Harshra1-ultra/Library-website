# The Study Point Library Website & WhatsApp Booking System

A premium, modern, responsive, and functional single-file Single-Page Application (SPA) landing website for **The Study Point Library** (Gaya-Fatehpur State Highway, Bihar). Feature requests and cabin bookings are routed entirely through pre-filled WhatsApp forms, while a private Admin settings panel is available for configuration.

---

## ðŸ“‚ Project Structure

```bash
â”œâ”€â”€ index.html         # Unified SPA layout (Styles, Lucide icons, WhatsApp Wizard, Admin configurations)
â””â”€â”€ README.md          # Setup and instructions manual
```

---

## ðŸš€ How to Run Locally

### Double-Click to Start
Simply double-click **`index.html`** in your file manager or right-click and select "Open with" your favorite web browser (Chrome, Edge, Firefox, Safari).

No Node.js servers, npm installs, or MongoDB setups are required. The portal runs client-side in the browser.

---

## ðŸ“± Features Implemented

1. **WhatsApp Booking Wizard**:
   Clicking "Book Pass Now" on any membership pass opens a custom modal form to enter:
   - Full Name
   - Date (date picker, defaults to tomorrow)
   - Preferred Shift / Time Slot
   - Study Duration (hours)
   
   *Submitting automatically formats the WhatsApp message API redirect containing their information, opening in a new tab.*

2. **WhatsApp Inquiry redirection**:
   The contact inquiry form in the contact section converts inputs into a formatted WhatsApp message redirection.

3. **Admin Settings Portal**:
   - Access the portal by clicking **Admin Login Settings** in the footer.
   - Enter the password: `adminpassword`
   - Adjust settings: Library Name, Tagline, Operating Hours, Address, Phone, WhatsApp Number, and Seating capacity parameters.
   - *Changes are saved in browser storage (`localStorage`) and instantly update headings, phone dials, and prefilled link variables throughout the page.*
