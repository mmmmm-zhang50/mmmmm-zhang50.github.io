

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// 全局变量
let focusedPhoto = null;
let photoGroup = [];
let cameraAngleX = 0;
let cameraAngleY = 0;
let targetCameraPos = null;
let lastHandX = 0, lastHandY = 0;
let globalRotationAngle = 0;
let currentMix = 1.0;
let currentState = 'closed';
let particleMaterial = null;
let coreSphere = null;
let originalParticleSize = 0.18;  // 粒子调大，更圆润
const IMAGE_LIST = [
    'images/photo2.jpg',
    'images/photo3.jpg',
    'images/photo4.jpg',
    'images/photo5.jpg',
    'images/photo6.jpg',
    'images/photo7.jpg',
    'images/photo8.jpg',
    'images/photo9.jpg',
    'images/photo10.jpg'
];

document.addEventListener('DOMContentLoaded', () => {
    init();
});

async function init() {
    // --- 初始化场景、相机、渲染器 ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050b03);
    scene.fog = new THREE.FogExp2(0x050b03, 0.006);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(4, 3, 7);
    camera.lookAt(0, 0, 0);
    targetCameraPos = camera.position.clone();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.3;
    document.body.appendChild(renderer.domElement);

    // 后期特效
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.4, 0.5, 0.85);
    bloomPass.threshold = 0.03;
    bloomPass.strength = 0.55;
    bloomPass.radius = 0.8;
    const effectComposer = new EffectComposer(renderer);
    effectComposer.addPass(renderScene);
    effectComposer.addPass(bloomPass);

    // --- 光照系统 ---
    const ambientLight = new THREE.AmbientLight(0x332200, 0.6);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffdd99, 1.2);
    mainLight.position.set(3, 5, 2);
    scene.add(mainLight);

    const backLight = new THREE.PointLight(0xd4af37, 0.7);
    backLight.position.set(-2, 2, -3);
    scene.add(backLight);

    const goldFill = new THREE.PointLight(0xffaa44, 0.6);
    goldFill.position.set(1, 2, 2);
    scene.add(goldFill);

    // 金色闪烁粒子背景
    const starField = new THREE.Points(
        new THREE.BufferGeometry(),
        new THREE.PointsMaterial({ color: 0xd4af37, size: 0.05, transparent: true, opacity: 0.5 })
    );
    const starCount = 1200;
    const starPos = [];
    for (let i = 0; i < starCount; i++) {
        starPos.push((Math.random() - 0.5) * 180);
        starPos.push((Math.random() - 0.5) * 100);
        starPos.push((Math.random() - 0.5) * 80 - 40);
    }
    starField.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(starPos), 3));
    scene.add(starField);

    // --- 金色粒子系统（非遗文化金色调）---
    const PARTICLE_COUNT = 5000;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colorsArray = new Float32Array(PARTICLE_COUNT * 3);

    // 生成粒子颜色 - 以金色为主，少量红色点缀
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        positions[i*3] = (Math.random() - 0.5) * 5;
        positions[i*3+1] = (Math.random() - 0.5) * 5;
        positions[i*3+2] = (Math.random() - 0.5) * 5;
        
        const colorChoice = Math.random();
        let r, g, b;
        if (colorChoice < 0.85) {
            // 金色系
            r = 0.95 + Math.random() * 0.1;
            g = 0.75 + Math.random() * 0.15;
            b = 0.25 + Math.random() * 0.2;
        } else {
            // 红色点缀（非遗中国红）
            r = 0.9;
            g = 0.2;
            b = 0.2;
        }
        const bright = 0.7 + Math.random() * 0.6;
        colorsArray[i*3] = r * bright;
        colorsArray[i*3+1] = g * bright;
        colorsArray[i*3+2] = b * bright;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

    // 圆形渐变粒子纹理（更圆润）
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(32, 32, 28, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.shadowBlur = 0;
    const texture = new THREE.CanvasTexture(canvas);

    particleMaterial = new THREE.PointsMaterial({
        size: originalParticleSize,
        vertexColors: true,
        map: texture,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.95
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // 存储每个粒子的闪烁状态
    const particleFlicker = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particleFlicker.push({
            speed: 0.5 + Math.random() * 2,
            phase: Math.random() * Math.PI * 2,
            originalSize: originalParticleSize * (0.7 + Math.random() * 0.6)
        });
    }

    // 中心光球体 - 金色
    const coreGlowMat = new THREE.MeshStandardMaterial({
        color: 0xffaa44,
        emissive: 0xff6600,
        emissiveIntensity: 0.4,
        metalness: 0.95,
        roughness: 0.15,
        transparent: true,
        opacity: 0.5
    });
    coreSphere = new THREE.Mesh(new THREE.SphereGeometry(0.7, 64, 64), coreGlowMat);
    scene.add(coreSphere);
    // ========== 中心光球体点击跳转功能 ==========
   const originalIntensity = coreGlowMat.emissiveIntensity;
   window.addEventListener('click', (event) => {
      const mouseX = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
      const mouseY = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);
      const intersects = raycaster.intersectObject(coreSphere);
      if (intersects.length > 0) {
        window.open('test.html', '_self');
        coreGlowMat.emissiveIntensity = 1.0;
        setTimeout(() => { coreGlowMat.emissiveIntensity = originalIntensity; }, 150);
       }
    });


    // 周围漂浮小光点
    const sparkleCount = 1000;
    const sparkleGeo = new THREE.BufferGeometry();
    const sparklePos = [];
    for (let i = 0; i < sparkleCount; i++) {
        sparklePos.push((Math.random() - 0.5) * 7);
        sparklePos.push((Math.random() - 0.5) * 6);
        sparklePos.push((Math.random() - 0.5) * 7);
    }
    sparkleGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(sparklePos), 3));
    const sparkleMat = new THREE.PointsMaterial({ color: 0xffaa66, size: 0.05, blending: THREE.AdditiveBlending });
    const sparkles = new THREE.Points(sparkleGeo, sparkleMat);
    scene.add(sparkles);

    // 计算合拢态粒子位置
    function computeClosedParticlePositions() {
        const posArray = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const radius = 0.9 + Math.pow(Math.random(), 1.5) * 1.6;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const x = Math.sin(phi) * Math.cos(theta) * radius;
            const y = Math.sin(phi) * Math.sin(theta) * radius * 0.9;
               const z = Math.cos(phi) * radius;
            posArray.push(new THREE.Vector3(x, y, z));
        }
        return posArray;
    }

    function computeSpreadParticlePositions() {
        const posArray = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const radius = 3.5 + Math.random() * 3;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const x = Math.sin(phi) * Math.cos(theta) * radius;
            const y = Math.sin(phi) * Math.sin(theta) * radius * 0.8 + 0.5;
            const z = Math.cos(phi) * radius;
            posArray.push(new THREE.Vector3(x, y, z));
        }
        return posArray;
    }

    let closedParticleTargets = computeClosedParticlePositions();
    let spreadParticleTargets = computeSpreadParticlePositions();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const pos = closedParticleTargets[i];
        particleGeometry.attributes.position.setXYZ(i, pos.x, pos.y, pos.z);
    }
    particleGeometry.attributes.position.needsUpdate = true;

    function updateTargetsForState() {
        if (currentState === 'closed') {
            closedParticleTargets = computeClosedParticlePositions();
            currentMix = 1;
        } else if (currentState === 'spread') {
            spreadParticleTargets = computeSpreadParticlePositions();
            currentMix = 0;
        }
    }

    // --- 加载图片（随机位置，金色边框）---
    function loadImages() {
    const validImages = IMAGE_LIST.filter(url => url && url.trim() !== '');
    const totalPhotos = validImages.length;
    
    validImages.forEach((imageUrl, index) => {
        const photoWidth = 0.85;
        const photoHeight = 0.85;
        
        // 临时材质
        const tempMat = new THREE.MeshStandardMaterial({
            color: 0xd4af37, metalness: 0.5, roughness: 0.3 
        });
        const photoPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(photoWidth, photoHeight), 
            tempMat
        );

        // ==========================================
        // 核心改动 1：使用斐波那契球面算法均匀分布，防止重叠
        // ==========================================
        const radius = 2.2; // 将半径适当调大（原来是1.2+random），给图片留出物理空间
        // 黄金比例角度
        const phi = Math.acos(1 - 2 * (index + 0.5) / totalPhotos);
        const theta = Math.PI * (1 + Math.sqrt(5)) * index;
        
        const targetX = Math.cos(theta) * Math.sin(phi) * radius;
        const targetY = Math.cos(phi) * radius * 0.8; // Y轴稍微压扁适应屏幕比例
        const targetZ = Math.sin(theta) * Math.sin(phi) * radius;

        photoPlane.position.set(targetX, targetY, targetZ);
        photoPlane.lookAt(0, 0, 0); // 让所有照片都朝向球体中心

        // 保留你原有的 userData 逻辑
        photoPlane.userData = {
            type: 'photo',
            id: index,
            originalScale: 1,
            isFocused: false,
            originalPosition: photoPlane.position.clone(),
            originalRotation: photoPlane.rotation.clone(),
            textureLoaded: false,
            randomAngle: Math.random() * Math.PI * 2,
            randomSpeed: 0.003 + Math.random() * 0.01
        };
        
        scene.add(photoPlane);
        photoGroup.push(photoPlane);

        // 金色边框（保留你的原样设计）
        const borderMat = new THREE.MeshStandardMaterial({
            color: 0xffaa33, metalness: 0.9, roughness: 0.2, 
            emissive: 0x442200, emissiveIntensity: 0.3 
        });
        const border = new THREE.Mesh(
            new THREE.BoxGeometry(photoWidth + 0.08, photoHeight + 0.08, 0.05), 
            borderMat
        );
        photoPlane.add(border);

        // ==========================================
        // 核心改动 2：使用 Three.js 的 TextureLoader 解决本地加载问题
        // ==========================================
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(
            imageUrl,
            (texture) => {
                // 加载成功后替换材质
                photoPlane.material = new THREE.MeshStandardMaterial({
                    map: texture,
                    side: THREE.DoubleSide,
                    metalness: 0.3,
                    roughness: 0.2,
                    emissive: 0x331a00,
                    emissiveIntensity: 0.15
                });
                photoPlane.userData.textureLoaded = true;
            },
            undefined, // 进度回调（通常不需要）
            (err) => {
                console.warn(`图片加载失败，请检查 images 文件夹中是否存在: ${imageUrl}`);
            }
        );
    });

    // 状态更新提示
    document.getElementById('gestureStatus').innerHTML = 
        ` 已加载 ${validImages.length} 张非遗照片，可用抓取手势放大到屏幕中央`;
}
     loadImages();

    // 恢复照片函数
    function restorePhoto() {
        if (focusedPhoto && focusedPhoto.parent) {
            focusedPhoto.scale.set(1, 1, 1);
            if (focusedPhoto.userData.originalPosition) {
                focusedPhoto.position.copy(focusedPhoto.userData.originalPosition);
            }
            focusedPhoto.lookAt(0, 0, 0);
            if (focusedPhoto.children[0]) {
                focusedPhoto.children[0].material.color.setHex(0xffaa33);
            }
            focusedPhoto.userData.isFocused = false;
            focusedPhoto = null;
            particleMaterial.size = originalParticleSize;
            coreSphere.material.emissiveIntensity = 0.9;
        }
    }

    // --- 手势识别 ---
    const videoElement = document.createElement('video');
    videoElement.setAttribute('autoplay', '');
    videoElement.setAttribute('playsinline', '');
    videoElement.style.display = 'none';
    document.body.appendChild(videoElement);

    const hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    function processGesture(landmarks) {
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        
        const fingersExtended = [
            indexTip.y < landmarks[6].y,
            landmarks[12].y < landmarks[10].y,
            landmarks[16].y < landmarks[14].y,
            landmarks[20].y < landmarks[18].y
        ];
        const extendedCount = fingersExtended.filter(v => v).length;
        
        const isFist = extendedCount <= 1;
        const isOpen = extendedCount >= 3;
        const pinchDist = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y, thumbTip.z - indexTip.z);
        const isPinch = pinchDist < 0.05;
        
        const palmCenter = {
            x: (landmarks[0].x + landmarks[5].x + landmarks[17].x) / 3,
            y: (landmarks[0].y + landmarks[5].y + landmarks[17].y) / 3
        };
        
        const statusDiv = document.getElementById('gestureStatus');
        
        if (isFist) {
            if (focusedPhoto) restorePhoto();
            if (currentState !== 'closed') {
                currentState = 'closed';
                currentMix = 1;
                updateTargetsForState();
                statusDiv.innerHTML = ' 握拳: 合拢为光球';
            }
        } 
        else if (isOpen) {
            if (focusedPhoto) restorePhoto();
            if (currentState !== 'spread') {
                currentState = 'spread';
                currentMix = 0;
                updateTargetsForState();
                statusDiv.innerHTML = ' 五指张开: 粒子散开';
            }
            
            if (currentState === 'spread' && lastHandX !== undefined) {
                const deltaX = palmCenter.x - lastHandX;
                const deltaY = palmCenter.y - lastHandY;
                if (Math.abs(deltaX) > 0.005 || Math.abs(deltaY) > 0.005) {
                    cameraAngleY += deltaX * 4;
                    cameraAngleX += deltaY * 3;
                    cameraAngleX = Math.max(-0.8, Math.min(0.8, cameraAngleX));
                    const radius = 6.5;
                    const camX = Math.sin(cameraAngleY) * Math.cos(cameraAngleX) * radius;
                    const camY = Math.sin(cameraAngleX) * radius + 1.2;
                    const camZ = Math.cos(cameraAngleY) * Math.cos(cameraAngleX) * radius;
                    targetCameraPos.set(camX, camY, camZ);
                }
            }
            lastHandX = palmCenter.x;
            lastHandY = palmCenter.y;
        }
        else if (isPinch && !focusedPhoto && photoGroup.length > 0) {
            const handX = (thumbTip.x - 0.5) * 8;
            const handY = (0.5 - thumbTip.y) * 6;
            const handZ = thumbTip.z * 10;
            
            let closestPhoto = null;
            let minDistance = 1.8;
            
            for (let photo of photoGroup) {
                if (!photo.parent) continue;
                const distance = Math.sqrt(
                    Math.pow(photo.position.x - handX, 2) +
                    Math.pow(photo.position.y - handY, 2) +
                    Math.pow(photo.position.z - handZ, 2)
                );
                if (distance < minDistance) {
                    minDistance = distance;
                    closestPhoto = photo;
                }
            }
            
            if (closestPhoto) {
                focusedPhoto = closestPhoto;
                focusedPhoto.userData.originalPosition = focusedPhoto.position.clone();
                focusedPhoto.userData.originalRotation = focusedPhoto.rotation.clone();
                focusedPhoto.userData.isFocused = true;
                
                particleMaterial.size = originalParticleSize * 1.3;
                coreSphere.material.emissiveIntensity = 1.3;
                if (focusedPhoto.children[0]) {
                    focusedPhoto.children[0].material.color.setHex(0xffaa66);
                }
                
                statusDiv.innerHTML = '🫳 抓取成功! 照片放大到屏幕中央';
                
                if (currentState !== 'spread') {
                    currentState = 'spread';
                    currentMix = 0;
                }
                
                // 计算屏幕中央位置（相机前方，占屏幕40%大小）
                const cameraDirection = camera.getWorldDirection(new THREE.Vector3());
                const distance = 1.8;
                const targetPos = camera.position.clone().add(cameraDirection.multiplyScalar(distance));
                
                let startTime = Date.now();
                const duration = 500;
                const startScale = focusedPhoto.scale.x;
                const targetScale = 1.8;
                const startPos = focusedPhoto.position.clone();
                
                function animatePhotoGrab() {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(1, elapsed / duration);
                    const easeOut = 1 - Math.pow(1 - progress, 3);
                    
                    if (focusedPhoto && focusedPhoto.parent) {
                        const newScale = startScale + (targetScale - startScale) * easeOut;
                        focusedPhoto.scale.set(newScale, newScale, newScale);
                        focusedPhoto.position.lerpVectors(startPos, targetPos, easeOut);
                        focusedPhoto.lookAt(camera.position);
                    }
                    
                    if (progress < 1) {
                        requestAnimationFrame(animatePhotoGrab);
                    } else {
                        statusDiv.innerHTML = ' 照片放大模式 | 握拳或张开让照片回到光球';
                    }
                }
                requestAnimationFrame(animatePhotoGrab);
            } else {
                statusDiv.innerHTML = ' 没有抓到照片，请靠近照片再抓取';
                setTimeout(() => {
                    if (!focusedPhoto) {
                        if (currentState === 'spread') statusDiv.innerHTML = ' 五指张开: 粒子散开';
                        else if (currentState === 'closed') statusDiv.innerHTML = ' 握拳: 合拢为光球';
                    }
                }, 1000);
            }
        }
        
        if (!isOpen && currentState !== 'spread') {
            targetCameraPos.set(4, 3, 7);
            cameraAngleY = Math.atan2(camera.position.z, camera.position.x);
            cameraAngleX = Math.asin(camera.position.y / 6.5);
        }
    }
    
    hands.onResults((results) => {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            processGesture(results.multiHandLandmarks[0]);
        } else {
            const statusDiv = document.getElementById('gestureStatus');
            if (statusDiv && !focusedPhoto) statusDiv.innerHTML = ' 未检测到手部';
        }
    });

    try {
        const cameraUtils = new Camera(videoElement, {
            onFrame: async () => { await hands.send({ image: videoElement }); },
            width: 640,
            height: 480
        });
        cameraUtils.start();
    } catch (e) {
        console.error('摄像头启动失败:', e);
        document.getElementById('gestureStatus').innerHTML = ' 请使用 HTTPS 或 localhost 访问';
    }

    // --- 动画循环 ---
    let lastTime = 0;
    
    function animateParticles() {
        const now = Date.now();
        lastTime = now;
        
        let targetMix = (currentState === 'closed') ? 1 : 0;
        currentMix += (targetMix - currentMix) * 0.12;
        
        const positionsAttr = particleGeometry.attributes.position.array;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const closed = closedParticleTargets[i];
            const spread = spreadParticleTargets[i];
            positionsAttr[i*3] = closed.x * currentMix + spread.x * (1 - currentMix);
            positionsAttr[i*3+1] = closed.y * currentMix + spread.y * (1 - currentMix);
            positionsAttr[i*3+2] = closed.z * currentMix + spread.z * (1 - currentMix);
        }
        particleGeometry.attributes.position.needsUpdate = true;
        
        // 粒子随机闪烁效果
        const flickerIntensity = 0.6 + Math.sin(now * 0.008) * 0.3;
        particleMaterial.size = originalParticleSize * (0.8 + Math.sin(now * 0.005) * 0.2);
        
        // 更新照片位置（随机浮动）
        photoGroup.forEach((photo, idx) => {
            if (photo && photo.parent && photo !== focusedPhoto) {
                const time = now * 0.002;
                const offsetX = Math.sin(time + idx) * 0.08;
                const offsetY = Math.cos(time * 0.7 + idx) * 0.08;
                const offsetZ = Math.sin(time * 0.5 + idx) * 0.08;
                photo.position.x = photo.userData.originalPosition.x + offsetX;
                photo.position.y = photo.userData.originalPosition.y + offsetY;
                photo.position.z = photo.userData.originalPosition.z + offsetZ;
                photo.lookAt(0, 0, 0);
            }
        });
        
        const coreScale = 0.8 + Math.sin(now * 0.004) * 0.12;
        coreSphere.scale.set(coreScale, coreScale, coreScale);
        
        sparkles.rotation.y += 0.003;
        starField.rotation.x += 0.0008;
        
        const hue = now * 0.001;
        goldFill.intensity = 0.5 + Math.sin(hue) * 0.3;
        backLight.intensity = 0.6 + Math.cos(hue * 0.7) * 0.25;
    }

    function render() {
        animateParticles();
        camera.position.lerp(targetCameraPos, 0.08);
        camera.lookAt(0, 0.3, 0);
        effectComposer.render();
        requestAnimationFrame(render);
    }

    render();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        effectComposer.setSize(window.innerWidth, window.innerHeight);
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    console.log('非遗文化·金色粒子光球系统已启动');
}