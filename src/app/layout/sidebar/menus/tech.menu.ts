import { SidebarItem } from '../sidebar.model';

export const TechMenu: SidebarItem[] = [
  {
    title: 'الرئيسيه',
    icon: 'bi bi-house-door',
    route: '/dashboard/tech',
  },
  {
    title: 'التذاكر',
    icon: 'bi bi-ticket-detailed',
    route: '/dashboard/tech/tickets',
  },
  {
    title: 'مراقبة النظام',
    icon: 'bi bi-server',
    route: '/dashboard/tech/system',
  },
  {
    title: 'الصيانة',
    icon: 'bi bi-tools',
    route: '/dashboard/tech/maintenance',
  },
  {
    title: 'تقارير الأداء',
    icon: 'bi bi-graph-up',
    route: '/dashboard/tech/reports',
  },
];
