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
    _sync_missing_columns()


def _sync_missing_columns():
    """create_all() only creates tables that don't exist yet -- it never
    ALTERs an existing table, so a checked-in spectrasafe.db from before
    the profile fields were added would otherwise 500 on first query.
    This adds any columns the model declares but the live table is
    missing, without touching existing rows/data. SQLite only (fine for
    this MVP); swap to real Alembic migrations before using Postgres.
    """
    if not settings.database_url.startswith("sqlite"):
        return

    from sqlalchemy import inspect, text

    inspector = inspect(engine)
    with engine.begin() as conn:
        for table in Base.metadata.tables.values():
            if not inspector.has_table(table.name):
                continue
            existing_cols = {c["name"] for c in inspector.get_columns(table.name)}
            for col in table.columns:
                if col.name in existing_cols:
                    continue
                col_type = col.type.compile(engine.dialect)
                default_sql = ""
                if col.default is not None and getattr(col.default, "arg", None) is not None:
                    val = col.default.arg
                    if isinstance(val, bool):
                        default_sql = f" DEFAULT {1 if val else 0}"
                    elif isinstance(val, (int, float)):
                        default_sql = f" DEFAULT {val}"
                conn.execute(text(f'ALTER TABLE "{table.name}" ADD COLUMN "{col.name}" {col_type}{default_sql}'))
