# # utils.py
# import json

# def save_to_json(data, filename="longchau_products.json"):
#     with open(filename, "w", encoding="utf-8") as f:
#         json.dump(data, f, ensure_ascii=False, indent=2)
#     print(f"💾 Đã lưu {len(data)} sản phẩm vào {filename}")
import json, os

def save_to_json(data, filename="longchau_products.json"):
    """Lưu JSON an toàn, tránh hỏng giữa chừng"""
    if not data:
        print("⚠️ Không có dữ liệu để lưu.")
        return

    tmp_file = filename + ".tmp"
    with open(tmp_file, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")  # kết thúc file đúng chuẩn UTF-8

    os.replace(tmp_file, filename)
    print(f"💾 Đã lưu {len(data)} sản phẩm vào {filename}")

