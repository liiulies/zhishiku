"""
日志配置模块

提供结构化日志输出
"""

from loguru import logger
import sys
from app.config import settings


def setup_logging():
    """配置日志"""
    level = settings.log_level

    # 移除默认 handler
    logger.remove()

    # 控制台输出
    logger.add(
        sys.stderr,
        level=level,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
    )

    # 文件输出（按天轮转）
    logger.add(
        "logs/app_{time:YYYY-MM-DD}.log",
        rotation="00:00",
        retention="7 days",
        compression="zip",
        level="INFO",
    )


# 导出 logger 实例
__all__ = ["logger", "setup_logging"]
