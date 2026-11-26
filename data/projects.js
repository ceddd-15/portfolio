/**
 * Validated Portfolio Projects (Deduplicated & Re-indexed 01–10)
 *
 * Each project optionally supports:
 * - `preview`: Interactive preview module config (`{ type, label }`) rendered by js/previews.js
 * - `previewImage`: Optional path to a real screenshot (e.g. 'assets/project-01.png') for future use
 */

export const PROJECT_CATEGORIES = [
  'All',
  'Web & Full-Stack',
  'Mobile & Desktop',
  'Systems, AI & Hardware',
];

export const PROJECTS_DATA = [
  {
    index: '01',
    category: 'Web & Full-Stack',
    title: 'cedddProjects-WEBDEV',
    repo: 'https://github.com/ceddd-15/cedddProjects-WEBDEV',
    role: 'Solo Full-Stack Developer · Cycling Retail Web App (Web Dev 2 Finals)',
    summary:
      'Built a solo full-stack cycling retail web application (CedCycles) fulfilling the Web Development 2 course final requirement, handling storefront product browsing, cart state, server-side routing, and database persistence end-to-end.',
    stack: ['HTML', 'CSS', 'JavaScript', 'PHP', 'MySQL', 'React', 'Node.js'],
    linkedSkills: ['HTML', 'CSS', 'JavaScript', 'PHP', 'MySQL'],
    preview: {
      type: 'cedcycles-storefront',
      label: 'Interactive Storefront',
    },
    previewImage: null,
  },
  {
    index: '02',
    category: 'Web & Full-Stack',
    title: 'BIOPing_STS-Project',
    repo: 'https://github.com/cedieboy07/BIOPing_STS-Project',
    role: 'Backend Developer · Science, Technology & Society (STS) Prototype',
    summary:
      'Built the backend services, API endpoints, and database structure for an STS course prototype.',
    stack: ['JavaScript', 'Node.js', 'Firebase', 'REST API'],
    linkedSkills: ['JavaScript', 'Firebase'],
    preview: null,
    previewImage: null,
  },
  {
    index: '03',
    category: 'Mobile & Desktop',
    title: 'activity6_MOBAPP2',
    repo: 'https://github.com/mimirasol/activity6_MOBAPP2',
    role: 'Auth, Cart & Checkout Developer · Mobile App Dev 2 Finals',
    summary:
      'Implemented user authentication flows, shopping cart state management, and the end-to-end checkout flow for the group final project.',
    stack: ['Dart', 'Flutter', 'Firebase Auth', 'Firestore'],
    linkedSkills: ['Dart', 'Firebase'],
    preview: null,
    previewImage: null,
  },
  {
    index: '04',
    category: 'Mobile & Desktop',
    title: 'kachingko',
    repo: 'https://github.com/YordaSensei/kachingko',
    role: 'Feature Developer (Monthly Spending Overview) · OOP Finals',
    summary:
      'Developed the monthly spending overview module in a Java desktop application built in NetBeans for the Object-Oriented Programming course.',
    stack: ['Java', 'NetBeans', 'Swing', 'OOP'],
    linkedSkills: ['SQLite'],
    preview: null,
    previewImage: null,
  },
  {
    index: '05',
    category: 'Mobile & Desktop',
    title: 'comProg_finals',
    repo: 'https://github.com/ceddd-15/comProg_finals',
    role: 'Co-Developer (File Handling & Kiosk Logic) · Computer Programming Finals',
    summary:
      'Co-developed a 2-person C++ console application, handling persistent file I/O operations and the core interactive kiosk workflow.',
    stack: ['C++', 'File I/O', 'CLI'],
    linkedSkills: ['C++'],
    preview: null,
    previewImage: null,
  },
  {
    index: '06',
    category: 'Systems, AI & Hardware',
    title: 'SoundCheck',
    repo: 'https://github.com/YordaSensei/SoundCheck',
    role: 'Hardware Lead · Technopreneurship Prototype (Presented at CESCON)',
    summary:
      'Handled hardware assembly for a working app-and-hardware prototype presented at CESCON—including soldering, wiring, circuit integration, and physical hardware testing.',
    stack: ['Hardware Assembly', 'Soldering', 'Circuit Wiring', 'Sensors'],
    linkedSkills: ['Soldering'],
    preview: null,
    previewImage: null,
  },
  {
    index: '07',
    category: 'Systems, AI & Hardware',
    title: 'Hakton_TableTop',
    repo: 'https://github.com/Diggeh/Hakton_TableTop',
    role: 'Connectivity, Assets & QA Co-Lead · Software Engineering 2 Finals',
    summary:
      'Managed session hosting and multiplayer connectivity, organized game asset pipelines, and executed integrated testing and performance optimization alongside one teammate.',
    stack: ['Multiplayer Networking', 'Asset Pipeline', 'Integration QA'],
    linkedSkills: [],
    preview: {
      type: 'hakton-tabletop',
      label: 'Multiplayer Lobby & Board',
    },
    previewImage: null,
  },
  {
    index: '08',
    category: 'Systems, AI & Hardware',
    title: 'Software-Engineering-Finals (KAIN)',
    repo: 'https://github.com/Diggeh/Software-Engineering-Finals',
    role: 'Sound Design & Progress Tracking · Software Engineering 1 Finals',
    summary:
      'Implemented audio integration, sound design cues, and player progression tracking across game stages for the group final project.',
    stack: ['React', 'Phaser', 'Zustand', 'Audio Systems'],
    linkedSkills: ['JavaScript'],
    preview: {
      type: 'kain-culinary',
      label: 'Culinary Puzzle Stage',
    },
    previewImage: null,
  },
  {
    index: '09',
    category: 'Systems, AI & Hardware',
    title: 'memore-rpg',
    repo: 'https://github.com/chzaltdel/memore-rpg',
    role: 'C++ Port Developer · Programming Languages Finals',
    summary:
      "Ported the group's Python RPG project into a standalone C++ build while maintaining shared game data structures and core mechanics.",
    stack: ['C++', 'Python', 'File Parsing', 'CLI'],
    linkedSkills: ['C++'],
    preview: null,
    previewImage: null,
  },
  {
    index: '10',
    category: 'Systems, AI & Hardware',
    title: 'Arnis Movement Tracking, Storage & Recognition',
    repo: 'https://github.com/cedieboy07/Arnis-Movement-Tracking-Storage-and-Recognition-System',
    role: 'Move Library & Recorder Lead (src/library.py)',
    summary:
      'Developed the Move Library & Recorder module (src/library.py on feature/library) to capture, structure, and store Arnis strike sequences for recognition training.',
    stack: ['Python', 'PyTorch', 'OpenCV', 'Git'],
    linkedSkills: [],
    preview: null,
    previewImage: null,
  },
];
