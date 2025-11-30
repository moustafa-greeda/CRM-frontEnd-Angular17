import { SidebarItem } from '../../../core/Models/sidbar/menu-item.model';

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
