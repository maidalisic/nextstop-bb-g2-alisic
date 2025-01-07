# Keycloak-Integration für Endpoint-Schutz

1. **Keycloak-Container starten**:
    - Das Skript `start_db_and_keycloak.sh` startet den Keycloak-Container und konfiguriert automatisch Realm, Client und User.

2. **Authentication konfigurieren**:
    - Die Keycloak-Integration ist in der `Program.cs` bereits eingerichtet:
      ```csharp
      builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
          .AddJwtBearer(options =>
          {
              options.Authority = "http://localhost:8080/realms/nextstop";
              options.Audience = "nextstop-client";
              options.RequireHttpsMetadata = false;
          });
      app.UseAuthentication();
      app.UseAuthorization();
      ```

3. **Endpoint schützen**:
    - Um einen Endpoint zu schützen, füge `[Authorize]` zur Methode oder zur Controller-Klasse hinzu:
      ```csharp
      [Authorize]
      [HttpGet]
      public async Task<List<Holiday>> GetAllHOLIDAYAsync()
      {
          // Code
      }
      ```

4. **Token verwenden**:
    - Hole dir einen gültigen Token mit einer HTTP-POST-Anfrage an:
      ```
      POST http://localhost:8080/realms/nextstop/protocol/openid-connect/token
      Content-Type: application/x-www-form-urlencoded
      
      grant_type=password&
      username=nextstop-user&
      password=password123&
      client_id=nextstop-client
      ```
    - Sende den Token im `Authorization`-Header für geschützte Endpoints:
      ```
      Authorization: Bearer <your-access-token>
      ```