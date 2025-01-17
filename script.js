function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    const allSections = document.getElementsByClassName('content');
    
    // 先隐藏所有区域
    for (let item of allSections) {
        item.style.display = 'none';
    }
    
    // 显示被点击的区域
    if (section.style.display === 'none') {
        section.style.display = 'block';
    }
}

// 点击上传按钮时触发文件选择
function clickUpload() {
    const fileInput = document.getElementById('novelFile');
    fileInput.click(); // 触发文件选择窗口
}

// 添加存储相关的函数
const storage = {
    // 保存数据到 localStorage
    save: function(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('保存数据失败:', error);
            showMessage('保存失败，存储空间可能已满', 'error');
        }
    },

    // 从 localStorage 读取数据
    load: function(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('读取数据失败:', error);
            return null;
        }
    }
};

// 修改文件上传处理函数
document.getElementById('novelFile').addEventListener('change', async function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    console.log("选择的文件:", file.name);
    
    try {
        // 读取文件内容
        const buffer = await file.arrayBuffer();
        const encoding = detectEncoding(buffer);
        console.log("检测到的编码:", encoding);
        
        let content;
        if (encoding === 'GBK') {
            const decoder = new TextDecoder('gbk');
            content = decoder.decode(buffer);
        } else {
            const decoder = new TextDecoder('utf-8');
            content = decoder.decode(buffer);
        }
        
        content = traditionToSimplified(content);

        // 创建小说元素
        const novelElement = createNovelElement(file.name, content);
        
        // 获取小说列表容器
        const novelsList = document.querySelector('#novelsList .novels-container');
        if (!novelsList) {
            console.error('找不到小说列表容器');
            showMessage('上传失败：找不到小说列表容器', 'error');
            return;
        }
        
        // 添加新的小说元素
        novelsList.appendChild(novelElement);

        // 保存小说数据
        const novels = storage.load('novels') || [];
        novels.push({
            name: file.name,
            content: content,
            timestamp: new Date().getTime()
        });
        storage.save('novels', novels);

        // 清空文件选择
        event.target.value = '';
        showMessage('小说上传成功并已保存！');
        
        // 自动滚动到新添加的小说
        novelElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
    } catch (error) {
        console.error('处理文件时出错:', error);
        showMessage('处理文件时出错，请重试！', 'error');
    }
});

// 添加图片上传处理
document.getElementById('imageFile').addEventListener('change', async function(event) {
    const files = event.target.files;
    if (!files.length) return;

    try {
        for (const file of files) {
            // 检查是否是图片
            if (!file.type.startsWith('image/')) {
                showMessage(`${file.name} 不是有效的图片文件`, 'error');
                continue;
            }

            // 读取图片为 base64
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageData = e.target.result;
                
                // 创建图片元素
                const img = document.createElement('img');
                img.src = imageData;
                img.alt = file.name;
                
                // 添加到图片展示区
                const imagesContainer = document.getElementById('images');
                imagesContainer.appendChild(img);

                // 保存图片数据
                const images = storage.load('images') || [];
                images.push({
                    name: file.name,
                    data: imageData,
                    timestamp: new Date().getTime()
                });
                storage.save('images', images);
            };
            reader.readAsDataURL(file);
        }
        showMessage('图片上传成功并已保存！');
    } catch (error) {
        console.error('处理图片时出错:', error);
        showMessage('处理图片时出错，请重试！', 'error');
    }
});

