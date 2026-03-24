using ActivityTrackerAPI.Models;
using Dapper;

namespace ActivityTrackerAPI.Services;

public interface IPolicyService
{
    Task<Policy?> GetByIdAsync(uint id);
    Task<(IEnumerable<Policy> Data, int Total)> GetAllAsync(
        uint? productTypeId, uint? agentId, string? dateFrom, string? dateTo,
        string? search, int page, int limit);
    Task<object> GetRenewalsAsync(uint? agentId);
    Task<Policy?> CreateAsync(string customerName, string policyNumber, uint? leadId,
        uint productTypeId, decimal premium, DateOnly startDate, DateOnly endDate, uint agentId);
    Task<Policy?> UpdateAsync(uint id, string? customerName, string? policyNumber, uint? leadId,
        uint? productTypeId, decimal? premium, DateOnly? startDate, DateOnly? endDate,
        uint? agentId, bool? renewalNotified30, bool? renewalNotified60, bool? renewalNotified90);
    Task DeleteAsync(uint id);
    Task MarkRenewalNotifiedAsync(uint policyId, byte days);
    Task<IEnumerable<RenewalPolicy>> GetRenewalPoliciesForNotificationsAsync(uint? agentId);
}

public class PolicyService : IPolicyService
{
    private readonly IDbConnectionFactory _dbFactory;

    public PolicyService(IDbConnectionFactory dbFactory)
    {
        _dbFactory = dbFactory;
    }

    public async Task<Policy?> GetByIdAsync(uint id)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        return await conn.QueryFirstOrDefaultAsync<Policy>(
            "sp_GetPolicyById",
            new { p_policy_id = id },
            commandType: System.Data.CommandType.StoredProcedure);
    }

    public async Task<(IEnumerable<Policy> Data, int Total)> GetAllAsync(
        uint? productTypeId, uint? agentId, string? dateFrom, string? dateTo,
        string? search, int page, int limit)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        var offset = (page - 1) * limit;

        using var multi = await conn.QueryMultipleAsync(
            "sp_GetAllPolicies",
            new
            {
                p_product_type_id = productTypeId,
                p_agent_id = agentId,
                p_date_from = dateFrom,
                p_date_to = dateTo,
                p_search = search,
                p_limit = limit,
                p_offset = offset
            },
            commandType: System.Data.CommandType.StoredProcedure);

        var total = (await multi.ReadAsync<dynamic>()).First().total;
        var data = await multi.ReadAsync<Policy>();
        return (data, (int)total);
    }

    public async Task<object> GetRenewalsAsync(uint? agentId)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        var rows = (await conn.QueryAsync<Policy>(
            "sp_GetPolicyRenewals",
            new { p_agent_id = agentId },
            commandType: System.Data.CommandType.StoredProcedure)).ToList();

        return new
        {
            due_in_30 = rows.Where(r => r.DaysToExpiry <= 30),
            due_in_60 = rows.Where(r => r.DaysToExpiry > 30 && r.DaysToExpiry <= 60),
            due_in_90 = rows.Where(r => r.DaysToExpiry > 60 && r.DaysToExpiry <= 90)
        };
    }

    public async Task<Policy?> CreateAsync(string customerName, string policyNumber, uint? leadId,
        uint productTypeId, decimal premium, DateOnly startDate, DateOnly endDate, uint agentId)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        var result = await conn.QueryFirstOrDefaultAsync<dynamic>(
            "sp_CreatePolicy",
            new
            {
                p_customer_name = customerName,
                p_policy_number = policyNumber,
                p_lead_id = leadId,
                p_product_type_id = productTypeId,
                p_premium = premium,
                p_start_date = startDate.ToDateTime(TimeOnly.MinValue),
                p_end_date = endDate.ToDateTime(TimeOnly.MinValue),
                p_agent_id = agentId
            },
            commandType: System.Data.CommandType.StoredProcedure);

        if (result == null) return null;
        return await GetByIdAsync((uint)result.insert_id);
    }

    public async Task<Policy?> UpdateAsync(uint id, string? customerName, string? policyNumber, uint? leadId,
        uint? productTypeId, decimal? premium, DateOnly? startDate, DateOnly? endDate,
        uint? agentId, bool? renewalNotified30, bool? renewalNotified60, bool? renewalNotified90)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        await conn.ExecuteAsync(
            "sp_UpdatePolicy",
            new
            {
                p_policy_id = id,
                p_customer_name = customerName,
                p_policy_number = policyNumber,
                p_lead_id = leadId,
                p_product_type_id = productTypeId,
                p_premium = premium,
                p_start_date = startDate.HasValue ? startDate.Value.ToDateTime(TimeOnly.MinValue) : (DateTime?)null,
                p_end_date = endDate.HasValue ? endDate.Value.ToDateTime(TimeOnly.MinValue) : (DateTime?)null,
                p_agent_id = agentId,
                p_renewal_notified_30 = renewalNotified30.HasValue ? (renewalNotified30.Value ? (byte?)1 : (byte?)0) : null,
                p_renewal_notified_60 = renewalNotified60.HasValue ? (renewalNotified60.Value ? (byte?)1 : (byte?)0) : null,
                p_renewal_notified_90 = renewalNotified90.HasValue ? (renewalNotified90.Value ? (byte?)1 : (byte?)0) : null
            },
            commandType: System.Data.CommandType.StoredProcedure);

        return await GetByIdAsync(id);
    }

    public async Task DeleteAsync(uint id)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        await conn.ExecuteAsync(
            "sp_DeletePolicy",
            new { p_policy_id = id },
            commandType: System.Data.CommandType.StoredProcedure);
    }

    public async Task MarkRenewalNotifiedAsync(uint policyId, byte days)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        await conn.ExecuteAsync(
            "sp_MarkRenewalNotified",
            new { p_policy_id = policyId, p_days = days },
            commandType: System.Data.CommandType.StoredProcedure);
    }

    public async Task<IEnumerable<RenewalPolicy>> GetRenewalPoliciesForNotificationsAsync(uint? agentId)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        // is_admin = 1 when agentId is null (Admin sees all)
        return await conn.QueryAsync<RenewalPolicy>(
            "sp_GetRenewalPolicies",
            new
            {
                p_is_admin = agentId.HasValue ? 0 : 1,
                p_user_id = agentId ?? 0u
            },
            commandType: System.Data.CommandType.StoredProcedure);
    }
}
