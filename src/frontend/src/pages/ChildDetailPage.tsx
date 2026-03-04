import AddChildModal from "@/components/AddChildModal";
import BottomNav from "@/components/BottomNav";
import ChildAvatar from "@/components/ChildAvatar";
import ScreenTimeRing from "@/components/ScreenTimeRing";
import SetScreenTimeLimitModal from "@/components/SetScreenTimeLimitModal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useGetAllChildren,
  useGetBlockedCategories,
  useGetDailyScreenTimeLimit,
  useGetLastNActivities,
  useGetSafeBrowsingStatus,
  useSetCategoryControl,
  useSetSafeBrowsingStatus,
} from "@/hooks/useQueries";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  Activity,
  ArrowLeft,
  Clock,
  Edit2,
  Shield,
  Smartphone,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

// Category icon mapping
const CATEGORY_ICONS: Record<string, string> = {
  "Social Media": "📱",
  Gaming: "🎮",
  Entertainment: "🎬",
  Education: "📚",
  News: "📰",
  Shopping: "🛒",
  Other: "🌐",
};

// Fallback sample categories if backend returns empty
const DEFAULT_CATEGORIES = [
  "Social Media",
  "Gaming",
  "Entertainment",
  "Education",
  "News",
  "Shopping",
  "Other",
];

