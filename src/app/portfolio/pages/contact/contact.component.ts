// contact.component.ts

import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { EmailSenderService } from 'src/app/services/emailService';
import { Email } from 'src/app/models/email';
import { ToastrService } from 'ngx-toastr';
import { phoneValidator } from 'src/app/tools/validators';
import { FireBaseCvService, CvData } from 'src/app/services/firebaseCvService';

@Component({
    selector: 'app-contact',
    templateUrl: './contact.component.html',
    styleUrls: ['./contact.component.css'],
    standalone: false
})
export class ContactComponent implements OnInit {
  contactForm!: FormGroup;
  isSending = false;
  currentCv: CvData | null = null;

  private toastr:ToastrService
  private cvService: FireBaseCvService

  constructor(
    private emailSenderService: EmailSenderService,
   
  ) {
    this.toastr= inject(ToastrService)
    this.cvService = inject(FireBaseCvService)
  }

  ngOnInit() {
    this.initForm();
    this.loadCurrentCv();
  }

  private initForm() {
    this.contactForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      prenom: new FormControl('', [Validators.required]),
      nom: new FormControl('', [Validators.required]),
      phone: new FormControl('', [phoneValidator()]),
      message: new FormControl('', [Validators.required]),
    });
  }

  sendMessage() {

    this.contactForm.markAllAsTouched();

    if (this.contactForm.valid && !this.isSending) {
      this.isSending = true;
      this.toastr.info('Envoie en cours', 'Info');
    
      const formData = this.contactForm.value as Email;
      this.emailSenderService.sendEmail(formData)
        .then(response => {
          console.log('Email sent successfully:', response);
          
          if (response.status==200){
            this.toastr.success('Envoyé', 'Succès');
            this.contactForm.reset();
          }

        })
        .catch(error => {
          console.error('Error sending email:', error);
          this.toastr.error('Erreur lors de l\'envoi', 'Erreur');
        })
        .finally(() => {
          this.isSending = false;
        });
    } else {
      console.log('Form is invalid');
    }
  }

  async loadCurrentCv() {
    this.currentCv = await this.cvService.getCurrentCv();
  }

  downloadCv() {
    if (this.currentCv) {
      this.cvService.downloadCv(this.currentCv);
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
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
