import { Component, input } from '@angular/core';

/**
 * Simple page scaffold used by placeholder pages until feature modules are implemented.
 */
@Component({
  selector: 'app-page',
  standalone: true,
  templateUrl: './page.component.html',
  styleUrl: './page.component.css',
})
export class PageComponent {
  title = input.required<string>();
  description = input<string>('');
}
