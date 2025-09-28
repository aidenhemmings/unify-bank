import { Injectable } from "@angular/core";
import { SupabaseClient } from "@supabase/supabase-js";
import { environment } from "../environment/environment";


@Injectable({
  providedIn: "root",
})
export class SupabaseService {
 private supabase: SupabaseClient;

  constructor() {
    this.supabase = new SupabaseClient(
      environment.supabaseUrl,
      environment.supabaseKey
  );
  }

  async signIn(username: string, password: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('Username', username)
      .eq('Password', password)
      .single();

    if (error) {
      return { error };
    }
    if (!data) {
      return { error: { message: 'Invalid username or password' } };
    }

    // TODO: Leaving console log in for this PR but should be removed later
    console.log('Logged in successfully: ', data);
    return { user: data };
  }


}
