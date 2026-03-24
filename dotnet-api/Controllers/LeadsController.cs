using ActivityTrackerAPI.Helpers;
using ActivityTrackerAPI.Models.DTOs;
using ActivityTrackerAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ActivityTrackerAPI.Controllers;

/// <summary>Lead management endpoints</summary>
[ApiController]
[Route("api/leads")]
[Authorize]
[Produces("application/json")]
public class LeadsController : ControllerBase
{
    private readonly ILeadService _leadService;

    public LeadsController(ILeadService leadService)
    {
        _leadService = leadService;
    }

    /// <summary>List leads with optional filters and pagination</summary>
    [HttpGet]
    [ProducesResponseType(200)]
    public async Task<IActionResult> GetLeads(
        [FromQuery] string? status,
        [FromQuery] uint? product_type_id,
        [FromQuery] uint? assigned_to,
        [FromQuery] string? source,
        [FromQuery] string? date_from,
        [FromQuery] string? date_to,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 20)
    {
        var roleName = User.GetRoleName();
        var userId = User.GetUserId();
        var branchId = User.GetBranchId();

        uint? filterAssignedTo = assigned_to;
        uint? filterBranchId = null;

        if (roleName == "Sales Agent")
            filterAssignedTo = userId;
        else if (roleName == "Branch Manager" || roleName == "Team Leader")
            filterBranchId = branchId;

        limit = Math.Min(limit, 100);
        var (data, total) = await _leadService.GetAllAsync(
            status, product_type_id, filterAssignedTo, source, null,
            filterBranchId, date_from, date_to, search, page, limit);

        return Ok(new
        {
            success = true,
            data,
            pagination = new { page, limit, total, totalPages = (int)Math.Ceiling((double)total / limit) }
        });
    }

    /// <summary>Create a new lead</summary>
    [HttpPost]
    [ProducesResponseType(201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> CreateLead([FromBody] CreateLeadRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { success = false, message = "Validation failed", errors = ModelState });

        var userId = User.GetUserId();
        var lead = await _leadService.CreateAsync(
            request.CustomerName, request.Phone, request.Email,
            request.ProductTypeId, request.Source, request.Status, request.SubStatus,
            request.AssignedTo, userId);

        return StatusCode(201, new { success = true, data = lead });
    }

    /// <summary>Get a lead by ID including its activities</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetLead(uint id)
    {
        var lead = await _leadService.GetWithActivitiesAsync(id);
        if (lead == null)
            return NotFound(new { success = false, message = "Lead not found" });

        return Ok(new { success = true, data = lead });
    }

    /// <summary>Update a lead</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateLead(uint id, [FromBody] UpdateLeadRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { success = false, message = "Validation failed", errors = ModelState });

        var existing = await _leadService.GetByIdAsync(id);
        if (existing == null)
            return NotFound(new { success = false, message = "Lead not found" });

        var updated = await _leadService.UpdateAsync(id,
            request.CustomerName, request.Phone, request.Email,
            request.ProductTypeId, request.Source, request.Status,
            request.SubStatus, request.AssignedTo);

        return Ok(new { success = true, data = updated });
    }

    /// <summary>Soft-delete a lead (Admin/Branch Manager only)</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteLead(uint id)
    {
        var roleName = User.GetRoleName();
        if (roleName != "Admin" && roleName != "Branch Manager")
            return StatusCode(403, new { success = false, message = "Access denied. Required roles: Admin, Branch Manager" });

        var existing = await _leadService.GetByIdAsync(id);
        if (existing == null)
            return NotFound(new { success = false, message = "Lead not found" });

        await _leadService.SoftDeleteAsync(id);
        return Ok(new { success = true, message = "Lead deleted successfully" });
    }

    /// <summary>Assign a lead to an agent (Admin/Branch Manager/Team Leader only)</summary>
    [HttpPost("{id:int}/assign")]
    [ProducesResponseType(200)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> AssignLead(uint id, [FromBody] AssignLeadRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { success = false, message = "Validation failed", errors = ModelState });

        var roleName = User.GetRoleName();
        if (roleName == "Sales Agent")
            return StatusCode(403, new { success = false, message = "Access denied" });

        var existing = await _leadService.GetByIdAsync(id);
        if (existing == null)
            return NotFound(new { success = false, message = "Lead not found" });

        await _leadService.AssignAsync(id, request.AssignedTo);
        var updated = await _leadService.GetByIdAsync(id);
        return Ok(new { success = true, data = updated });
    }
}
