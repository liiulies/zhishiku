# 知识库问答系统 - 项目分析文档

## 1. 项目概述

### 1.1 项目定位
这是一个最小化知识库问答系统（MVP），核心功能是：上传文本 → AI处理 → 提问回答。系统基于FastAPI后端和React前端构建，使用DeepSeek AI作为智能问答引擎。

### 1.2 技术架构

#### 后端技术栈
- **Web框架**: FastAPI 0.115.6
- **AI框架**: LangChain 0.3.14 + OpenAI SDK（兼容DeepSeek API）
- **Python版本**: 3.10+
- **依赖管理**: Poetry / pip

#### 前端技术栈
- **框架**: React + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **HTTP客户端**: Axios
- **UI组件**: Lucide React（图标库）

## 2. 项目结构详解

### 2.1 整体目录结构
```
Zhishiku/
├── app/                        # 后端应用核心
│   ├── main.py                 # FastAPI应用入口
│   ├── config.py               # 配置管理
│   ├── api/                    # API路由层
│   │   ├── router.py          # 路由聚合
│   │   ├── upload.py          # 文档上传接口
│   │   └── query.py           # 知识查询接口
│   ├── services/               # 业务逻辑层
│   │   ├── document_service.py # 文档处理服务
│   │   └── rag_service.py     # RAG查询服务
│   ├── schemas/                # 数据模型定义
│   │   ├── common.py          # 通用响应模型
│   │   ├── upload.py          # 上传相关模型
│   │   └── query.py           # 查询相关模型
│   ├── core/                   # 核心组件
│   │   ├── exceptions.py      # 自定义异常
│   │   └── logging.py         # 日志配置
│   └── utils/                  # 工具函数
│       └── file_utils.py      # 文件处理工具
├── frontend/                   # 前端应用
│   ├── src/
│   │   ├── api/               # API请求封装
│   │   ├── components/        # React组件
│   │   ├── store/             # 状态管理
│   │   └── types/             # TypeScript类型定义
│   ├── package.json
│   └── start.ps1              # Windows启动脚本
├── requirements.txt            # Python依赖
├── pyproject.toml             # Poetry配置
└── serverless.yml             # 云函数配置
```

### 2.2 后端模块说明

#### 2.2.1 应用入口 (main.py)
- 创建FastAPI应用实例
- 配置CORS中间件
- 注册API路由
- 实现全局异常处理
- 提供健康检查接口
- 处理应用启动和关闭事件

#### 2.2.2 配置管理 (config.py)
使用Pydantic Settings管理配置，包括：
- LLM配置（DeepSeek API）
- Embedding配置（阿里云DashScope，预留）
- 服务配置（应用名称、版本、调试模式等）
- 文件上传配置（大小限制、允许格式）
- RAG配置（分块大小、重叠度等，预留）

#### 2.2.3 API路由层
**upload.py** - 文档上传接口
- POST /api/v1/upload: 上传TXT文件
- POST /api/v1/upload-text: 直接提交文本内容

**query.py** - 知识查询接口
- POST /api/v1/query: 基于已上传文档回答问题

#### 2.2.4 业务逻辑层
**document_service.py** - 文档处理服务
- 文件验证（类型、大小）
- 文件内容读取
- 文档内存存储（MVP简化版）
- 文本内容处理

**rag_service.py** - RAG查询服务
- 初始化LLM（DeepSeek）
- 构建Prompt模板
- 调用LLM生成回答
- 查询日志记录

#### 2.2.5 数据模型层 (schemas/)
定义请求和响应的数据结构：
- common.py: 通用API响应格式
- upload.py: 上传相关数据模型
- query.py: 查询相关数据模型

#### 2.2.6 核心组件 (core/)
- exceptions.py: 自定义异常类
- logging.py: 日志配置

### 2.3 前端模块说明

#### 2.3.1 主要组件
**App.tsx** - 主应用组件
- 管理整体布局
- 处理问题发送逻辑
- 管理对话状态
- 提供清空对话和重置功能

**TextInputPanel.tsx** - 文本输入面板
- 提供文本输入区域
- 支持文件上传
- 显示上传状态

**ChatWindow.tsx** - 对话窗口
- 显示消息列表
- 展示用户和AI的对话
- 显示查询元数据

**QuestionInput.tsx** - 问题输入组件
- 提供问题输入框
- 处理发送操作
- 显示加载状态

#### 2.3.2 状态管理 (useStore.ts)
使用Zustand管理全局状态：
- 文本输入和上传状态
- 对话消息列表
- 加载和错误状态
- 提供状态更新方法

#### 2.3.3 API封装 (api/index.ts)
使用Axios封装API请求：
- 健康检查
- 文本上传
- 文件上传
- 知识查询
- 统一错误处理

#### 2.3.4 类型定义 (types/index.ts)
定义TypeScript类型：
- Message: 消息结构
- UploadStatus: 上传状态类型
- UploadResponse: 上传响应
- QueryResponse: 查询响应
- ApiResponse: API响应包装
- ERROR_MESSAGES: 错误码映射

## 3. 核心功能流程

### 3.1 文档上传流程
```
用户上传文档
    ↓
前端验证（类型、大小）
    ↓
调用后端API
    ↓
document_service处理
    ↓
验证文件 → 读取内容 → 生成ID → 存储到内存
    ↓
返回上传结果
    ↓
前端更新状态
```

### 3.2 知识查询流程
```
用户提交问题
    ↓
前端验证
    ↓
调用后端API
    ↓
rag_service处理
    ↓
获取最新文档 → 构建Prompt → 调用LLM
    ↓
返回AI回答
    ↓
前端显示结果
```

## 4. 数据流转

### 4.1 上传数据流
1. 前端收集文本/文件
2. 通过Axios发送到后端
3. 后端验证并处理
4. 存储到内存（DocumentService）
5. 返回处理结果

### 4.2 查询数据流
1. 前端收集问题
2. 发送到后端
3. 后端从内存获取文档
4. 构建Prompt调用LLM
5. 返回AI回答
6. 前端展示结果

## 5. 技术特点

### 5.1 后端特点
- 异步处理：使用async/await
- 类型安全：Pydantic数据验证
- 模块化设计：清晰的分层架构
- 完善的异常处理
- 详细的日志记录
- 自动生成API文档

### 5.2 前端特点
- TypeScript类型安全
- 组件化开发
- 响应式设计
- 状态管理集中化
- 统一的API调用
- 良好的用户体验

## 6. 当前限制与改进方向

### 6.1 当前限制
1. **MVP简化版**：不使用向量数据库，适合小规模文本（<10万字）
2. **内存存储**：服务重启后数据丢失
3. **单文档查询**：仅支持最近一次上传的文档
4. **无用户认证**：缺少权限管理
5. **无流式响应**：等待完整回答后显示

### 6.2 改进方向
1. 引入ChromaDB实现向量化检索
2. 支持多文档管理和切换
3. 添加对话历史和上下文记忆
4. 实现流式响应（SSE）
5. 添加用户认证和权限管理
6. 持久化存储（数据库）
7. 支持更多文件格式

## 7. 部署说明

### 7.1 开发环境
- 后端：uvicorn app.main:app --reload
- 前端：cd frontend && npm run dev

### 7.2 生产环境
- 后端：支持部署到云函数（serverless.yml）
- 前端：构建后部署到静态服务器

## 8. 总结

这是一个设计良好的MVP项目，具有以下优势：
- 清晰的架构设计
- 完善的代码组织
- 良好的前后端分离
- 详细的类型定义
- 完善的异常处理

适合作为知识库问答系统的起点，可根据实际需求逐步扩展功能。
