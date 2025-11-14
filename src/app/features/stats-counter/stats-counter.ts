import { AsyncPipe, JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { map, Observable, startWith, switchMap } from 'rxjs';
import { Camera } from '../../camera/camera';
import { DataService } from '../../core/services/data-service';
import { Result } from '../../core/utils/result-interface';
import { ArtifactSet } from '../../core/utils/set-interface';
import { SetPart, SetPartKey } from '../../core/utils/set-part-interface';
import { Stat, StatKey } from '../../core/utils/stat-interface';
import { Artefact, Character } from '../../core/utils/types';
import { Artifact, ParseTextService } from '../../parse-text-service';
import { ExtractStatsPipe } from '../../ui/pipes/extract-stats-pipe';
import { Results } from '../results/results';

@Component({
  selector: 'app-stats-counter',
  imports: [
    AsyncPipe,
    Camera,
    JsonPipe,
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    Results,
  ],
  templateUrl: './stats-counter.html',
  styleUrl: './stats-counter.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsCounter {
  readonly dataService = inject(DataService);
  readonly parseTextService = inject(ParseTextService);

  readonly extractStatsPipe = new ExtractStatsPipe();

  readonly artifactForm = new FormGroup({
    set: new FormControl<ArtifactSet | null>(null),
    setPartType: new FormControl<SetPart | null>(null),
    mainStat: new FormControl<string | null>(null),
    atkPercent: new FormControl<number | null>(null),
    hpPercent: new FormControl<number | null>(null),
    defPercent: new FormControl<number | null>(null),
    atk: new FormControl<number | null>(null),
    hp: new FormControl<number | null>(null),
    def: new FormControl<number | null>(null),
    energyRecharge: new FormControl<number | null>(null),
    elementalMastery: new FormControl<number | null>(null),
    critDmg: new FormControl<number | null>(null),
    critRate: new FormControl<number | null>(null),
  });

  readonly #currentSetPart = toSignal(this.artifactForm.controls.setPartType.valueChanges);

  readonly filteredSets: Observable<ArtifactSet[]> = toObservable(
    this.dataService.artefactSets,
  ).pipe(
    switchMap(() =>
      this.artifactForm.controls.set.valueChanges.pipe(
        startWith(''),
        map((value) => {
          const name = typeof value === 'string' ? value : '';
          return name ? this._filter(name as string) : this.dataService.artefactSets().slice();
        }),
      ),
    ),
  );

  _filter(name: string): ArtifactSet[] {
    const filterValue = name.toLowerCase();

    return this.dataService
      .artefactSets()
      .filter((art) => art.nameRu.toLowerCase().includes(filterValue));
  }

  readonly partMainStats = computed(() => {
    const mainStatsIds = this.dataService
      .setParts()
      .find((p) => p.id === this.#currentSetPart()?.id)?.mainStats;
    return this.dataService.stats().filter((s) => !!mainStatsIds?.includes(s.id));
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

  displayFn(art: ArtifactSet): string {
    return art && art.nameRu ? art.nameRu : '';
  }

  onPieceChange(value: Artifact | null) {
    const patchStats: Record<string, number> = {};

    value?.stats.forEach((s) => {
      if (s.key) {
        patchStats[s.key] = s.value;
      }
    });

    this.artifactForm.reset();

    this.artifactForm.patchValue({
      set: this.dataService.artefactSets().find((set) => set.nameRu === value?.setName) ?? null,
      setPartType:
        this.dataService.setParts().find((sp) => sp.nameRu === value?.setPartType) ?? null,
      mainStat: value?.mainStat?.name ?? null,
      ...patchStats,
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
          quality,
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
      this.parseTextService.parseImage(res!);
    });
  }

  calculate() {
    this.#checkMainStatDuplicate();

    const formData = this.artifactForm.getRawValue();

    // const artefact: Artefact = {
    //   atkPercent: +(formData.atkPercent ?? 0 / 5).toFixed(3),
    //   defPercent: +(formData.defPercent ?? 0 / 6.2).toFixed(3),
    //   hpPercent: +(formData.hpPercent ?? 0 / 5).toFixed(3),
    //   atk: +(formData.atk ?? 0 / 16.5).toFixed(3),
    //   def: +(formData.def ?? 0 / 19.5).toFixed(3),
    //   hp: +(formData.hp ?? 0 / 254).toFixed(3),
    //   em: +(formData.em ?? 0 / 20).toFixed(3),
    //   er: +(formData.er ?? 0 / 5.5).toFixed(3),
    //   critDmg: +(formData.critDmg ?? 0 / 6.6).toFixed(3),
    //   critRate: +(formData.critRate ?? 0 / 3.3).toFixed(3),
    //   set: formData.set ?? null,
    //   mainStat: formData.mainStat ?? null,
    //   setPartType: formData.setPartType ?? '',
    // };

    const rows: Result[] = [];
    for (const c of this.dataService.characters()) {
      rows.push({
        char: c.nameEn,
        profit: this.#setProfit(formData, c),
        setType: this.#setFunction(c, formData),
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

  #setFunction(character: Character, a: Artefact): string | null {
    const { set, mainStat } = this.artifactForm.getRawValue();

    const ms = this.dataService
      .stats()
      .find((s) => s.nameRu.toLowerCase() === mainStat?.toLowerCase());

    if (!set) return 'Введи сет';
    let error = true;
    if (a.setPartType?.key === SetPartKey.Sands)
      error = a.mainStat && character.clockStats.includes(ms?.id || '') ? false : true;
    if (a.setPartType?.key === SetPartKey.Goblet)
      error = a.mainStat && character.gobletStats.includes(ms?.id || '') ? false : true;
    if (a.setPartType?.key === SetPartKey.Circlet)
      error = a.mainStat && character.crownStats.includes(ms?.id || '') ? false : true;
    if (a.setPartType?.key === SetPartKey.Flower || a.setPartType?.key === SetPartKey.Plume)
      error = false;
    if (error) return null;

    if (
      this.extractStatsPipe
        .transform<ArtifactSet>(character.mainSets, this.dataService.artefactSets())
        .find((s) => s.id === set.id)
    )
      return 'Сетник';
    if (
      this.extractStatsPipe
        .transform<ArtifactSet>(character.altSets, this.dataService.artefactSets())
        .find((s) => s.id === set.id)
    )
      return 'Альтернатива';
    if (
      this.extractStatsPipe
        .transform<ArtifactSet>(character.subSets, this.dataService.artefactSets())
        .find((s) => s.id === set.id)
    )
      return 'Солянка';
    return 'Оффсетник';
  }

  #setProfit(art: Artefact, char: Character): string | null {
    const res = [0, 0, 0, 0];

    const perfectStats = this.extractStatsPipe.transform(
      char.perfectStats,
      this.dataService.stats(),
    );
    const mainStat = this.dataService
      .stats()
      .find((s) => s.nameRu.toLowerCase() === art.mainStat?.toLowerCase());

    for (const stat of perfectStats) {
      if (
        mainStat?.id === stat.id ||
        art.setPartType?.key === SetPartKey.Flower ||
        art.setPartType?.key === SetPartKey.Plume
      ) {
        res[0] = 1;
        break;
      }
    }

    const filledStats = (
      [
        art.critDmg && this.dataService.stats().find((s) => s.key === StatKey.CritDmg),
        art.critRate && this.dataService.stats().find((s) => s.key === StatKey.CritRate),
        art.atkPercent && this.dataService.stats().find((s) => s.key === StatKey.AtkPercent),
        art.hpPercent && this.dataService.stats().find((s) => s.key === StatKey.HpPercent),
        art.defPercent && this.dataService.stats().find((s) => s.key === StatKey.DefPercent),
        art.energyRecharge &&
          this.dataService.stats().find((s) => s.key === StatKey.EnergyRecharge),
        art.elementalMastery &&
          this.dataService.stats().find((s) => s.key === StatKey.ElementalMastery),
      ].filter(Boolean) as Stat[]
    ).map((s) => s.id);

    for (const stat of this.extractStatsPipe.transform(
      char.perfectStats,
      this.dataService.stats(),
    )) {
      res[1] = res[1] + +filledStats.includes(stat.id);
    }

    for (const stat of this.extractStatsPipe.transform(char.goodStats, this.dataService.stats())) {
      res[2] = res[2] + +filledStats.includes(stat.id);
    }

    for (const stat of this.extractStatsPipe.transform(char.okStats, this.dataService.stats())) {
      res[3] = res[3] + +filledStats.includes(stat.id);
    }

    const count = res[0] * 1000 + res[1] * 100 + res[2] * 10 + res[3];

    const perfectScore =
      1000 +
      100 * char.perfectStats.length +
      10 * Math.min(4 - char.perfectStats.length, char.goodStats.length) +
      1 *
        Math.max(
          0,
          Math.min(4 - char.goodStats.length - char.perfectStats.length, char.okStats.length),
        );

    return count == perfectScore
      ? 'Великолепно'
      : count > perfectScore - 10
        ? 'Отлично'
        : count > perfectScore - 110
          ? 'Хорошо'
          : count > perfectScore - 220
            ? 'Приемлемо'
            : null;
  }

  #checkMainStatDuplicate(): undefined | never {
    const {
      atkPercent,
      hpPercent,
      defPercent,
      atk,
      hp,
      critDmg,
      critRate,
      energyRecharge,
      elementalMastery,
      mainStat,
    } = this.artifactForm.getRawValue();

    let parsedMainStat = this.dataService
      .stats()
      .find((s) => s.nameRu.toLowerCase() === mainStat?.toLowerCase());

    if (!parsedMainStat) {
      alert('Введи верхний стат');
      throw Error('Введи верхний стат');
    }

    const inputs = [
      { value: atkPercent, key: StatKey.AtkPercent },
      { value: hpPercent, key: StatKey.HpPercent },
      { value: defPercent, key: StatKey.DefPercent },
      { value: atk, key: StatKey.Atk },
      { value: hp, key: StatKey.Hp },
      { value: critDmg, key: StatKey.CritDmg },
      { value: critRate, key: StatKey.CritRate },
      { value: energyRecharge, key: StatKey.EnergyRecharge },
      { value: elementalMastery, key: StatKey.ElementalMastery },
    ];

    if (!parsedMainStat?.repeatable) return;

    for (let i = 0; i < inputs.length; i++) {
      if (Number(inputs[i].value) > 0 && inputs[i].key === parsedMainStat?.key) {
        alert('Верхний и нижний стат повторяться не могут!');
        throw Error('Верхний и нижний стат повторяться не могут!');
      }
    }
  }
}
