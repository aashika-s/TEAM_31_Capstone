# """Pydantic request/response models for /flags."""
# import uuid
# from datetime import datetime

# from pydantic import BaseModel

# from app.models.flag import FlagStatus


# class FlagCreate(BaseModel):
#     scan_id: uuid.UUID
#     reason: str
#     observations: str | None = None


# class FlagOut(BaseModel):
#     id: uuid.UUID
#     scan_id: uuid.UUID
#     flagged_by_user_id: uuid.UUID
#     reason: str
#     observations: str | None
#     status: FlagStatus
#     created_at: datetime

#     class Config:
#         from_attributes = True





# """Pydantic request/response models for /flags."""
# import uuid
# from datetime import datetime

# from pydantic import BaseModel

# from app.models.flag import FlagStatus


# class FlagCreate(BaseModel):
#     scan_id: uuid.UUID
#     reason: str
#     observations: str | None = None


# class FlagStatusUpdate(BaseModel):
#     status: FlagStatus


# class FlagOut(BaseModel):
#     id: uuid.UUID
#     scan_id: uuid.UUID
#     flagged_by_user_id: uuid.UUID
#     reason: str
#     observations: str | None
#     status: FlagStatus
#     created_at: datetime

#     class Config:
#         from_attributes = True




# PHASE 6
"""Pydantic request/response models for /flags."""
import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.flag import FlagStatus


class FlagCreate(BaseModel):
    scan_id: uuid.UUID
    reason: str
    observations: str | None = None


class FlagStatusUpdate(BaseModel):
    status: FlagStatus


class FlagOut(BaseModel):
    id: uuid.UUID
    scan_id: uuid.UUID
    flagged_by_user_id: uuid.UUID
    reason: str
    observations: str | None
    status: FlagStatus
    created_at: datetime

    class Config:
        from_attributes = True