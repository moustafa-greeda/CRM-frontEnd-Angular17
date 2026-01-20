import { Injectable } from '@angular/core';
import { ActionTypeConfig } from '../models/sales.types';

@Injectable({
  providedIn: 'root',
})
export class SalesActionTypeService {
  private readonly actionTypesConfig: Record<number, ActionTypeConfig> = {
    1: {
      name: 'مكالمة',
      icon: 'bi-telephone',
      label: 'الملاحظة',
      placeholder: 'أدخل ملاحظات المكالمة...',
      type: 'phone',
    },
    2: {
      name: 'بريد إلكتروني',
      icon: 'bi-envelope',
      label: 'الملاحظة',
      placeholder: 'أدخل ملاحظات البريد...',
      type: 'email',
    },
    3: {
      name: 'اجتماع',
      icon: 'bi-camera-video',
      label: 'الملاحظة',
      placeholder: 'أدخل ملاحظات الاجتماع...',
      type: 'meeting',
    },
    4: {
      name: 'ملاحظة',
      icon: 'bi-file-earmark-text',
      label: 'الملاحظة',
      placeholder: 'أدخل ملاحظتك هنا...',
      type: 'note',
    },
    5: {
      name: 'متابعة',
      icon: 'bi-arrow-repeat',
      label: 'الملاحظة',
      placeholder: 'أدخل ملاحظات المتابعة...',
      type: 'followup',
    },
  };

  getActionConfig(actionTypeId: number): ActionTypeConfig | null {
    return this.actionTypesConfig[actionTypeId] || null;
  }

  getActionTypeNameById(actionTypeId: number | any): string {
    // If action object is passed, extract actionTypeName
    if (typeof actionTypeId === 'object' && actionTypeId !== null) {
      if (actionTypeId.actionTypeName) {
        // Map English names to Arabic
        const nameMap: { [key: string]: string } = {
          Call: 'مكالمة',
          Email: 'بريد إلكتروني',
          Meeting: 'اجتماع',
          Notes: 'ملاحظة',
          FollowUp: 'متابعة',
        };
        return (
          nameMap[actionTypeId.actionTypeName] || actionTypeId.actionTypeName
        );
      }
      if (actionTypeId.actionTypeId) {
        actionTypeId = actionTypeId.actionTypeId;
      }
    }

    switch (actionTypeId) {
      case 1:
        return 'مكالمة';
      case 2:
        return 'بريد إلكتروني';
      case 3:
        return 'اجتماع';
      case 4:
        return 'ملاحظة';
      case 5:
        return 'متابعة';
      default:
        return 'إجراء';
    }
  }

  getActionTypeIconById(actionTypeId: number): string {
    switch (actionTypeId) {
      case 1:
        return 'bi-telephone'; // Call
      case 2:
        return 'bi-envelope'; // Email
      case 3:
        return 'bi-camera-video'; // Meeting
      case 4:
        return 'bi-file-earmark-text'; // Notes
      case 5:
        return 'bi-arrow-repeat'; // FollowUp
      default:
        return 'bi-circle';
    }
  }

  getActionTypeIcon(actionTypeName: string): string {
    switch (actionTypeName.toLowerCase()) {
      case 'call':
        return 'bi-telephone';
      case 'email':
        return 'bi-envelope';
      case 'meeting':
        return 'bi-camera-video';
      case 'sms':
        return 'bi-chat-dots';
      case 'notes':
        return 'bi-file-earmark-text';
      case 'followup':
        return 'bi-arrow-repeat';
      default:
        return 'bi-circle';
    }
  }

  getActionTypeIdFromType(actionType: string): number {
    switch (actionType) {
      case 'Call':
        return 1;
      case 'Email':
        return 2;
      case 'Meeting':
        return 3;
      case 'Notes':
        return 4;
      case 'FollowUp':
        return 5;
      default:
        return 0;
    }
  }

  getActionTypeKeyById(actionTypeId: number): string {
    switch (actionTypeId) {
      case 1:
        return 'Call';
      case 2:
        return 'Email';
      case 3:
        return 'Meeting';
      case 4:
        return 'Notes';
      case 5:
        return 'FollowUp';
      default:
        return 'Action';
    }
  }
}
