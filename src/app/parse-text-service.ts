import { inject, Injectable, signal } from '@angular/core';
import { createWorker } from 'tesseract.js';
import { DataService } from './core/services/data-service';
import { ALL_STATS, ArtefactSetPart, STATS } from './core/utils/stat-names';
import { ArtifactSet } from './core/utils/set-interface';

export interface Artifact {
  setName: string;
  setPartType: string;
  stats: Map<string, Stat>;
}

export interface Stat {
  key: keyof typeof STATS;
  value: number;
  percent: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ParseTextService {
  readonly artefactService = inject(DataService);

  res = signal<Artifact | null>(null);

  OCRSpace(base64Image: string) {
    const config = {
      language: 'rus',
      isOverlayRequired: false,
      iscreatesearchablepdf: false,
      issearchablepdfhidetextlayer: false,
      OCREngine: 2,
      base64Image,
      filetype: 'png',
    };

    const data = new FormData();

    Object.entries(config).forEach(([k, v]) => {
      data.append(k, v as any);
    });

    fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        apikey: 'K84960388588957',
      },
      body: data,
    })
      .then((res) => res.json())
      .then((res) => {
        const text = res.ParsedResults[0].ParsedText;
        this.#parse(text);
      });
  }

  tesseract(file: File) {
    (async () => {
      const worker = await createWorker('rus');

      await worker.setParameters({
        preserve_interword_spaces: '1',
      });

      const ret = await worker.recognize(file);

      this.#parse(ret.data.text);
      await worker.terminate();
    })();
  }

  #parse(text: string) {
    const setName =
      this.artefactService.artefactSets().find((art) => text.includes(art.nameRu))?.nameRu || '';
    const setPart = Object.values(ArtefactSetPart).find((part) => text.includes(part)) || '';
    const mainStatRegex = new RegExp(`(${ALL_STATS?.join('|')}).*\\n*(\\d+[,\\s]*\\d*)(%*)`, 'm');
    const statRegex = new RegExp(
      `(${ALL_STATS?.join('|')})[\\s|\\n]\\+*(\\d+[,\\s]*\\d*)(%*)`,
      'gm'
    );
    const mainStat = text.match(mainStatRegex);

    const stats = text.match(statRegex)?.slice(-4);

    const statsMap = new Map<string, Stat>();
    statsMap.set(mainStat![1], {
      key: STATS.find((stat) => stat.name === mainStat![1])?.key as keyof typeof STATS,
      value: +mainStat![2].replace(',', '.'),
      percent: mainStat?.[3] === '%',
    });
    stats?.forEach((stat: string) => {
      const statIndex = stat.split('').findIndex((char) => /[0-9]/.test(char));
      const statName = stat.substring(0, statIndex).replace('+', '').trim();
      const statValue = stat.substring(statIndex).trim();
      statsMap.set(statName, {
        key: STATS.find((stat) => stat.name === statName)?.key as keyof typeof STATS,
        value: +statValue.replace('%', '').replace(' ', '').replace(',', '.'),
        percent: statValue.includes('%'),
      });
    });
    this.res.set({ setName, setPartType: setPart, stats: statsMap });
  }
}
