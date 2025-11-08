// components/home/SectionWrapper.tsx
import React from "react";

export default function SectionWrapper({
  title,
  color = "#0a56c5",
  children,
}: {
  title: string;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="relative my-8 rounded-[28px] shadow-[0_6px_24px_rgba(10,86,197,0.08)] overflow-hidden"
      style={{
        border: `4px solid ${color}`,
        background: "linear-gradient(to bottom, #ffffff, #f9fbff)",
      }}
    >
      {/* Thanh tiêu đề */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
        <span
          className="inline-block rounded-full text-white text-sm font-medium shadow px-6 py-1.5"
          style={{ backgroundColor: color }}
        >
          {title}
        </span>
      </div>

      <div className="pt-6 px-4 pb-4 sm:px-6">{children}</div>
    </section>
  );
}
