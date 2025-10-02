import { Injectable, OnInit, inject } from '@angular/core';
import {ResponseDto} from '../models/dtos/responseDto';
import { Observable } from 'rxjs/internal/Observable';
import { BehaviorSubject, Subject, map } from 'rxjs';
import { Ability } from '../models/abilitie';
import { AbilityUpdateDto } from '../models/dtos/abilitieUpdateDto';
import { Firestore, collection,CollectionReference, addDoc, query, orderBy, limit, startAfter, endBefore, getDocs, where, updateDoc, deleteDoc } from '@angular/fire/firestore';

import { Storage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from '@angular/fire/storage'; 

@Injectable({
  providedIn: 'root',
})
export class FireBaseAbilityService implements OnInit {

  private firestore: Firestore = inject(Firestore);
  private storage: Storage = inject(Storage);

  abilitiyDB !: CollectionReference<any>;
  private basePath = '/abilities';
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


  constructor(){
    this.abilitiyDB = collection(this.firestore,'abilities');

 
  }
  ngOnInit(): void {
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
  if (!this.storage) {
    console.error("Firebase Storage instance is undefined. Check AngularFire setup.");
    return { status: false, message: 'Firebase Storage is not initialized.' };
  }
    this._percentageSubject.next(0);

    const filePath = `${this.basePath}/${file.name}`;
    const storageRef = ref(this.storage, filePath);
    const uploadTask = uploadBytesResumable(storageRef,file);
    
  try {
    // Wait for upload to complete and get the download URL
    await new Promise<void>((resolve, reject) => {
      uploadTask.on('state_changed',(snapshot) => {
        let percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        this._percentageSubject.next(percentage!)
      }, (error) => {
        reject(error);
      }, async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          ability.image = downloadURL;
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });

    // Now save to Firestore with the correct image URL
    const docRef = await addDoc(this.abilitiyDB, ability);
    await updateDoc(docRef, { id: docRef.id });
    
    // Refresh the abilities count and reload data
    this.getAbilitiesNumber();
    this.getAbilities(this.limit);
    
    return { status: true, message: 'Ability added successfully.' };

    } catch (error) {
       return { status: false, message: String(error) };
   }
  }



  
 



  getAbilities(limitNumber : any) {
    this.limit=limitNumber
    const q = query(this.abilitiyDB, orderBy('id', 'desc'), limit(this.limit) );

    getDocs(q).then((querySnapshot) => {
      let abilities: Ability[] = [];
      querySnapshot.forEach(doc => {
          const ability = doc.data() as Ability;
          abilities.push(ability);
          //For saving the last displated ability
          this.lastVisibleByDoc = ability.id
        });

      if (querySnapshot.docs.length > 0) {
          this.firstDocId = querySnapshot.docs[0].data()['id'];
        }


      this._abilitiesSubject.next(abilities);

         if(abilities.length!=0){

          const q = query(this.abilitiyDB, orderBy('id', 'desc'), startAfter(this.lastVisibleByDoc), limit(this.limit));
            //This is only to ensure that we are  on the last elements soo the suivant button is disabled
            getDocs(q).then((querySnapshot) => {
              this.weAreOntLastElement = querySnapshot.empty;
              }); 
      }
  });


  }

  async getAbilitiesNumber() {
    try {
      const q = query(this.abilitiyDB);
      const snapshot = await getDocs(q);
      this.totalOfItems = snapshot.size;
    } catch (error) {
      console.error('Error getting abilities count:', error);
      this.totalOfItems = 0;
    }
  }



//For the pagination
getNextAbilities() {
  this.weAreOntLastElement = true
  const q = query(this.abilitiyDB,limit(this.limit),orderBy('id','desc'),startAfter(this.lastVisibleByDoc));

  getDocs(q).then((querySnapshot) => {
  let abilities: Ability[] = [];
  querySnapshot.forEach(doc => {
    const ability = doc.data() as Ability;
    abilities.push(ability);
    });

    this._abilitiesSubject.next(abilities);
    this.firstVisibleByDoc = abilities.at(0)?.id;

    this.lastVisibleByDoc = abilities.at(abilities.length-1)?.id;


    ///////////This is only to ensure that we are  on the last elements soo the suivant button is disabled
    const nextQuery = query(this.abilitiyDB, orderBy('id','desc'), limit(this.limit), startAfter(this.lastVisibleByDoc));
    getDocs(nextQuery).then(nextSnapshot => {
          this.weAreOntLastElement = nextSnapshot.empty;
      });
    //////////////////////////////////////
  });

  } 



  getPreviousAbilities() {

    const q = query(this.abilitiyDB, orderBy('id','desc'), limit(this.limit), endBefore(this.firstVisibleByDoc));
    getDocs(q).then((querySnapshot) => {

      let abilities: Ability[] = [];
      querySnapshot.forEach(doc => {
        const ability = doc.data() as Ability;
        abilities.push(ability);
      });
      console.log(abilities)

      this.firstVisibleByDoc = abilities.length > 0 ? abilities[0].id : null; // Update firstVisibleByDoc
      this.lastVisibleByDoc = abilities.at(abilities.length-1)?.id;

      this._abilitiesSubject.next(abilities);

    })
    //so the suivant button is enabled
    this.weAreOntLastElement=false;
      
  }
  




  async deleteItemFromStorage(fileUrl: string) {
    try {
      const storageRef = this.getFileRef(fileUrl); // Get reference to file
      await deleteObject(storageRef);
      console.log('File deleted successfully!');
      // Handle successful deletion (e.g., update UI, notify user)
    } catch (error) {
      console.error('Error deleting file:', error);
      // Handle errors appropriately (e.g., display error message to user)
    }
  }




  getFileRef(fileUrl:string) {
    return  ref(this.storage,fileUrl) // Get reference to file  
  }


  async updateAbility(ability: Ability, file: File, withFile: boolean): Promise<ResponseDto> {
    var abilityWithoutImage: AbilityUpdateDto;
    this._percentageSubject.next(0);
    
    try {
        // 1. Find the Document ID using the `id` field
        // We need the internal Firestore DocumentReference to use `updateDoc`
        const q = query(this.abilitiyDB, where('id', '==', ability.id));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            return { status: false, message: 'Docs not found!' };
        }
        
        // 'id' is unique, so we only need the first document.
        const docRefToUpdate = snapshot.docs[0].ref;

        if (withFile) {
            let fileRef = this.getFileRef(ability.image!);
            const updateTask = uploadBytesResumable(fileRef, file);

            // Wait for the upload task to complete and get the URL
            await new Promise<void>((resolve, reject) => {
                updateTask.on('state_changed', (snapshot) => {
                    let percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    this._percentageSubject.next(percentage!);
                }, (error) => reject(error), () => {
                    getDownloadURL(updateTask.snapshot.ref).then((url) => {
                        ability.image = url;
                        resolve();
                    });
                });
            });
            
            await updateDoc(docRefToUpdate, ability as any);

        } else {
            abilityWithoutImage = {
                name: ability.name,
                type: ability.type!,
                id: ability.id,
                rating: ability.rating,
            };
            
            // ✅ UPDATE DOC USAGE (Update without file)
            // Use the reference obtained earlier
            await updateDoc(docRefToUpdate, abilityWithoutImage as any);
        }

        return { status: true, message: 'Ability updated successfully!' };
    } catch (error) {
        console.error('Error updating ability:', error);
        return { status: false, message: 'Error updating ability.' };
    }
  }




  
  
  async deleteAbility(ability: Ability): Promise<ResponseDto> {
    const userConfirmed = confirm(`Are you sure you want to delete the ability "${ability.name}"?`);
    if (!userConfirmed) {
      return { status: false, message: 'Deletion canceled by user.' };
    }
    try {
      // 1. Find the Document ID using the `id` field
      const q = query(this.abilitiyDB, where('id', '==', ability.id));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        // We assume 'id' is unique, so we only delete the first document.
        const docRefToDelete = snapshot.docs[0].ref;
        
        // ✅ DELETE DOC USAGE
        await deleteDoc(docRefToDelete);

        await this.deleteItemFromStorage(ability.image!);
      } else {
        return { status: false, message: 'Docs not found!' };
      }

      // Refresh the abilities count and reload data
      this.getAbilitiesNumber();
      this.getAbilities(this.limit);
      
      return { status: true, message: 'Ability deleted successfully!' };
    } catch (error) {
      console.error('Error deleting ability:', error);
      return { status: false, message: 'Error deleting ability.' };
    }
  }
  

  getAbilitiesClient() {
    // 1. Build a simple query (no limits)
    const q = query(this.abilitiyDB, orderBy('id'));
    
    // 2. Execute a one-time fetch
    getDocs(q).then(snapshot => {
        let abilities: Ability[] = [];
        snapshot.docs.forEach(docSnap => {
            const ability = docSnap.data() as Ability;
            abilities.push(ability);
            this.lastVisibleByDoc = docSnap;
        });
        this._abilitiesSubject.next(abilities);
    });
  }

}




