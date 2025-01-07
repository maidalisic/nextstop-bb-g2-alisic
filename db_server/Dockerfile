FROM mcr.microsoft.com/mssql/server:latest

# Set environment variables
ENV ACCEPT_EULA=Y
ENV SA_PASSWORD="@c0^JiGrg5Nj^YFu0B8wt0x7*evxzC^nyxOa"

# Install the sqlcmd and bcp tools with elevated permissions
USER root
RUN apt-get update && \
    apt-get install -y curl apt-transport-https gnupg && \
    curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - && \
    curl https://packages.microsoft.com/config/ubuntu/22.04/prod.list -o /etc/apt/sources.list.d/mssql-release.list && \
    apt-get update && \
    ACCEPT_EULA=Y apt-get install -y msodbcsql17 mssql-tools unixodbc-dev && \
    echo 'export PATH="$PATH:/opt/mssql-tools/bin"' >> /etc/bash.bashrc && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY db_scripts/create.sql /scripts/create.sql
COPY db_scripts/insert.sql /scripts/insert.sql
COPY --chown=mssql db_scripts/entrypoint.sh /scripts/entrypoint.sh
RUN chmod +x /scripts/entrypoint.sh

# Wechsle zurück zum Standardbenutzer
USER mssql

# Setze das Entry-Skript
ENTRYPOINT ["/bin/bash", "/scripts/entrypoint.sh"]
