# ADAegis Portal

[English](README.md)

ADAegis Portal 是 ADAegis 的 Web 界面。ADAegis 是一个面向 Active Directory 与企业身份环境的开放安全平台，Portal 为安全团队提供统一入口，用于查看域风险、监控 Sensor、调查告警、管理检测规则，并完成日常 AD 安全运营工作。

ADAegis Portal 适用于需要清晰观察域控、用户、认证行为、Windows 安全遥测、扫描发现和身份攻击路径的团队。

<div align="center">
  <a href="https://youtu.be/Oexs-58C-Fg">
    <img src="https://img.youtube.com/vi/Oexs-58C-Fg/maxresdefault.jpg" alt="ADAegis 介绍视频" width="720" />
  </a>
  <br />
  <a href="https://youtu.be/Oexs-58C-Fg"><strong>观看 ADAegis 介绍视频（YouTube）</strong></a>
  <br />
  <a href="https://demo.adaegis.net/"><strong>访问 ADAegis 在线 Demo</strong></a>
</div>

## ADAegis Portal 解决什么问题

- Active Directory 安全数据常常分散在日志、工具和人工检查流程中。
- 需要对 AD 进行安全审计，持续发现风险并指导加固。
- 告警、扫描结果、Sensor 状态和域上下文需要在一个运营视图中统一查看。
- 身份攻击调查通常需要关联用户、主机、事件、网络痕迹、规则和调查记录。
- 安全运营需要可落地的分诊、验证、报告和跟进流程。

ADAegis Portal 将后端检测和风险评估能力转化为可操作的安全运营体验。

## 核心亮点

- **AD 安全运营 Portal**：统一组织域资产、Sensor、告警、规则、扫描结果、报告和系统状态。
- **风险发现与加固工作流**：帮助团队查看 AD 暴露面、弱口令、基线问题、泄露风险和整改状态。
- **威胁调查**：支持告警查看、activity 上下文、规则驱动检测和后续处置动作。
- **整合遥测视图**：以一致的界面呈现 Windows 事件日志、网络协议上下文、Sensor 状态和 Dashboard 指标。
- **MCP 协议与 AI Agent（Coming soon）**：面向 ADAegis 支持 MCP 的后端能力设计，后续将支持 AI Agent 辅助威胁检测、告警调查和安全运营。
- **可部署安全栈的前端**：构建后的静态资源由 ADAegis backend Docker 部署提供服务。
- **现代 Web 技术栈**：基于 Vue 3、Vite、TypeScript、Pinia 和 Element Plus 构建。

## 仓库

- 前端 Portal：[github.com/Lingerhk/ada-web](https://github.com/Lingerhk/ada-web)
- 后端与核心服务：[github.com/Lingerhk/ada](https://github.com/Lingerhk/ada)

从源码构建完整 ADAegis 镜像时，前端仓库需要与后端仓库放在同级目录。

## 快速部署

多数部署场景中，ADAegis Portal 会由 `github.com/Lingerhk/ada` 后端栈构建并提供服务。

保持两个仓库为同级目录：

```text
adaegis/
  ada/
  ada-web/
```

然后从后端仓库构建并启动完整栈：

```bash
cd ada/script/docker
./build.sh build backend
docker compose up -d
docker compose ps
```

构建脚本会编译本 Portal，并将生成的 `dist` 目录复制到 backend 镜像上下文。Portal 默认由 `ada_backend` 通过 `80` 端口提供服务。

只构建前端静态资源：

```bash
npm install
npm run build
```

## 本地开发

### 前置条件

- Node.js `16` 或更新版本
- npm `7` 或更新版本
- 可访问的 ADAegis backend，或本地运行的完整后端栈

### 启动开发服务

```bash
npm install
npm run dev
```

需要指定后端地址时，创建本地 `.env` 文件：

```dotenv
VITE_ADA_API_URL=http://127.0.0.1:80
```

`VITE_ADA_API_URL` 为空时，Portal 使用同源 `/ada.ADA/*` endpoint。设置该变量后，请求会发送到配置的 gRPC-web proxy endpoint。

### 常用命令

```bash
npm run build
npm run preview
npm run lint
npm run typecheck
npm run test:unit
npm run test:e2e
```

后端 protobuf 变更后，更新前端生成的 API 代码：

```bash
npm run build-proto
```

## 反馈问题

Bug、功能建议和文档问题请通过 GitHub issues 反馈：

- [github.com/Lingerhk/ada-web/issues](https://github.com/Lingerhk/ada-web/issues)

反馈问题时建议提供：

- ADAegis Portal 版本或 commit
- 浏览器和操作系统
- 相关后端版本或 commit
- 部署或开发模式
- 复现步骤
- 期望行为
- 截图或 console 日志，注意移除敏感信息

社区联系方式：

- Telegram 群：[ADAegis Official Support](https://t.me/+6zDk06KqdpBiNjc1)

## License

ADAegis Portal 使用 [MIT License](https://opensource.org/license/mit) 发布。

## 项目状态

ADAegis Portal 正在持续开发中。UI 工作流、后端集成和文档会随着项目演进而调整。
