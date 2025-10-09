import { Permission } from '@common/enums';

export interface MenuItem {
  id: string;
  label: string;
  permission?: Permission;
  icon: string;
  routerLink: string;
  prefix?: string | null;
  suffix?: string | null;
  visible?: boolean;
  children?: MenuItem[];
}
