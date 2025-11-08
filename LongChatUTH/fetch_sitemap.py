# fetch_sitemap.py
import requests
from bs4 import BeautifulSoup

def fetch_urls_from_sitemap(main_sitemap="https://nhathuoclongchau.com.vn/sitemap.xml"):
    print("🔍 Đang tải sitemap chính...")
    response = requests.get(main_sitemap)
    soup = BeautifulSoup(response.text, "xml")

    # Lấy danh sách sitemap con
    subs = [loc.text for loc in soup.find_all("loc")]
    print(f"✅ Tìm thấy {len(subs)} sitemap con.")

    all_product_urls = []
    category_sitemaps = []

    for sub in subs:
        if "sitemap_" in sub:
            print(f"📂 Đang đọc: {sub}")
            sub_r = requests.get(sub)
            sub_soup = BeautifulSoup(sub_r.text, "xml")
            urls = [loc.text for loc in sub_soup.find_all("loc")]

            # Lọc URL sản phẩm thật
            product_urls = [u for u in urls if "/san-pham/" in u or "/p/" in u]
            all_product_urls.extend(product_urls)

            # Lưu sitemap danh mục (nếu cần)
            if not product_urls:
                category_sitemaps.append(sub)

    print(f"🔗 Đã lấy tổng cộng {len(all_product_urls)} sản phẩm từ tất cả sitemap con.")
    return all_product_urls, category_sitemaps
