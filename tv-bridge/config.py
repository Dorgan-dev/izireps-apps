import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    PORT = int(os.environ.get("PORT", 8888))
    HOST = os.environ.get("HOST", "0.0.0.0")
    API_KEY = os.environ.get("API_KEY", "your-secret-key-here")
    TOKENS_DIR = os.environ.get("TOKENS_DIR", "./tokens")

    @classmethod
    def init_app(cls):
        os.makedirs(cls.TOKENS_DIR, exist_ok=True)

config = Config()
