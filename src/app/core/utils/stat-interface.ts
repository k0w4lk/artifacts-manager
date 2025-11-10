export interface Stat {
  id: string;
  key: string;
  nameEn: string;
  nameRu: string;
  repeatable: boolean;
}

export enum StatKey {
  ElectroDmgBonus = 'electroDmgBonus',
  ElementalMastery = 'elementalMastery',
  HealingBonus = 'healingBonus',
  AtkPercent = 'atkPercent',
  CritRate = 'critRate',
  Def = 'def',
  PhysAmplification = 'physAmplification',
  PyroAmplification = 'pyroAmplification',
  HpPercent = 'hpPercent',
  AnemoAmplification = 'anemoAmplification',
  DendroAmplification = 'dendroAmplification',
  GeoAmplification = 'geoAmplification',
  HydroAmplification = 'hydroAmplification',
  CritDmg = 'critDmg',
  EnergyRecharge = 'energyRecharge',
  CryoAmplification = 'cryoAmplification',
  Hp = 'hp',
  DefPercent = 'defPercent',
  Atk = 'atk',
}
