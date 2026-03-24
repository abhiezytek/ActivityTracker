using ActivityTrackerAPI.Models;
using Dapper;

namespace ActivityTrackerAPI.Services;

public interface IActivityService
{
    Task<Activity?> GetByIdAsync(uint id);
    Task<(IEnumerable<Activity> Data, int Total)> GetAllAsync(
        uint? leadId, uint? userId, string? activityType,
        string? dateFrom, string? dateTo, uint? branchId, int page, int limit);
    Task<IEnumerable<Activity>> GetUpcomingAsync(uint? userId, uint? branchId);
    Task<Activity?> CreateAsync(uint leadId, uint userId, string activityType,
        DateTime activityDate, uint? durationMinutes, string? outcome, string? notes,
        decimal? locationLat, decimal? locationLong, bool isScheduled, DateTime? reminderAt);
    Task<Activity?> UpdateAsync(uint id, string? activityType, DateTime? activityDate,
        uint? durationMinutes, string? outcome, string? notes,
        decimal? locationLat, decimal? locationLong, bool? isScheduled, DateTime? reminderAt);
    Task DeleteAsync(uint id);
}

public class ActivityService : IActivityService
{
    private readonly IDbConnectionFactory _dbFactory;

    public ActivityService(IDbConnectionFactory dbFactory)
    {
        _dbFactory = dbFactory;
    }

    public async Task<Activity?> GetByIdAsync(uint id)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        return await conn.QueryFirstOrDefaultAsync<Activity>(
            "sp_GetActivityById",
            new { p_activity_id = id },
            commandType: System.Data.CommandType.StoredProcedure);
    }

    public async Task<(IEnumerable<Activity> Data, int Total)> GetAllAsync(
        uint? leadId, uint? userId, string? activityType,
        string? dateFrom, string? dateTo, uint? branchId, int page, int limit)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        var offset = (page - 1) * limit;

        using var multi = await conn.QueryMultipleAsync(
            "sp_GetAllActivities",
            new
            {
                p_lead_id = leadId,
                p_user_id = userId,
                p_activity_type = activityType,
                p_date_from = dateFrom,
                p_date_to = dateTo,
                p_branch_id = branchId,
                p_limit = limit,
                p_offset = offset
            },
            commandType: System.Data.CommandType.StoredProcedure);

        var total = (await multi.ReadAsync<dynamic>()).First().total;
        var data = await multi.ReadAsync<Activity>();
        return (data, (int)total);
    }

    public async Task<IEnumerable<Activity>> GetUpcomingAsync(uint? userId, uint? branchId)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        return await conn.QueryAsync<Activity>(
            "sp_GetUpcomingActivities",
            new { p_user_id = userId, p_branch_id = branchId },
            commandType: System.Data.CommandType.StoredProcedure);
    }

    public async Task<Activity?> CreateAsync(uint leadId, uint userId, string activityType,
        DateTime activityDate, uint? durationMinutes, string? outcome, string? notes,
        decimal? locationLat, decimal? locationLong, bool isScheduled, DateTime? reminderAt)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        var result = await conn.QueryFirstOrDefaultAsync<dynamic>(
            "sp_CreateActivity",
            new
            {
                p_lead_id = leadId,
                p_user_id = userId,
                p_activity_type = activityType,
                p_activity_date = activityDate,
                p_duration_minutes = durationMinutes,
                p_outcome = outcome,
                p_notes = notes,
                p_location_lat = locationLat,
                p_location_long = locationLong,
                p_is_scheduled = isScheduled ? 1 : 0,
                p_reminder_at = reminderAt
            },
            commandType: System.Data.CommandType.StoredProcedure);

        if (result == null) return null;
        return await GetByIdAsync((uint)result.insert_id);
    }

    public async Task<Activity?> UpdateAsync(uint id, string? activityType, DateTime? activityDate,
        uint? durationMinutes, string? outcome, string? notes,
        decimal? locationLat, decimal? locationLong, bool? isScheduled, DateTime? reminderAt)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        await conn.ExecuteAsync(
            "sp_UpdateActivity",
            new
            {
                p_activity_id = id,
                p_activity_type = activityType,
                p_activity_date = activityDate,
                p_duration_minutes = durationMinutes,
                p_outcome = outcome,
                p_notes = notes,
                p_location_lat = locationLat,
                p_location_long = locationLong,
                p_is_scheduled = isScheduled.HasValue ? (isScheduled.Value ? (byte?)1 : (byte?)0) : null,
                p_reminder_at = reminderAt
            },
            commandType: System.Data.CommandType.StoredProcedure);

        return await GetByIdAsync(id);
    }

    public async Task DeleteAsync(uint id)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        await conn.ExecuteAsync(
            "sp_DeleteActivity",
            new { p_activity_id = id },
            commandType: System.Data.CommandType.StoredProcedure);
    }
}
