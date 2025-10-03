import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { Project } from 'src/app/models/project';
import { PassDataThrough } from '../../shared/sharedService';
import { ToastrService } from 'ngx-toastr';
import { NavigationEnd, Router } from '@angular/router';
import { Helpers } from '../../shared/helper';
declare var window: any;

@Component({
    selector: 'app-projects-details',
    templateUrl: './projects-details.component.html',
    styleUrls: ['./projects-details.component.css'],
    standalone: false
})
export class ProjectsDetailsComponent implements OnInit {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  
  project!: Project;
  shareData = inject(PassDataThrough);
  router = inject(Router);
  helper = inject(Helpers);
  modalImages: any;
  toastrService = inject(ToastrService);
  isMessageDisplayed: boolean = false;
  usefullLinks: string[] = [];
  imagesLoaded: boolean[] = [];
  isVideoPlaying: boolean = false;

  ngOnInit(): void {
    this.project = this.shareData.getData as Project;
    this.usefullLinks = this.project.usefullLinks;
    this.initImageModal();
    this.initImagesLoaded();
  }

  initImagesLoaded() {
    this.imagesLoaded = Array(this.project.imgsLink.length).fill(false);
  }

  onImageLoad(index: number) {
    this.imagesLoaded[index] = true;
  }

  initImageModal() {
    this.modalImages = new window.bootstrap.Modal($('#modalImages'));
  }

  openImageModal() {
    this.modalImages.show();
  }

  displayImage(): boolean {
    const screenWidth = window.innerWidth;
    if (screenWidth < 700 && this.project.type != "mobile") {
      if (!this.isMessageDisplayed) {
        this.toastrService.info("Les captures d'écran de bureau ne sont visible que sur ordinateur 🥺.");
      }
      this.isMessageDisplayed = true;
      return false;
    } else {
      return true;
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }

  getProjectDate(): string {
    if (this.project.createdAt) {
      // Handle Firestore FieldValue
      const date = this.project.createdAt as any;
      if (date.toDate) {
        return date.toDate().toLocaleDateString('fr-FR', { 
          year: 'numeric', 
          month: 'long' 
        });
      } else if (date instanceof Date) {
        return date.toLocaleDateString('fr-FR', { 
          year: 'numeric', 
          month: 'long' 
        });
      }
    }
    return 'Date non disponible';
  }

  onVideoPlay() {
    this.isVideoPlaying = true;
  }

  onVideoPause() {
    this.isVideoPlaying = false;
  }

  onVideoEnded() {
    this.isVideoPlaying = false;
  }

  toggleVideo() {
    if (this.videoPlayer) {
      if (this.isVideoPlaying) {
        this.videoPlayer.nativeElement.pause();
      } else {
        this.videoPlayer.nativeElement.play();
      }
    }
  }
}