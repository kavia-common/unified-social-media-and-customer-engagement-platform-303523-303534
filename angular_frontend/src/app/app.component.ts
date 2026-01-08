import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Root component: hosts the router outlet.
 * The actual UI layout is provided by AppShellComponent via routing.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'Unified Engagement Platform';
}
