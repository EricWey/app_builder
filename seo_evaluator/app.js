// 全局变量声明
let urlInput, analyzeBtn, loading, results;

// 初始化应用
function initApp() {
    // 获取DOM元素
    urlInput = document.getElementById('url-input');
    analyzeBtn = document.getElementById('analyze-btn');
    loading = document.getElementById('loading');
    results = document.getElementById('results');

    // 验证所有必需元素
    if (!urlInput || !analyzeBtn || !loading || !results) {
        console.error('初始化失败：缺少必需的DOM元素');
        return;
    }

    // 绑定事件
    analyzeBtn.addEventListener('click', handleAnalyzeClick);
    console.log('应用初始化完成');
}

// 处理分析按钮点击
function handleAnalyzeClick(e) {
    e.preventDefault();
    console.log('分析按钮被点击');
    
    if (!urlInput || !loading || !results) {
        console.error('DOM元素未正确初始化');
        return;
    }

    try {
        analyzeSEO();
    } catch (error) {
        console.error('分析过程中出错:', error);
        if (loading) loading.classList.add('hidden');
        alert('分析失败: ' + error.message);
    }
}

// 确保DOM加载后初始化
if (document.readyState === 'complete') {
    initApp();
} else {
    document.addEventListener('DOMContentLoaded', initApp);
    window.addEventListener('load', initApp);
}

    function analyzeSEO() {
        const urlInput = document.getElementById('url-input');
        if (!urlInput) {
            console.error('urlInput元素未找到');
            return;
        }
        const url = urlInput.value.trim();
        if (!url) {
            alert('请输入有效的网站URL');
            return;
        }
        console.log('开始分析:', url); // 调试日志

        // 显示加载状态
        loading.classList.remove('hidden');
        results.classList.add('hidden');

        // 获取SEO数据
        const seoPromise = new Promise(resolve => {
            setTimeout(() => {
                resolve(generateMockSeoData(url));
            }, 1000);
        });

        // 确保URL格式正确
        const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
        
        console.log('开始分析流程');
        // 获取SEO数据
        const seoData = generateMockSeoData(url);
        
        // 单独获取截图
        console.log('尝试获取截图:', formattedUrl);
        fetch(`https://image.thum.io/get/width/800/crop/600/${formattedUrl}`)
            .then(response => {
                if (!response.ok) throw new Error('截图服务不可用');
                return response.blob();
            })
            .then(blob => {
                seoData.screenshotUrl = URL.createObjectURL(blob);
                displayResults(seoData);
            })
            .catch(error => {
                console.error('截图获取失败:', error);
                seoData.screenshotError = '网站预览不可用: ' + error.message;
                displayResults(seoData);
            })
        fetch(`https://image.thum.io/get/width/800/crop/600/${formattedUrl}`)
            .then(response => {
                if (!response.ok) throw new Error('截图服务不可用');
                return response.blob();
            })
            .then(blob => {
                const seoData = generateMockSeoData(url);
                seoData.screenshotUrl = URL.createObjectURL(blob);
                displayResults(seoData);
            })
            .catch(error => {
                console.error('截图获取失败:', error);
                const seoData = generateMockSeoData(url);
                seoData.screenshotError = '无法获取网站预览图，请确认网站可公开访问';
                displayResults(seoData);
            })
            .catch(error => {
                console.error('截图获取失败:', error);
                const seoData = generateMockSeoData(url);
                seoData.screenshotError = '无法获取网站预览图: ' + error.message;
                displayResults(seoData);
            })
            .finally(() => {
                loading.classList.add('hidden');
                results.classList.remove('hidden');
                console.log('分析流程结束');
            });
    }

    function generateMockSeoData(url) {
        // 模拟SEO数据 - 实际项目中这里会调用API
        return {
            url: url.startsWith('http') ? url : `https://${url}`,
            score: Math.floor(Math.random() * 40) + 60, // 60-100之间的随机分数
            factors: [
                {
                    name: '标题优化',
                    status: 'good',
                    description: '页面标题包含关键词且长度适中'
                },
                {
                    name: '元描述',
                    status: 'medium',
                    description: '元描述可以更详细地包含关键词'
                },
                {
                    name: '移动适配',
                    status: 'good',
                    description: '页面完美适配移动设备'
                },
                {
                    name: '页面速度',
                    status: 'poor',
                    description: '页面加载时间超过3秒，需要优化'
                },
                {
                    name: '内部链接',
                    status: 'medium',
                    description: '内部链接结构良好但可以改进'
                }
            ]
        };
    }

    function displayResults(data) {
        const scoreColor = data.score >= 80 ? 'bg-green-500' : 
                         data.score >= 60 ? 'bg-yellow-500' : 'bg-red-500';

        results.innerHTML = `
            <div class="text-center mb-8">
                <div class="seo-score ${scoreColor} text-white mb-4">${data.score}</div>
                <h2 class="text-2xl font-semibold text-gray-800">${data.url}</h2>
                <p class="text-gray-600 mt-2">SEO综合评分(满分100)</p>
            </div>

            <div class="mb-8 p-4 bg-gray-100 rounded-lg">
                <h3 class="text-lg font-medium text-gray-800 mb-4">网站预览</h3>
                <div class="bg-white border border-gray-300 p-2">
                    <div class="aspect-w-16 aspect-h-9 bg-gray-200 flex items-center justify-center">
                        ${data.screenshotUrl ? 
                            `<img src="${data.screenshotUrl}" alt="网站预览" class="w-full h-auto">` : 
                            `<p class="text-gray-500">${data.screenshotError || '网站预览图不可用'}</p>`}
                    </div>
                </div>
            </div>

            <div>
                <h3 class="text-lg font-medium text-gray-800 mb-4">SEO因素分析</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${data.factors.map(factor => `
                        <div class="seo-factor ${factor.status}">
                            <h4 class="font-medium text-gray-800">${factor.name}</h4>
                            <p class="text-gray-600">${factor.description}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
;