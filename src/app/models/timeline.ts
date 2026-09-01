export interface TimelineItem {
  id?: string | null;
  title: string;
  subtitle: string;
  location: string;
  period: string;
  description: string[];
  type: 'experience' | 'education';
  icon: string;
  order?: number;
}
