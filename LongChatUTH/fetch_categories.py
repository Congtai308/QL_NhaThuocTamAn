# fetch_categories.py
import requests
from bs4 import BeautifulSoup
import time

def fetch_products_from_category(category_url, max_pages=3):
    """Crawl sản phẩm trong 1 danh mục (giới hạn max_pages để tránh bị chặn)"""
    print(f"\n🛒 Đang lấy sản phẩm từ danh mục: {category_url}")
    products = []

    for page in range(1, max_pages + 1):
        url = f"{category_url}?page={page}"
        print(f"   ➜ Trang {page}: {url}")

        r = requests.get(url)
        if r.status_code != 200:
            print("   ⚠️ Không truy cập được trang này.")
            break

        soup = BeautifulSoup(r.text, "html.parser")
        items = soup.select(".product-item, .product-list-item")

        if not items:
            print("   ❌ Không có thêm sản phẩm. Dừng lại.")
            break

        for item in items:
            link_tag = item.find("a", href=True)
            name_tag = item.find("h3")
            if link_tag:
                products.append({
                    "name": name_tag.text.strip() if name_tag else "Chưa rõ tên",
                    "url": "https://nhathuoclongchau.com.vn" + link_tag["href"]
                })
        time.sleep(1)  # nghỉ giữa mỗi trang

    print(f"✅ Tổng cộng {len(products)} sản phẩm từ danh mục này.")
    return products
