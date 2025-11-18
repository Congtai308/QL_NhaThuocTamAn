# fix_json.py
import re, json

path = "longchau_products.json"
txt  = open(path, "r", encoding="utf-8").read()

# 1) Cắt bỏ mọi thứ sau dấu ']' cuối cùng (rác ở đuôi file)
last_br = txt.rfind("]")
if last_br != -1:
    txt = txt[:last_br+1]

# 2) Bỏ dấu phẩy thừa ngay trước ']' (… , ])
txt = re.sub(r",\s*]", "]", txt)

# 3) Lưu tạm và xác thực lại
open(path, "w", encoding="utf-8").write(txt.strip() + "\n")

# Validate
try:
    json.load(open(path, encoding="utf-8"))
    print("✅ Đã sửa: JSON hợp lệ")
except json.JSONDecodeError as e:
    print("❌ Vẫn lỗi:", e)
