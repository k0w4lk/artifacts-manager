import { inject, Injectable, signal } from '@angular/core';
import { collection, collectionData, Firestore, getDocs } from '@angular/fire/firestore';
import { ArtifactSet } from '../utils/set-interface';
import { Character } from '../../models/types';
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
  readonly #sets$ = collectionData(this.#setsCollection);
  readonly #setParts$ = collectionData(this.#setPartsCollection);
  readonly #stats$ = collectionData(this.#statsCollection);

  readonly artefactSets = signal<ArtifactSet[]>([]);
  readonly characters = signal<Character[]>([]);
  readonly setParts = signal<SetPart[]>([]);
  readonly stats = signal<Stat[]>([]);

  constructor() {
    this.#requestAllData();
  }

  #requestArtifacts(): void {
    this.#sets$.subscribe((sets) => {
      this.artefactSets.set(sets as ArtifactSet[]);
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
