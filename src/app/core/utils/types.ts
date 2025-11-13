import { ArtifactSet } from './set-interface';
import { SetPart } from './set-part-interface';
import { Stat } from './stat-interface';

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
  atkPercent: number | null;
  defPercent: number | null;
  hpPercent: number | null;
  atk: number | null;
  def: number | null;
  hp: number | null;
  elementalMastery: number | null;
  energyRecharge: number | null;
  critDmg: number | null;
  critRate: number | null;
  set: ArtifactSet | null;
  mainStat: string | null;
  setPartType: SetPart | null;
};
