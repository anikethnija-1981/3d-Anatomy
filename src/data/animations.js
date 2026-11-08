export const ANIMATIONS = [
  {
    id: 'heartbeat',
    system: 'circulatory',
    title: 'Heartbeat',
    summary: 'The heart wall contracts and then relaxes.',
    detail:
      'One cardiac cycle has systole and diastole. In ventricular systole the muscle squeezes and ejects blood. In diastole the muscle relaxes and the chambers fill. The model pulses so the squeeze is easy to see. In a resting adult the cycle repeats about once a second.',
    focus: ['heart'],
  },
  {
    id: 'circulation',
    system: 'circulatory',
    title: 'Blood circulation',
    summary: 'A particle follows the pulmonary circuit and then the systemic circuit.',
    detail:
      'Watch one particle. Blue means the blood is low in oxygen. Red means it has picked up oxygen. The route is right atrium, right ventricle, lungs, left atrium, left ventricle, aorta, body, and back through the venae cavae. This matches the circulation graph in About Project.',
    focus: ['heart', 'aorta', 'vena-cava', 'lung-left', 'lung-right'],
  },
  {
    id: 'breathing',
    system: 'respiratory',
    title: 'Breathing',
    summary: 'The lungs expand when the diaphragm moves down.',
    detail:
      'Inhalation: the diaphragm contracts and descends, chest volume rises, and the lungs expand. A short pause follows. Exhalation: the diaphragm relaxes, the dome rises, and the lungs recoil. Gas exchange in the alveoli is happening throughout. The animation shows the volume change that makes air move.',
    focus: ['lung-left', 'lung-right', 'diaphragm', 'trachea'],
  },
  {
    id: 'digestion',
    system: 'digestive',
    title: 'Digestion pathway',
    summary: 'A bolus travels the linked list from mouth to large intestine.',
    detail:
      'The pathway is a linked list: mouth, pharynx, esophagus, stomach, small intestine, large intestine, rectum. The stomach churns and starts protein digestion. The small intestine absorbs most nutrients. The large intestine reclaims water. The moving sphere is the bolus, not a measurement of real transit time.',
    focus: ['esophagus', 'stomach', 'small-intestine', 'large-intestine'],
  },
]
