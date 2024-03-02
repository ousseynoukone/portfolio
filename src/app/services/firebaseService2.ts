
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { LoginDto } from '../models/dtos/loginDto';
import { Injectable, inject } from '@angular/core';
import {ResponseDto} from '../models/dtos/responseDto';
import { Observable } from 'rxjs/internal/Observable';
import { BehaviorSubject, Subject, forkJoin, lastValueFrom, map } from 'rxjs';

import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument ,  } from '@angular/fire/compat/firestore';
import { AngularFireStorage} from '@angular/fire/compat/storage';
import { AbilityUpdateDto } from '../models/dtos/abilitieUpdateDto';
import { Project } from '../models/project';
import { UploadResultForManyFiles, UploadResultForOneFile } from '../models/dtos/uploadResultDto';
import { ProjectDto } from '../models/dtos/projectDto';

@Injectable({
  providedIn: 'root',
})
export class FireBaseStorageService2 {

  projectsDb !: AngularFirestoreCollection<any>;
  private basePathVideo = '/project/videos';
  private basePathImgs = '/project/imgs';

  // Streams for percentage and abilities
  private _percentageSubjectImg: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private _percentageSubjectVideo: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private _projectSibject: Subject<Project[]> = new Subject<Project[]>();


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
    this.projectsDb = firestore.collection('projects');

    this.abilitiesSubject.subscribe(abilities => {
      this.weAreOntFirstElement = abilities.some(ability => ability.id === this.firstDocId);
    });
    this.getAbilitiesNumber()
  }

  get percentageImg(): Observable<Number> {
    return this._percentageSubjectVideo.asObservable();
  }

  get percentageVideo(): Observable<Number> {
    return this._percentageSubjectImg.asObservable();
  }

  get abilitiesSubject():Observable<Project[]> {
    return this._projectSibject.asObservable();
  }


  get getLastVisibleByName(): String{
    return this.lastVisibleByDoc
  }
  
  get getFirstVisibleByName(): String{
    return this.firstVisibleByDoc
  }


  uploadFileList(fileList: FileList): Observable<UploadResultForManyFiles> {
    const totalFiles = fileList.length;
    let totalProgress = 0;
    const progressSubject = new Subject<UploadResultForManyFiles>();
    const downloadLinks: string[] = [];

    console.log(fileList)

    for (let i = 0; i < totalFiles; i++) {
        const file = fileList[i];
        const filePath = `${this.basePathImgs}/${file.name}`;
        const storageRef = this.storage.ref(filePath);
        const uploadTask = storageRef.put(file);

        uploadTask.percentageChanges().subscribe((percentage) => {
            totalProgress += percentage??0.1 / totalFiles; // Update total progress
            progressSubject.next({
              progress: totalProgress, downloadLinks: downloadLinks,
              
            }); // Emit overall progress and download links
        });


        uploadTask.then(async (snapshot) => {
            downloadLinks.push(await snapshot.ref.getDownloadURL()); // Get download link and add to the list
            if (downloadLinks.length === totalFiles) {
                progressSubject.next({
                  progress: 100, downloadLinks: downloadLinks,
                 
                }); // Emit 100% progress and download links
                progressSubject.complete(); // Complete when all files are uploaded
            }
        }).catch((error) => {
            progressSubject.error(error); // Emit error if any
        });
    }

    return progressSubject.asObservable();
}

uploadFile(file: File): Observable<UploadResultForOneFile> {
  const progressSubject = new Subject<UploadResultForOneFile>();
  let downloadLink: string = "";
  let currentPercentage = 0 ;

      const filePath = `${this.basePathVideo}/${file.name}`;
      const storageRef = this.storage.ref(filePath);
      const uploadTask = storageRef.put(file);

      uploadTask.percentageChanges().subscribe((percentage) => {
          progressSubject.next({progress:percentage??0,downloadLink:downloadLink}); 
          currentPercentage = percentage??0
      });

      uploadTask.then(async snapshot => {
        downloadLink = await snapshot.ref.getDownloadURL()
        progressSubject.next({progress:currentPercentage??0,downloadLink:downloadLink}); 
        progressSubject.complete();  
      }).catch((error) => {
          progressSubject.error(error); // Emit error if any
      });
  return  progressSubject.asObservable();
}



