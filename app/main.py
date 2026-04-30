"""
FastAPI 应用入口

应用启动和配置
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.core.logging import setup_logging, logger
from app.core.exceptions import AppException
from app.api.router import api_router


# 初始化日志
setup_logging()

# 创建 FastAPI 应用
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="最小化知识库问答系统 MVP - 基于 FastAPI + LangChain",
    docs_url="/docs",
    redoc_url="/redoc",
)

# 配置 CORS（开发环境允许所有来源）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应限制具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(api_router)


# 全局异常处理器
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    """统一异常响应处理器"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"code": exc.code, "message": exc.message, "data": None},
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """未知异常兜底处理器"""
    logger.error(f"未捕获异常: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"code": 9999, "message": "服务器内部错误", "data": None},
    )


# 健康检查接口
@app.get("/api/v1/health", tags=["系统"])
async def health_check():
    """健康检查"""
    return {
        "code": 0,
        "message": "success",
        "data": {
            "status": "healthy",
            "version": settings.app_version,
            "app_name": settings.app_name,
        },
    }


# 应用启动事件
@app.on_event("startup")
async def startup_event():
    """应用启动时执行"""
    logger.info(f"{settings.app_name} v{settings.app_version} 启动成功")
    logger.info(f"API 文档: http://localhost:8000/docs")


@app.on_event("shutdown")
async def shutdown_event():
    """应用关闭时执行"""
    logger.info("应用关闭")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level=settings.log_level.lower(),
    )
