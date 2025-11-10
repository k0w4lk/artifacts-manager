import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'extractStats',
})
export class ExtractStatsPipe implements PipeTransform {
  transform<T extends { id: string }>(ids: string[], dataSource: T[]): T[] {
    return dataSource.filter((stat) => ids.includes(stat['id']));
  }
}
