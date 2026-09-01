export interface TimelineItem {
  id?: string | null;
  title: string;
  subtitle: string;
  location?: string;
  period: string;
  description: string[];
  type: 'experience' | 'education' | 'certification';
  icon: string;
  order?: number;
  link?: string;
}
