using Dapper;
using Microsoft.AspNetCore.Mvc;
using System.Data.SqlClient;
using WebAPI.Model;

namespace WebAPI.Data.DBModelConnections
{
    [ApiController]
    [Route("api/Statistics")]
    public class StatisticConnector : ControllerBase
    {
        private readonly string _connectionString;

        public StatisticConnector(IConfiguration configuration, string db = "DefaultConnection")
        {
            _connectionString = configuration.GetConnectionString(db);
        }

        [HttpGet]
        public async Task<IActionResult> GetDelayStatisticsAsync(DateTime? startDate, DateTime? endDate, int? routeId = null)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                var query = @"
        SELECT 
            r.ID AS RouteId, 
            r.ROUTENUMBER AS RouteNumber, 
            r.VALIDFROM AS ValidFrom, 
            r.VALIDTO AS ValidTo, 
            r.ISWEEKEND AS IsWeekend, 
            rs.STOPID AS StopId,
            CAST(s.SCHEDULEDTIME AS TIME) AS ScheduledTime, 
            CAST(c.CHECKINTIME AS TIME) AS CheckInTime
        FROM 
            ROUTE r
        INNER JOIN 
            ROUTE_STOP rs ON r.ID = rs.ROUTEID
        INNER JOIN 
            SCHEDULE s ON r.ID = s.ROUTEID AND rs.STOPID = s.STOPID
        LEFT JOIN 
            CHECKIN c ON r.ID = c.ROUTEID AND rs.STOPID = c.STOPID
        WHERE 
            (@StartDate IS NULL OR r.VALIDFROM >= @StartDate)
            AND (@EndDate IS NULL OR r.VALIDTO <= @EndDate)
            AND (@RouteId IS NULL OR r.ID = @RouteId)
        ORDER BY 
            r.ID, rs.STOPID;
        ";

                var parameters = new
                {
                    StartDate = startDate,
                    EndDate = endDate,
                    RouteId = routeId
                };

                var data = await connection.QueryAsync(query, parameters);

                var groupedData = data.GroupBy(d => new
                {
                    RouteId = d.RouteId,
                    RouteNumber = d.RouteNumber,
                    ValidFrom = d.ValidFrom,
                    ValidTo = d.ValidTo,
                    IsWeekend = d.IsWeekend
                });

                var result = groupedData.Select(routeGroup =>
                {
                    var delays = routeGroup.Select(stopData =>
                    {
                        var scheduledTimeOfDay = stopData.ScheduledTime ?? TimeSpan.Zero;
                        var checkInTimeOfDay = stopData.CheckInTime ?? TimeSpan.Zero;

                        var delayInMinutes = (checkInTimeOfDay - scheduledTimeOfDay).TotalMinutes;

                        return delayInMinutes > 0 ? delayInMinutes : 0.0;
                    }).ToList();

                    var totalStops = routeGroup.Count();

                    var statistics = new
                    {
                        AverageDelay = delays.Any() ? delays.OfType<double>().Average(x => x) : 0.0,
                        OnTime = delays.Count(d => d < 2),
                        SlightlyLate = delays.Count(d => d >= 2 && d < 5),
                        Late = delays.Count(d => d >= 5 && d < 10),
                        SignificantlyLate = delays.Count(d => d >= 10),
                        TotalStops = totalStops
                    };

                    return new
                    {
                        Route = new
                        {
                            Id = routeGroup.Key.RouteId,
                            RouteNumber = routeGroup.Key.RouteNumber,
                            ValidFrom = routeGroup.Key.ValidFrom,
                            ValidTo = routeGroup.Key.ValidTo,
                            IsWeekend = routeGroup.Key.IsWeekend
                        },
                        Statistics = new
                        {
                            AverageDelay = statistics.AverageDelay,
                            OnTimePercentage = totalStops > 0 ? (double)statistics.OnTime / totalStops * 100 : 0,
                            SlightlyLatePercentage = totalStops > 0 ? (double)statistics.SlightlyLate / totalStops * 100 : 0,
                            LatePercentage = totalStops > 0 ? (double)statistics.Late / totalStops * 100 : 0,
                            SignificantlyLatePercentage = totalStops > 0 ? (double)statistics.SignificantlyLate / totalStops * 100 : 0
                        }
                    };
                }).ToList();

                return Ok(result);
            }
        }

    }
}