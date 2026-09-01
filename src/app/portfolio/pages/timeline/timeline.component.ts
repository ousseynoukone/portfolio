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
  experiences: TimelineItem[] = DEFAULT_TIMELINE_ITEMS.filter(i => i.type === 'experience');
  education: TimelineItem[] = DEFAULT_TIMELINE_ITEMS.filter(i => i.type === 'education');
  certifications: TimelineItem[] = DEFAULT_TIMELINE_ITEMS.filter(i => i.type === 'certification');
  private subscription?: Subscription;

  constructor(private timelineService: FirebaseTimelineService) { }

  ngOnInit(): void {
    this.subscription = this.timelineService.timeline$.subscribe(items => {
      if (items && items.length > 0) {
        this.experiences = items.filter(i => i.type === 'experience').sort((a, b) => (a.order || 0) - (b.order || 0));
        this.education = items.filter(i => i.type === 'education').sort((a, b) => (a.order || 0) - (b.order || 0));
        this.certifications = items.filter(i => i.type === 'certification').sort((a, b) => (a.order || 0) - (b.order || 0));
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
