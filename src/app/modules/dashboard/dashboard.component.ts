import { Component, inject } from '@angular/core';
import { UbUserService } from '@common/services';
import { User } from '@common/types';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'ub-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class UbDashboardComponent {
  private userService = inject(UbUserService);

  user!: User;

  constructor() {
    this.userService.currentUser
      .pipe(untilDestroyed(this))
      .subscribe((user) => {
        if (user) {
          this.user = user;
        }
      });
  }
}
