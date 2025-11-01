import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
} from './models/stat-names';
import { MAXIMUM_ROLL } from './models/maximum-roll';
import { STAT_BOUNDS } from './models/stat-bounds';
import { CHARACTERS } from './data/characters';
import type { Artefact, Character } from './models/types';
import { ParseTextService } from './parse-text-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly parseTextService = inject(ParseTextService);
  protected readonly title = signal('statcounter');

  protected readonly artefactSets = ALL_ARTEFACTS;
  protected readonly pieces = ['Цветок', 'Перо', 'Часы', 'Кубок', 'Шапка'];
  protected mainStatOptions = signal<string[]>([]);

  protected piece = signal('');
  protected mainStat = signal('');
  protected setName = signal('');

  protected atk = signal<number | null>(null);
  protected hp = signal<number | null>(null);
  protected def = signal<number | null>(null);
  protected er = signal<number | null>(null);
  protected em = signal<number | null>(null);
  protected critdmg = signal<number | null>(null);
  protected critrate = signal<number | null>(null);

  protected searchText = signal('');

  protected results = signal<{ name: string; stat: string; set: string }[]>([]);
  protected backup = signal<{ name: string; stat: string; set: string }[]>([]);

  protected readonly characters = CHARACTERS;

  protected onPieceChange(value: string) {
    this.piece.set(value);
    if (value === 'Цветок') {
      this.mainStatOptions.set([HP_PERCENT]);
      this.mainStat.set(HP_PERCENT);
    } else if (value === 'Перо') {
      this.mainStatOptions.set([ATK_PERCENT.replace(' %', '')]);
      // перо: плоская атака в оригинале, используем текст "Сила атаки"
      this.mainStat.set('Сила атаки');
    } else if (value === 'Часы') {
      this.mainStatOptions.set(CLOCK_STATS);
      this.mainStat.set('');
    } else if (value === 'Кубок') {
      this.mainStatOptions.set(GOBLET_STATS);
      this.mainStat.set('');
    } else if (value === 'Шапка') {
      this.mainStatOptions.set(CROWN_STATS);
      this.mainStat.set('');
    } else {
      this.mainStatOptions.set([]);
      this.mainStat.set('');
    }
  }

  private toArtefact(): Artefact | null {
    const atk = this.atk() ?? 0;
    const hp = this.hp() ?? 0;
    const def = this.def() ?? 0;
    const er = this.er() ?? 0;
    const em = this.em() ?? 0;
    const critdmg = this.critdmg() ?? 0;
    const critrate = this.critrate() ?? 0;
    const set = this.setName();
    const mainstat = this.mainStat();
    const piece = this.piece();

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
      if (inputs[i] > 0 && names[i] === mainstat) {
        alert('Верхний и нижний стат повторяться не могут!');
        return null;
      }
    }

    // convert to normalized rolls like C# constructor
    const artefact: Artefact = {
      atk: +(atk / 5).toFixed(3),
      def: +(def / 6.2).toFixed(3),
      hp: +(hp / 5).toFixed(3),
      em: +(em / 20).toFixed(3),
      er: +(er / 5.5).toFixed(3),
      critDmg: +(critdmg / 6.6).toFixed(3),
      critRate: +(critrate / 3.3).toFixed(3),
      set,
      mainStat: mainstat,
      piece,
    };
    return artefact;
  }

  protected onFileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    //this.parseTextService.tesseract(file!);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        this.parseTextService.main(base64);
      };
      reader.readAsDataURL(file);
    }
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
    this.atk.set(null);
    this.hp.set(null);
    this.def.set(null);
    this.er.set(null);
    this.em.set(null);
    this.critdmg.set(null);
    this.critrate.set(null);
    this.setName.set('');
    this.piece.set('');
    this.mainStat.set('');
    this.mainStatOptions.set([]);
    this.searchText.set('');
    this.results.set([]);
    this.backup.set([]);
  }

  protected search() {
    const text = this.searchText().toLowerCase();
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
    if (!this.setName()) return 'Введи сет';
    let error = true;
    if (a.piece === 'Часы') error = character.clockStats.includes(a.mainStat) ? false : true;
    if (a.piece === 'Кубок') error = character.gobletStats.includes(a.mainStat) ? false : true;
    if (a.piece === 'Шапка') error = character.crownStats.includes(a.mainStat) ? false : true;
    if (a.piece === 'Цветок' || a.piece === 'Перо') error = false;
    if (error) return '-';

    if (character.mainSets.includes(this.setName())) return 'Сетник';
    if (character.altSets.includes(this.setName())) return 'Альтернатива';
    if (character.subSets.includes(this.setName())) return 'Солянка';
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

    if (a.piece === 'Часы' && !c.clockStats.includes(a.mainStat)) return '-';
    if (a.piece === 'Кубок' && !c.gobletStats.includes(a.mainStat)) return '-';
    if (a.piece === 'Шапка' && !c.crownStats.includes(a.mainStat)) return '-';

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

    if (a.piece === 'Цветок' || a.piece === 'Перо') {
      if (first < 3) return '-';
      else if (first === 3) return second >= 2 ? 'Так себе' : '-';
      else if (first === 4) return second >= 2 ? 'Хорошо' : 'Так себе';
      else if (first === 5) return second >= 2 ? 'Отлично' : 'Хорошо';
      else if (first === 6) return second >= 2 ? 'Идеально' : 'Отлично';
      else if (first === 7) return second >= 2 ? 'СОВЕРШЕННО!' : 'Идеально';
      else return 'СОВЕРШЕННО!';
    } else if (a.piece === 'Часы') {
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
    } else if (a.piece === 'Кубок') {
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
    } else if (a.piece === 'Шапка') {
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
