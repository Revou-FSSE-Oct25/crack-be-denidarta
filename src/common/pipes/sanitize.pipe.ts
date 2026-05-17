import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: unknown): unknown {
    return this.sanitize(value);
  }

  private sanitize(value: unknown): unknown {
    if (value === null || value === undefined) return value;
    if (typeof value === 'string') {
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]*>/g, '');
    }
    if (Array.isArray(value)) return value.map((v) => this.sanitize(v));
    if (typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(([k, v]) => [
          k,
          this.sanitize(v),
        ]),
      );
    }
    return value;
  }
}
