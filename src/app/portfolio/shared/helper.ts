import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class Helpers {

  splitAndTrim(text: string | string[] | any): string[] {
    if (!text) return [];
    if (Array.isArray(text)) {
      return text.map(word => (typeof word === 'string' ? word.trim() : String(word))).filter(w => w.length > 0);
    }
    if (typeof text === 'string') {
      const words = text.split(',');
      return words.map(word => word.trim()).filter(w => w.length > 0);
    }
    return [String(text).trim()];
  }
  
  arrayToString(array: string[] | string | any): string {
    if (!array) return '';
    if (Array.isArray(array)) {
      return array.filter(item => item !== null && item !== undefined).join(',');
    }
    if (typeof array === 'string') {
      return array;
    }
    return String(array);
  }

}
