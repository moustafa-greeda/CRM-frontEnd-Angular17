import { SidebarItem } from '../../../core/Models/sidbar/menu-item.model';

export const AdminMenu: SidebarItem[] = [
  {
    title: 'لوحة تحكم TeleSales',
    icon: 'bi bi-telephone',
    route: '/dashboard/admin/teleSales',
  },
  {
    title: 'لوحة تحكم Sales',
    icon: 'bi bi-cash-coin',
    route: '/dashboard/admin/sales',
  },
  {
    title: 'الفواتير',
    icon: 'bi bi-credit-card',
    route: '/dashboard/admin/invoices',
  },
  {
    title: 'الموظفين',
    icon: 'bi bi-people',
    route: '/dashboard/admin/employee',
  },
  {
    title: 'الشركات',
    icon: 'bi bi-building',
    route: '/dashboard/admin/company',
  },
  {
    title: 'إضافة عميل',
    icon: 'bi bi-person-plus',
    route: '/dashboard/admin/addLead',
  },
  {
    title: 'عرض العملاء',
    icon: 'bi bi-people-fill',
    route: '/dashboard/admin/showLeads',
  },
  {
    title: 'توزيع العملاء',
    icon: 'bi bi-diagram-3',
    route: '/dashboard/admin/distribution',
  },
  // {
  //   title: 'ادارة الاتفاقيات',
  //   icon: 'bi bi-globe',
  //   route: '/dashboard/admin/showdeals',
  // },
  {
    title: 'البيانات المصدرة',
    icon: 'bi bi-file-earmark-excel',
    route: '/dashboard/admin/exportedData',
  },
];
