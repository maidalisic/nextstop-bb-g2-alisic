using Dapper;
using Microsoft.AspNetCore.Mvc;
using System.Data.SqlClient;
using WebAPI.Model;

namespace WebAPI.Data.DBModelConnections
{
    [ApiController]
    [Route("api/HOLIDAY")]
    public class HolidayConnector : ControllerBase
    {
        private readonly string _connectionString;
        public HolidayConnector(IConfiguration configuration, string db = "DefaultConnection")
        {
            _connectionString = configuration.GetConnectionString(db);
        }

        [HttpGet]
        public async Task<List<Holiday>> GetAllHOLIDAYAsync()
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                var HOLIDAY = await connection.QueryAsync<Holiday>("SELECT * FROM HOLIDAY");
                return HOLIDAY.ToList();
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Holiday>> GetHolidayByIdAsync(int id)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                var holiday = await connection.QuerySingleOrDefaultAsync<Holiday>(
                    "SELECT * FROM HOLIDAY WHERE Id = @Id",
                    new { Id = id }
                );

                if (holiday == null)
                    return NotFound();

                return Ok(holiday);
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateHolidayAsync(Holiday holiday)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                var insertQuery = @"INSERT INTO HOLIDAY (Date, Name, Isschoolholiday) 
                                     VALUES (@Date, @Name, @Isschoolholiday);
                                     SELECT CAST(SCOPE_IDENTITY() as int);";

                var id = await connection.ExecuteScalarAsync<int>(insertQuery, new
                {
                    holiday.Date,
                    holiday.Name,
                    holiday.Isschoolholiday
                });

                var createdHoliday = await connection.QuerySingleOrDefaultAsync<Holiday>(
                    "SELECT * FROM HOLIDAY WHERE Id = @Id",
                    new { Id = id }
                );

                if (createdHoliday == null)
                    return NotFound();

                return Ok(createdHoliday);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateHolidayAsync(int id, Holiday newHoliday)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                var affectedRows = await connection.ExecuteAsync(
                    @"UPDATE HOLIDAY SET Date = @Date, Name = @Name, Isschoolholiday = @Isschoolholiday 
                       WHERE Id = @Id",
                    new
                    {
                        newHoliday.Date,
                        newHoliday.Name,
                        newHoliday.Isschoolholiday,
                        Id = id
                    }
                );

                if (affectedRows == 0)
                    return NotFound();

                return NoContent();
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteHolidayAsync(int id)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                var affectedRows = await connection.ExecuteAsync(
                    "DELETE FROM HOLIDAY WHERE Id = @Id",
                    new { Id = id }
                );

                if (affectedRows == 0)
                    return NotFound();

                return NoContent();
            }
        }
    }
}
