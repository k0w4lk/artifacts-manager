import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { ALL_ARTEFACTS } from './models/art-names';
import {
  CROWN_STATS,
  CLOCK_STATS,
  GOBLET_STATS,
  CRIT_DMG,
  CRIT_RATE,
  ATK_PERCENT,
  HP_PERCENT,
  DEF_PERCENT,
  ENERGY_RECHARGE,
  ELEMENTAL_MASTERY,
  STATS,
  PART_MAIN_STATS_MAP,
} from './models/stat-names';
import { MAXIMUM_ROLL } from './models/maximum-roll';
import { STAT_BOUNDS } from './models/stat-bounds';
import { CHARACTERS } from './data/characters';
import type { Artefact, Character } from './models/types';
import { Artifact, ParseTextService, Stat } from './parse-text-service';

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly parseTextService = inject(ParseTextService);

  protected readonly artefactSets = ALL_ARTEFACTS;
  protected readonly pieces = [
    'Цветок жизни',
    'Перо смерти',
    'Пески времени',
    'Кубок пространства',
    'Корона разума',
  ];
  protected mainStatOptions = signal<string[]>(Array.from(PART_MAIN_STATS_MAP.values()).flat(1));

  readonly artifactForm = new FormGroup({
    setName: new FormControl<string | null>(null),
    setPartType: new FormControl<string | null>(null),
    mainStat: new FormControl<string | null>(null),
    atk: new FormControl<number | null>(null),
    hp: new FormControl<number | null>(null),
    def: new FormControl<number | null>(null),
    er: new FormControl<number | null>(null),
    em: new FormControl<number | null>(null),
    critdmg: new FormControl<number | null>(null),
    critrate: new FormControl<number | null>(null),
  });

  protected searchText = new FormControl<string>('');

  protected results = signal<{ name: string; stat: string; set: string }[]>([]);
  protected backup = signal<{ name: string; stat: string; set: string }[]>([]);

  protected readonly characters = CHARACTERS;

  constructor() {
    effect(() => {
      this.onPieceChange(this.parseTextService.res());
    });
  }

  protected onPieceChange(value: Artifact | null) {
    console.log();
    this.artifactForm.patchValue({
      setName: value?.setName,
      setPartType: value?.setPartType,
      mainStat:
        STATS.find((stat) => {
          return stat.key === Array.from(value?.stats.entries()!)[0][1].key;
        })?.name ?? null,
      atk: value?.stats.get(ATK_PERCENT)?.value ?? null,
      hp: value?.stats.get(HP_PERCENT)?.value ?? null,
      def: value?.stats.get(DEF_PERCENT)?.value ?? null,
      critdmg: value?.stats.get(CRIT_DMG)?.value ?? null,
      critrate: value?.stats.get(CRIT_RATE)?.value ?? null,
      er: value?.stats.get(ENERGY_RECHARGE)?.value ?? null,
      em: value?.stats.get(ELEMENTAL_MASTERY)?.value ?? null,
    });

    console.log(this.artifactForm.value);
  }

  private toArtefact(): Artefact | null {
    const { atk, hp, def, critdmg, critrate, er, em, setName, setPartType, mainStat } =
      this.artifactForm.getRawValue();

    const maxRolls = [
      MAXIMUM_ROLL.ATK_PERCENT,
      MAXIMUM_ROLL.HP_PERCENT,
      MAXIMUM_ROLL.DEF_PERCENT,
      MAXIMUM_ROLL.CRIT_DMG,
      MAXIMUM_ROLL.CRIT_RATE,
      MAXIMUM_ROLL.ENERGY_RECHARGE,
      MAXIMUM_ROLL.ELEMENTAL_MASTERY,
    ];
    const inputs = [atk, hp, def, critdmg, critrate, er, em];
    const names = [
      ATK_PERCENT,
      HP_PERCENT,
      DEF_PERCENT,
      CRIT_DMG,
      CRIT_RATE,
      ENERGY_RECHARGE,
      ELEMENTAL_MASTERY,
    ];

    // basic validation similar to WinForms: no duplicate mainstat with substat present
    for (let i = 0; i < inputs.length; i++) {
      if (inputs[i]! > 0 && names[i] === STATS.find((stat) => stat.name === mainStat)?.name) {
        alert('Верхний и нижний стат повторяться не могут!');
        return null;
      }
    }

    // convert to normalized rolls like C# constructor
    const artefact: Artefact = {
      atk: +(atk ?? 0 / 5).toFixed(3),
      def: +(def ?? 0 / 6.2).toFixed(3),
      hp: +(hp ?? 0 / 5).toFixed(3),
      em: +(em ?? 0 / 20).toFixed(3),
      er: +(er ?? 0 / 5.5).toFixed(3),
      critDmg: +(critdmg ?? 0 / 6.6).toFixed(3),
      critRate: +(critrate ?? 0 / 3.3).toFixed(3),
      set: setName ?? '',
      mainStat:
        STATS.find((stat) => stat.key === STATS.find((stat) => stat.name === mainStat)?.key)
          ?.name ?? '',
      piece: setPartType ?? '',
    };
    return artefact;
  }

  /**
   * Применяет CSS фильтр contrast к изображению и создает новый File
   * @param imageFile - исходный файл изображения
   * @param contrastValue - значение контраста (1 = нормальный, >1 = больше контраста, <1 = меньше контраста)
   * @param quality - качество выходного изображения (0-1)
   * @returns Promise с новым File объектом
   */
  applyContrastFilter(
    imageFile: File,
    contrastValue: number = 1.5,
    quality: number = 1
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      // Проверяем, что файл является изображением
      if (!imageFile.type.startsWith('image/')) {
        reject(new Error('Файл не является изображением'));
        return;
      }

      // Создаем элемент изображения
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Не удалось получить контекст canvas'));
        return;
      }

      // Создаем URL для изображения
      const imageUrl = URL.createObjectURL(imageFile);

      img.onload = () => {
        // Устанавливаем размеры canvas равными размерам изображения
        canvas.width = img.width;
        canvas.height = img.height;

        // Применяем фильтр contrast
        ctx.filter = `grayscale(100%)`;

        // Рисуем изображение на canvas
        ctx.drawImage(img, 0, 0);

        // Освобождаем URL
        URL.revokeObjectURL(imageUrl);

        // Конвертируем canvas в blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Не удалось создать blob из canvas'));
              return;
            }

            // Создаем новый File объект
            const newFileName = `contrast_${imageFile.name}`;
            const newFile = new File([blob], newFileName, {
              type: imageFile.type,
              lastModified: Date.now(),
            });

            resolve(newFile);
          },
          imageFile.type,
          quality
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        reject(new Error('Не удалось загрузить изображение'));
      };

      img.src = imageUrl;
    });
  }

  protected onFileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];

    this.applyContrastFilter(file!).then((res) => {
      this.parseTextService.tesseract(res!);
    });

    // if (file) {
    //   const reader = new FileReader();
    //   reader.onload = (e) => {
    //     const base64 = e.target?.result as string;
    //     this.parseTextService.OCRSpace(base64);
    //   };
    //   reader.readAsDataURL(file);
    // }
  }

  protected calculate() {
    const artefact = this.toArtefact();
    if (!artefact) return;
    const rows: { name: string; stat: string; set: string }[] = [];
    for (const c of this.characters) {
      rows.push({
        name: c.name,
        stat: this.check(artefact, c),
        set: this.setFunction(c, artefact),
      });
    }
    this.results.set(rows);
    this.backup.set(rows.map((r) => ({ ...r })));
  }

  protected clear() {
    this.artifactForm.reset();
  }

  protected search() {
    const text = this.searchText.value?.toLowerCase();
    const all = this.backup();
    if (!text) {
      this.results.set([...all]);
      return;
    }
    const filtered: typeof all = [];
    for (const row of all) {
      if ((row.name + ' ' + row.stat + ' ' + row.set).toLowerCase().includes(text)) {
        filtered.push(row);
      }
    }
    this.results.set(filtered);
  }

  protected colorizeStat(s: string): string {
    if (s === 'Идеально') return 'greenyellow';
    if (s === 'Отлично') return 'yellow';
    if (s === 'Хорошо') return 'orange';
    if (s === '-') return 'white';
    if (s === 'СОВЕРШЕННО!') return 'lightskyblue';
    if (s === 'Так себе') return 'red';
    return 'black';
  }

  protected colorizeSet(s: string): string {
    if (s === 'Сетник') return 'greenyellow';
    if (s === 'Альтернатива') return 'lightblue';
    if (s === 'Солянка') return 'orange';
    if (s === 'Оффсетник') return 'deeppink';
    if (s === '-') return 'white';
    return 'black';
  }

  private setFunction(character: Character, a: Artefact): string {
    const { setName } = this.artifactForm.getRawValue();

    if (!setName) return 'Введи сет';
    let error = true;
    if (a.piece === 'Пески времени')
      error = character.clockStats.includes(a.mainStat) ? false : true;
    if (a.piece === 'Кубок пространства')
      error = character.gobletStats.includes(a.mainStat) ? false : true;
    if (a.piece === 'Корона разума')
      error = character.crownStats.includes(a.mainStat) ? false : true;
    if (a.piece === 'Цветок жизни' || a.piece === 'Перо смерти') error = false;
    if (error) return '-';

    if (character.mainSets.includes(setName)) return 'Сетник';
    if (character.altSets.includes(setName)) return 'Альтернатива';
    if (character.subSets.includes(setName)) return 'Солянка';
    return 'Оффсетник';
  }

  private check(a: Artefact, c: Character): string {
    let first = 0;
    let second = 0;
    let third = 0;

    let mainstatus = false;
    for (const stat of c.perfectStats) {
      if (a.mainStat === stat) {
        mainstatus = true;
        break;
      }
    }

    if (a.piece === 'Пески времени' && !c.clockStats.includes(a.mainStat)) return '-';
    if (a.piece === 'Кубок пространства' && !c.gobletStats.includes(a.mainStat)) return '-';
    if (a.piece === 'Корона разума' && !c.crownStats.includes(a.mainStat)) return '-';

    for (const stat of c.perfectStats) {
      if (stat === CRIT_DMG) first += a.critDmg;
      else if (stat === CRIT_RATE) first += a.critRate;
      else if (stat === ATK_PERCENT) first += a.atk;
      else if (stat === HP_PERCENT) first += a.hp;
      else if (stat === DEF_PERCENT) first += a.def;
      else if (stat === ENERGY_RECHARGE) first += a.er;
      else if (stat === ELEMENTAL_MASTERY) first += a.em;
    }
    for (const stat of c.goodStats) {
      if (stat === CRIT_DMG) second += a.critDmg;
      else if (stat === CRIT_RATE) second += a.critRate;
      else if (stat === ATK_PERCENT) second += a.atk;
      else if (stat === HP_PERCENT) second += a.hp;
      else if (stat === DEF_PERCENT) second += a.def;
      else if (stat === ENERGY_RECHARGE) second += a.er;
      else if (stat === ELEMENTAL_MASTERY) second += a.em;
    }
    for (const stat of c.okStats) {
      if (stat === CRIT_DMG) third += a.critDmg;
      else if (stat === CRIT_RATE) third += a.critRate;
      else if (stat === ATK_PERCENT) third += a.atk;
      else if (stat === HP_PERCENT) third += a.hp;
      else if (stat === DEF_PERCENT) third += a.def;
      else if (stat === ENERGY_RECHARGE) third += a.er;
      else if (stat === ELEMENTAL_MASTERY) third += a.em;
    }

    second += third / 2;

    if (first - Math.trunc(first) > 0.8) first = Math.trunc(first) + 1;
    else if (first - Math.trunc(first) > 0.4) {
      first = Math.trunc(first);
      second += 1;
    } else {
      second += (first - Math.trunc(first)) / 2;
      first = Math.trunc(first);
    }

    if (second - Math.trunc(second) > 0.8) second = Math.trunc(second) + 1;
    else second = Math.trunc(second);

    if (a.piece === 'Цветок жизни' || a.piece === 'Перо смерти') {
      if (first < 3) return '-';
      else if (first === 3) return second >= 2 ? 'Так себе' : '-';
      else if (first === 4) return second >= 2 ? 'Хорошо' : 'Так себе';
      else if (first === 5) return second >= 2 ? 'Отлично' : 'Хорошо';
      else if (first === 6) return second >= 2 ? 'Идеально' : 'Отлично';
      else if (first === 7) return second >= 2 ? 'СОВЕРШЕННО!' : 'Идеально';
      else return 'СОВЕРШЕННО!';
    } else if (a.piece === 'Пески времени') {
      if (mainstatus) {
        if (second / 2 >= 1) {
          first += second / 2 - (second / 2 - Math.trunc(second / 2));
          second = second - Math.trunc(second / 2) * 2;
        }
        if (first < 3) return '-';
        else if (first === 3) return second >= 1 ? 'Так себе' : '-';
        else if (first === 4) return second >= 1 ? 'Хорошо' : 'Так себе';
        else if (first === 5) return second >= 1 ? 'Отлично' : 'Хорошо';
        else if (first === 6) return second >= 1 ? 'Идеально' : 'Отлично';
        else if (first === 7) return second >= 1 ? 'СОВЕРШЕННО!' : 'Идеально';
        else return 'СОВЕРШЕННО!';
      } else {
        if (first < 2) return '-';
        else if (first === 2) return second >= 3 ? 'Так себе' : '-';
        else if (first === 3) return second >= 3 ? 'Хорошо' : second >= 1 ? 'Так себе' : '-';
        else if (first === 4) return second >= 3 ? 'Отлично' : second >= 1 ? 'Хорошо' : 'Так себе';
        else if (first === 5) return second >= 3 ? 'Идеально' : second >= 1 ? 'Отлично' : 'Хорошо';
        else if (first === 6)
          return second >= 3 ? 'СОВЕРШЕННО!' : second >= 1 ? 'Идеально' : 'Отлично';
        else if (first === 7) return second >= 1 ? 'СОВЕРШЕННО!' : 'Идеально';
        else return 'СОВЕРШЕННО!';
      }
    } else if (a.piece === 'Кубок пространства') {
      if (mainstatus) {
        if (second / 2 >= 1) {
          first += second / 2 - (second / 2 - Math.trunc(second / 2));
          second = second - Math.trunc(second / 2) * 2;
        }
        if (first < 3) return '-';
        else if (first === 3) return 'Так себе';
        else if (first === 4) return 'Хорошо';
        else if (first === 5) return 'Отлично';
        else if (first === 6) return 'Идеально';
        else if (first === 7) return 'СОВЕРШЕННО!';
        else return 'СОВЕРШЕННО!';
      } else {
        if (first < 2) return '-';
        else if (first === 2) return second >= 2 ? 'Так себе' : '-';
        else if (first === 3) return second >= 2 ? 'Хорошо' : 'Так себе';
        else if (first === 4) return second >= 2 ? 'Отлично' : 'Хорошо';
        else if (first === 5) return second >= 2 ? 'Идеально' : 'Отлично';
        else if (first === 6) return second >= 2 ? 'СОВЕРШЕННО!' : 'Идеально';
        else return 'СОВЕРШЕННО!';
      }
    } else if (a.piece === 'Корона разума') {
      if (mainstatus) {
        if (second / 2 >= 1) {
          first += second / 2 - (second / 2 - Math.trunc(second / 2));
          second = second - Math.trunc(second / 2) * 2;
        }
        if (first < 2) return '-';
        else if (first === 2) return second >= 1 ? 'Так себе' : '-';
        else if (first === 3) return second >= 1 ? 'Хорошо' : 'Так себе';
        else if (first === 4) return second >= 1 ? 'Отлично' : 'Хорошо';
        else if (first === 5) return second >= 1 ? 'Идеально' : 'Отлично';
        else if (first === 6) return second >= 1 ? 'СОВЕРШЕННО!' : 'Идеально';
        else return 'СОВЕРШЕННО!';
      } else {
        if (first < 1) return '-';
        else if (first === 1) return second >= 3 ? 'Так себе' : '-';
        else if (first === 2) return second >= 3 ? 'Хорошо' : second >= 1 ? 'Так себе' : '-';
        else if (first === 3) return second >= 3 ? 'Отлично' : second >= 1 ? 'Хорошо' : 'Так себе';
        else if (first === 4) return second >= 3 ? 'Идеально' : second >= 1 ? 'Отлично' : 'Хорошо';
        else if (first === 5)
          return second >= 3 ? 'СОВЕРШЕННО!' : second >= 1 ? 'Идеально' : 'Отлично';
        else if (first === 6) return second >= 1 ? 'СОВЕРШЕННО!' : 'Идеально';
        else return 'СОВЕРШЕННО!';
      }
    }
    return 'Выбери кусок!';
  }
}
