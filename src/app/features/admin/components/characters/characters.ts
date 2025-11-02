import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddCharacter } from '../add-character/add-character';
import { MatTableModule } from '@angular/material/table';
import { DataSource } from '@angular/cdk/collections';
import { Observable, ReplaySubject } from 'rxjs';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

class CharsDataSource extends DataSource<any> {
  private _dataStream = new ReplaySubject<any[]>();

  constructor(initialData: any[]) {
    super();
    this.setData(initialData);
  }

  connect(): Observable<any[]> {
    return this._dataStream;
  }

  disconnect() {}

  setData(data: any[]) {
    this._dataStream.next(data);
  }
}

@Component({
  selector: 'app-characters',
  imports: [MatTableModule],
  templateUrl: './characters.html',
  styleUrl: './characters.css',
})
export class Characters implements OnInit {
  readonly #destroyRef = inject(DestroyRef);
  readonly #firestore = inject(Firestore);
  readonly #matDialog = inject(MatDialog);

  readonly #charsCollection = collection(this.#firestore, 'characters');
  readonly chars$ = collectionData(this.#charsCollection);

  displayedColumns: string[] = ['name'];
  dataSource = new CharsDataSource([]);

  ngOnInit(): void {
    this.#requestCharacters();
  }

  addChar(): void {
    this.#matDialog.open(AddCharacter);
  }

  #requestCharacters(): void {
    this.chars$.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe((chars) => {
      this.dataSource.setData(chars);
    });
  }
}
