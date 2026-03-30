using ActivityTrackerAPI.Helpers;
using ActivityTrackerAPI.Models.DTOs;
using ActivityTrackerAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ActivityTrackerAPI.Controllers;

/// <summary>User management endpoints</summary>
[ApiController]
[Route("api/users")]
[Authorize]
[Produces("application/json")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    /// <summary>List users with optional filters and pagination</summary>
    [HttpGet]
    [ProducesResponseType(200)]
    public async Task<IActionResult> GetUsers(
        [FromQuery] uint? role_id,
        [FromQuery] uint? branch_id,
        [FromQuery] bool? is_active,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 20)
    {
        var roleName = User.GetRoleName();
        var currentBranchId = User.GetBranchId();

        // Branch Manager / Team Leader can only see users in their branch
        if ((roleName == "Branch Manager" || roleName == "Team Leader") && branch_id == null)
            branch_id = currentBranchId;

        limit = Math.Min(limit, 100);
        var (data, total) = await _userService.GetAllAsync(role_id, branch_id, is_active, search, page, limit);

        return Ok(new
        {
            success = true,
            data,
            pagination = new { page, limit, total, totalPages = (int)Math.Ceiling((double)total / limit) }
        });
    }

    /// <summary>Create a new user (Admin only)</summary>
    [HttpPost]
    [ProducesResponseType(201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { success = false, message = "Validation failed", errors = ModelState });

        var roleName = User.GetRoleName();
        if (roleName != "Admin")
            return StatusCode(403, new { success = false, message = "Access denied. Required roles: Admin" });

        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);
        var user = await _userService.CreateAsync(
            request.Name, request.Email, hashedPassword,
            request.RoleId, request.BranchId, request.IsActive);

        return StatusCode(201, new { success = true, data = user });
    }

    /// <summary>Get a user by ID</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetUser(uint id)
    {
        var user = await _userService.GetByIdAsync(id);
        if (user == null)
            return NotFound(new { success = false, message = "User not found" });

        return Ok(new { success = true, data = user });
    }

    /// <summary>Update a user (Admin only)</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateUser(uint id, [FromBody] UpdateUserRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { success = false, message = "Validation failed", errors = ModelState });

        var roleName = User.GetRoleName();
        if (roleName != "Admin")
            return StatusCode(403, new { success = false, message = "Access denied. Required roles: Admin" });

        var existing = await _userService.GetByIdAsync(id);
        if (existing == null)
            return NotFound(new { success = false, message = "User not found" });

        var updated = await _userService.UpdateAsync(id, request.Name, request.Email,
            request.RoleId, request.BranchId, request.IsActive);

        return Ok(new { success = true, data = updated });
    }

    /// <summary>Soft-delete (deactivate) a user (Admin only)</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteUser(uint id)
    {
        var roleName = User.GetRoleName();
        if (roleName != "Admin")
            return StatusCode(403, new { success = false, message = "Access denied. Required roles: Admin" });

        var existing = await _userService.GetByIdAsync(id);
        if (existing == null)
            return NotFound(new { success = false, message = "User not found" });

        await _userService.UpdateAsync(id, null, null, null, null, false);
        return Ok(new { success = true, message = "User deactivated successfully" });
    }
}
