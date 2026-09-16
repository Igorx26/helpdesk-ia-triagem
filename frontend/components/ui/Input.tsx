import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, error, ...props }, ref) => {
  return (
    <div className="w-full">
      <input
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent transition-all disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-[#DC2626] focus:ring-[#DC2626]",
          className,
        )}
        {...props}
      />
      {error && <span className="text-xs text-[#DC2626] mt-1 block">{error}</span>}
    </div>
  );
});

Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, error, ...props }, ref) => {
  return (
    <div className="w-full">
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[100px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent transition-all disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-[#DC2626] focus:ring-[#DC2626]",
          className,
        )}
        {...props}
      />
      {error && <span className="text-xs text-[#DC2626] mt-1 block">{error}</span>}
    </div>
  );
});

Textarea.displayName = "Textarea";
