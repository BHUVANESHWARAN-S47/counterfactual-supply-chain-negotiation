from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, create_access_token, hash_password
from app.models.models import User
from app.schemas.schemas import Token, LoginRequest, UserCreate, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")

    token = create_access_token(data={"sub": user.email, "role": user.role, "user_id": user.id})
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        company_name=user.company_name
    )

@router.post("/demo-login", response_model=Token)
def demo_login(role: str = "ADMIN", db: Session = Depends(get_db)):
    """
    Convenience endpoint for fast evaluation and role switching across
    Admin, Procurement, Supplier, and Customer.
    """
    user = db.query(User).filter(User.role == role.upper()).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"No demo user with role {role}")
    token = create_access_token(data={"sub": user.email, "role": user.role, "user_id": user.id})
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        company_name=user.company_name
    )

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role.upper(),
        company_name=user_in.company_name
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
