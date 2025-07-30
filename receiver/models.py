import uuid
from .database import Base
from sqlalchemy import (
    TIMESTAMP,
    Column,
    ForeignKey,
    String,
    Boolean,
    text,
    Integer,
    Float,
    ForeignKeyConstraint,
)
from sqlalchemy.dialects.postgresql import UUID, ENUM
from sqlalchemy.orm import relationship
from enum import Enum

class Category(Base):
    __tablename