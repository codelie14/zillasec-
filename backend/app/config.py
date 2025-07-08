import os
from pydantic_settings import BaseSettings, SettingsConfigDict

# Build the path to the .env file relative to this config file
# __file__ is the path to the current file (config.py)
# os.path.dirname(__file__) is the directory of the current file (app/)
# os.path.join(..., '.env') creates the full path to backend/app/.env
env_path = os.path.join(os.path.dirname(__file__), '.env')

class Settings(BaseSettings):
    OPENROUTER_API_KEY: str
    MAX_AI_INPUT_ROWS: int = 200 # Reduced default value for AI input rows

    model_config = SettingsConfigDict(
        env_file=env_path, 
        env_file_encoding='utf-8', 
        extra='ignore'
    )

# Create a single instance of the settings to be used throughout the app
settings = Settings()