namespace ActivityTrackerAPI.Models;

public class User
{
    public uint UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public uint RoleId { get; set; }
    public uint? BranchId { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public string? Permissions { get; set; }
    public string? BranchName { get; set; }
}

public class Lead
{
    public uint LeadId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public uint? ProductTypeId { get; set; }
    public string Source { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? SubStatus { get; set; }
    public uint? AssignedTo { get; set; }
    public uint? CreatedBy { get; set; }
    public string? Notes { get; set; }
    public decimal ExpectedPremium { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public bool IsDeleted { get; set; }
    public string? AssignedAgentName { get; set; }
    public string? ProductTypeName { get; set; }
    public IList<Activity>? Activities { get; set; }
}

public class Activity
{
    public uint ActivityId { get; set; }
    public uint LeadId { get; set; }
    public uint UserId { get; set; }
    public string ActivityType { get; set; } = string.Empty;
    public DateTime ActivityDate { get; set; }
    public uint? DurationMinutes { get; set; }
    public string? Outcome { get; set; }
    public string? Notes { get; set; }
    public decimal? LocationLat { get; set; }
    public decimal? LocationLong { get; set; }
    public bool IsScheduled { get; set; }
    public DateTime? ReminderAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? CustomerName { get; set; }
    public string? AgentName { get; set; }
}

public class Opportunity
{
    public uint OpportunityId { get; set; }
    public uint LeadId { get; set; }
    public string Stage { get; set; } = string.Empty;
    public decimal PremiumAmount { get; set; }
    public byte Probability { get; set; }
    public string? Notes { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? CustomerName { get; set; }
    public uint? AgentId { get; set; }
    public string? AgentName { get; set; }
}

public class Policy
{
    public uint PolicyId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string PolicyNumber { get; set; } = string.Empty;
    public uint? LeadId { get; set; }
    public uint ProductTypeId { get; set; }
    public decimal Premium { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public uint AgentId { get; set; }
    public bool RenewalNotified30 { get; set; }
    public bool RenewalNotified60 { get; set; }
    public bool RenewalNotified90 { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? ProductTypeName { get; set; }
    public string? AgentName { get; set; }
    public int? DaysToExpiry { get; set; }
}

public class Notification
{
    public uint NotificationId { get; set; }
    public uint UserId { get; set; }
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class Role
{
    public uint RoleId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Permissions { get; set; } = "{}";
    public DateTime CreatedAt { get; set; }
}

public class ProductType
{
    public uint ProductTypeId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class LeadSubStatus
{
    public uint Id { get; set; }
    public string LeadStatus { get; set; } = string.Empty;
    public string SubStatusName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public class RenewalPolicy
{
    public uint PolicyId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string PolicyNumber { get; set; } = string.Empty;
    public DateOnly EndDate { get; set; }
    public uint AgentId { get; set; }
    public bool RenewalNotified30 { get; set; }
    public bool RenewalNotified60 { get; set; }
    public bool RenewalNotified90 { get; set; }
    public int DaysToExpiry { get; set; }
}
