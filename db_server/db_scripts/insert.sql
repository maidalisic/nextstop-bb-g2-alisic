USE NextStop;

INSERT INTO HOLIDAY (DATE, NAME, ISSCHOOLHOLIDAY)
VALUES
    ('2024-01-01', 'Neujahrstag', 0),
    ('2024-04-01', 'Ostermontag', 0),
    ('2024-05-01', 'Staatsfeiertag', 0),
    ('2024-12-25', 'Weihnachtstag', 0),
    ('2025-01-01', 'Neujahrstag', 0),
    ('2025-04-21', 'Ostermontag', 0),
    ('2025-12-25', 'Weihnachtstag', 0),
    ('2024-06-21', 'Sommersonnenwende', 0),
    ('2024-08-15', 'Maria Himmelfahrt', 1),
    ('2024-10-26', 'Nationalfeiertag', 0),
    ('2024-11-15', 'Hl. Leopold', 0);



INSERT INTO STOP (NAME, SHORTCODE, LATITUDE, LONGITUDE)
VALUES
    ('Vöcklabruck Hauptbahnhof', 'VBR', 48.0086, 13.6558),
    ('Hagenberg im Mühlkreis',   'HGB', 48.3686, 14.5167),
    ('Wolfsbach Ortsmitte',      'WFB', 48.0833, 14.6667),
    ('Gramatneusiedl',           'GMN', 48.0167, 16.5167),
    ('Linz Hauptbahnhof',        'LNZ', 48.3069, 14.2858),
    ('Amstetten',                'AMS', 48.1229, 14.8721),
    ('Wien Westbahnhof',         'WWB', 48.1981, 16.3361),
    ('Wien Hauptbahnhof',        'WHB', 48.1859, 16.3762),
    ('St. Pölten',               'STP', 48.2047, 15.6256),
    ('Attnang-Puchheim',         'ATP', 48.0167, 13.7442),
    ('Bad Ischl',                'BIS', 47.7155, 13.6210),
    ('Salzburg Hauptbahnhof',    'SBG', 47.8122, 13.0458),
    ('Kufstein',                 'KFT', 47.5833, 12.1667),
    ('Gmunden',                  'GMD', 47.9186, 13.7993),
    ('Steyr',                    'STY', 48.0428, 14.4213),
    ('Freistadt',                'FSD', 48.5116, 14.5083),
    ('Eferding',                 'EFD', 48.3083, 13.9722),
    ('Schärding',                'SCH', 48.4500, 13.4333),
    ('Passau Hbf',               'PSU', 48.5740, 13.4531),
    ('Melk',                     'MLK', 48.2276, 15.3403);


INSERT INTO ROUTE (ROUTENUMBER, VALIDFROM, VALIDTO, ISWEEKEND)
VALUES
    ('R1', '2024-01-01', '2026-12-31', 0),
    ('R2', '2024-01-01', '2026-12-31', 1),
    ('R3', '2024-01-01', '2026-12-31', 0),
    ('R4', '2024-01-01', '2026-12-31', 0),
    ('R5', '2024-01-01', '2026-12-31', 1),
    ('R6', '2024-01-01', '2026-12-31', 0);

DECLARE @AllStops TABLE (
                            StopID INT
                        );

INSERT INTO @AllStops (StopID)
SELECT ID
FROM STOP;

DECLARE @RouteCount INT = (SELECT COUNT(*) FROM ROUTE);
DECLARE @R INT = 1;

WHILE @R <= @RouteCount
    BEGIN
        -- STOPs zufällig sortieren
        WITH RandomStops AS (
            SELECT TOP (8) ID AS StopID
            FROM STOP
            ORDER BY NEWID()
        )
        SELECT ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS rn,
               StopID
        INTO #tmpStops
        FROM RandomStops;

        -- Reduziere auf 5 bis 8 StopIDs
        DECLARE @CountStops INT = 5 + ABS(CHECKSUM(NEWID())) % 4; -- 5..8
        WITH Limited AS (
            SELECT TOP(@CountStops) *
            FROM #tmpStops
            ORDER BY rn
        )
        INSERT INTO ROUTE_STOP (ROUTEID, STOPID, STOPORDER)
        SELECT @R,
               StopID,
               ROW_NUMBER() OVER (ORDER BY rn) AS STOPORDER
        FROM Limited;

        DROP TABLE #tmpStops;

        SET @R += 1;
    END;


