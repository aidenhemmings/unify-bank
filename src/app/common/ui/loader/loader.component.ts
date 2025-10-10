import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { LoadingKeys } from '@common/enums';
import { UbLoadingService } from '@common/services';
import { Loader } from '@common/types';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'ub-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
  imports: [CommonModule],
})
export class UbLoaderComponent implements OnInit {
  loadingService = inject(UbLoadingService);

  @Input() loaderKey = LoadingKeys.GLOBAL;

  visible = false;
  fullscreen = true;

  ngOnInit(): void {
    this.loadingService
      .getLoaderState(this.loaderKey)
      .pipe(untilDestroyed(this))
      .subscribe((state: Loader) => {
        this.visible = state.show;
        this.fullscreen = state.fullscreen ?? true;
      });
  }
}
