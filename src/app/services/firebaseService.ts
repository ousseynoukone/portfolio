
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
import { AbilityUpdateDto } from '../models/dtos/abilitieUpdateDto';

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
export class FireBaseStorageService {

  abilitiyDB !: AngularFirestoreCollection<any>;
  private basePath = '/uploads';

  // Streams for percentage and abilities
  private _percentageSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private _abilitiesSubject: Subject<Ability[]> = new Subject<Ability[]>();


  //for pagination
  private lastVisibleByDoc: any;
  private firstVisibleByDoc: any;
  private firstDocId : any

  //for pagination
  public limit : number = 0
  public weAreOntFirstElement : boolean = false;
  public weAreOntLastElement : boolean = true;
  public totalOfItems : number = 0;


  constructor(private firestore : AngularFirestore, private storage: AngularFireStorage){
    this.abilitiyDB = firestore.collection('abilities');

    this.abilitiesSubject.subscribe(abilities => {
      this.weAreOntFirstElement = abilities.some(ability => ability.id === this.firstDocId);
    });
    this.getAbilitiesNumber()
  }

  get percentage(): Observable<Number> {
    return this._percentageSubject.asObservable();
  }

  get abilitiesSubject():Observable<Ability[]> {
    return this._abilitiesSubject.asObservable();
  }


  get getLastVisibleByName(): String{
    return this.lastVisibleByDoc
  }
  
  get getFirstVisibleByName(): String{
    return this.firstVisibleByDoc
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

    const newId = this.firestore.createId();
    ability.id = newId;
    
  await this.abilitiyDB.add(ability);
  return { status: true, message: 'Ability added successfully.' };

    } catch (error) {
       return { status: false, message: String(error) };
   }
  }



  
 



  getAbilities(limit : any) {
    this.limit=limit
    this.firestore.collection('abilities',ref=>ref.limit(this.limit).orderBy('id','desc')).valueChanges().subscribe(querySnapshot => {
      
      let abilities: Ability[] = [];
      querySnapshot.forEach(doc => {
        const ability = doc as Ability;
        abilities.push(ability);
        //For saving the last displated ability
        this.lastVisibleByDoc = ability.id
      });

      this.firstDocId = abilities.at(0)?.id;


      this._abilitiesSubject.next(abilities);

      if(abilities.length!=0){
            //This is only to ensure that we are  on the last elements soo the suivant button is disabled
            this.firestore.collection('abilities',ref=>ref.limit(this.limit).orderBy('id','desc').startAfter(this.lastVisibleByDoc)).valueChanges().subscribe(querySnapshot => {
              console.log("ici " +querySnapshot.length)
              if(querySnapshot.length!=0){
                this.weAreOntLastElement=false;
              }
            
            }); 
      }



        
    });
  }

  getAbilitiesNumber() {
    this.abilitiyDB.valueChanges().subscribe(querySnapshot => {
      this.totalOfItems=querySnapshot.length
    });
  }



