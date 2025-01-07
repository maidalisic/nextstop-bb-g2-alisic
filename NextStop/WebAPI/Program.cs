using System.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Data.SqlClient;
using WebAPI.Data.DBModelConnections;

var builder = WebApplication.CreateBuilder(args);

// Abhängigkeiten registrieren (Connectors, DB, etc.)
builder.Services.AddScoped<HolidayConnector>();
builder.Services.AddScoped<RouteConnector>();
builder.Services.AddScoped<StopConnector>();
builder.Services.AddScoped<ScheduleConnector>();
builder.Services.AddScoped<StatisticConnector>();
builder.Services.AddScoped<CheckInConnector>();
builder.Services.AddScoped<ConnectionConnector>();

builder.Services.AddSingleton<IDbConnection>(sp =>
    new SqlConnection(builder.Configuration.GetConnectionString("DefaultConnection")));

// 1) JWT-Authentifizierung konfigurieren (Keycloak)
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = "http://localhost:8080/realms/nextstop"; // Keycloak-Realm: nextstop
        options.Audience = "nextstop-client"; // Dein Keycloak-Client
        options.RequireHttpsMetadata = !builder.Environment.IsDevelopment(); 
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true
        };
    });

// CORS für die API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAllOrigins");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
