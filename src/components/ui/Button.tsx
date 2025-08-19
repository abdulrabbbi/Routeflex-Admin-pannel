import React from "react";

export const Button = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      {...props}
      className={`bg-[#22c55e] text-white px-4 py-2 rounded hover:bg-[#16a34a]" disabled:opacity-50 disabled:cursor-not-allowed ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
};
