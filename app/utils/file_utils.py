"""
工具函数模块

提供文件处理相关的辅助函数
"""

import os
from fastapi import UploadFile
from app.config import settings
from app.core.exceptions import DocumentException


def validate_file_extension(file: UploadFile) -> None:
    """
    验证文件扩展名是否在允许列表中

    Args:
        file: 上传的文件对象

    Raises:
        DocumentException: 文件类型不支持时抛出
    """
    if not file.filename:
        raise DocumentException(
            code=1001, message="文件名不能为空", status_code=400
        )

    # 获取文件扩展名
    _, ext = os.path.splitext(file.filename)
    ext = ext.lower()

    # 检查是否在允许列表中
    allowed_exts = [
        e.strip() for e in settings.allowed_extensions.split(",")
    ]

    if ext not in allowed_exts:
        raise DocumentException(
            code=1001,
            message=f"不支持的文件类型，仅支持 {', '.join(allowed_exts)}",
            status_code=400,
        )


def validate_file_size(file: UploadFile) -> None:
    """
    验证文件大小是否在限制范围内

    Args:
        file: 上传的文件对象

    Raises:
        DocumentException: 文件大小超出限制时抛出
    """
    # 读取文件内容以检查大小
    content = file.file.read()
    file_size = len(content)
    max_size = settings.max_file_size_mb * 1024 * 1024

    if file_size > max_size:
        raise DocumentException(
            code=1002,
            message=f"文件大小超出限制，最大允许 {settings.max_file_size_mb}MB",
            status_code=400,
        )

    # 重置文件指针
    file.file.seek(0)


async def read_file_content(file: UploadFile) -> str:
    """
    读取文件内容

    Args:
        file: 上传的文件对象

    Returns:
        文件文本内容

    Raises:
        DocumentException: 文件读取失败时抛出
    """
    try:
        content = await file.read()

        # 尝试解码
        try:
            text = content.decode("utf-8")
        except UnicodeDecodeError:
            # 使用 chardet 自动检测编码
            import chardet

            detected = chardet.detect(content)
            encoding = detected.get("encoding", "utf-8")
            text = content.decode(encoding, errors="ignore")

        if not text.strip():
            raise DocumentException(
                code=1003, message="文件内容为空", status_code=400
            )

        return text.strip()

    except DocumentException:
        raise
    except Exception as e:
        raise DocumentException(
            code=1007, message=f"文件读取失败: {str(e)}", status_code=500
        )
