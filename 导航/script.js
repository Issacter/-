// 导航网站交互效果

// 页面加载动画
window.addEventListener('load', function() {
    const center = document.querySelector('.center');
    
    // 中心元素淡入效果
    center.style.opacity = '0';
    center.style.transform = 'scale(0.8)';
    
    setTimeout(() => {
        center.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        center.style.opacity = '1';
        center.style.transform = 'scale(1)';
    }, 100);
});

// 懒加载与图片加载过渡、压缩与失败备用
// 斜向 3列图片：填充 Picture 文件夹资源，懒加载与压缩
(function(){
  let files = [
    '1734710458034.png',
    'Screenshot_20221227_170451_com.ss.android.ugc.aweme.png',
    'Screenshot_20221229_225333_com.lofter.android.png',
    '20241219083323.jpg','20250202004803.jpg','20250217233119.jpg','20250501003247.jpg',
    '2b01848088dd45929d07b1007e66e23a20250429.jpg','2bd0d23887c91abb8db5172c88f61148fc3987fb23761-RIN4Qm_fw1200.jpg',
    '2faee9753a324ae6a15ee169d5a05f8620240615.jpg','458451679bdc4db795b45b7cf5a83b3420250608.jpg',
    '563e81f7f2b2e34e8de667e989449e8f24ac1c7b13182-ickwtV_fw1200.jpg','572d0e9e772f42d79d2a77297cc771f720240905.jpg',
    '617b55eb03d84345bddfb65f01fc27a320240418.jpg','Image_1031339801532456.jpg',
    'mmexport1742794937276.jpg','mmexport1745367741554.jpg','mmexport1745916121109.jpg','mmexport1746156839299.jpg'
  ].map(name => `../Picture/${name}`);
  // 每次加载随机打乱顺序
  files = files.sort(() => Math.random() - 0.5);

  const cols = [
    document.querySelector('.tilt-col[data-col="1"] .tilt-col-inner'),
    document.querySelector('.tilt-col[data-col="2"] .tilt-col-inner'),
    document.querySelector('.tilt-col[data-col="3"] .tilt-col-inner'),
    document.querySelector('.tilt-col[data-col="4"] .tilt-col-inner'),
    document.querySelector('.tilt-col[data-col="5"] .tilt-col-inner')
  ];
  // 随机起始列，保证每次分配起点不同
  const startOffset = Math.floor(Math.random() * 5);

  const createTile = (src, depth='mid') => {
    const fig=document.createElement('figure');
    fig.className=`tile`;
    fig.classList.add(`depth-${depth}`);
    const img=document.createElement('img');
    img.loading='lazy'; img.decoding='async'; img.fetchPriority='low';
    img.src=src;
    const alt=src.split('/').pop().replace(/\.[^.]+$/, '');
    img.alt=alt;
    fig.appendChild(img);
    const isPortraitDir = /\/Picture\/竖版\//i.test(src);
    if (isPortraitDir){
      fig.classList.add('portrait-override');
      const badge=document.createElement('div');
      badge.className='portrait-badge';
      badge.textContent='竖版';
      fig.appendChild(badge);
      img.style.objectFit='contain';
      img.style.background='linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))';
    }
    // 根据图片真实尺寸动态调整容器高度
    const adjustByRatio = ()=>{
      try{
        const w = img.naturalWidth || 800;
        const h = img.naturalHeight || 600;
        const ratio = h / Math.max(w,1);
        if (isPortraitDir){
          if (ratio >= 1.8) fig.classList.add('alt');
        } else {
          if (ratio >= 1.2) {
            fig.classList.add('portrait');
            fig.classList.remove('landscape');
          } else {
            fig.classList.add('landscape');
            fig.classList.remove('portrait');
          }
        }
      }catch(_){/* ignore */}
    };
    img.addEventListener('load', adjustByRatio, { once:true });
    img.addEventListener('error', ()=>{ fig.classList.add('tile-fallback'); }, { once:true });
    return fig;
  };

  // 分配到三列（随机起点），每次打开顺序不同
  const COLS_COUNT = cols.filter(Boolean).length;
  const MIN_PER_COL = 12;
  const needed = COLS_COUNT * MIN_PER_COL;
  const list = [];
  for (let k = 0; list.length < needed; k++) {
    files.forEach(f => list.push(f));
  }
  list.forEach((src, i) => {
    const colIndex = (i + startOffset) % COLS_COUNT;
    const depth = colIndex === 0 ? 'near' : (colIndex === 1 ? 'mid' : (colIndex === 2 ? 'mid' : (colIndex === 3 ? 'far' : 'near')));
    const col = cols[colIndex];
    if (col) col.appendChild(createTile(src, depth));
  });
  const counts = cols.map(c => (c ? c.children.length : 0));
  const maxCount = Math.max(...counts);
  cols.forEach((c, idx) => {
    if (!c) return;
    while (c.children.length < maxCount - 1) {
      const src = files[(c.children.length + idx) % files.length];
      const depth = idx === 0 ? 'near' : (idx === 1 ? 'mid' : (idx === 2 ? 'mid' : (idx === 3 ? 'far' : 'near')));
      c.appendChild(createTile(src, depth));
    }
  });

  const mo = new MutationObserver(muts => {
    muts.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.nodeType === 1){
          const img = node.querySelector && node.querySelector('img');
          if (img){
            const src = img.getAttribute('src') || '';
            if (/\/Picture\/竖版\//i.test(src)){
              const fig = img.closest('.tile');
              if (fig && !fig.classList.contains('portrait-override')){
                fig.classList.add('portrait-override');
                const badge=document.createElement('div');
                badge.className='portrait-badge';
                badge.textContent='竖版';
                fig.appendChild(badge);
                img.style.objectFit='contain';
              }
            }
          }
        }
      });
    });
  });
  mo.observe(document.querySelector('.tilt-grid'), { childList: true, subtree: true });

  // 懒加载 + 过渡 + JPEG 转 WebP（失败则保留原图）
  const imgs = document.querySelectorAll('.tilt-col img');
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      if (img.dataset.processed) return;
      img.dataset.processed = '1';
      const onLoad = ()=>{
        img.classList.add('is-loaded');
        // 尝试将非 PNG/WEBP 转为 WEBP 以满足规范
        try{
          if (!/\.(png|webp)$/i.test(img.src)){
            const w = Math.min(640, img.naturalWidth || 640);
            const h = Math.round((img.naturalHeight || 640) * (w / (img.naturalWidth || 640)));
            const canvas = document.createElement('canvas');
            canvas.width = w; canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            const dataURL = canvas.toDataURL('image/webp', 0.7);
            if (dataURL && dataURL.length > 128) img.src = dataURL;
          }
        }catch(_){/* ignore */}
      };
      const onError = ()=>{
        const fig = img.closest('.tile');
        if (fig) fig.classList.add('tile-fallback');
      };
      img.addEventListener('load', onLoad, { once: true });
      img.addEventListener('error', onError, { once: true });
      io.unobserve(img);
    });
  }, { rootMargin: '25% 0% 25% 0%' });
  imgs.forEach(img => io.observe(img));
})();

