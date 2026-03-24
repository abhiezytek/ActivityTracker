using ActivityTrackerAPI.Helpers;
using ActivityTrackerAPI.Models.DTOs;
using ActivityTrackerAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ActivityTrackerAPI.Controllers;

/// <summary>Activity management endpoints</summary>
[ApiController]
[Route("api/activities")]
[Authorize]
[Produces("application/json")]
public class ActivitiesController : ControllerBase
{
    private readonly IActivityService _activityService;
    private readonly INotificationService _notificationService;

    public ActivitiesController(IActivityService activityService, INotificationService notificationService)
    {
        _activityService = activityService;
        _notificationService = notificationService;
    }

    /// <summary>List activities with optional filters and pagination</summary>
    [HttpGet]
    [ProducesResponseType(200)]
    public async Task<IActionResult> GetActivities(
        [FromQuery] uint? lead_id,
        [FromQuery] uint? user_id,
        [FromQuery] string? activity_type,
        [FromQuery] string? date_from,
        [FromQuery] string? date_to,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 20)
    {
        var roleName = User.GetRoleName();
        var currentUserId = User.GetUserId();
        var branchId = User.GetBranchId();

        uint? filterUserId = user_id;
        uint? filterBranchId = null;

        if (roleName == "Sales Agent")
            filterUserId = currentUserId;
        else if (roleName == "Branch Manager" || roleName == "Team Leader")
        {
            if (user_id.HasValue)
                filterUserId = user_id;
            else
                filterBranchId = branchId;
        }

        limit = Math.Min(limit, 100);
        var (data, total) = await _activityService.GetAllAsync(
            lead_id, filterUserId, activity_type, date_from, date_to,
            filterBranchId, page, limit);

        return Ok(new
        {
            success = true,
            data,
            pagination = new { page, limit, total, totalPages = (int)Math.Ceiling((double)total / limit) }
        });
    }

    /// <summary>Log a new activity</summary>
    [HttpPost]
    [ProducesResponseType(201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> CreateActivity([FromBody] CreateActivityRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { success = false, message = "Validation failed", errors = ModelState });

        var userId = User.GetUserId();
        var activity = await _activityService.CreateAsync(
            request.LeadId, userId, request.ActivityType, request.ActivityDate,
            request.DurationMinutes, request.Outcome, request.Notes,
            request.LocationLat, request.LocationLong,
            request.IsScheduled, request.IsScheduled ? request.ReminderAt : null);

        // Reminder notification for scheduled activities
        if (request.IsScheduled && request.ReminderAt.HasValue)
        {
            await _notificationService.CreateAsync(userId,
                $"Reminder: {request.ActivityType} scheduled for {request.ActivityDate:g}",
                "reminder");
        }

        return StatusCode(201, new { success = true, data = activity });
    }

    /// <summary>Get upcoming scheduled activities</summary>
    [HttpGet("upcoming")]
    [ProducesResponseType(200)]
    public async Task<IActionResult> GetUpcomingActivities()
    {
        var roleName = User.GetRoleName();
        var userId = User.GetUserId();
        var branchId = User.GetBranchId();

        uint? filterUserId = null;
        uint? filterBranchId = null;

        if (roleName == "Sales Agent")
            filterUserId = userId;
        else if (roleName == "Branch Manager" || roleName == "Team Leader")
            filterBranchId = branchId;

        var data = await _activityService.GetUpcomingAsync(filterUserId, filterBranchId);
        return Ok(new { success = true, data });
    }

    /// <summary>Update an activity</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateActivity(uint id, [FromBody] UpdateActivityRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { success = false, message = "Validation failed", errors = ModelState });

        var existing = await _activityService.GetByIdAsync(id);
        if (existing == null)
            return NotFound(new { success = false, message = "Activity not found" });

        var roleName = User.GetRoleName();
        var userId = User.GetUserId();
        if (roleName == "Sales Agent" && existing.UserId != userId)
            return StatusCode(403, new { success = false, message = "Access denied" });

        var updated = await _activityService.UpdateAsync(id,
            request.ActivityType, request.ActivityDate, request.DurationMinutes,
            request.Outcome, request.Notes, request.LocationLat, request.LocationLong,
            request.IsScheduled, request.ReminderAt);

        return Ok(new { success = true, data = updated });
    }

    /// <summary>Delete an activity</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteActivity(uint id)
    {
        var existing = await _activityService.GetByIdAsync(id);
        if (existing == null)
            return NotFound(new { success = false, message = "Activity not found" });

        var roleName = User.GetRoleName();
        var userId = User.GetUserId();
        if (roleName == "Sales Agent" && existing.UserId != userId)
            return StatusCode(403, new { success = false, message = "Access denied" });

        await _activityService.DeleteAsync(id);
        return Ok(new { success = true, message = "Activity deleted successfully" });
    }
}
