using ActivityTrackerAPI.Models;
using Dapper;
using System.Text.Json;

namespace ActivityTrackerAPI.Services;

public interface IUserService
{
    Task<User?> GetByIdAsync(uint id);
    Task<User?> GetByEmailAsync(string email);
    Task<(IEnumerable<User> Data, int Total)> GetAllAsync(
        uint? roleId, uint? branchId, bool? isActive, string? search, int page, int limit);
    Task<User?> CreateAsync(string name, string email, string password, uint roleId, uint? branchId, bool isActive);
    Task<User?> UpdateAsync(uint id, string? name, string? email, uint? roleId, uint? branchId, bool? isActive, string? password = null);
    Task<string?> GetPasswordAsync(uint userId);
    Task UpdatePasswordAsync(uint userId, string hashedPassword);
}

public class UserService : IUserService
{
    private readonly IDbConnectionFactory _dbFactory;

    public UserService(IDbConnectionFactory dbFactory)
    {
        _dbFactory = dbFactory;
    }

    public async Task<User?> GetByIdAsync(uint id)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        var result = await conn.QueryFirstOrDefaultAsync<User>(
            "sp_GetUserById",
            new { p_user_id = id },
            commandType: System.Data.CommandType.StoredProcedure);
        if (result != null && result.Permissions != null)
            result.Permissions = TryParsePermissions(result.Permissions);
        return result;
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        var result = await conn.QueryFirstOrDefaultAsync<User>(
            "sp_GetUserByEmail",
            new { p_email = email },
            commandType: System.Data.CommandType.StoredProcedure);
        if (result != null && result.Permissions != null)
            result.Permissions = TryParsePermissions(result.Permissions);
        return result;
    }

    public async Task<(IEnumerable<User> Data, int Total)> GetAllAsync(
        uint? roleId, uint? branchId, bool? isActive, string? search, int page, int limit)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        var offset = (page - 1) * limit;

        using var multi = await conn.QueryMultipleAsync(
            "sp_GetAllUsers",
            new
            {
                p_role_id = roleId,
                p_branch_id = branchId,
                p_is_active = isActive.HasValue ? (isActive.Value ? (byte)1 : (byte)0) : (byte?)null,
                p_search = search,
                p_limit = limit,
                p_offset = offset
            },
            commandType: System.Data.CommandType.StoredProcedure);

        var total = (await multi.ReadAsync<dynamic>()).First().total;
        var data = await multi.ReadAsync<User>();
        return (data, (int)total);
    }

    public async Task<User?> CreateAsync(string name, string email, string password, uint roleId, uint? branchId, bool isActive)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        var result = await conn.QueryFirstOrDefaultAsync<dynamic>(
            "sp_CreateUser",
            new
            {
                p_name = name,
                p_email = email,
                p_password = password,
                p_role_id = roleId,
                p_branch_id = branchId,
                p_is_active = isActive ? 1 : 0
            },
            commandType: System.Data.CommandType.StoredProcedure);

        if (result == null) return null;
        return await GetByIdAsync((uint)result.insert_id);
    }

    public async Task<User?> UpdateAsync(uint id, string? name, string? email, uint? roleId, uint? branchId, bool? isActive, string? password = null)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        await conn.ExecuteAsync(
            "sp_UpdateUser",
            new
            {
                p_user_id = id,
                p_name = name,
                p_email = email,
                p_role_id = roleId,
                p_branch_id = branchId,
                p_is_active = isActive.HasValue ? (isActive.Value ? (byte?)1 : (byte?)0) : null,
                p_password = password
            },
            commandType: System.Data.CommandType.StoredProcedure);

        return await GetByIdAsync(id);
    }

    public async Task<string?> GetPasswordAsync(uint userId)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        var result = await conn.QueryFirstOrDefaultAsync<dynamic>(
            "sp_GetUserPasswordById",
            new { p_user_id = userId },
            commandType: System.Data.CommandType.StoredProcedure);
        return result?.password;
    }

    public async Task UpdatePasswordAsync(uint userId, string hashedPassword)
    {
        using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync();
        await conn.ExecuteAsync(
            "sp_UpdateUserPassword",
            new { p_user_id = userId, p_password = hashedPassword },
            commandType: System.Data.CommandType.StoredProcedure);
    }

    private static string TryParsePermissions(string permissions)
    {
        try { JsonDocument.Parse(permissions); return permissions; }
        catch { return "{}"; }
    }
}
