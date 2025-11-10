export interface SetPart {
  id: string;
  key: string;
  nameEn: string;
  nameRu: string;
  mainStats: string[];
  sequence: number;
}

export enum SetPartKey {
  Flower = 'flowerOfLife',
  Circlet = 'circletOfLogos',
  Goblet = 'gobletOfEonothem',
  Sands = 'sandsOfEon',
  Plume = 'plumeOfDeath',
}