BEGIN
    SET NOCOUNT ON;

    -- Alle Routen + ihre STOPs einlesen
    DECLARE @RouteStops TABLE (
                                  RouteID   INT,
                                  StopID    INT,
                                  StopOrder INT
                              );
    INSERT INTO @RouteStops
    SELECT ROUTEID, STOPID, STOPORDER
    FROM ROUTE_STOP;

    -- Zeitfenster stündlich 05:00 bis 20:00
    DECLARE @Hour INT = 5;
    WHILE @Hour <= 20
        BEGIN
            INSERT INTO SCHEDULE (ROUTEID, STOPID, SCHEDULEDTIME, ISHOLIDAY)
            SELECT
                RS.RouteID,
                RS.StopID,
                -- z. B. '05:00:00'
                CONVERT(TIME, DATEADD(HOUR, @Hour, CAST('00:00:00' AS DATETIME))),
                0
            FROM @RouteStops RS;

            SET @Hour += 1;
        END;
END;

BEGIN
    DECLARE @i INT = 1;
    WHILE @i <= 50
        BEGIN
            -- Vornamen-Liste
            DECLARE @FirstNames TABLE (FName VARCHAR(50));
            INSERT INTO @FirstNames
            VALUES('Anna'),('Bernd'),('Caroline'),('Daniel'),('Erika'),
                  ('Florian'),('Gustav'),('Hannah'),('Ines'),('Jonas'),
                  ('Katrin'),('Lea'),('Max'),('Nina'),('Oliver'),
                  ('Paula'),('Quirin'),('Raphael'),('Sophie'),('Tobias');

            DECLARE @LastNames TABLE (LName VARCHAR(50));
            INSERT INTO @LastNames
            VALUES('Müller'),('Huber'),('Maier'),('Bauer'),('Wagner'),
                  ('Schmid'),('Lehner'),('Fischer'),('Hofer'),('Weber'),
                  ('Pichler'),('Lang'),('Eder'),('Gruber'),('Riedl'),
                  ('Brandl'),('Hofmann'),('Koch'),('Leitner'),('Steiner');

            DECLARE @RandF INT = ABS(CHECKSUM(NEWID())) % 20 + 1;
            DECLARE @RandL INT = ABS(CHECKSUM(NEWID())) % 20 + 1;

            DECLARE @FName VARCHAR(50);
            SELECT @FName = FName
            FROM (
                     SELECT ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS rn, FName
                     FROM @FirstNames
                 ) t
            WHERE rn = @RandF;

            DECLARE @LName VARCHAR(50);
            SELECT @LName = LName
            FROM (
                     SELECT ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS rn, LName
                     FROM @LastNames
                 ) u
            WHERE rn = @RandL;

            -- Zufälliges Geburtsjahr 1970..2005
            DECLARE @DOB DATE =
                DATEADD(DAY, ABS(CHECKSUM(NEWID())) % 365,
                        DATEADD(YEAR, 1970 + ABS(CHECKSUM(NEWID())) % 36, '1900-01-01'));

            DECLARE @RandomNum INT = ABS(CHECKSUM(NEWID())) % 10000;
            DECLARE @Email VARCHAR(100) =
                LOWER(REPLACE(@FName,' ',''))
                    +'.'
                    + LOWER(REPLACE(@LName,' ',''))
                    + CAST(@RandomNum AS VARCHAR)
                    + '@mail.com';

            INSERT INTO PERSON (FIRSTNAME, LASTNAME, DATEOFBIRTH, EMAIL)
            VALUES(@FName, @LName, @DOB, @Email);

            SET @i += 1;
        END;
END;

INSERT INTO CLIENT (CLIENTNAME, PASSWORDHASH, ROLE)
VALUES
    ('superadmin','ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb','Admin'),
    ('tester','efa3f7d4c4c9daff9c3f7cb172c78c7af96f2a7011b9182ea1a85ca0c07b4292','User'),
    ('reporter','2c9341ca4cf3d87b9e4eb909bb3f1569ef6b1153f0706d9280acaff6be1f49db','User');

