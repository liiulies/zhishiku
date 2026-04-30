"""
应用配置管理模块

负责加载和校验所有环境变量
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """应用配置"""

    # LLM 配置（DeepSeek，兼容 OpenAI SDK）
    openai_api_key: str  # DeepSeek API Key
    openai_model: str = "deepseek-chat"  # DeepSeek 模型
    openai_base_url: str = "https://api.deepseek.com/v1"  # DeepSeek API 地址

    # Embedding 配置（阿里云 DashScope）
    dashscope_api_key: str = ""  # 阿里云 API Key（可选，MVP 暂不使用）
    embedding_model: str = "text-embedding-v3"  # 阿里云 Embedding 模型
    embedding_base_url: str = "https://dashscope.aliyuncs.com/api/v1"  # 阿里云 API 地址

    # 服务配置
    app_name: str = "Knowledge Base QA System"
    app_version: str = "1.0.0"
    debug: bool = False
    log_level: str = "INFO"

    # 文件上传配置
    max_file_size_mb: int = 10
    allowed_extensions: str = ".txt,.pdf,.docx"

    # RAG 配置（简化版暂不使用）
    default_chunk_size: int = 500
    default_chunk_overlap: int = 50
    default_top_k: int = 3
    default_min_score: float = 0.7

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# 全局配置实例
settings = Settings()
