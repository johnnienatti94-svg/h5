"use client";

import React from "react";
import GooeyDock from "@/components/ui/gooey-dock";
import {
  Home,
  Search,
  Bell,
  Settings,
  User,
} from "lucide-react";

export default function DemoOne() {
  const dockItems = [
    { icon: Home, label: "Home", onClick: () => alert("Home clicked") },
    { icon: Search, label: "Search", onClick: () => alert("Search clicked") },
    { icon: Bell, label: "Notifications", onClick: () => alert("Notifications clicked") },
    { icon: User, label: "Profile", onClick: () => alert("Profile clicked") },
    { icon: Settings, label: "Settings", onClick: () => alert("Settings clicked") },
  ];

  return <GooeyDock items={dockItems} />;
}
