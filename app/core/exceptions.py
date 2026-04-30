"""
自定义异常模块

定义所有业务异常类型
"""

from typing import Optional


class AppException(Exception):
    """应用基础异常"""

    def __init__(
        self,
        code: int,
        message: str,
        status_code: int = 500,
    ):
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class DocumentException(AppException):
    """文档处理异常 (code: 1000-1999)"""

    pass


class QueryException(AppException):
    """查询处理异常 (code: 2000-2999)"""

    pass


class LLMServiceException(AppException):
    """LLM 服务异常 (code: 4000-4999)"""

    pass
