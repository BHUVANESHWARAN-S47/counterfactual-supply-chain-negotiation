from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import User, AuditLog
from app.schemas.schemas import UserResponse, UserStatusUpdate, UserRoleUpdate

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db)):
    return db.query(User).order_by(User.id.asc()).all()

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(user_id: int = 1, db: Session = Depends(get_db)):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    return u

@router.put("/{user_id}/status", response_model=UserResponse)
def update_user_status(user_id: int, req: UserStatusUpdate, db: Session = Depends(get_db)):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    
    old_status = u.is_active
    u.is_active = req.is_active

    audit = AuditLog(
        user_email=u.email,
        action="USER_STATUS_UPDATED",
        entity_type="User",
        entity_id=str(u.id),
        old_values={"is_active": old_status},
        new_values={"is_active": req.is_active}
    )
    db.add(audit)
    db.commit()
    db.refresh(u)
    return u

@router.put("/{user_id}/role", response_model=UserResponse)
def update_user_role(user_id: int, req: UserRoleUpdate, db: Session = Depends(get_db)):
    valid_roles = ["ADMIN", "PROCUREMENT", "SUPPLIER", "CUSTOMER"]
    if req.role.upper() not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of {valid_roles}")

    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    
    old_role = u.role
    u.role = req.role.upper()

    audit = AuditLog(
        user_email=u.email,
        action="USER_ROLE_ASSIGNED",
        entity_type="User",
        entity_id=str(u.id),
        old_values={"role": old_role},
        new_values={"role": u.role}
    )
    db.add(audit)
    db.commit()
    db.refresh(u)
    return u

@router.get("/audit-logs")
def get_audit_logs(limit: int = 50, db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return [
        {
            "id": l.id,
            "action": l.action,
            "user_email": l.user_email,
            "entity_type": l.entity_type,
            "entity_id": l.entity_id,
            "old_values": l.old_values,
            "new_values": l.new_values,
            "timestamp": l.timestamp.isoformat()
        }
        for l in logs
    ]
