import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data-service';
import { Result } from '../../core/utils/result-interface';
import {
  ATK_PERCENT,
  CRIT_DMG,
  CRIT_RATE,
  DEF_PERCENT,
  ELEMENTAL_MASTERY,
  ENERGY_RECHARGE,
  HP_PERCENT,
  STATS,
} from '../../core/utils/stat-names';
import { Artefact, Character } from '../../core/utils/types';
import { Artifact, ParseTextService } from '../../parse-text-service';
import { ExtractStatsPipe } from '../../ui/pipes/extract-stats-pipe';
import { Results } from '../results/results';

@Component({
  selector: 'app-stats-counter',
  imports: [ReactiveFormsModule, Results],
  templateUrl: './stats-counter.html',
  styleUrl: './stats-counter.css',
})
export class StatsCounter {
  readonly dataService = inject(DataService);
  readonly parseTextService = inject(ParseTextService);

  readonly extractStatsPipe = new ExtractStatsPipe();

  readonly artifactForm = new FormGroup({
    setName: new FormControl<string | null>(null),
    setPartType: new FormControl<string | null>(null),
    mainStat: new FormControl<string | null>(null),
    atkPercent: new FormControl<number | null>(5.4),
    hpPercent: new FormControl<number | null>(4.1),
    defPercent: new FormControl<number | null>(null),
    atk: new FormControl<number | null>(null),
    hp: new FormControl<number | null>(null),
    def: new FormControl<number | null>(null),
    er: new FormControl<number | null>(4.5),
    em: new FormControl<number | null>(null),
    critDmg: new FormControl<number | null>(null),
    critRate: new FormControl<number | null>(2.7),
  });

  readonly #currentSetPart = toSignal(this.artifactForm.controls.setPartType.valueChanges);

