# 知识库问答系统 - 开发规范文档

> **版本**: v1.0.0  
> **最后更新**: 2026-04-22  
> **技术栈**: FastAPI + LangChain + ChromaDB + Python 3.10+  
> **适用范围**: 本文档是本项目 AI 编码的唯一事实来源，所有代码实现必须严格遵循本规范。

---

## 目录

- [1. 项目概述](#1-项目概述)
- [2. 技术栈版本锁定](#2-技术栈版本锁定)
- [3. 目录结构规范](#3-目录结构规范)
- [4. 命名规范](#4-命名规范)
- [5. API 契约规范](#5-api-契约规范)
- [6. 异常处理规范](#6-异常处理规范)
- [7. 数据模型规范](#7-数据模型规范)
- [8. 代码风格规范](#8-代码风格规范)
- [9. 配置管理规范](#9-配置管理规范)
- [10. 日志规范](#10-日志规范)
- [11. 测试规范](#11-测试规范)
- [12. 部署规范](#12-部署规范)

---

## 1. 项目概述

### 1.1 系统定位

最小化知识库问答系统（MVP），核心流程：

```
用户上传文本文件 → AI 解析并构建向量索引 → 用户提问 → 系统检索并生成回答
```

### 1.2 核心功能边界

| 功能模块 | 说明 | MVP 范围 |
|---------|------|---------|
| 文本上传 | 支持 TXT/PDF/DOCX 文件上传 | ✅ |
| 文档处理 | 文本分块、向量化、存储 | ✅ |
| 知识查询 | 基于 RAG 的智能问答 | ✅ |
| 用户管理 | 多用户权限、角色管理 | ❌ 暂不实现 |
| 知识库管理 | 多知识库、版本控制 | ❌ 暂不实现 |
| 对话历史 | 上下文记忆、多轮对话 | ❌ 暂不实现 |

### 1.3 架构原则

- **单一职责**: 每个模块仅负责一个核心功能
- **显式优于隐式**: 所有配置、依赖必须显式声明
- **失败快速**: 启动时校验所有必需配置，失败立即退出
- **可观测性**: 所有关键操作必须记录日志

---

## 2. 技术栈版本锁定

### 2.1 核心依赖

```toml
# pyproject.toml 或 requirements.txt

# Web 框架
fastapi==0.115.6
uvicorn[standard]==0.34.0
python-multipart==0.0.18

# AI/RAG 框架
langchain==0.3.14
langchain-openai==0.3.0
langchain-chroma==0.2.0
langchain-community==0.3.14

# 向量数据库
chromadb==0.5.23

# 数据处理
python-docx==1.1.2
pypdf==5.1.0
chardet==5.2.0

# 工具库
pydantic==2.10.4
pydantic-settings==2.7.1
python-dotenv==1.0.1
loguru==0.7.3

# 测试
pytest==8.3.4
pytest-asyncio==0.25.0
httpx==0.28.1
```

### 2.2 Python 版本要求

```
Python >= 3.10, < 3.13
```

**强制要求**: 使用类型注解，所有公共函数必须声明参数和返回值类型。

---

## 3. 目录结构规范

### 3.1 标准目录结构

```
knowledge-base-qa/
├── .env.example                    # 环境变量模板（提交到 Git）
├── .env                            # 本地环境变量（不提交到 Git）
├── .gitignore
├── pyproject.toml                  # 项目依赖配置
├── requirements.txt                # 依赖锁定文件
├── README.md
│
├── app/                            # 应用主目录
│   ├── __init__.py
│   ├── main.py                     # FastAPI 应用入口
│   ├── config.py                   # 配置管理
│   ├── dependencies.py             # FastAPI 依赖注入
│   │
│   ├── api/                        # API 路由层
│   │   ├── __init__.py
│   │   ├── router.py               # 路由聚合
│   │   ├── upload.py               # /upload 端点
│   │   └── query.py                # /query 端点
│   │
│   ├── schemas/                    # Pydantic 数据模型
│   │   ├── __init__.py
│   │   ├── upload.py               # 上传相关 Schema
│   │   ├── query.py                # 查询相关 Schema
│   │   └── common.py               # 通用 Schema（错误响应等）
│   │
│   ├── services/                   # 业务逻辑层
│   │   ├── __init__.py
│   │   ├── document_service.py     # 文档处理服务
│   │   ├── rag_service.py          # RAG 检索服务
│   │   └── vector_store_service.py # 向量存储服务
│   │
│   ├── core/                       # 核心组件
│   │   ├── __init__.py
│   │   ├── exceptions.py           # 自定义异常
│   │   ├── middleware.py           # 中间件
│   │   └── logging.py              # 日志配置
│   │
│   └── utils/                      # 工具函数
│       ├── __init__.py
│       ├── file_utils.py           # 文件处理工具
│       └── text_utils.py           # 文本处理工具
│
├── data/                           # 本地数据存储（不提交到 Git）
│   ├── chroma_db/                  # ChromaDB 持久化数据
│   └── uploads/                    # 上传文件临时存储
│
├── tests/                          # 测试目录
│   ├── __init__.py
│   ├── conftest.py                 # 测试 fixtures
│   ├── test_api/
│   │   ├── test_upload.py
│   │   └── test_query.py
│   ├── test_services/
│   │   ├── test_document_service.py
│   │   └── test_rag_service.py
│   └── test_utils/
│       ├── test_file_utils.py
│       └── test_text_utils.py
│
└── scripts/                        # 运维脚本
    ├── setup.sh                    # 环境初始化
    └── run.sh                      # 启动脚本
```

### 3.2 目录规则

| 规则 | 说明 |
|------|------|
| **单层职责** | 每个目录仅包含特定层级的代码 |
| **禁止跨层调用** | API 层不能直接调用 utils，必须通过 services |
| **__init__.py 必须存在** | 所有 Python 包目录必须包含 `__init__.py` |
| **data/ 不提交** | `.gitignore` 必须排除 `data/` 目录 |

---

## 4. 命名规范

### 4.1 Python 代码命名

| 元素类型 | 命名风格 | 示例 | 说明 |
|---------|---------|------|------|
| 变量名 | `snake_case` | `user_name`, `file_path` | 全小写，下划线分隔 |
| 函数名 | `snake_case` | `process_document()`, `get_query_result()` | 动词开头 |
| 类名 | `PascalCase` | `DocumentService`, `RagService` | 名词，首字母大写 |
| 常量 | `UPPER_SNAKE_CASE` | `MAX_FILE_SIZE`, `DEFAULT_CHUNK_SIZE` | 全大写，下划线分隔 |
| 私有变量/方法 | `_leading_underscore` | `_internal_cache`, `_validate_input()` | 单下划线前缀 |
| 模块名 | `snake_case` | `document_service.py`, `vector_store.py` | 全小写，下划线分隔 |
| 包名 | `snake_case` | `app.services`, `app.schemas` | 全小写，下划线分隔 |

### 4.2 API 路径命名

| 规则 | 示例 | 说明 |
|------|------|------|
| **全小写** | `/api/v1/upload` | 禁止大写 |
| **连字符分隔** | `/api/v1/knowledge-base` | 多单词使用 `-` 分隔 |
| **名词为主** | `/api/v1/documents`, `/api/v1/query` | 避免动词 |
| **版本前缀** | `/api/v1/...` | 必须包含版本号 |
| **尾部无斜杠** | `/api/v1/upload` ✅ vs `/api/v1/upload/` ❌ | 统一规范 |

### 4.3 JSON 字段命名

**强制规则**: 所有 API 请求和响应的 JSON 字段使用 `camelCase`。

```python
# ✅ 正确：Pydantic 模型使用 snake_case，自动转换为 camelCase
from pydantic import BaseModel, Field, ConfigDict

class QueryRequest(BaseModel):
    model_config = ConfigDict(alias_generator=lambda s: ''.join(
        word.capitalize() if i else word for i, word in enumerate(s.split('_'))
    ), populate_by_name=True)
    
    question: str = Field(..., description="用户问题")
    top_k: int = Field(default=3, description="检索文档数量")
    
# 实际 JSON 交互格式：
# {
#   "question": "什么是机器学习？",
#   "topK": 3
# }
```

**简化方案**（推荐 MVP 使用）：

```python
# MVP 阶段直接使用 camelCase 字段名
class QueryRequest(BaseModel):
    question: str
    topK: int = Field(default=3, alias="topK")
```

### 4.4 环境变量命名

```bash
# 格式：大写字母 + 下划线分隔
OPENAI_API_KEY=sk-xxx
CHROMA_DB_PATH=./data/chroma_db
MAX_FILE_SIZE_MB=10
LOG_LEVEL=INFO
```

---

## 5. API 契约规范

### 5.1 通用约定

| 项目 | 规范 |
|------|------|
| **基础路径** | `/api/v1` |
| **请求格式** | `application/json`（查询接口）/ `multipart/form-data`（上传接口） |
| **响应格式** | `application/json` |
| **字符编码** | `UTF-8` |
| **时间格式** | ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`) |

### 5.2 统一响应格式

**所有 API 响应必须遵循以下结构**:

```json
{
  "code": 0,
  "message": "success",
  "data": { ... }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `code` | `integer` | 业务状态码，`0` 表示成功，非 `0` 表示失败 |
| `message` | `string` | 提示信息，成功时返回 `"success"`，失败时返回错误描述 |
| `data` | `object` \| `null` | 响应数据，失败时为 `null` |

### 5.3 接口 1: 文档上传

#### 基本信息

```
POST /api/v1/upload
Content-Type: multipart/form-data
```

#### 请求参数

| 参数名 | 类型 | 必填 | 说明 | 约束 |
|--------|------|------|------|------|
| `file` | `File` | ✅ | 上传的文件 | 支持 `.txt`, `.pdf`, `.docx` |
| `chunkSize` | `integer` | ❌ | 文本分块大小 | 默认 `500`，范围 `[100, 2000]` |
| `chunkOverlap` | `integer` | ❌ | 分块重叠大小 | 默认 `50`，范围 `[0, 200]` |

#### 请求示例

```bash
curl -X POST "http://localhost:8000/api/v1/upload" \
  -F "file=@document.pdf" \
  -F "chunkSize=500" \
  -F "chunkOverlap=50"
```

#### 成功响应 (HTTP 200)

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "documentId": "doc_a1b2c3d4e5f6",
    "fileName": "product_manual.pdf",
    "fileSize": 245680,
    "chunkCount": 42,
    "processingTime": 3.25,
    "uploadedAt": "2026-04-22T10:30:00.000Z"
  }
}
```

#### 失败响应示例

```json
{
  "code": 1001,
  "message": "不支持的文件类型，仅支持 .txt, .pdf, .docx",
  "data": null
}
```

#### 错误码定义

| HTTP 状态码 | code | message | 触发场景 |
|------------|------|---------|---------|
| 400 | 1001 | 不支持的文件类型 | 文件扩展名不在白名单 |
| 400 | 1002 | 文件大小超出限制 | 文件超过 `MAX_FILE_SIZE_MB` |
| 400 | 1003 | 文件内容为空 | 上传的文件无有效内容 |
| 400 | 1004 | 参数校验失败 | chunkSize/chunkOverlap 超出范围 |
| 413 | 1005 | 请求体过大 | 超过服务器限制 |
| 422 | 1006 | 文件格式错误 | 文件扩展名与实际内容不匹配 |
| 500 | 1007 | 文档处理失败 | 内部处理异常 |

---

### 5.4 接口 2: 知识查询

#### 基本信息

```
POST /api/v1/query
Content-Type: application/json
```

#### 请求参数

| 参数名 | 类型 | 必填 | 说明 | 约束 |
|--------|------|------|------|------|
| `question` | `string` | ✅ | 用户问题 | 长度 `[1, 2000]` 字符 |
| `topK` | `integer` | ❌ | 检索相似文档数量 | 默认 `3`，范围 `[1, 10]` |
| `minScore` | `number` | ❌ | 最低相似度阈值 | 默认 `0.7`，范围 `[0.0, 1.0]` |

#### 请求示例

```json
{
  "question": "如何重置系统密码？",
  "topK": 3,
  "minScore": 0.75
}
```

#### 成功响应 (HTTP 200)

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "queryId": "qry_x9y8z7w6v5u4",
    "answer": "重置系统密码的步骤如下：\n1. 登录管理后台...\n2. 进入用户管理...",
    "sources": [
      {
        "documentId": "doc_a1b2c3d4e5f6",
        "fileName": "product_manual.pdf",
        "content": "系统密码重置流程：管理员登录后台后...",
        "score": 0.92,
        "chunkIndex": 15
      },
      {
        "documentId": "doc_b2c3d4e5f6g7",
        "fileName": "faq.txt",
        "content": "Q: 忘记密码怎么办？A: 联系管理员重置...",
        "score": 0.85,
        "chunkIndex": 8
      }
    ],
    "processingTime": 1.87,
    "timestamp": "2026-04-22T10:35:00.000Z"
  }
}
```

#### 失败响应示例

```json
{
  "code": 2001,
  "message": "问题不能为空",
  "data": null
}
```

#### 错误码定义

| HTTP 状态码 | code | message | 触发场景 |
|------------|------|---------|---------|
| 400 | 2001 | 问题不能为空 | question 字段为空字符串 |
| 400 | 2002 | 问题长度超出限制 | question 超过 2000 字符 |
| 400 | 2003 | topK 参数超出范围 | topK < 1 或 topK > 10 |
| 400 | 2004 | minScore 参数超出范围 | minScore < 0 或 minScore > 1 |
| 404 | 2005 | 知识库为空 | 未上传任何文档时查询 |
| 500 | 2006 | 查询处理失败 | LLM 调用失败或向量检索异常 |
| 503 | 2007 | AI 服务不可用 | OpenAI/其他 LLM 服务超时或不可达 |

---

### 5.5 接口 3: 健康检查

#### 基本信息

```
GET /api/v1/health
```

#### 成功响应 (HTTP 200)

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "vectorStoreStatus": "connected",
    "llmServiceStatus": "available",
    "timestamp": "2026-04-22T10:00:00.000Z"
  }
}
```

---

## 6. 异常处理规范

### 6.1 自定义异常体系

```python
# app/core/exceptions.py

from typing import Any, Optional

class AppException(Exception):
    """应用基础异常"""
    def __init__(
        self,
        code: int,
        message: str,
        status_code: int = 500,
        details: Optional[dict[str, Any]] = None
    ):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(self.message)


class DocumentException(AppException):
    """文档处理异常 (code: 1000-1999)"""
    pass


class QueryException(AppException):
    """查询处理异常 (code: 2000-2999)"""
    pass


class VectorStoreException(AppException):
    """向量存储异常 (code: 3000-3999)"""
    pass


class LLMServiceException(AppException):
    """LLM 服务异常 (code: 4000-4999)"""
    pass
```

### 6.2 异常抛出示例

```python
# ✅ 正确：使用自定义异常
from app.core.exceptions import DocumentException

def validate_file(file) -> None:
    if file.size > MAX_FILE_SIZE:
        raise DocumentException(
            code=1002,
            message=f"文件大小超出限制，最大允许 {MAX_FILE_SIZE_MB}MB",
            status_code=400
        )
    
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise DocumentException(
            code=1001,
            message="不支持的文件类型，仅支持 .txt, .pdf, .docx",
            status_code=400
        )
```

### 6.3 全局异常处理器

```python
# app/main.py

from fastapi import Request
from fastapi.responses import JSONResponse
from app.core.exceptions import AppException

@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    """统一异常响应处理器"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "code": exc.code,
            "message": exc.message,
            "data": None
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """未知异常兜底处理器"""
    logger.error(f"未捕获异常: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "code": 9999,
            "message": "服务器内部错误",
            "data": None
        }
    )
```

### 6.4 错误码分配表

| 错误码范围 | 模块 | 说明 |
|-----------|------|------|
| 0 | 成功 | 操作成功 |
| 1000-1999 | 文档上传模块 | 文件校验、解析、分块异常 |
| 2000-2999 | 知识查询模块 | 查询参数、检索、生成异常 |
| 3000-3999 | 向量存储模块 | ChromaDB 连接、读写异常 |
| 4000-4999 | LLM 服务模块 | OpenAI/其他模型调用异常 |
| 9000-9999 | 系统级错误 | 未知错误、兜底错误 |

---

## 7. 数据模型规范

### 7.1 Pydantic Schema 定义规范

#### 上传相关 Schema

```python
# app/schemas/upload.py

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class UploadResponse(BaseModel):
    """文档上传成功响应"""
    document_id: str = Field(..., description="文档唯一标识")
    file_name: str = Field(..., description="原始文件名")
    file_size: int = Field(..., description="文件大小（字节）")
    chunk_count: int = Field(..., description="分块数量")
    processing_time: float = Field(..., description="处理耗时（秒）")
    uploaded_at: datetime = Field(..., description="上传时间")

    class Config:
        json_schema_extra = {
            "example": {
                "documentId": "doc_a1b2c3d4e5f6",
                "fileName": "product_manual.pdf",
                "fileSize": 245680,
                "chunkCount": 42,
                "processingTime": 3.25,
                "uploadedAt": "2026-04-22T10:30:00.000Z"
            }
        }
```

#### 查询相关 Schema

```python
# app/schemas/query.py

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class QueryRequest(BaseModel):
    """知识查询请求"""
    question: str = Field(..., min_length=1, max_length=2000, description="用户问题")
    top_k: int = Field(default=3, ge=1, le=10, description="检索文档数量")
    min_score: float = Field(default=0.7, ge=0.0, le=1.0, description="最低相似度阈值")

    class Config:
        alias_generator = lambda s: ''.join(
            word.capitalize() if i else word for i, word in enumerate(s.split('_'))
        )
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "question": "如何重置系统密码？",
                "topK": 3,
                "minScore": 0.75
            }
        }


class SourceDocument(BaseModel):
    """来源文档"""
    document_id: str = Field(..., description="文档 ID")
    file_name: str = Field(..., description="文件名")
    content: str = Field(..., description="文本片段内容")
    score: float = Field(..., description="相似度分数")
    chunk_index: int = Field(..., description="分块索引")

    class Config:
        alias_generator = lambda s: ''.join(
            word.capitalize() if i else word for i, word in enumerate(s.split('_'))
        )
        populate_by_name = True


class QueryResponse(BaseModel):
    """知识查询成功响应"""
    query_id: str = Field(..., description="查询唯一标识")
    answer: str = Field(..., description="AI 生成的回答")
    sources: list[SourceDocument] = Field(..., description="参考来源文档")
    processing_time: float = Field(..., description="处理耗时（秒）")
    timestamp: datetime = Field(..., description="查询时间")

    class Config:
        alias_generator = lambda s: ''.join(
            word.capitalize() if i else word for i, word in enumerate(s.split('_'))
        )
        populate_by_name = True
```

#### 通用 Schema

```python
# app/schemas/common.py

from pydantic import BaseModel, Field
from typing import Any, Optional

class ApiResponse(BaseModel):
    """统一 API 响应"""
    code: int = Field(..., description="业务状态码")
    message: str = Field(..., description="提示信息")
    data: Optional[Any] = Field(None, description="响应数据")

    class Config:
        json_schema_extra = {
            "example": {
                "code": 0,
                "message": "success",
                "data": {}
            }
        }


class ErrorResponse(BaseModel):
    """错误响应"""
    code: int = Field(..., description="错误码")
    message: str = Field(..., description="错误描述")
    data: None = Field(None, description="错误时固定为 null")
```

### 7.2 数据库模型（如需要扩展）

MVP 阶段不使用关系型数据库，所有状态存储在 ChromaDB 的 metadata 中。

```python
# ChromaDB metadata 结构规范
document_metadata = {
    "document_id": "doc_a1b2c3d4e5f6",
    "file_name": "product_manual.pdf",
    "file_size": 245680,
    "chunk_index": 15,
    "total_chunks": 42,
    "uploaded_at": "2026-04-22T10:30:00.000Z"
}
```

---

## 8. 代码风格规范

### 8.1 格式化工具

**强制使用以下工具链**:

```toml
# pyproject.toml

[tool.black]
line-length = 100
target-version = ['py310']

[tool.isort]
profile = "black"
line_length = 100

[tool.ruff]
line-length = 100
select = ["E", "F", "W", "I"]
```

### 8.2 代码格式化规则

| 规则 | 说明 |
|------|------|
| **缩进** | 4 个空格，禁止使用 Tab |
| **行长度** | 最大 100 字符 |
| **引号** | 优先使用双引号 `"` |
| **空行** | 函数间 2 空行，类方法间 1 空行 |
| **导入顺序** | 标准库 → 第三方库 → 本地模块，每组间空一行 |

### 8.3 类型注解强制要求

```python
# ✅ 正确：完整类型注解
from typing import Optional

def process_document(
    file_path: str,
    chunk_size: int = 500,
    chunk_overlap: int = 50
) -> dict[str, int]:
    """
    处理文档并返回统计信息
    
    Args:
        file_path: 文件路径
        chunk_size: 分块大小
        chunk_overlap: 重叠大小
    
    Returns:
        包含 chunk_count 和 processing_time 的字典
    """
    ...


# ❌ 错误：缺少类型注解
def process_document(file_path, chunk_size=500, chunk_overlap=50):
    ...
```

### 8.4 函数设计规范

| 规则 | 说明 | 示例 |
|------|------|------|
| **单一职责** | 一个函数只做一件事 | 分离文件读取和文本分块 |
| **参数数量** | 不超过 5 个，超过则使用数据类 | 使用 Pydantic 模型封装参数 |
| **返回值** | 明确返回类型，不使用隐式 None | 返回 `Optional[dict]` 而非 `dict` |
| **错误处理** | 使用异常而非返回错误码 | raise AppException 而非 return -1 |

### 8.5 注释规范

```python
# 文件头注释
"""
文档处理服务模块

负责文档上传、解析、分块和向量化
"""

# 函数注释（Google 风格）
def split_text(text: str, chunk_size: int) -> list[str]:
    """
    将文本分割为指定大小的块
    
    Args:
        text: 待分割的文本内容
        chunk_size: 每个块的最大字符数
    
    Returns:
        文本块列表
    
    Raises:
        ValueError: 当 chunk_size 小于 1 时
    """
    ...

# 行内注释
max_chunks = 100  # 限制单个文档的最大分块数

# TODO 注释
# TODO(zhangsan): 支持更多文件格式，优先级 P2
```

---

## 9. 配置管理规范

### 9.1 环境变量管理

```python
# app/config.py

from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    """应用配置"""
    
    # OpenAI 配置
    openai_api_key: str
    openai_model: str = "gpt-4o-mini"
    embedding_model: str = "text-embedding-ada-002"
    
    # ChromaDB 配置
    chroma_db_path: str = "./data/chroma_db"
    chroma_collection_name: str = "knowledge_base"
    
    # 文件上传配置
    upload_dir: str = "./data/uploads"
    max_file_size_mb: int = 10
    allowed_extensions: list[str] = [".txt", ".pdf", ".docx"]
    
    # RAG 配置
    default_chunk_size: int = 500
    default_chunk_overlap: int = 50
    default_top_k: int = 3
    default_min_score: float = 0.7
    
    # 服务配置
    app_name: str = "Knowledge Base QA System"
    app_version: str = "1.0.0"
    debug: bool = False
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

# 全局配置实例
settings = Settings()
```

### 9.2 .env.example 模板

```bash
# .env.example

# OpenAI API 配置（必填）
OPENAI_API_KEY=sk-your-api-key-here

# 模型配置
OPENAI_MODEL=gpt-4o-mini
EMBEDDING_MODEL=text-embedding-ada-002

# ChromaDB 配置
CHROMA_DB_PATH=./data/chroma_db
CHROMA_COLLECTION_NAME=knowledge_base

# 文件上传配置
UPLOAD_DIR=./data/uploads
MAX_FILE_SIZE_MB=10

# 服务配置
LOG_LEVEL=INFO
DEBUG=false
```

### 9.3 配置加载规则

| 规则 | 说明 |
|------|------|
| **启动时校验** | 应用启动时检查所有必填配置，失败立即退出 |
| **敏感信息** | API Key 等敏感信息必须通过环境变量注入，禁止硬编码 |
| **默认值** | 非必需配置必须提供合理默认值 |
| **类型安全** | 所有配置使用 Pydantic 类型校验 |

---

## 10. 日志规范

### 10.1 日志级别使用

| 级别 | 使用场景 | 示例 |
|------|---------|------|
| `DEBUG` | 调试信息，仅开发环境 | 变量值、中间状态 |
| `INFO` | 关键业务流程节点 | 文档上传成功、查询完成 |
| `WARNING` | 可恢复的异常 | 文件过大但已自动截断 |
| `ERROR` | 不可恢复的错误 | LLM 调用失败、数据库连接断开 |
| `CRITICAL` | 系统级故障 | 配置缺失、服务无法启动 |

### 10.2 日志格式

```python
# app/core/logging.py

from loguru import logger
import sys

def setup_logging(debug: bool = False):
    """配置日志"""
    level = "DEBUG" if debug else "INFO"
    
    # 移除默认 handler
    logger.remove()
    
    # 控制台输出
    logger.add(
        sys.stderr,
        level=level,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>"
    )
    
    # 文件输出（按天轮转）
    logger.add(
        "logs/app_{time:YYYY-MM-DD}.log",
        rotation="00:00",
        retention="30 days",
        compression="zip",
        level="INFO"
    )

# 使用示例
logger.info("文档上传成功", document_id="doc_123", file_name="manual.pdf")
logger.error("LLM 调用失败", error=str(exc), question="如何重置密码？")
```

### 10.3 日志记录规范

```python
# ✅ 正确：结构化日志
logger.info(
    "文档处理完成",
    document_id=doc_id,
    file_name=file_name,
    chunk_count=chunk_count,
    processing_time=processing_time
)

# ✅ 正确：异常日志包含上下文
logger.error(
    "查询处理失败",
    error=str(exc),
    question=question,
    top_k=top_k
)

# ❌ 错误：信息不足
logger.error("出错了")

# ❌ 错误：敏感信息入日志
logger.info(f"用户使用 API Key: {api_key}")
```

---

## 11. 测试规范

### 11.1 测试目录组织

```
tests/
├── conftest.py              # 全局 fixtures
├── test_api/                # API 层测试
│   ├── test_upload.py
│   └── test_query.py
├── test_services/           # 服务层测试
│   ├── test_document_service.py
│   └── test_rag_service.py
└── test_utils/              # 工具函数测试
    ├── test_file_utils.py
    └── test_text_utils.py
```

### 11.2 测试命名规范

```python
# 格式：test_<被测函数>_<测试场景>_<期望结果>

def test_validate_file_valid_extension_returns_true():
    """测试有效文件扩展名返回 True"""
    ...

def test_validate_file_invalid_extension_raises_exception():
    """测试无效文件扩展名抛出异常"""
    ...

def test_query_with_empty_question_returns_error():
    """测试空问题返回错误"""
    ...
```

### 11.3 测试覆盖率要求

| 模块 | 最低覆盖率 |
|------|---------|
| services/ | 80% |
| utils/ | 90% |
| api/ | 70% |
| **总体** | **75%** |

### 11.4 测试示例

```python
# tests/test_services/test_document_service.py

import pytest
from app.services.document_service import DocumentService
from app.core.exceptions import DocumentException

class TestDocumentService:
    """文档服务测试"""
    
    def test_process_txt_file_success(self, sample_txt_file):
        """测试处理 TXT 文件成功"""
        service = DocumentService()
        result = service.process_document(sample_txt_file)
        
        assert result["document_id"] is not None
        assert result["chunk_count"] > 0
        assert result["processing_time"] > 0
    
    def test_process_file_exceeds_size_raises_exception(self, large_file):
        """测试文件大小超出限制抛出异常"""
        service = DocumentService()
        
        with pytest.raises(DocumentException) as exc_info:
            service.process_document(large_file)
        
        assert exc_info.value.code == 1002
        assert "文件大小超出限制" in exc_info.value.message
```

---

## 12. 部署规范

### 12.1 本地开发启动

```bash
# 1. 安装依赖
pip install -r requirements.txt

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 填入 OPENAI_API_KEY

# 3. 启动开发服务器
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 4. 访问 API 文档
# http://localhost:8000/docs (Swagger UI)
# http://localhost:8000/redoc (ReDoc)
```

### 12.2 Docker 部署

```dockerfile
# Dockerfile

FROM python:3.11-slim

WORKDIR /app

# 安装依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制代码
COPY ./app ./app

# 创建数据目录
RUN mkdir -p /app/data/chroma_db /app/data/uploads

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

```yaml
# docker-compose.yml

version: '3.8'

services:
  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - CHROMA_DB_PATH=/app/data/chroma_db
      - LOG_LEVEL=INFO
    volumes:
      - ./data:/app/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/v1/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### 12.3 生产环境检查清单

- [ ] 环境变量已配置（OPENAI_API_KEY 等）
- [ ] `.env` 文件未提交到 Git
- [ ] 日志级别设置为 `INFO` 或 `WARNING`
- [ ] `DEBUG=false`
- [ ] Docker 健康检查已配置
- [ ] 数据目录已持久化（volume 挂载）
- [ ] API 文档端点已禁用或加保护（`/docs`, `/redoc`, `/openapi.json`）
- [ ] CORS 配置已限制允许的域名
- [ ] 请求限流已配置（防止滥用）
- [ ] 备份策略已制定（ChromaDB 数据定期备份）

---

## 附录 A：快速参考卡片

### API 端点速查

| 方法 | 路径 | 说明 | 状态码 |
|------|------|------|--------|
| POST | `/api/v1/upload` | 上传文档 | 200/400/500 |
| POST | `/api/v1/query` | 知识查询 | 200/400/404/500/503 |
| GET | `/api/v1/health` | 健康检查 | 200 |
| GET | `/docs` | API 文档 | 200 |

### 错误码速查

| Code | 含义 | HTTP 状态码 |
|------|------|------------|
| 0 | 成功 | 200 |
| 1001-1007 | 文档上传错误 | 400/413/422/500 |
| 2001-2007 | 知识查询错误 | 400/404/500/503 |
| 9999 | 未知错误 | 500 |

---

## 附录 B：常见问题排查

### 问题 1：ChromaDB 连接失败

```
错误信息：ConnectionError: Failed to connect to ChromaDB
排查步骤：
1. 检查 chroma_db_path 配置是否正确
2. 确认目录权限（读写权限）
3. 删除 data/chroma_db 目录重新启动
```

### 问题 2：OpenAI API 调用超时

```
错误信息：TimeoutError: Request timed out
排查步骤：
1. 检查网络连接和代理配置
2. 验证 OPENAI_API_KEY 是否有效
3. 增加 timeout 参数（默认 30s）
```

---

**文档维护**: 本规范文档由架构团队维护，任何修改需经过团队评审。  
**生效日期**: 2026-04-22  
**下次复审日期**: 2026-05-22
