# 《拾遗》纯 2D 像素 RPG v2 Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 建立可实际用于 640×360 叙事 RPG 的 v2 像素素材系统，并交付酒坊实机截图、tileset、Yi 行走表、交互物和原生像素 UI 风格锚。

**Architecture:** v1 插画素材保持只读，v2 使用独立目录、固定 24 色主色板和严格网格。图像生成只提供受约束的原始像素构图，最终交付通过裁切、色板映射、硬边 alpha 与整数倍验证形成。

**Tech Stack:** OpenAI 内置 `image_gen`、PNG、32×32 tile、32×48 sprite、640×360 原生画布、PowerShell/System.Drawing、项目 manifest。

---

### Task 1: 建立 v2 资产骨架

**Files:**
- Create: `assets/rpg_v2/palette/master-palette.png`
- Create: `assets/rpg_v2/manifest/assets.manifest.json`
- Create: `assets/rpg_v2/prompts/style-anchors-v2.md`

**Steps:**

1. 建立 v2 目录。
2. 写入 24 色主色板。
3. 建立包含尺寸、网格、alpha 和审核状态的 manifest。
4. 验证 v1 与 v2 路径无覆盖。

### Task 2: 制作酒坊实机截图

**Files:**
- Create: `assets/rpg_v2/previews/preview_brewery_gameplay_640x360.png`

**Steps:**

1. 用 @imagegen 生成严格 3/4 俯视 16-bit RPG 酒坊原图。
2. 去除连续渐变和绘画式阴影，映射到固定色板。
3. 输出 640×360。
4. 检查人物、地面与器物投影一致。

### Task 3: 制作酒坊 tileset

**Files:**
- Create: `assets/rpg_v2/tilesets/tileset_brewery_256x256.png`

**Steps:**

1. 生成 8×8、每格 32×32 的候选 tileset。
2. 对齐地面、墙、窗、门、陶坛、桌和红曲托盘。
3. 移除网格线与跨格对象污染。
4. 验证图片尺寸能被 32 整除，颜色属于主色板。

### Task 4: 制作 Yi 行走表

**Files:**
- Create: `assets/rpg_v2/sprites/spr_yi_walk_96x192.png`

**Steps:**

1. 生成同一角色的 12 帧四方向动作候选。
2. 去色键背景，硬化 alpha。
3. 按“下、左、右、上”排列成 3×4 图集。
4. 验证每帧 32×48、轮廓与服装一致。

### Task 5: 制作交互物与 UI

**Files:**
- Create: `assets/rpg_v2/objects/obj_hongqu_tray_32x32.png`
- Create: `assets/rpg_v2/ui/ui_rpg_hud_640x360.png`

**Steps:**

1. 从 tileset 或独立生成结果制作 32×32 红曲托盘。
2. 设计任务条、交互提示、对话框和背包快捷位。
3. UI 直接按原生画布绘制，不缩小高清面板。
4. 检查长中英文文本安全区。

### Task 6: 组合与验证

**Files:**
- Create: `assets/rpg_v2/previews/style_board_rpg_v2_1920x1080.png`
- Modify: `素材需求.md`
- Modify: `assets/README.md`
- Modify: `CREDITS.md`

**Steps:**

1. 使用整数倍最近邻放大组合风格板。
2. 更新 v2 manifest、提示词和来源。
3. 运行尺寸、网格、色板、alpha 与 Markdown 链接检查。
4. 人工检查没有 v1 插画或浮雕素材混入。
5. 提交：`assets: establish pure 2d rpg style`.
