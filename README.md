## 简介
这是一个 基于 laf 和 vue 的前后端一体化的后台管理系统。

## 预览
- [laf-rbac-admin](https://rjb00l-site.site.laf.run/#/login)

账号：admin，密码：123456

## 准备

- [laf](https://doc.laf.run/) - laf 文档
- [pnpm](https://pnpm.io/)
- [node](http://nodejs.org/) 和 [git](https://git-scm.com/) -项目开发环境
- [Vite](https://vitejs.dev/) - 熟悉 vite 特性
- [Vue3](https://v3.vuejs.org/) - 熟悉 Vue 基础语法
- [TypeScript](https://www.typescriptlang.org/) - 熟悉`TypeScript`基本语法
- [Naive-ui](https://www.naiveui.com/) - ui 基本使用

## 使用

- 获取项目代码

```bash
git clone https://github.com/walle233/laf-rbac-admin.git
```

- 安装依赖

```bash
cd laf-rbac-admin

pnpm install

```

- 运行

```bash
pnpm dev
```

- 打包

```bash
pnpm build
```

## laf-cloud 使用

**环境准备**
1. npm i -g laf-cli
2. vscode 安装插件 [laf-assistant](https://marketplace.visualstudio.com/items?itemName=nightwhite.laf-assistant)

**初始化项目**
1. 在 laf-cloud 目录下初始化 laf app
2. 发布所有 function 到 laf 线上
3. 在线上执行 init-shared-utils 和 init-app-rbac 两个 function，初始化 rbac 相关数据

**静态资源发布**
```bash
# 第一次先创建 bucket
laf storage create bucketName

pnpm build

# 在 laf-cloud 目录下执行，发布静态资源到 bucket
laf storage push bucketName ../dist
```


## 如何贡献

**Pull Request:**

1. Fork 代码!
2. 创建自己的分支: `git checkout -b feat/xxxx`
3. 提交你的修改: `git commit -am 'feat(function): add xxxxx'`
4. 推送您的分支: `git push origin feat/xxxx`
5. 提交`pull request`

## Git 贡献提交规范

- 参考 [vue](https://github.com/vuejs/vue/blob/dev/.github/COMMIT_CONVENTION.md) 规范 ([Angular](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-angular))

  - `feat` 增加新功能
  - `fix` 修复问题/BUG
  - `style` 代码风格相关无影响运行结果的
  - `perf` 优化/性能提升
  - `refactor` 重构
  - `revert` 撤销修改
  - `test` 测试相关
  - `docs` 文档/注释
  - `chore` 依赖更新/脚手架配置修改等
  - `workflow` 工作流改进
  - `ci` 持续集成
  - `types` 类型定义文件更改
  - `wip` 开发中