INSERT INTO API_KEY (CLIENTID)
SELECT ID FROM CLIENT WHERE CLIENTNAME = 'superadmin';

INSERT INTO API_KEY (CLIENTID)
SELECT ID FROM CLIENT WHERE CLIENTNAME = 'tester';

INSERT INTO API_KEY (CLIENTID)
SELECT ID FROM CLIENT WHERE CLIENTNAME = 'reporter';


BEGIN
    DECLARE @maxRouteID INT = (SELECT MAX(ID) FROM ROUTE);
    DECLARE @minRouteID INT = (SELECT MIN(ID) FROM ROUTE);

    DECLARE @j INT = 1;
    WHILE @j <= 20
        BEGIN
            DECLARE @SomeRouteID INT = @minRouteID + ABS(CHECKSUM(NEWID())) % (@maxRouteID - @minRouteID + 1);

            -- Zufälliges Datum 2024/2025
            DECLARE @SomeDate DATE =
                DATEADD(DAY, ABS(CHECKSUM(NEWID())) % 500, '2024-01-01');

            INSERT INTO STATISTIC (ROUTEID, REPORTDATE, AVERAGEDELAY, ONTIME_PERCENTAGE)
            VALUES(
                      @SomeRouteID,
                      @SomeDate,
                      ((ABS(CHECKSUM(NEWID())) % 30) - 5),  -- -5..+24 min
                      (80.0 + CAST(ABS(CHECKSUM(NEWID())) % 20 AS DECIMAL(5,2))) -- 80..99
                  );

            SET @j += 1;
        END;
END;

BEGIN
    DECLARE @DateStart DATE = '2024-01-01';
    DECLARE @DateEnd   DATE = '2024-12-31';
    DECLARE @CurDate   DATE = @DateStart;

    -- Hole dir die Routen in eine Zwischentabelle
    DECLARE @Rts TABLE (RouteID INT);
    INSERT INTO @Rts
    SELECT ID FROM ROUTE;

    WHILE @CurDate <= @DateEnd
        BEGIN
            DECLARE @OneRouteID INT;
            DECLARE cur CURSOR LOCAL FAST_FORWARD FOR
                SELECT RouteID FROM @Rts;

            OPEN cur;
            FETCH NEXT FROM cur INTO @OneRouteID;

            WHILE @@FETCH_STATUS = 0
                BEGIN
                    /*
                       Generiere 2..3 random Checkins 
                       -> wir holen die STOPIDs der Route aus ROUTE_STOP,
                          picken 2..3 davon zufällig
                    */
                    WITH Stp AS (
                        SELECT STOPID
                        FROM ROUTE_STOP
                        WHERE ROUTEID = @OneRouteID
                    )
                    SELECT TOP(3) STOPID
                    INTO #tmp
                    FROM Stp
                    ORDER BY NEWID();

                    DECLARE @CountCheck INT = 2 + (ABS(CHECKSUM(NEWID())) % 2); -- 2..3

                    WITH limited AS (
                        SELECT TOP(@CountCheck) STOPID
                        FROM #tmp
                    )
                    INSERT INTO CHECKIN (ROUTEID, STOPID, CHECKINTIME, DELAYINMINUTES)
                    SELECT
                        @OneRouteID,
                        STOPID,
                        DATEADD(
                                MINUTE,
                                ABS(CHECKSUM(NEWID())) % 600,  -- 0..599 => 0..9h59
                                DATEADD(HOUR, 5, CAST(@CurDate AS DATETIME)) -- ab 05:00
                        ),
                        (ABS(CHECKSUM(NEWID())) % 21) - 5
                    FROM limited;

                    DROP TABLE #tmp;

                    FETCH NEXT FROM cur INTO @OneRouteID;
                END;

            CLOSE cur;
            DEALLOCATE cur;

            SET @CurDate = DATEADD(DAY, 1, @CurDate);
        END;
END;

SELECT COUNT(*) AS [TotalCheckIns2024]
FROM CHECKIN
WHERE CHECKINTIME >= '2024-01-01'
  AND CHECKINTIME <  '2025-01-01';
