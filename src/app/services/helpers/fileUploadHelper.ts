
import { Storage, ref, uploadBytesResumable, getDownloadURL, percentage } from '@angular/fire/storage';
import { uploadBytes, UploadTask } from 'firebase/storage'; 

import { Observable, Subject } from 'rxjs';
import { UploadResultForManyFiles, UploadResultForOneFile } from "src/app/models/dtos/uploadResultDto"; 



export function uploadFileList(fileList: FileList, basePathImgs : String ,storage : Storage): Observable<UploadResultForManyFiles> {
    const totalFiles = fileList.length;
    const progressSubject = new Subject<UploadResultForManyFiles>();
    const downloadLinks: string[] = [];
    let completedFiles = 0;
    const fileProgress: number[] = new Array(totalFiles).fill(0);

    for (let i = 0; i < totalFiles; i++) {
        const file = fileList[i];
        const filePath = `${basePathImgs}/${file.name}`;
        const storageRef = ref(storage,filePath);
        const uploadTask =  uploadBytesResumable(storageRef,file);
        
        uploadTask.on('state_changed', (snapshot) => {
           let  percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
           fileProgress[i] = percentage;
           
           // Calculate total progress as average of all files
           const totalProgress = fileProgress.reduce((sum, progress) => sum + progress, 0) / totalFiles;
           
           progressSubject.next({
              progress: Math.min(parseFloat(totalProgress.toFixed(2)), 100), 
              downloadLinks: downloadLinks,
              
            });
        }, (error) => {
            progressSubject.error(error);
        }, async () => {
            try {
                const downloadLink = await getDownloadURL(uploadTask.snapshot.ref);
                downloadLinks.push(downloadLink);
                completedFiles++;
                
                if (completedFiles === totalFiles) {
                    progressSubject.next({
                      progress: 100, downloadLinks: downloadLinks,
                     
                    });
                    progressSubject.complete();
                }
            } catch (error) {
                progressSubject.error(error);
            }
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
        currentPercentage = percentage;
        progressSubject.next({progress: parseFloat(percentage.toFixed(2)),downloadLink:downloadLink}); 
    }, (error) => {
        progressSubject.error(error);
    }, async () => {
        try {
            downloadLink = await getDownloadURL(uploadTask.snapshot.ref);
            progressSubject.next({progress: 100, downloadLink: downloadLink}); 
            progressSubject.complete();
        } catch (error) {
            progressSubject.error(error);
        }
    });
    
    return  progressSubject.asObservable();
}

