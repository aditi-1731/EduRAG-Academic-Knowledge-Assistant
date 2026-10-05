from app.services.security import (
    create_access_token,
    decode_access_token,
)


user_id = 1

token = create_access_token(user_id)

print("JWT created successfully!")

payload = decode_access_token(token)

print("JWT decoded successfully!")
print("User ID:", payload["sub"])