import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ActivityEvent,
  Alert,
  ChildProfile,
  UserProfile,
} from "../backend.d";
import { useActor } from "./useActor";

// ─── Children ────────────────────────────────────────────────────────────────

export function useGetAllChildren() {
  const { actor, isFetching } = useActor();
  return useQuery<ChildProfile[]>({
    queryKey: ["children"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllChildren();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateChildProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      age,
      deviceName,
      avatarColor,
    }: {
      name: string;
      age: bigint;
      deviceName: string;
      avatarColor: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createChildProfile(name, age, deviceName, avatarColor);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["children"] });
    },
  });
}

export function useUpdateChildProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      childId,
      name,
      age,
      deviceName,
      avatarColor,
    }: {
      childId: bigint;
      name: string;
      age: bigint;
      deviceName: string;
      avatarColor: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateChildProfile(
        childId,
        name,
        age,
        deviceName,
        avatarColor,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["children"] });
    },
  });
}

export function useDeleteChildProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (childId: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteChildProfile(childId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["children"] });
    },
  });
}

// ─── Screen Time ─────────────────────────────────────────────────────────────

export function useGetDailyScreenTimeLimit(childId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<bigint | null>({
    queryKey: ["screenTimeLimit", childId?.toString()],
    queryFn: async () => {
      if (!actor || childId === null) return null;
      return actor.getDailyScreenTimeLimit(childId);
    },
    enabled: !!actor && !isFetching && childId !== null,
  });
}

export function useGetDailyUsage(childId: bigint | null, date: string) {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["dailyUsage", childId?.toString(), date],
    queryFn: async () => {
      if (!actor || childId === null) return BigInt(0);
      return actor.getDailyUsage(childId, date);
    },
    enabled: !!actor && !isFetching && childId !== null,
  });
}

export function useSetDailyScreenTimeLimit() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      childId,
      limitMinutes,
    }: { childId: bigint; limitMinutes: bigint }) => {
      if (!actor) throw new Error("No actor");
      return actor.setDailyScreenTimeLimit(childId, limitMinutes);
    },
    onSuccess: (_data, { childId }) => {
      qc.invalidateQueries({
        queryKey: ["screenTimeLimit", childId.toString()],
      });
    },
  });
}

// ─── Categories ───────────────────────────────────────────────────────────────

export function useGetCategories() {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetBlockedCategories(childId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ["blockedCategories", childId?.toString()],
    queryFn: async () => {
      if (!actor || childId === null) return [];
      return actor.getBlockedCategories(childId);
    },
    enabled: !!actor && !isFetching && childId !== null,
  });
}

export function useSetCategoryControl() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      childId,
      category,
      isBlocked,
    }: {
      childId: bigint;
      category: string;
      isBlocked: boolean;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.setCategoryControl(childId, category, isBlocked);
    },
    onSuccess: (_data, { childId }) => {
      qc.invalidateQueries({
        queryKey: ["blockedCategories", childId.toString()],
      });
    },
  });
}

// ─── Safe Browsing ────────────────────────────────────────────────────────────

export function useGetSafeBrowsingStatus(childId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["safeBrowsing", childId?.toString()],
    queryFn: async () => {
      if (!actor || childId === null) return false;
      return actor.getSafeBrowsingStatus(childId);
    },
    enabled: !!actor && !isFetching && childId !== null,
  });
}

export function useSetSafeBrowsingStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      childId,
      isEnabled,
    }: { childId: bigint; isEnabled: boolean }) => {
      if (!actor) throw new Error("No actor");
      return actor.setSafeBrowsingStatus(childId, isEnabled);
    },
    onSuccess: (_data, { childId }) => {
      qc.invalidateQueries({ queryKey: ["safeBrowsing", childId.toString()] });
    },
  });
}

// ─── Activities ───────────────────────────────────────────────────────────────

export function useGetLastNActivities(childId: bigint | null, n: number) {
  const { actor, isFetching } = useActor();
  return useQuery<ActivityEvent[]>({
    queryKey: ["activities", childId?.toString(), n],
    queryFn: async () => {
      if (!actor || childId === null) return [];
      return actor.getLastNActivities(childId, BigInt(n));
    },
    enabled: !!actor && !isFetching && childId !== null,
  });
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

export function useGetUnreadAlerts() {
  const { actor, isFetching } = useActor();
  return useQuery<Alert[]>({
    queryKey: ["unreadAlerts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUnreadAlerts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAlertsForChild(childId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Alert[]>({
    queryKey: ["alertsForChild", childId?.toString()],
    queryFn: async () => {
      if (!actor || childId === null) return [];
      return actor.getAlertsForChild(childId);
    },
    enabled: !!actor && !isFetching && childId !== null,
  });
}

export function useMarkAlertAsRead() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (alertId: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.markAlertAsRead(alertId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["unreadAlerts"] });
      qc.invalidateQueries({ queryKey: ["alertsForChild"] });
    },
  });
}

export function useMarkAllAlertsAsRead() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.markAllAlertsAsRead();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["unreadAlerts"] });
      qc.invalidateQueries({ queryKey: ["alertsForChild"] });
    },
  });
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["callerUserProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("No actor");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["callerUserProfile"] });
    },
  });
}
