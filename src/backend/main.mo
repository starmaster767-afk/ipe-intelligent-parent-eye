import Text "mo:core/Text";
import Bool "mo:core/Bool";
import Nat "mo:core/Nat";
import Map "mo:core/Map";
import VarArray "mo:core/VarArray";
import Order "mo:core/Order";
import List "mo:core/List";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Include authorization (admin only functionality)
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let childProfiles = Map.empty<Nat, ChildProfile>();
  let screenTimeLimits = Map.empty<Nat, ScreenTimeLimits>();
  let categoryControls = Map.empty<Nat, CategoryControl>();
  let activityLogs = Map.empty<Nat, ActivityLog>();
  let alerts = Map.empty<Nat, Alert>();
  let safeBrowsingStatus = Map.empty<Nat, Bool>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Types
  public type UserProfile = {
    name : Text;
  };

  type ChildProfile = {
    id : Nat;
    name : Text;
    age : Nat;
    deviceName : Text;
    avatarColor : Text;
    creationTimestamp : Time.Time;
  };

  type ScreenTimeLimit = {
    dailyLimitMinutes : Nat;
  };

  type DailyUsage = {
    date : Text;
    minutesUsed : Nat;
  };

  type ScreenTimeLimits = {
    limits : ScreenTimeLimit;
    usage : Map.Map<Text, DailyUsage>;
  };

  type CategoryControl = {
    category : Text;
    isBlocked : Bool;
  };

  type ActivityEvent = {
    eventType : Text;
    description : Text;
    timestamp : Time.Time;
  };

  type ActivityLog = {
    childId : Nat;
    events : Map.Map<Nat, ActivityEvent>;
  };

  type Alert = {
    id : Nat;
    childId : Nat;
    message : Text;
    timestamp : Time.Time;
    isRead : Bool;
  };

  var nextChildId = 0;
  var nextAlertId = 0;
  let categories = [
    "Social Media",
    "Gaming",
    "Entertainment",
    "Education",
    "News",
    "Shopping",
    "Other",
  ];
  let categoriesLength = categories.size();

  module ChildProfile {
    public func compare(profile1 : ChildProfile, profile2 : ChildProfile) : Order.Order {
      Nat.compare(profile1.id, profile2.id);
    };
  };

  // User Profile Management (required by frontend)

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Child Profile Management

  public shared ({ caller }) func createChildProfile(name : Text, age : Nat, deviceName : Text, avatarColor : Text) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      switch (AccessControl.getUserRole(accessControlState, caller)) {
        case (#guest) { Runtime.trap("Please login. Only admins can create child profiles") };
        case (_) { Runtime.trap("Only admins can create child profiles") };
      };
    };

    let childId = nextChildId;
    nextChildId += 1;

    let profile = {
      id = childId;
      name;
      age;
      deviceName;
      avatarColor;
      creationTimestamp = Time.now();
    };

    childProfiles.add(childId, profile : ChildProfile);
    childId;
  };

  public shared ({ caller }) func updateChildProfile(childId : Nat, name : Text, age : Nat, deviceName : Text, avatarColor : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      switch (AccessControl.getUserRole(accessControlState, caller)) {
        case (#guest) { Runtime.trap("Please login. Only admins can update child profiles") };
        case (_) { Runtime.trap("Only admins can update child profiles") };
      };
    };

    switch (childProfiles.get(childId)) {
      case (?existingProfile) {
        let updatedProfile : ChildProfile = {
          id = childId;
          name;
          age;
          deviceName;
          avatarColor;
          creationTimestamp = existingProfile.creationTimestamp;
        };
        childProfiles.add(childId, updatedProfile);
      };
      case (null) { Runtime.trap("Child profile not found") };
    };
  };

  public shared ({ caller }) func deleteChildProfile(childId : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      switch (AccessControl.getUserRole(accessControlState, caller)) {
        case (#guest) { Runtime.trap("Please login. Only admins can delete child profiles") };
        case (_) { Runtime.trap("Only admins can delete child profiles") };
      };
    };

    childProfiles.remove(childId);
    screenTimeLimits.remove(childId);
    categoryControls.remove(childId);
    activityLogs.remove(childId);
    safeBrowsingStatus.remove(childId);
  };

  public query ({ caller }) func getAllChildren() : async [ChildProfile] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      switch (AccessControl.getUserRole(accessControlState, caller)) {
        case (#guest) { Runtime.trap("Please login. Only admins can view child profiles") };
        case (_) { Runtime.trap("Only admins can view child profiles") };
      };
    };

    childProfiles.values().toArray().sort();
  };

  // Screen Time Rules

  public shared ({ caller }) func setDailyScreenTimeLimit(childId : Nat, limitMinutes : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      switch (AccessControl.getUserRole(accessControlState, caller)) {
        case (#guest) {
          Runtime.trap("Please login. Only admins can set screen time limits");
        };
        case (_) { Runtime.trap("Only admins can set screen time limits") };
      };
    };

    let limit = { dailyLimitMinutes = limitMinutes };
    switch (screenTimeLimits.get(childId)) {
      case (?existingLimits) {
        let existingLimitsSize = existingLimits.usage.size();
        let usage = if (existingLimitsSize > 0) {
          existingLimits.usage;
        } else {
          Map.empty<Text, DailyUsage>();
        };
        let limits = { limits = limit; usage };
        screenTimeLimits.add(childId, limits);
      };
      case (null) {
        let usage = Map.empty<Text, DailyUsage>();
        let limits = { limits = limit; usage };
        screenTimeLimits.add(childId, limits);
      };
    };
  };

  public shared ({ caller }) func recordScreenTimeUsage(childId : Nat, date : Text, minutesUsed : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      switch (AccessControl.getUserRole(accessControlState, caller)) {
        case (#guest) {
          Runtime.trap("Please login. Only admins can record screen time usage");
        };
        case (_) { Runtime.trap("Only admins can record screen time usage") };
      };
    };

    let usage = { date; minutesUsed };

    switch (screenTimeLimits.get(childId)) {
      case (?existingLimits) {
        existingLimits.usage.add(date, usage);
        screenTimeLimits.add(childId, existingLimits : ScreenTimeLimits);
      };
      case (null) { Runtime.trap("No screen time limits found for child") };
    };
  };

  public query ({ caller }) func getDailyUsage(childId : Nat, date : Text) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      switch (AccessControl.getUserRole(accessControlState, caller)) {
        case (#guest) { Runtime.trap("Please login. Only admins can view screen time usage") };
        case (_) { Runtime.trap("Only admins can view screen time usage") };
      };
    };

    switch (screenTimeLimits.get(childId)) {
      case (?limits) {
        switch (limits.usage.get(date)) {
          case (?dailyUsage) { dailyUsage.minutesUsed };
          case (null) { 0 };
        };
      };
      case (null) { 0 };
    };
  };

  public query ({ caller }) func hasExceededDailyLimit(childId : Nat, date : Text) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      switch (AccessControl.getUserRole(accessControlState, caller)) {
        case (#guest) { Runtime.trap("Please login. Only admins can check screen time limits") };
        case (_) { Runtime.trap("Only admins can check screen time limits") };
      };
    };

    switch (screenTimeLimits.get(childId)) {
      case (?limits) {
        switch (limits.usage.get(date)) {
          case (?dailyUsage) { dailyUsage.minutesUsed > limits.limits.dailyLimitMinutes };
          case (null) { false };
        };
      };
      case (null) { false };
    };
  };

  // App Category Controls

  public shared ({ caller }) func setCategoryControl(childId : Nat, category : Text, isBlocked : Bool) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      switch (AccessControl.getUserRole(accessControlState, caller)) {
        case (#guest) {
          Runtime.trap("Please login. Only admins can set app category controls");
        };
        case (_) { Runtime.trap("Only admins can set app category controls") };
      };
    };

    let control = { category; isBlocked };
    categoryControls.add(childId, control);
  };

  public query ({ caller }) func getBlockedCategories(childId : Nat) : async [Text] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      switch (AccessControl.getUserRole(accessControlState, caller)) {
        case (#guest) { Runtime.trap("Please login. Only admins can view blocked categories") };
        case (_) { Runtime.trap("Only admins can view blocked categories") };
      };
    };

    var count = 0;
    let blocked = categories.map(
      func(category) {
        switch (categoryControls.get(childId)) {
          case (?control) {
            if (control.category == category and control.isBlocked) {
              count += 1;
              category;
            } else {
              "";
            };
          };
          case (null) { "" };
        };
      }
    );
    blocked.filter(func(category) { category != "" });
  };

  // Activity Log

  public shared ({ caller }) func logActivity(childId : Nat, eventType : Text, description : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      switch (AccessControl.getUserRole(accessControlState, caller)) {
        case (#guest) {
          Runtime.trap("Please login. Only admins can log activity");
        };
        case (_) { Runtime.trap("Only admins can log activity") };
      };
    };

    let event = {
      eventType;
      description;
      timestamp = Time.now();
    };

    switch (activityLogs.get(childId)) {
      case (?existingLog) {
        if (existingLog.events.isEmpty()) {
          let events = Map.empty<Nat, ActivityEvent>();
          events.add(0, event);
          let newLog = { childId; events };
          activityLogs.add(childId, newLog);
        } else {
          existingLog.events.add(existingLog.events.size(), event);
        };
      };
      case (null) {
        let events = Map.empty<Nat, ActivityEvent>();
        events.add(0, event);
        let log = { childId; events };
        activityLogs.add(childId, log);
      };
    };
  };

  public query ({ caller }) func getLastNActivities(childId : Nat, n : Nat) : async [ActivityEvent] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      switch (AccessControl.getUserRole(accessControlState, caller)) {
        case (#guest) { Runtime.trap("Please login. Only admins can view activity logs") };
        case (_) { Runtime.trap("Only admins can view activity logs") };
      };
    };

    switch (activityLogs.get(childId)) {
      case (?log) {
        var count = 0;
        let iter = log.events.values();
        var resultSize = n;
        let events = iter.toVarArray<ActivityEvent>();
        let size = events.size();
        if (size < n) {
          resultSize := size;
        } else if (size > 0 and resultSize == 0) {
          resultSize := 1;
        };
        if (resultSize > 0) {
          let newArray = VarArray.repeat<ActivityEvent>({ eventType = ""; description = ""; timestamp = 0 }, resultSize);
          newArray[0] := events[0];
          count += 1;
          newArray.toArray();
        } else {
          [];
        };
      };
      case (null) { [] };
    };
  };

  // Alerts

  public shared ({ caller }) func createAlert(childId : Nat, message : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      switch (AccessControl.getUserRole(accessControlState, caller)) {
        case (#guest) {
          Runtime.trap("Please login. Only admins can create alerts");
        };
        case (_) { Runtime.trap("Only admins can create alerts") };
      };
    };

    let alertId = nextAlertId;
    nextAlertId += 1;

    let alert = {
      id = alertId;
      childId;
      message;
      timestamp = Time.now();
      isRead = false;
    };

    alerts.add(alertId, alert);
  };

  public query ({ caller }) func getUnreadAlerts() : async [Alert] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      switch (AccessControl.getUserRole(accessControlState, caller)) {
        case (#guest) { Runtime.trap("Please login. Only admins can view alerts") };
        case (_) { Runtime.trap("Only admins can view alerts") };
      };
    };

    alerts.values().toArray().filter(func(alert) { not alert.isRead });
  };

  public shared ({ caller }) func markAlertAsRead(alertId : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      switch (AccessControl.getUserRole(accessControlState, caller)) {
        case (#guest) { Runtime.trap("Please login. Only admins can mark alerts as read") };
        case (_) { Runtime.trap("Only admins can mark alerts as read") };
      };
    };

    switch (alerts.get(alertId)) {
      case (?alert) {
        let updatedAlert = {
          id = alert.id;
          childId = alert.childId;
          message = alert.message;
          timestamp = alert.timestamp;
          isRead = true;
        };
        alerts.add(alertId, updatedAlert);
      };
      case (null) { Runtime.trap("Alert not found") };
    };
  };

  public shared ({ caller }) func markAllAlertsAsRead() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      switch (AccessControl.getUserRole(accessControlState, caller)) {
        case (#guest) { Runtime.trap("Please login. Only admins can mark alerts as read") };
        case (_) { Runtime.trap("Only admins can mark alerts as read") };
      };
    };

    alerts.forEach(
      func(id, alert) {
        let updatedAlert = {
          id = alert.id;
          childId = alert.childId;
          message = alert.message;
          timestamp = alert.timestamp;
          isRead = true;
        };
        alerts.add(id, updatedAlert);
      }
    );
  };

  // Safe Browsing Toggle

  public shared ({ caller }) func setSafeBrowsingStatus(childId : Nat, isEnabled : Bool) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      switch (AccessControl.getUserRole(accessControlState, caller)) {
        case (#guest) {
          Runtime.trap("Please login. Only admins can set safe browsing status");
        };
        case (_) { Runtime.trap("Only admins can set safe browsing status") };
      };
    };

    safeBrowsingStatus.add(childId, isEnabled);
  };

  public query ({ caller }) func getSafeBrowsingStatus(childId : Nat) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      switch (AccessControl.getUserRole(accessControlState, caller)) {
        case (#guest) { Runtime.trap("Please login. Only admins can view safe browsing status") };
        case (_) { Runtime.trap("Only admins can view safe browsing status") };
      };
    };

    switch (safeBrowsingStatus.get(childId)) {
      case (?status) { status };
      case (null) { false };
    };
  };

  // HELPER FUNCTIONS

  public query ({ caller }) func getCategories() : async [Text] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      switch (AccessControl.getUserRole(accessControlState, caller)) {
        case (#guest) { Runtime.trap("Please login. Only admins can view categories") };
        case (_) { Runtime.trap("Only admins can view categories") };
      };
    };

    categories;
  };

  public query ({ caller }) func getDailyScreenTimeLimit(childId : Nat) : async ?Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      switch (AccessControl.getUserRole(accessControlState, caller)) {
        case (#guest) { Runtime.trap("Please login. Only admins can view screen time limits") };
        case (_) { Runtime.trap("Only admins can view screen time limits") };
      };
    };

    switch (screenTimeLimits.get(childId)) {
      case (?limits) { ?limits.limits.dailyLimitMinutes };
      case (null) { null };
    };
  };

  public query ({ caller }) func isCategoryBlocked(childId : Nat, category : Text) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      switch (AccessControl.getUserRole(accessControlState, caller)) {
        case (#guest) { Runtime.trap("Please login. Only admins can check category status") };
        case (_) { Runtime.trap("Only admins can check category status") };
      };
    };

    switch (categoryControls.get(childId)) {
      case (?control) {
        if (control.category == category) { control.isBlocked } else { false };
      };
      case (null) { false };
    };
  };

  public query ({ caller }) func getAlertsForChild(childId : Nat) : async [Alert] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      switch (AccessControl.getUserRole(accessControlState, caller)) {
        case (#guest) { Runtime.trap("Please login. Only admins can view alerts") };
        case (_) { Runtime.trap("Only admins can view alerts") };
      };
    };

    alerts.values().toArray().filter(func(alert) { alert.childId == childId });
  };
};
