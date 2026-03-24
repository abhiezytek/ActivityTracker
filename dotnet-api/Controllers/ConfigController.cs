using ActivityTrackerAPI.Helpers;
using ActivityTrackerAPI.Models.DTOs;
using ActivityTrackerAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace ActivityTrackerAPI.Controllers;

/// <summary>System configuration management endpoints</summary>
[ApiController]
[Route("api/config")]
[Authorize]
[Produces("application/json")]
public class ConfigController : ControllerBase
{
    private readonly IConfigService _configService;

    public ConfigController(IConfigService configService)
    {
        _configService = configService;
    }

    // ── Roles ─────────────────────────────────────────────────────────────────

    /// <summary>List all roles (Admin only)</summary>
    [HttpGet("roles")]
    [ProducesResponseType(200)]
    [ProducesResponseType(403)]
    public async Task<IActionResult> GetRoles()
    {
        if (User.GetRoleName() != "Admin")
            return StatusCode(403, new { success = false, message = "Access denied. Required roles: Admin" });

        var roles = await _configService.GetRolesAsync();
        return Ok(new { success = true, data = roles });
    }

    /// <summary>Create a new role (Admin only)</summary>
    [HttpPost("roles")]
    [ProducesResponseType(201)]
    [ProducesResponseType(403)]
    public async Task<IActionResult> CreateRole([FromBody] CreateRoleRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { success = false, message = "Validation failed", errors = ModelState });

        if (User.GetRoleName() != "Admin")
            return StatusCode(403, new { success = false, message = "Access denied. Required roles: Admin" });

        var permissions = request.Permissions != null
            ? JsonSerializer.Serialize(request.Permissions)
            : "{}";

        var role = await _configService.CreateRoleAsync(request.Name, permissions);
        return StatusCode(201, new { success = true, data = role });
    }

    /// <summary>Update a role (Admin only)</summary>
    [HttpPut("roles/{id:int}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateRole(uint id, [FromBody] UpdateRoleRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { success = false, message = "Validation failed", errors = ModelState });

        if (User.GetRoleName() != "Admin")
            return StatusCode(403, new { success = false, message = "Access denied. Required roles: Admin" });

        var existing = await _configService.GetRoleByIdAsync(id);
        if (existing == null)
            return NotFound(new { success = false, message = "Role not found" });

        var permissions = request.Permissions != null
            ? JsonSerializer.Serialize(request.Permissions)
            : (string?)null;

        await _configService.UpdateRoleAsync(id, request.Name, permissions);
        var updated = await _configService.GetRoleByIdAsync(id);
        return Ok(new { success = true, data = updated });
    }

    /// <summary>Delete a role (Admin only)</summary>
    [HttpDelete("roles/{id:int}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(403)]
    [ProducesResponseType(409)]
    public async Task<IActionResult> DeleteRole(uint id)
    {
        if (User.GetRoleName() != "Admin")
            return StatusCode(403, new { success = false, message = "Access denied. Required roles: Admin" });

        var (canDelete, _) = await _configService.DeleteRoleAsync(id);
        if (!canDelete)
            return Conflict(new { success = false, message = "Cannot delete role: users are assigned to it" });

        return Ok(new { success = true, message = "Role deleted" });
    }

    // ── Product Types ─────────────────────────────────────────────────────────

    /// <summary>List all product types</summary>
    [HttpGet("product-types")]
    [ProducesResponseType(200)]
    public async Task<IActionResult> GetProductTypes()
    {
        var data = await _configService.GetProductTypesAsync();
        return Ok(new { success = true, data });
    }

    /// <summary>Create a product type (Admin only)</summary>
    [HttpPost("product-types")]
    [ProducesResponseType(201)]
    [ProducesResponseType(403)]
    public async Task<IActionResult> CreateProductType([FromBody] CreateProductTypeRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { success = false, message = "Validation failed", errors = ModelState });

        if (User.GetRoleName() != "Admin")
            return StatusCode(403, new { success = false, message = "Access denied. Required roles: Admin" });

        var data = await _configService.CreateProductTypeAsync(request.Name, request.Description);
        return StatusCode(201, new { success = true, data });
    }

    /// <summary>Update a product type (Admin only)</summary>
    [HttpPut("product-types/{id:int}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateProductType(uint id, [FromBody] UpdateProductTypeRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { success = false, message = "Validation failed", errors = ModelState });

        if (User.GetRoleName() != "Admin")
            return StatusCode(403, new { success = false, message = "Access denied. Required roles: Admin" });

        var existing = await _configService.GetProductTypeByIdAsync(id);
        if (existing == null)
            return NotFound(new { success = false, message = "Product type not found" });

        var updated = await _configService.UpdateProductTypeAsync(id, request.Name, request.Description, request.IsActive);
        return Ok(new { success = true, data = updated });
    }

    /// <summary>Deactivate a product type (Admin only)</summary>
    [HttpDelete("product-types/{id:int}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(403)]
    public async Task<IActionResult> DeleteProductType(uint id)
    {
        if (User.GetRoleName() != "Admin")
            return StatusCode(403, new { success = false, message = "Access denied. Required roles: Admin" });

        await _configService.DeactivateProductTypeAsync(id);
        return Ok(new { success = true, message = "Product type deactivated" });
    }

    // ── Lead Sub-Statuses ─────────────────────────────────────────────────────

    /// <summary>Get lead sub-statuses, optionally filtered by lead_status</summary>
    [HttpGet("lead-sub-statuses")]
    [ProducesResponseType(200)]
    public async Task<IActionResult> GetLeadSubStatuses([FromQuery] string? lead_status)
    {
        var data = await _configService.GetLeadSubStatusesAsync(lead_status);
        return Ok(new { success = true, data });
    }

    /// <summary>Add a lead sub-status (Admin only)</summary>
    [HttpPost("lead-sub-statuses")]
    [ProducesResponseType(201)]
    [ProducesResponseType(403)]
    public async Task<IActionResult> CreateLeadSubStatus([FromBody] CreateLeadSubStatusRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { success = false, message = "Validation failed", errors = ModelState });

        if (User.GetRoleName() != "Admin")
            return StatusCode(403, new { success = false, message = "Access denied. Required roles: Admin" });

        var data = await _configService.CreateLeadSubStatusAsync(request.LeadStatus, request.SubStatusName);
        return StatusCode(201, new { success = true, data });
    }

    /// <summary>Update a lead sub-status (Admin only)</summary>
    [HttpPut("lead-sub-statuses/{id:int}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateLeadSubStatus(uint id, [FromBody] UpdateLeadSubStatusRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { success = false, message = "Validation failed", errors = ModelState });

        if (User.GetRoleName() != "Admin")
            return StatusCode(403, new { success = false, message = "Access denied. Required roles: Admin" });

        var existing = await _configService.GetLeadSubStatusByIdAsync(id);
        if (existing == null)
            return NotFound(new { success = false, message = "Lead sub-status not found" });

        var updated = await _configService.UpdateLeadSubStatusAsync(id, request.LeadStatus, request.SubStatusName, request.IsActive);
        return Ok(new { success = true, data = updated });
    }

    /// <summary>Deactivate a lead sub-status (Admin only)</summary>
    [HttpDelete("lead-sub-statuses/{id:int}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(403)]
    public async Task<IActionResult> DeleteLeadSubStatus(uint id)
    {
        if (User.GetRoleName() != "Admin")
            return StatusCode(403, new { success = false, message = "Access denied. Required roles: Admin" });

        await _configService.DeactivateLeadSubStatusAsync(id);
        return Ok(new { success = true, message = "Lead sub-status deactivated" });
    }
}
