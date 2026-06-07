/**
 * Campus Hub - Main Application Script
 * Features: SPA Router, Store Manager (LocalStorage & Supabase), 
 * AI Client (Gemini API & Mock), Pomodoro Timer, Trivia Game, 
 * Cornell Notes, and Data Visualization (Chart.js).
 */

// ==========================================================================
// 1. Initial Mock Data
// ==========================================================================
const INITIAL_POSTS = [
    {
        id: "mock-1",
        nickname: "不爱脱发的程序猿",
        title: "求组队！2026年全国大学生数学建模竞赛",
        content: "寻找一名擅长论文写作（最好是文科/管理学背景）和一名擅长 MATLAB/Python 建模的队友！我们目前已经有一名擅长算法的组员。目标是拿省一，冲国奖！有兴趣的同学请回复，或者私聊我！\n\n【时间安排】每周周末进行真题模拟演练。\n【要求】有较强的时间观念，不拖延。",
        category: "study",
        tags: ["组队"],
        upvotes: 12,
        replies: [
            { author: "学渣瑟瑟发抖", text: "顶一下！可惜我只会Excel画图，祝大佬早日组队成功！" },
            { author: "极客小张", text: "Python建模可以吗？我做过两个机器学习相关的预测项目。" }
        ],
        created_at: new Date(Date.now() - 3600000 * 24).toISOString() // 1 day ago
    },
    {
        id: "mock-2",
        nickname: "人工智能探索者",
        title: "分享一个利用本地小模型整理专业课笔记的 Prompt 模板",
        content: "最近在用 AI 整理《数字信号处理》和《西方经济学》笔记，写出了一个非常好用的 Prompt。\n它可以自动提取笔记中的【核心定理/名词解释】、【推导逻辑】和【思考题】，非常适合期末快速复习用。Prompt 如下：\n\n`请将以下课堂杂乱记录转化为康奈尔笔记格式...`（详细见 AI 板块的模板）",
        category: "ai",
        tags: ["创意"],
        upvotes: 24,
        replies: [
            { author: "学习狂魔", text: "收藏了！试了一下整理高等代数，结构感强了好多！" }
        ],
        created_at: new Date(Date.now() - 3600000 * 5).toISOString() // 5 hours ago
    },
    {
        id: "mock-3",
        nickname: "爱吃食堂的小雨",
        title: "今天三食堂二楼新开的石锅拌饭有人试过吗？",
        content: "排队的人超级多！听说开业前三天打八折，味道相比老食堂的如何？求排雷，好吃的话下午下课冲了！",
        category: "community",
        tags: ["日常树洞"],
        upvotes: 8,
        replies: [
            { author: "美食达人", text: "肉很多！酱汁调得偏甜，整体打 8.5 分，值得一试。" },
            { author: "泡面伴侣", text: "排队大概需要20分钟，建议避开12点高峰期。" }
        ],
        created_at: new Date(Date.now() - 3600000 * 2).toISOString() // 2 hours ago
    },
    {
        id: "mock-4",
        nickname: "创意大爆炸",
        title: "【开源项目】基于 ESP32 的寝室智能门禁锁",
        content: "我们团队设计了一款低成本寝室门锁，支持人脸识别与微信小程序一键开锁。目前电路板设计和嵌入式代码已经开源在 GitHub。\n现在想招募一位会 3D 建模的同学帮忙设计好看的外壳，并参加这学期的物联网创意大赛！",
        category: "creative",
        tags: ["创意"],
        upvotes: 18,
        replies: [],
        created_at: new Date(Date.now() - 3600000 * 48).toISOString() // 2 days ago
    }
];

const INITIAL_SCHEDULES = [
    {
        id: "sched-1",
        title: "《微积分》期末冲刺小组自习",
        date: new Date(Date.now() + 3600000 * 24).toISOString().split('T')[0], // tomorrow
        time: "14:00",
        type: "group",
        duration: 120,
        desc: "地点：图书馆四楼北侧自习室。主要刷历年期末真题，欢迎带题来问！"
    },
    {
        id: "sched-2",
        title: "英语六级听力突破练习",
        date: new Date().toISOString().split('T')[0], // today
        time: "19:30",
        type: "study",
        duration: 45,
        desc: "线上腾讯会议，练习历年听力真题，跟读精听。"
    }
];

// ==========================================================================
// 2. Local State Management (AppStore)
// ==========================================================================
class AppStore {
    constructor() {
        this.loadSettings();
        this.initData();
        this.activeView = 'dashboard';
        this.chartInstances = {};
    }

    loadSettings() {
        // Theme settings
        this.theme = localStorage.getItem('campus_theme') || 'light';
        document.documentElement.setAttribute('data-theme', this.theme);
        
        // Supabase configurations
        this.sbUrl = localStorage.getItem('campus_sb_url') || '';
        this.sbKey = localStorage.getItem('campus_sb_key') || '';
        this.isSbActive = this.sbUrl && this.sbKey;

        // AI configuration
        this.aiKey = localStorage.getItem('campus_ai_key') || '';
        this.isAiReal = !!this.aiKey;

        // User stats
        this.user = JSON.parse(localStorage.getItem('campus_user')) || {
            name: '校园新人',
            points: 10,
            level: 1,
            badges: ['rookie'], // rookie, trivia-starter, pomo-scholar, trivia-master, community-star
            focusMinutes: 0,
            quizCorrect: 0,
            quizTotal: 0
        };
    }

    initData() {
        // Load posts
        const cachedPosts = localStorage.getItem('campus_posts');
        this.posts = cachedPosts ? JSON.parse(cachedPosts) : INITIAL_POSTS;
        if (!cachedPosts) {
            localStorage.setItem('campus_posts', JSON.stringify(this.posts));
        }

        // Load schedules
        const cachedSchedules = localStorage.getItem('campus_schedules');
        this.schedules = cachedSchedules ? JSON.parse(cachedSchedules) : INITIAL_SCHEDULES;
        if (!cachedSchedules) {
            localStorage.setItem('campus_schedules', JSON.stringify(this.schedules));
        }

        // Notifications
        this.notifications = [
            { id: 'n1', text: '欢迎来到 Campus Hub！开始探索多功能服务吧。', time: '刚才', type: 'info', unread: true },
            { id: 'n2', text: '您已解锁“初来乍到”勋章，获得 10 积分！', time: '刚才', type: 'gift', unread: true }
        ];
    }

    saveLocalData() {
        localStorage.setItem('campus_posts', JSON.stringify(this.posts));
        localStorage.setItem('campus_schedules', JSON.stringify(this.schedules));
        localStorage.setItem('campus_user', JSON.stringify(this.user));
    }

    // --- User Profile operations ---
    updateUsername(newName) {
        if (!newName || newName.trim() === '') return;
        this.user.name = newName.trim();
        this.saveLocalData();
        this.addNotification(`昵称成功修改为“${this.user.name}”`, 'info');
    }

    addPoints(pts) {
        this.user.points += pts;
        // Simple level logic: 100 points per level
        const newLevel = Math.floor(this.user.points / 100) + 1;
        if (newLevel > this.user.level) {
            this.user.level = newLevel;
            this.addNotification(`🎉 恭喜你升级到 LV.${this.user.level}！继续保持！`, 'gift');
        }
        this.saveLocalData();
    }

    unlockBadge(badgeId) {
        if (!this.user.badges.includes(badgeId)) {
            this.user.badges.push(badgeId);
            this.addPoints(30); // 30 points reward for unlocking a badge
            const badgeNames = {
                'trivia-starter': '答题新手',
                'trivia-master': '知识达人',
                'pomo-scholar': '专注学者',
                'community-star': '社区明星'
            };
            this.addNotification(`🏆 解锁新勋章：【${badgeNames[badgeId]}】！获得 30 积分奖励。`, 'gift');
            this.saveLocalData();
            return true;
        }
        return false;
    }

