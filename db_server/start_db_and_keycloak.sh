#!/bin/bash

echo "Starting services..."
docker-compose up -d --build

echo "Waiting for services to start..."
sleep 20

echo "Configuring Keycloak..."
./configure-keycloak-cli.sh

echo "All services started and configured!"