  readonly partMainStats = computed(() => {
    const mainStatsIds = this.dataService
      .setParts()
      .find((p) => p.nameRu === this.#currentSetPart())?.mainStats;
    const mainStatNames = this.dataService.stats().filter((s) => !!mainStatsIds?.includes(s.id));
    return mainStatNames;
  });

  protected searchText = new FormControl<string>('');

  protected results = signal<Result[]>([]);
  protected backup = signal<Result[]>([]);

  readonly displayedResults = computed(() => this.results().filter((res) => Boolean(res.setType)));

  constructor() {
    effect(() => {
      this.onPieceChange(this.parseTextService.res());
    });
  }

  protected onPieceChange(value: Artifact | null) {
    this.artifactForm.patchValue({
      setName: value?.setName,
      setPartType: value?.setPartType ?? 'Цветок жизни',
      mainStat:
        STATS.find((stat) => {
          return stat.key === Array.from(value?.stats?.entries() || [])?.[0]?.[1]?.key;
        })?.name ?? 'НР',
      atkPercent: value?.stats.get(ATK_PERCENT)?.value ?? 4.1,
      hpPercent: value?.stats.get(HP_PERCENT)?.value ?? 4.1,
      defPercent: value?.stats.get(DEF_PERCENT)?.value ?? null,
      critDmg: value?.stats.get(CRIT_DMG)?.value ?? null,
      critRate: value?.stats.get(CRIT_RATE)?.value ?? 5.4,
      er: value?.stats.get(ENERGY_RECHARGE)?.value ?? 4.5,
      em: value?.stats.get(ELEMENTAL_MASTERY)?.value ?? null,
    });
  }

  /**
   * Применяет CSS фильтр contrast к изображению и создает новый File
   * @param imageFile - исходный файл изображения
   * @param contrastValue - значение контраста (1 = нормальный, >1 = больше контраста, <1 = меньше контраста)
   * @param quality - качество выходного изображения (0-1)
   * @returns Promise с новым File объектом
   */
  applyContrastFilter(imageFile: File, quality: number = 1): Promise<File> {
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

  calculate() {
    this.#checkMainStatDuplicate();

    const formData = this.artifactForm.getRawValue();

    const artefact: Artefact = {
      atkPercent: +(formData.atkPercent ?? 0 / 5).toFixed(3),
      defPercent: +(formData.defPercent ?? 0 / 6.2).toFixed(3),
      hpPercent: +(formData.hpPercent ?? 0 / 5).toFixed(3),
      atk: +(formData.atk ?? 0 / 16.5).toFixed(3),
      def: +(formData.def ?? 0 / 19.5).toFixed(3),
      hp: +(formData.hp ?? 0 / 254).toFixed(3),
      em: +(formData.em ?? 0 / 20).toFixed(3),
      er: +(formData.er ?? 0 / 5.5).toFixed(3),
      critDmg: +(formData.critDmg ?? 0 / 6.6).toFixed(3),
      critRate: +(formData.critRate ?? 0 / 3.3).toFixed(3),
      setName: formData.setName ?? '',
      mainStat:
        STATS.find(
          (stat) => stat.key === STATS.find((stat) => stat.name === formData.mainStat)?.key
        )?.name ?? '',
      setPartType: formData.setPartType ?? '',
    };

    const rows: Result[] = [];
    for (const c of this.dataService.characters()) {
      rows.push({
        char: c.nameEn,
        profit: this.#setProfit(artefact, c),
        setType: this.setFunction(c, artefact),
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
      if ((row.char + ' ' + row.profit + ' ' + row.setType).toLowerCase().includes(text)) {
        filtered.push(row);
      }
    }
    this.results.set(filtered);
  }

  private setFunction(character: Character, a: Artefact): string | null {
    const { setName } = this.artifactForm.getRawValue();

    if (!setName) return 'Введи сет';
    let error = true;
    if (a.setPartType === 'Пески времени')
      error = a.mainStat && character.clockStats.includes(a.mainStat) ? false : true;
    if (a.setPartType === 'Кубок пространства')
      error = a.mainStat && character.gobletStats.includes(a.mainStat) ? false : true;
    if (a.setPartType === 'Корона разума')
      error = a.mainStat && character.crownStats.includes(a.mainStat) ? false : true;
    if (a.setPartType === 'Цветок жизни' || a.setPartType === 'Перо смерти') error = false;
    if (error) return null;

    if (
      this.extractStatsPipe
        .transform(character.mainSets, this.dataService.artefactSets())
        .includes(setName)
    )
      return 'Сетник';
    if (
      this.extractStatsPipe
        .transform(character.altSets, this.dataService.artefactSets())
        .includes(setName)
    )
      return 'Альтернатива';
    if (
      this.extractStatsPipe
        .transform(character.subSets, this.dataService.artefactSets())
        .includes(setName)
    )
      return 'Солянка';
    return 'Оффсетник';
  }

  #setProfit(art: Artefact, char: Character): string | null {
    const res = [0, 0, 0, 0];

    console.log(
      char.nameEn,
      this.extractStatsPipe.transform(char.perfectStats, this.dataService.stats())
    );
    console.log(
      char.nameEn,
      this.extractStatsPipe.transform(char.goodStats, this.dataService.stats())
    );
    console.log(
      char.nameEn,
      this.extractStatsPipe.transform(char.okStats, this.dataService.stats())
    );

    for (const stat of char.perfectStats) {
      if (
        art.mainStat === stat ||
        art.setPartType === 'Цветок жизни' ||
        art.setPartType === 'Перо смерти'
      ) {
        res[0] = 1;
        break;
      }
    }

    const filledStats = [
      art.critDmg ? CRIT_DMG : null,
      art.critRate ? CRIT_RATE : null,
      art.atkPercent ? ATK_PERCENT : null,
      art.hpPercent ? HP_PERCENT : null,
      art.defPercent ? DEF_PERCENT : null,
      art.er ? ENERGY_RECHARGE : null,
      art.em ? ELEMENTAL_MASTERY : null,
    ].filter(Boolean);

    for (const stat of this.extractStatsPipe.transform(
      char.perfectStats,
      this.dataService.stats()
    )) {
      res[1] = res[1] + +filledStats.includes(stat);
    }

    for (const stat of this.extractStatsPipe.transform(char.goodStats, this.dataService.stats())) {
      res[2] = res[2] + +filledStats.includes(stat);
    }

    for (const stat of this.extractStatsPipe.transform(char.okStats, this.dataService.stats())) {
      res[3] = res[3] + +filledStats.includes(stat);
    }

    const count = res[0] * 1000 + res[1] * 100 + res[2] * 10 + res[3];

    const perfectScore =
      1000 +
      100 * char.perfectStats.length +
      10 * Math.min(4 - char.perfectStats.length, char.goodStats.length) +
      1 *
        Math.max(
          0,
          Math.min(4 - char.goodStats.length - char.perfectStats.length, char.okStats.length)
        );

    return count == perfectScore
      ? 'Совершенно'
      : count > perfectScore - 10
      ? 'Отлично'
      : count > perfectScore - 110
      ? 'Хорошо'
      : count > perfectScore - 220
      ? 'Приемлемо'
      : null;
  }

  #checkMainStatDuplicate(): undefined | never {
    const { atkPercent, hpPercent, defPercent, atk, def, hp, critDmg, critRate, er, em, mainStat } =
      this.artifactForm.getRawValue();

    const inputs = [atkPercent, hpPercent, defPercent, atk, def, hp, critDmg, critRate, er, em];

    for (let i = 0; i < inputs.length; i++) {
      if (
        inputs[i]! > 0 &&
        this.dataService.repeatableStats()[i].nameRu ===
          STATS.find((stat) => stat.name === mainStat)?.name
      ) {
        alert('Верхний и нижний стат повторяться не могут!');
        throw Error('Верхний и нижний стат повторяться не могут!');
      }
    }
  }
}
