"""
RAG 查询服务模块（简化版）

直接将存储的文本作为 Context 发送给 LLM，不使用向量数据库
"""

import time
import uuid
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from app.config import settings
from app.core.exceptions import QueryException, LLMServiceException
from app.core.logging import logger
from app.services.document_service import document_service


class RagService:
    """简化版 RAG 查询服务"""

    def __init__(self):
        # 初始化 LLM（使用 DeepSeek，兼容 OpenAI SDK）
        try:
            self.llm = ChatOpenAI(
                model=settings.openai_model,
                api_key=settings.openai_api_key,
                base_url=settings.openai_base_url,  # DeepSeek API 地址
                temperature=0.7,
            )
        except Exception as e:
            logger.error(f"LLM 初始化失败: {e}")
            raise LLMServiceException(
                code=4001,
                message=f"AI 服务初始化失败: {str(e)}",
                status_code=503,
            )

        # 创建 Prompt 模板
        self.prompt_template = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """你是一个智能助手，请基于提供的参考文档内容回答用户问题。

要求：
1. 仅基于参考文档内容回答，不要编造信息
2. 如果参考文档中没有相关信息，明确告知用户
3. 回答要准确、简洁、有条理
4. 使用与用户问题相同的语言回答

参考文档内容：
{context}""",
                ),
                ("human", "{question}"),
            ]
        )

    async def query(self, question: str) -> dict:
        """
        基于已上传的文档回答用户问题

        Args:
            question: 用户问题

        Returns:
            包含回答、上下文长度等信息的字典

        Raises:
            QueryException: 查询失败时抛出
        """
        start_time = time.time()

        # 1. 获取文档内容
        context = document_service.get_latest_document()

        if not context:
            raise QueryException(
                code=2005,
                message="知识库为空，请先上传文档",
                status_code=404,
            )

        context_length = len(context)

        # 2. 构建 Prompt
        prompt = self.prompt_template.format_messages(
            context=context, question=question
        )

        logger.info(
            "开始查询",
            question=question,
            context_length=context_length,
        )

        # 3. 调用 LLM
        try:
            response = await self.llm.ainvoke(prompt)
            answer = response.content

        except Exception as e:
            logger.error(f"LLM 调用失败: {e}", question=question)
            raise LLMServiceException(
                code=4002,
                message=f"AI 服务调用失败: {str(e)}",
                status_code=503,
            )

        processing_time = round(time.time() - start_time, 2)

        logger.info(
            "查询完成",
            question=question,
            answer_length=len(answer),
            processing_time=processing_time,
        )

        return {
            "query_id": f"qry_{uuid.uuid4().hex[:12]}",
            "answer": answer,
            "context_length": context_length,
            "processing_time": processing_time,
        }


# 全局服务实例
rag_service = RagService()
