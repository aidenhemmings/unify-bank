import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UbModalFormService {
  private formSubject = new BehaviorSubject<any>(null);

  /**
   * Retrieves the current form data.
   * @returns The current form data.
   */
  public getForm(): Observable<any> {
    return this.formSubject;
  }

  /**
   * Sets the current form data.
   * @param data The form data to set.
   */
  public setForm(data: any): void {
    this.formSubject.next(data);
  }


  /**
   * Checks if the current form is dirty.
   * @returns A boolean indicating if the form is dirty.
   */
  public isFormDirty(): Observable<boolean> {
    return this.formSubject.pipe(map((form) => !!form && !!form.dirty));
  }
}
