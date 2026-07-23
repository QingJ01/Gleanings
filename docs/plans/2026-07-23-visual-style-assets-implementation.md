# 《拾遗》视觉风格与素材系统 Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 把已确认的“闽地民俗标本馆”方向同步到内容设计、素材清单、项目总设计和入口说明，形成可以直接派活、生成、验收和集成的统一规范。

**Architecture:** 以视觉系统设计稿作为单一风格源，`内容设计.md` 描述玩家看到与经历的体验，`素材需求.md` 描述生产对象、规格和验收，`设计文档.md` 描述参赛与技术闭环，`README.md` 只保留最新摘要。任何资产命名、ERC 标准、赛道组合和 AI 数据流必须跨文档一致。

**Tech Stack:** Markdown、Git、Injective EVM、ERC-721、EIP-712、Web 像素叙事界面、图像生成与前端文字叠加。

---

### Task 1: 固化视觉系统

**Files:**
- Create: `docs/plans/2026-07-23-visual-style-assets-design.md`

**Step 1:** 记录已确认的视觉母题、色板、字体、页面架构、组件、动效与数据流。

**Step 2:** 核对文档包含桌面与移动布局、减弱动效、文化事实边界和生成失败降级。

**Step 3:** 搜索泛化“国潮”、Web3 霓虹和 AI 直接生成文字等反模式，确认均被明确禁止。

### Task 2: 更新内容体验

**Files:**
- Modify: `内容设计.md`

**Step 1:** 把幕四改为“选择回收 → AI 双语文化酒签 → 玩家确认 → 铸造”的完整闭环。

**Step 2:** 补充事实层与创意层边界，确保 AI 不编造文化资料。

**Step 3:** 用完整的视觉、界面、动效和收藏馆章节替换原简略美术段落。

### Task 3: 重构素材生产规范

**Files:**
- Modify: `素材需求.md`

**Step 1:** 增加风格锚、材质库、字体与设计 token。

**Step 2:** 为场景、人物、信物、UI、文化卡、动效、音频和提交物列出稳定 ID、尺寸、状态与优先级。

**Step 3:** 增加 AI 提示词结构、负面词、事实约束、生成失败降级和资产清单。

**Step 4:** 重算 P0 数量与工时，给出按依赖排序的生产批次。

### Task 4: 统一项目口径

**Files:**
- Modify: `设计文档.md`
- Modify: `README.md`

**Step 1:** 将 ERC-1155 全部改为当前实际采用的 ERC-721 + EIP-712 voucher 方案。

**Step 2:** 将主赛道收敛为 SuperZygo、Injective、Qoder；智能少年与其他赛道只列为核对后的备选。

**Step 3:** 将 AI 设计改成“受控事实 + 玩家选择 + 个性化双语文化酒签 + 链上 metadata”的产品闭环。

### Task 5: 验证

**Files:**
- Verify: `README.md`
- Verify: `设计文档.md`
- Verify: `内容设计.md`
- Verify: `素材需求.md`
- Verify: `链上设计.md`

**Step 1:** 运行关键词扫描，确认不存在残留的 ERC-1155、四赛道主策略和智能少年默认参赛表述。

**Step 2:** 检查所有 Markdown 标题、代码围栏、相对链接和素材 ID。

**Step 3:** 对比 Git diff，确认只修改本任务涉及的文档。

**Step 4:** 提交文档变更，提交信息使用 `docs: 完善视觉风格与素材系统`。
