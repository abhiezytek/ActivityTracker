using Dapper;

namespace ActivityTrackerAPI.Services;

public interface IDashboardService
{
    Task<object> GetKpisAsync(uint userId, string roleName, uint? branchId, string dateFrom, string dateTo);
    Task<IEnumerable<dynamic>> GetPipelineAsync(uint userId, string roleName, uint? branchId);
    Task<IEnumerable<dynamic>> GetPerformanceAsync(string currentRoleName, uint? currentBranchId,
        uint? filterAgentId, uint? filterBranchId, string dateFrom, string dateTo);
    Task<object> GetActivitiesSummaryAsync(uint userId, string roleName, uint? branchId, string dateFrom, string dateTo);
}

public class DashboardService : IDashboardService
{
    private readonly IDbConnectionFactory _dbFactory;

    public DashboardService(IDbConnectionFactory dbFactory)
    {
        _dbFactory = dbFactory;
    }

    public async Task<object> GetKpisAsync(uint userId, string roleName, uint? branchId, string dateFrom, string dateTo)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        using var multi = await conn.QueryMultipleAsync(
            "sp_GetDashboardKPIs",
            new
            {
                p_user_id = userId,
                p_role_name = roleName,
                p_branch_id = branchId,
                p_date_from = dateFrom,
                p_date_to = dateTo
            },
            commandType: System.Data.CommandType.StoredProcedure);

        var totalLeads = (await multi.ReadFirstAsync<dynamic>()).total_leads;
        var newLeads = (await multi.ReadFirstAsync<dynamic>()).new_leads;
        var closedLeads = (await multi.ReadFirstAsync<dynamic>()).closed_leads;
        var calls = (await multi.ReadFirstAsync<dynamic>()).calls;
        var meetings = (await multi.ReadFirstAsync<dynamic>()).meetings;
        var premiumGenerated = (await multi.ReadFirstAsync<dynamic>()).premium_generated;
        var activitiesToday = (await multi.ReadFirstAsync<dynamic>()).activities_today;

        long tl = (long)totalLeads;
        long cl = (long)closedLeads;
        double conversionRatio = tl > 0 ? Math.Round((double)cl / tl * 100, 2) : 0.0;

        return new
        {
            total_leads = tl,
            new_leads = (long)newLeads,
            calls = (long)calls,
            meetings = (long)meetings,
            conversion_ratio = conversionRatio,
            premium_generated = (decimal)premiumGenerated,
            activities_today = (long)activitiesToday
        };
    }

    public async Task<IEnumerable<dynamic>> GetPipelineAsync(uint userId, string roleName, uint? branchId)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        return await conn.QueryAsync<dynamic>(
            "sp_GetDashboardPipeline",
            new
            {
                p_user_id = userId,
                p_role_name = roleName,
                p_branch_id = branchId
            },
            commandType: System.Data.CommandType.StoredProcedure);
    }

    public async Task<IEnumerable<dynamic>> GetPerformanceAsync(string currentRoleName, uint? currentBranchId,
        uint? filterAgentId, uint? filterBranchId, string dateFrom, string dateTo)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        return await conn.QueryAsync<dynamic>(
            "sp_GetAgentPerformance",
            new
            {
                p_current_role_name = currentRoleName,
                p_current_branch_id = currentBranchId,
                p_filter_agent_id = filterAgentId,
                p_filter_branch_id = filterBranchId,
                p_date_from = dateFrom,
                p_date_to = dateTo
            },
            commandType: System.Data.CommandType.StoredProcedure);
    }

    public async Task<object> GetActivitiesSummaryAsync(uint userId, string roleName, uint? branchId, string dateFrom, string dateTo)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        using var multi = await conn.QueryMultipleAsync(
            "sp_GetActivitiesSummary",
            new
            {
                p_user_id = userId,
                p_role_name = roleName,
                p_branch_id = branchId,
                p_date_from = dateFrom,
                p_date_to = dateTo
            },
            commandType: System.Data.CommandType.StoredProcedure);

        var summary = await multi.ReadFirstAsync<dynamic>();
        var byDay = await multi.ReadAsync<dynamic>();

        return new
        {
            calls = (long)(summary.calls ?? 0),
            meetings = (long)(summary.meetings ?? 0),
            follow_ups = (long)(summary.follow_ups ?? 0),
            by_day = byDay
        };
    }
}
