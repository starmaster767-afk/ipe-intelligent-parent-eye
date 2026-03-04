import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { useSetDailyScreenTimeLimit } from "@/hooks/useQueries";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SetScreenTimeLimitModalProps {
  open: boolean;
  onClose: () => void;
  childId: bigint;
  currentLimitMinutes: number;
}

function minutesToDisplay(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

const PRESET_VALUES = [30, 60, 90, 120, 180, 240, 300, 360];

export default function SetScreenTimeLimitModal({
  open,
  onClose,
  childId,
  currentLimitMinutes,
}: SetScreenTimeLimitModalProps) {
  const [limitMinutes, setLimitMinutes] = useState(currentLimitMinutes || 120);
  const mutation = useSetDailyScreenTimeLimit();

  const handleSubmit = async () => {
    try {
      await mutation.mutateAsync({
        childId,
        limitMinutes: BigInt(limitMinutes),
      });
      toast.success(`Daily limit set to ${minutesToDisplay(limitMinutes)}`);
      onClose();
    } catch {
      toast.error("Failed to update limit");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-[360px] w-[calc(100vw-2rem)] rounded-2xl border-border bg-card">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Set Daily Screen Time
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Current display */}
          <div className="text-center">
            <div className="text-4xl font-display font-bold text-primary">
              {minutesToDisplay(limitMinutes)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">per day</p>
          </div>

          {/* Slider */}
          <div className="px-2">
            <Slider
              value={[limitMinutes]}
              onValueChange={([val]) => setLimitMinutes(val)}
              min={15}
              max={480}
              step={15}
              className="w-full"
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">15 min</span>
              <span className="text-xs text-muted-foreground">8 hours</span>
            </div>
          </div>

          {/* Presets */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Quick presets</p>
            <div className="flex flex-wrap gap-2">
              {PRESET_VALUES.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setLimitMinutes(val)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                    limitMinutes === val
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {minutesToDisplay(val)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-border"
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-primary text-primary-foreground hover:opacity-90"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
