import { Component, OnInit, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Project } from 'src/app/models/project';
import { PassDataThrough } from 'src/app/portfolio/shared/sharedService';
import { FireBaseProjectService } from 'src/app/services/firebaseProjectServices';
import { CdkDragDrop, moveItemInArray,transferArrayItem } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { ImgsLinksWithLibelle } from 'src/app/models/dtos/projectDto';

@Component({
    selector: 'app-order-images',
    templateUrl: './order-images.component.html',
    styleUrls: ['./order-images.component.css'],
    standalone: false
})
export class OrderImagesComponent implements OnInit{

  shareData = inject(PassDataThrough)
  fireBaseStorage = inject(FireBaseProjectService)
  toastr: ToastrService = inject(ToastrService);
  router = inject(Router);

  isLoading : boolean = false
  project  = this.shareData.getData as Project
  imgLinks : ImgsLinksWithLibelle [] = []

  ngOnInit(): void {

    this.project.imgsLink.forEach(link=>{
      let libelle = this.getFileNameFromUrl(link)
      this.imgLinks.push({link, libelle})
    })
  
  }




  //To save ordered images
  async saveImageOrder() {
    this.isLoading=true
    let orderedImgLinks = this.imgLinks.map((link)=>{
      return link.link
    })
    let projectID =  this.project.id
    let response = await this.fireBaseStorage.saveOrderedImage(orderedImgLinks,projectID)
    if(response.status){
      this.router.navigate(['admin']);

       this.toastr.success(response.message!) 
    }else{
      this.toastr.error(response.message!)
  
    }
    this.isLoading=false
    }
  
  
  dropListDropped(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.imgLinks, event.previousIndex, event.currentIndex);
  }

   getFileNameFromUrl(url: string): string {
    // Decode the URL to handle encoded characters
    const decodedUrl = decodeURIComponent(url);
  
    // Split the decoded URL by '/' to get the individual path segments
    const pathSegments = decodedUrl.split('/');
  
    // The file name is the last segment of the path
    let fileName = pathSegments[pathSegments.length - 1];
  
    // Some URLs may include query parameters after the file name
    // Use the split() method to remove the query parameters, if present
    fileName = fileName.split('?')[0];
  
    return fileName;
  }
    
    

}
