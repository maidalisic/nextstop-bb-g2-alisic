using Dapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Data.SqlClient;

namespace WebAPI.Data.DBModelConnections
{
    [Authorize]
    [ApiController]
    [Route("api/CHECKIN")]
    public class CheckInConnector : ControllerBase
    {
        private readonly string _connectionString;

        public CheckInConnector(IConfiguration configuration, string db = "DefaultConnection")
        {
            _connectionString = configuration.GetConnectionString(db);
        }

        public class CheckInData
        {
            public string? API_KEY { get; set; }
            public int RouteId { get; set; }
            public int StopId { get; set; }
            public DateTime DateTime { get; set; }
        }

        [HttpPost]
        public async Task<IActionResult> CreateCheckinAsync(CheckInData checkin)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                connection.Open();
                var apiKeyExists = await connection.ExecuteScalarAsync<bool>(
                    "SELECT COUNT(1) FROM API_KEY WHERE Keyvalue = @API_KEY",
                    new { API_KEY = checkin.API_KEY }
                );

                if (!apiKeyExists)
                {
                    return Unauthorized("Invalid API key.");
                }
                
                var scheduleExists = await connection.ExecuteScalarAsync<bool>(
                    "SELECT COUNT(1) FROM SCHEDULE WHERE Routeid = @RouteId AND Stopid = @StopId",
                    new { RouteId = checkin.RouteId, StopId = checkin.StopId }
                );

                if (!scheduleExists)
                {
                    return BadRequest("No scheduled Stop here.");
                }
                
                var isHoliday = await connection.ExecuteScalarAsync<bool>(
                    "SELECT COUNT(1) FROM HOLIDAY WHERE Date = @Date",
                    new { Date = checkin.DateTime.Date }
                );
                
                var scheduledTimes = await connection.QueryAsync<TimeSpan?>(
                    @"SELECT Scheduledtime FROM SCHEDULE 
                      WHERE Routeid = @RouteId 
                        AND Stopid = @StopId 
                        AND (@IsHoliday = 0 OR Isholiday = 1)",
                    new 
                    { 
                        RouteId = checkin.RouteId, 
                        StopId  = checkin.StopId, 
                        IsHoliday = isHoliday ? 1 : 0 
                    }
                );

                if (!scheduledTimes.Any())
                {
                    return BadRequest("No scheduled Stop here.");
                }

                int delayInMinutes = 0;
                try
                {
                    delayInMinutes = (int)scheduledTimes
                        .Where(t => t.HasValue && t.Value <= checkin.DateTime.TimeOfDay)
                        .Select(t => (checkin.DateTime.TimeOfDay - t.Value).TotalMinutes)
                        .DefaultIfEmpty(0)
                        .Min();
                }
                catch
                {
                    return BadRequest("No scheduled Stop here.");
                }
                
                var insertQuery = @"
                    INSERT INTO CHECKIN (Checkintime, Routeid, Stopid, Delayinminutes)
                    VALUES (@Checkintime, @Routeid, @Stopid, @Delayinminutes)";

                await connection.ExecuteAsync(insertQuery, new
                {
                    Checkintime = checkin.DateTime,
                    Routeid = checkin.RouteId,
                    Stopid  = checkin.StopId,
                    Delayinminutes = delayInMinutes
                });

                return Ok($"Checkin creation successful. Delay: {delayInMinutes} minutes.");
            }
        }
    }
}
