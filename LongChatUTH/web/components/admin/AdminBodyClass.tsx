"use client";

import { useEffect } from "react";

export default function AdminBodyClass() {
  useEffect(() => {
    const body = document.body;
    // Lưu lại class ban đầu để trả về khi rời admin
    const prev = body.className;

    // Gỡ nền người dùng, thêm class admin
    body.classList.remove("longchau-bg");
    body.classList.add("admin-page");

    return () => {
      body.className = prev; // Trả lại đúng trạng thái cũ khi rời admin
    };
  }, []);

  return null;
}
