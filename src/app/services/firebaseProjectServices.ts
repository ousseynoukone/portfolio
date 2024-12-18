
import { Injectable, inject } from '@angular/core';
import {ResponseDto} from '../models/dtos/responseDto';
import { Observable } from 'rxjs/internal/Observable';
import {BehaviorSubject, Subject, first, firstValueFrom, forkJoin, lastValueFrom, map, subscribeOn, take } from 'rxjs';
import { serverTimestamp } from "firebase/firestore";

import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument ,  } from '@angular/fire/compat/firestore';
import { AngularFireStorage} from '@angular/fire/compat/storage';
import { Project } from '../models/project';
import { ProjectDto, ProjectFileUpdateDto, WithImgVideoDto } from '../models/dtos/projectDto';
import { removeStringFromArray } from './helpers/helper';
import { uploadFile, uploadFileList } from './helpers/fileUploadHelper';

@Injectable({
  providedIn: 'root',
})
export class FireBaseProjectService {

  projectsDb !: AngularFirestoreCollection<any>;
  private basePathVideo = '/project/videos';
  private basePathImgs = '/project/imgs';

  // Streams  for project data
  private _projectSubject: Subject<Project[]> = new Subject<Project[]>();

  // Streams  for next and previous pagination button : TO KNOW WHETHER WE ARE ON THE FIRST PAGE OR NOT
  private _index = new BehaviorSubject<number>(0); // Initial value is 0  

  //percentage
  public percentageImg: number = 0;
  public percentageVideo:number = 0;


  public isUpdatingVideo :  boolean = false;
  public isUpdatingimg: boolean = false;
  public isUpdatingPP: boolean = false;
  public ppPercentage : number = 0 ;


  //for pagination
  private lastVisibleByDoc: any;
  private firstVisibleByDoc: any;


  //for pagination
  public limit : number = 5
  public weAreOnTheFirstElement : boolean = true;
  public weAreOntLastElement : boolean = false;
  public totalOfItems : number = 0;


  constructor(private firestore : AngularFirestore, private storage: AngularFireStorage){
    // Initialize the collection with an orderBy clause
    this.projectsDb = this.firestore.collection('projects');


    this._index.subscribe(value => {
      
     if(value<=0){
      this.weAreOnTheFirstElement = true
     }else{
      this.weAreOnTheFirstElement = false
     }
    })

     this.getProjectNumber()



  }




  get projectSubject():Observable<Project[]> {
    return this._projectSubject.asObservable();
  }

  get getLastVisibleByName(): String{
    return this.lastVisibleByDoc
  }
  
  get getFirstVisibleByName(): String{
    return this.firstVisibleByDoc
  }

// To order project images
  async saveOrderedImage(arrayOfImgsLinks : string [],projectID :string) : Promise<ResponseDto> {

    try {
      let updatedProject = {
        imgsLink : arrayOfImgsLinks
       }
       const snapshot = await this.projectsDb.ref.where('id', '==', projectID).get();
    
       if (!snapshot.empty) {
         snapshot.forEach(doc => {
           doc.ref.update(updatedProject);
       });}
       return { status: true, message: 'Images order updated successfuly ! ' };

    } catch (error) {
      return { status: false, message: `Something bad happened while save images new order : ${error}` };

    }


  }


  async addProject(project: Project): Promise<ResponseDto> {
    try {
      this.percentageImg = 0;
      this.percentageVideo=0;

        const uploadFileList$ = uploadFileList(project.imgsFile,this.basePathImgs,this.storage);
        const uploadFile$ = uploadFile(project.videoFile,this.basePathVideo,this.storage);
        const uploadPPFile$ = uploadFile(project.profilePicture,this.basePathVideo,this.storage);

      let subscribeImgPercentage =   uploadFileList$.subscribe(uploadResultImg=>{
          this.percentageImg=uploadResultImg.progress
        })

        let subscribeVideoPercentage =  uploadFile$.subscribe(uploadResultVideo=>{
          this.percentageVideo = uploadResultVideo.progress
        })


        let subscribeProfilePicturePercentage =  uploadPPFile$.subscribe(upLoadResultProfilePicture=>{
          this.ppPercentage = upLoadResultProfilePicture.progress
        })
      
      

        await lastValueFrom( forkJoin([uploadFileList$, uploadFile$,uploadPPFile$])
            .pipe(
                map(([uploadResultList, uploadResultFile,upLoadResultProfilePicture]) => {
                        project.imgsLink = uploadResultList.downloadLinks;
                        project.demoLink = uploadResultFile.downloadLink;
                        project.ppLink = upLoadResultProfilePicture.downloadLink

                    const projectDto: ProjectDto = {
                        id: project.id,
                        title: project.title,
                        demoLink: project.demoLink,
                        minDescription: project.minDescription,
                        fullDescription: project.fullDescription,
                        imgsLink: project.imgsLink,
                        usedTools: project.usedTools,
                        usefullLinks:project.usefullLinks,
                        type : project.type,
                        ppLink :  project.ppLink,
                        isVisible : false,
                        placeIndex: this.totalOfItems+1,
                        createdAt: serverTimestamp()
                        
                    };


                    const newId = this.firestore.createId();
                    projectDto.id = newId;
                    return this.projectsDb.add(projectDto);
                })
            )
          )
          subscribeImgPercentage.unsubscribe()
          subscribeVideoPercentage.unsubscribe()
          subscribeProfilePicturePercentage.unsubscribe()
          this.initImgVideoPercentage()

        return { status: true, message: 'Project added successfully.' };
    } catch (error) {
      this.initImgVideoPercentage()

        return { status: false, message: String(error) };
        
    }
  }

