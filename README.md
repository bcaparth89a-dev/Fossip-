I will inspect the files and folders inside the `src` directory to outline the application components, files, and overall architecture.

Deploy ment Link : https://kaleidoscopic-profiterole-9e4a9c.netlify.app/
Listed directory src

I will inspect the contents of `src/pages` to list the page components.

Listed directory pages

I will list the components folder to see if there are any shared React elements.

Listed directory components

I will list the scripts folder to check for helper files.

Listed directory scripts

I will view `App.jsx` to understand the routing layout and path endpoints.

Viewed App.jsx:1-20

I will view `main.jsx` to see the entry point setup.

Viewed main.jsx:1-11

Here is a comprehensive breakdown of the entire project, its tech stack, structure, and functional workflows:

---

# Shree Noble Footwear Invoicing Portal

This is a modern, responsive, client-side web application designed to build, save, preview, and distribute digital footwear sales invoices. It is optimized for high-fidelity export formats (PDFs and Cloudinary-hosted receipt links) and integrates directly with sharing tools (WhatsApp, EmailJS) and databases (Firebase Realtime Database and Firestore).

---

## 1. Core Technology Stack

*   **Framework & Libraries**:
    *   **React (v19)**: Component-driven interface rendering.
    *   **Vite (v6)**: Extremely fast development server and production bundler.
    *   **React Router DOM (v7)**: Manages page navigation and routes.
*   **Design & Styling**:
    *   **Tailwind CSS (v4)**: Modern styles, layouts, hover micro-animations, and complete device responsiveness.
    *   **FontAwesome Icons**: Visual action indicators.
*   **Backend & Storage (Firebase)**:
    *   **Firebase Realtime Database**: Used to write live invoice information.
    *   **Cloud Firestore**: Retains persistent database records for billing audits.
*   **Export and Communication APIs**:
    *   **html2canvas (v1.4)**: Captures HTML elements and renders them into high-definition canvases.
    *   **jsPDF (v3.0)**: Compiles high-resolution, multi-scale PDF documents from canvas captures.
    *   **Cloudinary Image API**: Standardizes unsigned image uploads for visual invoice receipts.
    *   **EmailJS (v4.4)**: Dispatches formatted HTML mail templates directly to customer emails.

---

## 2. Directory Structure & Key Files

```text
footwear/
├── .env                  # Private service credentials (ignored by Git)
├── .gitignore            # Cleaned rules keeping node_modules, dist, and env private
├── package.json          # Dependency catalog and build scripts
├── index.html            # Core HTML entry node
├── src/
│   ├── App.css           # Custom scrollbars and number inputs resets
│   ├── index.css         # Tailwind base and print-safe style boundaries
│   ├── main.jsx          # StrictMode React mounting entry point
│   ├── App.jsx           # Application Router configuring page endpoints
│   ├── assets/           # UI media (logos, back buttons, and share icons)
│   └── pages/
│       ├── firebase.js   # Initialization configuration for Firebase Realtime & Firestore
│       ├── Toggle.jsx    # Side panel menu profile settings
│       ├── Invoice.jsx   # Page 1: Interactive Invoice Builder & customer intake form
│       └── Invoice2.jsx  # Page 2: High-fidelity Invoice Preview sheet & distribution deck
```

---

## 3. Application Workflow & Routes

### Route `/` — Invoice Builder (`Invoice.jsx`)
This screen functions as the cashier's main workbench:
1.  **Barcode Scanning / Manual Search**: Casher enters or scans a product identifier (e.g. `123ABC` for puma shoes, `942933` for Semis sneakers).
2.  **Interactive Product Cart**: Shows the list of footwear added, allowing casher to adjust quantities (`+` or `–` buttons) or remove items.
3.  **Customer Registration Form**: Casher captures Name, Email, and Phone. Active validations run immediately (e.g., email format check, and phone length checks).
4.  **Totals & Discount Panel**: Computes subtotal, applied discount, and net payable bill value.
5.  **Submit & Save**: Saves the record to Realtime DB (`invoices/invoice1`), commits a permanent doc to Firestore (`invoices/<invoiceNumber>_<name>`), saves it to `localStorage`, and routes the cashier to `/invoice2`.

### Route `/invoice2` — Invoice Exporter (`Invoice2.jsx`)
Renders the formal billing slip with action triggers:
1.  **Real-Time Data Sync**: Dynamically retrieves the invoice from the `location.state` parameter, falling back to Firebase or `localStorage` data state.
2.  **Back Button**: Returns to builder for quick changes.
3.  **PDF Exporters (Print / Download)**: Compiles the printable component into an A4 sheet using canvas-scaling controls (`scale: 2`, `useCORS: true`, white background) and caches the document blob.
4.  **WhatsApp Integration**:
    *   Validates customer phone digits.
    *   Captures the invoice rendering, uploads it to Cloudinary (`invoice_preset` Preset), and gets the image URL.
    *   Fires up a pre-formatted template with Customer Name, Invoice ID, Date, Amount, and the Cloudinary receipt link via `wa.me` protocol.
5.  **EmailJS Transmission**:
    *   Generates the invoice image on Cloudinary.
    *   Dispatches an elegant, styled email containing full calculation tables, and visual preview image.
