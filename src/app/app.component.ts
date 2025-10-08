import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UbSupabaseService, UbUserService } from '@common/services';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private supabaseService = inject(UbSupabaseService);
  private userService = inject(UbUserService);

  async ngOnInit() {
    const { session } = await this.supabaseService.getSession();

    if (session?.user) {
      this.userService.setCurrentUser(session.user);
    }

    this.supabaseService.onAuthStateChange((session) => {
      if (session?.user) {
        this.userService.setCurrentUser(session.user);
      } else {
        this.userService.clearUser();
      }
    });
  }
}
