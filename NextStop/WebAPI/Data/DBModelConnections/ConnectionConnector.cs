using System.Data;
using System.Data.SqlClient;
using Dapper;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Data.DBModelConnections
{
    [ApiController]
    [Route("api/connections")]
    public class ConnectionConnector : ControllerBase
    {
        private readonly IDbConnection _db;

        public ConnectionConnector(IConfiguration configuration, string db = "DefaultConnection")
        {
            var connectionString = configuration.GetConnectionString(db);
            _db = new SqlConnection(connectionString);
        }

        [HttpGet("direct")]
        public async Task<IActionResult> GetDirectConnectionsAsync(
            [FromQuery] int from,
            [FromQuery] int to,
            [FromQuery] DateTime date,
            [FromQuery] TimeSpan time,
            [FromQuery] bool isArrivalTime = false,
            [FromQuery] int maxResults = 5)
        {
            try
            {
                var sql = @"
                    SELECT TOP(@MaxResults)
                        r.Id                AS RouteId,
                        s1.StopId           AS FromStop,
                        s2.StopId           AS ToStop,
                        s1.ScheduledTime    AS DepartureTime,
                        s2.ScheduledTime    AS ArrivalTime
                    FROM SCHEDULE s1
                    JOIN SCHEDULE s2
                        ON s1.RouteId = s2.RouteId
                       AND s1.StopId  = @FromStop
                       AND s2.StopId  = @ToStop
                       AND s1.ScheduledTime <= s2.ScheduledTime
                    JOIN ROUTE r
                        ON s1.RouteId = r.Id
                    WHERE
                        @Date BETWEEN r.ValidFrom AND r.ValidTo
                        AND (
                            (@IsArrivalTime = 0 AND s1.ScheduledTime >= @Time)
                            OR
                            (@IsArrivalTime = 1 AND s2.ScheduledTime <= @Time)
                        )
                    ORDER BY s1.ScheduledTime;
                ";

                var param = new
                {
                    FromStop = from,
                    ToStop = to,
                    Date = date,
                    Time = time,
                    IsArrivalTime = isArrivalTime ? 1 : 0,
                    MaxResults = maxResults
                };

                var rows = await _db.QueryAsync<DirectConnectionRow>(sql, param);

                if (!rows.Any())
                {
                    return NotFound(new
                    {
                        Message = "No direct connections found",
                        From = from,
                        To = to,
                        Date = date,
                        Time = time,
                        IsArrivalTime = isArrivalTime,
                        MaxResults = maxResults
                    });
                }

                return Ok(new { Connections = rows });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Message = "Error retrieving direct connections",
                    Error = ex.Message
                });
            }
        }

        [HttpGet("complex")]
        public async Task<IActionResult> GetConnectionsUpToOneTransferAsync(
            [FromQuery] int from,
            [FromQuery] int to,
            [FromQuery] DateTime date,
            [FromQuery] TimeSpan time,
            [FromQuery] bool isArrivalTime = false,
            [FromQuery] int maxResults = 5)
        {
            try
            {
                var sqlStartU = @"
                    SELECT 
                        s1.RouteId AS RouteIdA,
                        s1.StopId  AS FromStop,
                        s2.StopId  AS MidStop,
                        s1.ScheduledTime AS DepA,
                        s2.ScheduledTime AS ArrA
                    FROM SCHEDULE s1
                    JOIN SCHEDULE s2
                        ON s1.RouteId = s2.RouteId
                       AND s1.StopId = @FromStop
                       AND s2.StopId <> @FromStop
                       AND s1.ScheduledTime <= s2.ScheduledTime
                    JOIN ROUTE r
                        ON s1.RouteId = r.Id
                    WHERE @Date BETWEEN r.ValidFrom AND r.ValidTo
                      AND (
                        (@IsArrivalTime=0 AND s1.ScheduledTime >= @Time)
                        OR
                        (@IsArrivalTime=1 AND s2.ScheduledTime <= @Time)
                      )
                ";

                var sqlUToEnd = @"
                    SELECT
                        s1.RouteId AS RouteIdB,
                        s1.StopId  AS MidStop,
                        s2.StopId  AS ToStop,
                        s1.ScheduledTime AS DepB,
                        s2.ScheduledTime AS ArrB
                    FROM SCHEDULE s1
                    JOIN SCHEDULE s2
                        ON s1.RouteId = s2.RouteId
                       AND s1.StopId <> @ToStop
                       AND s2.StopId = @ToStop
                       AND s1.ScheduledTime <= s2.ScheduledTime
                    JOIN ROUTE r
                        ON s1.RouteId = r.Id
                    WHERE @Date BETWEEN r.ValidFrom AND r.ValidTo
                ";

                var param = new
                {
                    FromStop = from,
                    ToStop = to,
                    Date = date,
                    Time = time,
                    IsArrivalTime = isArrivalTime ? 1 : 0
                };

                var startUrows = await _db.QueryAsync<StartUMidRow>(sqlStartU, param);
                var uToEndrows = await _db.QueryAsync<MidEndRow>(sqlUToEnd, param);

                var groupedUtoEnd = uToEndrows
                    .GroupBy(x => x.MidStop)
                    .ToDictionary(g => g.Key, g => g.ToList());

                var resultList = new List<ComplexConnectionResult>();

                foreach (var sU in startUrows)
                {
                    if (!groupedUtoEnd.TryGetValue(sU.MidStop, out var possibleNextRoutes))
                        continue;

                    var matchingNext = possibleNextRoutes
                        .Where(n => n.DepB >= sU.ArrA)
                        .ToList();

                    foreach (var next in matchingNext)
                    {
                        var combined = new ComplexConnectionResult
                        {
                            RouteIdA = sU.RouteIdA,
                            RouteIdB = next.RouteIdB,
                            FromStop = sU.FromStop,
                            MidStop = sU.MidStop,
                            ToStop = next.ToStop,
                            DepA = sU.DepA,
                            ArrA = sU.ArrA,
                            DepB = next.DepB,
                            ArrB = next.ArrB
                        };
                        resultList.Add(combined);
                    }
                }

                var finalSorted = resultList
                    .OrderBy(x => x.DepA)
                    .ThenBy(x => x.ArrB)
                    .Take(maxResults)
                    .ToList();

                if (!finalSorted.Any())
                {
                    return NotFound(new
                    {
                        Message = "No 1-transfer connections found.",
                        From = from,
                        To = to,
                        Date = date,
                        Time = time,
                        IsArrivalTime = isArrivalTime,
                        MaxResults = maxResults
                    });
                }

                return Ok(new { Connections = finalSorted });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Message = "Error retrieving 1-transfer connections",
                    Error = ex.Message
                });
            }
        }
    }

    public class DirectConnectionRow
    {
        public int RouteId { get; set; }
        public int FromStop { get; set; }
        public int ToStop { get; set; }
        public TimeSpan DepartureTime { get; set; }
        public TimeSpan ArrivalTime { get; set; }
    }

    public class StartUMidRow
    {
        public int RouteIdA { get; set; }
        public int FromStop { get; set; }
        public int MidStop { get; set; }
        public TimeSpan DepA { get; set; }
        public TimeSpan ArrA { get; set; }
    }

    public class MidEndRow
    {
        public int RouteIdB { get; set; }
        public int MidStop { get; set; }
        public int ToStop { get; set; }
        public TimeSpan DepB { get; set; }
        public TimeSpan ArrB { get; set; }
    }

    public class ComplexConnectionResult
    {
        public int RouteIdA { get; set; }
        public int RouteIdB { get; set; }
        public int FromStop { get; set; }
        public int MidStop { get; set; }
        public int ToStop { get; set; }
        public TimeSpan DepA { get; set; }
        public TimeSpan ArrA { get; set; }
        public TimeSpan DepB { get; set; }
        public TimeSpan ArrB { get; set; }
    }
}
