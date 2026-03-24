using ActivityTrackerAPI.Models;
using Dapper;

namespace ActivityTrackerAPI.Services;

public interface ILeadService
{
    Task<Lead?> GetByIdAsync(uint id);
    Task<Lead?> GetWithActivitiesAsync(uint id);
    Task<(IEnumerable<Lead> Data, int Total)> GetAllAsync(
        string? status, uint? productTypeId, uint? assignedTo, string? source,
        uint? createdBy, uint? branchId, string? dateFrom, string? dateTo,
        string? search, int page, int limit);
    Task<Lead?> CreateAsync(string customerName, string phone, string? email,
        uint? productTypeId, string source, string status, string? subStatus,
        uint? assignedTo, uint? createdBy);
    Task<Lead?> UpdateAsync(uint id, string? customerName, string? phone, string? email,
        uint? productTypeId, string? source, string? status, string? subStatus, uint? assignedTo);
    Task SoftDeleteAsync(uint id);
    Task AssignAsync(uint id, uint assignedTo);
}

public class LeadService : ILeadService
{
    private readonly IDbConnectionFactory _dbFactory;

    public LeadService(IDbConnectionFactory dbFactory)
    {
        _dbFactory = dbFactory;
    }

    public async Task<Lead?> GetByIdAsync(uint id)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        return await conn.QueryFirstOrDefaultAsync<Lead>(
            "sp_GetLeadById",
            new { p_lead_id = id },
            commandType: System.Data.CommandType.StoredProcedure);
    }

    public async Task<Lead?> GetWithActivitiesAsync(uint id)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        using var multi = await conn.QueryMultipleAsync(
            "sp_GetLeadWithActivities",
            new { p_lead_id = id },
            commandType: System.Data.CommandType.StoredProcedure);

        var lead = await multi.ReadFirstOrDefaultAsync<Lead>();
        if (lead == null) return null;

        var activities = await multi.ReadAsync<Activity>();
        lead.Activities = activities.ToList();
        return lead;
    }

    public async Task<(IEnumerable<Lead> Data, int Total)> GetAllAsync(
        string? status, uint? productTypeId, uint? assignedTo, string? source,
        uint? createdBy, uint? branchId, string? dateFrom, string? dateTo,
        string? search, int page, int limit)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        var offset = (page - 1) * limit;

        using var multi = await conn.QueryMultipleAsync(
            "sp_GetAllLeads",
            new
            {
                p_status = status,
                p_product_type_id = productTypeId,
                p_assigned_to = assignedTo,
                p_source = source,
                p_created_by = createdBy,
                p_branch_id = branchId,
                p_date_from = dateFrom,
                p_date_to = dateTo,
                p_search = search,
                p_limit = limit,
                p_offset = offset
            },
            commandType: System.Data.CommandType.StoredProcedure);

        var total = (await multi.ReadAsync<dynamic>()).First().total;
        var data = await multi.ReadAsync<Lead>();
        return (data, (int)total);
    }

    public async Task<Lead?> CreateAsync(string customerName, string phone, string? email,
        uint? productTypeId, string source, string status, string? subStatus,
        uint? assignedTo, uint? createdBy)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        var result = await conn.QueryFirstOrDefaultAsync<dynamic>(
            "sp_CreateLead",
            new
            {
                p_customer_name = customerName,
                p_phone = phone,
                p_email = email,
                p_product_type_id = productTypeId,
                p_source = source,
                p_status = status,
                p_sub_status = subStatus,
                p_assigned_to = assignedTo,
                p_created_by = createdBy
            },
            commandType: System.Data.CommandType.StoredProcedure);

        if (result == null) return null;
        return await GetByIdAsync((uint)result.insert_id);
    }

    public async Task<Lead?> UpdateAsync(uint id, string? customerName, string? phone, string? email,
        uint? productTypeId, string? source, string? status, string? subStatus, uint? assignedTo)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        await conn.ExecuteAsync(
            "sp_UpdateLead",
            new
            {
                p_lead_id = id,
                p_customer_name = customerName,
                p_phone = phone,
                p_email = email,
                p_product_type_id = productTypeId,
                p_source = source,
                p_status = status,
                p_sub_status = subStatus,
                p_assigned_to = assignedTo
            },
            commandType: System.Data.CommandType.StoredProcedure);

        return await GetByIdAsync(id);
    }

    public async Task SoftDeleteAsync(uint id)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        await conn.ExecuteAsync(
            "sp_SoftDeleteLead",
            new { p_lead_id = id },
            commandType: System.Data.CommandType.StoredProcedure);
    }

    public async Task AssignAsync(uint id, uint assignedTo)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        await conn.ExecuteAsync(
            "sp_AssignLead",
            new { p_lead_id = id, p_assigned_to = assignedTo },
            commandType: System.Data.CommandType.StoredProcedure);
    }
}
