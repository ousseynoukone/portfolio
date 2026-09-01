import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { TimelineItem } from '../../../models/timeline';
import { FirebaseTimelineService, DEFAULT_TIMELINE_ITEMS } from '../../../services/firebaseTimelineService';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css'],
  standalone: false
})
export class TimelineComponent implements OnInit, OnDestroy {
  allItems: TimelineItem[] = [...DEFAULT_TIMELINE_ITEMS].sort((a, b) => (a.order || 0) - (b.order || 0));
  filteredItems: TimelineItem[] = [...DEFAULT_TIMELINE_ITEMS].sort((a, b) => (a.order || 0) - (b.order || 0));
  selectedFilter: 'all' | 'experience' | 'education' | 'certification' = 'all';
  private subscription?: Subscription;

  constructor(private timelineService: FirebaseTimelineService) { }

  ngOnInit(): void {
    this.subscription = this.timelineService.timeline$.subscribe(items => {
      if (items && items.length > 0) {
        this.allItems = [...items].sort((a, b) => (a.order || 0) - (b.order || 0));
        this.applyFilter(this.selectedFilter);
      }
    });
  }

  setFilter(filter: 'all' | 'experience' | 'education' | 'certification'): void {
    this.selectedFilter = filter;
    this.applyFilter(filter);
  }

  applyFilter(filter: 'all' | 'experience' | 'education' | 'certification'): void {
    if (filter === 'all') {
      this.filteredItems = this.allItems;
    } else {
      this.filteredItems = this.allItems.filter(i => i.type === filter);
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
