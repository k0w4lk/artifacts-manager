import { DataSource } from '@angular/cdk/collections';
import { Component, effect, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { Observable, ReplaySubject } from 'rxjs';
import { AddCharacter } from '../add-character/add-character';
import { DataService } from '../../../../core/services/data-service';
import { Character } from '../../../../core/utils/types';
import { JsonPipe } from '@angular/common';
import { ExtractStatsPipe } from '../../../../ui/pipes/extract-stats-pipe';

class CharsDataSource extends DataSource<Character> {
  private _dataStream = new ReplaySubject<Character[]>();

  constructor(initialData: Character[]) {
    super();
    this.setData(initialData);
  }

  connect(): Observable<Character[]> {
    return this._dataStream;
  }

  disconnect() {}

  setData(data: Character[]) {
    this._dataStream.next(data);
  }
}

@Component({
  selector: 'app-characters',
  imports: [ExtractStatsPipe, JsonPipe, MatTableModule],
  templateUrl: './characters.html',
  styleUrl: './characters.css',
})
export class Characters {
  readonly dataService = inject(DataService);

  readonly #matDialog = inject(MatDialog);

  displayedColumns: string[] = ['name', 'perfectStats'];
  dataSource = new CharsDataSource([]);

  constructor() {
    effect(() => {
      this.dataSource.setData(this.dataService.characters());
    });
  }

  addChar(): void {
    this.#matDialog.open(AddCharacter);
  }
}
