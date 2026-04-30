# 知识库问答系统 - MVP

> 最小化知识库问答系统，核心流程：上传文本 → AI 处理 → 提问回答

## 技术栈

### 后端
- **框架**: FastAPI 0.115.6
- **AI**: LangChain 0.3.14 + OpenAI
- **Python 版本**: 3.10+

### 前端
- **框架**: React + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS

## 快速开始

### 1. 安装依赖

```bash
# 使用 pip
pip install -r requirements.txt

# 或使用 poetry（推荐）
poetry install
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入你的 OpenAI API Key
# OPENAI_API_KEY=sk-your-api-key-here
```

### 3. 启动后端服务

```bash
# 开发模式（自动重载）
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 或直接运行
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 4. 启动前端服务

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# Windows 用户也可以直接运行
# ./start.ps1
```

### 5. 访问应用

- 前端应用: http://localhost:5173
- API 文档 (Swagger): http://localhost:8000/docs
- API 文档 (ReDoc): http://localhost:8000/redoc



## API 接口

### 1. 上传文档

```bash
# 方式 1：上传 TXT 文件
curl -X POST "http://localhost:8000/api/v1/upload" \
  -F "file=@your_document.txt"

# 方式 2：直接提交文本
curl -X POST "http://localhost:8000/api/v1/upload-text" \
  -F "text=这是你的知识库内容..."
```

### 2. 知识查询

```bash
curl -X POST "http://localhost:8000/api/v1/query" \
  -H "Content-Type: application/json" \
  -d '{"question": "文档中提到了什么？"}'
```

### 3. 健康检查

```bash
curl http://localhost:8000/api/v1/health
```

## 项目结构

```
Zhishiku/
├── app/                        # 后端应用
│   ├── main.py                 # FastAPI 应用入口
│   ├── config.py               # 配置管理
│   ├── api/                    # API 路由
│   │   ├── router.py
│   │   ├── upload.py
│   │   └── query.py
│   ├── services/               # 业务逻辑
│   │   ├── document_service.py
│   │   └── rag_service.py
│   ├── schemas/                # 数据模型
│   │   ├── common.py
│   │   ├── upload.py
│   │   └── query.py
│   ├── core/                   # 核心组件
│   │   ├── exceptions.py
│   │   └── logging.py
│   └── utils/                  # 工具函数
│       └── file_utils.py
├── frontend/                   # 前端应用
│   ├── src/
│   │   ├── api/                # API 请求封装
│   │   ├── components/         # React 组件
│   │   ├── store/              # 状态管理
│   │   └── types/              # TypeScript 类型定义
│   ├── package.json
│   └── start.ps1               # Windows 启动脚本
├── requirements.txt
├── pyproject.toml
├── .env.example
├── PRD.md                      # 产品需求文档
├── DEVELOPMENT_STANDARDS.md    # 开发规范
├── FRONTEND_GUIDE.md          # 前端开发指南
└── README.md
```

## 核心特性

- ✅ 支持 TXT 文件上传和直接文本提交
- ✅ 基于 OpenAI LLM 的智能问答
- ✅ 简化版 RAG（直接使用全文作为 Context）
- ✅ 完整的异常处理和日志记录
- ✅ 自动生成 API 文档
- ✅ 符合开发规范的代码结构

## 注意事项

1. **MVP 简化版**：当前版本不使用向量数据库，适合文本量较小的场景（<10万字）
2. **内存存储**：文档存储在内存中，服务重启后数据丢失
3. **单次查询**：仅基于最近一次上传的文档回答，不支持多文档检索
4. **生产环境**：如需处理大规模文档，建议升级使用 ChromaDB/向量数据库

## 下一步升级

- [ ] 引入 ChromaDB 实现向量化检索
- [ ] 支持多文档管理和切换
- [ ] 添加对话历史和上下文记忆
- [ ] 实现流式响应（SSE）
- [ ] 添加用户认证和权限管理

## 许可证

MIT License
