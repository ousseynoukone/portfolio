import { Component, OnInit } from '@angular/core';

interface TimelineItem {
  title: string;
  subtitle: string;
  location: string;
  period: string;
  description: string[];
  type: 'experience' | 'education';
  icon: string;
}

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css'],
  standalone: false
})
export class TimelineComponent implements OnInit {
  experiences: TimelineItem[] = [
    {
      title: 'Alternant Chef de Projet - Développeur Full Stack',
      subtitle: 'XKS GROUP',
      location: 'Cergy, France',
      period: 'DÉCEMBRE 2024 - PRÉSENT',
      description: [
        'Pilotage technique et réalisation Back-End d\'une application de streaming audiovisuel en utilisant SpringBoot (Java) sous une architecture micro-service.',
        'Direction du développement d\'une application mobile de news avec Flutter (Dart).',
        'Contribution à la conception technique et à la standardisation du Design System sur plusieurs projets.',
        'Mise en place d\'un CICD et déploiements sur AWS.'
      ],
      type: 'experience',
      icon: 'fas fa-briefcase'
    },
    {
      title: 'Stage Développeur Full-stack',
      subtitle: 'Rezilux S.A.R.L',
      location: 'France',
      period: 'AOUT 2023 - FÉVRIER 2024',
      description: [
        'Participation à la création d\'une app mobile cross-platform avec Flutter, intégrant géolocalisation et notifications push.',
        'Conteneurisation d\'une application avec Docker.',
        'Participation à la conception et développement d\'une plateforme e-commerce avec Angular et Spring Boot.',
        'Conception d\'une architecture micro-services pour un ERP en Full Java.'
      ],
      type: 'experience',
      icon: 'fas fa-laptop-code'
    }
  ];

  education: TimelineItem[] = [
    {
      title: 'Master : EXPERT LEAD DÉVELOPPEUR FULLSTACK',
      subtitle: 'ITIC Paris',
      location: 'Paris, France',
      period: '2024 - En cours',
      description: [],
      type: 'education',
      icon: 'fas fa-graduation-cap'
    },
    {
      title: 'CS50x Certificate',
      subtitle: 'Harvard University',
      location: 'Online',
      period: '2024 - Novembre 2024',
      description: [],
      type: 'education',
      icon: 'fas fa-graduation-cap'
    },
    {
      title: 'Licence professionnelle en Génie logiciel',
      subtitle: "Institut supérieur d'informatique (ISI)",
      location: 'Sénégal',
      period: '2020 - 2023',
      description: [],
      type: 'education',
      icon: 'fas fa-university'
    }
  ];

  constructor() { }

  ngOnInit(): void {
  }
}

