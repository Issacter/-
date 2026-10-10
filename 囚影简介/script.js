document.addEventListener('DOMContentLoaded', function() {
    // 获取所有需要的元素
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const caption = document.getElementById('caption');
    const closeBtn = document.querySelector('.close-btn');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    
    let currentIndex = 0;
    const images = [];
    
    // 收集所有图片信息
    galleryItems.forEach((item, index) => {
        const img = item.querySelector('img');
        const alt = img.alt;
        const src = img.src;
        
        images.push({
            src: src,
            alt: alt
        });
        
        // 为每个图片添加点击事件
        item.addEventListener('click', function() {
            openLightbox(index);
        });
    });
    
    // 打开灯箱
    function openLightbox(index) {
        currentIndex = index;
        lightboxImg.src = images[currentIndex].src;
        caption.textContent = images[currentIndex].alt;
        lightbox.style.display = 'block';
        
        // 禁止背景滚动
        document.body.style.overflow = 'hidden';
    }
    
    // 关闭灯箱
    function closeLightbox() {
        lightbox.style.display = 'none';
        
        // 恢复背景滚动
        document.body.style.overflow = '';
    }
    
    // 显示下一张图片
    function showNextImage() {
        currentIndex = (currentIndex + 1) % images.length;
        lightboxImg.src = images[currentIndex].src;
        caption.textContent = images[currentIndex].alt;
    }
    
    // 显示上一张图片
    function showPrevImage() {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        lightboxImg.src = images[currentIndex].src;
        caption.textContent = images[currentIndex].alt;
    }
    
    // 添加事件监听器
    closeBtn.addEventListener('click', closeLightbox);
    nextBtn.addEventListener('click', showNextImage);
    prevBtn.addEventListener('click', showPrevImage);
    
    // 键盘导航
    document.addEventListener('keydown', function(e) {
        if (lightbox.style.display === 'block') {
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowRight') {
                showNextImage();
            } else if (e.key === 'ArrowLeft') {
                showPrevImage();
            }
        }
    });
    
    // 点击灯箱背景关闭
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // 添加图片懒加载
    if ('IntersectionObserver' in window) {
        const imgObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.src;
                    observer.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('.gallery-item img').forEach(img => {
            imgObserver.observe(img);
        });
    }
    
    // 添加视频控制增强
    const video = document.querySelector('video');
    if (video) {
        video.addEventListener('click', function() {
            if (video.paused) {
                video.play();
            } else {
                video.pause();
            }
        });
    }
});