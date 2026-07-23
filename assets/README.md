# 《拾遗》素材包

## v2｜纯 2D RPG（当前方向）

最新生产素材位于 [`rpg_v2/`](rpg_v2/README.md)：

- `640×360` 原生实机视口；
- `40×28`、大于视口的酒坊地图；
- `32×32` tileset / object / item；
- `32×48` 角色单帧与 `3×4` 四方向行走表；
- 固定 24 色、硬透明、仅最近邻整数缩放；
- 1920×1080 v2 风格交付板。

下列 Batch 0 文件继续保留为 v1 题材与文化参考，不与 v2 游戏内素材混用。

当前完成 Batch 0 风格锚：

- `bg/bg_brewery_winter.png`：640×360 冬日酒坊背景。
- `characters/ch_taipo_young.png`：256×384 透明人物立绘。
- `items/base/it_relic_dongniang.png`：1024×1024 透明冬酿曲印。
- `ui/ui_choice_tag_states.png`：720×240 酒签选择三态。
- `deliverables/style_board_1920x1080.png`：风格锚总览。

原始生成图与透明处理中间图保存在 `style/`，生产信息见
`manifest/assets.manifest.json`，提示词见
`prompts/style-anchors-v1.1.md`。

注意：器物、服饰与酿造场景仍需福建老酒品牌方或文化顾问复核，
通过后才能把 `cultural_review` 改为 `approved` 并批量扩产。
