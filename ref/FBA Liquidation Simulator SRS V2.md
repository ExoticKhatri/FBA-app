# **Software Requirements Specification (SRS)**

## **Project: FBA Liquidation Simulator (v2.0)**

**Document Context:** This document serves as the master specification for an AI-assisted development workflow (using Claude Code/Next.js). The goal is to build a highly targeted, single-day-build mini-SaaS targeting mid-tier Amazon FBA sellers struggling with long-term storage fees.

## ---

**1\. Executive Summary & Market Positioning**

* **Target Audience:** Mid-tier Amazon FBA (Fulfillment by Amazon) private label sellers.  
* **Core Problem:** Amazon's steep monthly and long-term storage fees bleed profitability from slow-moving stock ("dead stock"). Sellers struggle to mathematically determine when it is cheaper to drop prices and liquidate versus leaving stock in FBA warehouses.  
* **Value Proposition:** A "file-in, insight-out" interactive simulator that visualizes the exact crossover point where holding stock becomes more expensive than liquidating it at a discount.

## ---

**2\. Tech Stack & Infrastructure Setup**

The application must be optimized for a fast, serverless deployment with zero infrastructure management overhead on day one.

| Layer | Technology | Deployment Strategy   |
| :---- | :---- | :---- |
| **Frontend & Routing** | Next.js | Hosted on Vercel |
| **Monetization Engine** | Razorpay | Gated access verified via webhooks or secure payment verification routes |

## ---

**3\. Deep-Dive Feature Specifications & Monetization Gating**

### **3.1. Free Tier Features**

* **Manual Single-Product Simulator:** Form fields allowing users to input variables manually:  
  * Current Unit Quantity (e.g., 500 units)  
  * Unit Dimensions/Weight Category (Standard vs. Oversize)  
  * Average Monthly Sales Velocity (units/month)  
  * Current Selling Price & Landed Cost per Unit  
* **Basic Financial Curve:** An interactive Plotly line chart projecting cumulative holding fees over a 12-month timeline vs. an immediate liquidation cash-out baseline.

### **3.2. Paid Tier Features (Premium / Free Trial Gated)**

* **Bulk Amazon CSV Ingestion:** Instead of manual input, users upload their standard Amazon Inventory Health / Recommended Removal reports.  
* **Automated Fee Calculations:** Background parsing of exact Amazon storage fee tier schedules (peak vs. non-peak months, and the critical 180-day and 365-day aged storage surcharges).  
* **Multi-Scenario Liquidation Matrix:** High-fidelity Plotly charts comparing 4 simulation curves simultaneously:  
  1. *Do Nothing Strategy:* Maintain current price, paying compounding storage fees.  
  2. *Aggressive Discount Strategy:* Slash prices by 50% to trigger velocity.  
  3. *Liquidate via Amazon Outlet:* Bulk clear stock at rock-bottom recovery values.  
  4. *Removal/Destruction Order:* Pay Amazon's flat per-unit removal fee to ship inventory back to a local warehouse.  
* **Exportable Action Plan:** A generated downloadable PDF/CSV breakdown detailing precisely how many units of which SKU to remove tonight to avoid the upcoming monthly fee cycle.

## ---

**4\. Functional Architecture & Data Flow**

### **4.1. Step-by-Step Data Pipeline**

1. The user uploads an inventory CSV on the client side.  
2. The client-side parser extracts relevant columns (SKU, Quantity, Volume, Storage Age).  
3. The simulator processes the values against the standard Amazon fee matrix formula:  
   Total Fee \= (Cubic Feet \* Monthly Rate Base) \+ Aged Surcharges (if Age \> 180 days)  
4. Plotly renders an interactive line/area graph visualizing cumulative loss over time.

## ---

**5\. UI/UX Wireframe Guidelines (Tailwind UI)**

* **Dashboard Layout:** A clean, dashboard interface. Sidebar containing active file status and quick parameter sliders (e.g., "Adjust Liquidation Discount %"). Main panel reserved entirely for Plotly visualizations.  
* **Visual Indicators:** Use bright crimson color schemes for compounding fee losses and deep green blocks to represent preserved capital recovered via fast liquidation.

## ---

**6\. Instructions to Claude Code & Implementation Queries**

*Developer Notice: When executing this file, follow Next.js structural standards. If any other infrastructure, backend, or operational setup information is required to execute this code, ask the user directly before proceeding.*