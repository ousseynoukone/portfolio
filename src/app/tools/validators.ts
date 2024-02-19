import { AbstractControl, ValidatorFn, Validators } from '@angular/forms';

export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (control.value) { // Only validate if a value is provided
      const snPhoneRegex = /^(\+221)?(7[05678]\d{7}|3[34]\d{6})$/.test(control.value);
      return snPhoneRegex ? null : { 'pattern': { value: control.value } };
    } else {
      return null; // No validation errors if the field is empty
    }
  };
}