  fetchProjectWithoutLimit(){
    this.firestore.collection('projects',ref=>ref.orderBy('placeIndex','asc')).valueChanges().subscribe(querySnapshot => {
      let projects: Project[] = [];
      querySnapshot.forEach(doc => {
        const project = doc as Project;
        projects.push(project);
      });

      this._projectSubject.next(projects);
    });
  }



  async getProjects() {
    this.firestore.collection('projects',ref=>ref.limit(this.limit).orderBy('createdAt','desc')).valueChanges().subscribe(querySnapshot => {
      
      let projects: Project[] = [];
      
      querySnapshot.forEach(doc => {
        const project = doc as Project;
        projects.push(project);
        //For saving the last displated project
        this.lastVisibleByDoc = project.createdAt
      });

      this._projectSubject.next(projects);

      if(projects.length!=0){
            //This is only to ensure that we are  on the last elements soo the suivant button is disabled
            this.firestore.collection('projects',ref=>ref.limit(this.limit).orderBy('createdAt','desc').startAfter(this.lastVisibleByDoc)).valueChanges().subscribe(querySnapshot => {
             
              if(querySnapshot.length!=0){
                this.weAreOntLastElement=false;
              }
            }); 
      }

    });
  }


  

  getProjectNumber() {
    this.projectsDb.valueChanges().subscribe(querySnapshot => {
      this.totalOfItems=querySnapshot.length
    });
  }



  //For the pagination
  async getNextProject() {
    this.weAreOntLastElement = true;

    // Get current page
    const querySnapshot = await firstValueFrom( this.firestore.collection('projects', ref =>
      ref.limit(this.limit)
         .orderBy('createdAt', 'desc')
         .startAfter(this.lastVisibleByDoc)
    ).get());

    this._index.next(this._index.value + 1);  
    let projects: Project[] = [];
    querySnapshot?.forEach(doc => {
        const project = doc.data() as Project;
        projects.push(project);
    });

    this._projectSubject.next(projects);
    this.firstVisibleByDoc = projects.at(0)?.createdAt;
    this.lastVisibleByDoc = projects.at(projects.length-1)?.createdAt;

    // Check if there are more items after current page
    const nextPageSnapshot = await firstValueFrom( this.firestore.collection('projects', ref =>
      ref.orderBy('createdAt', 'desc')
         .startAfter(this.lastVisibleByDoc)
    ).get() )

    if (nextPageSnapshot!.size > 0) {
        this.weAreOntLastElement = false;
    }
}



  async getPreviousProject() {
    //DISABLE TO PREVIOUS BUTTON
    this.weAreOnTheFirstElement = true
      const querySnapshot = await firstValueFrom( this.firestore.collection('projects', ref =>
        ref.limit(this.limit)
           .orderBy('createdAt','desc')
           .endBefore(this.firstVisibleByDoc)
      ).get());
  
      this._index.next(this._index.value - 1);  
  
      let projects: Project[] = [];
      querySnapshot?.forEach(doc => {
          const project = doc.data() as Project;
          projects.push(project);
      });
  
      this.firstVisibleByDoc = projects.length > 0 ? projects[0].createdAt : null;
      this.lastVisibleByDoc = projects.at(projects.length-1)?.createdAt;
  
      this._projectSubject.next(projects);
      this.weAreOntLastElement = false;
  }




