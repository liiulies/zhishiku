# 知识库问答工具 - 前端

> 基于 React + Tailwind CSS + Lucide Icons 构建的现代化知识库问答界面

## ✨ 特性

- 🎨 **Shadcn UI 风格** - 现代、极简、有质感的设计
- 📱 **响应式布局** - 完美适配桌面端和移动端
- ⚡ **流畅动画** - 丰富的加载状态和过渡动效
- 🔔 **Toast 通知** - 友好的用户反馈
- 🎯 **类型安全** - 完整的 TypeScript 支持
- 🚀 **性能优化** - 自动滚动、虚拟列表预留

## 🛠️ 技术栈

| 技术 | 用途 |
|------|------|
| React 18 | UI 框架 |
| TypeScript | 类型系统 |
| Tailwind CSS | 样式方案 |
| Lucide React | 图标库 |
| Zustand | 状态管理 |
| Axios | HTTP 客户端 |
| Vite | 构建工具 |

## 📦 快速开始

### 1. 安装依赖

```bash
cd frontend
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 3. 构建生产版本

```bash
npm run build
```

## 📁 项目结构

```
frontend/
├── src/
│   ├── api/                    # API 调用
│   │   └── index.ts            # Axios 配置和接口函数
│   │
│   ├── components/             # React 组件
│   │   ├── ui/                 # 基础 UI 组件
│   │   │   ├── Button.tsx      # 按钮组件
│   │   │   ├── Loading.tsx     # 加载动画
│   │   │   └── Toast.tsx       # 通知组件
│   │   │
│   │   ├── TextInputPanel.tsx  # 文本输入面板
│   │   ├── ChatWindow.tsx      # 对话窗口
│   │   └── QuestionInput.tsx   # 提问框
│   │
│   ├── store/                  # 状态管理
│   │   └── useStore.ts         # Zustand store
│   │
│   ├── types/                  # TypeScript 类型
│   │   └── index.ts
│   │
│   ├── lib/                    # 工具函数
│   │   └── utils.ts
│   │
│   ├── App.tsx                 # 主应用组件
│   ├── main.tsx                # 入口文件
│   └── index.css               # 全局样式
│
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

## 🎨 设计系统

### 色彩方案

基于 CSS 变量，支持浅色/深色主题：

```css
--background: 0 0% 100%        /* 背景色 */
--foreground: 222.2 84% 4.9%   /* 文字色 */
--primary: 221.2 83.2% 53.3%   /* 主色（蓝色） */
--muted: 210 40% 96.1%         /* 弱化色（浅灰） */
```

### 组件示例

#### Button

```tsx
import { Button } from '@/components/ui/Button';

<Button variant="primary" size="md" loading={false}>
  点击我
</Button>
```

#### Toast

```tsx
import { showToast } from '@/components/ui/Toast';

showToast('success', '操作成功！');
showToast('error', '操作失败');
showToast('warning', '请注意');
showToast('info', '提示信息');
```

#### Loading

```tsx
import { LoadingSpinner, TypingIndicator } from '@/components/ui/Loading';

<LoadingSpinner size="md" text="加载中..." />
<TypingIndicator />
```

## 🔌 API 集成

所有 API 调用已封装在 `src/api/index.ts`：

```typescript
import { uploadText, queryKnowledge } from '@/api';

// 上传文本
const response = await uploadText('文档内容...');

// 查询知识
const result = await queryKnowledge('你的问题？');
```

### 代理配置

开发环境已配置代理（`vite.config.ts`）：

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    },
  },
}
```

生产环境部署时，替换为实际后端地址即可。

## 📱 响应式断点

| 断点 | 宽度 | 布局 |
|------|------|------|
| 移动端 | < 1024px | 上下堆叠 |
| 桌面端 | ≥ 1024px | 左右分栏（2:3） |

## 🎯 核心功能

### 1. 文本输入

- ✅ 支持粘贴文本
- ✅ 支持上传 .txt 文件
- ✅ 拖拽上传
- ✅ 实时字符计数
- ✅ 状态指示器

### 2. 对话系统

- ✅ 气泡对话流
- ✅ 用户/AI 消息区分
- ✅ 自动滚动到底部
- ✅ 打字机指示器
- ✅ 时间戳和处理时间显示

### 3. 加载状态

- ✅ 按钮加载动画
- ✅ AI 正在输入指示器
- ✅ Toast 通知
- ✅ 错误状态提示

### 4. 交互功能

- ✅ 清空对话
- ✅ 重新上传
- ✅ Enter 发送消息
- ✅ Shift+Enter 换行

## 🚀 部署

### Vercel

```bash
npm i -g vercel
vercel
```

### Netlify

```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

### Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /path/to/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8000;
    }
}
```

## 📊 性能优化

- ✅ 自动滚动优化（使用 ref）
- ✅ 动画使用 CSS transforms（GPU 加速）
- ✅ 组件懒加载预留
- ✅ 虚拟列表预留（长对话场景）

## 🔮 未来计划

- [ ] 深色模式切换
- [ ] 流式响应（SSE）
- [ ] 对话历史持久化
- [ ] 导出对话记录
- [ ] 快捷键支持
- [ ] 多语言支持

## 📄 许可证

MIT License

---

**开发愉快！** 🎉
