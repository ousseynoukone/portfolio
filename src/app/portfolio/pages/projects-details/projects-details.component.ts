import { Component, OnInit, inject } from '@angular/core';
import { Project } from 'src/app/models/project';
import { PassDataThrough } from '../../shared/sharedService';
import { ToastrService } from 'ngx-toastr';
import { NavigationEnd, Router } from '@angular/router';
import { Helpers } from '../../shared/helper';
declare var window: any; 

@Component({
  selector: 'app-projects-details',
  templateUrl: './projects-details.component.html',
  styleUrls: ['./projects-details.component.css']
})
export class ProjectsDetailsComponent implements OnInit {
  project !: Project
  shareData = inject(PassDataThrough)
  router = inject(Router)
  helper = inject(Helpers)
  modalImages: any;
  toastrService = inject(ToastrService)
  isMessageDisplayed : boolean = false;
  usefullLinks : string []= []

  ngOnInit(): void {
    this.project = this.shareData.getData as Project
    this.usefullLinks = this.project.usefullLinks

    this.initImageModal()
  }



  initImageModal(){
    this.modalImages = new window.bootstrap.Modal(
     $('#modalImages')
    )
  }

  openImageModal(){
    this.modalImages.show()
  }

  displayImage(): boolean {
    const screenWidth = window.innerWidth;
    if (screenWidth < 700 && this.project.type!="mobile") {
      if(!this.isMessageDisplayed)
      this.toastrService.info("Les captures d'écran de bureau ne sont visible que sur ordinateur 🥺.")
      this.isMessageDisplayed = true
      return false;
    } else {
      return true;
    }
  }




}
