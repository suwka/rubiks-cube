import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-placeholder-page',
  standalone: true,
  template: `
    <section class="placeholder">
      <p class="eyebrow">cubetracker</p>
      <h1>{{ title }}</h1>
      <p>strona w przygotowaniu</p>
    </section>
  `,
  styles: [`
    :host { display: block; padding: 3rem 1rem; }
    .placeholder { max-width: 1200px; margin: 0 auto; }
    .eyebrow { text-transform: lowercase; letter-spacing: .2em; opacity: .7; }
    h1 { margin: .5rem 0; font-size: clamp(2rem, 4vw, 3.5rem); }
  `]
})
export class PlaceholderComponent {
  private readonly route = inject(ActivatedRoute);

  protected get title(): string {
    return String(this.route.snapshot.data['title'] ?? 'cube tracker');
  }
}
