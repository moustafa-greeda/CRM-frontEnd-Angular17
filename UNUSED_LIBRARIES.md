# المكتبات غير المستخدمة في المشروع

## 📦 المكتبات التي يمكن حذفها بأمان:

### 1. **@material/dialog** ❌
- **الحالة**: غير مستخدمة
- **السبب**: المشروع يستخدم `@angular/material/dialog` بدلاً منها
- **الأمر للحذف**: 
  ```bash
  npm uninstall @material/dialog
  ```

### 2. **@ckeditor/ckeditor5-angular** ❌
- **الحالة**: غير مستخدمة
- **السبب**: لا توجد أي استيرادات أو استخدامات في الكود
- **الأمر للحذف**: 
  ```bash
  npm uninstall @ckeditor/ckeditor5-angular
  ```

### 3. **@ckeditor/ckeditor5-build-classic** ❌
- **الحالة**: غير مستخدمة
- **السبب**: لا توجد أي استيرادات أو استخدامات في الكود
- **الأمر للحذف**: 
  ```bash
  npm uninstall @ckeditor/ckeditor5-build-classic
  ```

### 4. **html2canvas** ❌
- **الحالة**: غير مستخدمة
- **السبب**: لا توجد أي استيرادات أو استخدامات في الكود
- **الأمر للحذف**: 
  ```bash
  npm uninstall html2canvas
  ```

### 5. **jspdf** ❌
- **الحالة**: غير مستخدمة
- **السبب**: لا توجد أي استيرادات أو استخدامات في الكود
- **الأمر للحذف**: 
  ```bash
  npm uninstall jspdf
  ```

### 6. **leaflet** ❌
- **الحالة**: غير مستخدمة
- **السبب**: يوجد فقط CSS classes (`.leaflet-*`) لكن لا توجد استيرادات فعلية للمكتبة
- **الأمر للحذف**: 
  ```bash
  npm uninstall leaflet
  ```

### 7. **@types/leaflet** ❌
- **الحالة**: غير مستخدمة
- **السبب**: غير مستخدمة لأن `leaflet` نفسها غير مستخدمة
- **الأمر للحذف**: 
  ```bash
  npm uninstall @types/leaflet
  ```

---

## ✅ المكتبات المستخدمة (لا تحذفها):

- ✅ `@angular/*` - جميع مكتبات Angular الأساسية
- ✅ `@angular/material` - مستخدمة (MatDialog, MatPaginator, etc.)
- ✅ `@angular/cdk` - قد تكون مستخدمة بشكل غير مباشر
- ✅ `@canvasjs/angular-charts` & `@canvasjs/charts` - مستخدمة في الرسوم البيانية
- ✅ `bootstrap` & `bootstrap-icons` - مستخدمة
- ✅ `express` - مستخدمة في SSR
- ✅ `libphonenumber-js` - مستخدمة للتحقق من أرقام الهواتف
- ✅ `ng2-pdf-viewer` - مستخدمة لعرض ملفات PDF
- ✅ `ngx-spinner` - مستخدمة لعرض spinner
- ✅ `xlsx` - مستخدمة لتصدير البيانات إلى Excel
- ✅ `rxjs`, `tslib`, `zone.js` - مكتبات أساسية لـ Angular

---

## 🚀 أمر لحذف جميع المكتبات غير المستخدمة دفعة واحدة:

```bash
npm uninstall @material/dialog @ckeditor/ckeditor5-angular @ckeditor/ckeditor5-build-classic html2canvas jspdf leaflet @types/leaflet
```

---

## ⚠️ ملاحظات:

1. **leaflet**: إذا كنت تخطط لاستخدامها في المستقبل، يمكنك الاحتفاظ بها
2. **CKEditor**: إذا كنت تخطط لإضافة محرر نصوص، يمكنك الاحتفاظ بها
3. **html2canvas & jspdf**: إذا كنت تخطط لتصدير PDF أو التقاط الصور، يمكنك الاحتفاظ بها
