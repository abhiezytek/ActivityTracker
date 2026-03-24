using ActivityTrackerAPI.Models;
using Dapper;

namespace ActivityTrackerAPI.Services;

public interface IOpportunityService
{
    Task<Opportunity?> GetByIdAsync(uint id);
    Task<(IEnumerable<Opportunity> Data, int Total)> GetAllAsync(
        uint? leadId, string? stage, uint? agentId, int page, int limit);
    Task<IEnumerable<dynamic>> GetPipelineAsync(uint? agentId);
    Task<Opportunity?> CreateAsync(uint leadId, string stage, decimal premiumAmount, byte probability, string? notes);
    Task<Opportunity?> UpdateAsync(uint id, string? stage, decimal? premiumAmount, byte? probability, string? notes);
    Task DeleteAsync(uint id);
}

public class OpportunityService : IOpportunityService
{
    private readonly IDbConnectionFactory _dbFactory;

    public OpportunityService(IDbConnectionFactory dbFactory)
    {
        _dbFactory = dbFactory;
    }

    public async Task<Opportunity?> GetByIdAsync(uint id)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        return await conn.QueryFirstOrDefaultAsync<Opportunity>(
            "sp_GetOpportunityById",
            new { p_opportunity_id = id },
            commandType: System.Data.CommandType.StoredProcedure);
    }

    public async Task<(IEnumerable<Opportunity> Data, int Total)> GetAllAsync(
        uint? leadId, string? stage, uint? agentId, int page, int limit)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        var offset = (page - 1) * limit;

        using var multi = await conn.QueryMultipleAsync(
            "sp_GetAllOpportunities",
            new
            {
                p_lead_id = leadId,
                p_stage = stage,
                p_agent_id = agentId,
                p_limit = limit,
                p_offset = offset
            },
            commandType: System.Data.CommandType.StoredProcedure);

        var total = (await multi.ReadAsync<dynamic>()).First().total;
        var data = await multi.ReadAsync<Opportunity>();
        return (data, (int)total);
    }

    public async Task<IEnumerable<dynamic>> GetPipelineAsync(uint? agentId)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        return await conn.QueryAsync<dynamic>(
            "sp_GetOpportunityPipeline",
            new { p_agent_id = agentId },
            commandType: System.Data.CommandType.StoredProcedure);
    }

    public async Task<Opportunity?> CreateAsync(uint leadId, string stage, decimal premiumAmount, byte probability, string? notes)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        var result = await conn.QueryFirstOrDefaultAsync<dynamic>(
            "sp_CreateOpportunity",
            new
            {
                p_lead_id = leadId,
                p_stage = stage,
                p_premium_amount = premiumAmount,
                p_probability = probability,
                p_notes = notes
            },
            commandType: System.Data.CommandType.StoredProcedure);

        if (result == null) return null;
        return await GetByIdAsync((uint)result.insert_id);
    }

    public async Task<Opportunity?> UpdateAsync(uint id, string? stage, decimal? premiumAmount, byte? probability, string? notes)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        await conn.ExecuteAsync(
            "sp_UpdateOpportunity",
            new
            {
                p_opportunity_id = id,
                p_stage = stage,
                p_premium_amount = premiumAmount,
                p_probability = probability,
                p_notes = notes
            },
            commandType: System.Data.CommandType.StoredProcedure);

        return await GetByIdAsync(id);
    }

    public async Task DeleteAsync(uint id)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        await conn.ExecuteAsync(
            "sp_DeleteOpportunity",
            new { p_opportunity_id = id },
            commandType: System.Data.CommandType.StoredProcedure);
    }
}
