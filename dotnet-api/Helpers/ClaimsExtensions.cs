using System.Security.Claims;

namespace ActivityTrackerAPI.Helpers;

public static class ClaimsExtensions
{
    public static uint GetUserId(this ClaimsPrincipal user)
    {
        var claim = user.FindFirst("user_id")?.Value;
        return claim != null ? uint.Parse(claim) : 0;
    }

    public static string GetRoleName(this ClaimsPrincipal user)
    {
        return user.FindFirst("role_name")?.Value
            ?? user.FindFirst(ClaimTypes.Role)?.Value
            ?? string.Empty;
    }

    public static uint? GetBranchId(this ClaimsPrincipal user)
    {
        var claim = user.FindFirst("branch_id")?.Value;
        if (string.IsNullOrEmpty(claim)) return null;
        return uint.TryParse(claim, out var id) ? id : null;
    }

    public static uint GetRoleId(this ClaimsPrincipal user)
    {
        var claim = user.FindFirst("role_id")?.Value;
        return claim != null ? uint.Parse(claim) : 0;
    }
}
