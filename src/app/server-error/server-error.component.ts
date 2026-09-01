import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-server-error',
  templateUrl: './server-error.component.html',
  styleUrls: ['./server-error.component.css'],
  standalone: false
})
export class ServerErrorComponent {
  constructor(private router: Router) {}

  goHome(): void {
    this.router.navigate(['/']);
  }

  reload(): void {
    window.location.reload();
  }
}
