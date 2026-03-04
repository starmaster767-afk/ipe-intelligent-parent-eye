import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateChildProfile,
  useUpdateChildProfile,
} from "@/hooks/useQueries";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { ChildProfile } from "../backend.d";

const AVATAR_COLORS = [
  "#2563eb", // blue
  "#7c3aed", // violet
  "#db2777", // pink
  "#dc2626", // red
  "#ea580c", // orange
  "#ca8a04", // yellow
  "#16a34a", // green
  "#0891b2", // cyan
  "#0d9488", // teal
  "#6366f1", // indigo
];

interface AddChildModalProps {
  open: boolean;
  onClose: () => void;
  editChild?: ChildProfile | null;
}

export default function AddChildModal({
  open,
  onClose,
  editChild,
}: AddChildModalProps) {
  const isEdit = !!editChild;
  const [name, setName] = useState(editChild?.name ?? "");
  const [age, setAge] = useState(editChild ? String(editChild.age) : "");
  const [deviceName, setDeviceName] = useState(editChild?.deviceName ?? "");
  const [avatarColor, setAvatarColor] = useState(
    editChild?.avatarColor ?? AVATAR_COLORS[0],
  );

  const createMutation = useCreateChildProfile();
  const updateMutation = useUpdateChildProfile();
  const isPending = createMutation.isPending || updateMutation.isPending;

  // Reset form when opening fresh
  const handleOpenChange = (val: boolean) => {
    if (!val) {
      onClose();
      if (!isEdit) {
        setName("");
        setAge("");
        setDeviceName("");
        setAvatarColor(AVATAR_COLORS[0]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !age || !deviceName.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    const ageNum = Number.parseInt(age, 10);
    if (Number.isNaN(ageNum) || ageNum < 1 || ageNum > 18) {
      toast.error("Age must be between 1 and 18");
      return;
    }

    try {
      if (isEdit && editChild) {
        await updateMutation.mutateAsync({
          childId: editChild.id,
          name: name.trim(),
          age: BigInt(ageNum),
          deviceName: deviceName.trim(),
          avatarColor,
        });
        toast.success(`${name}'s profile updated`);
      } else {
        await createMutation.mutateAsync({
          name: name.trim(),
          age: BigInt(ageNum),
          deviceName: deviceName.trim(),
          avatarColor,
        });
        toast.success(`${name} added to your family`);
      }
      onClose();
      if (!isEdit) {
        setName("");
        setAge("");
        setDeviceName("");
        setAvatarColor(AVATAR_COLORS[0]);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-[380px] w-[calc(100vw-2rem)] rounded-2xl border-border bg-card"
        data-ocid="add_child.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isEdit ? "Edit Child" : "Add Child"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-1">
          {/* Avatar Color Picker */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              Avatar Color
            </Label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setAvatarColor(color)}
                  className="w-8 h-8 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  style={{
                    background: color,
                    transform:
                      avatarColor === color ? "scale(1.2)" : "scale(1)",
                    boxShadow:
                      avatarColor === color
                        ? `0 0 0 3px oklch(var(--background)), 0 0 0 5px ${color}`
                        : "none",
                  }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="child-name" className="text-sm">
              Child's Name
            </Label>
            <Input
              id="child-name"
              data-ocid="add_child.name.input"
              placeholder="e.g. Emma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-secondary/50 border-border"
              autoComplete="off"
            />
          </div>

          {/* Age */}
          <div className="space-y-1.5">
            <Label htmlFor="child-age" className="text-sm">
              Age
            </Label>
            <Input
              id="child-age"
              data-ocid="add_child.age.input"
              placeholder="e.g. 10"
              type="number"
              min={1}
              max={18}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="bg-secondary/50 border-border"
            />
          </div>

          {/* Device Name */}
          <div className="space-y-1.5">
            <Label htmlFor="child-device" className="text-sm">
              Device Name
            </Label>
            <Input
              id="child-device"
              data-ocid="add_child.device.input"
              placeholder="e.g. Emma's iPhone"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              className="bg-secondary/50 border-border"
              autoComplete="off"
            />
          </div>

          <DialogFooter className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              data-ocid="add_child.cancel.button"
              onClick={() => handleOpenChange(false)}
              className="flex-1 border-border"
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="add_child.save.button"
              className="flex-1 bg-primary text-primary-foreground hover:opacity-90"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {isPending ? "Saving..." : isEdit ? "Update" : "Add Child"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
