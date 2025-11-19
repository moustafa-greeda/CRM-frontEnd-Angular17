# ⚡ Quick Start Guide

## 🎯 الخطوات السريعة

### 1️⃣ تغيير الثيم (Theme)

```typescript
// في أي component
import { ThemeService } from '@core/services/theme.service';

constructor(private themeService: ThemeService) {}

// تغيير الثيم
this.themeService.toggleTheme();        // تبديل بين light/dark
this.themeService.setTheme('dark');     // وضع داكن
this.themeService.setTheme('light');    // وضع فاتح
```

### 2️⃣ تغيير الاتجاه (RTL/LTR)

```typescript
// في أي component
this.themeService.toggleDirection();    // تبديل بين RTL/LTR
this.themeService.setDirection('rtl'); // من اليمين لليسار
this.themeService.setDirection('ltr'); // من اليسار لليمين
```

### 3️⃣ إضافة ملف CSS جديد

1. أنشئ الملف: `src/styles/_my-component.css`
2. أضف الكود:
```css
.my-component {
  background: var(--card-bg);
  padding: var(--spacing-md);
}
```
3. أضف الاستيراد في `main.css`:
```css
@import './my-component.css';
```

---

## 📚 الملفات المهمة

| الملف | الوصف |
|------|-------|
| `main.css` | نقطة الدخول الرئيسية - يستورد جميع الملفات |
| `_variables.css` | جميع CSS Variables والثيمات |
| `_utilities.css` | Utility Classes الجاهزة |
| `README.md` | الدليل الكامل |
| `USAGE.md` | أمثلة عملية مفصلة |

---

## 🔑 CSS Variables الأكثر استخداماً

```css
/* الألوان */
var(--color-primary)      /* #46e3ff */
var(--color-secondary)    /* #51c09e */
var(--color-accent)       /* #ff5f00 */

/* المسافات */
var(--spacing-sm)         /* 0.5rem */
var(--spacing-md)         /* 1rem */
var(--spacing-lg)         /* 1.5rem */

/* Border Radius */
var(--radius-md)          /* 0.375rem */
var(--radius-lg)          /* 0.5rem */

/* Shadows */
var(--shadow-md)
var(--shadow-lg)
```

---

## ✅ Checklist

- [x] تم إنشاء هيكل الملفات
- [x] تم تحديث `angular.json`
- [x] تم إنشاء `ThemeService`
- [x] تم إنشاء التوثيق

---

## 🚀 ابدأ الآن!

1. **جرب تغيير الثيم:**
   ```typescript
   this.themeService.toggleTheme();
   ```

2. **استخدم CSS Variables:**
   ```css
   .my-element {
     color: var(--color-primary);
     padding: var(--spacing-md);
   }
   ```

3. **استخدم Utility Classes:**
   ```html
   <div class="d-flex align-center gap-md">
     <button class="btn btn-primary">Click</button>
   </div>
   ```

---

**للمزيد من التفاصيل، راجع `README.md` و `USAGE.md`**















