# 发布到官方插件市场（awesome-dsh-plugin）

> 更新于 2026-10-22。仓库已就绪：<https://github.com/null-dat/dsh-whale-tail>
> 剩余：npm 发布、PR（受「仓库满 1 天」限制，最早明天）。

## 这个「官方市场」是什么

不是提交表单，也不是私有 registry：

| 层 | 实体 |
|---|---|
| 数据源 | `github.com/awesome-dsh-plugin/awesome-dsh-plugin` 的 `data/plugins/<owner>__<repo>.yml` |
| 生成页面 | `https://awesome-dsh-plugin.com/plugins.json`（6378 条） |
| 国内可用副本 | npm 包 `dsh-plugin-catalog`（自动发布，走腾讯镜像） |
| DSH 0.2.1+ 索引 | `https://cdn.jsdelivr.net/npm/dsh-plugin-catalog/index.json` |

`dshmarket` 读的就是这两条（`lib/regions.js` 的 `CATALOG_OFFICIAL` / `CATALOG_PACKAGE`）。
收录方式：给上面那个仓库提 PR，**只加一个 YAML 文件**。

## 进度

| 门槛 | 状态 |
|---|---|
| 公开 GitHub 仓库，真实代码 | ✅ <https://github.com/null-dat/dsh-whale-tail>（15 文件，1 commit） |
| `package.json` 声明 `dsh.bundle` | ✅ |
| 仓库根有 `cordis.patch.yml` | ✅ |
| 仓库带 `dsh-plugin` topic | ✅（另加了 `dsh`） |
| 仓库创建满 1 天 | ⏳ 2026-10-22 建立，明天起满足 |
| 发到 npm（索引只收有版本号的） | ✅ `dsh-whale-tail@0.1.0`，latest，MIT，126.7KB unpacked |
| 提 PR | ⏳ 待做（仓库 2026-10-22 建立，明天满 1 天） |

## npm 发布过程记录（踩坑）

1. `npm login` 直接报「Sign up to CNPM / Public registration is not allowed」——因为 `~/.npmrc` 的 `registry` 指向 `registry.npmmirror.com`（只读镜像，不能注册、不能发布）。登录必须显式 `--registry=https://registry.npmjs.org`。
2. 首次 `npm publish` 报 403：npm 强制发布必须有 2FA 或带 bypass 2FA 的细粒度令牌。
3. 开了 2FA 但只有「安全密钥」一种方式可选（没有 authenticator app）。安全密钥可用 Windows Hello，但**命令行给不出 WebAuthn 手势**，`--otp=` 只认 TOTP。
4. 取消「Require two-factor authentication for write actions」也没用：`npm publish` 改为走**网页 OTP 流程**，而该流程在**非 TTY**（管道）环境里拿不到链接（npm 会打印 `https://www.npmjs.com/auth/cli/***` 而不是真实 URL）。
5. 最终在**真正的交互式终端**里跑 `npm publish`，浏览器完成 verify 后发布成功。npm 会先**分阶段发布（staged）**：registry 上先出现 `0.0.0-stage`，认证通过后 `0.1.0` 才转正。期间立刻重试会得到 `409 Cannot publish over previously staged version`，等一会儿就好。

遗留：registry 里有个 `0.0.0-stage` 版本（分阶段发布的占位），`dist-tags.latest` 是 `0.1.0`，不影响安装。

## 这次踩的坑（复现时注意）

| 坑 | 现象 | 解法 |
|---|---|---|
| git 没走系统代理 | `schannel: SEC_E_UNTRUSTED_ROOT (0x80090325)` | 仓库级 `git config http.proxy http://127.0.0.1:7897`（Clash 端口，按实际改） |
| GitHub sudo 模式 | OAuth 授权页要求输 6 位验证码 | 只能账号本人输；Git 凭据管理器只负责把浏览器拉起来 |
| 提交身份 | 全局 git 身份是 gitee 邮箱，commit 挂不到 GitHub 账号 | 仓库级 `git config user.email null-dat@users.noreply.github.com` |

## 剩余步骤

### 1. npm 发布

```powershell
npm login                      # 浏览器走一遍，凭据存进 ~/.npmrc
cd dsh-plugins\dsh-whale-tail
npm publish --access public
```

发布后验证：`npm view dsh-whale-tail version` 应返回 `0.1.0`。

### 2. 提 PR（仓库满 1 天后）

fork `awesome-dsh-plugin/awesome-dsh-plugin`，在 `data/plugins/` 下新增
`null-dat__dsh-whale-tail.yml`：

```yaml
url: https://github.com/null-dat/dsh-whale-tail
name: null-dat/dsh-whale-tail
category: ui
description:
  en: Four whale-tail animations for the DeepSeek Harness thinking indicator, cycling on every thinking turn.
  zh: 针对 DSH 思考模式鲸鱼尾巴的动画，丰富成 4 种动画。
```

- `category` 备选：`ui` / `theme` / `fun`。选 `theme` 会进 dsh-market 的 Themes 标签页；
- `description.en` 必填，`zh` 可选；
- 描述里出现「冒号 + 空格」必须加引号（中文全角冒号无此问题）；
- 一个插件一个文件，文件名 `owner__repo.yml`（两个下划线）。

合并后 `main` 自动重生成 README，随后自动发布新的 `dsh-plugin-catalog`。

## 做不到的部分

建仓库、`npm publish`、提 PR 都需要账号本身（和一次性 2FA），这三步只能由账号主人完成。
