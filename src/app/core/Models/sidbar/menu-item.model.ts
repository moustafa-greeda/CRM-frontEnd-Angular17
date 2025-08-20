import { AppRole } from '../Auth/irole';

export type MenuItem = {
  label: string;
  link: string;
  icon: string;
  roles?: AppRole[]; // Optional roles for filtering
};
