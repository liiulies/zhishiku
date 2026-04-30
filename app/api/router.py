"""
路由聚合模块

统一管理所有 API 路由
"""

from fastapi import APIRouter
from app.api.upload import router as upload_router
from app.api.query import router as query_router

api_router = APIRouter()

# 注册路由
api_router.include_router(upload_router)
api_router.include_router(query_router)
