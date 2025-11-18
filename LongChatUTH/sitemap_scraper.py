# sitemap_scraper.py
import requests
from bs4 import BeautifulSoup

def get_urls_from_sitemap(sitemap_url):
    """Lấy tất cả URL sản phẩm (.html) từ sitemap"""
    response = requests.get(sitemap_url)
    response.encoding = "utf-8"

    if response.status_code != 200:
        print(f"❌ Không tải được: {sitemap_url}")
        return []

    soup = BeautifulSoup(response.content, "lxml-xml")
    urls = [loc.text for loc in soup.find_all("loc")]
    product_urls = [u for u in urls if u.endswith(".html")]
    print(f"🛒 {len(product_urls)} sản phẩm từ {sitemap_url}")
    return product_urls