    // --- DB Operations (Dual Mode Support) ---
    async getPosts() {
        if (!this.isSbActive) {
            return this.posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
        try {
            const res = await fetch(`${this.sbUrl}/rest/v1/posts?order=created_at.desc`, {
                headers: {
                    'apikey': this.sbKey,
                    'Authorization': `Bearer ${this.sbKey}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!res.ok) throw new Error("Supabase Fetch failed");
            const data = await res.json();
            return data;
        } catch (e) {
            console.error("Failed to connect Supabase, falling back to LocalStorage:", e);
            this.showDbStatus("Supabase 离线，自动降级为本地数据", 'yellow');
            return this.posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
    }

    async addPost(title, content, nickname, category, tag) {
        const newPost = {
            id: 'post-' + Date.now() + Math.random().toString(36).substr(2, 5),
            nickname: nickname || this.user.name,
            title,
            content,
            category,
            tags: [tag],
            upvotes: 0,
            replies: [],
            created_at: new Date().toISOString()
        };

        if (this.isSbActive) {
            try {
                const res = await fetch(`${this.sbUrl}/rest/v1/posts`, {
                    method: 'POST',
                    headers: {
                        'apikey': this.sbKey,
                        'Authorization': `Bearer ${this.sbKey}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(newPost)
                });
                if (!res.ok) throw new Error("Supabase insert error");
                this.addPoints(10); // Reward for writing a post
                this.checkCommunityStarBadge();
                return await res.json();
            } catch (e) {
                console.error("Supabase insert failed. Saving to LocalStorage:", e);
            }
        }

        // Local Storage fallback
        this.posts.unshift(newPost);
        this.addPoints(10);
        this.checkCommunityStarBadge();
        this.saveLocalData();
        return newPost;
    }

    async upvotePost(postId) {
        // Check if upvoted already (use session memory to prevent double voting)
        const sessionUpvotes = JSON.parse(sessionStorage.getItem('campus_voted_posts') || '[]');
        if (sessionUpvotes.includes(postId)) {
            return false;
        }

        if (this.isSbActive) {
            try {
                // Fetch current upvote count first
                const getRes = await fetch(`${this.sbUrl}/rest/v1/posts?id=eq.${postId}`, {
                    headers: { 'apikey': this.sbKey, 'Authorization': `Bearer ${this.sbKey}` }
                });
                const posts = await getRes.json();
                if (posts.length > 0) {
                    const newUpvotes = (posts[0].upvotes || 0) + 1;
                    await fetch(`${this.sbUrl}/rest/v1/posts?id=eq.${postId}`, {
                        method: 'PATCH',
                        headers: {
                            'apikey': this.sbKey,
                            'Authorization': `Bearer ${this.sbKey}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ upvotes: newUpvotes })
                    });
                    sessionUpvotes.push(postId);
                    sessionStorage.setItem('campus_voted_posts', JSON.stringify(sessionUpvotes));
                    return true;
                }
            } catch (e) {
                console.error("Supabase upvote failed:", e);
            }
        }

        // Local fallback
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            post.upvotes += 1;
            sessionUpvotes.push(postId);
            sessionStorage.setItem('campus_voted_posts', JSON.stringify(sessionUpvotes));
            this.saveLocalData();
            return true;
        }
        return false;
    }

    async addReply(postId, author, text) {
        if (!text || text.trim() === '') return null;
        const newReply = { author: author || this.user.name, text: text.trim() };

        if (this.isSbActive) {
            try {
                // Fetch existing replies
                const getRes = await fetch(`${this.sbUrl}/rest/v1/posts?id=eq.${postId}`, {
                    headers: { 'apikey': this.sbKey, 'Authorization': `Bearer ${this.sbKey}` }
                });
                const posts = await getRes.json();
                if (posts.length > 0) {
                    const replies = posts[0].replies || [];
                    replies.push(newReply);
                    await fetch(`${this.sbUrl}/rest/v1/posts?id=eq.${postId}`, {
                        method: 'PATCH',
                        headers: {
                            'apikey': this.sbKey,
                            'Authorization': `Bearer ${this.sbKey}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ replies })
                    });
                    return newReply;
                }
            } catch (e) {
                console.error("Supabase reply failed:", e);
            }
        }

        // Local fallback
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            if (!post.replies) post.replies = [];
            post.replies.push(newReply);
            this.saveLocalData();
            return newReply;
        }
        return null;
    }

    checkCommunityStarBadge() {
        // If user has written > 3 posts, unlock community star
        const writtenPosts = this.posts.filter(p => p.nickname === this.user.name).length;
        if (writtenPosts >= 3) {
            this.unlockBadge('community-star');
        }
    }

    // --- Schedule Operations ---
    getSchedules() {
        return this.schedules.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateA - dateB;
        });
    }

    addSchedule(title, date, time, type, duration, desc, shareToBoard = false) {
        const newSched = {
            id: 'sched-' + Date.now(),
            title,
            date,
            time,
            type,
            duration: parseInt(duration),
            desc
        };
        this.schedules.push(newSched);
        this.addPoints(15); // Reward for organizing schedule

        if (shareToBoard) {
            const typesZh = { 'study': '自习备考', 'group': '学习小组', 'exam': '考试倒计时', 'activity': '校园活动' };
            const content = `我发起了一个日程活动！一起来学习吧！\n\n【日程主题】${title}\n【时间】${date} ${time} (预计时长 ${duration} 分钟)\n【详情】${desc || "无描述"}\n\n期待大家的加入！`;
            this.addPost(`【日程招募】${title}`, content, this.user.name, 'schedule', '组队');
        }

        this.saveLocalData();
        return newSched;
    }

    deleteSchedule(id) {
        this.schedules = this.schedules.filter(s => s.id !== id);
        this.saveLocalData();
    }

    // --- Notification Helper ---
    addNotification(text, type = 'info') {
        const noti = {
            id: 'n-' + Date.now(),
            text,
            time: '刚才',
            type,
            unread: true
        };
        this.notifications.unshift(noti);
        
        // Update DOM notifications dynamically
        this.renderNotifications();
    }

    renderNotifications() {
        const listEl = document.getElementById('notifications-list');
        const badgeEl = document.getElementById('noti-badge');
        
        const unreadCount = this.notifications.filter(n => n.unread).length;
        badgeEl.textContent = unreadCount;
        badgeEl.style.display = unreadCount > 0 ? 'flex' : 'none';

        if (!listEl) return;
        
        if (this.notifications.length === 0) {
            listEl.innerHTML = '<div class="empty-state"><p>暂无新通知</p></div>';
            return;
        }

        listEl.innerHTML = this.notifications.map(n => `
            <div class="notification-item ${n.unread ? 'unread' : ''}" data-id="${n.id}">
                <div class="noti-icon ${n.type === 'gift' ? 'gift' : 'info'}">
                    <i data-lucide="${n.type === 'gift' ? 'award' : 'info'}"></i>
                </div>
                <div class="noti-details">
                    <p>${n.text}</p>
                    <span>${n.time}</span>
                </div>
            </div>
        `).join('');
        lucide.createIcons();

        // Bind read events
        listEl.querySelectorAll('.notification-item').forEach(el => {
            el.addEventListener('click', () => {
                const id = el.dataset.id;
                const noti = this.notifications.find(n => n.id === id);
                if (noti) {
                    noti.unread = false;
                    el.classList.remove('unread');
                    this.renderNotifications();
                }
            });
        });
    }

    showDbStatus(text, dotColor) {
        const badge = document.getElementById('db-status-badge');
        if (badge) {
            const dot = badge.querySelector('.indicator-dot');
            const txt = badge.querySelector('.indicator-text');
            dot.className = `indicator-dot ${dotColor}`;
            txt.textContent = text;
        }
    }
}

const store = new AppStore();