  async deleteItemFromStorage(filePath: string) {
    try {
      const storageRef = this.storage.refFromURL(filePath); // Get reference to file
      storageRef.delete(); // Delete the file
      console.log('File deleted successfully!');
      // Handle successful deletion (e.g., update UI, notify user)
    } catch (error) {
      console.error('Error deleting file:', error);
      // Handle errors appropriately (e.g., display error message to user)
    }
  }



  async updateProjectOnly(project: ProjectDto): Promise<ResponseDto> {
    try {
        const snapshot = await this.projectsDb.ref.where('id', '==', project.id).get();


        const  projectWithoutImageAndVideo = {
              id : project.id,
              minDescription : project.minDescription,
              fullDescription : project.fullDescription,
              usedTools : project.usedTools,
              usefullLinks:project.usefullLinks,
              title : project.title ,
              type : project.type,
              placeIndex: project.placeIndex
            };

        if (!snapshot.empty) {
            snapshot.forEach(doc => {
                doc.ref.update(projectWithoutImageAndVideo);
            });
        } else {
            return { status: false, message: 'Docs not found!' };
        }

        return { status: true, message: 'Project updated successfully!' };
    } catch (error) {
        console.error('Error updating ability:', error);
        return { status: false, message: 'Error updating ability.' };
    }
  }






  
  async updateProjectVisibility(project: any): Promise<ResponseDto> {
    try {
        const snapshot = await this.projectsDb.ref.where('id', '==', project.id).get();


        const  projectDto = {
          isVisible : project.isVisible
            };

        if (!snapshot.empty) {
            snapshot.forEach(doc => {
                doc.ref.update(projectDto);
            });
        } else {
            return { status: false, message: 'Docs not found!' };
        }

        return { status: true, message: 'Project  visbility updated successfully!' };
    } catch (error) {
        console.error('Error while updating project visbility :', error);
        return { status: false, message: 'Error updating project visbility.' };
    }
  }

  initImgVideoPercentage(){
    this.percentageVideo=0;
    this.percentageImg = 0;
    this.ppPercentage = 0 ;
  }




  async updatePP( projectImgsLinks : string [],projectID : string , img :File,imgLink : string):Promise<ResponseDto>{
  this.isUpdatingPP = true
  try {
    const snapshot = await this.projectsDb.ref.where('id', '==', projectID).get();

    let imgFileRef = await this.getFileRef(imgLink);
    const updateImgTask = imgFileRef.put(img);

    updateImgTask.percentageChanges().subscribe((percentage) => {
      this.ppPercentage =  parseFloat(percentage!.toFixed(2))
  });


  const uploadImgSnapshot = await updateImgTask;
  const imgUrl = await uploadImgSnapshot.ref.getDownloadURL();
  let updatedProject: any = {};

  updatedProject.ppLink = imgUrl;


  if (!snapshot.empty) {
        snapshot.forEach(doc => {
            doc.ref.update(updatedProject);
        });
    
  } else {
    this.isUpdatingPP = false
    this.initImgVideoPercentage()
      return { status: false, message: 'Docs not found!' };
  }

  this.isUpdatingPP = false
  this.initImgVideoPercentage()

  return { status: true, message: 'Profile picture updated succesfully !' };



  } catch (error) {
    console.error('Error updating pp project:', error);
    this.isUpdatingPP = false
    this.initImgVideoPercentage()

    return { status: false, message: 'Error while updating profile picture .' };

  }

  }


  async updateProjectVideoImgOnly(projectFileUpdate: ProjectFileUpdateDto, withImgVideoDto: WithImgVideoDto): Promise<ResponseDto> {
    this.percentageImg = 0;
    this.percentageVideo=0;


    try {
        const snapshot = await this.projectsDb.ref.where('id', '==', projectFileUpdate.projectID).get();

        let updatedProject: any = {};

        if (withImgVideoDto.withImage) {
            let imgFileRef = await this.getFileRef(withImgVideoDto.imgTpUpdateLink);
            const updateImgTask = imgFileRef.put(projectFileUpdate.imgFile);

            updateImgTask.percentageChanges().subscribe((percentage) => {
                this.percentageImg = parseFloat(percentage!.toFixed(2));
            });
            this.isUpdatingimg = true;

            const uploadImgSnapshot = await updateImgTask;
            const imgUrl = await uploadImgSnapshot.ref.getDownloadURL();

            let imgsLink = removeStringFromArray(projectFileUpdate.projectImgsLinks, withImgVideoDto.imgTpUpdateLink);
            imgsLink.push(imgUrl);

            updatedProject.imgsLink = imgsLink;
        }

        if (withImgVideoDto.withVideo) {
            let videoFileRef = await this.getFileRef(withImgVideoDto.demoLink);
            const updateVideoTask = videoFileRef.put(projectFileUpdate.videoFile);

            updateVideoTask.percentageChanges().subscribe((percentage) => {
            
                this.percentageVideo =  parseFloat(percentage!.toFixed(2));
            });
            this.isUpdatingVideo = true;

            const uploadVideoSnapshot = await updateVideoTask;
            const videoUrl = await uploadVideoSnapshot.ref.getDownloadURL();

            updatedProject.demoLink = videoUrl;
        }

        if (!snapshot.empty) {
            if (withImgVideoDto.withImage || withImgVideoDto.withVideo) {
                snapshot.forEach(doc => {
                    doc.ref.update(updatedProject);
                });
            } else {
              this.initImgVideoPercentage()

                return { status: false, message: 'Both video and image have not been provided.' };
            }
        } else {
          this.initImgVideoPercentage()

            return { status: false, message: 'Docs not found!' };
        }
        this.isUpdatingVideo=false
        this.isUpdatingimg=false
        this.initImgVideoPercentage()

        return { status: true, message: 'Video END/OR Image have been updated successfully!' };
    } catch (error) {
        console.error('Error updating project:', error);
        this.initImgVideoPercentage()

        return { status: false, message: 'Error updating project.' };
    }

  }




