import json
import uuid
from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify


import os

app.secret_key = os.environ.get("SECRET_KEY", "temporary-development-key")
GST_RATE = 0.18


def get_products():
    with open("products.json", "r", encoding="utf-8") as file:
        return json.load(file)


def save_products(products):
    with open("products.json", "w", encoding="utf-8") as file:
        json.dump(products, file, indent=2)


def build_summary(cart_dict, products):
    grouped_sellers = {}
    subtotal = 0

    for prod_id_str, qty in cart_dict.items():
        product = next((p for p in products if str(p["id"]) == str(prod_id_str)), None)
        if not product or int(qty) <= 0:
            continue

        valid_qty = min(int(qty), int(product["stock"]))
        if valid_qty <= 0:
            continue

        line_total = product["price"] * valid_qty
        subtotal += line_total
        seller = product.get("seller", "Default Seller")
        grouped_sellers.setdefault(seller, []).append({
            "id": product["id"],
            "name": product["name"],
            "price": product["price"],
            "qty": valid_qty,
            "line_total": line_total
        })

    gst = round(subtotal * GST_RATE, 2)
    total = round(subtotal + gst, 2)
    return grouped_sellers, subtotal, gst, total


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/products")
def products():
    return jsonify(get_products())


@app.route("/checkout", methods=["GET", "POST"])
def checkout():
    product_list = get_products()
    cart = session.get("cart", {})

    if request.method == "POST":
        incoming_cart = request.form.get("cart_data")
        if incoming_cart:
            try:
                parsed = json.loads(incoming_cart)
                if isinstance(parsed, dict) and parsed:
                    cart = parsed
            except json.JSONDecodeError:
                pass

        grouped_sellers, subtotal, gst, total = build_summary(cart, product_list)
        if not grouped_sellers:
            flash("Your cart is empty or items are out of stock.")
            return redirect(url_for("checkout"))

        for prod_id_str, qty in cart.items():
            for product in product_list:
                if str(product["id"]) == str(prod_id_str):
                    deduct = min(int(qty), int(product["stock"]))
                    product["stock"] = max(0, int(product["stock"]) - deduct)

        save_products(product_list)
        session["cart"] = {}

        order_record = {
            "order_id": f"BAL-{uuid.uuid4().hex[:8].upper()}",
            "customer_name": request.form.get("customer_name", "").strip(),
            "phone": request.form.get("phone", "").strip(),
            "address": request.form.get("address", "").strip(),
            "payment_method": request.form.get("payment_method", "UPI"),
            "grouped_sellers": grouped_sellers,
            "subtotal": subtotal,
            "gst": gst,
            "total": total
        }
        return render_template("order_success.html", order=order_record)

    grouped_sellers, subtotal, gst, total = build_summary(cart, product_list)
    return render_template(
        "checkout.html",
        grouped_sellers=grouped_sellers,
        subtotal=subtotal,
        gst=gst,
        total=total
    )


if __name__ == "__main__":
    app.run(debug=True)