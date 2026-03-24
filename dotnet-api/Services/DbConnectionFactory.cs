using MySqlConnector;

namespace ActivityTrackerAPI.Services;

public interface IDbConnectionFactory
{
    MySqlConnection CreateConnection();
}

public class DbConnectionFactory : IDbConnectionFactory
{
    private readonly string _connectionString;

    public DbConnectionFactory(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection string is not configured.");
    }

    public MySqlConnection CreateConnection() => new MySqlConnection(_connectionString);
}
