// 背景音乐管理脚本
// 所有页面共享同一个音频播放器实例

class BackgroundMusic {
    constructor() {
        this.tracks = [
            { title: "夤夜渡（「九龙夜航」概念曲）", artist: "战双帕弥什,Anti-General", duration: "04:32", src: "../音乐播放功能/素材/音频/战双帕弥什,Anti-General - 夤夜渡（「九龙夜航」概念曲）.m4a" },
            { title: "鸣响", artist: "战双帕弥什,Vanguard Sound,Kinoko蘑菇", duration: "03:45", src: "../音乐播放功能/素材/音频/战双帕弥什,Vanguard Sound,Kinoko蘑菇 - 鸣响.m4a" },
            { title: "I Always Do", artist: "战双帕弥什,九渊,DALCEXY", duration: "03:30", src: "../音乐播放功能/素材/音频/战双帕弥什,九渊,DALCEXY - I Always Do.m4a" },
            { title: "Hikari", artist: "战双帕弥什,GhostFinal,Vanguard Sound", duration: "03:52", src: "../音乐播放功能/素材/音频/战双帕弥什,GhostFinal,Vanguard Sound - Hikari.m4a" },
            { title: "她的梦", artist: "战双帕弥什,Sawako碎花", duration: "03:18", src: "../音乐播放功能/素材/音频/战双帕弥什,Sawako碎花 - 她的梦.m4a" },
            { title: "Under Dimension", artist: "战双帕弥什,Kinoko蘑菇", duration: "03:48", src: "../音乐播放功能/素材/音频/战双帕弥什,Kinoko蘑菇 - Under Dimension.m4a" },
            { title: "寻找四叶草的阿呆蛙", artist: "战双帕弥什,Sawako碎花", duration: "02:55", src: "../音乐播放功能/素材/音频/战双帕弥什,Sawako碎花 - 寻找四叶草的阿呆蛙.m4a" },
            { title: "LAMIA-part3", artist: "战双帕弥什,Vanguard Sound", duration: "03:12", src: "../音乐播放功能/素材/音频/战双帕弥什,Vanguard Sound - LAMIA-part3.m4a" },
            { title: "夏日之上", artist: "战双帕弥什,熊子,ANK", duration: "03:24", src: "../音乐播放功能/素材/音频/战双帕弥什,熊子,ANK - 夏日之上.m4a" },
            { title: "Passion Call（热烈独白）", artist: "战双帕弥什,花玲", duration: "03:15", src: "../音乐播放功能/素材/音频/战双帕弥什,花玲 - Passion Call（热烈独白）.m4a" },
            { title: "Burning Vow 誓焰", artist: "芝麻Mochi", duration: "03:58", src: "../音乐播放功能/素材/音频/芝麻Mochi - Burning Vow 誓焰.m4a" },
            { title: "Elegy Of Fate 遗光颂（剧情曲）", artist: "战双帕弥什,S9ryne", duration: "03:42", src: "../音乐播放功能/素材/音频/战双帕弥什,S9ryne - Elegy Of Fate 遗光颂（剧情曲）.m4a" }
        ];
        
        this.AUDIO_STORAGE_KEY = 'background-music-state';
        this.audio = null;
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        
        this.init();
    }
    
    init() {
        // 创建音频元素
        this.audio = document.createElement('audio');
        this.audio.volume = 0.5;
        document.body.appendChild(this.audio);
        
        // 加载保存的状态
        this.loadAudioState();
        
        // 添加事件监听器
        this.audio.addEventListener('timeupdate', () => this.saveAudioState());
        this.audio.addEventListener('ended', () => this.nextTrack());
        
        // 页面离开时保存状态
        window.addEventListener('beforeunload', () => this.saveAudioState());
    }
    
    // 保存音频状态到localStorage
    saveAudioState() {
        const state = {
            currentTrackIndex: this.currentTrackIndex,
            isPlaying: this.isPlaying,
            currentTime: this.audio.currentTime,
            volume: this.audio.volume
        };
        localStorage.setItem(this.AUDIO_STORAGE_KEY, JSON.stringify(state));
    }
    
    // 从localStorage加载音频状态
    loadAudioState() {
        const savedState = localStorage.getItem(this.AUDIO_STORAGE_KEY);
        if (savedState) {
            const state = JSON.parse(savedState);
            this.currentTrackIndex = state.currentTrackIndex;
            this.isPlaying = state.isPlaying;
            this.audio.volume = state.volume;
            this.loadTrack(this.currentTrackIndex);
            if (this.isPlaying) {
                this.audio.currentTime = state.currentTime;
                this.playTrack();
            }
        }
    }
    
    // 加载指定歌曲
    loadTrack(index) {
        this.currentTrackIndex = (index + this.tracks.length) % this.tracks.length;
        const track = this.tracks[this.currentTrackIndex];
        this.audio.src = track.src;
        this.saveAudioState();
    }
    
    // 播放当前歌曲
    playTrack() {
        this.isPlaying = true;
        this.audio.play().catch(error => {
            console.log('音频播放失败:', error);
        });
        this.saveAudioState();
    }
    
    // 暂停当前歌曲
    pauseTrack() {
        this.isPlaying = false;
        this.audio.pause();
        this.saveAudioState();
    }
    
    // 播放下一首
    nextTrack() {
        this.loadTrack(this.currentTrackIndex + 1);
        if (this.isPlaying) {
            this.playTrack();
        }
    }
    
    // 播放上一首
    prevTrack() {
        this.loadTrack(this.currentTrackIndex - 1);
        if (this.isPlaying) {
            this.playTrack();
        }
    }
    
    // 获取当前播放状态
    getPlaybackState() {
        return {
            isPlaying: this.isPlaying,
            currentTrackIndex: this.currentTrackIndex,
            currentTrack: this.tracks[this.currentTrackIndex],
            currentTime: this.audio.currentTime,
            duration: this.audio.duration
        };
    }
}

// 初始化背景音乐管理
if (typeof window !== 'undefined') {
    window.BackgroundMusic = BackgroundMusic;
    
    // 创建单例实例
    window.backgroundMusic = new BackgroundMusic();
}