# API Design

## Überblick

Die folgenden Endpoints sind in der Anwendung verfügbar. Viele Routen verwenden GET, POST, PUT, DELETE – je nach Ressource.

**Inhaltsverzeichnis**  
1. [CheckInConnector] (#checkinconnector)  
2. [ConnectionConnector] (#connectionconnector)  
3. [HolidayConnector] (#holidayconnector)  
4. [RouteConnector] (#routeconnector)  
5. [ScheduleConnector] (#scheduleconnector)  
6. [StatisticConnector] (#statisticconnector)  
7. [StopConnector] (#stopconnector)

---

## 1) CheckInConnector
### **POST /api/CHECKIN**

- **Beschreibung**:  
  Ermöglicht das „Einchecken“ eines Busses an einer Haltestelle. Wird u. a. für Verspätungsberechnungen genutzt.

- **Request-Body** (JSON; `CheckInData`):
  ```json
  {
    "apI_KEY": "string (optional / falls DB-API-Key gefordert)",
    "routeId": 123,
    "stopId": 45,
    "dateTime": "2024-12-22T21:49:40.567Z"
  }
  ```
- **apI_KEY**: GUID aus der `API_KEY`-Tabelle (optional, falls zweites Auth-System neben Keycloak).
- **routeId**: ID der Route (muss existieren).
- **stopId**: ID der Haltestelle.
- **dateTime**: Check-in-Zeitpunkt (ISO 8601).

- **Responses**:
    - **200 OK**: Bei erfolgreicher Eintragung: `"Checkin creation successful. Delay: X minutes."`
    - **401 Unauthorized**: Falscher API-Key oder Keycloak-Token fehlt.
    - **400 Bad Request**: Wenn Route+Stop nicht im Fahrplan oder andere Daten nicht stimmig.

---

## 2) ConnectionConnector
### **GET /api/connections**

- **Beschreibung**:  
  Liefert passende Fahrplan-Verbindungen (z. B. Direktverbindungen) zwischen zwei Haltestellen.

- **Parameter** (Query-Strings):
    - `from` (int): Start-Haltestelle
    - `to` (int): Ziel-Haltestelle
    - `date` (DateTime): Tag der Abfahrt bzw. Ankunft
    - `time` (TimeSpan): Welche Uhrzeit als Start-/Endzeit
    - `isArrivalTime` (bool, default=false): Interpretiert `time` als Ankunftszeit statt Abfahrtszeit
    - `maxResults` (int, default=3): Anzahl der gewünschten Verbindungen

- **Responses**:
    - **200 OK**: Gibt eine Liste von möglichen Verbindungen zurück (DepartureTime, ArrivalTime).
    - **404 Not Found**: Falls keine passende Verbindung gefunden.

---

## 3) HolidayConnector
### **GET /api/HOLIDAY**
- **Beschreibung**:  
  Gibt eine Liste aller Feiertage zurück.

- **Responses**:
    - **200 OK** + Array von `Holiday`-Objekten:
      ```json
      [
        {
          "id": 1,
          "date": "2024-12-25T00:00:00",
          "name": "Weihnachten",
          "isschoolholiday": false
        },
        ...
      ]
      ```

### **POST /api/HOLIDAY**
- **Beschreibung**:  
  Fügt einen neuen Feiertag hinzu.

- **Request-Body** (`Holiday`):
  ```json
  {
    "id": 0,         // Kann ignoriert werden, falls Auto-Inkrement
    "date": "2024-12-25T00:00:00",
    "name": "Weihnachten",
    "isschoolholiday": false
  }
  ```
- **Responses**:
    - **200 OK**: Feiertag erfolgreich angelegt.
    - **400 Bad Request**: Falls Felder ungültig.

### **GET /api/HOLIDAY/{id}**
- **Beschreibung**:  
  Ruft Details eines bestimmten Feiertags ab (ID = Pfad-Parameter).

- **Responses**:
    - **200 OK**: Gibt `Holiday`-Objekt zurück.
    - **404 Not Found**: Wenn ID nicht existiert.

### **PUT /api/HOLIDAY/{id}**
- **Beschreibung**:  
  Aktualisiert einen bestehenden Feiertag (z. B. Namen ändern).

- **Request-Body**: `Holiday`-JSON (ähnlich POST).
- **Responses**:
    - **200 OK**: Bei Erfolg.
    - **404 Not Found**: Falls es die ID nicht gibt.

### **DELETE /api/HOLIDAY/{id}**
- **Beschreibung**:  
  Löscht den entsprechenden Feiertag.

- **Responses**:
    - **200 OK**: Feiertag gelöscht.
    - **404 Not Found**: ID unbekannt.

---

## 4) RouteConnector
### **GET /api/ROUTE**
- **Beschreibung**:  
  Listet alle Routen, optional mit deren Stop-Liste und Schedule.

- **Responses**:
    - **200 OK** + Array von `RouteWithStop`
      ```json
      [
        {
          "id": 1,
          "routenumber": "R1",
          "validfrom": "2024-01-01T00:00:00",
          "validto": "2024-12-31T00:00:00",
          "isweekend": false,
          "stops": [...],
          "schedules": [...]
        },
        ...
      ]
      ```

### **POST /api/ROUTE**
- **Beschreibung**:  
  Legt eine neue Route an.

- **Request-Body** (`RouteWithStop`):
  ```json
  {
    "routenumber": "R1",
    "validfrom": "2024-01-01T00:00:00",
    "validto": "2024-12-31T00:00:00",
    "isweekend": false,
    "stops": [
      { "routeid": 0, "stopid": 1, "stoporder": 1 },
      { "routeid": 0, "stopid": 5, "stoporder": 2 }
    ],
    "schedules": [...]
  }
  ```
- **Responses**:
    - **200 OK**: Route erstellt.
    - **400 Bad Request**: Ungültige Daten.

### **GET /api/ROUTE/{id}**
- **Beschreibung**:  
  Gibt eine einzelne Route (mit ID=?) zurück, inkl. Stop-Liste und Zeitplänen.

- **Responses**:
    - **200 OK** + `RouteWithStop`
    - **404 Not Found**

---

## 5) ScheduleConnector
(Die Endpoints lauten `/api/departures/connections` etc.)

### **GET /api/departures/connections**
- **Beschreibung**:  
  Ähnlich wie `/api/connections`, liefert Fahrplaninfos.

- **Parameters**:
    - `startId`, `stopId`, `date`, `time`, `isArrivalTime`, `maxResults`
- **Responses**:
    - **200 OK**: JSON mit Fahrplan- oder Verbindungseinträgen.
    - **404 Not Found**: Keine Verbindung.

### **GET /api/departures/next-departures**
- **Beschreibung**:  
  Liefert die nächsten Abfahrten für eine bestimmte Haltestelle.

- **Parameters**:
    - `stopId`, `date`, `time`, `maxResults=100`
- **Responses**:
    - **200 OK**: Liste von Abfahrtszeiten.
    - **404 Not Found**: Haltestelle existiert nicht oder keine Daten.

---

## 6) StatisticConnector
### **GET /api/Statistics**
- **Beschreibung**:  
  Liefert eine Liste von Statistik-Datensätzen (z. B. Delay-Auswertung).

- **Responses**:
    - **200 OK**: JSON-Array der vorhandenen Statistiken.

### **GET /api/Statistics/{id}**
- **Beschreibung**:  
  Details einer einzelnen Statistik.

- **Responses**:
    - **200 OK** + JSON einer Statistik
    - **404 Not Found**

---

## 7) StopConnector
### **GET /api/STOP**
- **Beschreibung**:  
  Listet alle bekannten Haltestellen.

- **Responses**:
    - **200 OK** + Array von `Stop`-Objekten

### **POST /api/STOP**
- **Beschreibung**:  
  Erzeugt eine neue Haltestelle.

- **Request-Body** (`Stop`):
  ```json
  {
    "name": "Hagenberg im Mühlkreis",
    "shortcode": "HGB",
    "latitude": 48.3686,
    "longitude": 14.5167
  }
  ```
- **Responses**:
    - **200 OK**: Angelegt
    - **400 Bad Request**: Daten ungültig

### **GET /api/STOP/{id}**
- **Beschreibung**:  
  Liefert Haltestellen-Infos.

- **Responses**:
    - **200 OK** + `Stop`
    - **404 Not Found**

### **PUT /api/STOP/{id}**
- **Beschreibung**:  
  Aktualisiert die Haltestellen-Daten (Name, Koordinaten, etc.).

- **Request-Body**: `Stop`-Objekt
- **Responses**:
    - **200 OK**
    - **404 Not Found**

### **DELETE /api/STOP/{id}**
- **Beschreibung**:  
  Löscht eine Haltestelle.

- **Responses**:
    - **200 OK**
    - **404 Not Found**

### **GET /api/STOP/search**
- **Beschreibung**:  
  Sucht Haltestellen anhand eines Text-Querys oder Koordinaten.

- **Parameters**:
    - `query`: z. B. Name-Substring
    - `latitude` + `longitude`: Optional, falls man in der Nähe suchen will
    - `queryLimit`: Max. Ergebnisanzahl

- **Responses**:
    - **200 OK**: Liste passender Stops
    - **200 OK** (leere Liste), wenn nichts gefunden