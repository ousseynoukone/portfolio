import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, setDoc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { ResponseDto } from '../models/dtos/responseDto';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CvData {
  id?: string;
  fileName: string;
  downloadUrl: string;
  uploadDate: Date;
  fileSize: number;
  fileType: string;
}

@Injectable({
  providedIn: 'root'
})
export class FireBaseCvService {
  private firestore: Firestore = inject(Firestore);
  private storage: Storage = inject(Storage);
  
  private cvCollection = collection(this.firestore, 'cv');
  private cvDoc = doc(this.cvCollection, 'current');
  private basePath = 'cv';
  
  private _percentageSubject = new BehaviorSubject<number>(0);
  public percentage$ = this._percentageSubject.asObservable();

  async uploadCv(file: File): Promise<ResponseDto> {
    try {
      this._percentageSubject.next(0);
      
      // Delete existing CV if it exists
      await this.deleteCurrentCv();
      
      const filePath = `${this.basePath}/${file.name}`;
      const storageRef = ref(this.storage, filePath);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      return new Promise((resolve, reject) => {
        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            this._percentageSubject.next(progress);
          },
          (error) => {
            reject({ status: false, message: 'Upload failed: ' + error.message });
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              
              const cvData: CvData = {
                fileName: file.name,
                downloadUrl: downloadURL,
                uploadDate: new Date(),
                fileSize: file.size,
                fileType: file.type
              };
              
              await setDoc(this.cvDoc, cvData);
              this._percentageSubject.next(100);
              
              resolve({ status: true, message: 'CV uploaded successfully!' });
            } catch (error) {
              reject({ status: false, message: 'Failed to save CV data: ' + error });
            }
          }
        );
      });
    } catch (error) {
      return { status: false, message: 'Upload failed: ' + error };
    }
  }

  async getCurrentCv(): Promise<CvData | null> {
    try {
      const docSnap = await getDoc(this.cvDoc);
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Convert Firestore timestamp to Date
        if (data && data['uploadDate']) {
          data['uploadDate'] = data['uploadDate'].toDate();
        }
        return data as CvData;
      }
      return null;
    } catch (error) {
      console.error('Error getting CV:', error);
      return null;
    }
  }

  async deleteCurrentCv(): Promise<void> {
    try {
      const currentCv = await this.getCurrentCv();
      if (currentCv) {
        // Delete from storage
        const storageRef = ref(this.storage, currentCv.downloadUrl);
        await deleteObject(storageRef);
        
        // Delete from Firestore
        await setDoc(this.cvDoc, {});
      }
    } catch (error) {
      console.error('Error deleting CV:', error);
    }
  }

  downloadCv(cvData: CvData): void {
    const link = document.createElement('a');
    link.href = cvData.downloadUrl;
    link.download = cvData.fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
