# 📁 Styles Directory Structure

هذا المجلد يحتوي على جميع ملفات CSS منظمة بشكل احترافي وقابل للصيانة.

## 📂 هيكل الملفات

```
src/styles/
├── _variables.css      # CSS Variables & Themes
├── _reset.css          # CSS Reset
├── _base.css           # Base Typography & Body
├── _rtl.css            # RTL/LTR Support
├── _buttons.css        # Button Components
├── _forms.css          # Form Elements
├── _dialogs.css        # Dialogs & Modals
├── _dropdowns.css      # Dropdown Components
├── _tables.css         # Table Styles
├── _components.css     # Reusable Components
├── _material.css       # Angular Material Customization
├── _animations.css     # Animations & Keyframes
├── _utilities.css      # Utility Classes
└── main.css            # Main Entry Point (Imports all files)
```

## 🎨 كيفية استخدام الملفات

### 1. الملف الرئيسي (main.css)

هذا هو الملف الوحيد الذي يتم استيراده في `angular.json`. يقوم باستيراد جميع الملفات الأخرى بالترتيب الصحيح.

```json
"styles": [
  "src/styles/main.css"
]
```

### 2. إضافة ملف CSS جديد

إذا أردت إضافة ملف CSS جديد:

1. **أنشئ الملف** في مجلد `src/styles/`:
   ```css
   /* src/styles/_my-component.css */
   .my-component {
     /* your styles */
   }
   ```

2. **أضف الاستيراد** في `main.css`:
   ```css
   @import './my-component.css';
   ```

3. **رتب الملفات** حسب الأولوية:
   - Variables أولاً
   - Reset & Base
   - Components
   - Utilities آخراً

### 3. استخدام CSS Variables

جميع الألوان والقيم موجودة في `_variables.css`. استخدمها دائماً:

```css
/* ❌ خطأ - استخدام قيم ثابتة */
.my-element {
  color: #46e3ff;
  padding: 10px;
}

/* ✅ صحيح - استخدام CSS Variables */
.my-element {
  color: var(--color-primary);
  padding: var(--spacing-md);
}
```

## 🌓 تغيير الثيم (Theme)

### الطريقة 1: استخدام JavaScript/TypeScript

```typescript
// في component.ts أو service.ts
toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}

// عند تحميل الصفحة
ngOnInit() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
}
```

### الطريقة 2: استخدام CSS مباشرة

```css
/* في أي ملف CSS */
[data-theme="dark"] .my-element {
  background: var(--bg-dark);
  color: var(--text-color);
}
```

### الطريقة 3: إضافة ثيم جديد

1. **أضف الثيم** في `_variables.css`:
   ```css
   [data-theme="custom"] {
     --color-primary: #your-color;
     --bg-color: #your-bg;
     /* ... */
   }
   ```

2. **استخدم الثيم**:
   ```typescript
   document.documentElement.setAttribute('data-theme', 'custom');
   ```

## 🔄 تغيير الاتجاه (RTL/LTR)

### استخدام JavaScript/TypeScript

```typescript
// تغيير إلى RTL
document.documentElement.setAttribute('dir', 'rtl');

// تغيير إلى LTR
document.documentElement.setAttribute('dir', 'ltr');
```

### في HTML

```html
<html dir="rtl" lang="ar">
  <!-- أو -->
<html dir="ltr" lang="en">
```

## 📝 أفضل الممارسات

### 1. استخدام CSS Variables دائماً

```css
/* ✅ جيد */
.button {
  background: var(--color-primary);
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
}

/* ❌ سيء */
.button {
  background: #46e3ff;
  padding: 10px;
  border-radius: 8px;
}
```

### 2. استخدام Utility Classes عند الإمكان

```html
<!-- ✅ جيد -->
<div class="d-flex align-center gap-md">
  <button class="btn btn-primary">Click</button>
</div>

<!-- ❌ سيء -->
<div style="display: flex; align-items: center; gap: 1rem;">
  <button style="padding: 5px 10px; background: #46e3ff;">Click</button>
</div>
```

### 3. تنظيم الملفات حسب الوظيفة

- كل component في ملف منفصل
- المكونات المشتركة في `_components.css`
- الأنماط العامة في `_base.css`

### 4. استخدام BEM Naming Convention

```css
/* ✅ جيد - BEM */
.card { }
.card__header { }
.card__body { }
.card__footer { }
.card--highlighted { }

/* ❌ سيء */
.card { }
.cardHeader { }
.cardBody { }
```

## 🎯 أمثلة عملية

### مثال 1: إضافة Component جديد

```css
/* src/styles/_cards.css */
.card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-md);
}

.card__header {
  margin-bottom: var(--spacing-md);
  font-weight: 600;
}

.card__body {
  color: var(--text-color);
}
```

ثم أضف في `main.css`:
```css
@import './cards.css';
```

### مثال 2: إضافة Animation جديد

```css
/* في _animations.css */
@keyframes slide-in {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

.animate-slide-in {
  animation: slide-in var(--transition-normal) ease-out;
}
```

### مثال 3: إضافة Utility Class جديد

```css
/* في _utilities.css */
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

## 🔍 البحث عن الأنماط

- **Variables**: `_variables.css`
- **Colors**: `_variables.css` → `--color-*`
- **Spacing**: `_variables.css` → `--spacing-*`
- **Buttons**: `_buttons.css`
- **Forms**: `_forms.css`
- **Dialogs**: `_dialogs.css`
- **Utilities**: `_utilities.css`

## 📚 المراجع

- [CSS Variables MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [BEM Methodology](http://getbem.com/)
- [Angular Style Guide](https://angular.io/guide/styleguide)







