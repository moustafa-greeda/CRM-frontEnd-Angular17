import { IEmployee } from '../../core/Models/employee/iemployee';

// Example showing how to handle employee data transformation and API calls
export class EmployeeApiExample {
  // =============================== Transform Form Data ===================
  transformFormDataToEmployee(formData: any): IEmployee {
    return {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      jobTitle: formData.jobTitle,
      birthDate: this.formatDate(formData.birthDate),
      joinDate: this.formatDate(formData.joinDate),
      departmentId: parseInt(formData.departmentId),
      center: formData.center,
      salary: formData.salary,
      gender: formData.gender,
      isActive: this.parseBoolean(formData.isActive),
      profileImage: formData.profileImage,
      address: formData.address,
    };
  }

  // =============================== Data Validation ===================
  validateEmployeeData(employee: IEmployee): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!employee.name || employee.name.trim() === '') {
      errors.push('الاسم مطلوب');
    }

    if (!employee.email || !this.isValidEmail(employee.email)) {
      errors.push('البريد الإلكتروني غير صحيح');
    }

    if (!employee.phone || employee.phone.trim() === '') {
      errors.push('رقم الهاتف مطلوب');
    }

    if (!employee.departmentId || employee.departmentId <= 0) {
      errors.push('يجب اختيار القسم');
    }

    if (!employee.jobTitle || employee.jobTitle.trim() === '') {
      errors.push('المسمى الوظيفي مطلوب');
    }

    if (!employee.birthDate) {
      errors.push('تاريخ الميلاد مطلوب');
    }

    if (!employee.joinDate) {
      errors.push('تاريخ الانضمام مطلوب');
    }

    if (!employee.salary || employee.salary.trim() === '') {
      errors.push('المرتب مطلوب');
    }

    if (!employee.gender) {
      errors.push('الجنس مطلوب');
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  }

  // =============================== Utility Methods ===================
  private formatDate(dateString: string): string {
    if (!dateString) return '';

    // Convert date to ISO string format
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  private parseBoolean(value: any): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true' || value === '1';
    }
    return false;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // =============================== API Response Handling ===================
  handleApiResponse(response: any): {
    success: boolean;
    message: string;
    data?: any;
  } {
    if (response.succeeded) {
      return {
        success: true,
        message: 'تم إضافة الموظف بنجاح',
        data: response.data,
      };
    } else {
      return {
        success: false,
        message: response.message || 'حدث خطأ في إضافة الموظف',
      };
    }
  }

  handleApiError(error: any): { success: boolean; message: string } {
    console.error('API Error:', error);

    let message = 'حدث خطأ في إضافة الموظف';

    if (error.status === 400) {
      message = 'البيانات المرسلة غير صحيحة';
    } else if (error.status === 401) {
      message = 'غير مصرح لك بإجراء هذا العمل';
    } else if (error.status === 403) {
      message = 'غير مسموح لك بإجراء هذا العمل';
    } else if (error.status === 404) {
      message = 'الخدمة غير متاحة';
    } else if (error.status === 500) {
      message = 'خطأ في الخادم';
    } else if (error.message) {
      message = error.message;
    }

    return {
      success: false,
      message: message,
    };
  }

  // =============================== Form Data Preparation ===================
  prepareFormDataForApi(employee: IEmployee): FormData | IEmployee {
    // If there's a file, use FormData
    if (employee.profileImage instanceof File) {
      const formData = new FormData();

      formData.append('name', employee.name);
      formData.append('phone', employee.phone);
      formData.append('email', employee.email);
      formData.append('jobTitle', employee.jobTitle);
      formData.append('birthDate', employee.birthDate);
      formData.append('joinDate', employee.joinDate);
      formData.append('departmentId', employee.departmentId.toString());
      formData.append('center', employee.center);
      formData.append('salary', employee.salary);
      formData.append('gender', employee.gender);
      formData.append('isActive', employee.isActive.toString());

      if (employee.address) {
        formData.append('address', employee.address);
      }

      formData.append(
        'profileImage',
        employee.profileImage,
        employee.profileImage.name
      );

      return formData;
    } else {
      // Return regular object for JSON API
      return employee;
    }
  }
}
