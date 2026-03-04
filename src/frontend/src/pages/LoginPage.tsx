import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useNavigate } from "@tanstack/react-router";
import { Eye, Loader2, Shield } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";

export default function LoginPage() {
  const { login, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const navigate = useNavigate();

  const isLoggingIn = loginStatus === "logging-in";
  const isSuccess = loginStatus === "success";

  useEffect(() => {
    if (identity && isSuccess) {
      navigate({ to: "/dashboard" });
    }
  }, [identity, isSuccess, navigate]);

  // If already logged in, redirect
  useEffect(() => {
    if (identity && !isInitializing) {
      navigate({ to: "/dashboard" });
    }
  }, [identity, isInitializing, navigate]);

  return (
    <div className="app-shell flex flex-col">
      {/* Background decoration */}
      <div className="fixed inset-0 max-w-[430px] mx-auto overflow-hidden pointer-events-none">
        <div
          className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-20 blur-3xl"
          style={{ background: "oklch(0.65 0.18 195)" }}
        />
        <div
          className="absolute top-1/3 -right-20 w-48 h-48 rounded-full opacity-15 blur-3xl"
          style={{ background: "oklch(0.55 0.18 220)" }}
        />
        <div
          className="absolute bottom-1/4 -left-10 w-40 h-40 rounded-full opacity-10 blur-3xl"
          style={{ background: "oklch(0.65 0.18 195)" }}
        />
      </div>

      <div className="flex flex-col items-center justify-center flex-1 px-6 py-12 relative z-10 min-h-screen">
        {/* Logo + Brand */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center mb-12"
        >
          {/* Eye + Shield icon combo */}
          <div className="relative mb-6">
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center animate-pulse-glow"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.25 0.04 252), oklch(0.2 0.035 252))",
                border: "1px solid oklch(var(--primary) / 0.3)",
              }}
            >
              <img
                src="/assets/generated/ipe-logo-transparent.dim_120x120.png"
                alt="IPE Logo"
                className="w-16 h-16 object-contain"
              />
            </div>
          </div>

          <h1 className="font-display text-4xl font-extrabold text-foreground tracking-tight mb-2">
            IPE
          </h1>
          <p className="text-base font-medium text-muted-foreground mb-1">
            Intelligent Parent Eye
          </p>
          <p className="text-sm text-center text-muted-foreground max-w-[240px] leading-relaxed">
            Keep your family safe, smarter
          </p>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {[
            { icon: "🕐", label: "Screen Time" },
            { icon: "🛡️", label: "Safe Browsing" },
            { icon: "📱", label: "App Controls" },
            { icon: "🔔", label: "Smart Alerts" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{
                background: "oklch(var(--secondary))",
                border: "1px solid oklch(var(--border))",
                color: "oklch(var(--foreground))",
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Login button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="w-full max-w-[320px] space-y-4"
        >
          <Button
            onClick={() => login()}
            disabled={isLoggingIn || isInitializing}
            className="w-full h-14 text-base font-semibold rounded-2xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity glow-sm"
            data-ocid="auth.primary_button"
          >
            {isLoggingIn || isInitializing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                {isInitializing ? "Loading..." : "Signing in..."}
              </>
            ) : (
              <>
                <Shield className="w-5 h-5 mr-2" />
                Sign in to IPE
              </>
            )}
          </Button>

          <div className="flex items-start gap-2 px-1">
            <Eye className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              IPE uses secure, privacy-first authentication. Your family's data
              stays protected.
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="absolute bottom-8 text-center"
        >
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
        </motion.div>
      </div>
    </div>
  );
}
