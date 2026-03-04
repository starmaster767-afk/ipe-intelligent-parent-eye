import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetUnreadAlerts,
  useMarkAlertAsRead,
  useMarkAllAlertsAsRead,
} from "@/hooks/useQueries";
import { AlertTriangle, Bell, CheckCheck, CheckCircle2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import type { Alert } from "../backend.d";

// Sample alerts for realistic first-load experience
const SAMPLE_ALERTS: Alert[] = [
  {
    id: BigInt(1),
    childId: BigInt(1),
    message:
      "Emma's screen time limit of 4 hours has been reached on iPhone 14",
    timestamp: BigInt(Date.now() - 10 * 60 * 1000) * BigInt(1000000),
    isRead: false,
  },
  {
    id: BigInt(2),
    childId: BigInt(1),
    message: "Blocked attempt to access Social Media apps (Instagram) by Emma",
    timestamp: BigInt(Date.now() - 35 * 60 * 1000) * BigInt(1000000),
    isRead: false,
  },
  {
    id: BigInt(3),
    childId: BigInt(2),
    message: "Liam spent 1h 45m on Gaming apps today — approaching daily limit",
    timestamp: BigInt(Date.now() - 2 * 60 * 60 * 1000) * BigInt(1000000),
    isRead: false,
  },
  {
    id: BigInt(4),
    childId: BigInt(1),
    message:
      "Safe browsing prevented access to an unsafe website on Emma's device",
    timestamp: BigInt(Date.now() - 4 * 60 * 60 * 1000) * BigInt(1000000),
    isRead: true,
  },
  {
    id: BigInt(5),
    childId: BigInt(2),
    message: "Liam added a new app: Roblox. Review in App Controls.",
    timestamp: BigInt(Date.now() - 24 * 60 * 60 * 1000) * BigInt(1000000),
    isRead: true,
  },
];

function timeAgo(nanos: bigint): string {
  const ms = Number(nanos / BigInt(1000000));
  const diff = Date.now() - ms;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function AlertCard({
  alert,
  index,
  onMarkRead,
}: {
  alert: Alert;
  index: number;
  onMarkRead: (id: bigint) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      data-ocid={`alerts.item.${index + 1}`}
      className={`rounded-2xl p-4 border transition-all ${
        alert.isRead
          ? "border-border bg-card opacity-60"
          : "border-border bg-card border-l-2 border-l-destructive"
      }`}
    >
      <div className="flex gap-3">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{
            background: alert.isRead
              ? "oklch(var(--secondary))"
              : "oklch(var(--destructive) / 0.15)",
          }}
        >
          {alert.isRead ? (
            <CheckCircle2 size={16} className="text-muted-foreground" />
          ) : (
            <AlertTriangle size={16} className="text-destructive" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm leading-snug ${
              alert.isRead ? "text-muted-foreground" : "text-foreground"
            }`}
          >
            {alert.message}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {timeAgo(alert.timestamp)}
          </p>
        </div>
        {!alert.isRead && (
          <button
            type="button"
            onClick={() => onMarkRead(alert.id)}
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
            aria-label="Mark as read"
          >
            <CheckCheck size={16} className="text-primary" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function AlertsPage() {
  const { data: unreadAlerts, isLoading } = useGetUnreadAlerts();
  const markAlertAsRead = useMarkAlertAsRead();
  const markAllAsRead = useMarkAllAlertsAsRead();

  // Use real data or show samples if empty
  const alerts: Alert[] =
    unreadAlerts && unreadAlerts.length > 0 ? unreadAlerts : SAMPLE_ALERTS;
  const unreadCount = alerts.filter((a) => !a.isRead).length;

  const handleMarkRead = async (alertId: bigint) => {
    try {
      await markAlertAsRead.mutateAsync(alertId);
      toast.success("Alert marked as read");
    } catch {
      toast.error("Failed to mark alert as read");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead.mutateAsync();
      toast.success("All alerts marked as read");
    } catch {
      toast.error("Failed to mark alerts as read");
    }
  };

  return (
    <div className="app-shell flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-extrabold text-foreground tracking-tight">
              Alerts
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={markAllAsRead.isPending}
              data-ocid="alerts.mark_all.button"
              className="border-border text-xs rounded-xl h-8 px-3"
            >
              <CheckCheck size={13} className="mr-1.5 text-primary" />
              Mark all read
            </Button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-4 pb-24 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-3" data-ocid="alerts.loading_state">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl p-4 border border-border bg-card"
              >
                <div className="flex gap-3">
                  <Skeleton className="w-8 h-8 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-full rounded" />
                    <Skeleton className="h-3 w-3/4 rounded" />
                    <Skeleton className="h-3 w-16 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            data-ocid="alerts.empty_state"
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 border border-border"
              style={{ background: "oklch(var(--secondary))" }}
            >
              <Bell size={32} className="text-muted-foreground" />
            </div>
            <h3 className="font-display font-bold text-lg text-foreground mb-2">
              No alerts
            </h3>
            <p className="text-sm text-muted-foreground max-w-[220px] leading-relaxed">
              Everything looks good! You'll be notified when something needs
              attention.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-2.5">
            {/* Unread section */}
            {unreadCount > 0 && (
              <>
                <p className="text-xs font-medium text-muted-foreground px-1 mb-1 mt-1">
                  UNREAD
                </p>
                <AnimatePresence>
                  {alerts
                    .filter((a) => !a.isRead)
                    .map((alert, index) => (
                      <AlertCard
                        key={alert.id.toString()}
                        alert={alert}
                        index={index}
                        onMarkRead={handleMarkRead}
                      />
                    ))}
                </AnimatePresence>
              </>
            )}

            {/* Read section */}
            {alerts.some((a) => a.isRead) && (
              <>
                <p className="text-xs font-medium text-muted-foreground px-1 mt-4 mb-1">
                  EARLIER
                </p>
                {alerts
                  .filter((a) => a.isRead)
                  .map((alert, index) => (
                    <AlertCard
                      key={alert.id.toString()}
                      alert={alert}
                      index={index + unreadCount}
                      onMarkRead={handleMarkRead}
                    />
                  ))}
              </>
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
