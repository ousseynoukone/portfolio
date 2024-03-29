import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  constructor() {}

  setData(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  getData(key: string): any {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  clearData(key: string) {
    localStorage.removeItem(key);
  }

  clearAllData() {
    localStorage.clear();
  }
}



@Injectable({
  providedIn: 'root'
})
export class PassDataThrough {
  private data : any
  constructor() {}


  get getData(){
    return this.data
  }
  
  set setData(data: any){
    this.data = data
  }

}




@Injectable({ providedIn: 'root' })
export class ValidatorsRegex {

//   Explanation:

// ^ matches the start of the string.
// (http:\/\/[\w\-.]+\.[a-z]{2,}\/?.*?|https?:\/\/[\w\-.]+\.[a-z]{2,}\/?.*?) matches a single URL starting with either http:// or https://, followed by one or more word characters (\w), hyphens (-), or periods (.), then a period (.), and two or more lowercase letters ([a-z]{2,}). It also allows an optional forward slash (\/?) and any additional characters (.*?) after the domain part of the URL.
// (,http:\/\/[\w\-.]+\.[a-z]{2,}\/?.*?|,https?:\/\/[\w\-.]+\.[a-z]{2,}\/?.*?)* matches zero or more occurrences of a comma (,) followed by another URL pattern starting with either http:// or https://, and allowing optional paths and query parameters.
// $ matches the end of the string.

private usefullLinksRegex: RegExp = /^(https?:\/\/)?(www\.)?[\w\-.]+\.[a-z]{2,}(\/[\w\-.\/]*)?(,(https?:\/\/)?(www\.)?[\w\-.]+\.[a-z]{2,}(\/[\w\-.\/]*)?)*$/;

  //Explanation : 
  //String with space or not , separed by ,
  private usedToolsRegex: RegExp = /^(?:[a-zA-Z0-9 ]+,)*(?:[a-zA-Z0-9 ]+)$/;

  get validateUrl(): RegExp {
    return this.usefullLinksRegex;
  }

  get validateUsedTools(): RegExp {
    return this.usedToolsRegex;
  }
}

