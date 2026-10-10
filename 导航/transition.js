document.addEventListener('DOMContentLoaded', () => {
    // 注入CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'transition.css';
    document.head.appendChild(link);

    // 只绑定带有 nav-link 类的导航链接
    // 排除 # 和 javascript: 链接
    const links = document.querySelectorAll('a.nav-link[href]:not([href^="#"]):not([href^="javascript"])');
    
    links.forEach(a => {
        a.addEventListener('click', async (e) => {
            // 如果是新标签页打开，不处理
            if (a.target === '_blank') return;
            
            // 检查是否在导航中心刚激活的短时间内（防误触）
            if (window.activationGuardUntil && Date.now() < window.activationGuardUntil) {
                return;
            }
            
            // 确保点击的是链接本身或链接内的元素
            // 检查事件目标是否是链接或链接的直接子元素
            let currentTarget = e.target;
            let isLinkClick = false;
            
            while (currentTarget && currentTarget !== document.body) {
                if (currentTarget === a) {
                    isLinkClick = true;
                    break;
                }
                currentTarget = currentTarget.parentNode;
            }
            
            if (!isLinkClick) {
                return;
            }
            
            e.preventDefault();
            const targetUrl = a.href;
            
            // 开始转场
            await startShatterTransition(targetUrl);
        });
    });
});

async function startShatterTransition(url) {
    // 1. 准备 iframe 预加载下一页
    const iframe = document.createElement('iframe');
    iframe.id = 'transition-iframe';
    iframe.src = url;
    document.body.appendChild(iframe);
    
    // 2. 克隆当前页面主要内容用于破碎
    // 我们只克隆 tilt-layer 和 container，背景视频保持不动
    const tiltLayer = document.querySelector('.tilt-layer');
    const container = document.querySelector('.container');
    
    if (!tiltLayer || !container) {
        window.location.href = url;
        return;
    }

    const shardsContainer = document.createElement('div');
    shardsContainer.className = 'shards-container';
    document.body.appendChild(shardsContainer);

    // 5个碎片的多边形路径 (围绕中心 50% 50%)
    const polygons = [
        'polygon(50% 50%, 0% 0%, 60% 0%)',                 // 左上偏上
        'polygon(50% 50%, 60% 0%, 100% 0%, 100% 40%)',     // 右上
        'polygon(50% 50%, 100% 40%, 100% 100%, 60% 100%)', // 右下
        'polygon(50% 50%, 60% 100%, 0% 100%, 0% 60%)',     // 左下
        'polygon(50% 50%, 0% 60%, 0% 0%)'                  // 左侧
    ];

    // 创建5个碎片
    polygons.forEach((poly, index) => {
        const shard = document.createElement('div');
        shard.className = 'shard';
        // 存储原始clip-path作为CSS变量，用于动画
        shard.style.setProperty('--original-clip', poly);
        
        // 设置随机下落参数
        const angle = (Math.random() - 0.5) * 60; // 随机旋转 -30 ~ 30deg
        const tx = (Math.random() - 0.5) * 200 + 'px'; // 横向随机位移
        const ty = 100 + Math.random() * 100 + '%'; // 纵向位移（下落）
        const rotX = Math.random();
        const rotY = Math.random();
        const rotZ = Math.random();
        const deg = 10 + Math.random() * 45 + 'deg';

        shard.style.setProperty('--tx', tx);
        shard.style.setProperty('--ty', ty);
        shard.style.setProperty('--rx', rotX);
        shard.style.setProperty('--ry', rotY);
        shard.style.setProperty('--rz', rotZ);
        shard.style.setProperty('--deg', deg);
        // 设置每个碎片的延迟，实现从中心向四周扩散的效果
        shard.style.setProperty('--delay', `${index * 0.05}s`); // 每个碎片延迟0.05秒
        
        // 克隆内容到碎片中
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'shard-inner';
        
        // 深拷贝节点
        const clonedTilt = tiltLayer.cloneNode(true);
        const clonedContainer = container.cloneNode(true);
        
        // CSS中已通过 .shard-inner * { animation-play-state: paused !important; } 冻结动画
        // 无需手动遍历JS
        
        contentWrapper.appendChild(clonedTilt);
        contentWrapper.appendChild(clonedContainer);
        
        shard.appendChild(contentWrapper);
        shardsContainer.appendChild(shard);
    });

    // 3. 隐藏原始内容
    tiltLayer.style.opacity = '0';
    container.style.opacity = '0';

    // 4. 显示 iframe (渐显)
    // 给一点时间让iframe开始加载
    setTimeout(() => {
        iframe.style.opacity = '1';
    }, 50);

    // 5. 执行破碎动画
    const shards = document.querySelectorAll('.shard');
    const totalShards = shards.length;
    let completedShards = 0;
    let animationEnded = false;
    
    // 监听所有碎片动画结束
    const handleAnimationEnd = (e) => {
        if (e.animationName === 'shatter-drop') {
            completedShards++;
            if (completedShards === totalShards && !animationEnded) {
                animationEnded = true;
                // 所有动画结束，执行跳转
                window.location.href = url;
            }
        }
    };
    
    shards.forEach((s, index) => {
        // 添加动画结束事件监听
        s.addEventListener('animationend', handleAnimationEnd);
        // 使用预定义的延迟和固定的0.5秒动画时长
        s.style.animation = `shatter-drop 1.5s ease-in forwards var(--delay)`;
    });
    
    // 添加超时保护，防止动画结束事件不触发
    setTimeout(() => {
        if (!animationEnded) {
            animationEnded = true;
            window.location.href = url;
        }
    }, 2000);
}