# 🎓 Campus Hub (校园多功能智能留言板)

> 本项目是一个面向大学校园的**综合多功能仪表盘与智能留言社区 (Campus Hub)**。项目融合了学习辅助、日程管理、趣味游戏、智能AI、数据可视化等多个服务模块，致力于为大学生提供一站式的学习与社交体验。

---

## 🌟 项目简介 (Project Introduction)

**Campus Hub** 不仅仅是一个简单的留言板，而是一个围绕校园生活与学习场景构建的**微服务集成社区**。我们针对校园日常的 7 个核心痛点设计了对应的功能板块：

1.  **📚 学习辅助工具 (Study Assistant)**：集成番茄工作专注钟，内置康奈尔笔记整理器并支持一键导出。
2.  **📅 日程管理服务 (Schedule Management)**：支持创建备考、学习小组日程，提供实时倒计时，并支持一键同步招募信息到留言板。
3.  **🎮 校园答题游戏 (Games)**：内置趣味校园常识与学术知识挑战赛，结合了连击积分加成与成就勋章解锁系统。
4.  **💬 社区留言服务 (Community Service)**：核心留言模块，支持 7 大类别分类检索、点赞、回复、匿名昵称头像生成（DiceBear 动态渲染）。
5.  **🤖 AI 应用服务 (AI Powered)**：集成了 Google Gemini 大模型接口。未配置 API Key 时使用智能语境模拟器，配置后一键升级为真实 AI 导师，支持文案润色与康奈尔笔记智能归纳。
6.  **📊 数据可视化服务 (Data Visualization)**：通过 Chart.js 绘制留言类别分布柱状图、系统活跃指数折线图、日程占比饼图与答题正确率仪表盘。
7.  **💡 创新创意项目 (Creative Ideas)**：专门开辟“创意项目”板块，鼓励学生发布宿舍物联网设计、开源项目等并招募队友。

---

## ⚙️ 技术栈 (Tech Stack)

*   **前端核心**：HTML5, CSS3 (原生响应式 CSS 变量系统, 毛玻璃 Glassmorphism 动效), JavaScript (Vanilla ES6+)
*   **状态与数据持久化**：
    *   **本地模式**：`LocalStorage` 自动读取/保存
    *   **云端模式 (Supabase)**：连接 Supabase 后，通过标准的 RESTful API 协议实现云端跨设备同步
*   **数据可视化**：`Chart.js` (集成折线图、柱状图、饼图等，支持深浅色模式色调自适应)
*   **AI 核心**：`Google Gemini API` (支持 Gemini-2.5-Flash 进行文本生成与总结)
*   **图标与多媒体**：`Lucide Icons` (现代扁平化图标库), `Web Audio API` (利用浏览器内置音频合成技术产生答题与计时音效，无需加载外部音频文件)
*   **头像生成**：`DiceBear Adventurer SVG API` (根据用户昵称哈希值动态渲染趣味探险家头像)

---

## 🚀 主要功能演示 (Key Features)

### 1. 动态双模数据库 (Supabase + LocalStorage)
在“系统设置”中填入您的 Supabase URL 与 Anon Key，系统将自动从 `LocalStorage` 切换到 **Supabase 数据库**。所有留言、点赞和评论将实时保存到云端数据库中。如果云端连接失败，系统会无缝退回到本地存储，确保业务永不中断。

### 2. 真实 AI 对话与辅助
*   **文案润色**：写留言时词不达意？点击“AI 帮我润色”，AI 自动为您生成排版精美、富有号召力的发言（如招募组员）。
*   **康奈尔笔记生成**：输入杂乱的课堂手记，点击“AI 总结”，自动提炼出“左侧线索栏”与“底部总结栏”，可直接导出为标准文本格式。
*   **智能聊天**：在“智能学伴”面板可随时与大模型对话，解答各种学科疑问。

### 3. 校园挑战赛与勋章系统
内置 7 道涉及学习方法、计算机、校园常识的趣味题，答对可获得积分。连续答对 5 题将触发连击加分。积分累计到一定程度可以提升等级（LV.1 -> LV.2），并解锁如“专注学者”、“知识达人”等勋章，勋章与等级信息会展示在侧边栏及留言板昵称旁。

