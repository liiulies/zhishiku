"""
API 测试示例

使用 httpx 测试 FastAPI 应用
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


class TestHealthCheck:
    """健康检查测试"""

    def test_health_check_returns_200(self):
        """测试健康检查接口返回 200"""
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert data["code"] == 0
        assert data["message"] == "success"
        assert data["data"]["status"] == "healthy"


class TestUploadText:
    """文本上传测试"""

    def test_upload_text_success(self):
        """测试成功上传文本"""
        response = client.post(
            "/api/v1/upload-text",
            data={"text": "这是一个测试文档，包含了重要信息。"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["code"] == 0
        assert "documentId" in data["data"]

    def test_upload_empty_text_fails(self):
        """测试上传空文本失败"""
        response = client.post(
            "/api/v1/upload-text",
            data={"text": ""},
        )
        assert response.status_code == 422  # 参数校验失败


class TestQuery:
    """知识查询测试"""

    def test_query_without_document_fails(self):
        """测试未上传文档时查询失败"""
        # 创建新的应用实例（无文档）
        from app.main import app as fresh_app
        from fastapi.testclient import TestClient

        fresh_client = TestClient(fresh_app)

        response = fresh_client.post(
            "/api/v1/query",
            json={"question": "测试问题？"},
        )
        assert response.status_code == 404
        data = response.json()
        assert data["code"] == 2005
        assert "知识库为空" in data["message"]

    def test_query_with_empty_question_fails(self):
        """测试空问题查询失败"""
        response = client.post(
            "/api/v1/query",
            json={"question": ""},
        )
        assert response.status_code == 422  # 参数校验失败


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
