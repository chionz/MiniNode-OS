from datetime import timedelta
from fastapi import (
    BackgroundTasks,
    Depends,
    HTTPException,
    status,
    APIRouter,
    Response,
    Request,
)
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from api.utils.success_response import success_response
from api.v1.schemas.user import LoginRequest, UserCreate
from api.db.database import get_db
from api.v1.models.user import User
from api.v1.services.user import user_service
from api.v1.services.auth import AuthService

auth = APIRouter(prefix="/auth", tags=["Authentication"])


@auth.post(
    "/register", status_code=status.HTTP_201_CREATED, response_model=success_response
)
def register(
    response: Response,
    user_schema: UserCreate,
    db: Session = Depends(get_db),
):
    """Endpoint for a user to register their account"""

    # Create user account
    user = user_service.create(db=db, schema=user_schema)

    # Create access and refresh tokens
    access_token = user_service.create_access_token(user_id=user.id)
    refresh_token = user_service.create_refresh_token(user_id=user.id)

    response = success_response(
        status_code=201,
        message="User created successfully",
        data={
            "access_token": access_token,
            "token_type": "bearer",
            "user": jsonable_encoder(
                user,
                exclude=[
                    "password",
                    "is_super_admin",
                    "is_deleted",
                    "is_verified",
                    "updated_at",
                ],
            ),
        },
    )

    # Add refresh token to cookies
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        expires=timedelta(days=60),
        httponly=True,
        secure=True,
        samesite="none",
    )

    return response

from fastapi import HTTPException, status

@auth.post("/login", status_code=status.HTTP_200_OK, response_model=success_response)
def login(
    background_tasks: BackgroundTasks,
    login_request: LoginRequest,
    db: Session = Depends(get_db),
):
    """Endpoint to log in a user"""

    # Authenticate the user
    user = user_service.authenticate_user(
        db=db, email=login_request.email, password=login_request.password
    )

    # Generate access and refresh tokens
    access_token = user_service.create_access_token(user_id=user.id)
    refresh_token = user_service.create_refresh_token(user_id=user.id)
    response = success_response(
        status_code=200,
        message="Login successful",
        data={
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": jsonable_encoder(
                user,
                exclude=[
                    "password",
                    "is_super_admin",
                    "is_deleted",
                    "is_verified",
                    "updated_at",
                ],
            ),
        },
    )

    # Add refresh token to cookies
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        expires=timedelta(days=30),
        httponly=True,
        secure=False,
        samesite="lax",
    )

    return response


@auth.post("/logout", status_code=status.HTTP_200_OK)
def logout(
    response: Response, current_user: User = Depends(user_service.get_current_user)
):
    """Endpoint to log a user out of their account"""

    response = success_response(status_code=200, message="User logged out successfully")

    # Delete refresh token from cookies
    response.delete_cookie(key="refresh_token")

    return response


@auth.post("/refresh-access-token", status_code=status.HTTP_200_OK)
def refresh_access_token(
    request: Request, response: Response, db: Session = Depends(get_db)
):
    """Endpoint to refresh access and refresh tokens"""

    # Get refresh token
    current_refresh_token = request.cookies.get("refresh_token")

    # Create new access and refresh tokens
    access_token, refresh_token = user_service.refresh_access_token(
        current_refresh_token=current_refresh_token
    )

    response = success_response(
        status_code=200,
        message="Tokens refreshed successfully",
        data={
            "access_token": access_token,
            "token_type": "bearer",
        },
    )

    # Add refresh token to cookies
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        expires=timedelta(days=30),
        httponly=True,
        secure=True,
        samesite="none",
    )

    return response


@auth.get("/token")
def get_access_token(request: Request, response: Response):
    current_refresh_token = request.cookies.get("refresh_token")
    new_access_token, new_refresh_token = user_service.refresh_access_token(
        current_refresh_token
    )
    response.set_cookie(key="access_token", value=new_access_token, httponly=True)
    response.set_cookie(key="refresh_token", value=new_refresh_token, httponly=True)
    if not new_access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {"access_token": new_access_token}
