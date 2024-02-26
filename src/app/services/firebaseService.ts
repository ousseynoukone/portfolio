
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { LoginDto } from '../models/dtos/loginDto';
import { Injectable, inject } from '@angular/core';
import {ResponseDto} from '../models/dtos/responseDto';
import { Observable } from 'rxjs/internal/Observable';
import { BehaviorSubject, Subject, map } from 'rxjs';
import { Router } from '@angular/router';

import { Ability } from '../models/abilitie';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument ,  } from '@angular/fire/compat/firestore';
import { AngularFireStorage} from '@angular/fire/compat/storage';
import { AbilityDto } from '../models/dtos/abilitieDto';

@Injectable({
  providedIn: 'root',
})
export class FireBaseAuthService {
    constructor(private auth : AngularFireAuth, private router : Router){}
    
    get isAuthenticated(): Observable<boolean> {
      return this.auth.authState.pipe(map(user => !!user));
    }

    async login(loginDto: LoginDto): Promise<ResponseDto> {
      try {
        const response = await this.auth.signInWithEmailAndPassword(loginDto.email, loginDto.password);
        this.router.navigate(['/admin']);
        console.log(response);
  
        const successResponse: ResponseDto = {
          status: true, // Assuming 200 for success, adjust as needed
          message: "Success",
        };
        return successResponse;
      } catch (error) {
        console.log(error);

        const errorResponse: ResponseDto = {
          status: false, // Assuming 500 for error, adjust as needed
          message: String(error) || "An error occurred",
        };
        return errorResponse;
      }
    }

      logout() {
        this.auth.signOut()
          .then(() => {
            // Logout successful
          })
          .catch((error) => {
            // An error occurred
          });
      }
}




@Injectable({
  providedIn: 'root',
})
export class FireBaseStorageService{

  abilitiyDB !: AngularFirestoreCollection<any>;
  private basePath = '/uploads';
  //Stream
  private _percentageSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  //default value not requireed
  private _abilitiesSubject: Subject<Ability[]> = new Subject<Ability[]>();

  constructor(private firestore : AngularFirestore, private storage: AngularFireStorage){
    this.abilitiyDB = firestore.collection('abilities');
  }

  get percentage(): Observable<Number> {
    return this._percentageSubject.asObservable();
  }

  get abilitiesSubject():Observable<Ability[]> {
    return this._abilitiesSubject.asObservable();
  }
    


  async addAbility(ability: Ability, file: File): Promise<ResponseDto> {
    const filePath = `${this.basePath}/${ability.name}`;
    const storageRef = this.storage.ref(filePath);
    const uploadTask = this.storage.upload(filePath, file);
  try {
  uploadTask.percentageChanges().subscribe((percentage) => {
    //update the stream
    this._percentageSubject.next(percentage!)
  });

  await  uploadTask.then((uploadSnapshot) =>
  uploadSnapshot.ref.getDownloadURL().then(url=>{
    ability.image = url
  })
  );


  // Assuming this.abilitiyDB is an AngularFirestoreCollection<Ability>
  await this.abilitiyDB.add(ability);
  return { status: true, message: 'Ability added successfully.' };

    } catch (error) {
       return { status: false, message: String(error) };
  
   }

  }

 
  getAbilities() {
    
    this.abilitiyDB.valueChanges().subscribe(querySnapshot => {
      let abilities: Ability[] = [];
      querySnapshot.forEach(doc => {
        
        const ability = doc as Ability;
        console.log(ability)

        abilities.push(ability);
      });
      this._abilitiesSubject.next(abilities);
    });
  }


  
  

}