using Dapper;
using Microsoft.AspNetCore.Mvc;
using System.Data.SqlClient;
using WebAPI.Model;
using Route = WebAPI.Model.Route;
using Schedule = WebAPI.Model.Schedule;

namespace WebAPI.Data.DBModelConnections
{
    [ApiController]
    [Route("api/ROUTE")]
    public class RouteConnector : ControllerBase
    {
        private readonly string _connectionString;

        public RouteConnector(IConfiguration configuration, string db = "DefaultConnection")
        {
            _connectionString = configuration.GetConnectionString(db);
        }

        public class RouteWithStop : Route
        {
            public virtual List<RouteStop> Stops { get; set; }
            public virtual List<Schedule> Schedules { get; set; }
        }
        [HttpGet]
        public async Task<List<RouteWithStop>> GetAllRoutesWithDelaysAsync()
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                var query = @"
            SELECT * FROM ROUTE;
            SELECT * FROM ROUTE_STOP;
            SELECT * FROM SCHEDULE;
            SELECT * FROM CHECKIN WHERE Checkintime >= CAST(GETDATE() AS DATE);";

                using (var multi = await connection.QueryMultipleAsync(query))
                {
                    var routes = multi.Read<Route>().ToList();
                    var stops = multi.Read<RouteStop>().ToList();
                    var schedules = multi.Read<Schedule>().ToList();
                    var checkins = multi.Read<Checkin>().ToList();

                    var result = routes.Select(route =>
                    {
                        var routeStops = stops.Where(s => s.Routeid == route.Id).OrderBy(s => s.Stoporder).ToList();
                        var routeSchedules = schedules.Where(s => s.Routeid == route.Id).ToList();

                        int currentDelay = 0;

                        foreach (var stop in routeStops)
                        {
                            var checkin = checkins.LastOrDefault(d => d.Routeid == route.Id && d.Stopid == stop.Stopid);
                            var schedule = routeSchedules.FirstOrDefault(x => x.Stopid == stop.Stopid);
                            if (checkin != null)
                            {
                                if (schedule != null && schedule.Scheduledtime.HasValue)
                                {
                                    TimeSpan scheduledTime = schedule.Scheduledtime.Value;
                                    int delay = (int)((checkin.Checkintime.TimeOfDay - scheduledTime).TotalMinutes);
                                    currentDelay = delay;
                                }
                            }
                            if (schedule != null && schedule.Scheduledtime.HasValue)
                                schedule.Scheduledtime = schedule.Scheduledtime.Value.Add(TimeSpan.FromMinutes(currentDelay));
                        }

                        return new RouteWithStop
                        {
                            Id = route.Id,
                            Routenumber = route.Routenumber,
                            Validfrom = route.Validfrom,
                            Validto = route.Validto,
                            Isweekend = route.Isweekend,
                            Stops = routeStops,
                            Schedules = routeSchedules
                        };
                    }).ToList();

                    return result;
                }
            }
        }


        [HttpGet("{id}")]
        public async Task<ActionResult<RouteWithStop>> GetRouteByIdAsync(int id)
        {
            var allRoutesWithDelays = await GetAllRoutesWithDelaysAsync();

            var routeWithStop = allRoutesWithDelays.FirstOrDefault(route => route.Id == id);

            if (routeWithStop == null)
                return NotFound();

            return Ok(routeWithStop);
        }


        [HttpPost]
        public async Task<IActionResult> CreateRouteAsync(RouteWithStop routeWithStop)
        {
            if (routeWithStop == null)
                return BadRequest("Route cannot be null.");

            using (var connection = new SqlConnection(_connectionString))
            {
                connection.Open();
                using (var transaction = connection.BeginTransaction())
                {
                    try
                    {
                        var insertRouteQuery = @"INSERT INTO ROUTE (Routenumber, Validfrom, Validto, Isweekend) 
                                                 VALUES (@Routenumber, @Validfrom, @Validto, @Isweekend);
                                                 SELECT CAST(SCOPE_IDENTITY() as int);";

                        var routeId = await connection.ExecuteScalarAsync<int>(insertRouteQuery, new
                        {
                            routeWithStop.Routenumber,
                            routeWithStop.Validfrom,
                            routeWithStop.Validto,
                            routeWithStop.Isweekend
                        }, transaction);

                        var insertStopQuery = @"INSERT INTO ROUTE_STOP (Routeid, Stopid, Stoporder) 
                                                 VALUES (@Routeid, @Stopid, @Stoporder);";

                        foreach (var stop in routeWithStop.Stops)
                        {
                            stop.Routeid = routeId;
                            await connection.ExecuteAsync(insertStopQuery, stop, transaction);
                        }

                        var insertScheduleQuery = @"INSERT INTO SCHEDULE (Routeid, Scheduledtime, Isholiday) 
                                                     VALUES (@Routeid, @Scheduledtime, @Isholiday);";

                        foreach (var schedule in routeWithStop.Schedules)
                        {
                            schedule.Routeid = routeId;
                            await connection.ExecuteAsync(insertScheduleQuery, schedule, transaction);
                        }

                        transaction.Commit();
                        return Ok(new { RouteId = routeId });
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        return StatusCode(500, $"An error occurred: {ex.Message}");
                    }
                }
            }
        }
    }
}
