import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FireBaseCvService, CvData } from '../../../services/firebaseCvService';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    standalone: false
})
export class HomeComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  currentCv: CvData | null = null;
  isUploading = false;
  uploadProgress = 0;

  constructor(
    private cvService: FireBaseCvService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadCurrentCv();
  }

  async loadCurrentCv() {
    this.currentCv = await this.cvService.getCurrentCv();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadCv(file);
    }
  }

  async uploadCv(file: File) {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      this.toastr.error('Veuillez sélectionner un fichier PDF ou Word valide.');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      this.toastr.error('Le fichier est trop volumineux. Taille maximale: 10MB');
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;

    // Subscribe to upload progress
    this.cvService.percentage$.subscribe(progress => {
      this.uploadProgress = progress;
    });

    try {
      const result = await this.cvService.uploadCv(file);
      if (result.status) {
        this.toastr.success(result.message || 'CV uploaded successfully!');
        await this.loadCurrentCv();
      } else {
        this.toastr.error(result.message || 'Upload failed');
      }
    } catch (error) {
      this.toastr.error('Erreur lors de l\'upload: ' + error);
    } finally {
      this.isUploading = false;
      this.uploadProgress = 0;
      // Reset file input
      if (this.fileInput) {
        this.fileInput.nativeElement.value = '';
      }
    }
  }

  async deleteCv() {
    if (confirm('Êtes-vous sûr de vouloir supprimer le CV actuel ?')) {
      try {
        await this.cvService.deleteCurrentCv();
        this.toastr.success('CV supprimé avec succès');
        this.currentCv = null;
      } catch (error) {
        this.toastr.error('Erreur lors de la suppression: ' + (error as string));
      }
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(date: Date): string {
    if (!date || isNaN(new Date(date).getTime())) {
      return 'Date inconnue';
    }
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(date: Date): string {
    if (!date || isNaN(new Date(date).getTime())) {
      return 'Heure inconnue';
    }
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
