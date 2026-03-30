using ActivityTrackerAPI.Helpers;
using ActivityTrackerAPI.Models.DTOs;
using ActivityTrackerAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ActivityTrackerAPI.Controllers;

/// <summary>Sales opportunity management endpoints</summary>
[ApiController]
[Route("api/opportunities")]
//[Authorize]
[Produces("application/json")]
public class OpportunitiesController : ControllerBase
{
    private readonly IOpportunityService _opportunityService;

    public OpportunitiesController(IOpportunityService opportunityService)
    {
        _opportunityService = opportunityService;
    }

    /// <summary>List opportunities with optional filters and pagination</summary>
    [HttpGet]
    [ProducesResponseType(200)]
    public async Task<IActionResult> GetOpportunities(
        [FromQuery] uint? lead_id,
        [FromQuery] string? stage,
        [FromQuery] uint? agent_id,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 20)
    {
        var roleName = User.GetRoleName();
        var userId = User.GetUserId();

        uint? filterAgentId = agent_id;
        if (roleName == "Sales Agent")
            filterAgentId = userId;

        limit = Math.Min(limit, 100);
        var (data, total) = await _opportunityService.GetAllAsync(lead_id, stage, filterAgentId, page, limit);

        return Ok(new
        {
            success = true,
            data,
            pagination = new { page, limit, total, totalPages = (int)Math.Ceiling((double)total / limit) }
        });
    }

    /// <summary>Create a new opportunity</summary>
    [HttpPost]
    [ProducesResponseType(201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> CreateOpportunity([FromBody] CreateOpportunityRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { success = false, message = "Validation failed", errors = ModelState });

        var opp = await _opportunityService.CreateAsync(
            request.LeadId, request.Stage, request.PremiumAmount, request.Probability, request.Notes);

        return StatusCode(201, new { success = true, data = opp });
    }

    /// <summary>Get aggregated pipeline by stage</summary>
    [HttpGet("pipeline")]
    [ProducesResponseType(200)]
    public async Task<IActionResult> GetPipeline([FromQuery] uint? agent_id)
    {
        var roleName = User.GetRoleName();
        var userId = User.GetUserId();

        uint? filterAgentId = agent_id;
        if (roleName == "Sales Agent")
            filterAgentId = userId;

        var data = await _opportunityService.GetPipelineAsync(filterAgentId);
        return Ok(new { success = true, data });
    }

    /// <summary>Update an opportunity</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateOpportunity(uint id, [FromBody] UpdateOpportunityRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { success = false, message = "Validation failed", errors = ModelState });

        var existing = await _opportunityService.GetByIdAsync(id);
        if (existing == null)
            return NotFound(new { success = false, message = "Opportunity not found" });

        var updated = await _opportunityService.UpdateAsync(id,
            request.Stage, request.PremiumAmount, request.Probability, request.Notes);

        return Ok(new { success = true, data = updated });
    }

    /// <summary>Delete an opportunity</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteOpportunity(uint id)
    {
        var existing = await _opportunityService.GetByIdAsync(id);
        if (existing == null)
            return NotFound(new { success = false, message = "Opportunity not found" });

        await _opportunityService.DeleteAsync(id);
        return Ok(new { success = true, message = "Opportunity deleted successfully" });
    }
}