// 点击导航中心显示链接容器，再次点击打开注册页面
const center = document.querySelector('.center');

// 确保页面加载时获取所有可能的子元素
const centerChildren = center.querySelectorAll('h1, p, .links-container');

// 将变量暴露到全局，供transition.js使用
window.activationGuardUntil = 0;

// 为导航中心添加点击事件监听器
center.addEventListener('click', function(e) {
    // 如果中心已经处于激活状态，显示注册覆盖层
    if (this.classList.contains('active')) {
        // 显示注册覆盖层
        document.getElementById('registerOverlay').style.display = 'flex';
    } else {
        // 第一次点击，添加激活状态显示链接容器
        this.classList.add('active');
        // 在激活后的短时间内，禁止链接的默认跳转，避免误触
        window.activationGuardUntil = Date.now() + 300;
    }
});

// 为中心区域的子元素添加点击事件，确保点击中心区域任何位置都能触发
centerChildren.forEach(child => {
    child.addEventListener('click', function(e) {
        // 阻止事件冒泡，避免触发链接容器的点击事件
        e.stopPropagation();
        
        // 如果中心已经处于激活状态，显示注册覆盖层
        if (center.classList.contains('active')) {
            // 显示注册覆盖层
            document.getElementById('registerOverlay').style.display = 'flex';
        } else {
            // 第一次点击，添加激活状态显示链接容器
            center.classList.add('active');
            window.activationGuardUntil = Date.now() + 300;
        }
    });
});

// 点击链接容器事件处理（不自动收起）
const ellipses = document.querySelectorAll('.ellipse');
ellipses.forEach(ellipse => {
    ellipse.addEventListener('click', function(e) {
        // 阻止事件冒泡，避免触发中心的点击事件
        e.stopPropagation();
        
        // 添加点击动画
        this.style.transform += ' scale(0.9)';
        setTimeout(() => {
            this.style.transform = this.style.transform.replace(' scale(0.9)', '');
        }, 150);
        
        // 获取链接文本
        const linkText = this.querySelector('a').textContent;
        console.log(`点击了: ${linkText}`);
        
        // 确保中心区域保持激活状态，不会收起
        center.classList.add('active');
        
        // 删除了自动收起的逻辑，保持链接容器显示状态
    });
    // 防误触跳转：在中心刚激活的短时间内屏蔽链接默认行为
    const link = ellipse.querySelector('a');
    if (link) {
        link.addEventListener('click', function(e){
            // 如果中心尚未处于激活态，则本次点击只用于激活，不跳转
            if (!center.classList.contains('active')) {
                e.preventDefault();
                e.stopPropagation();
                center.classList.add('active');
                window.activationGuardUntil = Date.now() + 300;
                return;
            }
            if (Date.now() < window.activationGuardUntil) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    }
});

// 鼠标移动时的3D效果
let mouseX = 0;
let mouseY = 0;
let centerX = window.innerWidth / 2;
let centerY = window.innerHeight / 2;

window.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    const deltaX = (mouseX - centerX) / 20;
    const deltaY = (mouseY - centerY) / 20;
    
    center.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.05)`;
});

// 窗口大小改变时重新计算中心位置
window.addEventListener('resize', function() {
    centerX = window.innerWidth / 2;
    centerY = window.innerHeight / 2;
});

// 平滑滚动效果（如果页面有其他部分）
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
