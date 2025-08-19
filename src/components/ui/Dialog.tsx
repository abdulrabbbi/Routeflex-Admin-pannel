import React, { useEffect, useRef } from "react";

export const Dialog = ({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) => {
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      onClick={(e) => {
        if (e.target === overlayRef.current) onOpenChange(false);
      }}
    >
      {/* overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn" />
      {/* content */}
      <div className="relative z-10 w-full max-w-3xl mx-4 animate-scaleIn">
        {children}
      </div>
    </div>
  );
};

export const DialogContent = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={`bg-white rounded-2xl shadow-xl ring-1 ring-black/5 ${className}`}
    >
      {children}
    </div>
  );
};

interface DialogSectionProps {
  children: React.ReactNode;
  className?: string;
}

export const DialogHeader = ({ children, className = "" }: DialogSectionProps) => {
  return <div className={`mb-0 ${className}`}>{children}</div>;
};

export const DialogTitle = ({ children, className = "" }: DialogSectionProps) => {
  return <h2 className={`text-xl font-bold ${className}`}>{children}</h2>;
};


