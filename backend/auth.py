import os
from fastapi import HTTPException, Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, jwk
from jose.utils import base64url_decode
import requests

security = HTTPBearer()

CLERK_ISSUER = os.getenv("CLERK_ISSUER") # e.g. https://clerk.your-app.com
CLERK_JWKS_URL = f"{CLERK_ISSUER}/.well-known/jwks.json"

class ClerkAuth:
    def __init__(self):
        self.jwks_client = None

    def get_jwks(self):
        if not self.jwks_client:
            self.jwks_client = requests.get(CLERK_JWKS_URL).json()
        return self.jwks_client

    def verify_token(self, token: str):
        try:
            # Get the key ID from the header
            header = jwt.get_unverified_header(token)
            kid = header['kid']
            
            # Find the key in JWKS
            jwks = self.get_jwks()
            key = next((k for k in jwks['keys'] if k['kid'] == kid), None)
            
            if not key:
                raise HTTPException(status_code=401, detail="Invalid token key ID")
            
            # Construct public key
            public_key = jwk.construct(key)
            
            # Verify signature
            message, signature = token.rsplit('.', 1)
            decoded_signature = base64url_decode(signature.encode('utf-8'))
            
            if not public_key.verify(message.encode('utf-8'), decoded_signature):
                 raise HTTPException(status_code=401, detail="Invalid token signature")
            
            # Decode payload
            payload = jwt.decode(
                token,
                key,
                algorithms=['RS256'],
                audience=os.getenv("CLERK_AUDIENCE"), # Optional
                options={"verify_signature": False} # Already verified manually above or let library handle it
            )
            
            return payload
            
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

auth_handler = ClerkAuth()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    # In development, we might skip full verification if env var is set
    if os.getenv("SKIP_AUTH") == "true":
        return {"sub": "dev_user"}
        
    return auth_handler.verify_token(token)
