using System.ComponentModel.DataAnnotations.Schema;

namespace ActivityTrackerAPI.Models;

public class User
{
    [Column("user_id")] public uint UserId { get; set; }
    [Column("name")] public string Name { get; set; } = string.Empty;
    [Column("email")] public string Email { get; set; } = string.Empty;
    [Column("password")] public string Password { get; set; } = string.Empty;
    [Column("role_id")] public uint RoleId { get; set; }
    [Column("branch_id")] public uint? BranchId { get; set; }
    [Column("is_active")] public bool IsActive { get; set; }
    [Column("created_at")] public DateTime CreatedAt { get; set; }
    [Column("role_name")] public string RoleName { get; set; } = string.Empty;
    [Column("permissions")] public string? Permissions { get; set; }
    [Column("branch_name")] public string? BranchName { get; set; }
}

public class Lead
{
    [Column("lead_id")] public uint LeadId { get; set; }
    [Column("customer_name")] public string CustomerName { get; set; } = string.Empty;
    [Column("phone")] public string Phone { get; set; } = string.Empty;
    [Column("email")] public string? Email { get; set; }
    [Column("product_type_id")] public uint? ProductTypeId { get; set; }
    [Column("source")] public string Source { get; set; } = string.Empty;
    [Column("status")] public string Status { get; set; } = string.Empty;
    [Column("sub_status")] public string? SubStatus { get; set; }
    [Column("assigned_to")] public uint? AssignedTo { get; set; }
    [Column("created_by")] public uint? CreatedBy { get; set; }
    [Column("notes")] public string? Notes { get; set; }
    [Column("expected_premium")] public decimal ExpectedPremium { get; set; }
    [Column("created_at")] public DateTime CreatedAt { get; set; }
    [Column("updated_at")] public DateTime UpdatedAt { get; set; }
    [Column("is_deleted")] public bool IsDeleted { get; set; }
    [Column("assigned_agent_name")] public string? AssignedAgentName { get; set; }
    [Column("product_type_name")] public string? ProductTypeName { get; set; }
    [NotMapped] public IList<Activity>? Activities { get; set; }
}

public class Activity
{
    [Column("activity_id")] public uint ActivityId { get; set; }
    [Column("lead_id")] public uint LeadId { get; set; }
    [Column("user_id")] public uint UserId { get; set; }
    [Column("activity_type")] public string ActivityType { get; set; } = string.Empty;
    [Column("activity_date")] public DateTime ActivityDate { get; set; }
    [Column("duration_minutes")] public uint? DurationMinutes { get; set; }
    [Column("outcome")] public string? Outcome { get; set; }
    [Column("notes")] public string? Notes { get; set; }
    [Column("location_lat")] public decimal? LocationLat { get; set; }
    [Column("location_long")] public decimal? LocationLong { get; set; }
    [Column("is_scheduled")] public bool IsScheduled { get; set; }
    [Column("reminder_at")] public DateTime? ReminderAt { get; set; }
    [Column("created_at")] public DateTime CreatedAt { get; set; }
    [Column("customer_name")] public string? CustomerName { get; set; }
    [Column("agent_name")] public string? AgentName { get; set; }
}

public class Opportunity
{
    [Column("opportunity_id")] public uint OpportunityId { get; set; }
    [Column("lead_id")] public uint LeadId { get; set; }
    [Column("stage")] public string Stage { get; set; } = string.Empty;
    [Column("premium_amount")] public decimal PremiumAmount { get; set; }
    [Column("probability")] public byte Probability { get; set; }
    [Column("notes")] public string? Notes { get; set; }
    [Column("updated_at")] public DateTime UpdatedAt { get; set; }
    [Column("created_at")] public DateTime CreatedAt { get; set; }
    [Column("customer_name")] public string? CustomerName { get; set; }
    [Column("agent_id")] public uint? AgentId { get; set; }
    [Column("agent_name")] public string? AgentName { get; set; }
}

public class Policy
{
    [Column("policy_id")] public uint PolicyId { get; set; }
    [Column("customer_name")] public string CustomerName { get; set; } = string.Empty;
    [Column("policy_number")] public string PolicyNumber { get; set; } = string.Empty;
    [Column("lead_id")] public uint? LeadId { get; set; }
    [Column("product_type_id")] public uint ProductTypeId { get; set; }
    [Column("premium")] public decimal Premium { get; set; }
    [Column("start_date")] public DateOnly StartDate { get; set; }
    [Column("end_date")] public DateOnly EndDate { get; set; }
    [Column("agent_id")] public uint AgentId { get; set; }
    [Column("renewal_notified_30")] public bool RenewalNotified30 { get; set; }
    [Column("renewal_notified_60")] public bool RenewalNotified60 { get; set; }
    [Column("renewal_notified_90")] public bool RenewalNotified90 { get; set; }
    [Column("created_at")] public DateTime CreatedAt { get; set; }
    [Column("product_type_name")] public string? ProductTypeName { get; set; }
    [Column("agent_name")] public string? AgentName { get; set; }
    [Column("days_to_expiry")] public int? DaysToExpiry { get; set; }
}

public class Notification
{
    [Column("notification_id")] public uint NotificationId { get; set; }
    [Column("user_id")] public uint UserId { get; set; }
    [Column("message")] public string Message { get; set; } = string.Empty;
    [Column("type")] public string Type { get; set; } = string.Empty;
    [Column("status")] public string Status { get; set; } = string.Empty;
    [Column("created_at")] public DateTime CreatedAt { get; set; }
}

public class Role
{
    [Column("role_id")] public uint RoleId { get; set; }
    [Column("name")] public string Name { get; set; } = string.Empty;
    [Column("permissions")] public string Permissions { get; set; } = "{}";
    [Column("created_at")] public DateTime CreatedAt { get; set; }
}

public class ProductType
{
    [Column("product_type_id")] public uint ProductTypeId { get; set; }
    [Column("name")] public string Name { get; set; } = string.Empty;
    [Column("description")] public string? Description { get; set; }
    [Column("is_active")] public bool IsActive { get; set; }
    [Column("created_at")] public DateTime CreatedAt { get; set; }
}

public class LeadSubStatus
{
    [Column("id")] public uint Id { get; set; }
    [Column("lead_status")] public string LeadStatus { get; set; } = string.Empty;
    [Column("sub_status_name")] public string SubStatusName { get; set; } = string.Empty;
    [Column("is_active")] public bool IsActive { get; set; }
}

public class RenewalPolicy
{
    [Column("policy_id")] public uint PolicyId { get; set; }
    [Column("customer_name")] public string CustomerName { get; set; } = string.Empty;
    [Column("policy_number")] public string PolicyNumber { get; set; } = string.Empty;
    [Column("end_date")] public DateOnly EndDate { get; set; }
    [Column("agent_id")] public uint AgentId { get; set; }
    [Column("renewal_notified_30")] public bool RenewalNotified30 { get; set; }
    [Column("renewal_notified_60")] public bool RenewalNotified60 { get; set; }
    [Column("renewal_notified_90")] public bool RenewalNotified90 { get; set; }
    [Column("days_to_expiry")] public int DaysToExpiry { get; set; }
}
