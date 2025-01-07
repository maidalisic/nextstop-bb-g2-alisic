using Dapper;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Data.SqlClient;
using WebAPI.Model;

namespace WebAPI.Data.DBModelConnections
{
    [ApiController]
    [Route("api/departures/")]
    public class ScheduleConnector : ControllerBase
    {
        private readonly string _connectionString;

        public ScheduleConnector(IConfiguration configuration, string db = "DefaultConnection")
        {
            _connectionString = configuration.GetConnectionString(db);
        }

        [HttpGet("connections")]
        public async Task<IActionResult> GetConnections(
            int startId,
            int stopId,
            DateTime date,
            TimeSpan time,
            bool isArrivalTime,
            int maxResults = 3)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                var isHolidayQuery = "SELECT COUNT(1) FROM HOLIDAY WHERE Date = @Date";
                bool isHoliday = await connection.ExecuteScalarAsync<bool>(isHolidayQuery, new { Date = date });

                var query = @"
        WITH DirectConnections AS (
            SELECT 
                s1.SCHEDULEDTIME AS DepartureTime,
                ISNULL(d.Delayinminutes, 0) AS DelayInMinutes,
                s2.SCHEDULEDTIME AS ArrivalTime
            FROM SCHEDULE s1
            LEFT JOIN DELAY d ON s1.Stopid = d.Stopid AND s1.Routeid = d.Routeid
            INNER JOIN SCHEDULE s2 ON s1.Routeid = s2.Routeid AND s2.Stopid = @StopId
            WHERE s1.Stopid = @StartId
              AND (@IsHoliday = 0 OR s1.Isholiday = 1)
              AND EXISTS (
                  SELECT 1 FROM ROUTE_STOP
                  WHERE Routeid = s1.Routeid AND Stopid = @StopId
              )
        )
        SELECT * FROM DirectConnections
        WHERE (@IsArrivalTime = 1 AND ArrivalTime >= @Time)
           OR (@IsArrivalTime = 0 AND DepartureTime >= @Time)
        ORDER BY CASE WHEN @IsArrivalTime = 1 THEN ArrivalTime ELSE DepartureTime END
        OFFSET 0 ROWS FETCH NEXT @MaxResults ROWS ONLY;";

                var connections = await connection.QueryAsync(query, new
                {
                    StartId = startId,
                    StopId = stopId,
                    Date = date,
                    Time = time,
                    IsHoliday = isHoliday,
                    IsArrivalTime = isArrivalTime,
                    MaxResults = maxResults
                });

                var result = connections.Select(c => new
                {
                    Departure = $"{((TimeSpan)c.DepartureTime):hh\\:mm} (+{c.DelayInMinutes} Min)",
                    Arrival = $"{((TimeSpan)c.ArrivalTime):hh\\:mm}"
                });

                return Ok(new { connections = result });
            }
        }

        [HttpGet("next-departures")]
        public async Task<IActionResult> GetNextDepartures(
    int stopId,
    DateTime date,
    TimeSpan time,
    int maxResults = 100)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                var isHolidayQuery = "SELECT COUNT(1) FROM HOLIDAY WHERE Date = @Date";
                bool isHoliday = await connection.ExecuteScalarAsync<bool>(isHolidayQuery, new { Date = date });

                var query = @"WITH LastCheckIn AS (
    SELECT 
        RouteId,
        StopId,
        MAX(CheckInTime) AS LastCheckInTime,
        MAX(Delayinminutes) AS LastDelayInMinutes
    FROM CheckIn
    GROUP BY RouteId, StopId
),
NextDepartures AS (
    SELECT 
        s.Scheduledtime AS DepartureTime,
        ISNULL(ci.LastDelayInMinutes, 0) AS DelayInMinutes,
        s.Routeid AS Route,
        (SELECT TOP 1 Stopid FROM ROUTE_STOP 
         WHERE Routeid = s.Routeid 
         ORDER BY Stoporder DESC) AS Destination,
        DATEDIFF(MINUTE, ci.LastCheckInTime, s.Scheduledtime) AS TimeOffset
    FROM SCHEDULE s
    LEFT JOIN LastCheckIn ci 
        ON s.RouteId = ci.RouteId AND s.StopId = ci.StopId
    WHERE s.Stopid = @StopId
      AND s.Scheduledtime >= @Time
      AND (@IsHoliday = 0 OR s.Isholiday = 1)
)
SELECT * FROM NextDepartures
ORDER BY DepartureTime
OFFSET 0 ROWS FETCH NEXT @MaxResults ROWS ONLY;
";

                var departures = await connection.QueryAsync(query, new
                {
                    StopId = stopId,
                    Date = date,
                    Time = time,
                    IsHoliday = isHoliday,
                    MaxResults = maxResults
                });

                var result = await Task.WhenAll(departures.Select(async d => new
                {
                    Departure = $"{d.DepartureTime.Add(TimeSpan.FromMinutes(d.DelayInMinutes)):hh\\:mm} (+{d.DelayInMinutes} Min)",
                    Route = d.Route,
                    Destination = await connection.ExecuteScalarAsync<string>(
                        "SELECT Name FROM STOP WHERE Id = @Destination", new { Destination = d.Destination })
                }));

                return Ok(new { departures = result });
            }
        }
    }
}
