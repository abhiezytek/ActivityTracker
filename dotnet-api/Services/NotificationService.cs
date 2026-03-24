using ActivityTrackerAPI.Models;
using Dapper;

namespace ActivityTrackerAPI.Services;

public interface INotificationService
{
    Task<(IEnumerable<Notification> Data, int Total, int UnreadCount)> GetByUserAsync(uint userId, int page, int limit);
    Task<Notification?> CreateAsync(uint userId, string message, string type);
    Task<Notification?> MarkReadAsync(uint notificationId, uint userId);
    Task<int> MarkAllReadAsync(uint userId);
    Task DeleteAsync(uint notificationId, uint userId);
}

public class NotificationService : INotificationService
{
    private readonly IDbConnectionFactory _dbFactory;

    public NotificationService(IDbConnectionFactory dbFactory)
    {
        _dbFactory = dbFactory;
    }

    public async Task<(IEnumerable<Notification> Data, int Total, int UnreadCount)> GetByUserAsync(uint userId, int page, int limit)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        var offset = (page - 1) * limit;

        using var multi = await conn.QueryMultipleAsync(
            "sp_GetNotificationsByUser",
            new { p_user_id = userId, p_limit = limit, p_offset = offset },
            commandType: System.Data.CommandType.StoredProcedure);

        var total = (int)(await multi.ReadFirstAsync<dynamic>()).total;
        var unreadCount = (int)(await multi.ReadFirstAsync<dynamic>()).unread_count;
        var data = await multi.ReadAsync<Notification>();
        return (data, total, unreadCount);
    }

    public async Task<Notification?> CreateAsync(uint userId, string message, string type)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        var result = await conn.QueryFirstOrDefaultAsync<dynamic>(
            "sp_CreateNotification",
            new { p_user_id = userId, p_message = message, p_type = type },
            commandType: System.Data.CommandType.StoredProcedure);

        if (result == null) return null;

        return await conn.QueryFirstOrDefaultAsync<Notification>(
            "sp_GetNotificationById",
            new { p_notification_id = (uint)result.insert_id },
            commandType: System.Data.CommandType.StoredProcedure);
    }

    public async Task<Notification?> MarkReadAsync(uint notificationId, uint userId)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        using var multi = await conn.QueryMultipleAsync(
            "sp_MarkNotificationRead",
            new { p_notification_id = notificationId, p_user_id = userId },
            commandType: System.Data.CommandType.StoredProcedure);

        return await multi.ReadFirstOrDefaultAsync<Notification>();
    }

    public async Task<int> MarkAllReadAsync(uint userId)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        using var multi = await conn.QueryMultipleAsync(
            "sp_MarkAllNotificationsRead",
            new { p_user_id = userId },
            commandType: System.Data.CommandType.StoredProcedure);

        var result = await multi.ReadFirstAsync<dynamic>();
        return (int)result.affected_rows;
    }

    public async Task DeleteAsync(uint notificationId, uint userId)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        await conn.ExecuteAsync(
            "sp_DeleteNotification",
            new { p_notification_id = notificationId, p_user_id = userId },
            commandType: System.Data.CommandType.StoredProcedure);
    }
}
