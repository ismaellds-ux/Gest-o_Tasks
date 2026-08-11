"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface TabsProps {
  isAdmin: boolean;
  podeVerTasks2: boolean;
}

export function Tabs({ isAdmin, podeVerTasks2 }: TabsProps) {
  const pathname = usePathname();

  const tabs = [
    { href: "/tasks1", label: "Tasks 1" },
    ...(podeVerTasks2 ? [{ href: "/tasks2", label: "Tasks 2" }] : []),
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <nav className="flex gap-1.5">
      {tabs.map((tab) => {
        const active = pathname?.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
              active ? "bg-violet-dim text-violet" : "text-fg-secondary hover:bg-surface-light hover:text-fg"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
