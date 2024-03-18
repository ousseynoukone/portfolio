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
