import { AppRole } from '../Auth/irole';

export type MenuItem = {
  label: string;
  link: string;
  icon: string;
  roles?: AppRole[]; // Optional roles for filtering
};

export interface SidebarItem {
  title: string;
  icon: string;
  route: string;
  tooltip?: string;
}
