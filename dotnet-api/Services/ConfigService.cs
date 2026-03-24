using ActivityTrackerAPI.Models;
using Dapper;
using System.Text.Json;

namespace ActivityTrackerAPI.Services;

public interface IConfigService
{
    // Roles
    Task<IEnumerable<Role>> GetRolesAsync();
    Task<Role?> GetRoleByIdAsync(uint id);
    Task<Role?> CreateRoleAsync(string name, string permissions);
    Task UpdateRoleAsync(uint id, string? name, string? permissions);
    Task<(bool CanDelete, Role?)> DeleteRoleAsync(uint id);

    // Product Types
    Task<IEnumerable<ProductType>> GetProductTypesAsync();
    Task<ProductType?> GetProductTypeByIdAsync(uint id);
    Task<ProductType?> CreateProductTypeAsync(string name, string? description);
    Task<ProductType?> UpdateProductTypeAsync(uint id, string? name, string? description, bool? isActive);
    Task DeactivateProductTypeAsync(uint id);

    // Lead Sub-Statuses
    Task<IEnumerable<LeadSubStatus>> GetLeadSubStatusesAsync(string? leadStatus);
    Task<LeadSubStatus?> GetLeadSubStatusByIdAsync(uint id);
    Task<LeadSubStatus?> CreateLeadSubStatusAsync(string leadStatus, string subStatusName);
    Task<LeadSubStatus?> UpdateLeadSubStatusAsync(uint id, string? leadStatus, string? subStatusName, bool? isActive);
    Task DeactivateLeadSubStatusAsync(uint id);
}

public class ConfigService : IConfigService
{
    private readonly IDbConnectionFactory _dbFactory;

    public ConfigService(IDbConnectionFactory dbFactory)
    {
        _dbFactory = dbFactory;
    }

    // ── Roles ──────────────────────────────────────────────────────────────────

    public async Task<IEnumerable<Role>> GetRolesAsync()
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        var roles = await conn.QueryAsync<Role>(
            "sp_GetRoles",
            commandType: System.Data.CommandType.StoredProcedure);
        return roles;
    }

    public async Task<Role?> GetRoleByIdAsync(uint id)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        return await conn.QueryFirstOrDefaultAsync<Role>(
            "sp_GetRoleById",
            new { p_role_id = id },
            commandType: System.Data.CommandType.StoredProcedure);
    }

    public async Task<Role?> CreateRoleAsync(string name, string permissions)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        var result = await conn.QueryFirstOrDefaultAsync<dynamic>(
            "sp_CreateRole",
            new { p_name = name, p_permissions = permissions },
            commandType: System.Data.CommandType.StoredProcedure);

        if (result == null) return null;
        return await GetRoleByIdAsync((uint)result.insert_id);
    }

    public async Task UpdateRoleAsync(uint id, string? name, string? permissions)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        await conn.ExecuteAsync(
            "sp_UpdateRole",
            new { p_role_id = id, p_name = name, p_permissions = permissions },
            commandType: System.Data.CommandType.StoredProcedure);
    }

    public async Task<(bool CanDelete, Role?)> DeleteRoleAsync(uint id)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        using var multi = await conn.QueryMultipleAsync(
            "sp_DeleteRole",
            new { p_role_id = id },
            commandType: System.Data.CommandType.StoredProcedure);

        var countResult = await multi.ReadFirstAsync<dynamic>();
        long userCount = countResult.user_count;
        if (userCount > 0)
            return (false, null);

        return (true, null);
    }

    // ── Product Types ──────────────────────────────────────────────────────────

    public async Task<IEnumerable<ProductType>> GetProductTypesAsync()
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        return await conn.QueryAsync<ProductType>(
            "sp_GetProductTypes",
            commandType: System.Data.CommandType.StoredProcedure);
    }

    public async Task<ProductType?> GetProductTypeByIdAsync(uint id)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        return await conn.QueryFirstOrDefaultAsync<ProductType>(
            "sp_GetProductTypeById",
            new { p_product_type_id = id },
            commandType: System.Data.CommandType.StoredProcedure);
    }

    public async Task<ProductType?> CreateProductTypeAsync(string name, string? description)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        var result = await conn.QueryFirstOrDefaultAsync<dynamic>(
            "sp_CreateProductType",
            new { p_name = name, p_description = description },
            commandType: System.Data.CommandType.StoredProcedure);

        if (result == null) return null;
        return await GetProductTypeByIdAsync((uint)result.insert_id);
    }

    public async Task<ProductType?> UpdateProductTypeAsync(uint id, string? name, string? description, bool? isActive)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        await conn.ExecuteAsync(
            "sp_UpdateProductType",
            new
            {
                p_product_type_id = id,
                p_name = name,
                p_description = description,
                p_is_active = isActive.HasValue ? (isActive.Value ? (byte?)1 : (byte?)0) : null
            },
            commandType: System.Data.CommandType.StoredProcedure);

        return await GetProductTypeByIdAsync(id);
    }

    public async Task DeactivateProductTypeAsync(uint id)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        await conn.ExecuteAsync(
            "sp_DeactivateProductType",
            new { p_product_type_id = id },
            commandType: System.Data.CommandType.StoredProcedure);
    }

    // ── Lead Sub-Statuses ──────────────────────────────────────────────────────

    public async Task<IEnumerable<LeadSubStatus>> GetLeadSubStatusesAsync(string? leadStatus)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        return await conn.QueryAsync<LeadSubStatus>(
            "sp_GetLeadSubStatuses",
            new { p_lead_status = leadStatus },
            commandType: System.Data.CommandType.StoredProcedure);
    }

    public async Task<LeadSubStatus?> GetLeadSubStatusByIdAsync(uint id)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        return await conn.QueryFirstOrDefaultAsync<LeadSubStatus>(
            "sp_GetLeadSubStatusById",
            new { p_id = id },
            commandType: System.Data.CommandType.StoredProcedure);
    }

    public async Task<LeadSubStatus?> CreateLeadSubStatusAsync(string leadStatus, string subStatusName)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        var result = await conn.QueryFirstOrDefaultAsync<dynamic>(
            "sp_CreateLeadSubStatus",
            new { p_lead_status = leadStatus, p_sub_status_name = subStatusName },
            commandType: System.Data.CommandType.StoredProcedure);

        if (result == null) return null;
        return await GetLeadSubStatusByIdAsync((uint)result.insert_id);
    }

    public async Task<LeadSubStatus?> UpdateLeadSubStatusAsync(uint id, string? leadStatus, string? subStatusName, bool? isActive)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        await conn.ExecuteAsync(
            "sp_UpdateLeadSubStatus",
            new
            {
                p_id = id,
                p_lead_status = leadStatus,
                p_sub_status_name = subStatusName,
                p_is_active = isActive.HasValue ? (isActive.Value ? (byte?)1 : (byte?)0) : null
            },
            commandType: System.Data.CommandType.StoredProcedure);

        return await GetLeadSubStatusByIdAsync(id);
    }

    public async Task DeactivateLeadSubStatusAsync(uint id)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        await conn.ExecuteAsync(
            "sp_DeactivateLeadSubStatus",
            new { p_id = id },
            commandType: System.Data.CommandType.StoredProcedure);
    }
}
