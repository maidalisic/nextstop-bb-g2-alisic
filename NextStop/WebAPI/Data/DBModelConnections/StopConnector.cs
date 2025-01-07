using Dapper;
using Geolocation;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Data.SqlClient;
using WebAPI.Model;

namespace WebAPI.Data.DBModelConnections
{
    [ApiController]
    [Route("api/STOP")]
    public class StopConnector : ControllerBase
    {
        private readonly string _connectionString;

        public StopConnector(IConfiguration configuration, string db = "DefaultConnection")
        {
            _connectionString = configuration.GetConnectionString(db);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllSTOPAsync()
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                var query = "SELECT * FROM STOP";
                var STOP = await connection.QueryAsync<Stop>(query);
                return Ok(STOP);
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetStopByIdAsync(int id)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                var query = "SELECT * FROM STOP WHERE Id = @Id";
                var stop = await connection.QuerySingleOrDefaultAsync<Stop>(query, new { Id = id });
                if (stop == null)
                    return NotFound();
                return Ok(stop);
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateStopAsync(Stop stop)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                var existingQuery = "SELECT * FROM STOP WHERE Shortcode = @Shortcode";
                var existingStop = await connection.QuerySingleOrDefaultAsync<Stop>(existingQuery, new { Shortcode = stop.Shortcode });
                if (existingStop != null)
                {
                    return Conflict(new { message = "A stop with the same shortcode already exists." });
                }

                var insertQuery = "INSERT INTO STOP (Name, Shortcode, Latitude, Longitude) OUTPUT INSERTED.Id VALUES (@Name, @Shortcode, @Latitude, @Longitude)";
                var newId = await connection.ExecuteScalarAsync<int>(insertQuery, stop);

                var selectQuery = "SELECT * FROM STOP WHERE Id = @Id";
                var newStop = await connection.QuerySingleOrDefaultAsync<Stop>(selectQuery, new { Id = newId });

                if (newStop == null)
                {
                    return NotFound();
                }

                return Ok(newStop);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStopAsync(int id, Stop stopDto)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                var query = "SELECT * FROM STOP WHERE Id = @Id";
                var stop = await connection.QuerySingleOrDefaultAsync<Stop>(query, new { Id = id });
                if (stop == null)
                    return NotFound();

                var updateQuery = "UPDATE STOP SET Name = @Name, Shortcode = @Shortcode, Latitude = @Latitude, Longitude = @Longitude WHERE Id = @Id";
                await connection.ExecuteAsync(updateQuery, new { stopDto.Name, stopDto.Shortcode, stopDto.Latitude, stopDto.Longitude, Id = id });
                return NoContent();
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStopAsync(int id)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                var query = "SELECT * FROM STOP WHERE Id = @Id";
                var stop = await connection.QuerySingleOrDefaultAsync<Stop>(query, new { Id = id });
                if (stop == null)
                    return NotFound();

                var deleteQuery = "DELETE FROM STOP WHERE Id = @Id";
                await connection.ExecuteAsync(deleteQuery, new { Id = id });
                return NoContent();
            }
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchStop(string? query, decimal? latitude, decimal? longitude, int? queryLimit)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                var baseQuery = "SELECT * FROM STOP";
                var STOP = (await connection.QueryAsync<Stop>(baseQuery)).AsEnumerable();

                if (query != null)
                {
                    string loweredQuery = query.ToLower();
                    STOP = STOP.Where(stop =>
                        stop.Name.ToLower().Contains(loweredQuery) ||
                        stop.Name.ToLower().Replace("st.", "sankt").Contains(loweredQuery) ||
                        stop.Name.ToLower().Replace("sankt", "st.").Contains(loweredQuery)
                    );
                }

                if (latitude.HasValue && longitude.HasValue)
                {
                    STOP = STOP
                        .OrderBy(stop =>
                            GeoCalculator.GetDistance((double)latitude.Value, (double)longitude.Value, (double)stop.Latitude, (double)stop.Longitude, 1, DistanceUnit.Meters));
                }

                if (queryLimit.HasValue)
                {
                    STOP = STOP.Take(queryLimit.Value);
                }

                return Ok(STOP);
            }
        }
    }
}
