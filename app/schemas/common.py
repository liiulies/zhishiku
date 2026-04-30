"""
通用 Schema 模块

定义统一响应格式
"""

from pydantic import BaseModel, Field
from typing import Any, Optional


class ApiResponse(BaseModel):
    """统一 API 响应"""

    code: int = Field(..., description="业务状态码")
    message: str = Field(..., description="提示信息")
    data: Optional[Any] = Field(None, description="响应数据")

    class Config:
        json_schema_extra = {
            "example": {"code": 0, "message": "success", "data": {}}
        }
