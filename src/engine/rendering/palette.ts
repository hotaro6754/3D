/**
 * One place for every colour in the scene.
 * The palette is deliberately narrow: warm off-whites, a gray-purple road,
 * teal-leaning greens, pale pinks, and four saturated accents (red / yellow /
 * blue / teal) reserved for focal objects.
 *
 * RESTORED from original Sakura Crossing palette.
 * Minimal Harshith District adjustments: accent colors only (teal, glass).
 * Base tones MUST stay bright/pastel or the toon shader pipeline breaks.
 */
export const PAL: Record<string, number> = {
  // --- sky & atmosphere ---
  skyTop: 0x8fbdea,
  skyMid: 0xd4e8fa,
  skyHaze: 0xfbe7e9,
  cloud: 0xfdfaf8,
  cloudShade: 0xe6e6f2,
  fog: 0xe6ecf7,
  hill: 0xc6cfe6,
  hillFar: 0xd8dded,

  // --- light ---
  sun: 0xfff1d8,
  fill: 0xa9bdf5,
  hemiSky: 0xdcecff,
  hemiGround: 0xb6a6c6,

  // --- ink ---
  ink: 0x39324f,
  inkSoft: 0x4a4468,

  // --- ground ---
  road: 0x8e8a9c,
  roadWorn: 0x9a95a6,
  roadDark: 0x7b7689,
  lineWhite: 0xf4f2f6,
  lineYellow: 0xf0c341,
  tactile: 0xf2c53d,
  sidewalk: 0xdcd8e2,
  sidewalkAlt: 0xe7e2e6,
  curb: 0xc7c2d0,
  concrete: 0xd9d5dd,
  concreteMid: 0xc2bdc8,
  concreteDark: 0xa7a2b0,
  gutter: 0xbdb8c4,
  drain: 0x6d687a,
  dirt: 0xc9bfae,
  gravel: 0xa9a3ab,
  ballast: 0x7d7686,

  // --- buildings ---
  wallWhite: 0xfaf6ef,
  wallCream: 0xf2e7d3,
  wallBlue: 0xd6e3ee,
  wallBeige: 0xe7dbc4,
  wallGray: 0xdedee6,
  wallPink: 0xf0dcda,
  wallTea: 0xdccdb6,
  wallSage: 0xdde2d6,
  roofSlate: 0x59617a,
  roofBlue: 0x4d5c78,
  roofBrown: 0x6b585c,
  roofTeal: 0x4f6b70,
  trim: 0x8b8496,
  glass: 0x9dc0d4,
  glassDark: 0x53627a,
  shutter: 0x6e6a7a,
  shutterLight: 0x847f92,

  // --- accents (Harshith District identity) ---
  red: 0xe0453f,
  redDeep: 0xb5322f,
  redSoft: 0xef6a60,
  yellow: 0xf4c033,
  yellowDeep: 0xd39c1f,
  black: 0x322e3b,
  blackSoft: 0x453f4f,
  teal: 0x2f9c9a,
  tealDeep: 0x22736f,
  blue: 0x3d6ec4,
  blueDeep: 0x2a4f97,
  orange: 0xef8a3c,
  purple: 0x8f6fb5,

  // --- vegetation ---
  leaf: 0x5aa578,
  leafDeep: 0x3f7f60,
  leafPale: 0x84bd97,
  grass: 0x86ab84,
  trunk: 0x9a8082,
  trunkDark: 0x765f62,

  // --- cherry blossom ---
  blossom: 0xfbc6d8,
  blossomLight: 0xfff0f4,
  blossomWarm: 0xfedde2,
  blossomDeep: 0xf0a3c0,
  petal: 0xfcd9e4,
  petalDeep: 0xf6bccf,

  // --- railway ---
  railMetal: 0x6b6472,
  railHead: 0xc2bcc4,
  sleeper: 0x6d6576,
  sleeperLight: 0x847b8c,
  gateYellow: 0xf4c033,
  gateBlack: 0x322e3b,
  signalRed: 0xf2453c,
  signalOff: 0x6a3b44,
  cabinet: 0xd8d5da,
  cabinetTop: 0xb6b2bc,

  // --- train ---
  trainBody: 0xf7f2e6,
  trainBodyShade: 0xe6dfd0,
  trainStripe: 0x2f7fd0,
  trainStripe2: 0x3fae9a,
  trainWindow: 0x3a4258,
  trainWindowLit: 0x6b7794,
  trainSkirt: 0x9aa0ad,
  trainRoof: 0xbdb8bd,
  trainDoor: 0xeae4d8,

  // --- metal / misc props ---
  metal: 0xb8bcc6,
  metalDark: 0x878b96,
  metalWarm: 0xc9c0b4,
  mirrorBack: 0xe4a83c,
  mirrorFace: 0xc8d8e4,
  vendWhite: 0xf8f5f0,
  vendRed: 0xdb4038,
  vendTeal: 0x2e9a98,
  crate: 0x3f7fbf,
  crateAlt: 0xe25a4a,
  basket: 0xdb5a4a,
  bin: 0x5d8fb8,
  taxiYellow: 0xf5be2a,
  taxiYellowDeep: 0xdc9f18,
  cat: 0xf0e6da,
  catDark: 0x6a5f63,
  umbrella: 0xd8ecf4,
  shrineStone: 0xcfcad2,
  shrineBib: 0xd8453f,

  // --- ground ---
  clay: 0xcfb59c,
  clayLine: 0xe8dcc8,
  sand: 0xdccaa6,
  moss: 0x7d9c74,

  // --- water ---
  water: 0x93b8ce,
  waterDeep: 0x6d90ad,
  waterSky: 0xcadff0,
  waterPetal: 0xf3cada,

  // --- stone ---
  stone: 0xc6c0cb,
  stoneDark: 0xa39daf,
  stoneWarm: 0xcfc6bc,

  // --- school ---
  schoolWall: 0xf7f3ea,
  schoolWallAlt: 0xe4ebf2,
  schoolWallBlue: 0xd3e0ec,
  schoolTrim: 0xcfd6de,
  schoolRoof: 0x4d5468,
  gymWall: 0xedeff4,
  gymRoof: 0x59606f,
  blackboard: 0x3d5148,
  deskTop: 0xd8c29c,
  locker: 0xb7c7d5,
  curtain: 0xf4ead9,
  corridor: 0xd8d2c6,

  // --- shrine ---
  torii: 0xd8412f,
  toriiDeep: 0xa72f23,
  shrineWood: 0xa9744f,
  shrineWoodDark: 0x8a604a,
  shrineRoof: 0x69707e,
  rope: 0xf0e5ca,
  ema: 0xe9d9b6,
  bamboo: 0x94b06b,
  bambooDeep: 0x6f8c50,
  cedar: 0x3f6b52,
  cedarDeep: 0x2f5540,
  cedarLit: 0x64906b,
  cedarBark: 0x7e6150,

  // --- shopping street ---
  awningGreen: 0x4f8f6a,
  awningOrange: 0xe08a3c,
  awningBlue: 0x4a7fae,
  awningCream: 0xefe0c2,
  lantern: 0xf6e2c0,
  lanternLit: 0xffd9a0,
  noren: 0x2f4a72,
  norenRed: 0xb5322f,
  norenCream: 0xf2e8d6,
  freezer: 0xd8e6ee,

  // --- onsen street ---
  onsenWood: 0x8a6647,
  onsenWoodDark: 0x513a28,
  onsenWoodPale: 0xc4a074,
  onsenPlaster: 0xe8dfd0,
  onsenPlasterAlt: 0xd9cdba,
  onsenTile: 0x454452,
  onsenTileEdge: 0x5c5a6a,
  onsenSlab: 0xcac4c6,
  onsenWater: 0xb9d0d4,
  onsenWaterDeep: 0x8fb0b6,
  onsenSteam: 0xf4eef0,
  onsenIndigo: 0x2c3a52,

  // --- hill ---
  hillGrassSun: 0xb4c98e,
  hillGrass: 0x9fbc90,
  hillGrassDeep: 0x7a9c78,
  hillBracken: 0xc6bf86,
  hillLitter: 0x7e8163,
  hillEarth: 0xbdb2a2,
  hillRock: 0xb4aeb6,
  hillMoss: 0x83a06d,
  hillPath: 0xc8b69a,
  hillPathStone: 0xc0bcc4,
  tunnelFace: 0xc7c2ca,
  tunnelFaceDark: 0xaba7b3,
  tunnelBore: 0x565269,
  tunnelBoreDeep: 0x322f42,

  // --- lake ---
  lakeSky: 0xcfe3f2,
  lakeShallow: 0x9dc4bd,
  lakeWater: 0x7ba6bd,
  lakeDeep: 0x5f83a4,
  lakeGlint: 0xf2f7fa,
  lakeHillEcho: 0x86a8a8,
  lakeBloomEcho: 0xe6c3cf,
  lakeBed: 0x9aae9e,
  lakeShore: 0xcfc6b4,
  willow: 0xa8c489,
  boatWhite: 0xf0ece2,
  boatBlue: 0xa8c6d8,
  boatYellow: 0xe8d295,
  boatRed: 0xcf6a5e,
  boatTeal: 0x77b3ad,
  boatDeck: 0xc9b492,
  tentCream: 0xe4dcc6,
  tentGreen: 0xb8c4a6,
  tentBlue: 0xb4c6d2,
  tentOchre: 0xcbb08a,
};

/** Bright can/bottle colours for vending machine shelves. */
export const DRINKS: number[] = [
  0xe0453f, 0xf4c033, 0x3d6ec4, 0x2f9c9a, 0xef8a3c, 0x8f6fb5,
  0x5aa578, 0xf4f2f6, 0xe86f9c, 0x44b4d8, 0xc94f7a, 0x9dbb3c,
];
