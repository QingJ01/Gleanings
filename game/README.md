# 第一幕《开坛》可玩垂直切片

这是《拾遗》的第一段完整可玩流程。玩家在海外公寓中扮演林怡，整理太婆寄来的纸箱，
读到字条，与室友米娅交谈，最后在酒坛前做出一次感知选择并揭开被封住的冬酿记忆。

## 启动

需要 Node.js 20+ 与 pnpm 10+。

```bash
cd game
pnpm install
pnpm dev
```

浏览器打开终端显示的地址。生产构建使用：

```bash
pnpm build
pnpm exec vite preview
```

## 操作

- `WASD` / 方向键：四方向移动
- `E` / 空格：调查、推进对白、确认
- `I`：打开或关闭四格背包
- 酒坛前长按 `E`：揭坛
- 结算页 `R`：清除第一幕存档并重新体验

首次进入游戏时，浏览器会阻止自动播放。对白框会显示 `E 开启声音`；按一次后播放
当前台词，之后 `E` 恢复为正常的推进键。切换台词时，上一句配音会立即停止。

完整主线为：移动教学 → 调查左下纸箱 → 背包读太婆字条 → 米娅入场 → 调查右上酒坛
→ 选择香气、红色或凉意 → 长按揭坛 → 记忆转场 → 第一幕结算。

## 内容与代码位置

- `src/content/act1/dialogue.zh-CN.json`：中文对白与三个感知选项
- `../assets/rpg_v2/audio/act1/`：24 条已去除末尾蜂鸣的第一幕配音
- `src/content/act1/quests.json`：任务标题和超时提示
- `src/content/act1/interactables.json`：交互点、距离与对白组
- `src/content/act1/apartment-map.json`：地图尺寸、出生点和碰撞矩形
- `src/game/domain/`：可测试的第一幕状态机
- `src/game/scenes/`：公寓、记忆转场与结算场景
- `../assets/rpg_v2/`：运行时像素素材；`*_source.png` 只用于回溯

对白、任务和交互均由 JSON 驱动。新增文案时保留稳定的 `id`，人物显示名只写中文。
每条可播放对白使用 `voiceKey` 对应 `audio/act1/<voiceKey>.mp3`。
改变碰撞或交互坐标后，需同时确认主线目标仍可从相邻 tile 接近。

## 配音素材处理

原始配音压缩包不会被游戏直接加载。重新处理配音时，从仓库根目录运行：

```bash
python assets/rpg_v2/scripts/prepare_voiceover.py \
  shiyi_act1_vo.zip assets/rpg_v2/audio/act1
```

脚本会核对 24 个稳定文件名，以最后一段持续静音的起点截掉生成器蜂鸣，并在句尾加入
40ms 淡出；输出统一为 32kHz、单声道 MP3。

## 存档

存档键为 `gleanings.act1.save.v1`。关键节点会自动写入 `localStorage`；刷新后继续，
揭坛中途刷新会安全回退到选择完成状态，坏存档会备份到
`gleanings.act1.corrupt` 并以新档启动。

手动重置可在浏览器控制台执行：

```js
localStorage.removeItem("gleanings.act1.save.v1");
location.reload();
```

## 验证

```bash
pnpm test -- --run
pnpm typecheck
pnpm build
pnpm test:e2e
```

素材规范验证从仓库根目录运行：

```bash
python assets/rpg_v2/scripts/verify_assets.py
```

当前交付覆盖桌面键盘的 640×360 逻辑画布、响应式等比展示和第一幕完整对白配音。
环境音、按键音和移动端虚拟摇杆列为下一轮 P1 增强项；所有关键声音信息仍有文字或视觉
反馈，不影响静音状态下通关。
