"""
上传 API 路由模块

处理文档上传相关请求
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from datetime import datetime, timezone

from app.schemas.common import ApiResponse
from app.schemas.upload import UploadResponse
from app.services.document_service import document_service
from app.core.exceptions import AppException
from app.core.logging import logger

router = APIRouter(prefix="/api/v1", tags=["文档上传"])


@router.post(
    "/upload",
    response_model=ApiResponse,
    summary="上传文档",
    description="上传 TXT 文件作为知识库内容",
)
async def upload_document(
    file: UploadFile = File(..., description="上传的文件"),
):
    """
    上传文档接口

    支持直接上传 TXT 文件，系统会自动读取并存储内容
    """
    try:
        result = await document_service.process_uploaded_file(file)

        response_data = UploadResponse(
            document_id=result["document_id"],
            file_name=result["file_name"],
            file_size=result["file_size"],
            content_preview=result["content_preview"],
            processing_time=result["processing_time"],
            uploaded_at=datetime.now(timezone.utc),
        )

        return ApiResponse(code=0, message="success", data=response_data)

    except AppException as e:
        logger.warning(f"文档上传失败: {e.message}")
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        logger.error(f"未知错误: {e}")
        raise HTTPException(status_code=500, detail="服务器内部错误")


@router.post(
    "/upload-text",
    response_model=ApiResponse,
    summary="提交文本内容",
    description="直接提交文本字符串作为知识库内容",
)
async def upload_text_content(
    text: str = Form(..., description="文本内容", min_length=1),
):
    """
    文本内容提交接口

    用户可以直接提交文本字符串，无需上传文件
    """
    try:
        result = document_service.process_text_content(text)

        response_data = UploadResponse(
            document_id=result["document_id"],
            file_name=result["file_name"],
            file_size=result["file_size"],
            content_preview=result["content_preview"],
            processing_time=result["processing_time"],
            uploaded_at=datetime.now(timezone.utc),
        )

        return ApiResponse(code=0, message="success", data=response_data)

    except AppException as e:
        logger.warning(f"文本提交失败: {e.message}")
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        logger.error(f"未知错误: {e}")
        raise HTTPException(status_code=500, detail="服务器内部错误")
