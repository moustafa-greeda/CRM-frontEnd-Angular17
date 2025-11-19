# 🚀 دليل الاستخدام السريع

## 📋 جدول المحتويات

1. [تغيير الثيم (Theme)](#تغيير-الثيم-theme)
2. [تغيير الاتجاه (RTL/LTR)](#تغيير-الاتجاه-rtlltr)
3. [إضافة ملف CSS جديد](#إضافة-ملف-css-جديد)
4. [استخدام CSS Variables](#استخدام-css-variables)
5. [أمثلة عملية](#أمثلة-عملية)

---

## 🌓 تغيير الثيم (Theme)

### الطريقة 1: استخدام ThemeService (موصى بها)

```typescript
// في component.ts
import { ThemeService } from '@core/services/theme.service';

export class MyComponent {
  constructor(private themeService: ThemeService) {}

  toggleTheme() {
    const newTheme = this.themeService.toggleTheme();
    console.log('Theme changed to:', newTheme);
  }

  setDarkTheme() {
    this.themeService.setTheme('dark');
  }

  setLightTheme() {
    this.themeService.setTheme('light');
  }
}
```

### الطريقة 2: استخدام JavaScript مباشرة

```typescript
// تغيير إلى Dark Theme
document.documentElement.setAttribute('data-theme', 'dark');
localStorage.setItem('theme', 'dark');

// تغيير إلى Light Theme
document.documentElement.setAttribute('data-theme', 'light');
localStorage.setItem('theme', 'light');

// Toggle Theme
const currentTheme = document.documentElement.getAttribute('data-theme');
const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
document.documentElement.setAttribute('data-theme', newTheme);
localStorage.setItem('theme', newTheme);
```

### الطريقة 3: في HTML Template

```html
<button (click)="themeService.toggleTheme()">
  Toggle Theme
</button>

<button (click)="themeService.setTheme('dark')">
  Dark Mode
</button>

<button (click)="themeService.setTheme('light')">
  Light Mode
</button>
```

---

## 🔄 تغيير الاتجاه (RTL/LTR)

### الطريقة 1: استخدام ThemeService (موصى بها)

```typescript
// في component.ts
import { ThemeService } from '@core/services/theme.service';

export class MyComponent {
  constructor(private themeService: ThemeService) {}

  toggleDirection() {
    const newDirection = this.themeService.toggleDirection();
    console.log('Direction changed to:', newDirection);
  }

  setRTL() {
    this.themeService.setDirection('rtl');
  }

  setLTR() {
    this.themeService.setDirection('ltr');
  }
}
```

### الطريقة 2: استخدام JavaScript مباشرة

```typescript
// تغيير إلى RTL
document.documentElement.setAttribute('dir', 'rtl');
localStorage.setItem('direction', 'rtl');

// تغيير إلى LTR
document.documentElement.setAttribute('dir', 'ltr');
localStorage.setItem('direction', 'ltr');
```

### الطريقة 3: في HTML Template

```html
<button (click)="themeService.toggleDirection()">
  Toggle Direction
</button>
```

---

## ➕ إضافة ملف CSS جديد

### الخطوة 1: إنشاء الملف

أنشئ ملف جديد في `src/styles/`:

```css
/* src/styles/_my-component.css */
.my-component {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
}
```

### الخطوة 2: إضافة الاستيراد

افتح `src/styles/main.css` وأضف الاستيراد في المكان المناسب:

```css
/* src/styles/main.css */

/* ... existing imports ... */

/* ========== 4. Components ========== */
@import './buttons.css';
@import './forms.css';
@import './my-component.css';  /* ← أضف هنا */
/* ... */
```

### الخطوة 3: ترتيب الملفات

**ترتيب الاستيراد مهم!** يجب أن يكون:

1. Variables أولاً
2. Reset & Base
3. Layout & Direction
4. Components
5. Third-party (Material)
6. Animations
7. Utilities آخراً

---

## 🎨 استخدام CSS Variables

### الألوان

```css
.my-element {
  color: var(--color-primary);        /* #46e3ff */
  background: var(--color-secondary); /* #51c09e */
  border-color: var(--border-color);  /* #46e3ff */
}
```

### المسافات (Spacing)

```css
.my-element {
  padding: var(--spacing-md);    /* 1rem */
  margin: var(--spacing-lg);     /* 1.5rem */
  gap: var(--spacing-sm);        /* 0.5rem */
}
```

### Border Radius

```css
.my-element {
  border-radius: var(--radius-lg);  /* 0.5rem */
  border-radius: var(--radius-xl); /* 0.75rem */
}
```

### Shadows

```css
.my-element {
  box-shadow: var(--shadow-md);
  box-shadow: var(--shadow-lg);
}
```

### Transitions

```css
.my-element {
  transition: all var(--transition-normal);
  transition: transform var(--transition-fast);
}
```

---

## 💡 أمثلة عملية

### مثال 1: إنشاء Button Component جديد

```css
/* src/styles/_custom-button.css */
.btn-custom {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-primary);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-lg);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.btn-custom:hover {
  background: var(--button-hover);
  transform: translateY(-2px);
  box-shadow: var(--button-hover-shadow);
}
```

ثم في `main.css`:
```css
@import './custom-button.css';
```

### مثال 2: إنشاء Card Component

```css
/* src/styles/_cards.css */
.card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
}

.card__header {
  margin-bottom: var(--spacing-md);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
}

.card__body {
  color: var(--text-muted);
  line-height: 1.6;
}
```

### مثال 3: إضافة Animation جديد

```css
/* في _animations.css */
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in-right {
  animation: slide-in-right var(--transition-normal) ease-out;
}
```

### مثال 4: استخدام Utility Classes

```html
<!-- Flexbox Layout -->
<div class="d-flex align-center justify-between gap-md">
  <h1>Title</h1>
  <button class="btn btn-primary">Click</button>
</div>

<!-- Spacing -->
<div class="mt-lg mb-md">
  <p class="text-center text-primary">Content</p>
</div>

<!-- Border & Shadow -->
<div class="border border-radius-lg shadow-md p-lg">
  Card Content
</div>
```

---

## 🔍 البحث السريع

| ما تبحث عنه | الملف |
|------------|------|
| الألوان | `_variables.css` |
| المسافات | `_variables.css` → `--spacing-*` |
| Buttons | `_buttons.css` |
| Forms | `_forms.css` |
| Dialogs | `_dialogs.css` |
| Dropdowns | `_dropdowns.css` |
| Tables | `_tables.css` |
| Animations | `_animations.css` |
| Utilities | `_utilities.css` |

---

## ✅ Checklist عند إضافة ملف جديد

- [ ] أنشئ الملف في `src/styles/`
- [ ] استخدم CSS Variables بدلاً من القيم الثابتة
- [ ] أضف الاستيراد في `main.css` في المكان الصحيح
- [ ] اختبر في Light و Dark Theme
- [ ] اختبر في RTL و LTR
- [ ] استخدم BEM naming convention
- [ ] أضف تعليقات توضيحية

---

## 🆘 حل المشاكل

### المشكلة: التغييرات لا تظهر

**الحل:**
1. تأكد من إضافة الاستيراد في `main.css`
2. أعد تشغيل Angular dev server
3. امسح cache المتصفح (Ctrl+Shift+R)

### المشكلة: CSS Variables لا تعمل

**الحل:**
1. تأكد من استخدام `var(--variable-name)`
2. تأكد من أن المتغير موجود في `_variables.css`
3. تأكد من ترتيب الاستيراد (variables أولاً)

### المشكلة: Theme لا يتغير

**الحل:**
1. تأكد من استخدام `data-theme` attribute
2. تأكد من وجود الثيم في `_variables.css`
3. استخدم `ThemeService` للتأكد من التطبيق الصحيح

---

## 📞 الدعم

للمزيد من المعلومات، راجع:
- `README.md` - الدليل الكامل
- `_variables.css` - جميع المتغيرات المتاحة
- `main.css` - ترتيب الاستيراد















