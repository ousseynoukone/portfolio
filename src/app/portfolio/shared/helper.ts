import { Injectable } from "@angular/core";


@Injectable({ providedIn: 'root' })
export class Helpers {

  splitAndTrim(text : String) {
    const words = text.split(',');
    // Trim leading and trailing whitespace from each word
    return words.map(word => word.trim());}
  
  
  arrayToString(array : string []) {
    return array.join(',');
  }


}