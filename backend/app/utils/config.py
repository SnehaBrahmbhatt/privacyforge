from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Supabase
    supabase_url: str = ""
    supabase_service_key: str = ""

    # App
    app_env: str = "development"
    log_level: str = "INFO"

    # CORS — comma-separated list of allowed origins
    allowed_origins: str = "*"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",          # Ignore unknown env vars — prevents startup crash
    )

    @property
    def origins_list(self) -> list[str]:
        """Parse allowed_origins into a list."""
        if self.allowed_origins == "*":
            return ["*"]
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


settings = Settings()