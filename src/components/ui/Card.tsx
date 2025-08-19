import React from "react";

export const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`bg-white p-4 rounded shadow ${className}`}>
      {children}
    </div>
  );
};
