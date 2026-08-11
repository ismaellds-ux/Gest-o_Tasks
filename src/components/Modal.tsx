"use client";

import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
}

export function Modal({ title, onClose, children, maxWidth = "max-w-lg" }: ModalProps) {
  const mouseDownNoBackdrop = useRef(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function handleBackdropMouseDown(e: MouseEvent<HTMLDivElement>) {
    mouseDownNoBackdrop.current = e.target === e.currentTarget;
  }

  function handleBackdropClick(e: MouseEvent<HTMLDivElement>) {
    if (mouseDownNoBackdrop.current && e.target === e.currentTarget) {
      onClose();
    }
    mouseDownNoBackdrop.current = false;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={handleBackdropMouseDown}
      onClick={handleBackdropClick}
    >
      <div className={`scrollbar-thin max-h-[90vh] w-full ${maxWidth} overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-2xl`}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-fg">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-fg-muted hover:bg-surface-light hover:text-fg"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
