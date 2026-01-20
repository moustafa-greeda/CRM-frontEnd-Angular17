import { SidebarItem } from '../../../core/Models/sidbar/menu-item.model';

export const TelesalesMenu: SidebarItem[] = [
  {
    title: 'الرئيسيه',
    icon: 'bi bi-house-door',
    route: '/dashboard/telesales',
  },
  {
    title: 'المتابعة',
    icon: 'bi bi-calendar',
    route: '/dashboard/telesales/follow-up-tele',
  },
  {
    title: 'المكالمات',
    icon: 'bi bi-telephone',
    route: '/dashboard/telesales/calls',
  },
  {
    title: 'التعيين الي sales',
    icon: 'bi bi-person-plus',
    route: '/dashboard/telesales/assignToSales',
  },
];
