import { SidebarItem } from '../sidebar.model';

export const TelesalesMenu: SidebarItem[] = [
  {
    title: 'الرئيسيه',
    icon: 'bi bi-house-door',
    route: '/dashboard/telesales',
  },
  {
    title: 'المكالمات',
    icon: 'bi bi-telephone',
    route: '/dashboard/telesales/calls',
  },
];
