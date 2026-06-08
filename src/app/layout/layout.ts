import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MaterialModules } from '../shared/material';
import { LoadingToast } from '../shared/components/loading-toast/loading-toast';

@Component({
  selector: 'app-layout',
  imports: [...MaterialModules, RouterOutlet, RouterLink, RouterLinkActive, LoadingToast],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  sidenavOpened: boolean = true
}
