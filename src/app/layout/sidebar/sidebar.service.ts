import { Injectable } from '@angular/core';
import { AdminMenu } from './menus/admin.menu';
import { TelesalesMenu } from './menus/telesales.menu';
import { SalesMenu } from './menus/sales.menu';
import { AccountantMenu } from './menus/accountant.menu';
import { TechMenu } from './menus/tech.menu';
import { CustomerMenu } from './menus/customer.menu';
import { LegalMenu } from './menus/legal.menu';
import { UserRole } from '../../core/Models/user/user.model';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  getMenu(role: UserRole) {
    switch (role) {
      case UserRole.Admin:
        return AdminMenu;
      case UserRole.TeleSales:
        return TelesalesMenu;
      case UserRole.Sales:
        return SalesMenu;
      case UserRole.Accountant:
        return AccountantMenu;
      case UserRole.Tech:
        return TechMenu;
      case UserRole.Customer:
        return CustomerMenu;
      case UserRole.Legal:
        return LegalMenu;
      default:
        return [];
    }
  }
}
