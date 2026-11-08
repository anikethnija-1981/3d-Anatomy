export const DISEASES = [
  {
    id: 'cad',
    name: 'Coronary artery disease',
    organId: 'heart',
    system: 'circulatory',
    summary: 'Narrowing of the arteries that feed the heart muscle.',
    detail:
      'Coronary arteries branch from the aorta and supply the myocardium. Fatty plaques can narrow them, so a region of heart muscle receives less oxygen, especially during effort. A sudden blockage can cause a heart attack. Classroom point: these arteries are on the outside of the heart, not the same thing as the chambers inside it.',
    learn: 'Relate this to the aorta and to the difference between blood inside the chambers and blood that feeds the heart wall.',
  },
  {
    id: 'asthma',
    name: 'Asthma',
    organId: 'lung-left',
    system: 'respiratory',
    summary: 'Episodes of narrowed, inflamed airways that make breathing out difficult.',
    detail:
      'In asthma the bronchi and bronchioles become inflamed and the smooth muscle around them tightens. Air can usually enter more easily than it can leave, so the person wheezes and feels short of breath. The alveoli themselves are not the main site of the problem, which is why the airways are the focus of treatment taught in physiology class.',
    learn: 'Trace the path from trachea to bronchi to bronchioles and notice where smooth muscle can narrow the tube.',
  },
  {
    id: 'stroke',
    name: 'Stroke',
    organId: 'cerebrum',
    system: 'nervous',
    summary: 'A sudden loss of blood flow to part of the brain, or bleeding into the brain.',
    detail:
      'Brain tissue needs a constant supply of oxygen. A blocked cerebral artery, or a bleed, injures the region that artery supplies. Because different lobes do different jobs, symptoms depend on the location: speech, movement, vision, or balance may be affected. This is a medical emergency, not something to diagnose from an app.',
    learn: 'Use the lobe descriptions of the cerebrum to predict why a stroke in one area looks different from a stroke in another.',
  },
  {
    id: 'stones',
    name: 'Kidney stones',
    organId: 'kidney-left',
    system: 'urinary',
    summary: 'Hard crystals that can form in the urinary tract and block the flow of urine.',
    detail:
      'Urine contains dissolved salts. If those salts become too concentrated they can crystallize into a stone in the kidney or ureter. A stone that lodges in a ureter causes severe pain in the flank and can obstruct urine leaving that kidney. Drinking enough water is a basic prevention taught in health class. It is not a treatment plan for someone who already has a stone.',
    learn: 'Follow urine from the renal pelvis, down the ureter, into the bladder, and out through the urethra.',
  },
  {
    id: 'hepatitis',
    name: 'Hepatitis',
    organId: 'liver',
    system: 'digestive',
    summary: 'Inflammation of the liver, with several different causes.',
    detail:
      'Hepatitis means inflammation of the liver. Viruses, alcohol, some medicines, and autoimmune disease can all cause it. Because the liver processes nutrients, makes bile, and makes plasma proteins, inflammation can disturb all of those jobs. Jaundice, a yellow color of the skin and eyes, can appear when bile pigments are not cleared.',
    learn: 'Connect this disease to bile production and to the hepatic portal blood that arrives from the intestines.',
  },
  {
    id: 'osteoporosis',
    name: 'Osteoporosis',
    organId: 'femur',
    system: 'skeletal',
    summary: 'Loss of bone mass that makes bones easier to fracture.',
    detail:
      'Bone is constantly remodeled by osteoblasts, which build matrix, and osteoclasts, which break it down. In osteoporosis, breakdown outpaces building. The neck of the femur, the vertebrae, and the wrist are common fracture sites. Calcium, vitamin D, and weight-bearing activity matter because bone is living tissue, not a dry stick.',
    learn: 'Review osteoblasts, osteoclasts, and why the femur and vertebrae are mentioned so often.',
  },
  {
    id: 'gerd',
    name: 'Gastroesophageal reflux',
    organId: 'esophagus',
    system: 'digestive',
    summary: 'Stomach contents flowing back into the esophagus.',
    detail:
      'The lower esophageal sphincter normally closes after food enters the stomach. If it opens at the wrong time, acid can irritate the esophageal lining and cause heartburn. The stomach is built to tolerate acid. The esophagus is not. Persistent symptoms need a clinician, because they can overlap with other chest conditions.',
    learn: 'Compare the esophagus with the stomach and name the sphincter between them.',
  },
  {
    id: 'pneumonia',
    name: 'Pneumonia',
    organId: 'lung-right',
    system: 'respiratory',
    summary: 'Infection that fills alveoli with fluid or pus.',
    detail:
      'Pneumonia affects the lung tissue where gas exchange happens. Fluid in the alveoli increases the distance gases must travel, so oxygen has trouble reaching the blood. It is different from asthma, which mainly narrows the airways. The right lung is a common place to discuss inhaled material because the right bronchus is steeper.',
    learn: 'Contrast airway disease such as asthma with alveolar disease such as pneumonia.',
  },
  {
    id: 'diabetes',
    name: 'Diabetes mellitus',
    organId: 'pancreas',
    system: 'digestive',
    summary: 'A group of conditions in which blood glucose stays too high.',
    detail:
      'The pancreas releases insulin from islet cells when blood glucose rises. Insulin lets many body cells take glucose in. In type 1 diabetes the islet cells are destroyed and insulin is lacking. In type 2 diabetes the cells respond poorly to insulin. This page introduces the anatomy. It does not calculate doses or diagnose either type.',
    learn: 'Separate the exocrine pancreas, which releases digestive enzymes, from the endocrine islets, which release insulin.',
  },
]
