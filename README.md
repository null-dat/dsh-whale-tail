# dsh-whale-tail

**针对 DSH 思考模式鲸鱼尾巴的动画，丰富成 4 种动画。**

把 DSH Web GUI「思考中」状态行左边那只小鲸鱼尾巴换成四段轮换动画。

- 显示尺寸 18px，颜色 `currentColor`（品牌蓝 `#4D6BFE`，深色主题自动跟随）
- 遮罩走 CSS `mask-image` + `steps(n)`，本体是 `background: currentColor`
- 四态 base64 内联在 `lib/client.js`，无外部请求
- 需要 DSH Desktop `0.2.0-rc.2` 及以上（`engines.dsh` 已声明）

## 安装

```powershell
dsh plugin add dsh-whale-tail
```

或直接从 GitHub 装：

```powershell
dsh plugin add github:null-dat/dsh-whale-tail
```

**给朋友分享**：把 `dsh-whale-tail-0.1.0.tgz` 发过去，打开 DSH Desktop → 左侧 **插件** → 添加插件 → 填 tgz 的**绝对路径**（或解压后的插件目录路径）→ 安装 → **刷新页面即可生效**（客户端插件随页面加载，不必重启 DSH Desktop）。

### 改动画 / 重新打包

```powershell
npm run build     # assets/ + src/ → lib/client.js
npm run check     # 只校验素材，不写文件
npm pack          # 出 tgz
```

`lib/client.js` 是构建产物，**不要手改**；改 `src/client.template.js` 和 `assets/`（`manifest.json` 是帧数与时长的唯一真源）。

## 四态

| 状态 | 帧数 | 循环 | 说明 |
|---|---|---|---|
| `init` | 26 | 1092ms | 旋转 + 残影（14 帧前摆 → 12 帧回摆） |
| `v1` | 23 | 958ms | 形变 + 拖尾最重 |
| `v2` | 29 | 1208ms | 摆幅最大 |
| `v4` | 32 | 1333ms | 闭环最干净 |

默认每挂载一个思考状态行换下一态。想固定某一态，给 `<html>` 加 `data-dsh-tail-pick="v4"`（`init` / `v1` / `v2` / `v4`）。

## 失效行为

这是个**覆盖式**插件：用 CSS 选中官方 `span.runningIcon`，把内置图标压成 `opacity: 0`，再用 `::after` 画自己的遮罩。DSH 没有给运行状态图标留 slot，所以只能这么做。

官方改动 DOM 结构时插件会**静默失效**——表现是尾巴变回官方那条细线，不会崩、不会白屏。这是设计上的降级路径，不是 bug。

## 许可与素材

- **代码**：MIT，见 [LICENSE](./LICENSE)。
- **素材**：动画帧源自于社区，原始作者不可考，仅随本项目分发、不单独授权。如权利人提出异议，立即下架相关素材。
