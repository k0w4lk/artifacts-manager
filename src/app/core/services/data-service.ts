import { computed, inject, Injectable, signal } from '@angular/core';
import { collection, collectionData, Firestore, getDocs } from '@angular/fire/firestore';
import { ArtifactSet } from '../utils/set-interface';
import { Character } from '../utils/types';
import { SetPart } from '../utils/set-part-interface';
import { Stat } from '../utils/stat-interface';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  readonly #firestore = inject(Firestore);

  readonly #charsCollection = collection(this.#firestore, 'characters');
  readonly #setsCollection = collection(this.#firestore, 'sets');
  readonly #setPartsCollection = collection(this.#firestore, 'set-parts');
  readonly #statsCollection = collection(this.#firestore, 'stats');

  readonly #chars$ = collectionData(this.#charsCollection);
  readonly #setParts$ = collectionData(this.#setPartsCollection);

  readonly artefactSets = signal<ArtifactSet[]>([]);
  readonly characters = signal<Character[]>([]);
  readonly setParts = signal<SetPart[]>([]);
  readonly stats = signal<Stat[]>([]);

  readonly repeatableStats = computed(() => this.stats().filter((stat) => stat.repeatable));

  constructor() {
    this.#requestAllData();
  }

  #requestArtifacts(): void {
    from(getDocs(this.#setsCollection)).subscribe((snapshot) => {
      const artefactSets = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

      this.artefactSets.set(artefactSets as ArtifactSet[]);
    });
  }

  #requestCharacters(): void {
    this.#chars$.subscribe((chars) => {
      this.characters.set(chars as Character[]);
    });
  }

  #requestSetParts(): void {
    this.#setParts$.subscribe((setParts) => {
      this.setParts.set(setParts as SetPart[]);
    });
  }

  #requestStats(): void {
    from(getDocs(this.#statsCollection)).subscribe((snapshot) => {
      const stats = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

      this.stats.set(stats as Stat[]);
    });
  }

  #requestAllData(): void {
    this.#requestArtifacts();
    this.#requestCharacters();
    this.#requestSetParts();
    this.#requestStats();
  }
}
