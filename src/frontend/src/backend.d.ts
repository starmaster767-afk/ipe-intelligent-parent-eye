import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface ActivityEvent {
    description: string;
    timestamp: Time;
    eventType: string;
}
export interface Alert {
    id: bigint;
    childId: bigint;
    isRead: boolean;
    message: string;
    timestamp: Time;
}
export interface UserProfile {
    name: string;
}
export interface ChildProfile {
    id: bigint;
    age: bigint;
    creationTimestamp: Time;
    name: string;
    avatarColor: string;
    deviceName: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAlert(childId: bigint, message: string): Promise<void>;
    createChildProfile(name: string, age: bigint, deviceName: string, avatarColor: string): Promise<bigint>;
    deleteChildProfile(childId: bigint): Promise<void>;
    getAlertsForChild(childId: bigint): Promise<Array<Alert>>;
    getAllChildren(): Promise<Array<ChildProfile>>;
    getBlockedCategories(childId: bigint): Promise<Array<string>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategories(): Promise<Array<string>>;
    getDailyScreenTimeLimit(childId: bigint): Promise<bigint | null>;
    getDailyUsage(childId: bigint, date: string): Promise<bigint>;
    getLastNActivities(childId: bigint, n: bigint): Promise<Array<ActivityEvent>>;
    getSafeBrowsingStatus(childId: bigint): Promise<boolean>;
    getUnreadAlerts(): Promise<Array<Alert>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    hasExceededDailyLimit(childId: bigint, date: string): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    isCategoryBlocked(childId: bigint, category: string): Promise<boolean>;
    logActivity(childId: bigint, eventType: string, description: string): Promise<void>;
    markAlertAsRead(alertId: bigint): Promise<void>;
    markAllAlertsAsRead(): Promise<void>;
    recordScreenTimeUsage(childId: bigint, date: string, minutesUsed: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setCategoryControl(childId: bigint, category: string, isBlocked: boolean): Promise<void>;
    setDailyScreenTimeLimit(childId: bigint, limitMinutes: bigint): Promise<void>;
    setSafeBrowsingStatus(childId: bigint, isEnabled: boolean): Promise<void>;
    updateChildProfile(childId: bigint, name: string, age: bigint, deviceName: string, avatarColor: string): Promise<void>;
}
