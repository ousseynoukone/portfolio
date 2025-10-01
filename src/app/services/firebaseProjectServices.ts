import { Injectable, OnInit, inject } from '@angular/core';
import { ResponseDto } from '../models/dtos/responseDto';
import { Observable, BehaviorSubject, Subject, firstValueFrom, forkJoin, lastValueFrom, map } from 'rxjs';

import { 
  Firestore, CollectionReference, collection, query, orderBy, limit, startAfter, endBefore, where, 
  getDocs, serverTimestamp, setDoc, deleteDoc, updateDoc, doc, QueryDocumentSnapshot, 
  collectionData 
} from '@angular/fire/firestore';

import { Storage, ref, deleteObject, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';

import { Project } from '../models/project';
import { ProjectDto, ProjectFileUpdateDto, WithImgVideoDto } from '../models/dtos/projectDto';
import { removeStringFromArray } from './helpers/helper';
import { uploadFile, uploadFileList } from './helpers/fileUploadHelper'; // Assumed to be// Type definition for firestore documents (to enforce ID presence)
export interface ProjectDtoWithID extends ProjectDto { id: string; }


@Injectable({
  providedIn: 'root',
})
export class FireBaseProjectService implements OnInit {

  private firestore: Firestore = inject(Firestore);
  private storage: Storage = inject(Storage);
  
  // Use collectionReference type and initialize lazily via getter
  private _projectsDb!: CollectionReference<ProjectDtoWithID>; 
  
  private basePathVideo = '/project/videos';
  private basePathImgs = '/project/imgs';

  // Streams for project data (unchanged)
  private _projectSubject: Subject<Project[]> = new Subject<Project[]>();
  private _index = new BehaviorSubject<number>(0); 

  // Percentage/Status flags (unchanged)
  public percentageImg: number = 0;
  public percentageVideo: number = 0;
  public isUpdatingVideo: boolean = false;
  public isUpdatingimg: boolean = false;
  public isUpdatingPP: boolean = false;
  public ppPercentage: number = 0;

  // Pagination Cursors: Store the actual document snapshot for reliable pagination
  private lastVisibleDoc: QueryDocumentSnapshot<ProjectDtoWithID> | any;
  private firstVisibleDoc: QueryDocumentSnapshot<ProjectDtoWithID> | any;

  // Pagination properties (unchanged)
  public limit: number = 5;
  public weAreOnTheFirstElement: boolean = true;
  public weAreOntLastElement: boolean = false;
  public totalOfItems: number = 0;

  
  // 5. Collection Getter (Lazy Initialization Fix)
  get projectsDb(): CollectionReference<ProjectDtoWithID> {
    if (!this._projectsDb) {
      // Initialize lazily using thecollection' function
      this._projectsDb = collection(this.firestore, 'projects') as CollectionReference<ProjectDtoWithID>;
    }
    return this._projectsDb;
  }
  
  constructor(){
    // The collection reference is now initialized via the getter on first access.
    
    this._index.subscribe(value => {
      if(value <= 0){
        this.weAreOnTheFirstElement = true
      } else {
        this.weAreOnTheFirstElement = false
      }
    });

  }

  // Lifecycle hook to perform initial data fetch
  ngOnInit(): void {
    this.getProjectNumber()
  }



  // --- GETTERS ---

  get projectSubject():Observable<Project[]> {
    return this._projectSubject.asObservable();
  }

  // NOTE: These now return the 'createdAt' value from the stored document snapshot.
  get getLastVisibleByName(): String {
    return this.lastVisibleDoc?.data()?.createdAt;
  }
  
  get getFirstVisibleByName(): String {
    return this.firstVisibleDoc?.data()?.createdAt;
  }

  // --- CORE METHODS ---

  // To order project images
  async saveOrderedImage(arrayOfImgsLinks : string [],projectID :string) : Promise<ResponseDto> {
    try {
      let updatedProject = {
        imgsLink : arrayOfImgsLinks
      }
      
      //Query and getDocs
      const q = query(this.projectsDb, where('id', '==', projectID), limit(1));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        //Get DocumentReference and use updateDoc
        const docRef = snapshot.docs[0].ref;
        await updateDoc(docRef, updatedProject);
      }
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

      let subscribeImgPercentage = uploadFileList$.subscribe(uploadResultImg=>{
        this.percentageImg=uploadResultImg.progress
      })

      let subscribeVideoPercentage = uploadFile$.subscribe(uploadResultVideo=>{
        this.percentageVideo = uploadResultVideo.progress
      })

      let subscribeProfilePicturePercentage = uploadPPFile$.subscribe(upLoadResultProfilePicture=>{
        this.ppPercentage = upLoadResultProfilePicture.progress
      })
      
      await lastValueFrom( forkJoin([uploadFileList$, uploadFile$,uploadPPFile$])
        .pipe(
          map(([uploadResultList, uploadResultFile,upLoadResultProfilePicture]) => {
            project.imgsLink = uploadResultList.downloadLinks;
            project.demoLink = uploadResultFile.downloadLink;
            project.ppLink = upLoadResultProfilePicture.downloadLink

            //Get a new document ID
            const newDocRef = doc(this.projectsDb);
            const newId = newDocRef.id;

            const projectDto: ProjectDtoWithID = {
              id: newId, // Use the newD
              title: project.title,
              demoLink: project.demoLink,
              minDescription: project.minDescription,
              fullDescription: project.fullDescription,
              imgsLink: project.imgsLink,
              usedTools: project.usedTools,
              usefullLinks:project.usefullLinks,
              type : project.type,
              ppLink : project.ppLink,
              isVisible : false,
              placeIndex: this.totalOfItems+1,
              createdAt: serverTimestamp() as any // serverTimestamp returns 'any'
            };

            //Use setDoc to add the document
            return setDoc(newDocRef, projectDto);
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
    //Build query
    const q = query(this.projectsDb, orderBy('placeIndex', 'asc'));

    //Use collectionData for streaming behavior
    collectionData(q).subscribe(querySnapshot => {
      let projects: Project[] = querySnapshot as Project[];
      this._projectSubject.next(projects);
    });
  }


  async getProjects() {
    const baseQuery = query(
      this.projectsDb, 
      limit(this.limit), 
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(baseQuery);
    
    let projects: Project[] = [];
    
    querySnapshot.docs.forEach(doc => {
      const project = doc.data() as Project;
      projects.push(project);
      
      // Store the document snapshot itself for reliable pagination
      this.lastVisibleDoc = doc; 
    });

    this._projectSubject.next(projects);

    if (projects.length !== 0) {
      const nextCheckQuery = query(
        this.projectsDb,
        limit(1), 
        orderBy('createdAt', 'desc'),
        startAfter(this.lastVisibleDoc) // Use the stored document snapshot
      );

      const nextPageSnapshot = await getDocs(nextCheckQuery);
      this.weAreOntLastElement = nextPageSnapshot.empty;
    }
  }

  
  getProjectNumber() {
    //Use collectionData to get a live count
    collectionData(this.projectsDb).subscribe(querySnapshot => {
      this.totalOfItems = querySnapshot.length
    });
  }

  //For the pagination
  async getNextProject() {
    this.weAreOntLastElement = true;
    
    if (!this.lastVisibleDoc) {
      await this.getProjects(); // Re-fetch initial page if cursor is lost
      return;
    }

    //Build query using startAfter with the stored doc snapshot
    const q = query(
      this.projectsDb, 
      limit(this.limit), 
      orderBy('createdAt', 'desc'),
      startAfter(this.lastVisibleDoc)
    );

    const querySnapshot = await getDocs(q);

    this._index.next(this._index.value + 1);  
    let projects: Project[] = [];
    
    querySnapshot.forEach(doc => {
      const project = doc.data() as Project;
      projects.push(project);
    });

    this._projectSubject.next(projects);

    if (querySnapshot.docs.length > 0) {
      // Update Cursors to the new document snapshots
      this.firstVisibleDoc = querySnapshot.docs[0];
      this.lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

      // Check if there are more items after current page
      const nextPageCheckQuery = query(
        this.projectsDb,
        orderBy('createdAt', 'desc'),
        startAfter(this.lastVisibleDoc),
        limit(1)
      );
      
      const nextPageSnapshot = await getDocs(nextPageCheckQuery);
      if (nextPageSnapshot.size > 0) {
        this.weAreOntLastElement = false;
      }
    } else {
      this.weAreOntLastElement = true; // Stay on last page if no results
    }
  }


  async getPreviousProject() {
    this.weAreOnTheFirstElement = true

    if (!this.firstVisibleDoc) {
      await this.getProjects(); // Re-fetch initial page if cursor is lost
      return;
    }

    //Build query using endBefore with the stored doc snapshot
    const q = query(
      this.projectsDb, 
      limit(this.limit), 
      orderBy('createdAt', 'desc'),
      endBefore(this.firstVisibleDoc)
    );
    
    const querySnapshot = await getDocs(q);
  
    this._index.next(this._index.value - 1);  
  
    let projects: Project[] = [];
    querySnapshot?.forEach(doc => {
      const project = doc.data() as Project;
      projects.push(project);
    });
    
    // Update Cursors to the new document snapshots
    if (querySnapshot.docs.length > 0) {
      this.firstVisibleDoc = querySnapshot.docs[0];
      this.lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    }

    this._projectSubject.next(projects);
    this.weAreOntLastElement = false; // Going backward means "next" button should be enabled
  }


  async deleteItemFromStorage(filePath: string) {
    try { 
      const storageRef = this.getFileRef(filePath); 
      await deleteObject(storageRef); //Use await for deleteObject
      console.log('File deleted successfully!');
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }


  async updateProjectOnly(project: ProjectDto): Promise<ResponseDto> {
    try {
      const projectWithoutImageAndVideo = {
        id : project.id,
        minDescription : project.minDescription,
        fullDescription : project.fullDescription,
        usedTools : project.usedTools,
        usefullLinks:project.usefullLinks,
        title : project.title ,
        type : project.type,
        placeIndex: project.placeIndex
      };

      //Query and getDocs
      const q = query(this.projectsDb, where('id', '==', project.id), limit(1));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        //Get DocumentReference and use updateDoc
        const docRef = snapshot.docs[0].ref;
        await updateDoc(docRef, projectWithoutImageAndVideo);
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
      const projectDto = {
        isVisible : project.isVisible
      };

      //Query and getDocs
      const q = query(this.projectsDb, where('id', '==', project.id), limit(1));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        //Get DocumentReference and use updateDoc
        const docRef = snapshot.docs[0].ref;
        await updateDoc(docRef, projectDto);
      } else {
        return { status: false, message: 'Docs not found!' };
      }

      return { status: true, message: 'Project visbility updated successfully!' };
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
      //Query and getDocs
      const q = query(this.projectsDb, where('id', '==', projectID), limit(1));
      const snapshot = await getDocs(q);

      let imgFileRef = this.getFileRef(imgLink); // Usingef()
      const updateImgTask = uploadBytesResumable(imgFileRef,img);

      updateImgTask.on('state_changed',(snapshot)=>{
        let percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        this.ppPercentage = parseFloat(percentage!.toFixed(2))
      })

      const uploadImgSnapshot = await updateImgTask;
      const imgUrl = await getDownloadURL(uploadImgSnapshot.ref);
      let updatedProject: any = {};

      updatedProject.ppLink = imgUrl;

      if (!snapshot.empty) {
        //Get DocumentReference and use updateDoc
        const docRef = snapshot.docs[0].ref;
        await updateDoc(docRef, updatedProject);
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
      //Query and getDocs
      const q = query(this.projectsDb, where('id', '==', projectFileUpdate.projectID), limit(1));
      const snapshot = await getDocs(q);

      let updatedProject: any = {};

      if (!snapshot.empty) {
        const docRef = snapshot.docs[0].ref; // Get docRef once

        if (withImgVideoDto.withImage) {
          let imgFileRef = this.getFileRef(withImgVideoDto.imgTpUpdateLink);
          const updateImgTask = uploadBytesResumable(imgFileRef,projectFileUpdate.imgFile)

          updateImgTask.on('state_changed',(snapshot)=>{
            let percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            this.percentageImg = parseFloat(percentage!.toFixed(2));
          })

          this.isUpdatingimg = true;

          const uploadImgSnapshot = await updateImgTask;
          const imgUrl = await getDownloadURL(uploadImgSnapshot.ref);

          let imgsLink = removeStringFromArray(projectFileUpdate.projectImgsLinks, withImgVideoDto.imgTpUpdateLink);
          imgsLink.push(imgUrl);

          updatedProject.imgsLink = imgsLink;
        }

        if (withImgVideoDto.withVideo) {
          let videoFileRef = this.getFileRef(withImgVideoDto.demoLink);
          const updateVideoTask = uploadBytesResumable(videoFileRef,projectFileUpdate.videoFile);

          updateVideoTask.on('state_changed',(snapshot)=>{
            let percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            this.percentageVideo = parseFloat(percentage!.toFixed(2));
          })

          this.isUpdatingVideo = true;

          const uploadVideoSnapshot = await updateVideoTask;
          const videoUrl = await getDownloadURL(uploadVideoSnapshot.ref);

          updatedProject.demoLink = videoUrl;
        }

        if (withImgVideoDto.withImage || withImgVideoDto.withVideo) {
          //Use updateDoc
          await updateDoc(docRef, updatedProject);
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


  async deleteOneImage(imgLinks : string  [],imgToDeleteLink : string , projectId : string  ){

    const userConfirmed = confirm(`Are you sure you want to delete that image ?`);
  
    if (!userConfirmed) {
      return { status: false, message: 'Deletion canceled by user.' };
    }
    try {
      let imgsLinks = removeStringFromArray(imgLinks, imgToDeleteLink);

      let updatedProject = {
        imgsLink : imgsLinks
      }

      //Query and getDocs
      const q = query(this.projectsDb, where('id', '==', projectId), limit(1));
      const snapshot = await getDocs(q);
    
      if (!snapshot.empty) {
        //Get DocumentReference and use updateDoc
        const docRef = snapshot.docs[0].ref;
        await updateDoc(docRef, updatedProject);

        await this.deleteItemFromStorage(imgToDeleteLink)

      } else {
        return { status: false, message: 'Docs not found!' };
      }
      return { status: true, message: 'Image deleted successfully!' };
    } catch (error) {
      console.error('Error deleting ability:', error);
      return { status: false, message: 'Error deleting ability.' };
    }
  }


  async addOneImageToProject(imgFile : File ,imgLinks : string [], projectId : string  ): Promise<ResponseDto> {
    try {
      this.percentageImg = 0;

      const uploadFile$ = uploadFile(imgFile,this.basePathImgs,this.storage);

      let downloadlink = await lastValueFrom(uploadFile$.pipe(map(response=>{
        this.percentageImg = response.progress
        return response.downloadLink;
        })))

      //Query and getDocs
      const q = query(this.projectsDb, where('id', '==', projectId), limit(1));
      const snapshot = await getDocs(q);
      
      imgLinks.push(downloadlink)

      let updatedProject = {
        imgsLink : imgLinks
      }

      if (!snapshot.empty) {
        //Get DocumentReference and use updateDoc
        const docRef = snapshot.docs[0].ref;
        await updateDoc(docRef, updatedProject);
      }
      this.initImgVideoPercentage()

      return { status: true, message: 'Image added successfully.' };
    } catch (error) {
      this.initImgVideoPercentage()

      return { status: false, message: String(error) };
    }
  }


  async deleteProject(project: Project): Promise<ResponseDto> {
    const userConfirmed = confirm(`Are you sure you want to delete the project  "${project.title}"?`);
  
    if (!userConfirmed) {
      return { status: false, message: 'Deletion canceled by user.' };
    }
    try {
      //Query and getDocs
      const q = query(this.projectsDb, where('id', '==', project.id), limit(1));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        //Get DocumentReference and use deleteDoc
        const docRef = snapshot.docs[0].ref;
        await deleteDoc(docRef);

        await this.deleteItemFromStorage(project.demoLink)

        // Using Promise.all to ensure all deletions finish (better than forEach async)
        await Promise.all(project.imgsLink.map(imgLink => this.deleteItemFromStorage(imgLink)));

      } else {
        return { status: false, message: 'Docs not found!' };
      }

      return { status: true, message: 'Project deleted successfully!' };
    } catch (error) {
      console.error('Error deleting project:', error);
      return { status: false, message: 'Error deleting project.' };
    }
  }


  getFileRef(fileUrl:string) {
    //Use firebase/storage ref()
    return ref(this.storage,fileUrl)
  }
}