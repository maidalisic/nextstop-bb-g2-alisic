using Dapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using NUnit.Framework;
using System.Data.SqlClient;
using WebAPI.Data.DBModelConnections;

namespace Tests
{
    public class ConnectionConnectorTest
    {
        public static string testDBConnectionString = "Server=localhost,1433;Database=testNextStop;User Id=sa;Password=@c0^JiGrg5Nj^YFu0B8wt0x7*evxzC^nyxOa;Encrypt=False;TrustServerCertificate=True;";

        private IServiceProvider _serviceProvider;
        private ConnectionConnector _connectionConnector;

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
            serviceCollection.AddScoped<ConnectionConnector>();

            _serviceProvider = serviceCollection.BuildServiceProvider();

            _connectionConnector = _serviceProvider.GetService<ConnectionConnector>();
            InsertTestData();
        }

        [TearDown]
        public void TearDownTestDB()
        {
            DestroyTestData();
            if (_serviceProvider is IDisposable disposable)
            {
                disposable.Dispose();
            }
        }

        private void InsertTestData()
        {
            DestroyTestData();
            using (var connection = new SqlConnection(testDBConnectionString))
            {
                var stopIds = connection.Query<int>(@"
                    INSERT INTO STOP (NAME, SHORTCODE, LATITUDE, LONGITUDE) 
                    VALUES 
                        ('Stop 1', 'S1', 40.712776, -74.005974), 
                        ('Stop 2', 'S2', 34.052235, -118.243683); 
                    SELECT ID FROM STOP
                ").ToList();

                var routeId = connection.ExecuteScalar<int>(@"
                    INSERT INTO ROUTE (Validfrom, Validto) 
                    VALUES ('2023-01-01', '2024-12-31'); 
                    SELECT CAST(SCOPE_IDENTITY() AS INT);
                ");

                connection.Execute(@"
                    INSERT INTO SCHEDULE (Routeid, Stopid, Scheduledtime) 
                    VALUES 
                        (@RouteId, @StopId1, '2024-12-22 08:00:00'), 
                        (@RouteId, @StopId2, '2024-12-22 09:00:00')
                ", new
                {
                    RouteId = routeId,
                    StopId1 = stopIds[0],
                    StopId2 = stopIds[1]
                });
            }
        }

        private void DestroyTestData()
        {
            using var connection = new SqlConnection(testDBConnectionString);
            connection.Execute("DELETE FROM SCHEDULE");
            connection.Execute("DELETE FROM STOP");
            connection.Execute("DELETE FROM ROUTE");
        }

        [Test]
        public async Task GetDirectConnections_Test()
        {
            int[] stopIds;
            using (var connection = new SqlConnection(testDBConnectionString))
            {
                stopIds = connection.Query<int>("SELECT ID FROM STOP").ToArray();
            }
            if (stopIds.Length < 2)
            {
                Assert.Fail("Not enough stops found in the database.");
            }

            int fromStop = stopIds[0];
            int toStop   = stopIds[1];
            DateTime date         = new DateTime(2024, 12, 22);
            TimeSpan time         = new TimeSpan(8, 0, 0);
            bool isArrivalTime    = false;
            int maxResults        = 3;

            IActionResult result = await _connectionConnector
                .GetDirectConnectionsAsync(fromStop, toStop, date, time, isArrivalTime, maxResults);

            Assert.IsInstanceOf<OkObjectResult>(result, "Expected OkObjectResult, but got something else.");

            var okResult = result as OkObjectResult;
            Assert.IsNotNull(okResult?.Value, "OkObjectResult.Value should not be null.");

            var responseObject = okResult.Value;

            var connectionList = (IEnumerable<object>)
                responseObject.GetType().GetProperties().First().GetValue(responseObject)!;

            Assert.IsNotNull(connectionList, "Connections property should not be null.");

            string resultJson = JsonConvert.SerializeObject(connectionList);

            Assert.IsTrue(resultJson.Contains("\"FromStop\":" + fromStop), "Missing 'FromStop' in JSON.");
            Assert.IsTrue(resultJson.Contains("\"ToStop\":" + toStop),     "Missing 'ToStop' in JSON.");
        }
    }
}
