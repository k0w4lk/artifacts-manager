export const ATK_PERCENT = 'Сила атаки';
export const HP_PERCENT = 'НР';
export const DEF_PERCENT = 'Защита';
export const ENERGY_RECHARGE = 'Восст. энергии';
export const ELEMENTAL_MASTERY = 'Мастерство стихий';
export const CRIT_DMG = 'Крит. урон';
export const CRIT_RATE = 'Шанс крит. попадания';
export const HEALING_BONUS = 'Бонус лечения';

export const ANEMO_AMPLIFICATION = 'Бонус Анемо урона';
export const GEO_AMPLIFICATION = 'Бонус Гео урона';
export const ELECTRO_AMPLIFICATION = 'Бонус Электро урона';
export const DENDRO_AMPLIFICATION = 'Бонус Дендро урона';
export const HYDRO_AMPLIFICATION = 'Бонус Гидро урона';
export const PYRO_AMPLIFICATION = 'Бонус Пиро урона';
export const CRYO_AMPLIFICATION = 'Бонус Крио урона';
export const PHYS_AMPLIFICATION = 'Бонус физ. урона';

export const ATK_FLAT = 'Сила атаки';
export const HP_FLAT = 'НР';

export const CLOCK_STATS = [
  ATK_PERCENT,
  HP_PERCENT,
  DEF_PERCENT,
  ENERGY_RECHARGE,
  ELEMENTAL_MASTERY,
];

export const GOBLET_STATS = [
  ATK_PERCENT,
  HP_PERCENT,
  DEF_PERCENT,
  ELEMENTAL_MASTERY,
  ANEMO_AMPLIFICATION,
  GEO_AMPLIFICATION,
  ELECTRO_AMPLIFICATION,
  DENDRO_AMPLIFICATION,
  HYDRO_AMPLIFICATION,
  PYRO_AMPLIFICATION,
  CRYO_AMPLIFICATION,
  PHYS_AMPLIFICATION,
];

export const CROWN_STATS = [
  ATK_PERCENT,
  HP_PERCENT,
  DEF_PERCENT,
  ELEMENTAL_MASTERY,
  CRIT_DMG,
  CRIT_RATE,
  HEALING_BONUS,
];

export const ALL_STATS = [
  ATK_PERCENT,
  HP_PERCENT,
  DEF_PERCENT,
  ENERGY_RECHARGE,
  ELEMENTAL_MASTERY,
  CRIT_DMG,
  CRIT_RATE,
  HEALING_BONUS,
  ANEMO_AMPLIFICATION,
  GEO_AMPLIFICATION,
  ELECTRO_AMPLIFICATION,
  DENDRO_AMPLIFICATION,
  HYDRO_AMPLIFICATION,
  PYRO_AMPLIFICATION,
  CRYO_AMPLIFICATION,
  PHYS_AMPLIFICATION,
  ATK_FLAT,
  HP_FLAT,
];

export enum ArtefactSetPart {
  FLOWER_OF_LIFE = 'Цветок жизни',
  FEATHER_OF_DEATH = 'Перо смерти',
  SANDS_OF_TIME = 'Пески времени',
  CUP_OF_SPACE = 'Кубок простраства',
  CORONA_OF_MIND = 'Корона разума',
}

export const PART_MAIN_STATS_MAP = new Map<ArtefactSetPart, string[]>([
  [ArtefactSetPart.FLOWER_OF_LIFE, [HP_PERCENT]],
  [ArtefactSetPart.FEATHER_OF_DEATH, [ATK_PERCENT]],
  [ArtefactSetPart.SANDS_OF_TIME, CLOCK_STATS],
  [ArtefactSetPart.CUP_OF_SPACE, GOBLET_STATS],
  [ArtefactSetPart.CORONA_OF_MIND, CROWN_STATS],
]);