// 添加视频上传处理
document.getElementById('videoFile').addEventListener('change', async function(event) {
    const files = event.target.files;
    if (!files.length) return;

    try {
        for (const file of files) {
            // 检查是否是视频
            if (!file.type.startsWith('video/')) {
                showMessage(`${file.name} 不是有效的视频文件`, 'error');
                continue;
            }

            // 读取视频为 base64
            const reader = new FileReader();
            reader.onload = function(e) {
                const videoData = e.target.result;
                
                // 创建视频元素
                const videoContainer = document.createElement('div');
                videoContainer.className = 'video-container';
                videoContainer.innerHTML = `
                    <video controls>
                        <source src="${videoData}" type="${file.type}">
                        您的浏览器不支持视频播放。
                    </video>
                    <div class="video-title">${file.name}</div>
                `;
                
                // 添加到视频展示区
                const videosContainer = document.getElementById('videos');
                videosContainer.appendChild(videoContainer);

                // 保存视频数据
                const videos = storage.load('videos') || [];
                videos.push({
                    name: file.name,
                    data: videoData,
                    type: file.type,
                    timestamp: new Date().getTime()
                });
                storage.save('videos', videos);
            };
            reader.readAsDataURL(file);
        }
        showMessage('视频上传成功并已保存！');
    } catch (error) {
        console.error('处理视频时出错:', error);
        showMessage('处理视频时出错，请重试！', 'error');
    }
});

// 页面加载时恢复保存的内容
document.addEventListener('DOMContentLoaded', function() {
    // 恢复小说
    const novels = storage.load('novels') || [];
    const novelsContainer = document.querySelector('#novelsList .novels-container');
    novels.forEach(novel => {
        const novelElement = createNovelElement(novel.name, novel.content);
        novelsContainer.appendChild(novelElement);
    });

    // 恢复图片
    const images = storage.load('images') || [];
    const imagesContainer = document.getElementById('images');
    images.forEach(image => {
        const img = document.createElement('img');
        img.src = image.data;
        img.alt = image.name;
        imagesContainer.appendChild(img);
    });

    // 恢复视频
    const videos = storage.load('videos') || [];
    const videosContainer = document.getElementById('videos');
    videos.forEach(video => {
        const videoContainer = document.createElement('div');
        videoContainer.className = 'video-container';
        videoContainer.innerHTML = `
            <video controls>
                <source src="${video.data}" type="${video.type}">
                您的浏览器不支持视频播放。
            </video>
            <div class="video-title">${video.name}</div>
        `;
        videosContainer.appendChild(videoContainer);
    });
});

// 繁体转简体函数
function traditionToSimplified(text) {
    // 这里可以添加繁体到简体的转换逻辑
    // 可以使用现成的库如 chinese-conv 或自定义映射表
    // 这里只是一个简单的示例
    const mapping = {
        '個': '个', '這': '这', '說': '说', '時': '时', '東': '东',
        '會': '会', '無': '无', '業': '业', '樣': '样', '機': '机',
        '關': '关', '麼': '么', '對': '对', '產': '产', '實': '实'
        // ... 可以添加更多映射
    };
    
    return text.split('').map(char => mapping[char] || char).join('');
}

// 检测文件编码
function detectEncoding(buffer) {
    const bytes = new Uint8Array(buffer);
    
    // 检查 BOM 标记
    if (bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
        return 'UTF-8';
    }
    
    // 检查是否是 UTF-8
    try {
        const decoder = new TextDecoder('utf-8', {fatal: true});
        decoder.decode(buffer);
        return 'UTF-8';
    } catch {
        return 'GBK';
    }
}

