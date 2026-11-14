import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { Project } from 'src/app/models/project';
import { PassDataThrough } from '../../shared/sharedService';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Helpers } from '../../shared/helper';
import { FireBaseProjectClientService } from 'src/app/services/firebaseProjectClientServices';
import { slugify } from 'src/app/services/helpers/slug';
declare var window: any;
declare var $: any;

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

  route = inject(ActivatedRoute);
  projectService = inject(FireBaseProjectClientService);
  titleService = inject(Title);
  isLoading = true;
  notFound = false;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => this.loadProject(params.get('slug') ?? ''));
  }

  /** Utilise le projet déjà en mémoire s'il correspond au slug, sinon le charge depuis Firestore. */
  private async loadProject(slug: string): Promise<void> {
    this.isLoading = true;
    this.notFound = false;
    this.isMessageDisplayed = false;

    let project = this.shareData.getData as Project | undefined;
    if (!project || (project.slug || slugify(project.title)) !== slug) {
      try {
        project = await this.projectService.getProjectBySlug(slug);
      } catch (error) {
        console.error('Erreur lors du chargement du projet :', error);
        project = undefined;
      }
    }

    if (!project) {
      this.notFound = true;
      this.isLoading = false;
      return;
    }

    this.project = project;
    this.shareData.setData = project;
    this.setupProject();
    this.isLoading = false;
    this.titleService.setTitle(`${project.title} | Ousseynou Koné`);
  }

  private setupProject(): void {
    // Normalize usedTools to ensure it is always a proper array of strings
    if (this.project && this.project.usedTools) {
      if (typeof this.project.usedTools === 'string') {
        this.project.usedTools = (this.project.usedTools as string).split(',').map(t => t.trim()).filter(Boolean);
      } else if (Array.isArray(this.project.usedTools)) {
        const flattened: string[] = [];
        this.project.usedTools.forEach(t => {
          if (typeof t === 'string' && t.includes(',')) {
            flattened.push(...t.split(',').map(s => s.trim()).filter(Boolean));
          } else if (t) {
            flattened.push(String(t).trim());
          }
        });
        this.project.usedTools = flattened;
      }
    }

    if (this.project && this.project.usefullLinks) {
      if (Array.isArray(this.project.usefullLinks)) {
        this.usefullLinks = this.project.usefullLinks.map(link => this.ensureHttps(link));
      } else if (typeof this.project.usefullLinks === 'string') {
        this.usefullLinks = this.helper.splitAndTrim(this.project.usefullLinks).map(link => this.ensureHttps(link));
      }
    }
    
    if (this.project && this.project.imgsLink) {
      this.initImagesLoaded();
      // Le modal n'existe dans le DOM qu'après le rendu du projet
      setTimeout(() => this.initImageModal(), 0);
    }
  }

  initImagesLoaded() {
    this.imagesLoaded = Array(this.project.imgsLink.length).fill(false);
  }

  onImageLoad(index: number) {
    this.imagesLoaded[index] = true;
  }

  initImageModal() {
    const modalEl = document.getElementById('modalImages');
    if (modalEl && typeof window.bootstrap !== 'undefined' && window.bootstrap.Modal) {
      this.modalImages = new window.bootstrap.Modal(modalEl);
    }
  }

  openImageModal() {
    if (this.modalImages) {
      this.modalImages.show();
    }
  }

  displayImage(): boolean {
    const screenWidth = window.innerWidth;
    if (screenWidth < 700 && this.project.type != "mobile") {
      if (!this.isMessageDisplayed) {
        this.toastrService.info("Les captures d'écran de bureau ne sont visibles que sur ordinateur.");
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
    if (this.project && this.project.createdAt) {
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

  ensureHttps(link: string): string {
    link = link.trim();
    if (/^https?:\/\//i.test(link)) {
      return link;
    }
    if (link.startsWith('//')) {
      return 'https:' + link;
    }
    return 'https://' + link;
  }
}
