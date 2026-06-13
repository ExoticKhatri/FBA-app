# **System Design & UI/UX Architecture Document**

## **Project: FBA Liquidation Simulator (v1.0)**

**Document Purpose:** This document defines the frontend page layout, interface structure, visual design system, and component hierarchies for development. It acts as the blueprint for building a soft, modern, and aesthetically cohesive UI using Tailwind CSS.

## ---

**1\. Design System & Visual Identity**

The visual direction completely avoids harsh borders, high contrast lines, or brutalist layouts. Instead, it relies on soft shadows, subtle gradients, rounded corners, and generous whitespace to create a professional, premium SaaS experience.

### **1.1. Color Palette**

| Element Group | Color Description | Tailwind CSS Classes   |
| :---- | :---- | :---- |
| **Canvas Background** | Soft, muted off-white with a hint of warm gray | bg-slate-50 / bg-zinc-50 |
| **Surface Elements** | Pure crisp white for cards, panels, and sidebars | bg-white |
| **Primary Accent** | Deep Indigo/Violet for main actions and focus points | text-indigo-600 / bg-indigo-600 |
| **Success (Capital Preserved)** | Soft, emerald mint green for positive curves | text-emerald-600 / bg-emerald-50 |
| **Alert (Compounding Fees)** | Soft rose/coral red for loss curves and alerts | text-rose-500 / bg-rose-50 |
| **Typography (Primary)** | Deep slate charcoal (never pure black \#000) | text-slate-800 |
| **Typography (Secondary)** | Muted cool gray for captions and secondary text | text-slate-500 |

### **1.2. Design Details**

* **Borders & Radii:** Use extra-rounded corners (rounded-2xl or rounded-3xl) on all dashboard cards and modal windows to enforce a soft UI style. Borders should be extremely faint (border border-slate-100).  
* **Shadows:** Replace harsh dark borders with soft, ambient ambient drop shadows (shadow-sm to shadow-xl with high blur and low opacity layouts).  
* **Typography:** Inter or custom geometric sans-serif fonts with soft, tracking adjustments for crisp readability.

## ---

**2\. Page Hierarchy & Functional Screens**

The application structure is streamlined into three high-converting pages, designed for instant time-to-value for the end user.

### **2.1. Screen 1: Marketing Landing Page (Conversion Layer)**

A minimalist, clean page focused on getting the user to try the manual simulator or immediately connect their upload.

* **Section 1: Hero Banner:**  
  * A bold, soft-aesthetic header: "Stop Bleeding Amazon FBA Storage Fees."  
  * Subtext explaining that the tool instantly identifies dead-stock inflection points.  
  * Two primary Call-To-Action (CTA) buttons: "Launch Free Simulator" and "Upload Inventory Report."  
* **Section 2: Live Mini-Preview Carousel:**  
  * A non-interactive or lightly interactive static mockup of the Plotly line chart highlighting how the fee curve spikes over a 12-month period.  
* **Section 3: Simple Features Grid:**  
  * Three clean, spacious cards detailing: Ingestion, Multi-scenario Analysis, and Razorpay Premium Upgrades.  
* **Section 4: Soft Pricing Panel:**  
  * A single premium pricing card presenting the flat subscription cost, utilizing a soft gradient card treatment to stand out. Contains a "Unlock Premium Access" button tied to Razorpay.

### **2.2. Screen 2: Interactive Main Dashboard (Core Application Workspace)**

The core interface where all simulation operations, file rendering, and premium gates exist. It utilizes a persistent split-pane app layout.

* **Left Sidebar Control Panel (Fixed Width, Soft White Surface):**  
  * *File Management Block:* A soft drag-and-drop file ingestion zone with dotted, light gray borders. Prompts for the standard Amazon CSV report. If user is on the Free tier, this displays a subtle padlock badge pointing to the premium upgrade.  
  * *Manual Parameter Adjusters:* Sliders and numerical input fields for single-product simulation (Unit Inventory, Current Monthly Velocity, Purchase Price, Current FBA Storage Category selector).  
  * *Strategy Controls:* Interactive toggle switches or sliders to fine-tune the "Aggressive Liquidation Discount %" dynamically updating charts on the right.  
* **Right Workspace Panel (Fluid Width, Muted Canvas Background):**  
  * *Metric Summary Ribbon:* Four high-level metric blocks showing summary outputs instantly:  
    1. Projected 12-Month Fees (Red text layout)  
    2. Optimal Liquidation Date (Indigo text layout)  
    3. Capital Recoverable via Discounting (Green text layout)  
    4. FBA Storage Volume Occupied (Slate text layout)  
  * *Main Plotly Graph Containment Area:* A large, elevated white surface card containing the live rendering of the interactive Multi-Scenario line chart. It maps out time on the X-axis against financial value on the Y-axis.  
  * *Premium Action Banner:* A soft-tinted green bar anchored at the bottom for users to "Export This Action Plan as a PDF Summary Layout," prompting the payment flow if unauthenticated.

### **2.3. Screen 3: Billing & Account Portal**

A minimal, highly secure-looking settings utility page for premium users.

* **Main Layout Container:** A centered single-column layout displaying the current active tier status, current billing cycle renewal dates pulled via Razorpay events, and a simple transaction history log.

## ---

**3\. Interactive Component Requirements**

* **Plotly UI Wrapping:** The line and area charts rendered via Plotly must be styled to seamlessly blend into the soft canvas background. Hover tooltips must utilize smooth rounded shapes, and graph line traces must use custom aesthetic hex color maps specified in Section 1.1 instead of standard defaults.  
* **File Upload Interaction:** When a file is dragging over the workspace, the entire upload drop zone must transition gracefully to an ultra-soft blue/indigo tint surface with a smooth animation loop to indicate parsing read-readiness.

## ---

**4\. Implementation Instructions for Claude Code**

*Notice: Maintain absolute strict adherence to Next.js App Router conventions. If any visual specifications or interface requirements are missing during development, pause immediately and query the user for structural sign-off.*