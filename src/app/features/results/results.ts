import { DataSource } from '@angular/cdk/collections';
import { Component, effect, input } from '@angular/core';
import { Result } from '../../core/utils/result-interface';
import { Observable, ReplaySubject } from 'rxjs';
import { MatTableModule } from '@angular/material/table';

class ResultsDataSource extends DataSource<Result> {
  private _dataStream = new ReplaySubject<Result[]>();

  constructor(initialData: Result[]) {
    super();
    this.setData(initialData);
  }

  connect(): Observable<Result[]> {
    return this._dataStream;
  }

  disconnect() {}

  setData(data: Result[]) {
    this._dataStream.next(data);
  }
}

@Component({
  selector: 'app-results',
  imports: [MatTableModule],
  templateUrl: './results.html',
  styleUrl: './results.css',
})
export class Results {
  readonly results = input.required<Result[]>();

  readonly displayedColumns: string[] = ['char', 'profit', 'setType'];

  readonly dataSource = new ResultsDataSource([]);

  constructor() {
    effect(() => {
      this.dataSource.setData(this.results());
    });
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
}