// ==========================================================================
// 3. AI Service (Gemini API & Rule-based Mock AI)
// ==========================================================================
class AIService {
    static async callAI(prompt) {
        if (store.isAiReal) {
            try {
                // Call actual Gemini API (Google Generative AI REST endpoint)
                const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${store.aiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: `你是一个温柔的校园智能学习助手 (Campus Hub AI Helper)，用户正使用校园留言板，请用友好、鼓励的口吻回答以下问题，必要时使用 emoji 丰富排版：\n\n${prompt}` }]
                        }]
                    })
                });
                if (!res.ok) throw new Error("Gemini API request failed");
                const data = await res.json();
                return data.candidates[0].content.parts[0].text;
            } catch (e) {
                console.error("Gemini API error, falling back to mock chatbot response:", e);
                return "📡 [AI 连接故障]：真是抱歉，云端大脑连接遇到了些小阻碍，我已经自动帮您切换到本地轻量级学习智囊啦！\n\n" + this.mockAIResponse(prompt);
            }
        } else {
            return new Promise((resolve) => {
                setTimeout(() => resolve(this.mockAIResponse(prompt)), 1000); // simulate delay
            });
        }
    }

    static mockAIResponse(prompt) {
        const query = prompt.toLowerCase();
        
        if (query.includes('润色') || query.includes('排版') || query.includes('修饰')) {
            return `✨ **学伴润色推荐版** ✨\n\n【留言主题】寻找志同道合的学习伙伴 🎯\n\n【详细内容】\n大家好呀！今天开始备战数学建模/英语六级啦！感觉一个人学习容易懈怠，所以想在留言板上招募几位专注于此的小伙伴。我们可以组成**【每日打卡小组】**，每周在图书馆线下集中自习 2-3 次，互通有无，共享复习资料！\n\n有共同目标的小伙伴快来点击日程加入我吧，或者直接在下方评论留言！让我们一起加油，期末不挂科！💯\n\n---\n*💡 提示：你可以直接将此文本复制发表哦！*`;
        }
        
        if (query.includes('番茄') || query.includes('工作法') || query.includes('时间管理')) {
            return `⏰ **番茄工作法学习指南**：\n\n1. **专注工作**：设定 25 分钟倒计时（右侧已有专注钟，快来试试！），在此期间彻底断绝手机、社交媒体等干扰，只专注于手头的事。\n2. **短暂休息**：25 分钟一到，强制休息 5 分钟，喝水、站立活动、远眺眼部肌肉放松。\n3. **循环往复**：完成 4 个番茄周期后，进行一次 15-30 分钟的长休息。\n\n🌟 *学伴寄语：最重要的是培养节奏感，让大脑在专注与放松间顺畅切换。*`;
        }

        if (query.includes('康奈尔') || query.includes('笔记') || query.includes('怎么记')) {
            return `📝 **康奈尔笔记法（5R原则）精髓**：\n\n1. **记录 (Record)**：在右侧大板块中实时记录课堂的核心观点、论据和公式。\n2. **简化 (Reduce)**：课后在左侧“线索”栏提取关键词、考点和核心疑问。\n3. **背诵 (Recite)**：遮住右侧笔记，仅看左侧“线索”回忆内容并大声说出来。\n4. **思考 (Reflect)**：将笔记内容与学过的内容结合，写下理解与扩展。\n5. **复习 (Review)**：每周花 10 分钟快速浏览笔记。最下方“总结”栏非常关键，它是对整篇笔记的精缩定义。`;
        }

        if (query.includes('期末') || query.includes('高数') || query.includes('备考') || query.includes('挂科')) {
            return `📚 **期末高效复习锦囊**：\n\n1. **梳理目录结构**：先花半小时将整本书的章节框架画出思维导图，知道重点分布。\n2. **主攻课后题与错题**：理科类专业课（高数、线代、物理）的大题通常来源于课后习题变体，反复练习错题是提分最快的手段。\n3. **抱团自习**：建议使用我们的 **“学习日程表”** 发起或加入一个自习小组。教别人是最好的学习方式（费曼学习法）！`;
        }

        // Default response
        return `🎓 **你好呀！我是你的智能学伴。**\n\n关于你的提问，我建议你可以试试以下学习方案：\n1. 用 **番茄钟** 规划接下来的 25 分钟学习任务，克服拖延症。\n2. 遇到难点概念，推荐用 **康奈尔笔记整理器** 将其提炼梳理成系统知识。\n3. 在 **校园留言板** 搜索你感兴趣的标签（如 “#求助”、“#组队”），寻找志同道合的小伙伴交流探讨。\n\n如果有更具体的问题（如“如何备战高数”或“帮我润色文案”），可以随时问我哦！加油！✨`;
    }
}

// AI Tip Data
const AI_TIPS = [
    "“学习并不是为了证明什么，而是为了探索你未曾见过的世界。”",
    "费曼学习法：尝试把一个复杂概念用大白话讲给没有背景的人听，讲不明白的地方就是你的短板。",
    "克服拖延的小秘诀：告诉自己先做5分钟。一旦开始，大自然会帮你做完剩下的95%。",
    "背单词诀窍：不要试图一次背住，而是要在极短的时间内快速重复刷，混个眼熟，第5次见面你就记住它了。",
    "保持充足睡眠！研究表明，睡眠在巩固日间所学记忆上起到了不可替代的作用。"
];

// ==========================================================================
// 4. SPA Router & View Manager
// ==========================================================================
class Router {
    static init() {
        const handleRoute = () => {
            const hash = window.location.hash || '#dashboard';
            const viewId = hash.replace('#', '');
            const targetView = document.getElementById(`view-${viewId}`);
            
            if (targetView) {
                // Remove active classes
                document.querySelectorAll('.content-view').forEach(view => view.classList.remove('active'));
                document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
                
                // Add active classes
                targetView.classList.add('active');
                const activeMenu = document.querySelector(`.menu-item[data-view="${viewId}"]`);
                if (activeMenu) activeMenu.classList.add('active');
                
                store.activeView = viewId;
                
                // Call page-specific refresh logic
                this.onViewChange(viewId);
            }
        };

        window.addEventListener('hashchange', handleRoute);
        window.addEventListener('load', handleRoute);

        // Sidebar clicks
        document.querySelectorAll('.menu-item').forEach(link => {
            link.addEventListener('click', (e) => {
                const targetView = link.dataset.view;
                window.location.hash = targetView;
            });
        });
    }

    static onViewChange(viewId) {
        if (viewId === 'dashboard') {
            renderDashboard();
        } else if (viewId === 'board') {
            renderBoard();
        } else if (viewId === 'scheduler') {
            renderScheduler();
        } else if (viewId === 'data-viz') {
            renderDataViz();
        } else if (viewId === 'game') {
            renderGame();
        }
    }
}

// ==========================================================================
// 5. Dashboard Renderer
// ==========================================================================
async function renderDashboard() {
    // Welcome username
    document.getElementById('welcome-username').textContent = store.user.name;
    
    // Quick stats updates
    const posts = await store.getPosts();
    document.getElementById('dashboard-stat-posts').textContent = posts.length;
    
    const today = new Date().toISOString().split('T')[0];
    const todayEvents = store.schedules.filter(s => s.date === today).length;
    document.getElementById('dashboard-stat-events').textContent = todayEvents;
    
    document.getElementById('dashboard-stat-focus').textContent = `${store.user.focusMinutes}m`;

    // Render hot posts (top 3 upvotes)
    const hotPostsList = document.getElementById('dashboard-hot-posts');
    const sortedHot = [...posts].sort((a, b) => b.upvotes - a.upvotes).slice(0, 3);
    
    if (sortedHot.length === 0) {
        hotPostsList.innerHTML = '<div class="empty-state"><p>暂无讨论</p></div>';
    } else {
        hotPostsList.innerHTML = sortedHot.map(p => `
            <a href="#board" class="hot-post-item">
                <div class="hot-post-content">
                    <div class="hot-post-title">${p.title}</div>
                    <div class="hot-post-meta">by ${p.nickname} · ${p.replies.length}条回复</div>
                </div>
                <div class="hot-post-upvotes">
                    <i data-lucide="heart"></i>
                    <span>${p.upvotes}</span>
                </div>
            </a>
        `).join('');
        lucide.createIcons();
    }

    // Render today schedule preview
    const todaySchedList = document.getElementById('dashboard-schedule-list');
    const todayScheds = store.schedules.filter(s => s.date === today).slice(0, 3);
    
    if (todayScheds.length === 0) {
        todaySchedList.innerHTML = `
            <div class="empty-state">
                <i data-lucide="sparkles"></i>
                <p>今天还没有安排学习活动哦~</p>
            </div>
        `;
        lucide.createIcons();
    } else {
        const typesZh = { 'study': '自习', 'group': '小组', 'exam': '考试', 'activity': '活动' };
        todaySchedList.innerHTML = todayScheds.map(s => `
            <div class="dash-sched-item">
                <div class="dash-sched-time">${s.time}</div>
                <div class="dash-sched-info">
                    <div class="dash-sched-title">${s.title}</div>
                </div>
                <div class="dash-sched-badge">${typesZh[s.type]}</div>
            </div>
        `).join('');
    }
}

