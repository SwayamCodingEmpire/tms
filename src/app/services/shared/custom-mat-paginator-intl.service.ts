import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

@Injectable({
  providedIn: 'root'
})
export class CustomMatPaginatorIntlService extends MatPaginatorIntl  {

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) {
      return `Showing 0 of ${length} entries`;
    }

    const startIndex = page * pageSize;
    const endIndex = Math.min(startIndex + pageSize, length);

    return `Showing ${startIndex + 1} to ${endIndex} of ${length} entries`;
  };
}
