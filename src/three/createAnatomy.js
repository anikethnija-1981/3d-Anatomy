import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { organById } from '../data/catalog.js'

function capsuleBetween(a, b, radius, segments = 8) {
  const start = new THREE.Vector3(a[0], a[1], a[2])
  const end = new THREE.Vector3(b[0], b[1], b[2])
  const direction = new THREE.Vector3().subVectors(end, start)
  const length = Math.max(direction.length() - radius * 2, 0.02)
  const geometry = new THREE.CapsuleGeometry(radius, length, 4, segments)
  geometry.applyQuaternion(
    new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize()),
  )
  const mid = start.clone().add(end).multiplyScalar(0.5)
  geometry.translate(mid.x, mid.y, mid.z)
  return geometry
}

function tube(points, radius, tubular = 48) {
  const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(point[0], point[1], point[2])))
  return new THREE.TubeGeometry(curve, tubular, radius, 7, false)
}

function merge(geometries) {
  const merged = mergeGeometries(geometries, false)
  if (!merged) throw new Error('Could not merge anatomy geometry')
  return merged
}

function heartGeometry() {
  const leftVentricle = new THREE.SphereGeometry(0.062, 24, 18)
  leftVentricle.scale(0.95, 1.35, 0.82)
  leftVentricle.translate(0.028, -0.02, 0.01)
  const rightVentricle = new THREE.SphereGeometry(0.05, 22, 16)
  rightVentricle.scale(0.9, 1.2, 0.78)
  rightVentricle.translate(-0.028, -0.008, 0.018)
  const leftAtrium = new THREE.SphereGeometry(0.034, 16, 12)
  leftAtrium.translate(0.03, 0.048, -0.008)
  const rightAtrium = new THREE.SphereGeometry(0.032, 16, 12)
  rightAtrium.translate(-0.026, 0.042, 0.006)
  const apex = new THREE.SphereGeometry(0.028, 14, 10)
  apex.translate(0.04, -0.07, 0.01)
  const geometry = merge([leftVentricle, rightVentricle, leftAtrium, rightAtrium, apex])
  geometry.rotateZ(0.35)
  geometry.rotateY(-0.4)
  return geometry
}

function foldedSphere(radius, detail, amount) {
  const geometry = new THREE.IcosahedronGeometry(radius, detail)
  const position = geometry.attributes.position
  const vertex = new THREE.Vector3()
  for (let index = 0; index < position.count; index += 1) {
    vertex.fromBufferAttribute(position, index)
    const normal = vertex.clone().normalize()
    const fold = Math.sin(normal.x * 22) * Math.sin(normal.y * 18) * Math.sin(normal.z * 16)
    vertex.addScaledVector(normal, fold * amount)
    position.setXYZ(index, vertex.x, vertex.y, vertex.z)
  }
  geometry.computeVertexNormals()
  return geometry
}

function coilGeometry() {
  const points = []
  const turns = 3.4
  for (let index = 0; index <= 100; index += 1) {
    const t = (index / 100) * Math.PI * 2 * turns
    const radius = 0.04 + (index / 100) * 0.028
    points.push(new THREE.Vector3(Math.cos(t) * radius, 0.83 + (index / 100) * 0.07, Math.sin(t) * radius * 0.72))
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 140, 0.011, 6, false)
}

function colonGeometry() {
  const points = [
    [-0.1, 0.8, 0.05],
    [-0.11, 0.9, 0.055],
    [-0.1, 0.98, 0.05],
    [0, 1.0, 0.06],
    [0.11, 0.98, 0.05],
    [0.12, 0.88, 0.045],
    [0.1, 0.78, 0.04],
    [0.02, 0.72, 0.035],
  ].map((point) => new THREE.Vector3(point[0], point[1], point[2]))
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 80, 0.02, 7, false)
}

function ribcageGeometry() {
  const parts = []
  for (let rib = 0; rib < 8; rib += 1) {
    const y = 1.3 - rib * 0.042
    const rx = 0.105 + rib * 0.006
    const rz = 0.085
    const points = []
    for (let step = 0; step <= 22; step += 1) {
      const angle = -2.15 + (4.3 * step) / 22
      points.push(new THREE.Vector3(Math.sin(angle) * rx, y, Math.cos(angle) * rz * 0.7))
    }
    parts.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 28, 0.007, 5, false))
  }
  const sternum = new THREE.BoxGeometry(0.028, 0.3, 0.016)
  sternum.translate(0, 1.16, 0.075)
  parts.push(sternum)
  return merge(parts)
}

