import React, { useState, ReactNode } from "react";

interface TabsProps {
  children: ReactNode;
  className?: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
}

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function Tabs({
  children,
  className = "",
  defaultValue,
  value: controlledValue,
  onValueChange,
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue || "");
  const value = controlledValue ?? internalValue;

  const handleChange = (val: string) => {
    if (onValueChange) onValueChange(val);
    else setInternalValue(val);
  };

  // Clone children and pass down props
  const cloned = React.Children.map(children, (child: any) =>
    React.cloneElement(child, { activeValue: value, onChange: handleChange })
  );

  return <div className={className}>{cloned}</div>;
}

export function TabsList({
  children,
  className = "",
  activeValue,
  onChange,
}: TabsListProps & { activeValue?: string; onChange?: (val: string) => void }) {
  return (
    <div className={`flex border-b ${className}`}>
      {React.Children.map(children, (child: any) =>
        React.cloneElement(child, { activeValue, onChange })
      )}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  activeValue,
  onChange,
}: TabsTriggerProps & { activeValue?: string; onChange?: (val: string) => void }) {
  const isActive = activeValue === value;
  return (
    <button
      onClick={() => onChange && onChange(value)}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        isActive
          ? "border-green-500 text-green-600"
          : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  activeValue,
  className = "",
}: TabsContentProps & { activeValue?: string }) {
  if (activeValue !== value) return null;
  return <div className={className}>{children}</div>;
}