  async deleteOneImage(imgLinks : string  [],imgToDeleteLink : string , projectId : string  ){

    const userConfirmed = confirm(`Are you sure you want to delete that image ?`);
  
    if (!userConfirmed) {
      return { status: false, message: 'Deletion canceled by user.' };
    }
    try {

      let imgsLinks = removeStringFromArray(imgLinks, imgToDeleteLink);

     let updatedProject = {
      imgsLink : imgsLinks
     }

      const snapshot = await this.projectsDb.ref.where('id', '==', projectId).get();
  
      if (!snapshot.empty) {
        snapshot.forEach(doc => {
          doc.ref.update(updatedProject);
      });

      await this.deleteItemFromStorage(imgToDeleteLink)

      }else{
        return { status: false, message: 'Docs not found!' };
      }
      return { status: true, message: 'Image deleted successfully!' };
    } catch (error) {
      console.error('Error deleting ability:', error);
      // If there's an error during deletion
      // Handle errors appropriately (e.g., display error message to the user)
      return { status: false, message: 'Error deleting ability.' };
    }

  

  }




  async addOneImageToProject(imgFile : File ,imgLinks : string [], projectId : string  ): Promise<ResponseDto> {
    try {
      this.percentageImg = 0;

        const uploadFile$ = uploadFile(imgFile,this.basePathImgs,this.storage);

      let downloadlink =  await lastValueFrom(uploadFile$.pipe(map(response=>{
        this.percentageImg = response.progress
        return response.downloadLink;
        })))

        const snapshot = await this.projectsDb.ref.where('id', '==', projectId).get();
        imgLinks.push(downloadlink)

        let updatedProject = {
          imgsLink : imgLinks
        }

        if (!snapshot.empty) {
          snapshot.forEach(doc => {
            doc.ref.update(updatedProject);
        });
      }
      this.initImgVideoPercentage()

        return { status: true, message: 'Image added successfully.' };
    } catch (error) {
      this.initImgVideoPercentage()

        return { status: false, message: String(error) };
    }
  }






  async deleteProject(project: Project): Promise<ResponseDto> {
    // Confirm the deletion with the user
    const userConfirmed = confirm(`Are you sure you want to delete the project  "${project.title}"?`);
  
    // If the user cancels, return early
    if (!userConfirmed) {
      return { status: false, message: 'Deletion canceled by user.' };
    }
    try {
  
      // Create query with condition
      const snapshot = await this.projectsDb.ref.where('id', '==', project.id).get();
  
      // Check if the document matching the condition exists
      if (!snapshot.empty) {
        // Delete the document
        snapshot.forEach(doc => {
          doc.ref.delete();
        });

        
        await this.deleteItemFromStorage(project.demoLink)

        project.imgsLink.forEach(async imgLink=>{
          await this.deleteItemFromStorage(imgLink)
        })

      }else{
        return { status: false, message: 'Docs not found!' };
      }

  
      return { status: true, message: 'Project deleted successfully!' };
    } catch (error) {
      console.error('Error deleting project:', error);
      // If there's an error during deletion
      // Handle errors appropriately (e.g., display error message to the user)
      return { status: false, message: 'Error deleting project.' };
    }
  }



  async getFileRef(fileUrl:string) {
    return  this.storage.refFromURL(fileUrl); // Get reference to file  
  }

}


