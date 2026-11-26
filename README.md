# Bharat Agrolink — Mini Agriculture Marketplace

A lightweight agriculture e-commerce marketplace module built with **Python (Flask)**, **HTML/CSS**, and **Vanilla JavaScript** for the Bharat Agrolink Technical Assessment. Customers can browse agricultural products by category, manage cart quantities with live stock validation, and view a seller-grouped order summary with 18% GST calculation.

## Features

- **Product Listing & Filtering:** Displays product name, image, seller, price, and available stock with dynamic category filtering (`All`, `Seeds`, `Fertilizers`).
- **Stock-Aware Cart:** Prevents adding out-of-stock items (`stock === 0`) and caps cart quantities at available inventory when incrementing (`+`) or decrementing (`−`).
- **Seller-Wise Order Summary:** Groups cart items by seller (`Seller A`, `Seller B`, etc.) and computes the subtotal, **18% GST**, and final payable amount in real time.
- **REST API Endpoint:** Serves product catalog data from a structured JSON datastore via `GET /api/products`.

## Tech Stack

- **Backend:** Python 3, Flask
- **Frontend:** HTML5, CSS3, JavaScript (ES6 Fetch API)
- **Data Storage:** JSON (`products.json`)

## Project Structure

```text
bharat-agrolink/
├── app.py               # Flask server & /api/products endpoint
├── products.json        # Sample agricultural product dataset
├── requirements.txt     # Python dependencies
├── README.md            # Project documentation
├── templates/
│   └── index.html       # Main marketplace UI template
└── static/
    ├── style.css        # Responsive grid & card styling
    └── script.js        # Filtering, cart state, stock validation & GST logic