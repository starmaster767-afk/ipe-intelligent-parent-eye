import AddChildModal from "@/components/AddChildModal";
import BottomNav from "@/components/BottomNav";
import ChildAvatar from "@/components/ChildAvatar";
import ScreenTimeBar from "@/components/ScreenTimeBar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAllChildren, useGetUnreadAlerts } from "@/hooks/useQueries";
import { Link, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Bell, ChevronRight, Plus, Wifi } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { ChildProfile } from "../backend.d";

// Sample data for screen time display (since real-time tracking is async per child)
const SAMPLE_USAGE: Record<string, { used: number; limit: number }> = {
  default: { used: 135, limit: 240 },
};

function getUsageData(index: number): { used: number; limit: number } {
  const presets = [
    { used: 45, limit: 120 },
    { used: 195, limit: 240 },
    { used: 265, limit: 240 },
    { used: 30, limit: 180 },
  ];
  return presets[index % presets.length] ?? SAMPLE_USAGE.default;
}

function ChildCard({
  child,
  index,
  alertCount,
}: {
  child: ChildProfile;
  index: number;
  alertCount: number;
}) {
  const navigate = useNavigate();
  const usage = getUsageData(index);
  const isExceeded = usage.used >= usage.limit;
  const isWarning = !isExceeded && usage.used / usage.limit >= 0.75;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
    >
      <button
        type="button"
        data-ocid={`child.card.item.${index + 1}`}
        onClick={() => navigate({ to: `/child/${child.id}` })}
        className="w-full text-left rounded-2xl p-4 border border-border bg-card shadow-card card-lift transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
        style={{ outline: "none" }}
      >
        <div className="flex items-start gap-3 mb-3">
          <div className="relative">
            <ChildAvatar
              name={child.name}
              color={child.avatarColor}
              size="md"
            />
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
                {alertCount > 9 ? "9+" : alertCount}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-foreground truncate">
                {child.name}
              </h3>
              <ChevronRight
                size={16}
                className="text-muted-foreground flex-shrink-0 ml-1"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Age {Number(child.age)} · {child.deviceName}
            </p>
          </div>
        </div>

        {/* Screen time bar */}
        <ScreenTimeBar usedMinutes={usage.used} limitMinutes={usage.limit} />

        {/* Status badges */}
        <div className="flex items-center gap-2 mt-2.5">
          <div className="flex items-center gap-1">
            <Wifi size={11} className="text-primary" />
            <span className="text-[10px] text-muted-foreground">Online</span>
          </div>
          {isExceeded && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-destructive/15 text-destructive border border-destructive/20">
              Limit exceeded
            </span>
          )}
          {isWarning && !isExceeded && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-warning/15 text-warning border border-warning/20 flex items-center gap-1">
              <AlertTriangle size={9} />
              Near limit
            </span>
          )}
          {alertCount > 0 && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/15 ml-auto">
              {alertCount} alert{alertCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </button>
    </motion.div>
  );
}

export default function DashboardPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const { data: children, isLoading } = useGetAllChildren();
  const { data: unreadAlerts } = useGetUnreadAlerts();

  const unreadCount = unreadAlerts?.filter((a) => !a.isRead).length ?? 0;

  // Map alert counts per child
  const alertsByChild = (unreadAlerts ?? []).reduce<Record<string, number>>(
    (acc, alert) => {
      if (!alert.isRead) {
        const key = alert.childId.toString();
        acc[key] = (acc[key] ?? 0) + 1;
      }
      return acc;
    },
    {},
  );

  const childList = children ?? [];

  return (
    <div className="app-shell flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-extrabold text-foreground tracking-tight">
              Family Dashboard
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {childList.length} {childList.length === 1 ? "child" : "children"}{" "}
              monitored
            </p>
          </div>
          <Link to="/alerts" data-ocid="nav.alerts.link">
            <div className="relative w-10 h-10 rounded-xl flex items-center justify-center bg-secondary border border-border hover:bg-muted transition-colors">
              <Bell size={18} className="text-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-4 pb-24 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-3" data-ocid="dashboard.loading_state">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl p-4 border border-border bg-card"
              >
                <div className="flex items-start gap-3 mb-4">
                  <Skeleton className="w-11 h-11 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-3 w-32 rounded" />
                  </div>
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        ) : childList.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            data-ocid="dashboard.empty_state"
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 border border-border"
              style={{ background: "oklch(var(--secondary))" }}
            >
              <span className="text-4xl">👶</span>
            </div>
            <h3 className="font-display font-bold text-lg text-foreground mb-2">
              No children yet
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-[220px] leading-relaxed">
              Add your child's profile to start monitoring their device activity
            </p>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-primary text-primary-foreground hover:opacity-90 rounded-xl px-6"
              data-ocid="child.add.button"
            >
              <Plus size={16} className="mr-2" />
              Add First Child
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {childList.map((child, index) => (
              <ChildCard
                key={child.id.toString()}
                child={child}
                index={index}
                alertCount={alertsByChild[child.id.toString()] ?? 0}
              />
            ))}
          </div>
        )}
      </main>

      {/* FAB */}
      {childList.length > 0 && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          data-ocid="child.add.button"
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-20 right-4 w-14 h-14 rounded-2xl flex items-center justify-center bg-primary text-primary-foreground shadow-glow z-40"
          aria-label="Add child"
        >
          <Plus size={24} />
        </motion.button>
      )}

      <BottomNav />

      <AddChildModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
}
