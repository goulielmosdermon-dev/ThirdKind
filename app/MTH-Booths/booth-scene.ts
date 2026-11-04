import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export type BoothSceneControls = {
  setWalking: (enabled: boolean) => void;
  move: (direction: string, pressed: boolean) => void;
  reset: () => void;
  dispose: () => void;
};

export async function createBoothScene(
  host: HTMLDivElement,
  onProgress: (value: number) => void,
): Promise<BoothSceneControls> {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.85;
  const canvas = renderer.domElement;
  canvas.tabIndex = 0;
  canvas.setAttribute(
    'aria-label',
    'Interactive Mind The Hack booth. Drag to rotate, scroll to zoom. Select Walk to explore with arrow keys.',
  );
  host.prepend(canvas);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#141817');
  const camera = new THREE.PerspectiveCamera(45, 1, 0.05, 200);
  const orbit = new OrbitControls(camera, canvas);
  orbit.enableDamping = true;
  orbit.maxPolarAngle = Math.PI / 2 - 0.015;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.25;
  room.dispose();
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xe3fff4, 0x252b27, 0.35));
  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(3, 7, 6);
  scene.add(key);

  let model: THREE.Group;
  try {
    const gltf = await new GLTFLoader().loadAsync(
      '/MTH-Booths/booth.glb',
      (e) => onProgress(e.total ? Math.round((e.loaded / e.total) * 100) : 0),
    );
    model = gltf.scene;
  } catch (error) {
    orbit.dispose();
    environment.dispose();
    renderer.dispose();
    canvas.remove();
    throw error;
  }
  const boothGreen = new THREE.MeshStandardMaterial({
    color: '#029A7C',
    roughness: 0.85,
    metalness: 0,
  });
  const boothDark = new THREE.MeshStandardMaterial({
    color: '#0A1D1A',
    roughness: 0.85,
    metalness: 0,
  });
  const correctedMaps = new Map<THREE.Texture, THREE.Texture>();
  const matchDeskGraphic = (map: THREE.Texture) => {
    const existing = correctedMaps.get(map);
    if (existing) return existing;
    const image = map.image as ImageBitmap;
    const surface = document.createElement('canvas');
    surface.width = image.width;
    surface.height = image.height;
    const context = surface.getContext('2d')!;
    context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 0, surface.width, surface.height);
    for (let i = 0; i < pixels.data.length; i += 4) {
      // Swap the source artwork's mint and dark inks to match the supplied renders.
      const mint = THREE.MathUtils.clamp(
        ((pixels.data[i + 1] ?? 0) - (pixels.data[i] ?? 0)) / 190,
        0,
        1,
      );
      pixels.data[i] = Math.round(2 + (10 - 2) * mint);
      pixels.data[i + 1] = Math.round(154 + (29 - 154) * mint);
      pixels.data[i + 2] = Math.round(124 + (26 - 124) * mint);
    }
    context.putImageData(pixels, 0, 0);
    const texture = map.clone();
    texture.image = surface;
    texture.needsUpdate = true;
    correctedMaps.set(map, texture);
    map.dispose();
    return texture;
  };
  // Keep the export's textures, UVs, roughness, normals and branded surfaces.
  // Retain the requested column colors and glass base as local refinements.
  model.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const originals = Array.isArray(object.material)
      ? object.material
      : [object.material];
    for (const material of originals) {
      if (!(material instanceof THREE.MeshStandardMaterial)) continue;
      if (
        ['Logo_Surface', 'Material.005'].includes(material.name) &&
        material.map
      ) {
        if (!material.userData.deskInkMatched) {
          material.map = matchDeskGraphic(material.map);
          material.color.set('#ffffff');
          material.metalness = 0;
          material.roughness = 0.85;
          material.metalnessMap = null;
          material.roughnessMap = null;
          material.userData.deskInkMatched = true;
        }
      }
      if (material.name === 'Plaster Wall Material')
        material.color.set('#171e1c');
    }
    let node: THREE.Object3D | null = object;
    let name = '';
    while (node && node !== model) {
      name = node.userData.name || node.name;
      if (
        [
          'Plane',
          'Plane.005',
          'Plane.009',
          'Plane.010',
          'Cube',
          'Cube.005',
        ].includes(name)
      )
        break;
      node = node.parent;
    }
    if (name === 'Cube' || name === 'Cube.005') {
      object.material = boothDark;
    } else if (name === 'Plane') {
      const carpetMaterials = Array.isArray(object.material)
        ? object.material
        : [object.material];
      for (const material of carpetMaterials) {
        if (
          !(material instanceof THREE.MeshStandardMaterial) ||
          material.userData.carpetScaled
        )
          continue;
        for (const texture of new Set([
          material.map,
          material.normalMap,
          material.roughnessMap,
          material.metalnessMap,
          material.aoMap,
        ])) {
          if (texture) {
            texture.repeat.multiplyScalar(0.5);
            texture.updateMatrix();
          }
        }
        material.color.set('#454545');
        material.userData.carpetScaled = true;
      }
    } else if (name === 'Plane.009') {
      object.material = new THREE.MeshPhysicalMaterial({
        color: '#d8fff5',
        roughness: 0.08,
        metalness: 0,
        transmission: 1,
        thickness: 0.3,
        ior: 1.45,
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
      });
    } else if (name === 'Plane.005' || name === 'Plane.010') {
      object.material = name === 'Plane.005' ? boothGreen : boothDark;
    }
  });
  scene.add(model);
  model.updateMatrixWorld(true);
  const video = document.createElement('video');
  video.src = '/MTH-Booths/logo.mp4';
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  const videoTexture = new THREE.VideoTexture(video);
  videoTexture.colorSpace = THREE.SRGBColorSpace;
  const videoMaterial = new THREE.MeshBasicMaterial({
    map: videoTexture,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
  // The export's blank screen spans the opening inside the L-shaped frame.
  const screen = model.getObjectByProperty('name', 'Plane004');
  const screenNode =
    screen ??
    [...model.children].find((object) => object.userData.name === 'Plane.004');
  const screenBounds = screenNode
    ? new THREE.Box3().setFromObject(screenNode)
    : new THREE.Box3(
        new THREE.Vector3(-2.985, 0, -1.253),
        new THREE.Vector3(0.015, 2.5, -1.253),
      );
  // Center on the visible opening, excluding the L frame's top beam and right post.
  const frameNode = model.children.find(
    (object) => object.userData.name === 'Plane.010',
  );
  if (frameNode) {
    const frame = new THREE.Box3().setFromObject(frameNode);
    screenBounds.min.x = frame.min.x;
    screenBounds.max.x = frame.max.x - 0.6;
    screenBounds.min.y = frame.min.y;
    screenBounds.max.y = frame.max.y - 0.6;
  }
  const screenSize = screenBounds.getSize(new THREE.Vector3());
  const fitVideo = () => {
    if (!video.videoWidth || !video.videoHeight) return;
    const videoAspect = video.videoWidth / video.videoHeight;
    const panelAspect = screenSize.x / screenSize.y;
    // Centered cover mapping with a 1.7× zoom for larger wall artwork.
    const repeatX = Math.min(1, panelAspect / videoAspect) / 1.7;
    const repeatY = Math.min(1, videoAspect / panelAspect) / 1.7;
    videoTexture.repeat.set(repeatX, repeatY);
    // Compensate for the artwork's position inside the source video.
    videoTexture.offset.set(
      (1 - repeatX) / 2 - repeatX * 0.05,
      (1 - repeatY) / 2,
    );
    videoTexture.updateMatrix();
  };
  video.addEventListener('loadedmetadata', fitVideo);
  fitVideo();
  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(screenSize.x, screenSize.y),
    videoMaterial,
  );
  panel.position.copy(screenBounds.getCenter(new THREE.Vector3()));
  panel.position.z += 0.015;
  if (screenNode) screenNode.visible = false;
  model.add(panel);
  void video.play().catch(() => {
    /* Playback is retried on interaction below. */
  });
  const resumeVideo = () => {
    if (video.paused) void video.play().catch(() => {});
  };
  canvas.addEventListener('pointerdown', resumeVideo);

  const bounds = new THREE.Box3();
  const meshes: THREE.Mesh[] = [];
  model.updateMatrixWorld(true);
  model.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      meshes.push(object);
      const box = new THREE.Box3().setFromObject(object);
      const size = box.getSize(new THREE.Vector3());
      // The exported studio floor is much larger than the actual booth.
      if (Math.max(size.x, size.y, size.z) < 20) bounds.union(box);
    }
  });
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const floor = bounds.min.y;
  const distance = Math.max(size.x, size.z, size.y) * 1.65;
  orbit.minDistance = 1;
  orbit.maxDistance = distance * 2;
  const reset = () => {
    walking = false;
    keys.clear();
    orbit.enabled = true;
    orbit.target.set(center.x, floor + size.y * 0.45, center.z);
    camera.position.set(
      center.x + distance * 0.35,
      floor + distance * 0.42,
      center.z + distance,
    );
    camera.lookAt(orbit.target);
    orbit.update();
  };
  let walking = false;
  const keys = new Set<string>();
  const walkLook = new THREE.Euler(0, 0, 0, 'YXZ');
  const walkDirection = new THREE.Vector3();
  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();
  const ray = new THREE.Raycaster();
  const origin = new THREE.Vector3();
  reset();
  const setWalking = (enabled: boolean) => {
    keys.clear();
    walking = enabled;
    orbit.enabled = !enabled;
    if (enabled) {
      camera.position.set(center.x, floor + 1.65, bounds.max.z + 1.5);
      camera.lookAt(center.x, floor + 1.45, center.z);
      walkLook.setFromQuaternion(camera.quaternion);
    } else {
      camera.getWorldDirection(forward);
      orbit.target.copy(camera.position).addScaledVector(forward, 2);
      orbit.update();
    }
    canvas.focus({ preventScroll: true });
  };
  const movementKeys: Record<string, string> = {
    KeyW: 'forward',
    ArrowUp: 'forward',
    KeyS: 'back',
    ArrowDown: 'back',
    KeyA: 'left',
    ArrowLeft: 'left',
    KeyD: 'right',
    ArrowRight: 'right',
  };
  const down = (e: KeyboardEvent) => {
    if (walking && movementKeys[e.code]) {
      e.preventDefault();
      keys.add(movementKeys[e.code]!);
    }
  };
  const up = (e: KeyboardEvent) => {
    if (movementKeys[e.code]) keys.delete(movementKeys[e.code]!);
  };
  const blur = () => keys.clear();
  let dragging = false;
  let lastX = 0,
    lastY = 0;
  const pointerDown = (e: PointerEvent) => {
    if (!walking) return;
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  };
  const pointerMove = (e: PointerEvent) => {
    if (!walking || !dragging) return;
    walkLook.y -= (e.clientX - lastX) * 0.004;
    walkLook.x = THREE.MathUtils.clamp(
      walkLook.x - (e.clientY - lastY) * 0.004,
      -1.2,
      1.2,
    );
    camera.quaternion.setFromEuler(walkLook);
    lastX = e.clientX;
    lastY = e.clientY;
  };
  const pointerUp = () => {
    dragging = false;
  };
  canvas.addEventListener('keydown', down);
  canvas.addEventListener('keyup', up);
  canvas.addEventListener('blur', blur);
  window.addEventListener('blur', blur);
  canvas.addEventListener('pointerdown', pointerDown);
  canvas.addEventListener('pointermove', pointerMove);
  canvas.addEventListener('pointerup', pointerUp);
  canvas.addEventListener('pointercancel', pointerUp);
  const resize = new ResizeObserver(() => {
    const { width, height } = host.getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  });
  resize.observe(host);
  let visible = true;
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false;
    if (!visible) keys.clear();
  });
  observer.observe(host);
  let lastTime = performance.now();
  renderer.setAnimationLoop((time) => {
    const dt = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;
    if (!visible || document.hidden) return;
    if (walking && keys.size) {
      camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();
      right.crossVectors(forward, camera.up).normalize();
      walkDirection.set(0, 0, 0);
      if (keys.has('forward')) walkDirection.add(forward);
      if (keys.has('back')) walkDirection.sub(forward);
      if (keys.has('left')) walkDirection.sub(right);
      if (keys.has('right')) walkDirection.add(right);
      if (walkDirection.lengthSq()) {
        walkDirection.normalize();
        origin.copy(camera.position);
        origin.y -= 0.6;
        ray.set(origin, walkDirection);
        ray.far = 0.35 + dt * 1.8;
        if (!ray.intersectObjects(meshes, false).length)
          camera.position.addScaledVector(walkDirection, dt * 1.8);
        camera.position.x = THREE.MathUtils.clamp(
          camera.position.x,
          bounds.min.x - 3,
          bounds.max.x + 3,
        );
        camera.position.z = THREE.MathUtils.clamp(
          camera.position.z,
          bounds.min.z - 3,
          bounds.max.z + 4,
        );
      }
    }
    if (!walking) orbit.update();
    renderer.render(scene, camera);
  });
  onProgress(100);
  return {
    setWalking,
    reset,
    move: (direction, pressed) => {
      if (pressed) keys.add(direction);
      else keys.delete(direction);
    },
    dispose: () => {
      renderer.setAnimationLoop(null);
      canvas.removeEventListener('pointerdown', resumeVideo);
      video.removeEventListener('loadedmetadata', fitVideo);
      video.pause();
      video.removeAttribute('src');
      video.load();
      resize.disconnect();
      observer.disconnect();
      orbit.dispose();
      canvas.removeEventListener('keydown', down);
      canvas.removeEventListener('keyup', up);
      canvas.removeEventListener('blur', blur);
      window.removeEventListener('blur', blur);
      canvas.removeEventListener('pointerdown', pointerDown);
      canvas.removeEventListener('pointermove', pointerMove);
      canvas.removeEventListener('pointerup', pointerUp);
      canvas.removeEventListener('pointercancel', pointerUp);
      const textures = new Set<THREE.Texture>();
      const materials = new Set<THREE.Material>();
      for (const mesh of meshes) {
        mesh.geometry.dispose();
        for (const material of Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material])
          materials.add(material);
      }
      for (const material of materials) {
        for (const value of Object.values(material))
          if (value instanceof THREE.Texture) textures.add(value);
        material.dispose();
      }
      textures.forEach((texture) => texture.dispose());
      environment.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
