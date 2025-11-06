import { inject, Pipe, PipeTransform } from '@angular/core';
import { DataService } from '../../core/services/data-service';

@Pipe({
  name: 'extractStats',
})
export class ExtractStatsPipe implements PipeTransform {
  readonly #dataService = inject(DataService);

  transform(
    ids: string[],
    dataSource: Record<string, any>[],
    dataKey: string = 'nameRu'
  ): string[] {
    return dataSource.filter((stat) => ids.includes(stat['id'])).map((stat) => stat[dataKey]);
  }
}
