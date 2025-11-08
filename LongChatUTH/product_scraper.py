import os, re, json, unicodedata
from urllib.parse import urljoin
import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"
    ),
    "Accept-Language": "vi,en;q=0.9",
}

# -------------------------------
# ✳️ Hàm tiện ích
# -------------------------------
def normalize(s):
    """Chuẩn hóa chuỗi tiếng Việt, bỏ dấu & chữ hoa."""
    if not s:
        return ""
    s = unicodedata.normalize("NFKD", s)
    return "".join(c for c in s if not unicodedata.combining(c)).lower().strip()


def download_image(url, product_name, folder="images"):
    """Tải ảnh về thư mục images/ và trả về đường dẫn cục bộ"""
    if not url or "http" not in url:
        return ""
    os.makedirs(folder, exist_ok=True)
    ext = os.path.splitext(url.split("?")[0])[-1] or ".jpg"
    safe_name = re.sub(r"[^\w\s-]", "", product_name).strip().replace(" ", "_")[:100]
    filename = f"{safe_name}{ext}"
    path = os.path.join(folder, filename)

    try:
        res = requests.get(url, headers=HEADERS, timeout=15)
        if res.status_code == 200:
            with open(path, "wb") as f:
                f.write(res.content)
            print(f"📸 Ảnh đã lưu: {path}")
            return path.replace("\\", "/")
    except Exception as e:
        print(f"⚠️ Không tải được ảnh {url}: {e}")
    return ""


# -------------------------------
# 🔍 Tách đơn vị tính + giá từ NEXT_DATA
# -------------------------------
def extract_units_from_next_data(data):
    """Duyệt đệ quy __NEXT_DATA__ để tìm các đơn vị tính và giá"""
    result = []

    def walk(obj):
        if isinstance(obj, dict):
            # Nếu có trường "units"
            if "units" in obj and isinstance(obj["units"], list):
                for u in obj["units"]:
                    unit_name = (
                        u.get("name")
                        or u.get("unit")
                        or u.get("unitName")
                        or ""
                    ).strip()

                    price = (
                        str(u.get("price") or u.get("salePrice") or "")
                        .replace("₫", "đ")
                        .strip()
                    )

                    if unit_name and re.search(r"\d[\d\.]*\s?[đ₫]", price):
                        p = (
                            re.search(r"\d[\d\.]*\s?[đ₫]", price)
                            .group(0)
                            .replace("₫", "đ")
                            .replace(" ", "")
                        )
                        result.append({"unit": unit_name, "price": p})

            # Duyệt sâu vào các key có thể chứa cấu trúc lồng
            for key in ["variants", "skus", "items", "offers"]:
                if key in obj and isinstance(obj[key], (list, dict)):
                    walk(obj[key])

            for v in obj.values():
                walk(v)

        elif isinstance(obj, list):
            for v in obj:
                walk(v)

    walk(data)
    return result


# -------------------------------
# 🧠 Lấy chi tiết sản phẩm Long Châu
# -------------------------------
def get_product_details(url):
    """Lấy thông tin sản phẩm Long Châu — đồng bộ với MySQL"""
    try:
        r = requests.get(url, headers=HEADERS, timeout=20)
        r.encoding = "utf-8"
        if r.status_code != 200:
            print(f"⚠️ Không tải được: {url}")
            return None

        soup = BeautifulSoup(r.text, "html.parser")
        name = soup.find("h1").get_text(strip=True) if soup.find("h1") else ""

        # --- Lấy JSON gốc từ __NEXT_DATA__ ---
        next_data_tag = soup.find("script", id="__NEXT_DATA__")
        units, base_price = [], ""
        if next_data_tag and next_data_tag.string:
            try:
                data = json.loads(next_data_tag.string)
                units = extract_units_from_next_data(data)
                offer_price = (
                    str(
                        data.get("props", {})
                        .get("pageProps", {})
                        .get("product", {})
                        .get("price", "")
                    ).strip()
                )
                base_price = offer_price + "đ" if offer_price else ""
            except Exception as e:
                print("⚠️ Không đọc được NEXT_DATA:", e)

        # --- Fallback giá ---
        if not base_price:
            price_tag = soup.find(text=re.compile(r"\d[\d\.]+[đ₫]"))
            base_price = price_tag.strip() if price_tag else ""

        # --- Ảnh ---
        img_tag = soup.select_one(".swiper-slide img, .product-detail__thumb img")
        image = ""
        if img_tag:
            image = img_tag.get("src") or img_tag.get("data-src") or ""
            if image:
                image = urljoin(url, image)
        image_path = download_image(image, name)

        # --- Tiện ích làm sạch text ---
        def clean_html_value(val: str) -> str:
            if not val:
                return ""
            # bỏ thẻ HTML, ký tự xuống dòng và script Cloudflare
            val = re.sub(r"<[^>]+>", " ", val)
            val = re.sub(r"\(function\(.*?\}\)\(\)\;", " ", val)
            val = re.sub(r"\s+", " ", val)
            return val.strip()

        def find_val(label):
            t = soup.find(string=re.compile(label, re.I))
            if t:
                nxt = t.find_next()
                if nxt:
                    return clean_html_value(nxt.get_text(" ", strip=True))
            return ""

        brand = find_val("Thương hiệu")
        category = find_val("Danh mục")
        registration = find_val("Số đăng ký")
        form = find_val("Dạng bào chế")
        size_spec = find_val("Quy cách")
        manufacturer = find_val("Nhà sản xuất")
        origin = find_val("Xuất xứ|Nước sản xuất")
        ingredient = find_val("Thành phần")

        # -------------------------
        # 💰 Làm sạch đơn vị & giá
        # -------------------------
        normalized_units = []
        for u in units:
            u_name = (u.get("unit") or "").strip()
            u_price = (u.get("price") or "").strip()
            if u_name and re.search(r"\d[\d\.]*\s?[đ₫]", u_price):
                p = (
                    re.search(r"\d[\d\.]*\s?[đ₫]", u_price)
                    .group(0)
                    .replace("₫", "đ")
                    .replace(" ", "")
                )
                normalized_units.append({"unit": u_name, "price": p})

        # Nếu không có đơn vị => mặc định Hộp
        if not normalized_units and base_price:
            m = re.search(r"\d[\d\.]*\s?[đ₫]", base_price)
            if m:
                p = m.group(0).replace("₫", "đ").replace(" ", "")
                normalized_units = [{"unit": "Hộp", "price": p}]

        # Chọn đơn vị đầu tiên làm giá hiển thị
        price = ""
        if normalized_units:
            price = f"{normalized_units[0]['price']} / {normalized_units[0]['unit']}"

        # Nếu không có tên hoặc giá => bỏ qua
        if not price or not name:
            print(f"⏩ Bỏ qua {url}: không có tên hoặc giá hợp lệ")
            return None

        # -------------------------
        # ✅ Trả về kết quả sạch
        # -------------------------
        return {
            "url": url,
            "name": name,
            "price": price,
            "units": normalized_units,
            "brand": brand,
            "category": category,
            "registration": registration,
            "form": form,
            "size_spec": size_spec,
            "manufacturer": manufacturer,
            "origin": origin,
            "ingredient": ingredient,
            "image_path": image_path,
        }

    except Exception as e:
        print(f"❌ Lỗi khi xử lý {url}: {e}")
        return None

