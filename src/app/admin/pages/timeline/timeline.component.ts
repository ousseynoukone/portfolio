import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { TimelineItem } from '../../../models/timeline';
import { FirebaseTimelineService } from '../../../services/firebaseTimelineService';

declare var $: any;
declare var window: any;

@Component({
  selector: 'app-admin-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css'],
  standalone: false
})
export class TimelineAdminComponent implements OnInit, OnDestroy {
  private timelineService = inject(FirebaseTimelineService);
  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);

  timelineItems: TimelineItem[] = [];
  filteredItems: TimelineItem[] = [];
  currentFilter: 'all' | 'experience' | 'education' = 'all';

  timelineForm!: FormGroup;
  isSubmitting: boolean = false;
  isLoading: boolean = false;
  editMode: boolean = false;
  editingId: string | null = null;
  formModal: any;

  private subscription?: Subscription;

  iconOptions = [
    { value: 'fas fa-laptop-code', label: '💻 Laptop Code (Dév / Tech)' },
    { value: 'fas fa-briefcase', label: '💼 Briefcase (Entreprise / Management)' },
    { value: 'fas fa-graduation-cap', label: '🎓 Graduation Cap (Master / Diplôme)' },
    { value: 'fas fa-university', label: '🏛️ University (Université / École)' },
    { value: 'fas fa-code', label: '⚙️ Code' },
    { value: 'fas fa-award', label: '🏆 Award / Certification' }
  ];

  ngOnInit(): void {
    this.initForm();
    this.isLoading = true;
    this.subscription = this.timelineService.timeline$.subscribe(items => {
      this.timelineItems = items || [];
      this.applyFilter(this.currentFilter);
      this.isLoading = false;
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  initForm(): void {
    this.timelineForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(80)]],
      subtitle: ['', [Validators.required, Validators.maxLength(80)]],
      location: ['', [Validators.required, Validators.maxLength(60)]],
      period: ['', [Validators.required, Validators.maxLength(50)]],
      type: ['experience', [Validators.required]],
      icon: ['fas fa-laptop-code', [Validators.required]],
      descriptionText: [''],
      order: [1]
    });
  }

  applyFilter(filter: 'all' | 'experience' | 'education'): void {
    this.currentFilter = filter;
    if (filter === 'all') {
      this.filteredItems = [...this.timelineItems];
    } else {
      this.filteredItems = this.timelineItems.filter(i => i.type === filter);
    }
  }

  openAddModal(): void {
    this.editMode = false;
    this.editingId = null;
    this.timelineForm.reset({
      title: '',
      subtitle: '',
      location: 'Paris, France',
      period: '',
      type: 'experience',
      icon: 'fas fa-laptop-code',
      descriptionText: '',
      order: this.timelineItems.length + 1
    });
    this.showModal();
  }

  openEditModal(item: TimelineItem): void {
    this.editMode = true;
    this.editingId = item.id || null;
    const descText = (item.description || []).join('\n');

    this.timelineForm.patchValue({
      title: item.title,
      subtitle: item.subtitle,
      location: item.location,
      period: item.period,
      type: item.type,
      icon: item.icon,
      descriptionText: descText,
      order: item.order || 1
    });
    this.showModal();
  }

  showModal(): void {
    const modalEl = document.getElementById('timelineModal');
    if (modalEl) {
      if (typeof window.bootstrap !== 'undefined' && window.bootstrap.Modal) {
        this.formModal = new window.bootstrap.Modal(modalEl);
        this.formModal.show();
      } else if (typeof $ !== 'undefined') {
        $('#timelineModal').modal('show');
      } else {
        modalEl.classList.add('show');
        modalEl.style.display = 'block';
      }
    }
  }

  hideModal(): void {
    const modalEl = document.getElementById('timelineModal');
    if (modalEl) {
      if (this.formModal) {
        this.formModal.hide();
      } else if (typeof $ !== 'undefined') {
        $('#timelineModal').modal('hide');
      } else {
        modalEl.classList.remove('show');
        modalEl.style.display = 'none';
      }
    }
  }

  async onSubmit(): Promise<void> {
    if (this.timelineForm.invalid) {
      this.toastr.error('Veuillez remplir tous les champs obligatoires.', 'Formulaire invalide');
      return;
    }

    this.isSubmitting = true;
    const formVal = this.timelineForm.value;

    const descriptions = formVal.descriptionText
      ? formVal.descriptionText
          .split('\n')
          .map((line: string) => line.trim())
          .filter((line: string) => line.length > 0)
      : [];

    const item: TimelineItem = {
      title: formVal.title,
      subtitle: formVal.subtitle,
      location: formVal.location,
      period: formVal.period,
      type: formVal.type,
      icon: formVal.icon,
      description: descriptions,
      order: Number(formVal.order) || 1
    };

    if (this.editMode && this.editingId) {
      item.id = this.editingId;
      const res = await this.timelineService.updateTimelineItem(item);
      this.isSubmitting = false;
      if (res.status) {
        this.toastr.success('Expérience / Formation mise à jour avec succès !', 'Succès');
        this.hideModal();
      } else {
        this.toastr.error(res.message || 'Une erreur est survenue', 'Erreur');
      }
    } else {
      const res = await this.timelineService.addTimelineItem(item);
      this.isSubmitting = false;
      if (res.status) {
        this.toastr.success('Nouvel élément ajouté au parcours avec succès !', 'Succès');
        this.hideModal();
      } else {
        this.toastr.error(res.message || 'Une erreur est survenue', 'Erreur');
      }
    }
  }

  async deleteItem(item: TimelineItem): Promise<void> {
    if (!item.id) return;
    const confirmed = confirm(`Êtes-vous sûr de vouloir supprimer "${item.title}" (${item.subtitle}) ?`);
    if (!confirmed) return;

    const res = await this.timelineService.deleteTimelineItem(item.id);
    if (res.status) {
      this.toastr.success('Élément supprimé avec succès.', 'Supprimé');
    } else {
      this.toastr.error(res.message || 'Erreur lors de la suppression', 'Erreur de suppression');
    }
  }
}