function showMessage(message, type = 'success') {
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.textContent = message;
    messageElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${type === 'success' ? '#2ecc71' : '#e74c3c'};
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 1000;
    `;
    
    document.body.appendChild(messageElement);
    
    setTimeout(() => {
        document.body.removeChild(messageElement);
    }, 3000);
}

// 添加消息动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translateY(-20px); }
        15% { opacity: 1; transform: translateY(0); }
        85% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-20px); }
    }
`;
document.head.appendChild(style);

// 添加语音控制相关变量
let currentSpeech = null;
let isPaused = false;

// 初始化语音选项
function initVoiceOptions() {
    const voiceSelect = document.getElementById('voiceSelect');
    
    function loadVoices() {
        const voices = speechSynthesis.getVoices();
        voiceSelect.innerHTML = '';
        
        // 过滤中文语音优先显示
        const chineseVoices = voices.filter(voice => 
            voice.lang.includes('zh') || voice.lang.includes('cmn'));
        const otherVoices = voices.filter(voice => 
            !voice.lang.includes('zh') && !voice.lang.includes('cmn'));
        
        // 添加中文语音选项组
        if (chineseVoices.length > 0) {
            const chineseGroup = document.createElement('optgroup');
            chineseGroup.label = '中文语音';
            chineseVoices.forEach(voice => {
                const option = document.createElement('option');
                option.value = voice.name;
                option.textContent = `${voice.name} (${voice.lang})`;
                chineseGroup.appendChild(option);
            });
            voiceSelect.appendChild(chineseGroup);
        }
        
        // 添加其他语音选项组
        if (otherVoices.length > 0) {
            const otherGroup = document.createElement('optgroup');
            otherGroup.label = '其他语音';
            otherVoices.forEach(voice => {
                const option = document.createElement('option');
                option.value = voice.name;
                option.textContent = `${voice.name} (${voice.lang})`;
                otherGroup.appendChild(option);
            });
            voiceSelect.appendChild(otherGroup);
        }

        // 如果没有选中的语音，选择第一个可用的语音
        if (!voiceSelect.value && voices.length > 0) {
            voiceSelect.value = voices[0].name;
        }

        // 保存当前选择的语音
        localStorage.setItem('selectedVoice', voiceSelect.value);
    }

    // 当语音列表变化时重新加载
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
    
    // 初始加载语音列表
    // 在某些浏览器中，getVoices可能需要一点时间才能返回结果
    setTimeout(loadVoices, 100);
    
    // 当选择改变时保存选择
    voiceSelect.addEventListener('change', function() {
        localStorage.setItem('selectedVoice', this.value);
        // 立即测试新选择的语音
        testVoice(true);
    });
    
    // 恢复上次选择的语音
    const savedVoice = localStorage.getItem('selectedVoice');
    if (savedVoice) {
        voiceSelect.value = savedVoice;
    }
}

// 获取语言名称
function getLangName(langCode) {
    const langNames = {
        'zh': '中文',
        'en': '英语',
        'ja': '日语',
        'ko': '韩语',
        'fr': '法语',
        'de': '德语'
        // 可以添加更多语言
    };
    return langNames[langCode] || langCode;
}

// 更新控制值显示
function updateControlValue(controlId, valueId) {
    const control = document.getElementById(controlId);
    const valueDisplay = document.getElementById(valueId);
    valueDisplay.textContent = control.value;
    control.addEventListener('input', () => {
        valueDisplay.textContent = control.value;
    });
}

// 初始化控制器
document.addEventListener('DOMContentLoaded', () => {
    initVoiceOptions();
    updateControlValue('voiceSpeed', 'speedValue');
    updateControlValue('voiceVolume', 'volumeValue');
    updateControlValue('voicePitch', 'pitchValue');
});

// 修改播放控制功能
function togglePlay(button) {
    console.log('开始播放处理');
    
    const fileItem = button.closest('.file-item');
    if (!fileItem) {
        console.error('找不到文件项元素');
        return;
    }
    
    const content = fileItem.querySelector('.file-content');
    if (!content) {
        console.error('找不到内容元素');
        return;
    }
    
    const paragraphs = content.querySelectorAll('.paragraph');
    if (!paragraphs.length) {
        console.error('找不到段落元素');
        return;
    }
    
    if (!window.speechSynthesis) {
        showMessage('您的浏览器不支持语音播放功能', 'error');
        return;
    }
    
    // 如果正在播放，则停止播放
    if (button.classList.contains('playing')) {
        window.speechSynthesis.cancel();
        button.innerHTML = '<i class="fas fa-play"></i>';
        button.classList.remove('playing');
        fileItem.classList.remove('playing');
        return;
    }
    
    // 停止其他正在播放的内容
    window.speechSynthesis.cancel();
    document.querySelectorAll('.play-btn').forEach(btn => {
        btn.innerHTML = '<i class="fas fa-play"></i>';
        btn.classList.remove('playing');
        btn.closest('.file-item')?.classList.remove('playing');
    });
    
    let currentIndex = 0;
    const totalParagraphs = paragraphs.length;
    
    function speakParagraph() {
        if (currentIndex >= totalParagraphs) {
            button.innerHTML = '<i class="fas fa-play"></i>';
            button.classList.remove('playing');
            fileItem.classList.remove('playing');
            readingStats.endReading(); // 结束阅读会话
            return;
        }
        
        // 更新段落样式和阅读进度
        let totalReadChars = 0;
        paragraphs.forEach((p, index) => {
            p.classList.remove('active', 'played');
            if (index < currentIndex) {
                p.classList.add('played');
                totalReadChars += p.textContent.length;
            } else if (index === currentIndex) {
                p.classList.add('active');
                p.scrollIntoView({ behavior: 'smooth', block: 'center' });
                totalReadChars += p.textContent.length;
            }
        });
        
        readingStats.updateProgress(totalReadChars);
        
        // 更新当前文本显示
        const currentText = fileItem.querySelector('.current-text');
        if (currentText) {
            currentText.textContent = paragraphs[currentIndex].textContent;
        }
        
        // 更新进度条
        const progress = fileItem.querySelector('.progress');
        if (progress) {
            progress.style.width = `${(currentIndex / totalParagraphs) * 100}%`;
        }
        
        // 更新时间信息
        const timeInfo = fileItem.querySelector('.time-info');
        if (timeInfo) {
            timeInfo.textContent = `${currentIndex + 1} / ${totalParagraphs}`;
        }
        
        const speech = new SpeechSynthesisUtterance(paragraphs[currentIndex].textContent);
        
        // 设置语音参数
        const selectedVoice = document.getElementById('voiceSelect').value;
        const voices = speechSynthesis.getVoices();
        const voice = voices.find(v => v.name === selectedVoice);
        if (voice) {
            speech.voice = voice;
            speech.lang = voice.lang;
        } else {
            console.warn('未找到选择的语音，使用默认语音');
        }
        
        speech.rate = parseFloat(document.getElementById('voiceSpeed').value);
        speech.volume = parseFloat(document.getElementById('voiceVolume').value);
        speech.pitch = parseFloat(document.getElementById('voicePitch').value);
        
        speech.onend = () => {
            currentIndex++;
            speakParagraph();
        };
        
        window.speechSynthesis.speak(speech);
    }
    
    // 开始播放时初始化阅读统计
    if (!button.classList.contains('playing')) {
        const fileName = fileItem.querySelector('.file-name').textContent;
        const totalChars = Array.from(paragraphs)
            .reduce((sum, p) => sum + p.textContent.length, 0);
        readingStats.startReading(fileName, totalChars);
    }
    
    // 开始播放
    button.innerHTML = '<i class="fas fa-pause"></i>';
    button.classList.add('playing');
    fileItem.classList.add('playing');
    content.style.display = 'block'; // 显示内容区域
    speakParagraph();
}

// 更新段落样式
function updateParagraphStyles(novelElement, currentIndex) {
    const paragraphs = novelElement.querySelectorAll('.paragraph');
    paragraphs.forEach((p, index) => {
        p.classList.remove('active');
        if (index < currentIndex) {
            p.classList.add('played');
        } else if (index === currentIndex) {
            p.classList.add('active');
            // 滚动到当前段落
            p.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            p.classList.remove('played');
        }
    });
}

// 清除所有段落样式
function clearParagraphStyles(novelElement) {
    const paragraphs = novelElement.querySelectorAll('.paragraph');
    paragraphs.forEach(p => {
        p.classList.remove('active', 'played');
    });
}

// 修改文件上传后的显示内容
function createNovelElement(fileName, content) {
    const novelElement = document.createElement('div');
    novelElement.className = 'novel-file';
    
    // 将内容分段，并过滤掉空行
    const paragraphs = content.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

    // 创建文件样式的结构
    novelElement.innerHTML = `
        <div class="file-item">
            <div class="file-icon">
                <i class="fas fa-file-alt"></i>
            </div>
            <div class="file-info">
                <div class="file-name">${fileName}</div>
                <div class="file-stats">${paragraphs.length} 段落</div>
            </div>
            <div class="file-controls">
                <button class="play-btn" onclick="togglePlay(this)">
                    <i class="fas fa-play"></i>
                </button>
            </div>
            <div class="file-content" style="display: none;">
                <div class="novel-player">
                    <div class="player-left">
                        <div class="novel-content">
                            ${paragraphs.map((p, index) => 
                                `<p class="paragraph" data-index="${index}">${p}</p>`
                            ).join('')}
                        </div>
                    </div>
                    <div class="player-right">
                        <div class="player-info">
                            <div class="current-title">${fileName}</div>
                            <div class="current-text"></div>
                        </div>
                        <div class="player-controls">
                            <div class="progress-bar">
                                <div class="progress"></div>
                            </div>
                            <div class="time-info">0 / ${paragraphs.length}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    return novelElement;
}

// 修改测试语音功能
function testVoice(isShort = false) {
    const selectedVoice = document.getElementById('voiceSelect').value;
    const testText = isShort ? "测试语音。" : "这是一个语音测试，您可以通过这段话来确认声音效果。";
    
    // 停止当前播放的内容
    window.speechSynthesis.cancel();
    
    const speech = new SpeechSynthesisUtterance(testText);
    
    // 设置语音参数
    speech.rate = parseFloat(document.getElementById('voiceSpeed').value);
    speech.volume = parseFloat(document.getElementById('voiceVolume').value);
    speech.pitch = parseFloat(document.getElementById('voicePitch').value);
    
    // 获取选中的语音
    const voices = speechSynthesis.getVoices();
    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) {
        speech.voice = voice;
        speech.lang = voice.lang; // 使用选定语音的语言
    } else {
        showMessage('未找到选择的语音', 'error');
        return;
    }
    
    // 播放测试语音
    window.speechSynthesis.speak(speech);
}

// 添加翻译功能
let isTranslating = false;

async function toggleTranslation() {
    const translateBtn = document.querySelector('.translate-btn');
    const targetLang = document.getElementById('targetLang').value;
    
    if (isTranslating) {
        // 取消翻译，恢复原文
        document.querySelectorAll('.paragraph').forEach(p => {
            if (p.originalText) {
                p.textContent = p.originalText;
            }
        });
        translateBtn.classList.remove('translating');
        translateBtn.innerHTML = '<i class="fas fa-language"></i> 翻译';
        isTranslating = false;
    } else {
        // 开始翻译
        translateBtn.classList.add('translating');
        translateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 翻译中...';
        isTranslating = true;
        
        try {
            const paragraphs = document.querySelectorAll('.paragraph');
            for (let p of paragraphs) {
                if (!p.originalText) {
                    p.originalText = p.textContent;
                }
                
                // 这里使用 Google 翻译 API 或其他翻译服务
                // 这是一个示例，实际使用时需要替换为真实的翻译 API
                const translatedText = await translateText(p.originalText, targetLang);
                p.textContent = translatedText;
            }
            
            translateBtn.innerHTML = '<i class="fas fa-check"></i> 已翻译';
        } catch (error) {
            console.error('翻译错误:', error);
            showMessage('翻译失败，请重试！', 'error');
            translateBtn.classList.remove('translating');
            translateBtn.innerHTML = '<i class="fas fa-language"></i> 翻译';
            isTranslating = false;
        }
    }
}

// 翻译文本的函数（需要替换为实际的翻译 API）
async function translateText(text, targetLang) {
    // 这里应该调用实际的翻译 API
    // 以下是示例代码，实际使用时需要替换
    try {
        const response = await fetch('https://translation-api.example.com/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text,
                targetLang: targetLang
            })
        });
        
        if (!response.ok) {
            throw new Error('翻译请求失败');
        }
        
        const data = await response.json();
        return data.translatedText;
    } catch (error) {
        console.error('翻译API错误:', error);
        throw error;
    }
}

// 添加数据分析相关功能
const analytics = {
    // 初始化访问统计
    initVisits: function() {
        const today = new Date().toLocaleDateString();
        const visits = this.getVisits();
        
        if (visits.lastVisit !== today) {
            visits.today = 1;
            visits.lastVisit = today;
        } else {
            visits.today++;
        }
        
        visits.total++;
        this.saveVisits(visits);
        this.updateVisitDisplay(visits);
    },
    
    // 获取访问数据
    getVisits: function() {
        const defaultVisits = {
            total: 0,
            today: 0,
            lastVisit: new Date().toLocaleDateString()
        };
        return storage.load('visits') || defaultVisits;
    },
    
    // 保存访问数据
    saveVisits: function(visits) {
        storage.save('visits', visits);
    },
    
    // 更新访问显示
    updateVisitDisplay: function(visits) {
        document.getElementById('totalVisits').textContent = visits.total;
        document.getElementById('todayVisits').textContent = visits.today;
    },
    
    // 计算文件统计
    updateFileStats: function() {
        const novels = storage.load('novels') || [];
        const images = storage.load('images') || [];
        const videos = storage.load('videos') || [];
        
        document.getElementById('novelCount').textContent = novels.length;
        document.getElementById('imageCount').textContent = images.length;
        document.getElementById('videoCount').textContent = videos.length;
        
        // 计算存储使用情况
        let totalSize = 0;
        novels.forEach(novel => totalSize += this.getStringSize(novel.content));
        images.forEach(image => totalSize += this.getBase64Size(image.data));
        videos.forEach(video => totalSize += this.getBase64Size(video.data));
        
        const usedMB = (totalSize / (1024 * 1024)).toFixed(2);
        const remainingMB = (50 - usedMB).toFixed(2); // 假设总存储空间为 50MB
        
        document.getElementById('usedStorage').textContent = `${usedMB} MB`;
        document.getElementById('remainingStorage').textContent = `${remainingMB} MB`;
    },
    
    // 计算字符串大小
    getStringSize: function(str) {
        return new Blob([str]).size;
    },
    
    // 计算 base64 大小
    getBase64Size: function(base64String) {
        const padding = base64String.endsWith('==') ? 2 : base64String.endsWith('=') ? 1 : 0;
        return (base64String.length * 0.75) - padding;
    },
    
    // 初始化趋势图表
    initTrendsChart: function() {
        const ctx = document.getElementById('trendsChart').getContext('2d');
        const data = this.getTrendsData();
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: '小说',
                        data: data.novels,
                        borderColor: '#3498db',
                        tension: 0.4
                    },
                    {
                        label: '图片',
                        data: data.images,
                        borderColor: '#2ecc71',
                        tension: 0.4
                    },
                    {
                        label: '视频',
                        data: data.videos,
                        borderColor: '#e74c3c',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: '文件上传趋势'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    },
    
    // 获取趋势数据
    getTrendsData: function() {
        const novels = storage.load('novels') || [];
        const images = storage.load('images') || [];
        const videos = storage.load('videos') || [];
        
        // 获取最近7天的日期
        const dates = Array.from({length: 7}, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return date.toLocaleDateString();
        }).reverse();
        
        // 统计每天的上传数量
        const novelCounts = dates.map(date => 
            novels.filter(n => new Date(n.timestamp).toLocaleDateString() === date).length
        );
        
        const imageCounts = dates.map(date => 
            images.filter(i => new Date(i.timestamp).toLocaleDateString() === date).length
        );
        
        const videoCounts = dates.map(date => 
            videos.filter(v => new Date(v.timestamp).toLocaleDateString() === date).length
        );
        
        return {
            labels: dates,
            novels: novelCounts,
            images: imageCounts,
            videos: videoCounts
        };
    }
};

// 刷新数据分析
function refreshAnalytics() {
    analytics.updateFileStats();
    analytics.initTrendsChart();
    showMessage('数据已更新！');
}

// 页面加载时初始化数据分析
document.addEventListener('DOMContentLoaded', function() {
    // 添加 Chart.js
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = function() {
        analytics.initVisits();
        analytics.updateFileStats();
        analytics.initTrendsChart();
    };
    document.head.appendChild(script);
});

// 修改文件上传处理函数，添加数据更新
const originalNovelUploadHandler = document.getElementById('novelFile').onchange;
document.getElementById('novelFile').onchange = async function(event) {
    await originalNovelUploadHandler.call(this, event);
    analytics.updateFileStats();
    analytics.initTrendsChart();
    readingStats.updateReadingStats(); // 更新阅读统计
};

const originalImageUploadHandler = document.getElementById('imageFile').onchange;
document.getElementById('imageFile').onchange = async function(event) {
    await originalImageUploadHandler.call(this, event);
    analytics.updateFileStats();
    analytics.initTrendsChart();
};

const originalVideoUploadHandler = document.getElementById('videoFile').onchange;
document.getElementById('videoFile').onchange = async function(event) {
    await originalVideoUploadHandler.call(this, event);
    analytics.updateFileStats();
    analytics.initTrendsChart();
};

// 添加阅读统计相关功能
const readingStats = {
    startTime: null,
    currentNovel: null,
    readingSessions: [],

    // 初始化阅读统计
    init: function() {
        this.readingSessions = storage.load('readingSessions') || [];
        this.updateReadingStats();
    },

    // 开始阅读会话
    startReading: function(novelName, totalChars) {
        this.startTime = new Date();
        this.currentNovel = {
            name: novelName,
            totalChars: totalChars,
            readChars: 0
        };
    },

    // 更新阅读进度
    updateProgress: function(readChars) {
        if (this.currentNovel) {
            this.currentNovel.readChars = readChars;
        }
    },

    // 结束阅读会话
    endReading: function() {
        if (!this.startTime || !this.currentNovel) return;

        const endTime = new Date();
        const duration = (endTime - this.startTime) / 1000 / 60; // 转换为分钟
        
        this.readingSessions.push({
            novelName: this.currentNovel.name,
            startTime: this.startTime,
            endTime: endTime,
            duration: duration,
            totalChars: this.currentNovel.totalChars,
            readChars: this.currentNovel.readChars,
            date: endTime.toLocaleDateString()
        });

        storage.save('readingSessions', this.readingSessions);
        this.updateReadingStats();

        this.startTime = null;
        this.currentNovel = null;
    },

    // 更新阅读统计显示
    updateReadingStats: function() {
        const stats = this.calculateStats();
        
        document.getElementById('totalReadingTime').textContent = 
            `${Math.round(stats.totalTime)}分钟`;
        document.getElementById('todayReadingTime').textContent = 
            `${Math.round(stats.todayTime)}分钟`;
        document.getElementById('readNovels').textContent = 
            stats.uniqueNovels;
        document.getElementById('avgReadingSpeed').textContent = 
            `${Math.round(stats.avgSpeed)}字/分钟`;
    },

    // 计算阅读统计数据
    calculateStats: function() {
        const today = new Date().toLocaleDateString();
        let totalTime = 0;
        let todayTime = 0;
        let totalChars = 0;
        const novelSet = new Set();

        this.readingSessions.forEach(session => {
            totalTime += session.duration;
            totalChars += session.readChars;
            novelSet.add(session.novelName);

            if (session.date === today) {
                todayTime += session.duration;
            }
        });

        return {
            totalTime: totalTime,
            todayTime: todayTime,
            uniqueNovels: novelSet.size,
            avgSpeed: totalTime > 0 ? totalChars / totalTime : 0
        };
    }
};

// 页面加载时初始化阅读统计
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...
    readingStats.init();
}); 