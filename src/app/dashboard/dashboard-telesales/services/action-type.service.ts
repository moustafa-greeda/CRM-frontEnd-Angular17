import { Injectable } from '@angular/core';

export interface ActionTypeConfig {
  id: number;
  name: string;
  icon: string;
  label: string;
  placeholder: string;
  type: 'phone' | 'email' | 'meeting' | 'note' | 'followup';
}

@Injectable({
  providedIn: 'root',
})
export class ActionTypeService {
  private readonly actionTypes: Record<number, ActionTypeConfig> = {
    1: {
      id: 1,
      name: 'مكالمة',
      icon: 'bi-telephone',
      label: 'الملاحظة',
      placeholder: 'أدخل ملاحظات المكالمة...',
      type: 'phone',
    },
    2: {
      id: 2,
      name: 'بريد إلكتروني',
      icon: 'bi-envelope',
      label: 'الملاحظة',
      placeholder: 'أدخل ملاحظات البريد...',
      type: 'email',
    },
    3: {
      id: 3,
      name: 'اجتماع',
      icon: 'bi-camera-video',
      label: 'لينك الاجتماع',
      placeholder: 'أدخل لينك الاجتماع...',
      type: 'meeting',
    },
    4: {
      id: 4,
      name: 'ملاحظة',
      icon: 'bi-file-earmark-text',
      label: 'الملاحظة',
      placeholder: 'أدخل ملاحظتك هنا...',
      type: 'note',
    },
    5: {
      id: 5,
      name: 'متابعة',
      icon: 'bi-arrow-repeat',
      label: 'الملاحظة',
      placeholder: 'أدخل ملاحظات المتابعة...',
      type: 'followup',
    },
  };

  private readonly nameMap: Record<string, string> = {
    Call: 'مكالمة',
    Email: 'بريد إلكتروني',
    Meeting: 'اجتماع',
    Notes: 'ملاحظة',
    FollowUp: 'متابعة',
  };

  getActionConfig(actionTypeId: number): ActionTypeConfig | undefined {
    return this.actionTypes[actionTypeId];
  }

  getActionName(actionTypeId: number | any): string {
    // If action object is passed, extract actionTypeName
    if (typeof actionTypeId === 'object' && actionTypeId !== null) {
      if (actionTypeId.actionTypeName) {
        return this.nameMap[actionTypeId.actionTypeName] || actionTypeId.actionTypeName;
      }
      if (actionTypeId.actionTypeId) {
        actionTypeId = actionTypeId.actionTypeId;
      }
    }

    const config = this.actionTypes[actionTypeId];
    return config ? config.name : 'إجراء';
  }

  getActionIcon(actionTypeId: number): string {
    const config = this.actionTypes[actionTypeId];
    return config ? config.icon : 'bi-circle';
  }

  getActionIconByName(actionTypeName: string): string {
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

  getActionTypeId(actionType: string): number {
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

  getActionKey(actionTypeId: number): string {
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
