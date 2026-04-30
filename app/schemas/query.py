"""
查询相关 Schema 模块

定义知识查询的请求和响应数据模型
"""

from pydantic import BaseModel, Field
from datetime import datetime


def to_camel(string: str) -> str:
    """将 snake_case 转换为 camelCase"""
    components = string.split("_")
    return components[0] + "".join(x.title() for x in components[1:])


class QueryRequest(BaseModel):
    """知识查询请求"""

    question: str = Field(
        ..., min_length=1, max_length=2000, description="用户问题"
    )

    class Config:
        alias_generator = to_camel
        populate_by_name = True
        json_schema_extra = {"example": {"question": "文档中提到的主要内容是什么？"}}


class QueryResponse(BaseModel):
    """知识查询成功响应"""

    query_id: str = Field(..., description="查询唯一标识")
    answer: str = Field(..., description="AI 生成的回答")
    context_length: int = Field(..., description="上下文长度（字符数）")
    processing_time: float = Field(..., description="处理耗时（秒）")
    timestamp: datetime = Field(..., description="查询时间")

    class Config:
        alias_generator = to_camel
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "queryId": "qry_x9y8z7w6v5u4",
                "answer": "根据文档内容，主要提到了...",
                "contextLength": 1500,
                "processingTime": 2.35,
                "timestamp": "2026-04-22T10:35:00.000Z",
            }
        }
