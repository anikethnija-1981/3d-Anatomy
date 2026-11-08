import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

/**
 * Optional CC-licensed GLB. Mesh names that match organ ids replace the built-in geometry.
 * A missing file is expected and keeps the procedural model.
 */
export async function loadOptionalAnatomy(byId) {
  let response
  try {
    response = await fetch('/models/body.glb')
  } catch {
    return { status: 'builtin', message: 'Built-in 3D anatomical model' }
  }
  if (!response.ok) return { status: 'builtin', message: 'Built-in 3D anatomical model' }
  const type = response.headers.get('content-type') || ''
  if (type.includes('text/html')) return { status: 'builtin', message: 'Built-in 3D anatomical model' }

  const buffer = await response.arrayBuffer()
  const draco = new DRACOLoader()
  draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')
  const loader = new GLTFLoader()
  loader.setDRACOLoader(draco)

  try {
    const gltf = await new Promise((resolve, reject) => {
      loader.parse(buffer, '/models/', resolve, reject)
    })
    let matched = 0
    gltf.scene.traverse((object) => {
      if (!object.isMesh) return
      const targets = byId.get(object.name)
      if (!targets?.length) return
      matched += 1
      object.geometry.computeBoundingBox()
      targets.forEach((target) => {
        target.geometry.dispose()
        target.geometry = object.geometry
        const outline = target.userData.outline
        if (outline) outline.geometry = object.geometry
      })
    })
    if (matched === 0) {
      return {
        status: 'unmatched',
        message: 'body.glb loaded, but mesh names did not match organ ids. Showing the built-in model.',
      }
    }
    return { status: 'replaced', message: `Loaded body.glb · ${matched} organs replaced` }
  } catch {
    return { status: 'error', message: 'Could not read body.glb. Showing the built-in model.' }
  } finally {
    draco.dispose()
  }
}
