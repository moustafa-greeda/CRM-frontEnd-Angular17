# Utilities

This folder contains reusable utility functions that can be used across multiple components in the application.

## Structure

- `date.util.ts` - Date formatting and manipulation utilities
- `array.util.ts` - Array manipulation and filtering utilities
- `validation.util.ts` - Validation helper functions
- `string.util.ts` - String manipulation utilities
- `common.util.ts` - Common helper functions (debounce, throttle, etc.)
- `index.ts` - Barrel export file for easy imports

## Usage

### Import from utilities

You can import utilities in two ways:

**Option 1: Import from index (Recommended)**
```typescript
import { formatDate, isValidId, uniqueBy } from '../../utilities';
```

**Option 2: Import from specific file**
```typescript
import { formatDate } from '../../utilities/date.util';
import { isValidId } from '../../utilities/validation.util';
```

### Examples

#### Date Utilities
```typescript
import { formatDate, formatDateTime, getRelativeTime } from '../../utilities';

// Format date
const formatted = formatDate(new Date()); // "25/12/2024"
const withTime = formatDateTime(new Date()); // "25/12/2024, 10:30"

// Relative time
const relative = getRelativeTime(someDate); // "منذ ساعتين"
```

#### Array Utilities
```typescript
import { uniqueBy, groupBy, paginate } from '../../utilities';

// Remove duplicates
const uniqueItems = uniqueBy(items, 'id');

// Group by property
const grouped = groupBy(items, 'status');

// Paginate array
const result = paginate(items, 1, 10);
```

#### Validation Utilities
```typescript
import { isValidId, isValidEmail, validateIds } from '../../utilities';

// Validate ID
if (isValidId(userId)) {
  // Process user
}

// Validate email
if (isValidEmail(email)) {
  // Send email
}

// Validate array of IDs
const invalidIds = validateIds([1, 2, 'invalid', 4]);
```

#### String Utilities
```typescript
import { capitalize, truncate, formatPhone } from '../../utilities';

// Capitalize
const name = capitalize('john doe'); // "John doe"

// Truncate
const short = truncate('Long text here', 10); // "Long te..."

// Format phone
const phone = formatPhone('1234567890'); // "123-456-7890"
```

#### Common Utilities
```typescript
import { debounce, deepClone, generateId } from '../../utilities';

// Debounce search
const debouncedSearch = debounce((term: string) => {
  // Perform search
}, 300);

// Deep clone object
const cloned = deepClone(originalObject);

// Generate unique ID
const id = generateId('user'); // "user-abc123-def456"
```

## Best Practices

1. **Use barrel exports**: Always import from `index.ts` for cleaner imports
2. **Type safety**: All utilities are typed with TypeScript
3. **Null safety**: Utilities handle null/undefined values safely
4. **Performance**: Use debounce/throttle for expensive operations
5. **Reusability**: Keep utilities pure and side-effect free when possible

## Adding New Utilities

When adding new utility functions:

1. Add the function to the appropriate utility file (or create a new one if needed)
2. Export it from that file
3. Export it from `index.ts` for easy access
4. Add JSDoc comments for documentation
5. Include TypeScript types for all parameters and return values

