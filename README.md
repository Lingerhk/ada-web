# ADAegis Portal

`ada-web` 是 ADAegis 的前端门户，基于 Vue 3、Vite、TypeScript、Pinia 和 Element Plus。

## 常用命令

```bash
npm install
npm run dev
npm run build
npm run lint
npm run typecheck
npm run test:unit
npm run test:e2e
```

## 环境变量

创建 `.env` 文件并至少配置：

```dotenv
VITE_ADA_API_URL=http://127.0.0.1:80
```

说明：

- 为空时，前端默认请求同源 `/ada.ADA/*`。
- 非空时，前端直接请求指定的 gRPC-web 代理地址。

## Proto 更新

后端 `ada.proto` 更新后执行：

```bash
npm run build-proto
```

## 相关文档

- 仓库总览：[`../README.md`](../README.md)
- 系统架构：[`../docs/architecture.md`](../docs/architecture.md)
- 本地开发：[`../docs/local-development.md`](../docs/local-development.md)

说明：

- `lint` 与 `typecheck` 当前优先覆盖前端构建配置、分包逻辑和新增测试基线。
- `test:unit` 与 `test:e2e` 分别提供纯函数校验和登录页最小冒烟。
