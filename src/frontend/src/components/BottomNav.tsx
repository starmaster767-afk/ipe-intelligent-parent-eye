import { useGetUnreadAlerts } from "@/hooks/useQueries";
import { Link, useRouter } from "@tanstack/react-router";
import { Bell, LayoutDashboard, Settings } from "lucide-react";

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  marker: string;
}

export default function BottomNav() {
  const router = useRouter();
  const pathname = router.state.location.pathname;
  const { data: unreadAlerts } = useGetUnreadAlerts();
  const unreadCount = unreadAlerts?.filter((a) => !a.isRead).length ?? 0;

  const items: NavItem[] = [
    {
      to: "/dashboard",
      icon: <LayoutDashboard size={22} />,
      label: "Dashboard",
      marker: "nav.dashboard.link",
    },
    {
      to: "/alerts",
      icon: (
        <div className="relative">
          <Bell size={22} />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
      ),
      label: "Alerts",
      marker: "nav.alerts.link",
    },
    {
      to: "/settings",
      icon: <Settings size={22} />,
      label: "Settings",
      marker: "nav.settings.link",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bottom-nav">
      <div
        className="flex items-center justify-around border-t border-border bg-card/95 backdrop-blur-md"
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 12px)",
          paddingTop: "12px",
        }}
      >
        {items.map((item) => {
          const isActive =
            item.to === "/dashboard"
              ? pathname === "/dashboard" || pathname.startsWith("/child/")
              : pathname === item.to;

          return (
            <Link
              key={item.to}
              to={item.to}
              data-ocid={item.marker}
              className="flex flex-col items-center gap-1 min-w-[64px] py-1 transition-colors"
            >
              <span
                className={
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }
              >
                {item.icon}
              </span>
              <span
                className={`text-[10px] font-medium ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
