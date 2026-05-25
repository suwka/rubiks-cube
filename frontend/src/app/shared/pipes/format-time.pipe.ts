import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatTime',
  standalone: true
})
export class FormatTimePipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    const safeValue = Math.max(0, Math.floor(value ?? 0));
    const centiseconds = Math.floor(safeValue / 10);
    const minutes = Math.floor(centiseconds / 6000);
    const seconds = Math.floor((centiseconds % 6000) / 100);
    const hundredths = centiseconds % 100;

    if (minutes === 0) {
      return `${seconds}.${String(hundredths).padStart(2, '0')}`;
    }

    return `${minutes}:${String(seconds).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`;
  }
}