function spineGeometry() {
  const parts = []
  for (let index = 0; index < 18; index += 1) {
    const y = 0.78 + index * 0.038
    const radius = index > 13 ? 0.02 : 0.017
    const vertebra = new THREE.CylinderGeometry(radius, radius * 0.92, 0.024, 8)
    vertebra.translate(0, y, -0.055)
    parts.push(vertebra)
  }
  return merge(parts)
}

function skullGeometry() {
  const cranium = new THREE.SphereGeometry(0.112, 28, 20)
  cranium.scale(1, 1.05, 0.98)
  cranium.translate(0, 1.65, 0.02)
  const jaw = new THREE.SphereGeometry(0.055, 16, 12)
  jaw.scale(1.1, 0.55, 0.8)
  jaw.translate(0, 1.54, 0.055)
  return merge([cranium, jaw])
}

function pelvisGeometry() {
  const ring = new THREE.TorusGeometry(0.125, 0.022, 10, 28)
  ring.rotateX(Math.PI / 2.3)
  ring.translate(0, 0.8, 0)
  const sacrum = new THREE.BoxGeometry(0.07, 0.09, 0.03)
  sacrum.translate(0, 0.84, -0.06)
  return merge([ring, sacrum])
}

export function createAnatomyModel(quality = 'high') {
  const detail = quality === 'high' ? 3 : 2
  const root = new THREE.Group()
  root.name = 'anatomy-root'
  const groups = {}
  for (const id of ['circulatory', 'respiratory', 'nervous', 'skeletal', 'muscular', 'digestive', 'urinary', 'reproductive']) {
    groups[id] = new THREE.Group()
    groups[id].name = id
    root.add(groups[id])
  }
  const femaleGroup = new THREE.Group()
  const maleGroup = new THREE.Group()
  groups.reproductive.add(femaleGroup, maleGroup)

  const outlineMaterial = new THREE.MeshBasicMaterial({
    color: 0x67e8f9,
    side: THREE.BackSide,
    transparent: true,
    opacity: 0.95,
  })
  const pickables = []
  const byId = new Map()

  function addMesh(geometry, options) {
    const meta = options.id ? organById.get(options.id) : null
    const sex = options.sex || meta?.sex || 'any'
    const opacity = options.opacity ?? 1
    const material = new THREE.MeshStandardMaterial({
      color: options.color,
      roughness: options.roughness ?? 0.46,
      metalness: 0.04,
      emissive: options.color,
      emissiveIntensity: options.emissive ?? 0.07,
      transparent: opacity < 0.98,
      opacity,
      depthWrite: options.depthWrite ?? opacity > 0.9,
      side: THREE.FrontSide,
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(...(options.position || [0, 0, 0]))
    mesh.rotation.set(...(options.rotation || [0, 0, 0]))
    mesh.scale.set(...(options.scale || [1, 1, 1]))
    geometry.computeBoundingBox()
    const center = geometry.boundingBox.getCenter(new THREE.Vector3())
    if (center.lengthSq() > 1e-8) {
      geometry.translate(-center.x, -center.y, -center.z)
      mesh.position.add(center)
    }
    mesh.userData = {
      organId: options.id || null,
      system: options.system,
      sex,
      baseEmissive: options.emissive ?? 0.07,
      label: meta?.name || options.label || options.id,
      localCenter: new THREE.Vector3(),
    }
    mesh.userData.baseScale = mesh.scale.clone()
    mesh.userData.basePosition = mesh.position.clone()
    mesh.renderOrder = options.renderOrder ?? (opacity < 0.98 ? 1 : 2)
    if (options.id) {
      const outline = new THREE.Mesh(geometry, outlineMaterial)
      outline.name = 'outline'
      outline.visible = false
      outline.scale.setScalar(1.055)
      outline.raycast = () => {}
      mesh.add(outline)
      mesh.userData.outline = outline
      const parent = sex === 'female' ? femaleGroup : sex === 'male' ? maleGroup : groups[options.system]
      parent.add(mesh)
      pickables.push(mesh)
      if (!byId.has(options.id)) byId.set(options.id, [])
      byId.get(options.id).push(mesh)
    } else {
      groups[options.system].add(mesh)
    }
    return mesh
  }

  const shellParts = []
  const head = new THREE.SphereGeometry(0.128, quality === 'high' ? 32 : 20, quality === 'high' ? 24 : 16)
  head.translate(0, 1.64, 0.02)
  shellParts.push(head)
  const neck = new THREE.CylinderGeometry(0.055, 0.072, 0.15, 18)
  neck.translate(0, 1.5, 0.015)
  shellParts.push(neck)
  const torso = new THREE.LatheGeometry(
    [
      [0.19, 0],
      [0.215, -0.07],
      [0.18, -0.18],
      [0.15, -0.32],
      [0.175, -0.46],
      [0.155, -0.58],
      [0.09, -0.68],
    ].map(([x, y]) => new THREE.Vector2(x, y)),
    quality === 'high' ? 36 : 24,
  )
  torso.scale(1, 1, 0.66)
  torso.translate(0, 1.42, 0)
  shellParts.push(torso)
  const limbPairs = [
    [[0.23, 1.36, 0], [0.33, 1.05, 0.04], 0.05],
    [[0.33, 1.05, 0.04], [0.36, 0.76, 0.06], 0.038],
    [[0.1, 0.84, 0], [0.12, 0.44, 0.03], 0.072],
    [[0.12, 0.44, 0.03], [0.12, 0.09, 0.04], 0.05],
  ]
  for (const [a, b, radius] of limbPairs) {
    shellParts.push(capsuleBetween(a, b, radius, 8))
    shellParts.push(capsuleBetween([-a[0], a[1], a[2]], [-b[0], b[1], b[2]], radius, 8))
  }
  const hand = new THREE.SphereGeometry(0.038, 12, 10)
  hand.translate(0.37, 0.72, 0.07)
  const otherHand = hand.clone()
  otherHand.translate(-0.74, 0, 0)
  shellParts.push(hand, otherHand)
  for (const sign of [1, -1]) {
    const foot = new THREE.SphereGeometry(0.046, 12, 10)
    foot.scale(0.8, 0.48, 1.45)
    foot.translate(0.12 * sign, 0.04, 0.1)
    shellParts.push(foot)
  }
  const shellMaterial = new THREE.MeshStandardMaterial({
    color: '#f3d5c4',
    transparent: true,
    opacity: 0.16,
    roughness: 0.28,
    metalness: 0,
    depthWrite: false,
    side: THREE.DoubleSide,
  })
  const shell = new THREE.Mesh(merge(shellParts), shellMaterial)
  shell.renderOrder = 4
  shell.raycast = () => {}
  root.add(shell)

  addMesh(heartGeometry(), { id: 'heart', system: 'circulatory', color: '#e11d48', position: [0.045, 1.15, 0.06], emissive: 0.12 })
  addMesh(
    tube(
      [
        [0.07, 1.1, 0.06],
        [0.03, 1.24, 0.045],
        [-0.01, 1.33, 0.01],
        [-0.03, 1.24, -0.02],
        [-0.02, 0.9, -0.03],
      ],
      0.016,
      60,
    ),
    { id: 'aorta', system: 'circulatory', color: '#fb7185', emissive: 0.15 },
  )
  addMesh(
    merge([
      tube(
        [
          [-0.02, 0.82, 0.0],
          [-0.015, 1.05, 0.02],
          [0.0, 1.18, 0.04],
        ],
        0.014,
        40,
      ),
      tube(
        [
          [0.0, 1.2, 0.04],
          [0.0, 1.36, 0.03],
        ],
        0.012,
        16,
      ),
    ]),
    { id: 'vena-cava', system: 'circulatory', color: '#60a5fa', emissive: 0.16 },
  )

  addMesh(new THREE.CylinderGeometry(0.018, 0.02, 0.2, 16), {
    id: 'trachea',
    system: 'respiratory',
    color: '#bae6fd',
    position: [0, 1.36, 0.05],
  })
  addMesh(tube([[0.015, 1.28, 0.04], [-0.07, 1.2, 0.03], [-0.12, 1.16, 0.02]], 0.01, 24), {
    system: 'respiratory',
    color: '#7dd3fc',
    opacity: 0.95,
  })
  addMesh(tube([[0.015, 1.28, 0.04], [0.08, 1.2, 0.03], [0.13, 1.16, 0.02]], 0.01, 24), {
    system: 'respiratory',
    color: '#7dd3fc',
  })
  addMesh(new THREE.SphereGeometry(1, 28, 20), {
    id: 'lung-right',
    system: 'respiratory',
    color: '#f9a8d4',
    position: [-0.115, 1.17, 0.02],
    scale: [0.1, 0.15, 0.085],
    emissive: 0.08,
  })
  addMesh(new THREE.SphereGeometry(1, 28, 20), {
    id: 'lung-left',
    system: 'respiratory',
    color: '#f472b6',
    position: [0.135, 1.16, 0.015],
    scale: [0.085, 0.135, 0.075],
  })
  addMesh(new THREE.CylinderGeometry(0.15, 0.155, 0.02, 28), {
    id: 'diaphragm',
    system: 'respiratory',
    color: '#fb7185',
    position: [0, 0.96, 0.02],
    scale: [1, 1, 0.72],
    opacity: 0.85,
    depthWrite: false,
  })

  addMesh(foldedSphere(0.088, detail, 0.006), {
    id: 'cerebrum',
    system: 'nervous',
    color: '#e9d5ff',
    position: [0, 1.665, 0.02],
    emissive: 0.06,
  })
  addMesh(foldedSphere(0.042, 2, 0.004), {
    id: 'cerebellum',
    system: 'nervous',
    color: '#d8b4fe',
    position: [0, 1.575, -0.035],
    scale: [1.15, 0.72, 0.85],
  })
  addMesh(new THREE.CapsuleGeometry(0.02, 0.045, 4, 8), {
    id: 'brainstem',
    system: 'nervous',
    color: '#c084fc',
    position: [0, 1.55, -0.01],
  })
  addMesh(new THREE.CylinderGeometry(0.012, 0.013, 0.7, 10), {
    id: 'spinal-cord',
    system: 'nervous',
    color: '#d8b4fe',
    position: [0, 1.12, -0.03],
  })

  const bone = { opacity: 0.4, depthWrite: false, renderOrder: 1, roughness: 0.62, emissive: 0.02 }
  addMesh(skullGeometry(), { id: 'skull', system: 'skeletal', color: '#f5f5f4', ...bone })
  addMesh(spineGeometry(), { id: 'spine', system: 'skeletal', color: '#e7e5e4', ...bone, opacity: 0.72, depthWrite: true })
  addMesh(ribcageGeometry(), { id: 'ribcage', system: 'skeletal', color: '#fafaf9', ...bone })
  addMesh(pelvisGeometry(), { id: 'pelvis', system: 'skeletal', color: '#e7e5e4', ...bone })
  addMesh(capsuleBetween([0.24, 1.34, 0], [0.33, 1.04, 0.03], 0.018, 6), {
    id: 'humerus',
    system: 'skeletal',
    color: '#f5f5f4',
    ...bone,
    opacity: 0.85,
    depthWrite: true,
  })
  addMesh(capsuleBetween([-0.24, 1.34, 0], [-0.33, 1.04, 0.03], 0.018, 6), {
    id: 'humerus',
    system: 'skeletal',
    color: '#f5f5f4',
    ...bone,
    opacity: 0.85,
    depthWrite: true,
  })
  addMesh(capsuleBetween([0.1, 0.8, 0], [0.12, 0.44, 0.02], 0.022, 6), {
    id: 'femur',
    system: 'skeletal',
    color: '#f5f5f4',
    ...bone,
    opacity: 0.85,
    depthWrite: true,
  })
  addMesh(capsuleBetween([-0.1, 0.8, 0], [-0.12, 0.44, 0.02], 0.022, 6), {
    id: 'femur',
    system: 'skeletal',
    color: '#f5f5f4',
    ...bone,
    opacity: 0.85,
    depthWrite: true,
  })

  const muscle = { opacity: 0.42, depthWrite: false, renderOrder: 3, emissive: 0.05 }
  addMesh(new THREE.SphereGeometry(1, 20, 14), {
    id: 'pectoralis',
    system: 'muscular',
    color: '#ef4444',
    position: [-0.07, 1.22, 0.07],
    scale: [0.08, 0.055, 0.035],
    ...muscle,
  })
  addMesh(new THREE.SphereGeometry(1, 20, 14), {
    id: 'pectoralis',
    system: 'muscular',
    color: '#ef4444',
    position: [0.07, 1.22, 0.07],
    scale: [0.08, 0.055, 0.035],
    ...muscle,
  })
  addMesh(capsuleBetween([0.25, 1.32, 0.03], [0.33, 1.06, 0.06], 0.032, 6), {
    id: 'biceps',
    system: 'muscular',
    color: '#f87171',
    ...muscle,
  })
  addMesh(capsuleBetween([-0.25, 1.32, 0.03], [-0.33, 1.06, 0.06], 0.032, 6), {
    id: 'biceps',
    system: 'muscular',
    color: '#f87171',
    ...muscle,
  })
  addMesh(capsuleBetween([0.1, 0.78, 0.04], [0.12, 0.48, 0.06], 0.045, 6), {
    id: 'quadriceps',
    system: 'muscular',
    color: '#ef4444',
    ...muscle,
  })
  addMesh(capsuleBetween([-0.1, 0.78, 0.04], [-0.12, 0.48, 0.06], 0.045, 6), {
    id: 'quadriceps',
    system: 'muscular',
    color: '#ef4444',
    ...muscle,
  })
  addMesh(new THREE.BoxGeometry(0.16, 0.18, 0.03), {
    id: 'abdominals',
    system: 'muscular',
    color: '#fca5a5',
    position: [0, 1.02, 0.085],
    ...muscle,
  })

  addMesh(
    tube(
      [
        [0, 1.42, 0.01],
        [0, 1.22, 0.02],
        [0.04, 1.08, 0.04],
      ],
      0.012,
      32,
    ),
    { id: 'esophagus', system: 'digestive', color: '#fdba74' },
  )
  addMesh(new THREE.SphereGeometry(1, 26, 18), {
    id: 'stomach',
    system: 'digestive',
    color: '#fb923c',
    position: [0.085, 1.0, 0.055],
    rotation: [0.2, 0, 0.55],
    scale: [0.062, 0.085, 0.05],
  })
  addMesh(new THREE.SphereGeometry(1, 26, 18), {
    id: 'liver',
    system: 'digestive',
    color: '#9f1239',
    position: [-0.07, 0.99, 0.04],
    scale: [0.13, 0.075, 0.085],
  })
  addMesh(new THREE.SphereGeometry(1, 18, 12), {
    id: 'pancreas',
    system: 'digestive',
    color: '#fde68a',
    position: [0.03, 0.99, 0.0],
    scale: [0.09, 0.022, 0.028],
  })
  addMesh(coilGeometry(), { id: 'small-intestine', system: 'digestive', color: '#fb923c', emissive: 0.05 })
  addMesh(colonGeometry(), { id: 'large-intestine', system: 'digestive', color: '#ea580c' })

  addMesh(new THREE.SphereGeometry(1, 22, 16), {
    id: 'kidney-right',
    system: 'urinary',
    color: '#b45309',
    position: [-0.085, 0.98, -0.045],
    scale: [0.04, 0.065, 0.03],
  })
  addMesh(new THREE.SphereGeometry(1, 22, 16), {
    id: 'kidney-left',
    system: 'urinary',
    color: '#c2410c',
    position: [0.095, 1.02, -0.045],
    scale: [0.04, 0.065, 0.03],
  })
  addMesh(
    tube(
      [
        [-0.08, 0.93, -0.03],
        [-0.04, 0.84, 0.0],
        [-0.015, 0.76, 0.03],
      ],
      0.006,
      28,
    ),
    { system: 'urinary', color: '#fbbf24' },
  )
  addMesh(
    tube(
      [
        [0.09, 0.96, -0.03],
        [0.04, 0.84, 0.0],
        [0.015, 0.76, 0.03],
      ],
      0.006,
      28,
    ),
    { system: 'urinary', color: '#fbbf24' },
  )
  addMesh(new THREE.SphereGeometry(1, 22, 16), {
    id: 'bladder',
    system: 'urinary',
    color: '#fcd34d',
    position: [0, 0.75, 0.045],
    scale: [0.055, 0.05, 0.045],
  })

  addMesh(new THREE.SphereGeometry(1, 22, 16), {
    id: 'uterus',
    system: 'reproductive',
    color: '#f9a8d4',
    position: [0, 0.73, 0.02],
    scale: [0.04, 0.055, 0.035],
    sex: 'female',
  })
  addMesh(new THREE.SphereGeometry(0.02, 14, 12), {
    id: 'ovaries',
    system: 'reproductive',
    color: '#f472b6',
    position: [-0.07, 0.78, 0.025],
    sex: 'female',
  })
  addMesh(new THREE.SphereGeometry(0.02, 14, 12), {
    id: 'ovaries',
    system: 'reproductive',
    color: '#f472b6',
    position: [0.07, 0.78, 0.025],
    sex: 'female',
  })
  addMesh(new THREE.SphereGeometry(0.028, 16, 12), {
    id: 'prostate',
    system: 'reproductive',
    color: '#f9a8d4',
    position: [0, 0.7, 0.03],
    sex: 'male',
  })
  addMesh(new THREE.SphereGeometry(0.03, 16, 12), {
    id: 'testes',
    system: 'reproductive',
    color: '#fbcfe8',
    position: [-0.03, 0.62, 0.06],
    sex: 'male',
  })
  addMesh(new THREE.SphereGeometry(0.03, 16, 12), {
    id: 'testes',
    system: 'reproductive',
    color: '#fbcfe8',
    position: [0.03, 0.62, 0.06],
    sex: 'male',
  })

  const bloodCurve = new THREE.CatmullRomCurve3(
    [
      [0.02, 1.12, 0.1],
      [0.045, 1.05, 0.12],
      [-0.02, 1.22, 0.1],
      [-0.13, 1.18, 0.08],
      [0.14, 1.17, 0.08],
      [0.06, 1.16, 0.11],
      [0.08, 1.08, 0.12],
      [0.01, 1.32, 0.08],
      [0.2, 1.18, 0.12],
      [0.06, 0.72, 0.1],
      [-0.02, 1.16, 0.09],
    ].map((point) => new THREE.Vector3(point[0], point[1], point[2])),
    true,
  )
  const bloodTube = new THREE.Mesh(
    new THREE.TubeGeometry(bloodCurve, 90, 0.006, 6, true),
    new THREE.MeshStandardMaterial({ color: '#fecdd3', transparent: true, opacity: 0.35, depthWrite: false }),
  )
  bloodTube.visible = false
  bloodTube.renderOrder = 3
  root.add(bloodTube)
  const bloodGroup = new THREE.Group()
  bloodGroup.visible = false
  const bloodParticles = []
  const particleGeo = new THREE.SphereGeometry(0.012, 8, 8)
  for (let index = 0; index < 22; index += 1) {
    const material = new THREE.MeshStandardMaterial({
      color: '#fb7185',
      emissive: '#fb7185',
      emissiveIntensity: 0.7,
      roughness: 0.3,
    })
    const particle = new THREE.Mesh(particleGeo, material)
    bloodGroup.add(particle)
    bloodParticles.push(particle)
  }
  root.add(bloodGroup)

  const bolus = new THREE.Mesh(
    new THREE.SphereGeometry(0.026, 14, 12),
    new THREE.MeshStandardMaterial({ color: '#fde68a', emissive: '#f59e0b', emissiveIntensity: 0.45, roughness: 0.35 }),
  )
  bolus.visible = false
  root.add(bolus)

  const digestion = [
    { label: 'Mouth', organId: null, position: new THREE.Vector3(0, 1.56, 0.16) },
    { label: 'Pharynx', organId: null, position: new THREE.Vector3(0, 1.46, 0.07) },
    { label: 'Esophagus', organId: 'esophagus', position: new THREE.Vector3(0.01, 1.24, 0.04) },
    { label: 'Stomach', organId: 'stomach', position: new THREE.Vector3(0.08, 1.0, 0.08) },
    { label: 'Small intestine', organId: 'small-intestine', position: new THREE.Vector3(0, 0.88, 0.06) },
    { label: 'Large intestine', organId: 'large-intestine', position: new THREE.Vector3(0.1, 0.9, 0.07) },
    { label: 'Rectum', organId: 'large-intestine', position: new THREE.Vector3(0, 0.74, 0.05) },
  ]

  return {
    root,
    pickables,
    byId,
    shell,
    shellMaterial,
    groups,
    femaleGroup,
    maleGroup,
    bloodGroup,
    bloodCurve,
    bloodParticles,
    bloodTube,
    bolus,
    digestion,
    outlineMaterial,
  }
}

const FLOW = [
  { at: 0, name: 'Right atrium' },
  { at: 0.1, name: 'Right ventricle' },
  { at: 0.22, name: 'Pulmonary arteries' },
  { at: 0.36, name: 'Lungs' },
  { at: 0.5, name: 'Left atrium' },
  { at: 0.6, name: 'Left ventricle' },
  { at: 0.72, name: 'Aorta' },
  { at: 0.84, name: 'Body tissues' },
  { at: 0.94, name: 'Venae cavae' },
]

export function circulationLabel(progress) {
  let current = FLOW[0].name
  for (const step of FLOW) {
    if (progress >= step.at) current = step.name
  }
  return current
}
