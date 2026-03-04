import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useSaveCallerUserProfile,
} from "@/hooks/useQueries";
import { ChevronRight, Eye, Info, Loader2, Shield, User } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const APP_VERSION = "1.0.0";

export default function SettingsPage() {
  const { data: profile, isLoading: profileLoading } =
    useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const { identity, clear } = useInternetIdentity();
  const [displayName, setDisplayName] = useState("");
  const [hasEdited, setHasEdited] = useState(false);

  useEffect(() => {
    if (profile?.name && !hasEdited) {
      setDisplayName(profile.name);
    }
  }, [profile, hasEdited]);

  const principal = identity?.getPrincipal().toString();

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error("Please enter a display name");
      return;
    }
    try {
      await saveProfile.mutateAsync({ name: displayName.trim() });
      toast.success("Profile saved");
      setHasEdited(false);
    } catch {
      toast.error("Failed to save profile");
    }
  };

  return (
    <div className="app-shell flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border px-4 py-3">
        <h1 className="font-display text-xl font-extrabold text-foreground tracking-tight">
          Settings
        </h1>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-4 pb-24 overflow-y-auto space-y-5">
        {/* Parent Profile */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card shadow-card overflow-hidden"
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <User size={15} className="text-primary" />
            <h2 className="font-display font-bold text-sm text-foreground">
              Parent Profile
            </h2>
          </div>

          <div className="p-4">
            {profileLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-24 rounded-xl" />
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="display-name"
                    className="text-sm text-muted-foreground"
                  >
                    Display Name
                  </Label>
                  <Input
                    id="display-name"
                    data-ocid="settings.profile.input"
                    value={displayName}
                    onChange={(e) => {
                      setDisplayName(e.target.value);
                      setHasEdited(true);
                    }}
                    placeholder="Your name"
                    className="bg-secondary/50 border-border rounded-xl h-11"
                    autoComplete="name"
                  />
                </div>

                {principal && (
                  <div className="space-y-1.5">
                    <Label className="text-sm text-muted-foreground">
                      Principal ID
                    </Label>
                    <div
                      className="px-3 py-2.5 rounded-xl text-xs font-mono text-muted-foreground truncate"
                      style={{ background: "oklch(var(--secondary))" }}
                    >
                      {principal}
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={saveProfile.isPending || !displayName.trim()}
                  data-ocid="settings.profile.save_button"
                  className="bg-primary text-primary-foreground hover:opacity-90 rounded-xl h-10 px-5 text-sm"
                >
                  {saveProfile.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {saveProfile.isPending ? "Saving..." : "Save Profile"}
                </Button>
              </form>
            )}
          </div>
        </motion.section>

        {/* Protection Features */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border bg-card shadow-card overflow-hidden"
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <Shield size={15} className="text-primary" />
            <h2 className="font-display font-bold text-sm text-foreground">
              Protection Features
            </h2>
          </div>

          <div className="divide-y divide-border/60">
            {[
              {
                icon: "🛡️",
                title: "Safe Browsing",
                desc: "Per-child in child settings",
              },
              {
                icon: "⏱️",
                title: "Screen Time Controls",
                desc: "Set limits per child",
              },
              {
                icon: "📱",
                title: "App Category Controls",
                desc: "Block/allow by category",
              },
              {
                icon: "🔔",
                title: "Smart Alerts",
                desc: "Auto-alert on rule violations",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-center justify-between px-4 py-3.5"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-muted-foreground" />
              </div>
            ))}
          </div>
        </motion.section>

        {/* Account */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-border bg-card shadow-card overflow-hidden"
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <User size={15} className="text-primary" />
            <h2 className="font-display font-bold text-sm text-foreground">
              Account
            </h2>
          </div>

          <div className="p-4">
            <Button
              variant="outline"
              onClick={() => clear()}
              className="w-full border-destructive/40 text-destructive hover:bg-destructive/10 rounded-xl h-10 text-sm"
              data-ocid="settings.logout.button"
            >
              Sign Out
            </Button>
          </div>
        </motion.section>

        {/* About */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border bg-card shadow-card overflow-hidden"
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <Info size={15} className="text-primary" />
            <h2 className="font-display font-bold text-sm text-foreground">
              About IPE
            </h2>
          </div>

          <div className="divide-y divide-border/60">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <Eye size={18} className="text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Intelligent Parent Eye
                </p>
                <p className="text-xs text-muted-foreground">
                  Smart parental controls for the modern family
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center px-4 py-3.5">
              <span className="text-sm text-muted-foreground">Version</span>
              <span className="text-sm font-medium text-foreground">
                {APP_VERSION}
              </span>
            </div>
            <div className="flex justify-between items-center px-4 py-3.5">
              <span className="text-sm text-muted-foreground">Platform</span>
              <span className="text-sm font-medium text-foreground">
                Internet Computer
              </span>
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <div className="text-center py-2">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