// ==========================================================================
// 6. Message Board Renderer
// ==========================================================================
let currentBoardFilter = 'all';

async function renderBoard() {
    const listEl = document.getElementById('board-posts-list');
    if (!listEl) return;
    
    listEl.innerHTML = '<div class="empty-state"><p>数据同步中...</p></div>';
    
    const posts = await store.getPosts();
    
    // Filter
    const filtered = currentBoardFilter === 'all' 
        ? posts 
        : posts.filter(p => p.category === currentBoardFilter);

    if (filtered.length === 0) {
        listEl.innerHTML = `
            <div class="empty-state">
                <i data-lucide="message-square-dashed"></i>
                <p>该分类下暂无留言，快来发一条吧！</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    const categoriesZh = {
        'study': '📚 学习辅助', 'schedule': '📅 日程分享', 'game': '🎮 校园游戏',
        'community': '💬 社区服务', 'ai': '🤖 AI 应用', 'data-viz': '📊 数据分析',
        'creative': '💡 创意项目'
    };

    listEl.innerHTML = filtered.map(p => {
        // Date parse
        const dateStr = new Date(p.created_at).toLocaleString('zh-CN', {
            month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        // Generate comments markup
        const commentsMarkup = p.replies.map(r => `
            <div class="comment-item">
                <span class="comment-author">${r.author}:</span>
                <span class="comment-text">${r.text}</span>
            </div>
        `).join('');

        return `
            <div class="post-card" data-id="${p.id}">
                <div class="post-card-header">
                    <div class="post-author-info">
                        <img class="post-author-avatar" src="https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(p.nickname)}" alt="Avatar">
                        <div>
                            <span class="post-author-name">${p.nickname}</span>
                            <span class="post-tag-badge">${p.tags?.[0] || '讨论'}</span>
                        </div>
                    </div>
                    <span class="post-category-tag cat-tag-${p.category}">${categoriesZh[p.category] || p.category}</span>
                </div>
                <div class="post-card-body">
                    <h2>${p.title}</h2>
                    <p>${p.content}</p>
                </div>
                <div class="post-card-footer">
                    <span class="post-meta-details">发表于 ${dateStr}</span>
                    <div class="post-actions">
                        <button class="post-action-btn upvote-btn" onclick="handleUpvote('${p.id}')">
                            <i data-lucide="heart"></i>
                            <span>赞 (${p.upvotes})</span>
                        </button>
                        <button class="post-action-btn comment-btn" onclick="toggleComments('${p.id}')">
                            <i data-lucide="message-circle"></i>
                            <span>评论 (${p.replies.length})</span>
                        </button>
                    </div>
                </div>
                <!-- Comments list -->
                <div class="post-comments-section" id="comments-section-${p.id}">
                    <div class="comment-list" id="comment-list-${p.id}">
                        ${commentsMarkup || '<div class="empty-state" style="padding: 10px;"><p>暂无评论，留下第一步足迹吧！</p></div>'}
                    </div>
                    <form class="comment-input-form" onsubmit="handleCommentSubmit(event, '${p.id}')">
                        <input type="text" placeholder="写下你的善意回复..." required>
                        <button type="submit" class="btn btn-primary btn-sm">发送</button>
                    </form>
                </div>
            </div>
        `;
    }).join('');
    lucide.createIcons();
}

// Upvote handler
window.handleUpvote = async function(postId) {
    const success = await store.upvotePost(postId);
    if (success) {
        store.addPoints(2); // 2 points for voting (social activity)
        renderBoard();
        // Trigger small vibration/animation alert
        const btn = document.querySelector(`.post-card[data-id="${postId}"] .upvote-btn`);
        if (btn) btn.classList.add('upvoted');
    } else {
        alert("你已经给这篇留言点过赞了哟！");
    }
};

// Toggle comments panel
window.toggleComments = function(postId) {
    const section = document.getElementById(`comments-section-${postId}`);
    if (section) {
        section.classList.toggle('active');
    }
};

// Comment submit handler
window.handleCommentSubmit = async function(event, postId) {
    event.preventDefault();
    const form = event.target;
    const input = form.querySelector('input');
    const replyText = input.value;
    
    const reply = await store.addReply(postId, store.user.name, replyText);
    if (reply) {
        store.addPoints(5); // 5 points for comment
        input.value = '';
        renderBoard();
        // keep it active
        setTimeout(() => {
            const section = document.getElementById(`comments-section-${postId}`);
            if (section) section.classList.add('active');
        }, 100);
    }
};

// ==========================================================================
// 7. Scheduler Renderer
// ==========================================================================
let currentSchedFilter = 'all';

function renderScheduler() {
    const timelineEl = document.getElementById('scheduler-timeline-list');
    if (!timelineEl) return;

    const schedules = store.getSchedules();
    const now = new Date();
    
    // Filter
    const filtered = schedules.filter(s => {
        const schedTime = new Date(`${s.date}T${s.time}`);
        if (currentSchedFilter === 'upcoming') {
            return schedTime >= now;
        } else if (currentSchedFilter === 'history') {
            return schedTime < now;
        }
        return true;
    });

    if (filtered.length === 0) {
        timelineEl.innerHTML = `
            <div class="empty-state">
                <i data-lucide="calendar-days"></i>
                <p>没有找到匹配的日程安排。</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    const typeClasses = { 'study': '', 'group': 'sched-group', 'exam': 'sched-exam', 'activity': 'sched-activity' };
    const typeNames = { 'study': '📚 个人自习', 'group': '👥 学习小组', 'exam': '✏️ 备考倒计时', 'activity': '🌟 校园活动' };

    timelineEl.innerHTML = filtered.map(s => {
        const schedTime = new Date(`${s.date}T${s.time}`);
        const isExpired = schedTime < now;
        
        // Countdown
        let cdText = '';
        if (isExpired) {
            cdText = '<span class="countdown-badge expired">已过期</span>';
        } else {
            const diffMs = schedTime - now;
            const diffHours = Math.floor(diffMs / 3600000);
            if (diffHours < 24) {
                const diffMins = Math.floor((diffMs % 3600000) / 60000);
                cdText = `<span class="countdown-badge">${diffHours}小时${diffMins}分后</span>`;
            } else {
                const diffDays = Math.ceil(diffMs / (3600000 * 24));
                cdText = `<span class="countdown-badge upcoming">${diffDays}天后</span>`;
            }
        }

        return `
            <div class="sched-card ${typeClasses[s.type]}">
                <div class="sched-details">
                    <h4>${s.title}</h4>
                    <p>${s.desc || '没有补充内容。'}</p>
                    <div class="sched-meta-items">
                        <span><i data-lucide="calendar"></i> ${s.date}</span>
                        <span><i data-lucide="clock"></i> ${s.time} (${s.duration}分钟)</span>
                        <span>${typeNames[s.type]}</span>
                    </div>
                </div>
                <div class="sched-action-pane">
                    ${cdText}
                    <button class="sched-delete-btn" onclick="handleDeleteSchedule('${s.id}')" title="删除日程">
                        <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    lucide.createIcons();
}

window.handleDeleteSchedule = function(id) {
    if (confirm("确定要删除这个日程吗？")) {
        store.deleteSchedule(id);
        renderScheduler();
        store.addNotification("已成功删除日程。", "info");
    }
};

// ==========================================================================
// 8. Pomodoro Timer logic
// ==========================================================================
let pomoTimerInterval = null;
let pomoTimeLeft = 25 * 60; // 25 mins default
let pomoActiveMode = 'focus'; // focus, short-break, long-break
let pomoIsRunning = false;

function initPomodoro() {
    const timeDisplay = document.getElementById('pomodoro-time');
    const modeDisplay = document.getElementById('pomodoro-mode');
    const toggleBtn = document.getElementById('timer-toggle-btn');
    const btnIcon = document.getElementById('timer-btn-icon');
    const btnText = document.getElementById('timer-btn-text');
    const resetBtn = document.getElementById('timer-reset-btn');

    function updateDisplay() {
        const mins = Math.floor(pomoTimeLeft / 60).toString().padStart(2, '0');
        const secs = (pomoTimeLeft % 60).toString().padStart(2, '0');
        timeDisplay.textContent = `${mins}:${secs}`;
    }

    function playAudioTone() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5 note
            osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5 note
            osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3); // G5 note
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        } catch (e) {
            console.log("Audio play error: ", e);
        }
    }

    function onTimerComplete() {
        playAudioTone();
        clearInterval(pomoTimerInterval);
        pomoTimerInterval = null;
        pomoIsRunning = false;
        
        btnText.textContent = "开始专注";
        btnIcon.dataset.lucide = "play";
        lucide.createIcons();

        if (pomoActiveMode === 'focus') {
            store.user.focusMinutes += 25;
            store.addPoints(20);
            store.addNotification("🎉 专注完成！完成了 25 分钟番茄专注周期，获得 20 积分。", "gift");
            // Check badge
            if (store.user.focusMinutes >= 50) {
                store.unlockBadge('pomo-scholar');
            }
            // Switch to break automatically
            setMode('short-break');
        } else {
            store.addNotification("⏰ 休息结束，是时候再次踏入知识海洋啦！", "info");
            setMode('focus');
        }
    }

    function setMode(mode) {
        pomoActiveMode = mode;
        clearInterval(pomoTimerInterval);
        pomoTimerInterval = null;
        pomoIsRunning = false;
        
        btnText.textContent = "开始专注";
        btnIcon.dataset.lucide = "play";
        lucide.createIcons();

        if (mode === 'focus') {
            pomoTimeLeft = 25 * 60;
            modeDisplay.textContent = "专注中";
            modeDisplay.style.color = "var(--primary)";
        } else if (mode === 'short-break') {
            pomoTimeLeft = 5 * 60;
            modeDisplay.textContent = "短休中";
            modeDisplay.style.color = "var(--success)";
        } else if (mode === 'long-break') {
            pomoTimeLeft = 15 * 60;
            modeDisplay.textContent = "长休中";
            modeDisplay.style.color = "var(--secondary)";
        }
        updateDisplay();
    }

    toggleBtn.addEventListener('click', () => {
        if (pomoIsRunning) {
            // Pause
            clearInterval(pomoTimerInterval);
            pomoTimerInterval = null;
            pomoIsRunning = false;
            btnText.textContent = "继续专注";
            btnIcon.dataset.lucide = "play";
        } else {
            // Start
            pomoIsRunning = true;
            btnText.textContent = "暂停专注";
            btnIcon.dataset.lucide = "pause";
            
            pomoTimerInterval = setInterval(() => {
                pomoTimeLeft--;
                updateDisplay();
                if (pomoTimeLeft <= 0) {
                    onTimerComplete();
                }
            }, 1000);
        }
        lucide.createIcons();
    });

    resetBtn.addEventListener('click', () => {
        setMode(pomoActiveMode);
    });

    document.getElementById('pomo-focus-btn').addEventListener('click', () => setMode('focus'));
    document.getElementById('pomo-short-break-btn').addEventListener('click', () => setMode('short-break'));
    document.getElementById('pomo-long-break-btn').addEventListener('click', () => setMode('long-break'));

    updateDisplay();
}

// ==========================================================================
// 9. Cornell Notes Helper
// ==========================================================================
function initCornellNotes() {
    const openBtn = document.getElementById('open-cornell-modal-btn');
    const closeBtn = document.getElementById('close-cornell-modal-btn');
    const closeBtn2 = document.getElementById('close-cornell-btn');
    const modal = document.getElementById('cornell-modal');
    const aiBtn = document.getElementById('ai-auto-cornell-btn');
    const downloadBtn = document.getElementById('download-cornell-btn');

    openBtn.addEventListener('click', () => modal.classList.add('active'));
    [closeBtn, closeBtn2].forEach(btn => btn.addEventListener('click', () => modal.classList.remove('active')));

    aiBtn.addEventListener('click', async () => {
        const notesText = document.getElementById('cornell-notes').value;
        if (!notesText || notesText.trim() === '') {
            alert('请先在右侧“课堂笔记记录”中输入内容！AI 将根据它生成线索和总结。');
            return;
        }
        
        aiBtn.disabled = true;
        aiBtn.innerHTML = '<i class="pulse-indicator"></i> AI 分析中...';
        
        const cuesPrompt = `分析以下课堂笔记，提取核心考点、关键词和3个引导性的核心问题，分条列出：\n\n笔记内容：\n${notesText}`;
        const summaryPrompt = `用不超过3句话，对以下课堂笔记内容做精炼的总结：\n\n笔记内容：\n${notesText}`;
        
        try {
            const cuesResult = await AIService.callAI(cuesPrompt);
            const summaryResult = await AIService.callAI(summaryPrompt);
            
            document.getElementById('cornell-cues').value = cuesResult.replace(/✨|💡|🎓/g, '').trim();
            document.getElementById('cornell-summary').value = summaryResult.replace(/✨|💡|🎓/g, '').trim();
            store.addPoints(10);
            store.addNotification("AI 成功生成了康奈尔笔记的线索与总结！", "info");
        } catch (e) {
            console.error(e);
            alert('AI 整理出错，请检查网络或稍后再试。');
        } finally {
            aiBtn.disabled = false;
            aiBtn.innerHTML = '<i data-lucide="sparkles"></i> AI 智能整理/总结';
            lucide.createIcons();
        }
    });

    downloadBtn.addEventListener('click', () => {
        const title = document.getElementById('cornell-title').value || "未命名笔记";
        const cues = document.getElementById('cornell-cues').value;
        const notes = document.getElementById('cornell-notes').value;
        const summary = document.getElementById('cornell-summary').value;

        const fileContent = `=========================================
康奈尔笔记主题: ${title}
创建时间: ${new Date().toLocaleDateString()}
=========================================

【 1. 线索 & 问题栏 (Cues) 】
-----------------------------------------
${cues || "（暂无内容）"}

=========================================

【 2. 课堂详细记录栏 (Notes) 】
-----------------------------------------
${notes || "（暂无内容）"}

=========================================

【 3. 底部归纳总结栏 (Summary) 】
-----------------------------------------
${summary || "（暂无内容）"}

=========================================
导出自 Campus Hub (校园多功能智能留言板)
`;

        const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}_康奈尔笔记.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

// ==========================================================================
// 10. Trivia Quiz Game Logic
// ==========================================================================
const QUIZ_QUESTIONS = [
    {
        q: "关于‘番茄工作法’，一个标准的专注周期是多少分钟？",
        o: ["15分钟", "25分钟", "45分钟", "60分钟"],
        a: 1
    },
    {
        q: "康奈尔笔记法的精髓包含5R原则。以下哪一项不属于其中？",
        o: ["记录 (Record)", "简化 (Reduce)", "复读 (Repeat)", "总结 (Review)"],
        a: 2 // Repeat is wrong (Recite, Reflect are correct)
    },
    {
        q: "大语言模型（LLM）的幻觉（Hallucination）是指什么？",
        o: ["它产生看似正确但实际上错误或不合逻辑的内容", "它具备像人类一样的灵感和艺术创造力", "它因为服务器过载而出现网络连接中断", "它只能在黑夜或暗色模式下稳定工作"],
        a: 0
    },
    {
        q: "费曼学习法的核心技巧是哪一步？",
        o: ["买尽可能厚的参考书看", "高强度死记硬背公式", "将复杂概念用浅显的话讲给别人听", "每天专注自习超过 12 小时"],
        a: 2
    },
    {
        q: "为了保护视力，电脑屏幕前自习应遵循什么法则？",
        o: ["20-20-20法则（每20分钟注视20英尺外20秒）", "1小时休息1小时法则", "半闭眼阅读法则", "冷水洗脸法则"],
        a: 0
    },
    {
        q: "Supabase 是一个非常流行的开源后端服务。它的数据存储引擎主要基于什么？",
        o: ["MongoDB", "MySQL", "PostgreSQL", "Redis"],
        a: 2
    },
    {
        q: "下列哪种行为最能有效促进日间学习记忆的巩固？",
        o: ["高强度刷夜复习", "充足的睡眠与深度睡眠", "喝大量咖啡保持兴奋", "连续看多门不同的科目"],
        a: 1
    }
];

let currentGameScore = 0;
let currentQuestionIndex = 0;
let gameStreak = 0;
let gameTimer = null;
let gameTimeLeft = 100; // percent

function initGame() {
    const startBtn = document.getElementById('start-game-btn');
    const restartBtn = document.getElementById('restart-game-btn');
    const startScreen = document.getElementById('game-start-screen');
    const playScreen = document.getElementById('game-play-screen');
    const gameOverScreen = document.getElementById('game-over-screen');

    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);

    function startGame() {
        currentGameScore = 0;
        currentQuestionIndex = 0;
        gameStreak = 0;
        
        startScreen.classList.remove('active');
        gameOverScreen.classList.remove('active');
        playScreen.classList.add('active');

        // Unlock trivia starter badge if not already
        store.unlockBadge('trivia-starter');

        loadQuestion();
        renderGameSidebar();
    }

    function loadQuestion() {
        if (currentQuestionIndex >= QUIZ_QUESTIONS.length) {
            endGame();
            return;
        }

        const question = QUIZ_QUESTIONS[currentQuestionIndex];
        document.getElementById('question-index').textContent = currentQuestionIndex + 1;
        document.getElementById('question-text').textContent = question.q;
        document.getElementById('game-score').textContent = currentGameScore;
        document.getElementById('game-streak').textContent = gameStreak;

        const optionsBox = document.getElementById('question-options');
        optionsBox.innerHTML = '';
        
        question.o.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = opt;
            btn.addEventListener('click', () => handleAnswer(idx, btn));
            optionsBox.appendChild(btn);
        });

        // Setup timer countdown
        clearInterval(gameTimer);
        gameTimeLeft = 100;
        const timerFill = document.getElementById('game-timer-fill');
        timerFill.style.width = '100%';

        gameTimer = setInterval(() => {
            gameTimeLeft -= 2; // 50 ticks of 200ms = 10 seconds total
            timerFill.style.width = `${gameTimeLeft}%`;
            if (gameTimeLeft <= 0) {
                clearInterval(gameTimer);
                // Time's up -> Treat as wrong, next question
                gameStreak = 0;
                currentQuestionIndex++;
                setTimeout(loadQuestion, 500);
            }
        }, 200);
    }

    function handleAnswer(selectedIdx, clickedBtn) {
        clearInterval(gameTimer);
        const question = QUIZ_QUESTIONS[currentQuestionIndex];
        const buttons = document.querySelectorAll('.option-btn');
        
        // Disable all
        buttons.forEach(btn => btn.disabled = true);

        store.user.quizTotal += 1;

        if (selectedIdx === question.a) {
            clickedBtn.classList.add('correct');
            currentGameScore += 10;
            gameStreak++;
            store.user.quizCorrect += 1;
            store.addPoints(10); // Reward active learning

            // Play correct tone
            playQuizSound(true);
            
            // Streak bonuses
            if (gameStreak >= 5) {
                currentGameScore += 5;
                store.addPoints(5);
                store.addNotification(`🔥 5连击达成！额外获得5积分。`, 'gift');
            }
        } else {
            clickedBtn.classList.add('wrong');
            buttons[question.a].classList.add('correct');
            gameStreak = 0;
            playQuizSound(false);
        }

        store.saveLocalData();

        currentQuestionIndex++;
        setTimeout(loadQuestion, 1200);
    }

    function playQuizSound(isCorrect) {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            if (isCorrect) {
                osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
                osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
                gain.gain.setValueAtTime(0.2, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                osc.start();
                osc.stop(ctx.currentTime + 0.3);
            } else {
                osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
                gain.gain.setValueAtTime(0.2, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
                osc.start();
                osc.stop(ctx.currentTime + 0.4);
            }
        } catch(e) {}
    }

    function endGame() {
        playScreen.classList.remove('active');
        gameOverScreen.classList.add('active');

        document.getElementById('game-final-correct').textContent = Math.floor(currentGameScore / 10);
        document.getElementById('game-final-points').textContent = currentGameScore;

        const localHigh = parseInt(localStorage.getItem('campus_game_high') || '0');
        if (currentGameScore > localHigh) {
            localStorage.setItem('campus_game_high', currentGameScore.toString());
            store.addNotification(`🏆 创下新答题纪录：${currentGameScore} 分！`, 'gift');
        }

        // Master Badge Check
        if (currentGameScore >= 60) {
            const unlocked = store.unlockBadge('trivia-master');
            if (unlocked) {
                document.getElementById('game-achievement-notice').style.display = 'inline-flex';
            } else {
                document.getElementById('game-achievement-notice').style.display = 'none';
            }
        } else {
            document.getElementById('game-achievement-notice').style.display = 'none';
        }

        renderGameSidebar();
    }

    renderGameSidebar();
}

function renderGameSidebar() {
    // Render Highscore
    const high = localStorage.getItem('campus_game_high') || '0';
    const highscoreEl = document.getElementById('game-highscore');
    if (highscoreEl) highscoreEl.textContent = high;

    // Render Badges
    const badgeWall = document.getElementById('badges-wall');
    if (badgeWall) {
        const allBadges = [
            { id: 'rookie', name: '初来乍到', desc: '进入校园仪表盘', icon: 'smile' },
            { id: 'trivia-starter', name: '答题新手', desc: '参与一次答题赛', icon: 'gamepad' },
            { id: 'pomo-scholar', name: '专注学者', desc: '累计专注50分钟', icon: 'hourglass' },
            { id: 'trivia-master', name: '知识达人', desc: '答题单次获得60分', icon: 'award' },
            { id: 'community-star', name: '社区明星', desc: '留言板发表3次留言', icon: 'star' }
        ];

        badgeWall.innerHTML = allBadges.map(b => {
            const hasIt = store.user.badges.includes(b.id);
            return `
                <div class="badge-item ${hasIt ? 'unlocked' : ''}" title="${b.desc}">
                    <div class="badge-icon-box">
                        <i data-lucide="${b.icon}"></i>
                    </div>
                    <span>${b.name}</span>
                </div>
            `;
        }).join('');
        lucide.createIcons();
    }

    // Render Leaderboard
    const leaderboard = document.getElementById('leaderboard-list');
    if (leaderboard) {
        // Mock scoreboard
        const mockLeaders = [
            { name: '计算机李华', pts: 480, avatar: 'L1' },
            { name: '法学张三', pts: 320, avatar: 'L2' },
            { name: store.user.name, pts: store.user.points, avatar: 'Felix', isMe: true },
            { name: '英语小红', pts: 180, avatar: 'L3' },
            { name: '机械小铁', pts: 90, avatar: 'L4' }
        ].sort((a, b) => b.pts - a.pts);

        leaderboard.innerHTML = mockLeaders.map((l, idx) => `
            <div class="leaderboard-item" style="${l.isMe ? 'border: 1px solid var(--primary); background-color: var(--primary-light);' : ''}">
                <div class="leader-rank">${idx + 1}</div>
                <img class="leader-avatar" src="https://api.dicebear.com/7.x/adventurer/svg?seed=${l.name}" alt="">
                <div class="leader-name">${l.name} ${l.isMe ? '(我)' : ''}</div>
                <div class="leader-pts">${l.pts} pts</div>
            </div>
        `).join('');
    }
}

// ==========================================================================
// 11. Data Visualization (Chart.js Renderer)
// ==========================================================================
async function renderDataViz() {
    // 1. Accuracy Circle Updates
    const totalQ = store.user.quizTotal;
    const correctQ = store.user.quizCorrect;
    const accuracy = totalQ > 0 ? Math.round((correctQ / totalQ) * 100) : 0;
    
    document.getElementById('quiz-accuracy-val').textContent = `${accuracy}%`;
    document.getElementById('accuracy-stat-total').textContent = totalQ;
    document.getElementById('accuracy-stat-correct').textContent = correctQ;

    // Destroy existing charts to prevent memory leaks or rendering errors
    ['catDist', 'weeklyAct', 'schedTypes'].forEach(key => {
        if (store.chartInstances[key]) {
            store.chartInstances[key].destroy();
        }
    });

    const isDark = store.theme === 'dark';
    const gridColor = isDark ? '#243048' : '#e2e8f0';
    const textColor = isDark ? '#94a3b8' : '#475569';

    // 2. Category Distribution Chart (Bar)
    const posts = await store.getPosts();
    const catCounts = { study: 0, schedule: 0, game: 0, community: 0, ai: 0, 'data-viz': 0, creative: 0 };
    posts.forEach(p => {
        if (catCounts[p.category] !== undefined) catCounts[p.category]++;
    });

    const ctx1 = document.getElementById('chart-category-distribution').getContext('2d');
    store.chartInstances.catDist = new Chart(ctx1, {
        type: 'bar',
        data: {
            labels: ['📚 学习', '📅 日程', '🎮 游戏', '💬 社区', '🤖 AI', '📊 数据', '💡 创意'],
            datasets: [{
                label: '讨论条数',
                data: Object.values(catCounts),
                backgroundColor: [
                    '#4f46e5', '#0ea5e9', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#f43f5e'
                ],
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, ticks: { color: textColor } },
                y: { grid: { color: gridColor }, ticks: { color: textColor, stepSize: 1 } }
            }
        }
    });

    // 3. Weekly Activity Chart (Line)
    const ctx2 = document.getElementById('chart-weekly-activity').getContext('2d');
    // Generate mock last 7 days count
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();

    const activityData = last7Days.map((dateStr, idx) => {
        // Count posts on this date + some stable base random variation to make it look alive
        const postOnDay = posts.filter(p => p.created_at.startsWith(dateStr)).length;
        const seedValue = [3, 5, 8, 12, 9, 15, 21][idx] || 5;
        return postOnDay + seedValue;
    });

    store.chartInstances.weeklyAct = new Chart(ctx2, {
        type: 'line',
        data: {
            labels: last7Days.map(d => d.slice(5)), // MM-DD
            datasets: [{
                label: '系统并发请求数 & 活跃指数',
                data: activityData,
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: textColor } } },
            scales: {
                x: { grid: { display: false }, ticks: { color: textColor } },
                y: { grid: { color: gridColor }, ticks: { color: textColor } }
            }
        }
    });

    // 4. Schedule Types Chart (Pie)
    const scheds = store.schedules;
    const typeCounts = { study: 0, group: 0, exam: 0, activity: 0 };
    scheds.forEach(s => {
        if (typeCounts[s.type] !== undefined) typeCounts[s.type]++;
    });

    const ctx3 = document.getElementById('chart-schedule-types').getContext('2d');
    store.chartInstances.schedTypes = new Chart(ctx3, {
        type: 'pie',
        data: {
            labels: ['📚 自习备考', '👥 学习小组', '✏️ 考试倒计时', '🌟 校园活动'],
            datasets: [{
                data: Object.values(typeCounts),
                backgroundColor: ['#4f46e5', '#0ea5e9', '#ef4444', '#f59e0b'],
                borderWidth: isDark ? 2 : 1,
                borderColor: isDark ? '#151c2c' : '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: textColor, boxWidth: 12, font: { size: 11 } }
                }
            }
        }
    });
}

// ==========================================================================
// 12. DOM Events Binding & Page initialization
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Main setups
    Router.init();
    store.renderNotifications();
    initPomodoro();
    initCornellNotes();
    initGame();

    // 2. Profile Rendering
    const updateProfileDOM = () => {
        document.getElementById('user-display-name').textContent = store.user.name;
        document.getElementById('user-points').textContent = store.user.points;
        document.getElementById('user-level').textContent = `LV.${store.user.level}`;
        document.getElementById('user-avatar').src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(store.user.name)}`;
        
        // Progress bar to next level
        const currentPointsInLevel = store.user.points % 100;
        document.getElementById('level-progress').style.width = `${currentPointsInLevel}%`;
    };
    updateProfileDOM();

    // Edit Name
    document.getElementById('edit-name-btn').addEventListener('click', () => {
        const newName = prompt("请输入您喜欢的校园新昵称：", store.user.name);
        if (newName) {
            store.updateUsername(newName);
            updateProfileDOM();
            renderDashboard();
            renderGameSidebar();
        }
    });

    // 3. Theme Toggle Button
    const themeBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = document.getElementById('theme-icon');
    
    // Set initial icon
    themeIcon.dataset.lucide = store.theme === 'dark' ? 'sun' : 'moon';
    lucide.createIcons();

    themeBtn.addEventListener('click', () => {
        const nextTheme = store.theme === 'light' ? 'dark' : 'light';
        store.theme = nextTheme;
        localStorage.setItem('campus_theme', nextTheme);
        document.documentElement.setAttribute('data-theme', nextTheme);
        
        themeIcon.dataset.lucide = nextTheme === 'dark' ? 'sun' : 'moon';
        lucide.createIcons();

        // Refresh visualization colors
        if (store.activeView === 'data-viz') {
            renderDataViz();
        }
    });

    // 4. Notifications Panel Toggle
    const notiBtn = document.getElementById('notifications-btn');
    const notiMenu = document.getElementById('notifications-menu');
    notiBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notiMenu.classList.toggle('active');
    });
    
    document.addEventListener('click', () => {
        notiMenu.classList.remove('active');
    });

    document.getElementById('clear-noti-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        store.notifications = [];
        store.renderNotifications();
    });

    // 5. Dashboard Quick Post Form
    document.getElementById('quick-post-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const content = document.getElementById('quick-post-content').value;
        const category = document.getElementById('quick-post-category').value;
        
        await store.addPost(`快速动态`, content, store.user.name, category, '日常树洞');
        document.getElementById('quick-post-content').value = '';
        store.addNotification("已通过极速发布面板成功在留言板发言！", "info");
        
        // Refresh
        renderDashboard();
        updateProfileDOM();
    });

    // Refresh AI Daily quote
    document.getElementById('refresh-ai-tip-btn').addEventListener('click', () => {
        const quoteEl = document.getElementById('ai-daily-quote');
        const randQuote = AI_TIPS[Math.floor(Math.random() * AI_TIPS.length)];
        quoteEl.textContent = randQuote;
    });

    // 6. Board View Filter tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentBoardFilter = tab.dataset.category;
            renderBoard();
        });
    });

    // Modal Control: Create Post
    const postModal = document.getElementById('post-modal');
    document.getElementById('open-post-modal-btn').addEventListener('click', () => {
        document.getElementById('post-nickname').value = store.user.name;
        postModal.classList.add('active');
    });
    
    const closePostModal = () => {
        postModal.classList.remove('active');
        document.getElementById('new-post-form').reset();
    };
    
    document.getElementById('close-post-modal-btn').addEventListener('click', closePostModal);
    document.getElementById('cancel-post-btn').addEventListener('click', closePostModal);

    // AI Polish in post modal
    document.getElementById('ai-polish-post-btn').addEventListener('click', async () => {
        const text = document.getElementById('post-content').value;
        if (!text || text.trim() === '') {
            alert('请先输入正文内容，AI 才能帮您进行润色！');
            return;
        }
        
        const btn = document.getElementById('ai-polish-post-btn');
        btn.disabled = true;
        btn.innerHTML = '<span class="pulse-indicator"></span> 润色中...';
        
        const polishPrompt = `润色并丰富排版以下留言文案，使其具有吸引力和条理，可以直接复制在留言板上：\n\n${text}`;
        
        try {
            const result = await AIService.callAI(polishPrompt);
            document.getElementById('post-content').value = result;
            store.addNotification("AI 成功完成了留言的润色！", "info");
        } catch (e) {
            console.error(e);
            alert("润色失败，请重试。");
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i data-lucide="sparkles"></i> 让 AI 帮我润色';
            lucide.createIcons();
        }
    });

    // New Post Submit Form
    document.getElementById('new-post-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const nickname = document.getElementById('post-nickname').value;
        const category = document.getElementById('post-category').value;
        const tag = document.getElementById('post-tag').value;
        const title = document.getElementById('post-title').value;
        const content = document.getElementById('post-content').value;

        await store.addPost(title, content, nickname, category, tag);
        closePostModal();
        renderBoard();
        updateProfileDOM();
        store.addNotification("新留言发表成功，获得 10 积分奖励！", "gift");
    });

    // 7. Schedule View Filter Tabs
    document.querySelectorAll('.badge-filter').forEach(filter => {
        filter.addEventListener('click', () => {
            document.querySelectorAll('.badge-filter').forEach(f => f.classList.remove('active'));
            filter.classList.add('active');
            currentSchedFilter = filter.dataset.schedFilter;
            renderScheduler();
        });
    });

    // Create Schedule Form Submit
    document.getElementById('schedule-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('sched-title').value;
        const date = document.getElementById('sched-date').value;
        const time = document.getElementById('sched-time').value;
        const type = document.getElementById('sched-type').value;
        const duration = document.getElementById('sched-duration').value;
        const desc = document.getElementById('sched-desc').value;
        const share = document.getElementById('sched-share-board').checked;

        store.addSchedule(title, date, time, type, duration, desc, share);
        document.getElementById('schedule-form').reset();
        
        renderScheduler();
        updateProfileDOM();
        store.addNotification("成功添加了新的学习日程！", "info");
    });

    // 8. AI Chat Assistant Logic
    const chatInput = document.getElementById('chat-input');
    const sendChatBtn = document.getElementById('send-chat-btn');
    const chatContainer = document.getElementById('chat-messages-container');

    const appendChatMessage = (sender, text) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${sender}`;
        msgDiv.innerHTML = `
            <div class="msg-avatar">${sender === 'user' ? '👤' : '🤖'}</div>
            <div class="msg-bubble">${text.replace(/\n/g, '<br>')}</div>
        `;
        chatContainer.appendChild(msgDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    };

    const handleChatSubmit = async () => {
        const text = chatInput.value.trim();
        if (!text) return;

        appendChatMessage('user', text);
        chatInput.value = '';

        // Add loading bubble
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'chat-message bot';
        loadingDiv.id = 'ai-loading-bubble';
        loadingDiv.innerHTML = `
            <div class="msg-avatar">🤖</div>
            <div class="msg-bubble" style="opacity: 0.6">AI 正在深入思考中...</div>
        `;
        chatContainer.appendChild(loadingDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;

        try {
            const reply = await AIService.callAI(text);
            loadingDiv.remove();
            appendChatMessage('bot', reply);
            store.addPoints(1); // 1 point for active AI search
            updateProfileDOM();
        } catch (e) {
            loadingDiv.remove();
            appendChatMessage('bot', '❌ 对不起，AI学伴连接超时，请稍后再试。');
        }
    };

    sendChatBtn.addEventListener('click', handleChatSubmit);
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleChatSubmit();
    });

    // Setup active API status
    const updateAiStatusDOM = () => {
        const indicator = document.getElementById('ai-status-badge');
        const activeText = document.getElementById('ai-active-indicator');
        if (store.isAiReal) {
            indicator.querySelector('.indicator-dot').className = "indicator-dot green";
            indicator.querySelector('.indicator-text').textContent = "Real AI Gemini 活跃";
            activeText.textContent = "真实 AI 模式";
            activeText.style.backgroundColor = "var(--success-light)";
            activeText.style.color = "var(--success)";
        } else {
            indicator.querySelector('.indicator-dot').className = "indicator-dot yellow";
            indicator.querySelector('.indicator-text').textContent = "AI 模拟模式";
            activeText.textContent = "模拟模式";
            activeText.style.backgroundColor = "var(--accent-light)";
            activeText.style.color = "var(--accent)";
        }
    };
    updateAiStatusDOM();

    // 9. Config and Settings
    // Database Config Submit
    document.getElementById('supabase-config-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const url = document.getElementById('sb-url').value.trim();
        const key = document.getElementById('sb-anon-key').value.trim();

        if (url && key) {
            localStorage.setItem('campus_sb_url', url);
            localStorage.setItem('campus_sb_key', key);
            store.sbUrl = url;
            store.sbKey = key;
            store.isSbActive = true;
            
            store.showDbStatus("Supabase 数据库已连接", "green");
            store.addNotification("成功开启 Supabase 云数据库同步！留言将上传云端。", "gift");
            
            // Re-render
            if (store.activeView === 'board') renderBoard();
        } else {
            alert('请完整填写 Supabase URL 和 Key');
        }
    });

    document.getElementById('disconnect-sb-btn').addEventListener('click', () => {
        localStorage.removeItem('campus_sb_url');
        localStorage.removeItem('campus_sb_key');
        store.sbUrl = '';
        store.sbKey = '';
        store.isSbActive = false;
        
        document.getElementById('sb-url').value = '';
        document.getElementById('sb-anon-key').value = '';
        
        store.showDbStatus("LocalStorage 本地存储中", "green");
        store.addNotification("已断开 Supabase 链接，返回本地存储模式。", "info");
        
        if (store.activeView === 'board') renderBoard();
    });

    // Populate db config input if exists
    document.getElementById('sb-url').value = store.sbUrl;
    document.getElementById('sb-anon-key').value = store.sbKey;
    if (store.isSbActive) {
        store.showDbStatus("Supabase 数据库已连接", "green");
    }

    // AI API Config Submit
    document.getElementById('ai-config-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const key = document.getElementById('ai-api-key').value.trim();
        if (key) {
            localStorage.setItem('campus_ai_key', key);
            store.aiKey = key;
            store.isAiReal = true;
            
            updateAiStatusDOM();
            store.addNotification("真实 Gemini API 接口配置成功！", "gift");
        } else {
            alert('请输入合法的 API Key');
        }
    });

    document.getElementById('disable-real-ai-btn').addEventListener('click', () => {
        localStorage.removeItem('campus_ai_key');
        store.aiKey = '';
        store.isAiReal = false;
        
        document.getElementById('ai-api-key').value = '';
        updateAiStatusDOM();
        store.addNotification("已关闭真实 AI，回到智能语境模拟器模式。", "info");
    });

    // Populate AI key input if exists
    document.getElementById('ai-api-key').value = store.aiKey;

    // Load Lucide Icons initial run
    lucide.createIcons();
});
