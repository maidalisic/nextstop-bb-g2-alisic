using Dapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using System.Data.SqlClient;
using WebAPI.Data.DBModelConnections;

namespace Tests
{
    public class ConnectionConnectorTest
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
            serviceCollection.AddScoped<ConnectionConnector>();

            _serviceProvider = serviceCollection.BuildServiceProvider();

            _connectionConnector = _serviceProvider.GetService<ConnectionConnector>();
            InsertTestData();
        }

        [TearDown]
        public void TearDownTestDB()
        {
            DestroyTestData();
            if (_serviceProvider != null)
            {
                if (_serviceProvider is IDisposable disposableServiceProvider)
                {
                    disposableServiceProvider.Dispose();
                }
            }
        }

        private void DestroyTestData()
        {
            using (var connection = new SqlConnection(testDBConnectionString))
            {
                connection.Execute("DELETE FROM SCHEDULE");

                connection.Execute("DELETE FROM STOP");

                connection.Execute("DELETE FROM ROUTE");
            }
        }

        private void InsertTestData()
        {
            DestroyTestData();
            using (var connection = new SqlConnection(testDBConnectionString))
            {
                var stopIds = connection.Query<int>(@"INSERT INTO STOP (NAME, SHORTCODE, LATITUDE, LONGITUDE) 
                                                VALUES 
                                                ('Stop 1', 'S1', 40.712776, -74.005974), 
                                                ('Stop 2', 'S2', 34.052235, -118.243683); 
                                                SELECT ID FROM STOP").ToList();

                var routeId = connection.ExecuteScalar<int>("INSERT INTO ROUTE (Validfrom, Validto) VALUES ('2023-01-01', '2024-12-31'); SELECT CAST(SCOPE_IDENTITY() AS INT);");

                connection.Execute(@"INSERT INTO SCHEDULE (Routeid, Stopid, Scheduledtime) 
                             VALUES (@RouteId, @StopId1, '2024-12-22 08:00:00'), 
                                    (@RouteId, @StopId2, '2024-12-22 09:00:00')",
                                            new { RouteId = routeId, StopId1 = stopIds[0], StopId2 = stopIds[1] });
            }
        }



        private ConnectionConnector _connectionConnector;

        [Test]
        public async Task GetConnectionsTest()
        {
            int[] stopIds;
            using (var connection = new SqlConnection(testDBConnectionString))
            {
                stopIds = connection.Query<int>("SELECT ID FROM STOP").ToArray();
            }

            if (stopIds.Length < 2)
            {
                throw new InvalidOperationException("Not enough stops found in the database.");
            }

            var fromStop = stopIds[0];
            var toStop = stopIds[1];
            var date = new DateTime(2024, 12, 22);
            var time = new TimeSpan(8, 0, 0);
            var isArrivalTime = false;
            var maxResults = 3;

            var result = await _connectionConnector.GetConnections(fromStop, toStop, date, time, isArrivalTime, maxResults);

            Assert.IsInstanceOf<OkObjectResult>(result);
            var okResult = result as OkObjectResult;
            object connections = okResult?.Value;

            Assert.IsNotNull(connections, "Connections should not be null.");

            var connectionList = (IEnumerable<object>)connections.GetType().GetProperties().First().GetValue(connections);

            string result2 = JsonConvert.SerializeObject(connectionList);

            Assert.IsTrue(result2.Contains("\"FromStop\":" + fromStop));
            Assert.IsTrue(result2.Contains("\"ToStop\":" + toStop));
        }
    }

}
