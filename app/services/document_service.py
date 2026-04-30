"""
文档处理服务模块

负责文档上传、解析和存储
"""

import time
import uuid
from app.core.exceptions import DocumentException
from app.core.logging import logger
from app.utils.file_utils import validate_file_extension, validate_file_size, read_file_content


class DocumentService:
    """文档处理服务"""

    def __init__(self):
        # 内存存储（MVP 简化版，生产环境应使用数据库）
        self._documents: dict[str, str] = {}

    def get_document(self, document_id: str) -> str | None:
        """
        获取文档内容

        Args:
            document_id: 文档唯一标识

        Returns:
            文档文本内容，不存在则返回 None
        """
        return self._documents.get(document_id)

    def get_latest_document(self) -> str | None:
        """
        获取最新上传的文档内容

        Returns:
            最新文档的文本内容，无文档时返回 None
        """
        if not self._documents:
            return None
        # 返回最后一个插入的文档
        return list(self._documents.values())[-1]

    async def process_uploaded_file(self, file) -> dict:
        """
        处理上传的文件

        Args:
            file: FastAPI UploadFile 对象

        Returns:
            包含文档 ID、文件名、大小等信息的字典

        Raises:
            DocumentException: 文件处理失败时抛出
        """
        start_time = time.time()

        # 1. 验证文件
        validate_file_extension(file)
        validate_file_size(file)

        # 2. 读取文件内容
        content = await read_file_content(file)

        # 3. 生成文档 ID
        document_id = f"doc_{uuid.uuid4().hex[:12]}"

        # 4. 存储到内存
        self._documents[document_id] = content

        processing_time = round(time.time() - start_time, 2)

        logger.info(
            "文档处理完成",
            document_id=document_id,
            file_name=file.filename,
            content_length=len(content),
            processing_time=processing_time,
        )

        return {
            "document_id": document_id,
            "file_name": file.filename,
            "file_size": len(content.encode("utf-8")),
            "content_preview": content[:200],
            "processing_time": processing_time,
        }

    def process_text_content(self, text: str) -> dict:
        """
        处理直接提交的文本内容

        Args:
            text: 文本内容

        Returns:
            包含文档 ID 等信息的字典

        Raises:
            DocumentException: 文本为空时抛出
        """
        if not text or not text.strip():
            raise DocumentException(
                code=1003, message="文本内容不能为空", status_code=400
            )

        start_time = time.time()

        # 清理文本
        content = text.strip()

        # 生成文档 ID
        document_id = f"doc_{uuid.uuid4().hex[:12]}"

        # 存储到内存
        self._documents[document_id] = content

        processing_time = round(time.time() - start_time, 2)

        logger.info(
            "文本内容处理完成",
            document_id=document_id,
            content_length=len(content),
            processing_time=processing_time,
        )

        return {
            "document_id": document_id,
            "file_name": "direct_text_input.txt",
            "file_size": len(content.encode("utf-8")),
            "content_preview": content[:200],
            "processing_time": processing_time,
        }


# 全局服务实例
document_service = DocumentService()
