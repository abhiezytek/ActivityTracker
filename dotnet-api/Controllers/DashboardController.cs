using ActivityTrackerAPI.Helpers;
using ActivityTrackerAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ActivityTrackerAPI.Controllers;

/// <summary>Dashboard KPIs and analytics endpoints</summary>
[ApiController]
[Route("api/dashboard")]
[Authorize]
[Produces("application/json")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    /// <summary>Get KPI metrics for the current period</summary>
    [HttpGet("kpis")]
    [ProducesResponseType(200)]
    public async Task<IActionResult> GetKpis(
        [FromQuery] string? date_from,
        [FromQuery] string? date_to)
    {
        var userId = User.GetUserId();
        var roleName = User.GetRoleName();
        var branchId = User.GetBranchId();

        var now = DateTime.UtcNow;
        var from = date_from ?? new DateTime(now.Year, now.Month, 1).ToString("yyyy-MM-dd");
        var to = date_to ?? new DateTime(now.Year, now.Month, DateTime.DaysInMonth(now.Year, now.Month)).ToString("yyyy-MM-dd");

        var data = await _dashboardService.GetKpisAsync(userId, roleName, branchId, from, to);
        return Ok(new { success = true, data });
    }

    /// <summary>Get lead counts by status (pipeline view)</summary>
    [HttpGet("pipeline")]
    [ProducesResponseType(200)]
    public async Task<IActionResult> GetPipeline()
    {
        var userId = User.GetUserId();
        var roleName = User.GetRoleName();
        var branchId = User.GetBranchId();

        var data = await _dashboardService.GetPipelineAsync(userId, roleName, branchId);
        return Ok(new { success = true, data });
    }

    /// <summary>Get per-agent performance report (Admin/Branch Manager/Team Leader only)</summary>
    [HttpGet("performance")]
    [ProducesResponseType(200)]
    [ProducesResponseType(403)]
    public async Task<IActionResult> GetPerformance(
        [FromQuery] uint? agent_id,
        [FromQuery] uint? branch_id,
        [FromQuery] string? date_from,
        [FromQuery] string? date_to)
    {
        var roleName = User.GetRoleName();
        if (roleName == "Sales Agent")
            return StatusCode(403, new { success = false, message = "Access denied" });

        var currentBranchId = User.GetBranchId();

        var now = DateTime.UtcNow;
        var from = date_from ?? new DateTime(now.Year, now.Month, 1).ToString("yyyy-MM-dd");
        var to = date_to ?? new DateTime(now.Year, now.Month, DateTime.DaysInMonth(now.Year, now.Month)).ToString("yyyy-MM-dd");

        var data = await _dashboardService.GetPerformanceAsync(
            roleName, currentBranchId, agent_id, branch_id, from, to);

        return Ok(new { success = true, data });
    }

    /// <summary>Get activity summary by type and day</summary>
    [HttpGet("activities-summary")]
    [ProducesResponseType(200)]
    public async Task<IActionResult> GetActivitiesSummary(
        [FromQuery] string? date_from,
        [FromQuery] string? date_to)
    {
        var userId = User.GetUserId();
        var roleName = User.GetRoleName();
        var branchId = User.GetBranchId();

        var now = DateTime.UtcNow;
        var from = date_from ?? new DateTime(now.Year, now.Month, 1).ToString("yyyy-MM-dd");
        var to = date_to ?? new DateTime(now.Year, now.Month, DateTime.DaysInMonth(now.Year, now.Month)).ToString("yyyy-MM-dd");

        var data = await _dashboardService.GetActivitiesSummaryAsync(userId, roleName, branchId, from, to);
        return Ok(new { success = true, data });
    }
}
