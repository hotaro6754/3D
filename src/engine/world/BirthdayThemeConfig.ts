export const BirthdayThemeConfig = {
  get enabled() {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('event') === 'sahithi';
  },

  theme: "midnight-sakura",

  lighting: {
    moonColor: 0xe0f2fe, // soft moonlight (#e0f2fe)
    moonIntensity: 1.4,
    ambientColor: 0x64748b, // soft slate/blue-gray ambient fill (#64748b)
    ambientIntensity: 1.3,
    groundColor: 0x334155, // slate-700 horizon/ground fill (#334155)
    lanternColor: 0xfed7aa, // warm peach lantern glow (#fed7aa)
    accentColor: 0xfbbf24 // warm amber lantern accent (#fbbf24)
  },

  sky: {
    top: '#020617',
    middle: '#0f172a',
    horizon: '#1e293b'
  },

  petals: {
    enabled: true,
    densityMultiplier: 1.5
  },

  easterEggs: true,
  plazaReveal: true,
  birthdayName: "SAHITHI",
  videoAsset: "/assets/birthday/sahithi-video.mp4",
  birthdayAudio: "/assets/birthday/fairy-fountain.mp3",
  fairyFountainAudio: "/assets/birthday/fairy-fountain.mp3"
};
