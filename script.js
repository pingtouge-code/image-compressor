// 获取DOM元素
const uploadArea = document.getElementById('uploadArea');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const sizeSelect = document.getElementById('sizeSelect');
const originalPreview = document.getElementById('originalPreview');
const compressedPreview = document.getElementById('compressedPreview');
const originalSize = document.getElementById('originalSize');
const compressedSize = document.getElementById('compressedSize');
const downloadBtn = document.querySelector('.download-btn');

// 添加尺寸控制相关代码
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const keepRatio = document.getElementById('keepRatio');
let originalRatio = 1;

// 处理拖拽上传
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#2196f3';
});

uploadArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#ccc';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#ccc';
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleImage(files[0]);
    }
});

// 处理文件选择
document.querySelector('.select-btn').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
        if (e.target.files.length > 0) {
            handleImage(e.target.files[0]);
        }
    };
    input.click();
});

// 处理图片压缩
function handleImage(file) {
    if (file.size > 5 * 1024 * 1024) {
        alert('图片大小不能超过5MB');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            // 显示原图预览
            originalPreview.innerHTML = '';
            originalPreview.appendChild(img.cloneNode());
            originalSize.textContent = formatFileSize(file.size);
            
            // 设置初始尺寸
            originalRatio = img.width / img.height;
            widthInput.value = img.width;
            heightInput.value = img.height;
            
            // 压缩图片
            compressImage(img);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// 处理宽度变化
widthInput.addEventListener('input', () => {
    if (keepRatio.checked && widthInput.value) {
        heightInput.value = Math.round(widthInput.value / originalRatio);
    }
    updateCompressedImage();
});

// 处理高度变化
heightInput.addEventListener('input', () => {
    if (keepRatio.checked && heightInput.value) {
        widthInput.value = Math.round(heightInput.value * originalRatio);
    }
    updateCompressedImage();
});

// 更新压缩图片
function updateCompressedImage() {
    const img = originalPreview.querySelector('img');
    if (img) {
        compressImage(img);
    }
}

// 修改压缩图片函数
function compressImage(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 设置输出尺寸
    let width = parseInt(widthInput.value) || img.width;
    let height = parseInt(heightInput.value) || img.height;
    
    canvas.width = width;
    canvas.height = height;
    
    // 绘制图片
    ctx.drawImage(img, 0, 0, width, height);
    
    // 输出压缩后的图片
    const quality = qualitySlider.value / 100;
    const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
    
    // 显示压缩后预览
    const compressedImg = new Image();
    compressedImg.src = compressedDataUrl;
    compressedPreview.innerHTML = '';
    compressedPreview.appendChild(compressedImg);
    
    // 计算压缩后文件大小
    const compressedSize = Math.round((compressedDataUrl.length - 'data:image/jpeg;base64,'.length) * 3/4);
    document.getElementById('compressedSize').textContent = formatFileSize(compressedSize);
    
    // 启用下载按钮
    downloadBtn.disabled = false;
    downloadBtn.onclick = () => {
        const link = document.createElement('a');
        link.download = 'compressed-image.jpg';
        link.href = compressedDataUrl;
        link.click();
    };
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes/1024).toFixed(2) + ' KB';
    return (bytes/1024/1024).toFixed(2) + ' MB';
}

// 更新质量显示
qualitySlider.addEventListener('input', () => {
    qualityValue.textContent = qualitySlider.value + '%';
}); 