import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- 1. СЦЕНА, КАМЕРА, РЕНДЕРЕР ---
const scene = new THREE.Scene();

const skyColor = 0x76a9ff;
scene.background = new THREE.Color(skyColor);

// Збалансований туман 
scene.fog = new THREE.Fog(skyColor, 10, 36); 

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(7, 5, 9);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // М'які тіні
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0.5, 1.2, 0.5);
controls.minDistance = 2;
controls.maxDistance = 50;

// --- 2. ШЕЙДЕРНЕ ОСВІТЛЕННЯ ТА НЕБО ---
const hemiLight = new THREE.HemisphereLight(0x8bc0ff, 0x3d6628, 0.45);
scene.add(hemiLight);

const sunLight = new THREE.DirectionalLight(0xfff1d4, 1.4);
sunLight.position.set(22, 16, 14);
sunLight.castShadow = true;

sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.bias = -0.00005;
sunLight.shadow.normalBias = 0.04; 
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 45;
sunLight.shadow.camera.left = -18;
sunLight.shadow.camera.right = 18;
sunLight.shadow.camera.top = 18;
sunLight.shadow.camera.bottom = -18;
scene.add(sunLight);

// 1) СОНЦЕ 
const sunGeometry = new THREE.PlaneGeometry(6, 6);
const sunMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xfffee0, 
    side: THREE.DoubleSide,
    fog: false // Захист від туману!
});
const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
sunMesh.position.set(22, 20, 16);
sunMesh.lookAt(0, 0, 0);
scene.add(sunMesh);

// 2) ХМАРИ 
const cloudsGroup = new THREE.Group();
const cloudMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xffffff, 
    transparent: true, 
    opacity: 0.9,
    fog: false // Захист від туману!
});

const cloudPresets = [
    new THREE.BoxGeometry(8, 0.6, 5),
    new THREE.BoxGeometry(12, 0.6, 6),
    new THREE.BoxGeometry(15, 0.6, 7),
    new THREE.BoxGeometry(10, 0.6, 8)
];

for (let i = 0; i < 8; i++) {
    const geo = cloudPresets[i % cloudPresets.length];
    const cloud = new THREE.Mesh(geo, cloudMaterial);
    cloud.position.set((Math.random() - 0.5) * 50, 14 + (Math.random() * 2), (Math.random() - 0.5) * 50);
    cloudsGroup.add(cloud);
}
scene.add(cloudsGroup);

// --- 3. МАТЕРІАЛИ ТА ТЕКСТУРИ ---
const textureLoader = new THREE.TextureLoader();

function tryApplyTex(material, fileName) {
    textureLoader.load(
        fileName,
        (tex) => {
            tex.magFilter = THREE.NearestFilter;
            tex.minFilter = THREE.NearestFilter;
            material.map = tex;
            material.color.set(0xffffff);
            material.needsUpdate = true;
        },
        undefined,
        () => console.error('Не знайдено:', fileName)
    );
}

const matGrassSide = new THREE.MeshStandardMaterial({ color: 0x5b8731, roughness: 0.85 });
const matGrassTop  = new THREE.MeshStandardMaterial({ color: 0x629335, roughness: 0.85 });
const matDirt      = new THREE.MeshStandardMaterial({ color: 0x866043, roughness: 0.9 });

const grassBlockMaterials = [
    matGrassSide, matGrassSide, matGrassTop, matDirt, matGrassSide, matGrassSide
];
const dirtMaterial = matDirt;

const matLogSide = new THREE.MeshStandardMaterial({ color: 0x675231, roughness: 0.75 });
const matLogTop  = new THREE.MeshStandardMaterial({ color: 0x856841, roughness: 0.75 });
const woodBlockMaterials = [
    matLogSide, matLogSide, matLogTop, matLogTop, matLogSide, matLogSide
];

const matCraftSide = new THREE.MeshStandardMaterial({ color: 0xb37e42 });
const matCraftTop  = new THREE.MeshStandardMaterial({ color: 0xb37e42 });
const workbenchMaterials = [
    matCraftSide, matCraftSide, matCraftTop, matLogTop, matCraftSide, matCraftSide
];

const matFurnaceSide  = new THREE.MeshStandardMaterial({ color: 0x6e6e6e });
const matFurnaceFront = new THREE.MeshStandardMaterial({ color: 0x505050 });
const matFurnaceTop   = new THREE.MeshStandardMaterial({ color: 0x6e6e6e });
const furnaceMaterials = [
    matFurnaceSide, matFurnaceSide, matFurnaceTop, matFurnaceTop, matFurnaceFront, matFurnaceSide
];

const stoneMaterial   = new THREE.MeshStandardMaterial({ color: 0x737373, roughness: 0.85 });
const coalOreMaterial = new THREE.MeshStandardMaterial({ color: 0x363636, roughness: 0.85 });
const leavesMaterial  = new THREE.MeshStandardMaterial({ color: 0x386b24, roughness: 0.75 });
const pathMaterial    = new THREE.MeshStandardMaterial({ color: 0x9a8360, roughness: 0.9 });

