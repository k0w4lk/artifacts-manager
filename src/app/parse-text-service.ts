import { Injectable, signal } from '@angular/core';
import { ALL_ARTEFACTS } from './models/art-names';
import { ALL_STATS, ArtefactSetPart, PART_MAIN_STATS_MAP } from './models/stat-names';
import { createWorker } from 'tesseract.js';

@Injectable({
  providedIn: 'root',
})
export class ParseTextService {
  res = signal<any>(null);

  main(base64Image: string) {
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
        const setName = ALL_ARTEFACTS.find(art => text.includes(art));
        const setPart = Object.values(ArtefactSetPart).find(part => text.includes(part));
        const mainStats = PART_MAIN_STATS_MAP.get(setPart as ArtefactSetPart);
        const statRegex = new RegExp(`(${ALL_STATS?.join('|')})[\\s|\\n]\\+*(\\d+[,\\s]*\\d*)(%*)`, 'gm');
        const stats = text.match(statRegex);
        const statsMap = new Map<string, {value: number, percent: boolean}>();
        stats?.forEach((stat:string) => {
          const statIndex = stat.split('').findIndex(char => /[0-9]/.test(char));
          const statName = stat.substring(0, statIndex).replace('+', '').trim();
          const statValue = stat.substring(statIndex).trim();
          statsMap.set(statName, {value: +statValue.replace('%', '').replace(' ', '').replace(',', '.'), percent: statValue.includes('%')});
        });
        this.res.set(text);
        console.log(setName, setPart, mainStats, stats, statsMap, text, statRegex);
      });
  }
  tesseract(file: File) {
    (async () => {
      const worker = await createWorker('eng');
      const ret = await worker.recognize(file);
      console.log(ret.data.text);
      await worker.terminate();
    })();
}}