// Sample activity for rich display
const SAMPLE_ACTIVITIES = [
  {
    eventType: "app_opened",
    description: "Opened YouTube — watched 3 videos",
    timestamp: BigInt(Date.now() - 15 * 60 * 1000) * BigInt(1000000),
    icon: "▶️",
  },
  {
    eventType: "browser_visit",
    description: "Visited Khan Academy - Mathematics",
    timestamp: BigInt(Date.now() - 45 * 60 * 1000) * BigInt(1000000),
    icon: "🌐",
  },
  {
    eventType: "app_opened",
    description: "Minecraft — played for 32 minutes",
    timestamp: BigInt(Date.now() - 90 * 60 * 1000) * BigInt(1000000),
    icon: "🎮",
  },
  {
    eventType: "notification",
    description: "Screen time limit 75% reached",
    timestamp: BigInt(Date.now() - 110 * 60 * 1000) * BigInt(1000000),
    icon: "⏰",
  },
  {
    eventType: "browser_visit",
    description: "Visited Google Docs — worked on homework",
    timestamp: BigInt(Date.now() - 150 * 60 * 1000) * BigInt(1000000),
    icon: "📄",
  },
  {
    eventType: "app_opened",
    description: "Roblox — session started",
    timestamp: BigInt(Date.now() - 200 * 60 * 1000) * BigInt(1000000),
    icon: "🕹️",
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

function EventTypeIcon({ eventType }: { eventType: string }) {
  const icons: Record<string, string> = {
    app_opened: "📱",
    browser_visit: "🌐",
    notification: "🔔",
    blocked: "🚫",
    alert: "⚠️",
  };
  return <span className="text-base">{icons[eventType] ?? "📌"}</span>;
}

export default function ChildDetailPage() {
  const { id } = useParams({ from: "/child/$id" });
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const childId = BigInt(id);

  const { data: children, isLoading: childrenLoading } = useGetAllChildren();
  const child = children?.find((c) => c.id === childId) ?? null;

  const { data: safeBrowsing, isLoading: safeBrowsingLoading } =
    useGetSafeBrowsingStatus(childId);
  const setSafeBrowsing = useSetSafeBrowsingStatus();

  const { data: blockedCategories, isLoading: categoriesLoading } =
    useGetBlockedCategories(childId);
  const setCategoryControl = useSetCategoryControl();

  const { data: activities, isLoading: activitiesLoading } =
    useGetLastNActivities(childId, 20);

  const { data: screenTimeLimit } = useGetDailyScreenTimeLimit(childId);
  const limitMinutes = screenTimeLimit ? Number(screenTimeLimit) : 240;

  // Sample screen time usage
  const usedMinutes = 135;

  const handleSafeBrowsingToggle = async (checked: boolean) => {
    try {
      await setSafeBrowsing.mutateAsync({ childId, isEnabled: checked });
      toast.success(
        checked ? "Safe browsing enabled" : "Safe browsing disabled",
      );
    } catch {
      toast.error("Failed to update safe browsing");
    }
  };

  const handleCategoryToggle = async (
    category: string,
    currentlyBlocked: boolean,
  ) => {
    try {
      await setCategoryControl.mutateAsync({
        childId,
        category,
        isBlocked: !currentlyBlocked,
      });
      toast.success(
        `${category} ${!currentlyBlocked ? "blocked" : "unblocked"}`,
      );
    } catch {
      toast.error("Failed to update category");
    }
  };

  const displayedActivities =
    activities && activities.length > 0 ? activities : SAMPLE_ACTIVITIES;
  const displayedCategories = DEFAULT_CATEGORIES;

  if (childrenLoading) {
    return (
      <div
        className="app-shell flex flex-col"
        data-ocid="child_detail.loading_state"
      >
        <div className="p-4">
          <Skeleton className="h-8 w-40 rounded-lg mb-6" />
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32 rounded" />
              <Skeleton className="h-4 w-24 rounded" />
            </div>
          </div>
          <Skeleton className="h-10 w-full rounded-xl mb-4" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!child) {
    return (
      <div
        className="app-shell flex flex-col items-center justify-center p-8 text-center"
        data-ocid="child_detail.error_state"
      >
        <p className="text-muted-foreground text-lg mb-4">Child not found</p>
        <Button
          onClick={() => navigate({ to: "/dashboard" })}
          variant="outline"
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="app-shell flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate({ to: "/dashboard" })}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-secondary border border-border hover:bg-muted transition-colors"
            aria-label="Go back"
            data-ocid="child_detail.back.button"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex items-center gap-3 flex-1 min-w-0">
            <ChildAvatar
              name={child.name}
              color={child.avatarColor}
              size="sm"
            />
            <div className="min-w-0">
              <h1 className="font-display font-bold text-foreground truncate">
                {child.name}
              </h1>
              <p className="text-xs text-muted-foreground">
                Age {Number(child.age)} · {child.deviceName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowEditModal(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-secondary border border-border hover:bg-muted transition-colors"
            aria-label="Edit child"
            data-ocid="child_detail.edit.button"
          >
            <Edit2 size={16} />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 pb-24 overflow-y-auto">
        <Tabs defaultValue="overview" className="flex flex-col h-full">
          <TabsList
            className="flex mx-4 mt-3 mb-0 rounded-xl p-1 bg-secondary border border-border h-auto gap-1"
            data-ocid="child_detail.tabs"
          >
            <TabsTrigger
              value="overview"
              data-ocid="child.detail.overview.tab"
              className="flex-1 rounded-lg text-xs font-medium py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="apps"
              data-ocid="child.detail.apps.tab"
              className="flex-1 rounded-lg text-xs font-medium py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Apps
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              data-ocid="child.detail.activity.tab"
              className="flex-1 rounded-lg text-xs font-medium py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Activity
            </TabsTrigger>
          </TabsList>

          {/* ─── Overview Tab ─────────────────────────────────────── */}
          <TabsContent value="overview" className="px-4 pt-4 space-y-4 mt-0">
            {/* Screen time card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-5 border border-border bg-card shadow-card"
            >
              <div className="flex items-center gap-2 mb-4">
                <Clock size={15} className="text-primary" />
                <h3 className="font-display font-bold text-sm text-foreground">
                  Today's Screen Time
                </h3>
              </div>
              <div className="flex justify-center mb-4">
                <ScreenTimeRing
                  usedMinutes={usedMinutes}
                  limitMinutes={limitMinutes}
                />
              </div>
              <Button
                onClick={() => setShowLimitModal(true)}
                variant="outline"
                className="w-full border-border hover:bg-secondary rounded-xl h-10 text-sm"
                data-ocid="child.screen_time.edit_button"
              >
                <Clock size={14} className="mr-2 text-primary" />
                Set Daily Limit
              </Button>
            </motion.div>

            {/* Safe Browsing card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl p-4 border border-border bg-card shadow-card"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "oklch(0.68 0.18 145 / 0.2)" }}
                  >
                    <Shield size={17} className="text-[oklch(0.68_0.18_145)]" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">
                      Safe Browsing
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {safeBrowsing ? "Protection active" : "Protection off"}
                    </p>
                  </div>
                </div>
                {safeBrowsingLoading ? (
                  <Skeleton className="w-10 h-6 rounded-full" />
                ) : (
                  <Switch
                    checked={safeBrowsing ?? false}
                    onCheckedChange={handleSafeBrowsingToggle}
                    data-ocid="child.safe_browsing.toggle"
                    disabled={setSafeBrowsing.isPending}
                  />
                )}
              </div>
            </motion.div>

            {/* Device info card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-2xl p-4 border border-border bg-card shadow-card"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "oklch(var(--primary) / 0.15)" }}
                >
                  <Smartphone size={17} className="text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">
                    {child.deviceName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Monitored device · Online
                  </p>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* ─── Apps Tab ─────────────────────────────────────────── */}
          <TabsContent value="apps" className="px-4 pt-4 mt-0">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border bg-card overflow-hidden shadow-card"
            >
              <div className="px-4 py-3 border-b border-border">
                <p className="font-display font-bold text-sm text-foreground">
                  App Categories
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Toggle to block or allow categories
                </p>
              </div>
              {categoriesLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-32 rounded" />
                      <Skeleton className="w-10 h-6 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {displayedCategories.map((category, index) => {
                    const isBlocked =
                      blockedCategories?.includes(category) ?? false;
                    return (
                      <div
                        key={category}
                        className="flex items-center justify-between px-4 py-3.5"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">
                            {CATEGORY_ICONS[category] ?? "🌐"}
                          </span>
                          <span className="text-sm font-medium text-foreground">
                            {category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isBlocked && (
                            <span className="text-[10px] text-destructive font-medium">
                              Blocked
                            </span>
                          )}
                          <Switch
                            checked={!isBlocked}
                            onCheckedChange={() =>
                              handleCategoryToggle(category, isBlocked)
                            }
                            data-ocid={`child.category.toggle.${index + 1}`}
                            disabled={setCategoryControl.isPending}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* ─── Activity Tab ─────────────────────────────────────── */}
          <TabsContent value="activity" className="px-4 pt-4 mt-0">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border bg-card overflow-hidden shadow-card mb-4"
            >
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <Activity size={14} className="text-primary" />
                <p className="font-display font-bold text-sm text-foreground">
                  Recent Activity
                </p>
              </div>

              {activitiesLoading ? (
                <div className="p-4 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3 w-full rounded" />
                        <Skeleton className="h-3 w-16 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : displayedActivities.length === 0 ? (
                <div
                  className="py-12 text-center"
                  data-ocid="activity.empty_state"
                >
                  <p className="text-muted-foreground text-sm">
                    No activity recorded yet
                  </p>
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-[1.875rem] top-0 bottom-0 w-px bg-border" />
                  <div className="divide-y divide-border/50">
                    {displayedActivities.map((event, index) => (
                      <div
                        // biome-ignore lint/suspicious/noArrayIndexKey: activity list has no stable IDs
                        key={index}
                        className="flex gap-3 px-4 py-3.5 relative"
                      >
                        {/* Event icon */}
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 border border-border"
                          style={{ background: "oklch(var(--background))" }}
                        >
                          {"icon" in event ? (
                            <span className="text-sm">
                              {(event as { icon: string }).icon}
                            </span>
                          ) : (
                            <EventTypeIcon eventType={event.eventType} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <p className="text-sm text-foreground leading-snug line-clamp-2">
                            {event.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {timeAgo(event.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />

      {/* Modals */}
      {showEditModal && (
        <AddChildModal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          editChild={child}
        />
      )}
      {showLimitModal && (
        <SetScreenTimeLimitModal
          open={showLimitModal}
          onClose={() => setShowLimitModal(false)}
          childId={childId}
          currentLimitMinutes={limitMinutes}
        />
      )}
    </div>
  );
}
