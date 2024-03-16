import { Component, OnInit, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Project } from 'src/app/models/project';
import { LocalStorageService } from 'src/app/portfolio/shared/sharedService';
import { FireBaseStorageService2 } from 'src/app/services/firebaseService2';
import { CdkDragDrop, moveItemInArray,transferArrayItem } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-images',
  templateUrl: './order-images.component.html',
  styleUrls: ['./order-images.component.css']
})
export class OrderImagesComponent implements OnInit{

  localStorageService = inject(LocalStorageService)
  fireBaseStorage = inject(FireBaseStorageService2)
  toastr: ToastrService = inject(ToastrService);
  router = inject(Router);

  isLoading : boolean = false
  project  = this.localStorageService.getData("imgLinks") as Project
  imgLinks !: string []

  ngOnInit(): void {
    this.imgLinks = this.project.imgsLink
  }


  //To save ordered images
  async saveImageOrder() {
    this.isLoading=true
    let orderedImgLinks = this.imgLinks
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

    
    

}
