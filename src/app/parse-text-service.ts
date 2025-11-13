import { inject, Injectable, signal } from '@angular/core';
import { createWorker } from 'tesseract.js';
import { DataService } from './core/services/data-service';
import { ALL_STATS, ArtefactSetPart } from './core/utils/stat-names';

export interface Artifact {
  setName: string;
  setPartType: string;
  mainStat: Stat | null;
  stats: Map<string, Stat>;
}

export interface Stat {
  key: string | undefined;
  main: boolean;
  name: string;
  value: number;
  percent: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ParseTextService {
  readonly dataService = inject(DataService);

  res = signal<Artifact | null>(null);

  parseImage(file: File): void {
    this.tesseract(file)
      .then((res) => this.res.set(res))
      .catch(() => {
        this.OCRSpace(file).then((res) => this.res.set(res));
      });
  }

  async OCRSpace(file: File): Promise<any> {
    const filePromise = new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        resolve(base64);
      };
      reader.readAsDataURL(file);
    });

    const base64Image = await filePromise;

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

    return fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        apikey: 'K84960388588957',
      },
      body: data,
    })
      .then((res) => res.json())
      .then((res) => {
        const text = res.ParsedResults[0].ParsedText;
        return this.#parse(text);
      });
  }

  async tesseract(file: File): Promise<any> {
    const worker = await createWorker('rus');

    await worker.setParameters({
      preserve_interword_spaces: '1',
    });

    const res = (await worker.recognize(file)).data.text;
    await worker.terminate();

    return this.#parse(res);
  }

  #parse(text: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const setPart = Object.values(ArtefactSetPart).find((part) => text.includes(part)) || '';
      const mainStatRegex = new RegExp(`(${ALL_STATS?.join('|')}).*\\n*(\\d+[,\\s]*\\d*)(%*)`, 'm');

      const statRegex = new RegExp(
        `(${ALL_STATS?.join('|')})(?:\\s*(\\d+)(?=[\\s])|\\s*\\+\\s*(\\d+[,\\d]*\\d*)(%*))`,
        'gm',
      );
      const mainStat = text.match(mainStatRegex);
      text = text.replace(mainStatRegex, '').replace(/\n/g, ' ');
      const setName =
        this.dataService
          .artefactSets()
          .find((art) => text.toLowerCase().includes(art.nameRu.toLowerCase()))?.nameRu || '';

      const stats = text.match(statRegex)?.slice(-4);

      let mainStatRes: Stat | null = null;
      if (mainStat) {
        mainStatRes = {
          key: this.dataService.stats().find((stat) => stat.nameRu === mainStat![1])?.key,
          main: true,
          name: mainStat[1],
          value: +mainStat![2].replace(',', '.'),
          percent: mainStat?.[3] === '%',
        };
      }
      const statsMap: Map<string, Stat> = new Map();
      stats?.forEach((stat: string) => {
        const statIndex = stat.split('').findIndex((char) => /[0-9]/.test(char));
        const statName = stat.substring(0, statIndex).replace('+', '').trim();
        const statValue = stat.substring(statIndex).trim();

        const value = +statValue.replace('%', '').replace(' ', '').replace(',', '.');

        if (Number.isNaN(value)) reject(`Value for stat "${statName}" was parsed with failure`);

        statsMap.set(statName, {
          key: this.dataService
            .stats()
            .find((stat) => stat.nameRu === statName && stat.percent === statValue.includes('%'))
            ?.key,
          main: false,
          name: statName,
          value,
          percent: statValue.includes('%'),
        });
      });
      resolve({ setName, setPartType: setPart, mainStat: mainStatRes, stats: statsMap });
    });
  }
}
