using System.ComponentModel.DataAnnotations;

namespace ActivityTrackerAPI.Models.DTOs;

// ── Auth ─────────────────────────────────────────────────────────────────────

public class LoginRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public class ChangePasswordRequest
{
    [Required]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required, MinLength(6)]
    public string NewPassword { get; set; } = string.Empty;
}

public class LoginResponse
{
    public bool Success { get; set; }
    public string Token { get; set; } = string.Empty;
    public UserInfo User { get; set; } = new();
}

public class UserInfo
{
    public uint UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string RoleName { get; set; } = string.Empty;
    public uint RoleId { get; set; }
    public uint? BranchId { get; set; }
    public string? BranchName { get; set; }
}

// ── Users ─────────────────────────────────────────────────────────────────────

public class CreateUserRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(6)]
    public string Password { get; set; } = string.Empty;

    [Required]
    public uint RoleId { get; set; }

    public uint? BranchId { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateUserRequest
{
    public string? Name { get; set; }
    public string? Email { get; set; }
    public uint? RoleId { get; set; }
    public uint? BranchId { get; set; }
    public bool? IsActive { get; set; }
}

// ── Leads ─────────────────────────────────────────────────────────────────────

public class CreateLeadRequest
{
    [Required]
    public string CustomerName { get; set; } = string.Empty;

    [Required]
    public string Phone { get; set; } = string.Empty;

    public string? Email { get; set; }
    public uint? ProductTypeId { get; set; }

    [Required]
    public string Source { get; set; } = "online";

    public string Status { get; set; } = "New";
    public string? SubStatus { get; set; }
    public uint? AssignedTo { get; set; }
}

public class UpdateLeadRequest
{
    public string? CustomerName { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public uint? ProductTypeId { get; set; }
    public string? Source { get; set; }
    public string? Status { get; set; }
    public string? SubStatus { get; set; }
    public uint? AssignedTo { get; set; }
}

public class AssignLeadRequest
{
    [Required]
    public uint AssignedTo { get; set; }
}

// ── Activities ────────────────────────────────────────────────────────────────

public class CreateActivityRequest
{
    [Required]
    public uint LeadId { get; set; }

    [Required]
    public string ActivityType { get; set; } = string.Empty;

    [Required]
    public DateTime ActivityDate { get; set; }

    public uint? DurationMinutes { get; set; }
    public string? Outcome { get; set; }
    public string? Notes { get; set; }
    public decimal? LocationLat { get; set; }
    public decimal? LocationLong { get; set; }
    public bool IsScheduled { get; set; }
    public DateTime? ReminderAt { get; set; }
}

public class UpdateActivityRequest
{
    public string? ActivityType { get; set; }
    public DateTime? ActivityDate { get; set; }
    public uint? DurationMinutes { get; set; }
    public string? Outcome { get; set; }
    public string? Notes { get; set; }
    public decimal? LocationLat { get; set; }
    public decimal? LocationLong { get; set; }
    public bool? IsScheduled { get; set; }
    public DateTime? ReminderAt { get; set; }
}

// ── Opportunities ─────────────────────────────────────────────────────────────

public class CreateOpportunityRequest
{
    [Required]
    public uint LeadId { get; set; }

    [Required]
    public string Stage { get; set; } = string.Empty;

    [Required]
    public decimal PremiumAmount { get; set; }

    [Required, Range(0, 100)]
    public byte Probability { get; set; }

    public string? Notes { get; set; }
}

public class UpdateOpportunityRequest
{
    public string? Stage { get; set; }
    public decimal? PremiumAmount { get; set; }
    public byte? Probability { get; set; }
    public string? Notes { get; set; }
}

// ── Policies ──────────────────────────────────────────────────────────────────

public class CreatePolicyRequest
{
    [Required]
    public string CustomerName { get; set; } = string.Empty;

    [Required]
    public string PolicyNumber { get; set; } = string.Empty;

    public uint? LeadId { get; set; }

    [Required]
    public uint ProductTypeId { get; set; }

    [Required]
    public decimal Premium { get; set; }

    [Required]
    public DateOnly StartDate { get; set; }

    [Required]
    public DateOnly EndDate { get; set; }

    [Required]
    public uint AgentId { get; set; }
}

public class UpdatePolicyRequest
{
    public string? CustomerName { get; set; }
    public string? PolicyNumber { get; set; }
    public uint? LeadId { get; set; }
    public uint? ProductTypeId { get; set; }
    public decimal? Premium { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public uint? AgentId { get; set; }
    public bool? RenewalNotified30 { get; set; }
    public bool? RenewalNotified60 { get; set; }
    public bool? RenewalNotified90 { get; set; }
}

// ── Config ────────────────────────────────────────────────────────────────────

public class CreateRoleRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;

    public object? Permissions { get; set; }
}

public class UpdateRoleRequest
{
    public string? Name { get; set; }
    public object? Permissions { get; set; }
}

public class CreateProductTypeRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }
}

public class UpdateProductTypeRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public bool? IsActive { get; set; }
}

public class CreateLeadSubStatusRequest
{
    [Required]
    public string LeadStatus { get; set; } = string.Empty;

    [Required]
    public string SubStatusName { get; set; } = string.Empty;
}

public class UpdateLeadSubStatusRequest
{
    public string? LeadStatus { get; set; }
    public string? SubStatusName { get; set; }
    public bool? IsActive { get; set; }
}

// ── Common ────────────────────────────────────────────────────────────────────

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string? Message { get; set; }
}

public class PagedApiResponse<T>
{
    public bool Success { get; set; }
    public IEnumerable<T> Data { get; set; } = Enumerable.Empty<T>();
    public PaginationMeta Pagination { get; set; } = new();
}

public class PaginationMeta
{
    public int Page { get; set; }
    public int Limit { get; set; }
    public int Total { get; set; }
    public int TotalPages { get; set; }
}
