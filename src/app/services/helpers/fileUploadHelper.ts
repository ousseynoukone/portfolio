
import { Storage, ref, uploadBytesResumable, getDownloadURL, percentage } from '@angular/fire/storage';
import { uploadBytes, UploadTask } from 'firebase/storage'; 

import { Observable, Subject } from 'rxjs';
import { UploadResultForManyFiles, UploadResultForOneFile } from "src/app/models/dtos/uploadResultDto"; 



export function uploadFileList(fileList: FileList, basePathImgs : String ,storage : Storage): Observable<UploadResultForManyFiles> {
    const totalFiles = fileList.length;
    let totalProgress = 0;
    const progressSubject = new Subject<UploadResultForManyFiles>();
    const downloadLinks: string[] = [];


    for (let i = 0; i < totalFiles; i++) {
        const file = fileList[i];
        const filePath = `${basePathImgs}/${file.name}`;
        const storageRef = ref(storage,filePath);
        const uploadTask =  uploadBytesResumable(storageRef,file);
        uploadTask.on('state_changed', (snapshot) => {
           let  percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            totalProgress += percentage / totalFiles;
            progressSubject.next({
              progress:  parseFloat(totalProgress.toFixed(2)) , downloadLinks: downloadLinks,
              
            });
        })
      

        uploadTask.then(async (snapshot) => {   
            downloadLinks.push(await getDownloadURL(snapshot.ref)); // Get download link and add to the list
            if (downloadLinks.length === totalFiles) {
                progressSubject.next({
                  progress: 100, downloadLinks: downloadLinks,
                 
                }); // Emit 100% progress and download links
                progressSubject.complete(); // Complete when all files are uploaded
            }
            unsubscribe()
        }).catch((error) => {
            progressSubject.error(error); // Emit error if any
        });
    }

    return progressSubject.asObservable();
}



export function uploadFile(file: File ,  basePathVideo : String , storage : Storage): Observable<UploadResultForOneFile> {
    const progressSubject = new Subject<UploadResultForOneFile>();
    let downloadLink: string = "";
    let currentPercentage = 0 ;
  
        const filePath = `${basePathVideo}/${file.name}`;
        const storageRef = ref(storage,filePath);
        const uploadTask =  uploadBytesResumable(storageRef,file);

        uploadTask.on('state_changed', (snapshot) => {
            let  percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
             if(percentage!=undefined){
            progressSubject.next({progress: parseFloat(percentage!.toFixed(2)),downloadLink:downloadLink}); 
            currentPercentage = percentage??0
          }
        });
       
    
  
        uploadTask.then(async snapshot => {
          downloadLink = await getDownloadURL(snapshot.ref); // Get download link and add to the list

          progressSubject.next({progress:currentPercentage??0,downloadLink:downloadLink}); 
          progressSubject.complete();  
          unsubscribe()
        }).catch((error) => {
            progressSubject.error(error); // Emit error if any
        });
    return  progressSubject.asObservable();
  }

function unsubscribe() {
  throw new Error('Function not implemented.');
}
