/**
 * Engineering Build Notes (Verbatim)
 */

export const NOTES_DATA = [
  {
    index: '01',
    title: 'Porting memore-rpg from Python to C++',
    body: 'Translating dynamic Python data structures and turn-based state loops into deterministic C++ while keeping shared asset schemas intact. By isolating explicit C++ headers and structs from the shared game data directory, the compiled binary preserved combat rules, item lookups, and dialogue progression without runtime interpreter overhead.',
    defaultOpen: true,
  },
  {
    index: '02',
    title: 'Building the SoundCheck Hardware Prototype for CESCON',
    body: 'Moving from breadboard schematics to soldered joints, clean wire routing, and physical reliability testing ahead of live convention demos. Every connection was continuity-checked and stress-tested so the physical unit synced reliably with the companion SoundCheck software during CESCON evaluations.',
    defaultOpen: false,
  },
  {
    index: '03',
    title: 'Session Hosting & Integration Testing on Hakton_TableTop',
    body: 'Stabilizing peer connectivity, organizing shared asset loading, and running end-to-end optimization passes under finals deadlines. Coordinating asset pipelines alongside session state synchronization prevented desyncs and reduced load overhead across multiplayer rooms.',
    defaultOpen: false,
  },
];
