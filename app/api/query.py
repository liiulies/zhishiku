"""
查询 API 路由模块

处理知识查询相关请求
"""

from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone

from app.schemas.common import ApiResponse
from app.schemas.query import QueryRequest, QueryResponse
from app.services.rag_service import rag_service
from app.core.exceptions import AppException
from app.core.logging import logger

router = APIRouter(prefix="/api/v1", tags=["知识查询"])


@router.post(
    "/query",
    response_model=ApiResponse,
    summary="知识查询",
    description="基于已上传的文档内容回答用户问题",
)
async def query_knowledge(request: QueryRequest):
    """
    知识查询接口

    基于最近一次上传的文档内容，使用 LLM 回答用户问题
    """
    try:
        result = await rag_service.query(question=request.question)

        response_data = QueryResponse(
            query_id=result["query_id"],
            answer=result["answer"],
            context_length=result["context_length"],
            processing_time=result["processing_time"],
            timestamp=datetime.now(timezone.utc),
        )

        return ApiResponse(code=0, message="success", data=response_data)

    except AppException as e:
        logger.warning(f"查询失败: {e.message}")
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        logger.error(f"未知错误: {e}")
        raise HTTPException(status_code=500, detail="服务器内部错误")
