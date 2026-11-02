from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, create_access_token, hash_password, get_current_user
from app.models.models import User, Customer, Supplier
from app.schemas.schemas import Token, LoginRequest, UserCreate, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.strip().lower()).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user account")

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
    email = user_in.email.strip().lower()
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Invalid email format")
    if len(user_in.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long")

    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered")

    # Safe Role Enforcement:
    # Public registrations cannot self-escalate to ADMIN or PROCUREMENT.
    # Allowed open registration roles are CUSTOMER or SUPPLIER partner.
    requested_role = (user_in.role or "CUSTOMER").upper().strip()
    if requested_role in ("ADMIN", "PROCUREMENT"):
        # Default safely to CUSTOMER to prevent privilege escalation
        assigned_role = "CUSTOMER"
    elif requested_role == "SUPPLIER":
        assigned_role = "SUPPLIER"
    else:
        assigned_role = "CUSTOMER"

    user = User(
        email=email,
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name.strip(),
        role=assigned_role,
        company_name=user_in.company_name
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Automatically create profile record in corresponding domain table
    if assigned_role == "CUSTOMER":
        cust_profile = Customer(
            user_id=user.id,
            name=user.full_name,
            company=user.company_name or "Enterprise Customer",
            email=user.email,
            shipping_address="Standard Enterprise Hub"
        )
        db.add(cust_profile)
        db.commit()
    elif assigned_role == "SUPPLIER":
        supp_profile = Supplier(
            user_id=user.id,
            name=user.company_name or user.full_name,
            contact_email=user.email,
            categories="Precision Components, Electronics",
            baseline_rating=4.5,
            base_lead_time_days=7,
            capacity_per_week=500,
            reliability_score=0.90,
            risk_score=0.15
        )
        db.add(supp_profile)
        db.commit()

    return user

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """
    Returns the currently verified authenticated user profile.
    """
    return current_user

