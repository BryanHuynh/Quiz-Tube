import os
from dotenv import load_dotenv
load_dotenv()

DEFAULT_QUIZ_LIMIT = 10

DATABASE_URL = os.getenv("DATABASE_URL", "")
