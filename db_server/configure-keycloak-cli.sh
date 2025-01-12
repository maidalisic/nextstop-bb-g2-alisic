#!/bin/bash

# Keycloak URL and credentials
KEYCLOAK_URL="http://localhost:8080"
ADMIN_USER="admin"
ADMIN_PASSWORD="admin"
REALM_NAME="nextstop"
CLIENT_ID="nextstop-client"
CLIENT_SECRET="LwjQd9Xo3d+3sHkW27N9O/oWuHJ9R8Ne+VY6GpR1RnA"
ROLE_NAME="admin"
NEW_USER="nextstop-user"
NEW_USER_PASSWORD="password123"

# Login to Keycloak and retrieve access token
echo "Logging into Keycloak..."
ACCESS_TOKEN=$(curl -s -X POST "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=$ADMIN_USER" \
  -d "password=$ADMIN_PASSWORD" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" | jq -r '.access_token')

if [ -z "$ACCESS_TOKEN" ]; then
  echo "Failed to get access token from Keycloak."
  exit 1
fi

echo "Access token retrieved successfully."

# Create the Realm
echo "Creating realm $REALM_NAME..."
curl -s -X POST "$KEYCLOAK_URL/admin/realms" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"realm": "'"$REALM_NAME"'", "enabled": true}'

echo "Realm $REALM_NAME created."

# Create the Client
echo "Creating client $CLIENT_ID..."
curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/clients" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "'"$CLIENT_ID"'",
    "enabled": true,
    "protocol": "openid-connect",
    "publicClient": true,
    "directAccessGrantsEnabled": true
  }'

echo "Client $CLIENT_ID created."

# Retrieve the created Client ID (KEY)
echo "Retrieving client ID key..."
CLIENT_ID_KEY=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM_NAME/clients" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  | jq -r '.[] | select(.clientId=="'"$CLIENT_ID"'") | .id')

echo "Client Key = $CLIENT_ID_KEY"

# Update the client to set valid Redirect URIs, Web Origins, etc.
echo "Updating client $CLIENT_ID with redirect URIs and web origins..."
curl -s -X PUT "$KEYCLOAK_URL/admin/realms/$REALM_NAME/clients/$CLIENT_ID_KEY" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "'"$CLIENT_ID"'",
    "enabled": true,
    "protocol": "openid-connect",
    "publicClient": true,
    "directAccessGrantsEnabled": true,
    "redirectUris": ["http://localhost:4200/*"],
    "webOrigins": ["http://localhost:4200"]
  }'

echo "Redirect URIs and web origins set for $CLIENT_ID."

# Create the Role
echo "Creating role $ROLE_NAME..."
curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/roles" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "'"$ROLE_NAME"'"}'

echo "Role $ROLE_NAME created."

# Create the User
echo "Creating user $NEW_USER..."
curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/users" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "'"$NEW_USER"'",
    "enabled": true,
    "emailVerified": true,
    "email": "'"$NEW_USER@$REALM_NAME.com"'",
    "firstName": "Nextstop",
    "lastName": "User",
    "credentials": [
      {
        "type": "password",
        "value": "'"$NEW_USER_PASSWORD"'",
        "temporary": false
      }
    ]
  }'

echo "User $NEW_USER created."

# Retrieve Role ID
echo "Retrieving role ID for $ROLE_NAME..."
ROLE_ID=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM_NAME/roles" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq -r '.[] | select(.name=="'"$ROLE_NAME"'") | .id')

# Retrieve User ID
echo "Retrieving user ID for $NEW_USER..."
USER_ID=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM_NAME/users" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq -r '.[] | select(.username=="'"$NEW_USER"'") | .id')

# Assign the Role to the User
echo "Assigning role $ROLE_NAME to user $NEW_USER..."
curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/users/$USER_ID/role-mappings/realm" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{"id": "'"$ROLE_ID"'", "name": "'"$ROLE_NAME"'"}]'

echo "Role $ROLE_NAME assigned to user $NEW_USER."

echo "Keycloak configuration completed."