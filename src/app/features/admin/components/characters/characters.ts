import { DataSource } from '@angular/cdk/collections';
import { Component, effect, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { Observable, ReplaySubject } from 'rxjs';
import { AddCharacter } from '../add-character/add-character';
import { DataService } from '../../../../core/services/data-service';

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
export class Characters {
  readonly #dataService = inject(DataService);
  readonly #matDialog = inject(MatDialog);

  displayedColumns: string[] = ['name'];
  dataSource = new CharsDataSource([]);

  constructor() {
    effect(() => {
      this.dataSource.setData(this.#dataService.characters());
    });
  }

  addChar(): void {
    this.#matDialog.open(AddCharacter);
  }
}
