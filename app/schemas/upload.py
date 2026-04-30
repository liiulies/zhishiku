"""
上传相关 Schema 模块

定义文档上传的请求和响应数据模型
"""

from pydantic import BaseModel, Field
from datetime import datetime


def to_camel(string: str) -> str:
    """将 snake_case 转换为 camelCase"""
    components = string.split("_")
    return components[0] + "".join(x.title() for x in components[1:])


class UploadResponse(BaseModel):
    """文档上传成功响应"""

    document_id: str = Field(..., description="文档唯一标识")
    file_name: str = Field(..., description="原始文件名")
    file_size: int = Field(..., description="文件大小（字节）")
    content_preview: str = Field(..., description="内容预览（前200字符）")
    processing_time: float = Field(..., description="处理耗时（秒）")
    uploaded_at: datetime = Field(..., description="上传时间")

    class Config:
        alias_generator = to_camel
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "documentId": "doc_a1b2c3d4e5f6",
                "fileName": "knowledge_base.txt",
                "fileSize": 2456,
                "contentPreview": "这是一个知识库文档，包含了...",
                "processingTime": 0.15,
                "uploadedAt": "2026-04-22T10:30:00.000Z",
            }
        }