// Накладання текстур
tryApplyTex(matGrassTop,     'texturesgrass_top.jpg');
tryApplyTex(matGrassSide,    'texturesgrass_side.jpg');
tryApplyTex(matDirt,         'texturesdirt.jpg');
tryApplyTex(matLogSide,      'textureslog_side.jpg');
tryApplyTex(matLogTop,       'textureslog_top.jpg');
tryApplyTex(matCraftSide,    'texturescrafting_side.jpg');
tryApplyTex(matCraftTop,     'texturescrafting_top.jpg');
tryApplyTex(matFurnaceSide,  'texturesfurnace_side.jpg');
tryApplyTex(matFurnaceFront, 'texturesfurnace_front.jpg');
tryApplyTex(matFurnaceTop,   'texturesfurnace_top.jpg');
tryApplyTex(stoneMaterial,   'textures_stone.jpg');
tryApplyTex(coalOreMaterial, 'texturescoal_ore.jpg');
tryApplyTex(leavesMaterial,  'texturesleaves.jpg');
tryApplyTex(pathMaterial,    'textures_stone.jpg');

const blockGeometry = new THREE.BoxGeometry(1, 1, 1);

function createBlock(geometry, material, x, y, z) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y + 0.5, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
}

// --- 4. ГАЛЯВИНА (17х17) ---
const islandSize = 8;
for (let x = -islandSize; x <= islandSize; x++) {
    for (let z = -islandSize; z <= islandSize; z++) {
        createBlock(blockGeometry, grassBlockMaterials, x, 0, z);
        createBlock(blockGeometry, dirtMaterial, x, -1, z);
    }
}

// Стежка до печери
const pathCoords = [[-1, -1], [-2, -1], [-3, -2], [-4, -2], [-5, -2]];
pathCoords.forEach(([px, pz]) => {
    createBlock(blockGeometry, pathMaterial, px, 0.05, pz);
});

// Пагорб та вхід у печеру
for (let x = -8; x <= -3; x++) {
    for (let z = -8; z <= -3; z++) {
        const isDoorway = (z === -3 && (x === -5 || x === -6));
        const isInsideCave = (x >= -7 && x <= -4 && z >= -7 && z <= -4);

        if (!isDoorway && !isInsideCave) {
            const mat = (z === -3) ? stoneMaterial : grassBlockMaterials;
            createBlock(blockGeometry, mat, x, 1, z);
        }

        if (isInsideCave || isDoorway) {
            createBlock(blockGeometry, stoneMaterial, x, 0.02, z);
        }

        const matLevel2 = (z === -3) ? stoneMaterial : grassBlockMaterials;
        createBlock(blockGeometry, matLevel2, x, 2, z);
    }
}

for (let x = -7; x <= -5; x++) {
    for (let z = -7; z <= -5; z++) {
        createBlock(blockGeometry, grassBlockMaterials, x, 3, z);
    }
}

createBlock(blockGeometry, coalOreMaterial, -7, 1, -7);
createBlock(blockGeometry, coalOreMaterial, -4, 1, -6);

// ВЕРСТАК ТА ПІЧКА
createBlock(blockGeometry, workbenchMaterials, 0, 1, 0);
createBlock(blockGeometry, furnaceMaterials, 1, 1, 0);

// ФАКЕЛ
const torchGroup = new THREE.Group();
torchGroup.add(new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.35, 0.08), new THREE.MeshStandardMaterial({ color: 0x5a3d28 })));
const flame = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshBasicMaterial({ color: 0xffaa00 }));
flame.position.y = 0.2;
torchGroup.add(flame);

const torchLight = new THREE.PointLight(0xff8020, 1.8, 8);
torchLight.position.y = 0.25;
torchLight.castShadow = true;
torchGroup.add(torchLight);

torchGroup.position.set(-4.3, 1.8, -2.4);
scene.add(torchGroup);

// Дерева
function buildMinecraftTree(x, z, height = 4) {
    for (let y = 1; y <= height; y++) createBlock(blockGeometry, woodBlockMaterials, x, y, z);
    for (let dx = -2; dx <= 2; dx++) {
        for (let dz = -2; dz <= 2; dz++) {
            if (Math.abs(dx) === 2 && Math.abs(dz) === 2) continue;
            createBlock(blockGeometry, leavesMaterial, x + dx, height - 1, z + dz);
            createBlock(blockGeometry, leavesMaterial, x + dx, height, z + dz);
        }
    }
    for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
            createBlock(blockGeometry, leavesMaterial, x + dx, height + 1, z + dz);
        }
    }
    createBlock(blockGeometry, leavesMaterial, x, height + 2, z);
    createBlock(blockGeometry, leavesMaterial, x + 1, height + 2, z);
    createBlock(blockGeometry, leavesMaterial, x - 1, height + 2, z);
    createBlock(blockGeometry, leavesMaterial, x, height + 2, z + 1);
    createBlock(blockGeometry, leavesMaterial, x, height + 2, z - 1);
}

