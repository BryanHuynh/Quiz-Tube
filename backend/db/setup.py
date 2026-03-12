import logging
from sqlalchemy import inspect
from db.models import Base
from db.session import engine

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
logger = logging.getLogger(__name__)


def setup() -> None:
    logger.info("Connecting to: %s", engine.url)

    inspector = inspect(engine)
    existing = inspector.get_table_names()
    tables = [t.name for t in Base.metadata.sorted_tables]

    logger.info("Tables to create: %s", tables)

    Base.metadata.create_all(engine)

    created = [t for t in tables if t not in existing]
    skipped = [t for t in tables if t in existing]

    if created:
        logger.info("Created tables: %s", created)
    if skipped:
        logger.info("Already exist (skipped): %s", skipped)

    logger.info("Done.")


if __name__ == "__main__":
    setup()
