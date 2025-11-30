import { SidebarItem } from '../sidebar.model';

export const AccountantMenu: SidebarItem[] = [
  {
    title: 'اوامر تشغيل الفواتير',
    icon: 'bi bi-bank',
    route: '/dashboard/accountant/invoicesWorkOrders',
  },
  {
    title: 'الفواتير',
    icon: 'bi bi-credit-card',
    route: '/dashboard/accountant/invoices',
  },
];
