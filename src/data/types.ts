export interface HeroStats {
  level: string;
  class: string;
  guild: string;
}

export interface HeroData {
  name_first: string;
  name_last: string;
  title: string;
  bio_intro: string;
  bio_details: string;
  badges: string[];
  stats: HeroStats;
}

export interface ProjectData {
  id: string;
  name: string;
  desc: string;
  link: string;
  tags: string[];
  sfx: string;
  css_classes: string;
}

export interface QuestData {
  role: string;
  company: string;
  duration: string;
  desc: string;
}

export interface AchievementData {
  name: string;
  issuer: string;
  link: string;
}

export interface TrophyData {
  name: string;
  award: string;
  highlight: boolean;
}

export interface SkillGroup {
  category: string;
  items: string[];
}

export interface SecurityData {
  profile: string;
  roadmap: string[];
}

export interface SocialsData {
  email: string;
  github: string;
  linkedin: string;
}

export interface PortfolioContent {
  hero: HeroData;
  projects: ProjectData[];
  quests: QuestData[];
  achievements: AchievementData[];
  trophies: TrophyData[];
  socials: SocialsData;
  skills: SkillGroup[];
  security: SecurityData;
}
