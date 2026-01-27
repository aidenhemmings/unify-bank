import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UbSidebarService } from '@common/services';
import { UbSidebarComponent } from '@common/ui';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'ub-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
  imports: [CommonModule, RouterOutlet, UbSidebarComponent],
})
export class UbAdminLayoutComponent implements OnInit {
  private sidebarService = inject(UbSidebarService);

  isCollapsed = false;

  ngOnInit() {
    this.sidebarService.isCollapsed$
      .pipe(untilDestroyed(this))
      .subscribe((collapsed) => {
        this.isCollapsed = collapsed;
      });
  }
}