async addProject(project: Project): Promise<ResponseDto> {
  try {
    this._percentageSubjectImg.next(0);
    this._percentageSubjectVideo.next(0);

      const uploadFileList$ = this.uploadFileList(project.imgsFile);
      const uploadFile$ = this.uploadFile(project.videoFile);
    

      await lastValueFrom( forkJoin([uploadFileList$, uploadFile$])
          .pipe(
              map(([uploadResultList, uploadResultFile]) => {
                  console.log(uploadResultList.progress);
                  console.log(uploadResultFile.progress);

                  this._percentageSubjectImg.next(uploadResultList.progress);
                  this._percentageSubjectVideo.next(uploadResultFile.progress);

                      project.imgsLink = uploadResultList.downloadLinks;

                      project.demoLink = uploadResultFile.downloadLink;
                  

                  const projectDto: ProjectDto = {
                      id: project.id,
                      title: project.title,
                      demoLink: project.demoLink,
                      minDescription: project.minDescription,
                      fullDescription: project.fullDescription,
                      imgsLink: project.imgsLink,
                      usedTools: project.usedTools
                  };

                  const newId = this.firestore.createId();
                  projectDto.id = newId;
                  return this.projectsDb.add(projectDto);
              })
          )
         )
         

      return { status: true, message: 'Project added successfully.' };
  } catch (error) {
      return { status: false, message: String(error) };
  }
}


  getProjects(limit : any) {
    this.limit=limit
    this.firestore.collection('projects',ref=>ref.limit(this.limit).orderBy('id','desc')).valueChanges().subscribe(querySnapshot => {
      
      let projests: Project[] = [];
      querySnapshot.forEach(doc => {
        const project = doc as Project;
        projests.push(project);
        //For saving the last displated ability
        this.lastVisibleByDoc = project.id
      });

      this.firstDocId = projests.at(0)?.id;


      this._projectSibject.next(projests);

      if(projests.length!=0){
            //This is only to ensure that we are  on the last elements soo the suivant button is disabled
            this.firestore.collection('projects',ref=>ref.limit(this.limit).orderBy('id','desc').startAfter(this.lastVisibleByDoc)).valueChanges().subscribe(querySnapshot => {
             
              if(querySnapshot.length!=0){
                this.weAreOntLastElement=false;
              }
            
            }); 
      }

    });
  }


  

  getAbilitiesNumber() {
    this.projectsDb.valueChanges().subscribe(querySnapshot => {
      this.totalOfItems=querySnapshot.length
    });
  }



