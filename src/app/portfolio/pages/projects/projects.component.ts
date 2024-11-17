import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, filter, first } from 'rxjs';
import { Project } from '../../../models/project';
import { PassDataThrough } from '../../shared/sharedService';
import { FireBaseProjectService } from 'src/app/services/firebaseProjectClientServices';

interface ProjectState {
  mobile: Project[];
  web: Project[];
  loading: boolean;
  noDataMessage: string;
  noDataMobile: boolean;
  noDataWeb: boolean;
}

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit, OnDestroy {
  private readonly fireBaseStorage = inject(FireBaseProjectService);
  private readonly shareData = inject(PassDataThrough);
  private readonly router = inject(Router);
  private readonly subscriptions = new Subscription();

  protected state: ProjectState = {
    mobile: [],
    web: [],
    loading: true,
    noDataMessage: '',
    noDataMobile: true,
    noDataWeb: true
  };

  protected readonly mobileProjectCount = signal(0);
  protected readonly webProjectCount = signal(0);
  protected readonly totalProjectCount = signal(0);

  ngOnInit(): void {
    this.initializeProjects();
    this.subscribeToProjectCounts();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  protected navigateToDetailsPage(project: Project): void {
    this.shareData.setData = project;
    this.router.navigate(['/project-details']);
    this.scrollToTop();
  }

  private initializeProjects(): void {
    this.state.loading = true;
    this.fireBaseStorage.fetchProjects();

    const projectSubscription = this.fireBaseStorage.projectSubject.subscribe(
      (projects) => this.handleProjectsUpdate(projects)
    );
    this.subscriptions.add(projectSubscription);
  }

  private handleProjectsUpdate(projects: Project[]): void {
    this.resetProjects();

    if (projects.length === 0) {
      this.state.noDataMessage = 'No projects found.';
      this.state.loading = false;
      return;
    }

    this.categorizeProjects(projects);
    this.updateProjectAvailability();
    this.state.loading = false;
  }

  private resetProjects(): void {
    this.state.mobile = [];
    this.state.web = [];
    this.state.noDataMessage = '';
  }

  private categorizeProjects(projects: Project[]): void {
    projects.forEach(project => {
      if (project.type === 'mobile') {
        this.state.mobile.push(project);
      } else {
        this.state.web.push(project);
      }
    });
  }

  private updateProjectAvailability(): void {
    this.state.noDataMobile = this.state.mobile.length === 0;
    this.state.noDataWeb = this.state.web.length === 0;

    if (this.state.noDataMobile) {
      this.state.noDataMessage = 'No mobile projects found.';
    } else if (this.state.noDataWeb) {
      this.state.noDataMessage = 'No web projects found.';
    }
  }

  private subscribeToProjectCounts(): void {
    const subscriptions = [
      this.fireBaseStorage.mobileProjectCount.subscribe(
        count => this.mobileProjectCount.set(count)
      ),
      this.fireBaseStorage.webProjectCount.subscribe(
        count => this.webProjectCount.set(count)
      ),
      this.fireBaseStorage.totalOfItems.subscribe(
        count => this.totalProjectCount.set(count)
      )
    ];

    subscriptions.forEach(sub => this.subscriptions.add(sub));
  }

  private scrollToTop(): void {
    this.subscriptions.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        first()
      ).subscribe(() => window.scrollTo(0, 0))
    );
  }
}