---

## 🛠️ 运行方法 (How to Run)

本项目**完全基于静态网页技术构建**，无需安装复杂的 `npm` 依赖，您可以选择以下两种方式之一运行：

### 方法 1：直接运行 (推荐，适合快速预览)
1. 双击打开文件夹中的 [index.html](file:///c:/Users/HP/rby/新建文件夹/index.html)。
2. 项目支持响应式布局，按下 `F12` 键切换到移动端视图即可体验完美的手机/平板端界面。

### 方法 2：使用轻量服务器运行 (以获得更好的 API 连接表现)
如果您已经安装了 Node.js，您可以使用 `npx` 启动一个轻量级的 HTTP 服务器：
```bash
# 进入项目根目录
cd "c:/Users/HP/rby/新建文件夹"

# 启动 live-server 
npx live-server
# 或者使用 http-server
npx http-server
```
浏览器会自动打开 `http://127.0.0.1:8080` 进行访问。

---

## 📂 Supabase 数据库建表 SQL 参考

若要开启 Supabase 同步功能，请在 Supabase 的 SQL Editor 中运行以下建表语句：

```sql
create table posts (
  id text primary key,
  nickname text not null,
  title text not null,
  content text not null,
  category text not null,
  upvotes integer default 0,
  replies jsonb default '[]'::jsonb,
  tags jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 开启安全防护但允许 Public 的匿名读写 (开发调试用)
alter table posts enable row level security;
create policy "Allow public read" on posts for select using (true);
create policy "Allow public insert" on posts for insert with check (true);
create policy "Allow public update" on posts for update using (true);
```

---

## 🛠️ 开发过程中遇到的问题与解决方案

### 问题 1：如何优雅处理 AI 大模型在未配置 API Key 时的可用性？
*   **解决方案**：我们设计了 **“双轨制”AI 引擎**。程序中封装了 `AIService` 模块。当检测到 localStorage 中未保存 Gemini API Key 时，自动启用内置的 **“本地语境模拟器”**。它使用正则匹配与模板渲染技术，针对“番茄工作法”、“康奈尔笔记法”、“文案润色”等请求返回极具参考价值的本地建议。一旦用户输入 API Key，则平滑升级为真实的 Gemini 模型调用，不仅保障了无配置情况下的系统可用性，也提供了高级用户的提分扩展项。

### 问题 2：如何在静态页面中实现音效，同时避免加载外部 mp3 导致跨域或加载缓慢？
*   **解决方案**：在番茄钟结束和答题对错判断时，我们希望提供音效提升 UX。为了不依赖外部 `.wav` 或 `.mp3` 静态文件，我们利用了浏览器原生的 **`Web Audio API`**。在 `app.js` 中创建 `AudioContext`，动态合成不同频率的正弦波音效（例如答对时播放高音 C5-E5-G5 渐进音，答错时播放低沉的 A3 单音）。这做到了 0 字节体积、100% 离线可用和极佳的响应速度。

### 问题 3：如何确保 Chart.js 在图表数据更新时不会发生“Canvas already in use”的报错？
*   **解决方案**：在留言板发帖、更改日程或答题后，可视化数据会发生改变，直接调用 Chart 构造函数会导致 Canvas 冲突报错。为此我们在 `AppStore` 状态机中维护了一个 `chartInstances` 哈希表。每次重新渲染图表前，遍历并调用 `store.chartInstances[key].destroy()` 销毁旧实例，然后再创建新的图表实例，完美实现了流畅的数据更新动画与图表过渡。

---

## 🤖 使用的 AI 工具介绍

本项目在开发中使用了 **Antigravity (Google DeepMind 团队研发)** 作为核心 AI pair-programmer 进行协作。
*   **系统架构设计**：AI 帮助规划了 SPA 路由与 LocalStorage/Supabase 的解耦式状态机结构。
*   **CSS 设计体系**：AI 编写了毛玻璃风格（Glassmorphism）和渐变色设计，并完成了完备的响应式媒体查询（Media Queries）以适配移动端。
*   **逻辑实现**：AI 协作编写了基于 fetch 的轻量级 Supabase HTTP API 接口、Web Audio 音频合成器以及 Chart.js 的销毁与重建逻辑。
