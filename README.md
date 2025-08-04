# Solana Counter dApp - Next.js & Anchor

这是一个功能完整的 Solana dApp 示例，旨在演示如何使用 Anchor 框架构建智能合约，并使用 Next.js、TypeScript 和 `solana-wallet-adapter` 构建一个与之交互的现代化前端。

该项目实现了一个带有权限控制的链上计数器。用户可以创建自己的计数器账户，并且只有账户的创建者（`authority`）才能修改其状态（增加、减少、设置特定值）或关闭该账户。


*(你可以用你自己应用的截图替换此图片)*

---

## ✨ 功能特性

*   **创建计数器**: 任何连接钱包的用户都可以创建一个新的链上计数器账户。
*   **权限控制**: 只有创建账户的 `authority` 才能执行修改操作。
*   **状态修改**:
    *   **Increment**: 将计数值加一。
    *   **Decrement**: 将计数值减一。
    *   **Set**: 将计数值设置为一个特定的值。
*   **关闭账户**: `authority` 可以关闭不再需要的账户，并回收租金 (rent)。
*   **动态 UI**: 界面会根据当前连接的钱包是否为账户的 `authority` 来动态启用/禁用操作按钮。
*   **多账户展示**: 应用会获取并展示所有已创建的计数器账户。
*   **钱包适配**: 集成了 `@solana/wallet-adapter`，支持多种主流 Solana 钱包（如 Phantom, Solflare）。
*   **实时反馈**: 使用 `sonner` 和 `react-query` 提供流畅的交易状态通知和数据刷新。

---

## 🛠️ 技术栈

*   **智能合约 (Backend)**:
    *   [**Anchor**](https://www.anchor-lang.com/): 用于快速开发 Solana 智能合约的 Rust 框架。
    *   [**Rust**](https://www.rust-lang.org/): 编写安全、高性能的智能合约。
    *   [**Solana**](https://solana.com/): 高性能的区块链底层。

*   **前端 (Frontend)**:
    *   [**Next.js (App Router)**](https://nextjs.org/): 全栈 React 框架。
    *   [**React**](https://react.dev/): 构建用户界面的 JavaScript 库。
    *   [**TypeScript**](https://www.typescriptlang.org/): 为 JavaScript 添加静态类型。
    *   [**Tailwind CSS**](https://tailwindcss.com/): 功能类优先的 CSS 框架。
    *   [**Shadcn/ui**](https://ui.shadcn.com/): 可复用的 UI 组件库。

*   **Solana Web3 集成**:
    *   [**@solana/wallet-adapter**](https://github.com/solana-labs/wallet-adapter): 用于连接 Solana 钱包的 React hooks 和组件。
    *   [**@solana/web3.js**](https://solana-labs.github.io/solana-web3.js/): 与 Solana RPC 节点交互的核心库。
    *   [**@tanstack/react-query**](https://tanstack.com/query/latest): 用于管理、缓存和同步异步数据（如链上状态）。

---

## 🚀 快速开始

### 准备工作

在开始之前，请确保你已经安装了以下工具：

1.  **Node.js v18 或更高版本**: [下载地址](https://nodejs.org/)
2.  **Rust 和 Cargo**: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
3.  **Solana CLI**: [安装指南](https://docs.solana.com/cli/install)
4.  **Anchor CLI**: `cargo install --git https://github.com/coral-xyz/anchor avm --locked --force && avm install latest && avm use latest`

### 安装与设置

1.  **克隆仓库**:
    ```bash
    git clone https://github.com/your-username/solana-counter-dapp.git
    cd solana-counter-dapp
    ```

2.  **安装依赖**:
    项目使用 npm workspaces，在根目录运行安装即可。
    ```bash
    npm install
    ```

### 运行项目

你需要至少三个终端窗口来运行完整的开发环境。

**1. 终端 1: 启动本地 Solana 网络**
```bash
solana-test-validator
```
> 保持此终端窗口运行。

**2. 终端 2: 部署智能合约**
首先，将 Solana CLI 配置为使用本地网络。
```bash
solana config set --url localhost
```
然后，构建并部署 Anchor 程序。
```bash
anchor build
anchor deploy
```
> **注意**: 首次部署后，你需要将输出的 `Program Id` 更新到 `anchor/src/lib.rs` 和 `anchor/Anchor.toml` 中，然后重新运行 `anchor build`。

**3. 终端 3: 启动前端应用**
```bash
npm run dev
```
> 现在，你的 dApp 应该运行在 [http://localhost:3000](http://localhost:3000)。

### 与 dApp 交互

1.  打开 [http://localhost:3000](http://localhost:3000)。
2.  配置你的浏览器钱包（如 Phantom）以连接到 "Localhost" 网络。
3.  如果需要，给自己空投一些测试 SOL：`solana airdrop 2 YOUR_WALLET_ADDRESS`。
4.  连接钱包，然后开始创建和管理你的计数器！

---

## 📂 项目结构

```
.
├── anchor/              # Anchor 智能合约项目
│   ├── programs/        # Rust 智能合约源代码
│   │   └── counter/
│   │       └── src/lib.rs
│   ├── tests/           # 集成测试 (TypeScript)
│   └── Anchor.toml      # Anchor 项目配置
│
├── src/                 # Next.js 前端应用
│   ├── app/             # App Router 页面和布局
│   ├── components/      # UI 组件
│   │   └── counter/     # 与计数器功能相关的组件和 hooks
│   ├── lib/             # 工具函数
│   └── ...
│
├── node_modules/
├── package.json
└── README.md
```

---

## 🤝 贡献

欢迎提交 issue 和 pull request！如果你想为这个项目做贡献，请先 fork 仓库并创建一个新的分支。

## 📜 许可证

本项目采用 [MIT 许可证](LICENSE)。