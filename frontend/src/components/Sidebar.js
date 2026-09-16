"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Search,
  Bell,
  MapPin,
  Settings,
  Eye
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navigationItems = [
    { href: "/", label: "Dashboard", icon: Activity },
    { href: "/search", label: "AI Search", icon: Search },
    { href: "/alerts", label: "Security Alerts", icon: Bell, badge: 3 },
    { href: "/cameras", label: "Camera Channels", icon: MapPin },
    { href: "/settings", label: "System & AI Rules", icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-20 flex-col items-center border-r border-slate-200 bg-white py-5 lg:flex z-30 shadow-xs">
      <Link 
        href="/"
        className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-white shadow-md hover:scale-105 transition"
      >
        <Eye size={22} />
      </Link>
      <nav className="mt-10 flex flex-1 flex-col gap-3">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex h-11 w-11 items-center justify-center rounded-lg transition cursor-pointer ${
                isActive 
                  ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-xs" 
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              }`}
              title={item.label}
            >
              <Icon size={20} />
              {item.badge && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-xs">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
