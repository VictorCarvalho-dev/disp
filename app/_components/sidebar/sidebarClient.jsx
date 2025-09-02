"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Home,
  MessageSquare,
  Users,
  Settings,
  Send,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Flame as Fire,
  Check,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import Cookies from "js-cookie";
import { usePathname, useRouter } from "next/navigation";

export default function SidebarClient({ permission }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [login, setLogin] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const getActiveItem = () => {
    const path = pathname.split('/')[1];
    return path || 'dashboard';
  };

  const activeItem = getActiveItem();

  const handleLogout = () => {
    Cookies.remove('user');
    window.location.href = '/';
  };

  const menuItems =
    permission === "admin" ? [
      { id: "dashboard", label: "Dashboard", icon: Home, link: "/dashboard" },
      { id: "connections", label: "Conexões", icon: MessageSquare, link: "/connections" },
      { id: "contacts", label: "Contatos", icon: Users, link: "/contacts" },
      { id: "messages", label: "Disparos", icon: Send, link: "/messages" },
      { id: "heater", label: "Aquecer", icon: Fire, link: "/heater" },
      { id: "check", label: "Check", icon: Check, link: "/check" },
      { id: "users", label: "Usuários", icon: Users, link: "/users" },
      // { id: "settings", label: "Configurações", icon: Settings, link: "/settings" },
    ] : [
      { id: "dashboard", label: "Dashboard", icon: Home, link: "/dashboard" },
      { id: "connections", label: "Conexões", icon: MessageSquare, link: "/connections" },
      { id: "contacts", label: "Contatos", icon: Users, link: "/contacts" },
      { id: "messages", label: "Disparos", icon: Send, link: "/messages" },
    ];

  const bottomMenuItems = [
    { id: "logout", label: "Sair", icon: LogOut, onClick: handleLogout },
  ];



  return (
    <div className={`${pathname !== "/" ? "" : "hidden"} h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ${isCollapsed ? 'w-18' : 'w-64'}`}>
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-green-600 rounded-lg flex items-center justify-center">
                  <FaWhatsapp className="w-5 h-5 text-white" />
                </div>
                <h1 className="font-bold text-md bg-gradient-to-r from-green-600 to-green-600 bg-clip-text text-transparent">
                  WhatsApp Disparo
                </h1>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8 p-0 hover:bg-green-100 dark:hover:bg-green-900/20"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>



        <nav className="flex-1 px-4 py-2">
          <div className="space-y-1">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;
              return (
                <Button
                  key={item.label || index}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start h-10 ${isActive
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "hover:bg-green-50 dark:hover:bg-green-950/20 text-slate-700 dark:text-slate-300"
                    } ${isCollapsed ? "px-2" : "px-3"}`}
                  onClick={() => {
                    if (item.link) {
                      router.push(item.link);
                    }
                  }}
                >
                  <Icon className={`h-4 w-4 ${isCollapsed ? "" : "mr-3"}`} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <Badge
                          variant="secondary"
                          className="ml-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Button>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="space-y-1">
            {bottomMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={item.onClick}
                  className={`w-full justify-start h-10 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 ${isCollapsed ? "px-2" : "px-3"
                    }`}
                >
                  <Icon className={`h-4 w-4 ${isCollapsed ? "" : "mr-3"}`} />
                  {!isCollapsed && item.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}