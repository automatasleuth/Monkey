"""Defines constants."""

import os
import dotenv

dotenv.load_dotenv()

AGENT_NAME = "monkey"
DESCRIPTION = "A web crawler agent using Selenium and Google ADK"
PROJECT = os.getenv("GOOGLE_CLOUD_PROJECT", "")
LOCATION = os.getenv("GOOGLE_CLOUD_LOCATION", "global")
MODEL = os.getenv("MODEL", "gemini-2.0-flash-001")
DISABLE_WEB_DRIVER = int(os.getenv("DISABLE_WEB_DRIVER", 0)) 