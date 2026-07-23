# 纯 2D RPG 风格锚提示词 v2.0

> 目标：严格的 16-bit 俯视 3/4 叙事 RPG，而不是像素滤镜插画、等距 3D 场景或视觉小说背景。

## 全局约束

```text
authentic low-resolution 16-bit top-down 3/4 orthographic narrative RPG,
32x32 tile grid, 32x48 character frame, hard square pixel clusters,
flat stepped 2-3 tone shading, approximately 24 earthy colors,
dark brown, wood, brick red, ochre, parchment and cold blue-gray,
no anti-aliasing, no gradients, no blur, no bloom, no soft glow,
no painterly texture, no 3D render, no isometric diamond grid,
no depth of field, no high-resolution illustration look
```

旧 Batch 0 图只能提供福建冬酿、陶坛、红曲盘、木格窗等题材参考。必须明确写入：

```text
Use the reference only for cultural subject matter. Completely replace its visual
language with a strict reusable tile map and small engine sprites.
```

## 酒坊实机视口

```text
Create a 16:9 gameplay screenshot designed for a native 640x360 canvas.
Show one camera viewport inside a larger 40x28-tile Fujian red-yeast brewery.
Use a consistent top-down 3/4 orthographic grid with clear walkable aisles,
collision boundaries, a 32x48-equivalent player, two smaller NPCs, jar banks,
work tables, red-yeast trays, rice sacks, stove steam, winter windows and an exit.
Include one hard-edged interaction marker and minimal native pixel HUD.
Use abstract pixel glyphs instead of readable text.
```

后处理：

1. 中心裁切到 16:9。
2. 降采样到 `320×180`。
3. 无抖动量化到 `palette/fujian_rpg_24.png`。
4. 最近邻放大 `2×` 到 `640×360`。

## 酒坊 tileset

```text
Create only a square 8x8 tileset atlas for a final 256x256 asset.
Each exact 32x32 cell must contain one reusable top-down 3/4 tile or component:
stone and wood floors, plaster walls, corners, beams, windows, open/closed doors,
shelves, tables, ceramic jars, rice sacks, stove, red-yeast tray, baskets, stool,
ladder, railing, void and floor decals. No title, label, UI or characters.
Do not let shadows spill across cell boundaries.
```

后处理按 8×8 等分裁格，去除生成图外框，将每格收敛到 `32×32` 后再无抖动量化。

## Yi 行走表

```text
Create exactly 12 isolated full-body sprites on uniform #00FF00:
3 columns by 4 rows. Row order: down, left, right, up.
Column order: left-step, idle, right-step.
Same young Fujian heroine Yi in all cells, dark charcoal-blue work clothes,
black tied hair, tiny muted-red hair tie and short brick-red scarf.
No shadow, floor, border, label or UI. Equal spacing and aligned foot baselines.
```

后处理：

1. 识别并移除绿色背景。
2. 逐格取前景包围盒，等比装入 `32×48`。
3. RGB 无抖动量化到项目色板。
4. alpha 阈值化为 `0/255`。
5. 按 `3×4` 重排并输出 `96×192`。

## 生成来源

- 生成模型：OpenAI 内置 `image_gen`。
- 生成日期：2026-07-23。
- 参考图：项目自有 Batch 0 酒坊图及同批生成结果。
- 第三方图片：无。
- 文化审核：`pending`；器物、服饰与冬酿工艺在品牌方或文化顾问确认前只用于 Demo。
