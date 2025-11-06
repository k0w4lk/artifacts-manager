export type Character = {
  nameEn: string;
  mainSets: string[];
  altSets: string[];
  subSets: string[];
  perfectStats: string[];
  goodStats: string[];
  okStats: string[];
  clockStats: string[];
  gobletStats: string[];
  crownStats: string[];
};

export type Artefact = {
  atk: number;
  def: number;
  hp: number;
  em: number;
  er: number;
  critDmg: number;
  critRate: number;
  set: string;
  mainStat: string;
  piece: string;
};
