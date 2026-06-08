import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-maintenance-layout',
  imports: [RouterOutlet, RouterModule],
  templateUrl: './maintenance-layout.html',
  styleUrl: './maintenance-layout.css',
})
export class MaintenanceLayout {}
