import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'
import { MODEL_BASE, MODEL_FILES, fileKeyForSystem, matchOrgan, systemForMesh } from '../three/anatomyMap.js'

const FILE_KEYS = ['skeletal', 'visceral', 'circulatory', 'nervous', 'muscular', 'joints', 'lymphatic']

function makeLoader() {
  const draco = new DRACOLoader()
  draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')
  const loader = new GLTFLoader()
  loader.setDRACOLoader(draco)
  return { loader, draco }
}

function sourceMaterial(material) {
  return Array.isArray(material) ? material[0] : material
}

const BodyViewer = forwardRef(function BodyViewer({
  className = '',
  systems,
  selectedOrganId = null,
  onSelect,
  autoRotate = false,
  animation = null,
  onAnimationEvent,
  view,
  onViewChange,
  showChrome = true,
  frameSelection = true,
  viewsFrameBody = false,
  children,
}, ref) {
  const mountRef = useRef(null)
  const apiRef = useRef(null)
  const propsRef = useRef({})
  const [status, setStatus] = useState('loading')
  const [progress, setProgress] = useState('Preparing anatomical models…')
  const [errors, setErrors] = useState([])
  const [hoverName, setHoverName] = useState('')
  const [internalView, setInternalView] = useState(view || 'front')
  const activeView = view || internalView

  useImperativeHandle(ref, () => ({
    zoom: (factor) => apiRef.current?.zoom(factor),
    reset: () => apiRef.current?.reset(),
    goTo: (name) => apiRef.current?.goTo(name),
  }))

  propsRef.current = {
    systems,
    selectedOrganId,
    autoRotate,
    animation,
    onSelect,
    onAnimationEvent,
  }

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined
    let disposed = false
    const mobile = window.matchMedia('(max-width: 768px)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#07101c')
    scene.fog = new THREE.Fog('#07101c', 8, 18)

    const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 50)
    camera.position.set(0.15, 1.05, 3.4)

    const renderer = new THREE.WebGLRenderer({ antialias: !mobile, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.6))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    renderer.domElement.style.display = 'block'
    renderer.domElement.style.touchAction = 'none'
    mount.appendChild(renderer.domElement)

    const labelRenderer = new CSS2DRenderer()
    labelRenderer.domElement.style.position = 'absolute'
    labelRenderer.domElement.style.inset = '0'
    labelRenderer.domElement.style.pointerEvents = 'none'
    mount.appendChild(labelRenderer.domElement)
    const labelEl = document.createElement('div')
    labelEl.className = 'organ-label'
    const label = new CSS2DObject(labelEl)
    label.visible = false
    scene.add(label)

    scene.add(new THREE.AmbientLight(0xffffff, 0.72))
    scene.add(new THREE.HemisphereLight(0xdbeafe, 0x1e1b4b, 0.55))
    const key = new THREE.DirectionalLight(0xffffff, 1.45)
    key.position.set(2.4, 4.2, 3.2)
    scene.add(key)
    const fill = new THREE.DirectionalLight(0xc4b5fd, 0.45)
    fill.position.set(-3, 2, -2)
    scene.add(fill)
    const rim = new THREE.DirectionalLight(0x67e8f9, 0.55)
    rim.position.set(-2, 3, -4)
    scene.add(rim)

    const grid = new THREE.GridHelper(6, 16, 0x155e75, 0x102033)
    const gridMaterials = Array.isArray(grid.material) ? grid.material : [grid.material]
    gridMaterials.forEach((material) => {
      material.transparent = true
      material.opacity = 0.4
    })
    scene.add(grid)

    const root = new THREE.Group()
    scene.add(root)
    const groups = {}
    const pickables = []
    const loadedFiles = new Set()
    const loadingFiles = new Set()
    const { loader, draco } = makeLoader()

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.target.set(0, 0.95, 0)
    controls.minDistance = 0.08
    controls.maxDistance = 14
    controls.maxPolarAngle = Math.PI * 0.98

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    const goal = new THREE.Vector3()
    const goalTarget = new THREE.Vector3(0, 0.95, 0)
    let lerping = false
    let framed = false
    let acc = 0
    let lastToken = null
    let hoverMesh = null
    let appliedKey = ''
    const clockStart = performance.now()
    let lastTime = clockStart
    let frame = 0

    const flowPoints = []
    const digestionPoints = []
    const particleGeo = new THREE.SphereGeometry(0.008, 8, 8)
    const bloodGroup = new THREE.Group()
    bloodGroup.visible = false
    const bloodParticles = []
    for (let index = 0; index < 16; index += 1) {
      const material = new THREE.MeshBasicMaterial({ color: '#fb7185' })
      const particle = new THREE.Mesh(particleGeo, material)
      bloodGroup.add(particle)
      bloodParticles.push(particle)
    }
    scene.add(bloodGroup)
    const bolus = new THREE.Mesh(
      new THREE.SphereGeometry(0.014, 12, 10),
      new THREE.MeshBasicMaterial({ color: '#fde68a' }),
    )
    bolus.visible = false
    scene.add(bolus)
    let bloodCurve = null

    let lastFrame = null
    let userAdjusted = false

    function resize() {
      const width = mount.clientWidth
      const height = mount.clientHeight
      if (!width || !height) return
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
      labelRenderer.setSize(width, height)
      if (!userAdjusted && lastFrame?.kind === 'body') frameBody(lastFrame.view)
      if (!userAdjusted && lastFrame?.kind === 'organ') frameOrgan(lastFrame.organId, lastFrame.view)
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(mount)

    function groupFor(systemId) {
      if (!groups[systemId]) {
        groups[systemId] = new THREE.Group()
        groups[systemId].name = systemId
        root.add(groups[systemId])
      }
      return groups[systemId]
    }

    function visibleMeshes() {
      return pickables.filter((mesh) => mesh.visible && mesh.parent?.visible !== false)
    }

    function boxOf(list) {
      const box = new THREE.Box3()
      list.forEach((mesh) => box.expandByObject(mesh))
      return box
    }

    function frameBox(box, direction) {
      if (box.isEmpty()) return
      const center = box.getCenter(new THREE.Vector3())
      const half = box.getSize(new THREE.Vector3()).multiplyScalar(0.5)
      const dir = direction.clone().normalize()
      const right = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0))
      if (right.lengthSq() < 1e-6) right.set(1, 0, 0)
      right.normalize()
      const up = new THREE.Vector3().crossVectors(right, dir).normalize()
      const span = (axis) => Math.abs(axis.x) * half.x + Math.abs(axis.y) * half.y + Math.abs(axis.z) * half.z
      const vFov = THREE.MathUtils.degToRad(camera.fov)
      const hFov = 2 * Math.atan(Math.tan(vFov / 2) * Math.max(camera.aspect, 0.25))
      const distance = Math.max(span(up) / Math.tan(vFov / 2), span(right) / Math.tan(hFov / 2), 0.35) * 1.42
      goalTarget.copy(center)
      goal.copy(center).addScaledVector(dir, distance)
      controls.maxDistance = Math.max(14, distance * 2.5)
      userAdjusted = false
      lerping = true
    }

    function viewDirection(name) {
      if (name === 'back') return new THREE.Vector3(0, 0.15, -1)
      if (name === 'left') return new THREE.Vector3(1, 0.12, 0)
      if (name === 'right') return new THREE.Vector3(-1, 0.12, 0)
      return new THREE.Vector3(0, 0.12, 1)
    }

    function frameBody(name = 'front') {
      const box = new THREE.Box3().setFromObject(root)
      if (box.isEmpty()) return
      lastFrame = { kind: 'body', view: name }
      frameBox(box, viewDirection(name).normalize())
    }

    function frameOrgan(organId, viewName) {
      const meshes = pickables.filter((mesh) => mesh.userData.organId === organId && mesh.parent?.visible !== false)
      if (!meshes.length) return false
      lastFrame = { kind: 'organ', organId, view: viewName }
      frameBox(boxOf(meshes), viewDirection(viewName).normalize())
      return true
    }

    function paint(mesh, mode) {
      if (!mesh.userData.baseMaterial) mesh.userData.baseMaterial = mesh.material
      if (mode === 'base') {
        mesh.material = mesh.userData.baseMaterial
        return
      }
      const keyName = mode === 'selected' ? 'selectMaterial' : 'hoverMaterial'
      if (!mesh.userData[keyName]) {
        const material = sourceMaterial(mesh.userData.baseMaterial).clone()
        material.emissive = new THREE.Color(mode === 'selected' ? '#67e8f9' : '#a5f3fc')
        material.emissiveMap = null
        material.emissiveIntensity = mode === 'selected' ? 0.7 : 0.35
        mesh.userData[keyName] = material
      }
      mesh.material = mesh.userData[keyName]
    }

    function applyHighlight() {
      const organId = propsRef.current.selectedOrganId
      const keyName = `${organId || ''}|${hoverMesh?.uuid || ''}`
      if (keyName === appliedKey) return
      appliedKey = keyName
      for (const mesh of pickables) {
        const selected = organId && mesh.userData.organId === organId
        const hovered = mesh === hoverMesh && !selected
        paint(mesh, selected ? 'selected' : hovered ? 'hover' : 'base')
      }
    }

    function placeLabel() {
      const organId = propsRef.current.selectedOrganId
      const mesh = hoverMesh || pickables.find((item) => item.userData.organId === organId && item.parent?.visible !== false)
      if (!mesh) {
        label.visible = false
        return
      }
      label.visible = true
      labelEl.textContent = mesh.userData.label || mesh.name
      const box = new THREE.Box3().setFromObject(mesh)
      box.getCenter(label.position)
    }

    function ensurePaths() {
      if (bloodCurve || !pickables.length) return
      const named = (pattern) => pickables.filter((mesh) => pattern.test(mesh.name))
      const center = (list) => (list.length ? boxOf(list).getCenter(new THREE.Vector3()) : null)
      const stops = [
        center(named(/superior vena cava/i)),
        center(named(/^right atrium$/i)),
        center(named(/^right ventricle$/i)),
        center(named(/pulmonary trunk/i)),
        center(named(/left lung|of left lung/i)),
        center(named(/^left atrium$/i)),
        center(named(/^left ventricle$/i)),
        center(named(/ascending aorta|thoracic aorta/i)),
      ].filter(Boolean)
      if (stops.length >= 4) {
        stops.forEach((point) => flowPoints.push(point))
        bloodCurve = new THREE.CatmullRomCurve3(stops)
      }
      const digestion = [
        center(named(/^oesophagus$/i)),
        center(named(/^stomach$/i)),
        center(named(/^duodenum$/i)),
        center(named(/^jejunum$/i)),
        center(named(/transverse colon|ascending colon/i)),
      ].filter(Boolean)
      digestion.forEach((point) => digestionPoints.push(point))
    }

    function restoreMaterials() {
      for (const mesh of pickables) {
        const target = mesh.userData.pivot || mesh
        if (target.userData.baseScale) target.scale.copy(target.userData.baseScale)
      }
      appliedKey = ''
      applyHighlight()
    }

    function stepAnimation(delta) {
      const current = propsRef.current.animation
      bloodGroup.visible = Boolean(current?.id === 'circulation' && bloodCurve)
      bolus.visible = Boolean(current?.id === 'digestion' && digestionPoints.length > 1)
      if (!current) return
      if (current.token !== lastToken) {
        acc = 0
        lastToken = current.token
        restoreMaterials()
      }
      if (current.playing) acc += delta
      ensurePaths()
      let event = null
      if (current.id === 'heartbeat') {
        const beat = (acc % 0.95) / 0.95
        let squeeze = 0
        if (beat < 0.18) squeeze = beat / 0.18
        else if (beat < 0.42) squeeze = 1 - (beat - 0.18) / 0.24
        for (const mesh of pickables) {
          if (mesh.userData.organId !== 'heart') continue
          if (!mesh.userData.pulseMaterial) {
            const material = sourceMaterial(mesh.userData.baseMaterial || mesh.material).clone()
            material.emissive = new THREE.Color('#fb7185')
            material.emissiveMap = null
            mesh.userData.pulseMaterial = material
          }
          mesh.material = mesh.userData.pulseMaterial
          mesh.userData.pulseMaterial.emissiveIntensity = 0.15 + squeeze * 0.9
        }
        event = {
          label: squeeze > 0.45 ? 'Systole — ventricular muscle is contracting' : 'Diastole — the chambers are filling',
          organId: 'heart',
        }
      } else if (current.id === 'breathing') {
        const cycle = (acc % 4) / 4
        let inhale = cycle < 0.42 ? cycle / 0.42 : cycle < 0.55 ? 1 : 1 - (cycle - 0.55) / 0.45
        for (const mesh of pickables) {
          if (mesh.userData.organId !== 'lung-left' && mesh.userData.organId !== 'lung-right') continue
          const target = mesh.userData.pivot || mesh
          if (!target.userData.baseScale) target.userData.baseScale = target.scale.clone()
          target.scale.copy(target.userData.baseScale).multiplyScalar(1 + inhale * 0.045)
        }
        event = {
          label: inhale > 0.65 ? 'Inhalation — lung volume increases' : 'Exhalation — the lungs recoil',
          organId: 'lung-right',
        }
      } else if (current.id === 'circulation' && bloodCurve) {
        for (let index = 0; index < bloodParticles.length; index += 1) {
          const progress = (index / bloodParticles.length + acc * 0.08) % 1
          bloodCurve.getPoint(progress, bloodParticles[index].position)
          bloodParticles[index].material.color.set(progress < 0.45 ? '#60a5fa' : '#fb7185')
        }
        event = { label: 'Blood is moving through the heart, lungs, and aorta', organId: 'heart' }
      } else if (current.id === 'digestion' && digestionPoints.length > 1) {
        const names = ['Oesophagus', 'Stomach', 'Duodenum', 'Jejunum', 'Colon']
        const progress = ((acc % 12) / 12) * (digestionPoints.length - 1)
        const index = Math.min(digestionPoints.length - 2, Math.floor(progress))
        bolus.position.lerpVectors(digestionPoints[index], digestionPoints[index + 1], progress - index)
        event = { label: names[Math.min(names.length - 1, index)] || 'Digestive tract', organId: 'stomach' }
      }
      if (event && acc - (apiRef.current?.lastEmit || 0) > 0.25) {
        apiRef.current.lastEmit = acc
        propsRef.current.onAnimationEvent?.(event)
      }
    }

    function applyVisibility() {
      const active = new Set(propsRef.current.systems || [])
      for (const [id, group] of Object.entries(groups)) group.visible = active.has(id)
    }

    function animate(now) {
      frame = requestAnimationFrame(animate)
      const delta = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now
      applyVisibility()
      if (!propsRef.current.animation) {
        if (appliedKey.includes('pulse')) appliedKey = ''
      }
      if (propsRef.current.animation) stepAnimation(delta)
      else {
        if (apiRef.current?.wasAnimating) {
          restoreMaterials()
          apiRef.current.wasAnimating = false
        }
        applyHighlight()
      }
      if (propsRef.current.animation) apiRef.current.wasAnimating = true
      placeLabel()
      controls.autoRotate = Boolean(propsRef.current.autoRotate) && !lerping && !reduced
      if (lerping) {
        camera.position.lerp(goal, 0.12)
        controls.target.lerp(goalTarget, 0.12)
        if (camera.position.distanceTo(goal) < 0.01) lerping = false
      }
      controls.update()
      renderer.render(scene, camera)
      labelRenderer.render(scene, camera)
    }

    function adopt(gltf, fileKey) {
      const found = []
      gltf.scene.traverse((object) => {
        if (object.isMesh) found.push(object)
      })
      for (const mesh of found) {
        const system = systemForMesh(fileKey, mesh.name || '')
        mesh.userData.system = system
        mesh.userData.organId = matchOrgan(mesh.name || '', system)
        mesh.userData.label = (mesh.name || 'Structure').replaceAll('_', ' ')
        groupFor(system).attach(mesh)
        if (mesh.userData.organId === 'lung-left' || mesh.userData.organId === 'lung-right') {
          const center = new THREE.Box3().setFromObject(mesh).getCenter(new THREE.Vector3())
          const pivot = new THREE.Group()
          mesh.parent.add(pivot)
          pivot.position.copy(center)
          pivot.attach(mesh)
          mesh.userData.pivot = pivot
        }
        pickables.push(mesh)
      }
      const selected = propsRef.current.selectedOrganId
      if (selected && frameOrgan(selected, 'front')) framed = true
      else if (!framed && (fileKey === 'skeletal' || fileKey === 'visceral')) {
        framed = true
        frameBody('front')
      }
    }

    async function loadFile(fileKey) {
      if (loadedFiles.has(fileKey) || loadingFiles.has(fileKey)) return
      loadingFiles.add(fileKey)
      setProgress(`Loading ${fileKey} model…`)
      try {
        const gltf = await loader.loadAsync(`${MODEL_BASE}${MODEL_FILES[fileKey]}`)
        if (disposed) return
        adopt(gltf, fileKey)
        loadedFiles.add(fileKey)
        setStatus('ready')
        setProgress(loadedFiles.size === FILE_KEYS.length ? 'All available models loaded' : `${loadedFiles.size} model file${loadedFiles.size === 1 ? '' : 's'} loaded`)
      } catch (error) {
        if (disposed) return
        setErrors((current) => [...current, `${MODEL_FILES[fileKey]} failed to load`])
        setStatus((current) => (current === 'loading' ? 'error' : current))
        console.error(error)
      } finally {
        loadingFiles.delete(fileKey)
      }
    }

    function filesNeeded() {
      const keys = new Set()
      for (const systemId of propsRef.current.systems || []) {
        const fileKey = fileKeyForSystem(systemId)
        if (fileKey) keys.add(fileKey)
      }
      if (!keys.size) keys.add('skeletal')
      return keys
    }

    function syncLoads() {
      for (const fileKey of filesNeeded()) loadFile(fileKey)
    }

    function pointerToNdc(event) {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    }

    let down = null
    let lastMove = 0
    function onPointerDown(event) {
      down = { x: event.clientX, y: event.clientY }
    }
    function onPointerMove(event) {
      const now = performance.now()
      if (now - lastMove < 40) return
      lastMove = now
      pointerToNdc(event)
      raycaster.setFromCamera(pointer, camera)
      const hit = raycaster.intersectObjects(visibleMeshes(), false)[0]?.object || null
      if (hit !== hoverMesh) {
        hoverMesh = hit
        appliedKey = ''
        setHoverName(hit?.name || '')
      }
    }
    function onPointerUp(event) {
      if (!down) return
      const dx = event.clientX - down.x
      const dy = event.clientY - down.y
      down = null
      if (dx * dx + dy * dy > 25) return
      pointerToNdc(event)
      raycaster.setFromCamera(pointer, camera)
      const hit = raycaster.intersectObjects(visibleMeshes(), false)[0]?.object || null
      if (!hit) {
        propsRef.current.onSelect?.(null, null)
        return
      }
      propsRef.current.onSelect?.(hit.userData.organId, {
        name: hit.name,
        system: hit.userData.system,
      })
    }

    renderer.domElement.addEventListener('pointerdown', onPointerDown)
    renderer.domElement.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    renderer.domElement.addEventListener('pointerleave', () => {
      hoverMesh = null
      appliedKey = ''
      setHoverName('')
    })
    controls.addEventListener('start', () => {
      lerping = false
      userAdjusted = true
    })

    apiRef.current = {
      goTo(name) {
        frameBody(name)
      },
      focusOrgan(organId, viewName) {
        return frameOrgan(organId, viewName || 'front')
      },
      zoom(factor) {
        userAdjusted = true
        const offset = camera.position.clone().sub(controls.target)
        offset.multiplyScalar(factor)
        const distance = THREE.MathUtils.clamp(offset.length(), controls.minDistance, controls.maxDistance)
        offset.setLength(distance)
        goal.copy(controls.target).add(offset)
        goalTarget.copy(controls.target)
        lerping = true
      },
      reset() {
        frameBody('front')
      },
      syncLoads,
      lastEmit: 0,
    }

    syncLoads()
    frame = requestAnimationFrame(animate)

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      renderer.domElement.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      controls.dispose()
      draco.dispose()
      const geometries = new Set()
      const materials = new Set()
      scene.traverse((object) => {
        if (object.geometry) geometries.add(object.geometry)
        const list = object.material ? (Array.isArray(object.material) ? object.material : [object.material]) : []
        list.forEach((material) => materials.add(material))
        if (object.userData?.selectMaterial) materials.add(object.userData.selectMaterial)
        if (object.userData?.hoverMaterial) materials.add(object.userData.hoverMaterial)
        if (object.userData?.pulseMaterial) materials.add(object.userData.pulseMaterial)
        if (object.userData?.baseMaterial) {
          const base = Array.isArray(object.userData.baseMaterial) ? object.userData.baseMaterial : [object.userData.baseMaterial]
          base.forEach((material) => materials.add(material))
        }
      })
      geometries.forEach((geometry) => geometry.dispose())
      materials.forEach((material) => material.dispose())
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
      labelRenderer.domElement.remove()
      apiRef.current = null
    }
  }, [])

  useEffect(() => {
    apiRef.current?.syncLoads()
  }, [systems])

  useEffect(() => {
    if (!selectedOrganId || !frameSelection) return undefined
    const timer = window.setTimeout(() => apiRef.current?.focusOrgan(selectedOrganId, activeView), 80)
    return () => window.clearTimeout(timer)
  }, [selectedOrganId, frameSelection])

  useEffect(() => {
    if (selectedOrganId && !viewsFrameBody) return
    apiRef.current?.goTo(activeView)
  }, [activeView, selectedOrganId, viewsFrameBody])

  function chooseView(next) {
    onViewChange?.(next)
    if (!view) setInternalView(next)
  }

  return (
    <div className={`relative overflow-hidden rounded-[1.4rem] border border-white/10 bg-[#07101c] ${className}`}>
      <div ref={mountRef} className="absolute inset-0" />
      {showChrome && (
        <div className="absolute left-3 top-3 z-10 flex max-w-[75%] flex-wrap gap-2">
          {['front', 'back', 'left', 'right'].map((item) => (
            <button key={item} type="button" className="btn-quiet capitalize" data-active={activeView === item} onClick={() => chooseView(item)}>
              {item}
            </button>
          ))}
          <button type="button" className="btn-quiet" onClick={() => { chooseView('front'); apiRef.current?.reset() }}>
            <RotateCcw size={15} /> Reset
          </button>
          <button type="button" className="btn-quiet" onClick={() => apiRef.current?.zoom(0.82)} aria-label="Zoom in"><ZoomIn size={15} /></button>
          <button type="button" className="btn-quiet" onClick={() => apiRef.current?.zoom(1.18)} aria-label="Zoom out"><ZoomOut size={15} /></button>
        </div>
      )}
      <div className="pointer-events-none absolute bottom-3 right-3 z-10 max-w-[14rem] text-right">
        <p className="text-[11px] font-semibold text-cyan-100">{hoverName || progress}</p>
        <p className="text-[10px] leading-snug text-slate-500">Z-Anatomy · CC BY-SA 4.0</p>
      </div>
      {status === 'loading' && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-[#07101c]/80">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-cyan-300/30 border-t-cyan-300" />
            <p className="mt-3 text-sm font-semibold text-slate-200">{progress}</p>
          </div>
        </div>
      )}
      {errors.length > 0 && (
        <div className="absolute bottom-16 left-3 z-20 max-w-sm rounded-2xl border border-rose-300/40 bg-rose-950/80 px-3 py-2 text-xs text-rose-100">
          {errors.map((error) => <p key={error}>{error}</p>)}
        </div>
      )}
      {children}
    </div>
  )
})

export default BodyViewer
