import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { 
  Firestore, CollectionReference, collection, query, orderBy, 
  getDocs, addDoc, updateDoc, deleteDoc, doc 
} from '@angular/fire/firestore';
import { TimelineItem } from '../models/timeline';
import { ResponseDto } from '../models/dtos/responseDto';

export const DEFAULT_TIMELINE_ITEMS: TimelineItem[] = [
  {
    title: 'DÉVELOPPEUR FULL STACK / LEAD DEV',
    subtitle: 'ITIC Paris',
    location: 'Paris, France',
    period: 'MAI - SEPTEMBRE 2026',
    description: [
      "Architecture et développement Full-Stack de la plateforme d'insertion professionnelle de l'école (Spring Boot 3 / React / PostgreSQL), du cadrage à la mise en production.",
      "Développement de l'API et centralisation des données : création du backend sécurisé (JWT/RBAC) et agrégation automatique des flux d'offres d'emploi (APIs France Travail, Adzuna).",
      "Conception des interfaces et de l'expérience utilisateur : réalisation des portails étudiants/conseillers sous React & Tailwind CSS avec dashboards de suivi et mécanique d'engagement (gamification).",
      "Industrialisation et déploiement continu : mise en place de la suite de tests automatisés (+160 tests) et du pipeline CI/CD (GitHub Actions) avec rollback automatique."
    ],
    type: 'experience',
    icon: 'fas fa-laptop-code',
    link: '',
    order: 1
  },
  {
    title: 'Alternant Chef de Projet - Développeur Full Stack',
    subtitle: 'XKS GROUP',
    location: 'Cergy, France',
    period: 'DÉCEMBRE 2024 - Janvier 2026',
    description: [
      "Pilotage technique et réalisation Back-End d'une application de streaming audiovisuel en utilisant SpringBoot (Java) sous une architecture micro-service.",
      "Direction du développement d'une application mobile de news avec Flutter (Dart).",
      "Contribution à la conception technique et à la standardisation du Design System sur plusieurs projets.",
      "Mise en place d'un CICD et déploiements sur AWS."
    ],
    type: 'experience',
    icon: 'fas fa-briefcase',
    link: '',
    order: 2
  },
  {
    title: 'Stage Développeur Full-stack',
    subtitle: 'Rezilux S.A.R.L',
    location: '',
    period: 'AOUT 2023 - FÉVRIER 2024',
    description: [
      "Participation à la création d'une app mobile cross-platform avec Flutter, intégrant géolocalisation et notifications push.",
      "Conteneurisation d'une application avec Docker.",
      "Participation à la conception et développement d'une plateforme e-commerce avec Angular et Spring Boot.",
      "Conception d'une architecture micro-services pour un ERP en Full Java."
    ],
    type: 'experience',
    icon: 'fas fa-laptop-code',
    link: '',
    order: 3
  },
  {
    title: 'Master : EXPERT LEAD DÉVELOPPEUR FULLSTACK',
    subtitle: 'ITIC Paris',
    location: 'Paris, France',
    period: '2024 - AOÛT 2026',
    description: [
      "Formation d'excellence préparant au titre d'Expert Lead Développeur Full-Stack (Niveau 7 - Bac+5).",
      "Architecture logicielle, microservices, cloud computing, sécurité applicative et gouvernance agile de projets d'envergure."
    ],
    type: 'education',
    icon: 'fas fa-graduation-cap',
    link: '',
    order: 4
  },
  {
    title: 'AWS Academy Graduate - Cloud Foundations',
    subtitle: 'Amazon Web Services (AWS)',
    location: '',
    period: 'Avril 2026',
    description: [
      "Certification officielle AWS Academy Cloud Foundations délivrée par Amazon Web Services.",
      "Maîtrise des concepts fondamentaux du Cloud AWS : Compute (EC2), Stockage (S3), Réseau (VPC), Sécurité (IAM) et Architecture Cloud Well-Architected."
    ],
    type: 'certification',
    icon: 'fas fa-award',
    link: 'https://www.credly.com/users/ousseynou-kone',
    order: 5
  },
  {
    title: 'CS50x Certificate',
    subtitle: 'Harvard University',
    location: '',
    period: '2024 - Novembre 2024',
    description: [
      "Certification d'excellence en informatique et génie logiciel délivrée par Harvard University (edX).",
      "Maîtrise approfondie des algorithmes, structures de données, gestion de la mémoire en C, développement Python, SQL et frameworks web modernes."
    ],
    type: 'certification',
    icon: 'fas fa-award',
    link: 'https://cs50.harvard.edu/certificates/',
    order: 6
  },
  {
    title: 'Licence professionnelle en Génie logiciel',
    subtitle: "Institut supérieur d'informatique (ISI)",
    location: 'Sénégal',
    period: '2020 - 2023',
    description: [
      "Formation approfondie en génie logiciel, algorithmique, bases de données relationnelles et développement applicatif."
    ],
    type: 'education',
    icon: 'fas fa-university',
    link: '',
    order: 7
  }
];

