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

export const STATS = [
  {
    key: 'atkPercent',
    name: 'Сила атаки',
  },
  {
    key: 'defPercent',
    name: 'Защита',
  },
  {
    key: 'hpPercent',
    name: 'НР',
  },
  {
    key: 'energyRecharge',
    name: 'Восст. энергии',
  },
  {
    key: 'elementalMastery',
    name: 'Мастерство стихий',
  },
  {
    key: 'critDmg',
    name: 'Крит. урон',
  },
  {
    key: 'critRate',
    name: 'Шанс крит. попадания',
  },
  {
    key: 'healingBonus',
    name: 'Бонус лечения',
  },
  {
    key: 'anemoAmplification',
    name: 'Бонус Анемо урона',
  },
  { key: 'geoAmplification', name: 'Бонус Гео урона' },
  { key: 'electroAmplification', name: 'Бонус Электро урона' },
  { key: 'dendroAmplification', name: 'Бонус Дендро урона' },
  { key: 'hydroAmplification', name: 'Бонус Гидро урона' },
  { key: 'pyroAmplification', name: 'Бонус Пиро урона' },
  { key: 'cryoAmplification', name: 'Бонус Крио урона' },
  { key: 'physAmplification', name: 'Бонус физ. урона' },
  { key: 'atkFlat', name: 'Сила атаки' },
  { key: 'hpFlat', name: 'НР' },
];

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
  CUP_OF_SPACE = 'Кубок пространства',
  CORONA_OF_MIND = 'Корона разума',
}
