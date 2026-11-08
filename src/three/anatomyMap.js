/** Z-Anatomy / BodyParts3D system files. Originals stay in the project root. */
export const MODEL_FILES = {
  skeletal: 'skeletal.glb',
  joints: 'joints.glb',
  muscular: 'muscular.glb',
  circulatory: 'cardiovascular.glb',
  nervous: 'nervous.glb',
  lymphatic: 'lymphatic.glb',
  visceral: 'visceral.glb',
}

export const MODEL_BASE = '/models/z-anatomy/'

export const ATTRIBUTION = [
  'BodyParts3D, Database Center for Life Science, CC BY-SA 2.1 Japan.',
  'Z-Anatomy, the open source atlas of anatomy, CC BY-SA 4.0.',
  'Additional adapted models credited in License.txt, including University of Dundee (CC BY 4.0 and CC BY-NC-SA 4.0) and lissiecowley kidney (CC BY-NC 4.0).',
  'Structure names follow the model. Definitions are introductory teaching text, with wording informed by openly licensed anatomy references.',
]

const VISCERAL_RULES = [
  { system: 'respiratory', test: /lung|trachea|bronch|larynx|carina/i },
  { system: 'urinary', test: /kidney|ureter|urinary bladder|urethra/i },
  { system: 'reproductive', test: /testis|epididym|prostate|seminal|penis|corpus cavernosum|corpus spongiosum|glans/i },
]

export function systemForMesh(fileKey, name) {
  if (fileKey !== 'visceral') return fileKey
  if (/gallbladder|bile/i.test(name)) return 'digestive'
  for (const rule of VISCERAL_RULES) {
    if (rule.test.test(name)) return rule.system
  }
  return 'digestive'
}

export function matchOrgan(name, system) {
  const n = name.toLowerCase()
  if (system === 'circulatory') {
    if (/atrium|ventricle|papillary muscle|atrioventricular valve|semilunar leaflet|coronary leaflet/.test(n)) return 'heart'
    if (/aorta/.test(n)) return 'aorta'
    if (/vena cava/.test(n)) return 'vena-cava'
    return null
  }
  if (system === 'respiratory') {
    if (/trachea|larynx/.test(n)) return 'trachea'
    if (/left lung|of left lung/.test(n)) return 'lung-left'
    if (/right lung|of right lung/.test(n)) return 'lung-right'
    return null
  }
  if (system === 'nervous') {
    if (/cerebell/.test(n)) return 'cerebellum'
    if (/midbrain|pons\.|medulla oblongata/.test(n)) return 'brainstem'
    if (/spinal cord|spinothalamic|spinocerebellar/.test(n)) return 'spinal-cord'
    if (/gyrus|sulcus|lobule|thalamus|hypothalamus|corpus callosum|occipital pole/.test(n)) return 'cerebrum'
    return null
  }
  if (system === 'skeletal') {
    if (/frontal bone|parietal bone|occipital bone|temporal bone|sphenoid|ethmoid|mandible|maxilla|zygomatic|nasal bone/.test(n)) return 'skull'
    if (/vertebra|sacrum|coccyx/.test(n)) return 'spine'
    if (/rib|sternum|costal cartilage/.test(n)) return 'ribcage'
    if (/hip bone/.test(n)) return 'pelvis'
    if (/humerus/.test(n)) return 'humerus'
    if (/^femur/.test(n)) return 'femur'
    return null
  }
  if (system === 'muscular') {
    if (/^diaphragm$/.test(n)) return 'diaphragm'
    if (/pectoralis major/.test(n)) return 'pectoralis'
    if (/biceps brachii/.test(n)) return 'biceps'
    if (/rectus femoris|vastus /.test(n)) return 'quadriceps'
    if (/rectus abdominis|oblique muscle|transversus abdominis/.test(n)) return 'abdominals'
    return null
  }
  if (system === 'digestive') {
    if (/oesophagus|esophagus/.test(n)) return 'esophagus'
    if (/stomach/.test(n)) return 'stomach'
    if (/liver|gallbladder|bile duct/.test(n)) return 'liver'
    if (/pancrea/.test(n)) return 'pancreas'
    if (/duodenum|jejunum|ileum/.test(n)) return 'small-intestine'
    if (/colon|appendix|caecum|cecum|rectum|sigmoid/.test(n)) return 'large-intestine'
    return null
  }
  if (system === 'urinary') {
    if (/kidney\.l|left kidney/.test(n)) return 'kidney-left'
    if (/kidney\.r|right kidney/.test(n)) return 'kidney-right'
    if (/urinary bladder|ureter/.test(n)) return 'bladder'
    return null
  }
  if (system === 'reproductive') {
    if (/testis|epididym/.test(n)) return 'testes'
    if (/prostate|seminal|penis|cavernosum|spongiosum|glans/.test(n)) return 'prostate'
    return null
  }
  return null
}

export function fileKeyForSystem(systemId) {
  if (['respiratory', 'digestive', 'urinary', 'reproductive'].includes(systemId)) return 'visceral'
  if (MODEL_FILES[systemId]) return systemId
  return null
}
