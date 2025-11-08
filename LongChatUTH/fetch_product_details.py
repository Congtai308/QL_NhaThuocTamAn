# fetch_product_details.py
import requests
from bs4 import BeautifulSoup
import time

def fetch_product_details(product_url):
    """Lấy thông tin chi tiết từ trang sản phẩm"""
    try:
        r = requests.get(product_url, timeout=10)
        r.raise_for_status()
    except Exception as e:
        print(f"⚠️ Lỗi khi truy cập {product_url}: {e}")
        return None

    soup = BeautifulSoup(r.text, "html.parser")

    name = soup.find("h1")
    price = soup.select_one(".price, .product-price")
    desc = soup.select_one("#mo-ta, .product-description")
    img = soup.select_one("img[data-src], img[src]")

    product = {
        "name": name.text.strip() if name else "Chưa rõ tên",
        "price": price.text.strip() if price else "Chưa có giá",
        "description": desc.text.strip() if desc else "Chưa có mô tả",
        "image": img["data-src"] if img and img.has_attr("data-src") else (img["src"] if img else None),
        "url": product_url
    }

    time.sleep(1)
    return product
