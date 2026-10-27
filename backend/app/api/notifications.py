from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Notification
from app.schemas.schemas import NotificationResponse

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/", response_model=List[NotificationResponse])
def get_notifications(role: str = None, user_id: int = None, unread_only: bool = False, db: Session = Depends(get_db)):
    query = db.query(Notification)
    if role:
        # Match specific role or ALL
        query = query.filter((Notification.role == role.upper()) | (Notification.role == "ALL"))
    if user_id:
        query = query.filter((Notification.user_id == user_id) | (Notification.user_id == None))
    if unread_only:
        query = query.filter(Notification.is_read == False)

    notifications = query.order_by(Notification.created_at.desc()).limit(50).all()
    return notifications

@router.post("/{notification_id}/read")
def mark_read(notification_id: int, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    return {"success": True}

@router.post("/read-all")
def mark_all_read(role: str = None, db: Session = Depends(get_db)):
    query = db.query(Notification)
    if role:
        query = query.filter(Notification.role == role.upper())
    query.update({"is_read": True})
    db.commit()
    return {"success": True}