@Injectable({
  providedIn: 'root'
})
export class FirebaseTimelineService {
  private firestore: Firestore = inject(Firestore);
  private timelineDB: CollectionReference = collection(this.firestore, 'timeline');

  private _timelineSubject = new BehaviorSubject<TimelineItem[]>(DEFAULT_TIMELINE_ITEMS);
  public timeline$ = this._timelineSubject.asObservable();

  constructor() {
    this.fetchTimeline();
  }

  async fetchTimeline(): Promise<TimelineItem[]> {
    try {
      const q = query(this.timelineDB, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // Auto seed default items to Firestore if collection is empty
        await this.seedDefaults();
        return DEFAULT_TIMELINE_ITEMS;
      }

      const items: TimelineItem[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as TimelineItem;
        items.push({ ...data, id: docSnap.id });
      });

      this._timelineSubject.next(items);
      return items;
    } catch (error) {
      console.warn('Firebase timeline fetch failed, falling back to defaults:', error);
      this._timelineSubject.next(DEFAULT_TIMELINE_ITEMS);
      return DEFAULT_TIMELINE_ITEMS;
    }
  }

  async seedDefaults(): Promise<void> {
    try {
      for (const item of DEFAULT_TIMELINE_ITEMS) {
        const docRef = await addDoc(this.timelineDB, item);
        await updateDoc(docRef, { id: docRef.id });
      }
      this._timelineSubject.next(DEFAULT_TIMELINE_ITEMS);
    } catch (e) {
      console.error('Error seeding timeline:', e);
    }
  }

  async addTimelineItem(item: TimelineItem): Promise<ResponseDto> {
    try {
      if (!item.order) {
        item.order = this._timelineSubject.value.length + 1;
      }
      const docRef = await addDoc(this.timelineDB, item);
      await updateDoc(docRef, { id: docRef.id });
      item.id = docRef.id;

      await this.fetchTimeline();
      return { status: true, message: 'Élément de parcours ajouté avec succès.' };
    } catch (error) {
      console.error('Error adding timeline item:', error);
      return { status: false, message: String(error) };
    }
  }

  async updateTimelineItem(item: TimelineItem): Promise<ResponseDto> {
    try {
      if (!item.id) {
        return { status: false, message: 'ID introuvable pour la mise à jour.' };
      }
      const docRef = doc(this.firestore, 'timeline', item.id);
      await updateDoc(docRef, { ...item });

      await this.fetchTimeline();
      return { status: true, message: 'Élément mis à jour avec succès.' };
    } catch (error) {
      console.error('Error updating timeline item:', error);
      return { status: false, message: String(error) };
    }
  }

  async deleteTimelineItem(id: string): Promise<ResponseDto> {
    try {
      const docRef = doc(this.firestore, 'timeline', id);
      await deleteDoc(docRef);

      await this.fetchTimeline();
      return { status: true, message: 'Élément supprimé avec succès.' };
    } catch (error) {
      console.error('Error deleting timeline item:', error);
      return { status: false, message: String(error) };
    }
  }
}
