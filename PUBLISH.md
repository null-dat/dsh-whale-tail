# 发布到官方插件市场（awesome-dsh-plugin）

调研结论，2026-10-22，基于官方目录包 `dsh-plugin-catalog@2026.1022.9092` 与
`awesome-dsh-plugin/awesome-dsh-plugin` 仓库的 `README.md` / `contributing.md`。

## 这个「官方市场」到底是什么

不是提交表单，也不是发布到某个私有 registry。它的真相是：

| 层 | 实体 |
|---|---|
| 数据源 | `github.com/awesome-dsh-plugin/awesome-dsh-plugin` 仓库里的 `data/plugins/<owner>__<repo>.yml` |
| 生成的页面 | `https://awesome-dsh-plugin.com/plugins.json`（GitHub Pages，6378 条） |
| 国内可用副本 | npm 包 `dsh-plugin-catalog`（自动发布，用腾讯镜像取） |
| DSH 0.2.1+ 的索引 | `https://cdn.jsdelivr.net/npm/dsh-plugin-catalog/index.json` |

`dshmarket` 插件读的正是这两条（`lib/regions.js` 里的 `CATALOG_OFFICIAL` 与 `CATALOG_PACKAGE`）。

**收录方式：给上面那个仓库提一个 PR，只加一个 YAML 文件。** 官方原话：「Published automatically; do not open pull requests here」（指目录 npm 包），以及「The READMEs are generated — don't edit them by hand」。

## 硬性门槛（缺一条就打回）

| 门槛 | 我们的状态 |
|---|---|
| 公开 GitHub 仓库，含真实可用代码 | ❌ **还没有仓库**（现在只在本地 `dsh-plugins/dsh-whale-tail`） |
| `package.json` 声明 `dsh.bundle` | ✅ 有 |
| 仓库根有 `cordis.patch.yml` | ✅ 有 |
| 仓库带 `dsh-plugin` topic | ❌ 建仓时勾 |
| 仓库创建满 **1 天** | ❌ 最快明天 |
| 最好已发 npm（索引只收有版本号的） | ❌ 未发（名字 `dsh-whale-tail` 在 npm 上**未被占用**，已查） |

所以**今天发不了**：卡在「没有 GitHub 仓库」和「满 1 天」。这两条都不是技术问题。

## 步骤

### 1. 建仓库并推上去

在 `D:\chenjh\apps\code\IDE\deepseekharness\dsh-plugins\dsh-whale-tail` 里：

```powershell
git init
git add -A
git commit -m "feat: four whale-tail animations for the DSH thinking status line"
git branch -M main
git remote add origin https://github.com/<owner>/dsh-whale-tail.git
git push -u origin main
```

推之前注意：`dsh-whale-tail-0.1.0.tgz` 是构建产物，别提交进去；`lib/client.js` 是构建产物但**要**提交（装包的人不跑构建）。建议加一个 `.gitignore`：

```gitignore
node_modules/
*.tgz
```

建仓后在 GitHub 仓库页加 topic：`dsh-plugin`（还有 `dsh`、`whale`）。

### 2. 发 npm（可选但强烈建议）

```powershell
npm login                      # 需要你自己的 npm 账号
npm publish --access public    # dsh-whale-tail 名字已确认可用
```

`package.json` 里已经就绪：`files` 白名单、`engines.dsh: ">=0.2.0-rc.2"`、`keywords` 含 `dsh-plugin`、`license: MIT`。

### 3. 提 PR：只加一个文件

在 `awesome-dsh-plugin/awesome-dsh-plugin` 的 `data/plugins/` 下新增
`<owner>__dsh-whale-tail.yml`：

```yaml
url: https://github.com/<owner>/dsh-whale-tail
name: <owner>/dsh-whale-tail
category: ui
description:
  en: Four whale-tail animations for the DeepSeek Harness thinking indicator, cycling on every thinking turn.
  zh: 针对 DSH 思考模式鲸鱼尾巴的动画，丰富成 4 种动画。
```

- `<owner>` 换成你的 GitHub 用户名；文件名里的 `__` 是**两个下划线**；
- `category` 可选值里有 `ui` / `theme` / `fun`。我们建议 `ui`；
  若想让它出现在 dsh-market 的 **Themes 标签页**里（一键切换外观），改 `theme`；
- `description.en` 必填，`zh` 可选（不写维护者会补）；
- 描述里出现「冒号 + 空格」必须加引号，中文全角冒号没这个问题。

### 4. 等合并

合并后 `main` 上自动重新生成两个 README，随后自动发布新的 `dsh-plugin-catalog`。
DSH 侧下一次拉目录就能看到（`dshmarket` 有缓存，可能要等一下或手动刷新）。

## 我做不到的部分

| 件事 | 为什么 |
|---|---|
| 建 GitHub 仓库 | 需要你的账号 |
| `npm publish` | 需要你的 npm 凭据（我不碰凭据） |
| 提 PR | 需要你的 GitHub 身份 |
| 保证 1 天门槛 | 物理时间 |

我能做且已经做完的是：把包做成符合收录要求的样子（`dsh.bundle` / `cordis.patch.yml` / 元数据 / 构建可重复 / 体积达标），并把这套流程核实到命令级。
