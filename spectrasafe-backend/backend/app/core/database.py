# """
# SQLAlchemy engine/session setup. create_all() is used instead of Alembic
# migrations for now — fine for a capstone MVP with one evolving schema;
# swap to Alembic before this needs to survive real schema changes without
# wiping data.
# """
# from sqlalchemy import create_engine
# from sqlalchemy.orm import sessionmaker, declarative_base

# from app.core.config import settings

# connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
# engine = create_engine(settings.database_url, connect_args=connect_args)
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# Base = declarative_base()


# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()


# def init_db():
#     # Import models here (not at module top) so they're registered on
#     # Base.metadata before create_all runs.
#     from app.models import scan, product, user  # noqa: F401
#     Base.metadata.create_all(bind=engine)



# PHASE 4
"""
SQLAlchemy engine/session setup. create_all() is used instead of Alembic
migrations for now — fine for a capstone MVP with one evolving schema;
swap to Alembic before this needs to survive real schema changes without
wiping data.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import settings

connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
engine = create_engine(settings.database_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    # Import models here (not at module top) so they're registered on
    # Base.metadata before create_all runs.
    from app.models import scan, product, user, flag  # noqa: F401
    Base.metadata.create_all(bind=engine)
