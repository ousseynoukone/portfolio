import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Project } from '../../../models/project';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  projects ! : Project []
  constructor(private router: Router) { }

  navigateToDetailsPage() {
    this.router.navigate(['/project-details']).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  ngOnInit() {
  }

  initProject(){
    
  }

  createProject(projet : Project){
    this.projects.push(projet)
  }
}
