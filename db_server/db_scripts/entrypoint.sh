#!/bin/bash

# Starte SQL Server im Hintergrund
/opt/mssql/bin/sqlservr &

# Warte, bis der SQL Server bereit ist
echo "Waiting for SQL Server to start..."
until /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -Q "SELECT 1" &>/dev/null; do
    sleep 5
done

# SQL-Skripte ausführen
echo "Executing create.sql..."
/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -i /scripts/create.sql

echo "Executing insert.sql..."
/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -i /scripts/insert.sql

# Container am Laufen halten
wait
