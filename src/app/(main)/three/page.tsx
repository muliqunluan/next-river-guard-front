'use client';

import { useRef, useEffect } from 'react';
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  CubeTextureLoader,
  AmbientLight,
  DirectionalLight,
  MeshStandardMaterial,
  MeshPhysicalMaterial,
  BufferGeometry,
  Mesh,
} from 'three';

const ThreePage = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 初始化场景、相机、渲染器
    const scene = new Scene();
    const camera = new PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      500,
    );

    // 水面网格引用（用于动画更新）
    let waterMesh: Mesh | null = null;
    let waterGeometry: BufferGeometry | null = null;

    // 加载天空盒
    const cubeTextureLoader = new CubeTextureLoader();
    const texture = cubeTextureLoader.load([
      '/sky-block/right.png',
      '/sky-block/left.png',
      '/sky-block/top.png',
      '/sky-block/bottom.png',
      '/sky-block/front.png',
      '/sky-block/back.png',
    ]);
    scene.background = texture;

    // 光照
    const ambientLight = new AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const dirLight = new DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(30, 50, 30);
    scene.add(dirLight);

    const fillLight = new DirectionalLight(0x88aaff, 0.4);
    fillLight.position.set(-30, 20, -30);
    scene.add(fillLight);

    // 动态导入 OBJLoader 并加载地形
    async function loadTerrain() {
      const { OBJLoader } = await import('three/examples/jsm/loaders/OBJLoader.js');
      const { Mesh, EdgesGeometry, LineSegments, LineBasicMaterial } = await import('three');
      const loader = new OBJLoader();
      loader.load('/models/terrain.obj', (object) => {
        object.traverse((child) => {
          if (child instanceof Mesh) {
            // 实体面 — 灰色
            child.material = new MeshStandardMaterial({
              color: 0xffffff,
              roughness: 0.8,
              metalness: 0.1,
              flatShading: true,
              side: 2,
            });
            child.geometry.computeVertexNormals();

            // 线框边缘 — 黑色，叠加在实体面上
            const edges = new EdgesGeometry(child.geometry);
            const wireframe = new LineSegments(edges, new LineBasicMaterial({ color: 0x000000 }));
            child.add(wireframe);
          }
        });
        scene.add(object);
      });
    }
    loadTerrain();

    // 加载水面
    async function loadWater() {
      const { OBJLoader } = await import('three/examples/jsm/loaders/OBJLoader.js');
      const { Mesh, MeshPhysicalMaterial, BufferGeometry } = await import('three');
      const loader = new OBJLoader();
      loader.load('/models/water.obj', (object) => {
        object.traverse((child) => {
          if (child instanceof Mesh) {
            waterMesh = child;
            waterGeometry = child.geometry as BufferGeometry;

            // 水面材质 — 半透明蓝色，后续可替换为动画纹理
            child.material = new MeshPhysicalMaterial({
              color: 0x2a7a9e,
              transparent: true,
              opacity: 0.7,
              roughness: 0.5,
              metalness: 0.3,
              side: 2,
              envMapIntensity: 0.6,
            });

            child.renderOrder = 1; // 水面渲染在地形之上
          }
        });
        scene.add(object);
      });
    }
    loadWater();

    // 相机视角 — 地形范围 -50~50，从斜上方俯瞰
    camera.position.set(40, 35, 65);
    camera.lookAt(0, 0, 0);

    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 动画循环
    let animationId: number;
    const animate = (time: number) => {
      animationId = requestAnimationFrame(animate);

      // ──────────────────────────────────────
      // 水面动画入口
      // 你可以在此处编写水面动画逻辑，例如：
      //
      // 方案 A — 顶点波浪（位移顶点 Y 值）:
        if (waterGeometry) {
          const pos = waterGeometry.attributes.position;
          for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i), z = pos.getZ(i);
            pos.setY(i, 1.1205 + Math.sin(x * 0.1 + time * 0.001) * 0.15);
          }
          pos.needsUpdate = true;
          waterGeometry.computeVertexNormals();
        }
      //
      // 方案 B — UV 滚动（配合流动纹理贴图）:
      // if (waterMesh) {
      //   const mat = waterMesh.material as MeshPhysicalMaterial;
      //   mat.map?.offset?.set(time * 0.0001, time * 0.00005);
      // }
      //
      // 方案 C — 法线贴图滚动（配合法线贴图模拟波纹）:
      // if (waterMesh) {
      //   const mat = waterMesh.material as MeshPhysicalMaterial;
      //   mat.normalMap?.offset?.set(time * 0.0002, 0);
      // }
      // ──────────────────────────────────────

      renderer.render(scene, camera);
    };
    animate(0);

    // 响应窗口/容器尺寸变化
    const handleResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className='h-full flex flex-col'>
      <div ref={containerRef} className='flex-1 min-h-0 border-2 overflow-hidden' />
    </div>
  );
};

export default ThreePage;
