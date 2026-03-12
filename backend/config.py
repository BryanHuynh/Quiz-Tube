import os
from dotenv import load_dotenv
load_dotenv()

DEFAULT_QUIZ_LIMIT = 10

DATABASE_URL = os.getenv("DATABASE_URL", "")

PROXY_USERNAME = os.getenv("PROXY_USERNAME")
PROXY_PASSWORD = os.getenv("PROXY_PASSWORD")
PROXY_URL = os.getenv("PROXY_URL")
