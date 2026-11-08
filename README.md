# Interactive 3D Human Anatomy Visualization and Learning System

Educational PBL project for Computer Science and Engineering, III Semester – S3-A.

Students explore a browser-based 3D body, eight organ systems, function animations, guided lessons, and randomized quizzes. Scores and lesson progress are stored in `localStorage`.

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints, usually `http://localhost:5173`.

Production build:

```bash
npm run build
npm run preview
```

No extra desktop application is required. A current Chrome, Edge, or Firefox window is enough. The 3D view uses WebGL.

## What is included

- Home, 3D Body Explorer, eight organ-system pages, Learning Mode, Animations, Quiz Center, My Progress, Disease Information, and About Project
- Three.js viewer with orbit, zoom, front/back/left/right cameras, reset, system show/hide, and organ picking
- Z-Anatomy GLB models loaded with GLTFLoader; a Draco decoder is ready if a compressed file is added later
- Trie and hash map search, circulation graph, digestion linked list, quiz queue, and explorer navigation stack

## Anatomical models

The original downloads stay in the project root: `skeletal.glb`, `muscular.glb`, `cardiovascular.glb`, `nervous.glb`, `visceral.glb`, `joints.glb`, `lymphatic.glb`, and `License.txt`.

The site serves copies from `public/models/z-anatomy/`. Do not redistribute those files without the attribution in `License.txt`:

- BodyParts3D, Database Center for Life Science, CC BY-SA 2.1 Japan
- Z-Anatomy, CC BY-SA 4.0
- Additional adapted models listed in `License.txt`, including University of Dundee content and a kidney model under CC BY-NC 4.0

These GLBs are not Draco-compressed. The viewer still installs a Draco decoder so a compressed replacement can be loaded later.

The visceral file includes lungs, the digestive organs, kidneys, bladder, testes, prostate, seminal glands, and penis. It does not include a uterus or ovaries.

## Project layout

- `src/pages` — screens
- `src/components/BodyViewer.jsx` — Three.js canvas
- `src/three/anatomyMap.js` — which mesh belongs to which organ and system
- `src/data` — systems, organs, lessons, quizzes, diseases
- `src/lib/structures.js` — tree, trie, graph, linked list, stack, queue
