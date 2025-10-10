import { Component, inject } from '@angular/core';
import { LoadingKeys } from '@common/enums';
import { UbLoadingService } from '@common/services';
import { UbLoaderComponent, UbUserProfileComponent } from '@common/ui';

@Component({
  selector: 'ub-user-profile-dashboard',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  imports: [UbUserProfileComponent, UbLoaderComponent],
})
export class UbUserProfileDashboardComponent {
  private loadingService = inject(UbLoadingService);

  loaderKey = LoadingKeys.USER_PROFILE;

  get loading(): boolean {
    const state = this.loadingService.getLoaderStateValue(this.loaderKey);
    return state.show;
  }
}