//For the pagination
getNextAbilities() {
  this.weAreOntLastElement = true
    this.firestore.collection('projects',ref=>ref.limit(this.limit).orderBy('id','desc').startAfter(this.lastVisibleByDoc)).valueChanges().subscribe(querySnapshot => {
      
      let projects: Project[] = [];
      querySnapshot.forEach(doc => {
        const project = doc as Project;
        projects.push(project);
      });

      this._projectSibject.next(projects);
      this.firstVisibleByDoc = projects.at(0)?.id;

      console.log("firstVisibleByDoc " + this.firstVisibleByDoc)

      this.lastVisibleByDoc = projects.at(projects.length-1)?.id;
    ///////////This is only to ensure that we are  on the last elements soo the suivant button is disabled
    this.firestore.collection('projects',ref=>ref.limit(this.limit).orderBy('id','desc').startAfter(this.lastVisibleByDoc)).valueChanges().subscribe(querySnapshot => {
      console.log("laba "+querySnapshot.length)
      if(querySnapshot.length!=0){
        this.weAreOntLastElement=false;
      }});
    //////////////////////////////////////
 
    }); 

  } 



  getPreviousAbilities() {
    this.firestore.collection('projects', ref =>
      ref.limitToLast(this.limit).orderBy('id','desc').endBefore(this.firstVisibleByDoc)
    ).valueChanges().subscribe(querySnapshot => {
      let projects: Project[] = [];
      querySnapshot.forEach(doc => {
        const project = doc as Project;
        projects.push(project);
      });
      console.log(projects)

      this.firstVisibleByDoc = projects.length > 0 ? projects[0].id : null; // Update firstVisibleByDoc
      this.lastVisibleByDoc = projects.at(projects.length-1)?.id;

      this._projectSibject.next(projects);
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



//   async updateAbility(ability: Ability, file: File, withFile: boolean): Promise<ResponseDto> {
  // this._percentageSubjectImg.next(0);
  // this._percentageSubjectVideo.next(0);
//     var abilityWithoutImage: AbilityUpdateDto;
//     this._percentageSubject.next(0);
//     try {
//         const snapshot = await this.abilitiyDB.ref.where('id', '==', ability.id).get();

//         if (withFile) {
//             let fileRef = await this.getFileRef(ability.image!);
//             const updateTask = fileRef.put(file);

//             updateTask.percentageChanges().subscribe((percentage) => {
//                 this._percentageSubject.next(percentage!);
//             });

//             const uploadSnapshot = await updateTask;
//             const url = await uploadSnapshot.ref.getDownloadURL();

//             ability.image = url;
//         } else {
//             abilityWithoutImage = {
//                 name: ability.name,
//                 type: ability.type!,
//                 id: ability.id,
//                 rating: ability.rating
//             };
//         }

//         if (!snapshot.empty) {
//             snapshot.forEach(doc => {
//                 doc.ref.update(withFile ? ability : abilityWithoutImage);
//             });
//         } else {
//             return { status: false, message: 'Docs not found!' };
//         }

//         return { status: true, message: 'Ability updated successfully!' };
//     } catch (error) {
//         console.error('Error updating ability:', error);
//         return { status: false, message: 'Error updating ability.' };
//     }
// }





  
  
  // async deleteAbility(ability: Project): Promise<ResponseDto> {
  //   // Confirm the deletion with the user
  //   const userConfirmed = confirm(`Are you sure you want to delete the ability "${ability.name}"?`);
  
  //   // If the user cancels, return early
  //   if (!userConfirmed) {
  //     return { status: false, message: 'Deletion canceled by user.' };
  //   }
  //   try {
  
  //     // Create query with condition
  //     const snapshot = await this.abilitiyDB.ref.where('id', '==', ability.id).get();
  
  //     // Check if the document matching the condition exists
  //     if (!snapshot.empty) {
  //       // Delete the document
  //       snapshot.forEach(doc => {
  //         doc.ref.delete();
  //       });

  //       await this.deleteItemFromStorage(ability.image!)
  //     }else{
  //       return { status: false, message: 'Docs not found!' };
  //     }

  
  //     return { status: true, message: 'Project deleted successfully!' };
  //   } catch (error) {
  //     console.error('Error deleting ability:', error);
  //     // If there's an error during deletion
  //     // Handle errors appropriately (e.g., display error message to the user)
  //     return { status: false, message: 'Error deleting ability.' };
  //   }
  // }
  

  // getProjectClient(){
  //   this.abilitiyDB.valueChanges().subscribe(querySnapshot => {
  //     let abilities: Project[] = [];
  //     querySnapshot.forEach(doc => {
  //       const ability = doc as Project;
  //       abilities.push(ability);
  //       //For saving the last displated ability
  //       this.lastVisibleByDoc = ability.id
  //     });
  //     this._projectSibject.next(abilities); 
  //   });
  // }



}
