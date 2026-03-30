using ActivityTrackerAPI.Helpers;
using ActivityTrackerAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ActivityTrackerAPI.Controllers;

/// <summary>Notification management endpoints</summary>
[ApiController]
[Route("api/notifications")]
//[Authorize]
[Produces("application/json")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    /// <summary>Get current user's notifications</summary>
    [HttpGet]
    [ProducesResponseType(200)]
    public async Task<IActionResult> GetNotifications(
        [FromQuery] int page = 1,
        [FromQuery] int limit = 20)
    {
        var userId = User.GetUserId();
        limit = Math.Min(limit, 100);
        var (data, total, unreadCount) = await _notificationService.GetByUserAsync(userId, page, limit);

        return Ok(new
        {
            success = true,
            data,
            unread_count = unreadCount,
            pagination = new { page, limit, total, totalPages = (int)Math.Ceiling((double)total / limit) }
        });
    }

    /// <summary>Mark all notifications as read</summary>
    [HttpPut("read-all")]
    [ProducesResponseType(200)]
    public async Task<IActionResult> MarkAllRead()
    {
        var userId = User.GetUserId();
        var count = await _notificationService.MarkAllReadAsync(userId);
        return Ok(new { success = true, message = $"{count} notifications marked as read" });
    }

    /// <summary>Mark a single notification as read</summary>
    [HttpPut("{id:int}/read")]
    [ProducesResponseType(200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> MarkRead(uint id)
    {
        var userId = User.GetUserId();
        var notification = await _notificationService.MarkReadAsync(id, userId);
        if (notification == null)
            return NotFound(new { success = false, message = "Notification not found" });

        return Ok(new { success = true, data = notification });
    }

    /// <summary>Delete a notification</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(200)]
    public async Task<IActionResult> DeleteNotification(uint id)
    {
        var userId = User.GetUserId();
        await _notificationService.DeleteAsync(id, userId);
        return Ok(new { success = true, message = "Notification deleted" });
    }
}