//For the pagination
getNextAbilities() {
  this.weAreOntLastElement = true
    this.firestore.collection('abilities',ref=>ref.limit(this.limit).orderBy('id','desc').startAfter(this.lastVisibleByDoc)).valueChanges().subscribe(querySnapshot => {
      
      let abilities: Ability[] = [];
      querySnapshot.forEach(doc => {
        const ability = doc as Ability;
        abilities.push(ability);
      });

      this._abilitiesSubject.next(abilities);
      this.firstVisibleByDoc = abilities.at(0)?.id;

      console.log("firstVisibleByDoc " + this.firstVisibleByDoc)

      this.lastVisibleByDoc = abilities.at(abilities.length-1)?.id;
    ///////////This is only to ensure that we are  on the last elements soo the suivant button is disabled
    this.firestore.collection('abilities',ref=>ref.limit(this.limit).orderBy('id','desc').startAfter(this.lastVisibleByDoc)).valueChanges().subscribe(querySnapshot => {
      console.log("laba "+querySnapshot.length)
      if(querySnapshot.length!=0){
        this.weAreOntLastElement=false;
      }});
    //////////////////////////////////////

 
    }); 





  } 



  getPreviousAbilities() {
    this.firestore.collection('abilities', ref =>
      ref.limitToLast(this.limit).orderBy('id','desc').endBefore(this.firstVisibleByDoc)
    ).valueChanges().subscribe(querySnapshot => {
      let abilities: Ability[] = [];
      querySnapshot.forEach(doc => {
        const ability = doc as Ability;
        abilities.push(ability);
      });
      console.log(abilities)

      this.firstVisibleByDoc = abilities.length > 0 ? abilities[0].id : null; // Update firstVisibleByDoc
      this.lastVisibleByDoc = abilities.at(abilities.length-1)?.id;

      this._abilitiesSubject.next(abilities);
    });

    //so the suivant button is enabled
    this.weAreOntLastElement=false;

      
  }
  




  async deleteItemFromStorage(filePath: string) {
    try {
      const storageRef = this.storage.refFromURL(filePath); // Get reference to file
      await storageRef.delete(); // Delete the file
      console.log('File deleted successfully!');
      // Handle successful deletion (e.g., update UI, notify user)
    } catch (error) {
      console.error('Error deleting file:', error);
      // Handle errors appropriately (e.g., display error message to user)
    }
  }



  async updateAbility(ability: Ability,file : File,withFile : boolean): Promise<ResponseDto> {
    var abilityWithoutImage : AbilityUpdateDto ;
    try {

      const snapshot = await this.abilitiyDB.ref.where('id', '==', ability.id).get();

      
      if(withFile){
        const filePath = `${this.basePath}/${ability.name}`;
        const uploadTask = this.storage.upload(filePath, file);
  
      uploadTask.percentageChanges().subscribe((percentage) => {
        //update the stream
        this._percentageSubject.next(percentage!)
      });
    
      await  uploadTask.then((uploadSnapshot) =>
      uploadSnapshot.ref.getDownloadURL().then(url=>{
        ability.image = url
      })
      );
      }else{
        abilityWithoutImage = {
          name: ability.name,
          type: ability.type!,
          id : ability.id,
          rating : ability.rating
        };
      }
    
  
      // Check if the document matching the condition exists
      if (!snapshot.empty) {
        // Delete the document
        snapshot.forEach(doc => {
          doc.ref.update( withFile ? ability : abilityWithoutImage);
        });
      }else{
        return { status: false, message: 'Docs not found!' };

      }
      // If update is successful
      return { status: true, message: 'Ability updated successfully!' };
    } catch (error) {
      console.error('Error updating ability:', error);
      
      // If there's an error during update
      // Handle errors appropriately (e.g., display error message to user)
      return { status: false, message: 'Error updating ability.' };
    }
  }
  




  
  
  async deleteAbility(ability: Ability): Promise<ResponseDto> {
    // Confirm the deletion with the user
    const userConfirmed = confirm(`Are you sure you want to delete the ability "${ability.name}"?`);
  
    // If the user cancels, return early
    if (!userConfirmed) {
      return { status: false, message: 'Deletion canceled by user.' };
    }
    try {
  
      // Create query with condition
      const snapshot = await this.abilitiyDB.ref.where('id', '==', ability.id).get();
  
      // Check if the document matching the condition exists
      if (!snapshot.empty) {
        // Delete the document
        snapshot.forEach(doc => {
          doc.ref.delete();
        });

        await this.deleteItemFromStorage(ability.image!)
      }else{
        return { status: false, message: 'Docs not found!' };
      }

  
      return { status: true, message: 'Ability deleted successfully!' };
    } catch (error) {
      console.error('Error deleting ability:', error);
      // If there's an error during deletion
      // Handle errors appropriately (e.g., display error message to the user)
      return { status: false, message: 'Error deleting ability.' };
    }
  }
  





}
