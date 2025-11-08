from sitemap_scraper import get_urls_from_sitemap
from product_scraper import get_product_details
from utils import save_to_json
import time

def main():
    sitemap_urls = [
        "https://nhathuoclongchau.com.vn/sitemap_thuoc.xml",
    ]

    all_products = []
    max_valid = 10  # chỉ lấy 20 sản phẩm hợp lệ
    total_checked = 0
    total_skipped = 0

    print("🔍 Bắt đầu lấy danh sách sản phẩm...")

    for sitemap in sitemap_urls:
        product_urls = get_urls_from_sitemap(sitemap)
        print(f"📦 Tổng {len(product_urls)} sản phẩm trong {sitemap}")

        for url in product_urls:
            total_checked += 1
            print(f"➡️ [{len(all_products)+1}] Đang lấy: {url}")

            data = get_product_details(url)
            if data:
                all_products.append(data)
                print(f"✅ Lấy thành công: {data['name'][:60]}...")
            else:
                total_skipped += 1
                print(f"❌ Bỏ qua (không hợp lệ): {url}")

            # Dừng nếu đủ 20 sản phẩm hợp lệ
            if len(all_products) >= max_valid:
                break

            time.sleep(1.2)  # tránh bị chặn

        if len(all_products) >= max_valid:
            break

    # Lưu kết quả hợp lệ
    save_to_json(all_products, "longchau_products.json")
    print(f"\n✅ Hoàn tất! Lưu {len(all_products)} sản phẩm hợp lệ.")
    print(f"🚫 Bỏ qua {total_skipped} sản phẩm lỗi hoặc không có giá.")
    print(f"📄 File: longchau_products.json")

if __name__ == "__main__":
    main()
