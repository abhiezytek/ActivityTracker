using ActivityTrackerAPI.Helpers;
using ActivityTrackerAPI.Models.DTOs;
using ActivityTrackerAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ActivityTrackerAPI.Controllers;

/// <summary>Authentication endpoints</summary>
[ApiController]
[Route("api/auth")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IJwtService _jwtService;
    private readonly INotificationService _notificationService;
    private readonly IPolicyService _policyService;
    private readonly IServiceProvider _serviceProvider;

    public AuthController(
        IUserService userService,
        IJwtService jwtService,
        INotificationService notificationService,
        IPolicyService policyService,
        IServiceProvider serviceProvider)
    {
        _userService = userService;
        _jwtService = jwtService;
        _notificationService = notificationService;
        _policyService = policyService;
        _serviceProvider = serviceProvider;
    }

    /// <summary>Login with email and password</summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(LoginResponse), 200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { success = false, message = "Validation failed", errors = ModelState });

        var user = await _userService.GetByEmailAsync(request.Email);
        if (user == null)
            return Unauthorized(new { success = false, message = "Invalid email or password" });

        if (!user.IsActive)
            return Unauthorized(new { success = false, message = "Account is inactive" });

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
            return Unauthorized(new { success = false, message = "Invalid email or password" });

        var token = _jwtService.GenerateToken(user);

        // Fire-and-forget renewal notifications (scoped services via IServiceProvider)
        var isAdmin = user.RoleName == "Admin";
        var capturedUserId = user.UserId;
        var sp = _serviceProvider;
        _ = Task.Run(async () =>
        {
            try
            {
                using var scope = sp.CreateScope();
                var policyService = scope.ServiceProvider.GetRequiredService<IPolicyService>();
                var notifService = scope.ServiceProvider.GetRequiredService<INotificationService>();
                await GenerateRenewalNotificationsAsync(policyService, notifService, capturedUserId, isAdmin);
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"generateRenewalNotifications error: {ex.Message}");
            }
        });

        return Ok(new
        {
            success = true,
            token,
            user = new
            {
                user_id = user.UserId,
                name = user.Name,
                email = user.Email,
                role_name = user.RoleName,
                role_id = user.RoleId,
                branch_id = user.BranchId,
                branch_name = user.BranchName
            }
        });
    }

    /// <summary>Get current authenticated user profile</summary>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMe()
    {
        var userId = User.GetUserId();
        var user = await _userService.GetByIdAsync(userId);
        if (user == null)
            return NotFound(new { success = false, message = "User not found" });

        return Ok(new
        {
            success = true,
            data = new
            {
                user.UserId,
                user.Name,
                user.Email,
                user.RoleId,
                user.RoleName,
                user.BranchId,
                user.BranchName,
                user.IsActive,
                user.CreatedAt,
                user.Permissions
            }
        });
    }

    /// <summary>Logout (client-side token invalidation)</summary>
    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(200)]
    public IActionResult Logout()
    {
        return Ok(new { success = true, message = "Logged out successfully" });
    }

    /// <summary>Change current user's password</summary>
    [HttpPost("change-password")]
    [Authorize]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { success = false, message = "Validation failed", errors = ModelState });

        var userId = User.GetUserId();
        var currentPassword = await _userService.GetPasswordAsync(userId);
        if (currentPassword == null)
            return NotFound(new { success = false, message = "User not found" });

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, currentPassword))
            return BadRequest(new { success = false, message = "Current password is incorrect" });

        var hashed = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await _userService.UpdatePasswordAsync(userId, hashed);

        return Ok(new { success = true, message = "Password changed successfully" });
    }

    private static async Task GenerateRenewalNotificationsAsync(
        IPolicyService policyService,
        INotificationService notifService,
        uint userId,
        bool isAdmin)
    {
        var policies = await policyService.GetRenewalPoliciesForNotificationsAsync(
            isAdmin ? null : userId);

        foreach (var policy in policies)
        {
            if (policy.DaysToExpiry <= 30 && !policy.RenewalNotified30)
            {
                await notifService.CreateAsync(policy.AgentId,
                    $"Policy {policy.PolicyNumber} for {policy.CustomerName} expires in {policy.DaysToExpiry} day(s). Please initiate renewal.",
                    "renewal");
                await policyService.MarkRenewalNotifiedAsync(policy.PolicyId, 30);
            }
            else if (policy.DaysToExpiry <= 60 && !policy.RenewalNotified60)
            {
                await notifService.CreateAsync(policy.AgentId,
                    $"Policy {policy.PolicyNumber} for {policy.CustomerName} expires in {policy.DaysToExpiry} day(s). Please plan renewal.",
                    "renewal");
                await policyService.MarkRenewalNotifiedAsync(policy.PolicyId, 60);
            }
            else if (policy.DaysToExpiry <= 90 && !policy.RenewalNotified90)
            {
                await notifService.CreateAsync(policy.AgentId,
                    $"Policy {policy.PolicyNumber} for {policy.CustomerName} expires in {policy.DaysToExpiry} day(s). Renewal due soon.",
                    "renewal");
                await policyService.MarkRenewalNotifiedAsync(policy.PolicyId, 90);
            }
        }
    }
}

