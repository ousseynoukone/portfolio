import { AngularFireStorage } from "@angular/fire/compat/storage";
import { Observable, Subject } from "rxjs";
import { UploadResultForManyFiles, UploadResultForOneFile } from "src/app/models/dtos/uploadResultDto";

export function uploadFileList(fileList: FileList, basePathImgs : String ,storage : AngularFireStorage): Observable<UploadResultForManyFiles> {
    const totalFiles = fileList.length;
    let totalProgress = 0;
    const progressSubject = new Subject<UploadResultForManyFiles>();
    const downloadLinks: string[] = [];


    for (let i = 0; i < totalFiles; i++) {
        const file = fileList[i];
        const filePath = `${basePathImgs}/${file.name}`;
        const storageRef = storage.ref(filePath);
        const uploadTask = storageRef.put(file);
        let subscribing = uploadTask.percentageChanges().subscribe((percentage) => {
            totalProgress += (percentage ?? 0.1) / totalFiles; // Update total progress

            progressSubject.next({
              progress:  parseFloat(totalProgress.toFixed(2)) , downloadLinks: downloadLinks,
              
            }); 
        });


        uploadTask.then(async (snapshot) => {
            downloadLinks.push(await snapshot.ref.getDownloadURL()); // Get download link and add to the list
            subscribing.unsubscribe()
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



export function uploadFile(file: File ,  basePathVideo : String , storage : AngularFireStorage): Observable<UploadResultForOneFile> {
    const progressSubject = new Subject<UploadResultForOneFile>();
    let downloadLink: string = "";
    let currentPercentage = 0 ;
  
        const filePath = `${basePathVideo}/${file.name}`;
        const storageRef = storage.ref(filePath);
        const uploadTask = storageRef.put(file);
       
        uploadTask.percentageChanges().subscribe((percentage) => {
          if(percentage!=undefined){
            progressSubject.next({progress: parseFloat(percentage!.toFixed(2)),downloadLink:downloadLink}); 
            currentPercentage = percentage??0
          }
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