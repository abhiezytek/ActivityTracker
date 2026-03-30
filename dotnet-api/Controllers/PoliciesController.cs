using ActivityTrackerAPI.Helpers;
using ActivityTrackerAPI.Models.DTOs;
using ActivityTrackerAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ActivityTrackerAPI.Controllers;

/// <summary>Insurance policy management endpoints</summary>
[ApiController]
[Route("api/policies")]
//[Authorize]
[Produces("application/json")]
public class PoliciesController : ControllerBase
{
    private readonly IPolicyService _policyService;

    public PoliciesController(IPolicyService policyService)
    {
        _policyService = policyService;
    }

    /// <summary>List policies with optional filters and pagination</summary>
    [HttpGet]
    [ProducesResponseType(200)]
    public async Task<IActionResult> GetPolicies(
        [FromQuery] uint? product_type_id,
        [FromQuery] uint? agent_id,
        [FromQuery] string? date_from,
        [FromQuery] string? date_to,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 20)
    {
        var roleName = User.GetRoleName();
        var userId = User.GetUserId();

        uint? filterAgentId = agent_id;
        if (roleName == "Sales Agent")
            filterAgentId = userId;

        limit = Math.Min(limit, 100);
        var (data, total) = await _policyService.GetAllAsync(
            product_type_id, filterAgentId, date_from, date_to, search, page, limit);

        return Ok(new
        {
            success = true,
            data,
            pagination = new { page, limit, total, totalPages = (int)Math.Ceiling((double)total / limit) }
        });
    }

    /// <summary>Create a new policy</summary>
    [HttpPost]
    [ProducesResponseType(201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> CreatePolicy([FromBody] CreatePolicyRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { success = false, message = "Validation failed", errors = ModelState });

        var policy = await _policyService.CreateAsync(
            request.CustomerName, request.PolicyNumber, request.LeadId,
            request.ProductTypeId, request.Premium,
            request.StartDate, request.EndDate, request.AgentId);

        return StatusCode(201, new { success = true, data = policy });
    }

    /// <summary>Get policies expiring in 30/60/90 days</summary>
    [HttpGet("renewals")]
    [ProducesResponseType(200)]
    public async Task<IActionResult> GetRenewals([FromQuery] uint? agent_id)
    {
        var roleName = User.GetRoleName();
        var userId = User.GetUserId();

        uint? filterAgentId = agent_id;
        if (roleName == "Sales Agent")
            filterAgentId = userId;

        var data = await _policyService.GetRenewalsAsync(filterAgentId);
        return Ok(new { success = true, data });
    }

    /// <summary>Update a policy</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdatePolicy(uint id, [FromBody] UpdatePolicyRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { success = false, message = "Validation failed", errors = ModelState });

        var existing = await _policyService.GetByIdAsync(id);
        if (existing == null)
            return NotFound(new { success = false, message = "Policy not found" });

        var updated = await _policyService.UpdateAsync(id,
            request.CustomerName, request.PolicyNumber, request.LeadId,
            request.ProductTypeId, request.Premium, request.StartDate, request.EndDate,
            request.AgentId, request.RenewalNotified30, request.RenewalNotified60, request.RenewalNotified90);

        return Ok(new { success = true, data = updated });
    }

    /// <summary>Delete a policy (Admin only)</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeletePolicy(uint id)
    {
        var roleName = User.GetRoleName();
        if (roleName != "Admin")
            return StatusCode(403, new { success = false, message = "Access denied. Required roles: Admin" });

        var existing = await _policyService.GetByIdAsync(id);
        if (existing == null)
            return NotFound(new { success = false, message = "Policy not found" });

        await _policyService.DeleteAsync(id);
        return Ok(new { success = true, message = "Policy deleted successfully" });
    }
}
