using Dapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.Data.SqlClient;
using WebAPI.Data.DBModelConnections;
using WebAPI.Model;


public class HolidayTest
{
    public static string testDBConnectionString = "Server=localhost,1433;Database=testNextStop;User Id=sa;Password=@c0^JiGrg5Nj^YFu0B8wt0x7*evxzC^nyxOa;Encrypt=False;TrustServerCertificate=True;";

    private IServiceProvider _serviceProvider;

    [SetUp]
    public void SetupTestDB()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new[]
            {
                    new KeyValuePair<string, string>("ConnectionStrings:DefaultConnection", testDBConnectionString)
            })
            .Build();

        var serviceCollection = new ServiceCollection();

        serviceCollection.AddSingleton<IConfiguration>(configuration);
        serviceCollection.AddScoped<HolidayConnector>();

        _serviceProvider = serviceCollection.BuildServiceProvider();

        _holidayConnector = _serviceProvider.GetService<HolidayConnector>();
    }

    [TearDown]
    public void TearDownTestDB()
    {
        if (_serviceProvider != null)
        {
            if (_serviceProvider is IDisposable disposableServiceProvider)
            {
                disposableServiceProvider.Dispose();
            }
        }
    }

    private HolidayConnector _holidayConnector;

    [Test]
    public async Task CreateHolidayTest()
    {
        var holidayToCreate = new Holiday
        {
            Date = new DateTime(2024, 01, 01),
            Name = "Neujahrstag",
            Isschoolholiday = false
        };

        var result = await _holidayConnector.CreateHolidayAsync(holidayToCreate);

        Assert.IsInstanceOf<OkObjectResult>(result);
        var okResult = result as OkObjectResult;
        var createdHoliday = okResult?.Value as Holiday;

        Assert.IsNotNull(createdHoliday);
        Assert.AreEqual(holidayToCreate.Date, createdHoliday.Date);
        Assert.AreEqual(holidayToCreate.Name, createdHoliday.Name);
        Assert.AreEqual(holidayToCreate.Isschoolholiday, createdHoliday.Isschoolholiday);

        using (var connection = new SqlConnection(testDBConnectionString))
        {
            await connection.ExecuteAsync("DELETE FROM HOLIDAY WHERE Name = @Name", new { Name = holidayToCreate.Name });
        }
    }

    [Test]
    public async Task UpdateHolidayTest()
    {
        var holidayToCreate = new Holiday
        {
            Date = new DateTime(2024, 01, 01),
            Name = "Neujahrstag",
            Isschoolholiday = false
        };

        Holiday createdHoliday;
        using (var connection = new SqlConnection(testDBConnectionString))
        {
            var insertQuery = @"INSERT INTO HOLIDAY (Date, Name, Isschoolholiday) 
                            VALUES (@Date, @Name, @Isschoolholiday);
                            SELECT CAST(SCOPE_IDENTITY() as int);";

            var id = await connection.ExecuteScalarAsync<int>(insertQuery, new
            {
                holidayToCreate.Date,
                holidayToCreate.Name,
                holidayToCreate.Isschoolholiday
            });

            createdHoliday = await connection.QuerySingleOrDefaultAsync<Holiday>(
                "SELECT * FROM HOLIDAY WHERE Id = @Id",
                new { Id = id }
            );
        }

        var updatedHoliday = new Holiday
        {
            Date = new DateTime(2024, 12, 25),
            Name = "Weihnachtstag",
            Isschoolholiday = false
        };

        var result = await _holidayConnector.UpdateHolidayAsync(createdHoliday.Id, updatedHoliday);

        Assert.IsInstanceOf<NoContentResult>(result);

        using (var connection = new SqlConnection(testDBConnectionString))
        {
            var updatedHolidayInDb = await connection.QuerySingleOrDefaultAsync<Holiday>(
                "SELECT * FROM HOLIDAY WHERE Id = @Id",
                new { Id = createdHoliday.Id }
            );

            Assert.IsNotNull(updatedHolidayInDb);
            Assert.AreEqual(updatedHoliday.Date, updatedHolidayInDb.Date);
            Assert.AreEqual(updatedHoliday.Name, updatedHolidayInDb.Name);
            Assert.AreEqual(updatedHoliday.Isschoolholiday, updatedHolidayInDb.Isschoolholiday);
        }

        using (var connection = new SqlConnection(testDBConnectionString))
        {
            await connection.ExecuteAsync("DELETE FROM HOLIDAY WHERE Id = @Id", new { Id = createdHoliday.Id });
        }
    }


}
