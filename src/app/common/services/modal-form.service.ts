import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UbModalFormService {
  private formSubject = new BehaviorSubject<any>(null);

  public getForm(): Observable<any> {
    return this.formSubject;
  }

  public setForm(data: any): void {
    this.formSubject.next(data);
  }

  public isFormDirty(): Observable<boolean> {
    return this.formSubject.pipe(map((form) => !!form && !!form.dirty));
  }
}
