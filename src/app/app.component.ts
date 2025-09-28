import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from './services/supabase.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true,
})
export class AppComponent {
  username = '';
  password = '';
  loginError = '';

  constructor(private supabaseService: SupabaseService) {}

  async login() {
    const { error } = await this.supabaseService.signIn(this.username, this.password);
    if (error) {
      this.loginError = error.message;
    } else {
      this.loginError = '';
    }
  }
}
