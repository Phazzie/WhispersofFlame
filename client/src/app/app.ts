import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <h1>Hello, {{ title() }}</h1>
    <router-outlet />
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class App {
  protected readonly title = signal('client');
}