function buildBush(x, z) {
    createBlock(blockGeometry, woodBlockMaterials, x, 1, z);
    createBlock(blockGeometry, leavesMaterial, x, 2, z);
    createBlock(blockGeometry, leavesMaterial, x + 1, 1, z);
    createBlock(blockGeometry, leavesMaterial, x - 1, 1, z);
    createBlock(blockGeometry, leavesMaterial, x, 1, z + 1);
    createBlock(blockGeometry, leavesMaterial, x, 1, z - 1);
}

buildMinecraftTree(-6, -6, 5);
buildMinecraftTree(6, -5, 4);
buildMinecraftTree(5, 5, 6);
buildMinecraftTree(-6, 4, 4);
buildMinecraftTree(0, -6, 3);
buildBush(-4, 5);

// --- 5. ПЕРСОНАЖ ІЗ СКІНОМ ---
const skinTex = textureLoader.load('skin.jpg');
skinTex.magFilter = THREE.NearestFilter;
skinTex.minFilter = THREE.NearestFilter;

const skinMaterial = new THREE.MeshStandardMaterial({
    map: skinTex,
    roughness: 0.85,
    metalness: 0.0
});

function createMinecraftBox(width, height, depth, u, v, w, h, d, texW = 64, texH = 32) {
    const geo = new THREE.BoxGeometry(width, height, depth);
    const uvAttr = geo.attributes.uv;

    const faces = [
        [u + d + w, v + d, d, h],     // +X (Ліва щока)
        [u, v + d, d, h],             // -X (Права щока)
        [u + d, v, w, d],             // +Y (Верх)
        [u + d + w, v, w, d],         // -Y (Низ)
        [u + d, v + d, w, h],         // +Z (Лице)
        [u + d + w + d, v + d, w, h]  // -Z (Потилиця)
    ];

    for (let f = 0; f < 6; f++) {
        const [fx, fy, fw, fh] = faces[f];
        const u0 = fx / texW;
        const v0 = 1 - (fy + fh) / texH;
        const u1 = (fx + fw) / texW;
        const v1 = 1 - fy / texH;

        const offset = f * 4;
        uvAttr.setXY(offset + 0, u0, v1);
        uvAttr.setXY(offset + 1, u1, v1);
        uvAttr.setXY(offset + 2, u0, v0);
        uvAttr.setXY(offset + 3, u1, v0);
    }
    uvAttr.needsUpdate = true;
    return geo;
}

const characterGroup = new THREE.Group();

const legGeo = createMinecraftBox(0.25, 0.75, 0.25, 0, 16, 4, 12, 4);
const rightLeg = new THREE.Mesh(legGeo, skinMaterial);
rightLeg.position.set(-0.13, 0.375, 0);
rightLeg.castShadow = true;
characterGroup.add(rightLeg);

const leftLeg = new THREE.Mesh(legGeo, skinMaterial);
leftLeg.position.set(0.13, 0.375, 0);
leftLeg.castShadow = true;
characterGroup.add(leftLeg);

const bodyGeo = createMinecraftBox(0.5, 0.75, 0.25, 16, 16, 8, 12, 4);
const body = new THREE.Mesh(bodyGeo, skinMaterial);
body.position.set(0, 0.75 + 0.375, 0);
body.castShadow = true;
characterGroup.add(body);

const armGeo = createMinecraftBox(0.25, 0.75, 0.25, 40, 16, 4, 12, 4);
const rightArm = new THREE.Mesh(armGeo, skinMaterial);
rightArm.position.set(-0.38, 0.75 + 0.375, 0);
rightArm.castShadow = true;
characterGroup.add(rightArm);

const leftArm = new THREE.Mesh(armGeo, skinMaterial);
leftArm.position.set(0.38, 0.75 + 0.375, 0);
leftArm.castShadow = true;
characterGroup.add(leftArm);

const headGeo = createMinecraftBox(0.5, 0.5, 0.5, 32, 0, 8, 8, 8);
const headMesh = new THREE.Mesh(headGeo, skinMaterial);
headMesh.position.set(0, 0.25, 0);
headMesh.castShadow = true;

const headGroup = new THREE.Group();
headGroup.position.set(0, 1.5, 0);
headGroup.add(headMesh);
characterGroup.add(headGroup);

characterGroup.position.set(0.5, 1.0, 1.3);
characterGroup.rotation.y = Math.PI;
scene.add(characterGroup);

// --- 6. АДАПТИВНІСТЬ ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- 7. ЦИКЛ АНІМАЦІЇ ---
function animate(time = 0) {
    requestAnimationFrame(animate);

    controls.update();

    cloudsGroup.children.forEach((cloud) => {
        cloud.position.x += 0.015;
        if (cloud.position.x > 30) cloud.position.x = -30;
    });

    const t = time * 0.002;
    headGroup.rotation.y = Math.sin(t) * 0.55;
    rightArm.rotation.x = Math.sin(t) * 0.15;
    leftArm.rotation.x = -Math.sin(t) * 0.15;

    torchLight.intensity = 1.6 + Math.sin(time * 0.012) * 0.3 + Math.cos(time * 0.02) * 0.15;

    renderer.render(scene, camera);
}

animate();