# 许愿墙 Web App

基于 Next.js App Router 的 2026 除夕许愿墙实现，包含以下能力：

- 瀑布流愿望墙 + 无限滚动
- 添加愿望弹窗（昵称、愿望、联系方式、性别）
- localStorage 用户标识与 3 条愿望限制
- 2026-02-16 23:59:59（北京时间）倒计时
- 2026-02-17 00:00（北京时间）触发放飞动画（会话内仅一次）
- API: `GET /api/wishes`, `POST /api/wishes`, `POST /api/wishes/release`
- DynamoDB + 内存 fallback 存储

## 1. 启动

```bash
npm install
npm run dev
```

访问 `http://localhost:3000`。

## 2. 环境变量

复制 `.env.example` 为 `.env.local` 后按需填写：

- `DYNAMODB_TABLE`
- `REGION`
- `ALLOWED_ORIGIN`
- `USE_IN_MEMORY_STORE`（本地默认 `true`）
- `RELEASE_API_KEY`

## 3. 测试

```bash
npm run test
npm run test:e2e
```

## 4. 部署（Serverless + AWS）

1. 配置 AWS 凭据。
2. 构建应用：`npm run build`
3. 部署：`npx serverless deploy --stage prod`

> `serverless.yml` 已定义 `Wishes` 表、两条 GSI 以及 2026 除夕定时任务占位。

## 5. 数据结构

数据表字段与 PRD 对齐：`wishId`, `userId`, `nickname`, `content`, `contact`, `gender`, `createdAt`, `status`, `ttl`。
