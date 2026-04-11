# 🔧 Technical Debugging Guide - April 11 Session

## Debug Flowchart for Common Issues

```
Issue: Page crashes or shows error
  ↓
Check for ".filter is not a function" in console
  ├─ YES → Hook missing initialData (See: Hook Debugging)
  └─ NO → Check for other TypeErrors
      ├─ Array type check failed → Add Array.isArray() check (See: Component Debugging)
      └─ API connection error → Check backend (See: API Debugging)

Issue: Data not saving to database
  ↓
Check Festival wasn't created
  ├─ Check Network tab (F12 → Network)
  │   ├─ 201 Created → Success! Check if React Query refetching
  │   ├─ 400 Bad Request → Check DTO validation
  │   ├─ 500 Server Error → Check backend logs
  │   └─ No request → See: Form Debugging
  └─ See: React Query Debugging

Issue: Festival appears but doesn't show in table
  ↓
Check React Query cache
  ├─ Is invalidation happening? (See: React Query Debugging)
  ├─ Is refetch happening? (See: React Query Debugging)
  └─ Is component re-rendering? (See: Component Debugging)

Issue: Summary cards don't update
  ↓
Check if query hook re-ran
  ├─ useEffect logging should show new count
  ├─ If not, check if festival list updated
  └─ See: React Query Debugging
```

---

## 🪝 Hook Debugging

### Problem: `Cannot read property 'filter' of undefined`

**Root Causes:**
1. Hook returns `undefined` initially (no `initialData`)
2. Component tries to call `.filter()` or `.map()` immediately
3. Falsy coalescing doesn't work (e.g., `data?.filter()` when data is wrong type)

### Debug Steps

**Step 1: Check Browser Console**
```javascript
// F12 → Console
// Should show error with line number
```

**Step 2: Identify Which Hook**
```javascript
// Look at stack trace to find hook name
// Example: useDashboardMetrics, useSalesTrendAnalytics, etc.
```

**Step 3: Check initialData in Hook**
```typescript
// Open src/hooks/useApi.ts
// Find the hook (Ctrl+F to search)
// Look for: initialData: 

// ❌ If missing:
export const useDashboardMetrics = (outlet_id: string) => {
  return useQuery({
    queryKey: ["dashboard-metrics", outlet_id],
    queryFn: () => apiClient.getDashboardMetrics(outlet_id).then((res) => res.data.data),
    enabled: !!outlet_id,
    // ← NO initialData here!
  });
};

// ✅ Should be like:
export const useDashboardMetrics = (outlet_id: string) => {
  return useQuery({
    queryKey: ["dashboard-metrics", outlet_id],
    queryFn: () => apiClient.getDashboardMetrics(outlet_id).then((res) => res.data.data),
    initialData: {
      total_sales: 0,
      online_sales: 0,
      // ... all fields with defaults
    },
    enabled: !!outlet_id,
  });
};
```

**Step 4: Fix**
1. Add appropriate `initialData` to hook
2. If it's an array query, use `initialData: []`
3. If it's an object query, use `initialData: {}`
4. Rebuild: `docker-compose up -d --build`

---

## 🖼️ Component Debugging

### Problem: Component crashes on accessing array data

**Root Causes:**
1. Component receives non-array from hook
2. Component uses optional chaining but expects array
3. TypeError when calling `.map()` on object

### Debug Steps

**Step 1: Locate the Component**
```javascript
// From stack trace, find component name
// Example: Dashboard.tsx:101 (line 101 in Dashboard.tsx)
```

**Step 2: Verify Array Type Check**
```typescript
// ❌ UNSAFE - May receive object and still fail:
const items = partyOrdersData?.map((order) => ({...})) || [];
items.filter(...); // Can still crash!

// ✅ SAFE - Type guard ensures array:
const items = Array.isArray(partyOrdersData)
  ? partyOrdersData.map((order) => ({...}))
  : [];
items.filter(...); // Always safe!
```

**Step 3: Check in Files**
- Dashboard.tsx (line 101, 112)
- Sales.tsx (line 404)
- PartyOrders.tsx (line 82)
- PurchaseOrders.tsx (line 338)
- Attendance.tsx (line 72)
- Wastage.tsx (line 31)
- Inventory.tsx (line 84)
- Cashflow.tsx (line 63)

**Step 4: Fix Template**
```typescript
// Before:
const { data } = useQuery(...);
const items = data?.map(...) || [];

// After:
const { data } = useQuery(...);
const items = Array.isArray(data) ? data.map(...) : [];
```

---

## 🔄 React Query Debugging

### Problem: Data doesn't update after form submit

**Root Causes:**
1. Mutation not calling `invalidateQueries()`
2. Invalidation not specific enough (query key mismatch)
3. No `refetchQueries()` call (cache only invalidated, not refetched)
4. Query key uses parameters (e.g., `["festivals", outlet_id]`) but invalidation doesn't match

### Debug Steps

**Step 1: Check Browser Console**
```javascript
// F12 → Console
// Look for these logs:
// 📝 Submitting festival form:        → Form submitted
// ➕ Creating new festival:             → API called
// ✅ Festival created successfully    → API response received
// 📊 Festivals data updated:          → Query refetched
```

**Step 2: Missing any logs?**

**If missing "📝" log:**
- Form submit handler not being called
- Form submit button not working
- Solution: Check button type and onClick handler

```html
<!-- ✅ Correct -->
<button type="button" onClick={handleSubmitFestival}>
  Add Festival
</button>

<!-- ❌ Wrong - type="submit" may not work with form -->
```

**If missing "➕" log:**
- Mutation not triggered
- Solution: Check mutation is actually called:

```typescript
// ❌ Wrong
const mutation = useCreateFestival();
// handleSubmit calls but mutation.mutateAsync() NOT called

// ✅ Correct
const mutation = useCreateFestival();
await mutation.mutateAsync(festivalData); // Must call mutateAsync!
```

**If missing "✅" log:**
- API failed to create festival
- Solution: Check Network tab:

```
F12 → Network tab
POST /api/analytics/festivals
Check Status Code:
  201 = Created ✓
  400 = Validation error - check DTO
  500 = Backend error - check backend logs
```

**If missing "📊" log:**
- Query not refetching
- Solution: Check mutation's `onSuccess` callback:

```typescript
// ❌ Missing refetch
const mutation = useMutation({
  mutationFn: (data) => createFestival(data),
  onSuccess: (data) => {
    queryClient.invalidateQueries({ queryKey: ["festivals"] });
    // ← Missing refetchQueries!
  },
});

// ✅ Has refetch
const mutation = useMutation({
  mutationFn: (data) => createFestival(data),
  onSuccess: (data) => {
    queryClient.invalidateQueries({ queryKey: ["festivals"] });
    queryClient.refetchQueries({ queryKey: ["festivals"] }); // ← Added!
  },
});
```

**Step 3: Verify Mutation Configuration**
```typescript
// File: src/hooks/useApi.ts
// Search for: export const useCreateFestival
// Check these three things:

1. ✅ mutationFn calls correct API endpoint
2. ✅ onSuccess invalidates with ["festivals"] key
3. ✅ onSuccess calls refetchQueries with ["festivals"] key

// Should look like:
export const useCreateFestival = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => 
      apiClient.createFestival(data).then((res) => res.data.data),
    
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["festivals"] });
      queryClient.setQueryData(["festival", data.id], data);
      queryClient.refetchQueries({ queryKey: ["festivals"] }); // Must have this!
    },
  });
};
```

### Query Key Debug Tool

```javascript
// In browser DevTools console:

// 1. Check current cache state
queryClient.getQueryData(["festivals"])

// 2. Manually invalidate (for testing)
queryClient.invalidateQueries({ queryKey: ["festivals"] })

// 3. Manually refetch (for testing)
queryClient.refetchQueries({ queryKey: ["festivals"] })

// 4. Clear entire cache (nuclear option)
queryClient.clear()

// 5. See all queries
queryClient.getQueryCache().getAll()
```

---

## 🌐 API Debugging

### Problem: Festival created in DB but doesn't appear in UI

**Root Causes:**
1. API returned error (500, 400)
2. DTO validation failed
3. Database constraint violation
4. Query not actually fetching fresh data

### Debug Steps

**Step 1: Check Network Tab**
```
F12 → Network
POST /api/analytics/festivals
Check:
  Status: 201 ✓
  Response: { status: "success", data: { id, festival_name, ... } }
  Headers: Content-Type: application/json
```

**Step 2: Check Response Format**
```javascript
// Should look like:
{
  status: "success",
  data: {
    id: "uuid-here",
    festival_name: "Diwali",
    start_date: "2026-04-15",
    expected_sales: 50000,
    actual_sales: 48000,
    budget: 10000,
    actual_expenses: 9500,
    status: "active",
    outlet_id: "outlet-uuid",
    created_at: "2026-04-11T10:30:00Z"
  },
  timestamp: "2026-04-11T10:30:00Z"
}

// If different, backend DTO may be broken
```

**Step 3: Check DTO Validation**
```typescript
// File: backend/src/modules/analytics/dto/create-festival.dto.ts
// Check all fields are defined:

export class CreateFestivalDto {
  @IsString() festival_name: string;       // ✓
  @IsDate() start_date: Date;              // ✓
  @IsDate() end_date: Date;                // ✓
  @IsNumber() expected_sales: number;      // ✓
  @IsNumber() actual_sales: number;        // ✓
  @IsNumber() budget: number;              // ✓
  @IsNumber() actual_expenses: number;     // ✓
  @IsEnum(['planning', 'active', 'completed']) status: string;
}

// Check form is sending all fields (in console logs):
console.log("➕ Creating new festival:", newFestival)
// Should have all fields above
```

**Step 4: Test API Directly**
```bash
# In browser console:

# Test GET
fetch('/api/analytics/festivals?outlet_id=your-outlet-id')
  .then(r => r.json())
  .then(data => {
    console.log('Festivals:', data.data);
    console.log('Count:', data.data.length);
  })

# Test POST
fetch('/api/analytics/festivals', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: JSON.stringify({
    festival_name: 'Test Festival',
    start_date: '2026-04-15',
    end_date: '2026-04-25',
    expected_sales: 50000,
    actual_sales: 48000,
    budget: 10000,
    actual_expenses: 9500,
    status: 'active',
    outlet_id: 'your-outlet-id'
  })
})
  .then(r => r.json())
  .then(console.log)
```

---

## 📋 Form Debugging

### Problem: Form not submitting or values not saving

**Root Causes:**
1. Form values not updating state
2. Submit handler not being called
3. Festivals array not being passed to mutation
4. Number parsing failing

### Debug Steps

**Step 1: Verify Form State Updates**
```typescript
// In Festivals.tsx, add logging to handleInputChange:

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  console.log(`Input changed: ${name} = ${value}`); // ← Add this
  
  if (['expected_sales', 'actual_sales', 'budget', 'actual_expenses'].includes(name)) {
    setNewFestival({
      ...newFestival,
      [name]: value === '' ? 0 : parseFloat(value),
    });
  } else {
    setNewFestival({
      ...newFestival,
      [name]: value,
    });
  }
  
  console.log('Updated newFestival:', newFestival); // ← Add this
};
```

**Step 2: Check Form Data Before Submit**
```typescript
// Add logging to handleSubmitFestival:

const handleSubmitFestival = async (e: React.FormEvent) => {
  e.preventDefault();
  console.log('📝 Form submitted');
  console.log('✏️ Selected Festival:', selectedFestival);
  console.log('📋 Form Data:', newFestival);
  console.log('✅ Ready to submit:', { selectedFestival, newFestival });
  
  // Rest of handler...
};
```

**Step 3: Verify Number Conversion**
```javascript
// Test in console
parseFloat('50000') // → 50000 ✓
parseFloat('') // → NaN ✗
parseFloat(undefined) // → NaN ✗

// In handleInputChange, ensure:
value === '' ? 0 : parseFloat(value)
// This prevents NaN values
```

**Step 4: Check Required Fields**
```typescript
// Before mutation, validate:
const requiredFields = [
  'festival_name',
  'start_date',
  'end_date',
  'expected_sales',
  'budget',
  'status'
];

const hasErrors = requiredFields.some(field => !newFestival[field]);
if (hasErrors) {
  console.error('❌ Missing required fields:', newFestival);
  alert('Please fill all required fields');
  return;
}
```

---

## 💾 Database Debugging

### Problem: Festival saved but query returns wrong data

**Root Causes:**
1. Database constraints preventing save
2. Soft delete affecting queries (WHERE deleted_at IS NULL)
3. Outlet isolation issue (wrong outlet_id)
4. Data type mismatch (string vs number)

### Debug Steps

**Step 1: Check Container Logs**
```bash
# See backend logs for errors
docker logs jugaad-nights-backend | tail -20

# See database logs
docker logs jugaad-postgres | tail -20
```

**Step 2: Direct Database Check**
```sql
-- Connect to database container (if admin access available)
docker exec -it jugaad-postgres psql -U jugaad_user -d jugaad_db

-- Check festivals table
SELECT * FROM festivals WHERE deleted_at IS NULL;

-- Check specific festival
SELECT * FROM festivals WHERE festival_name = 'Diwali' AND deleted_at IS NULL;

-- Check outlet isolation
SELECT * FROM festivals WHERE outlet_id = 'your-outlet-id' AND deleted_at IS NULL;
```

**Step 3: Verify Data Types**
```
In query response, check:
- expected_sales: should be number, not string
- start_date: should be ISO date string
- status: should match enum values
```

---

## 🧪 Complete Testing Script

```javascript
// Run this in F12 console to test complete flow:

console.log('=== TESTING FESTIVAL FLOW ===');

// 1. Check hook initialData
console.log('1. Checking hook initialData...');
const initialQuery = queryClient.getQueryData(['festivals']);
console.log('Initial data:', initialQuery);

// 2. Simulate form data
const testFestival = {
  festival_name: 'Test ' + Date.now(),
  start_date: '2026-04-15',
  end_date: '2026-04-25',
  expected_sales: 50000,
  actual_sales: 48000,
  budget: 10000,
  actual_expenses: 9500,
  status: 'active'
};
console.log('2. Test data:', testFestival);

// 3. Test API endpoint
console.log('3. Testing API...');
fetch('/api/analytics/festivals', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: JSON.stringify(testFestival)
})
  .then(r => {
    console.log('3a. Response status:', r.status);
    return r.json();
  })
  .then(data => {
    console.log('3b. Response data:', data);
    
    // 4. Check cache update
    setTimeout(() => {
      const updatedQuery = queryClient.getQueryData(['festivals']);
      console.log('4. Updated cache:', updatedQuery);
      console.log('   Count:', updatedQuery?.length);
    }, 1000);
  })
  .catch(err => {
    console.error('❌ API Error:', err);
  });
```

---

## 🛠️ Common Commands for Debugging

### Docker Commands
```bash
# Check if containers running
docker ps -a

# View backend logs
docker logs jugaad-nights-backend -f

# Rebuild everything
docker-compose down
docker-compose up -d --build

# Check container health
docker ps --format "table {{.Names}}\t{{.Status}}"

# Execute command in container
docker exec jugaad-nights-backend npm run typeorm:show-migrations
```

### Browser DevTools
```javascript
// F12 Console commands

// Clear all logs
clear()

// Show only errors
function showErrors() { window.console.error = (...args) => {}; }

// View React Query DevTools (if installed)
window.__REACT_QUERY_DEVTOOLS_PANEL__

// Monitor query invalidation
queryClient.getQueryCache().subscribe(event => {
  if (event.type === 'updated') {
    console.log('Query updated:', event.query.queryKey);
  }
});
```

---

## 📊 Logging Prefixes Used Today

| Prefix | Meaning | Location |
|--------|---------|----------|
| 📝 | Form submitted | handleSubmitFestival |
| ➕ | Creating new item | handleSubmitFestival |
| 🔄 | Updating existing | handleSubmitFestival |
| ✅ | Success | handleSubmitFestival |
| ❌ | Error | handleSubmitFestival |
| 📊 | Data updated | useEffect hook |

Use these to follow the flow in console!

---

## 🆘 When All Else Fails

### Nuclear Option 1: Clear Cache
```javascript
// In F12 console:
queryClient.clear()
location.reload()
```

### Nuclear Option 2: Reset State
```bash
# Delete local docker volumes (WILL DELETE DATA):
docker-compose down -v
docker-compose up -d --build
```

### Nuclear Option 3: Check All Containers
```bash
docker-compose logs --tail=50

# Or individually:
docker logs jugaad-nights-frontend
docker logs jugaad-nights-backend
docker logs jugaad-postgres
docker logs jugaad-redis
```

### Nuclear Option 4: Git Diff
```bash
# See what changed
git diff src/hooks/useApi.ts
git diff src/pages/Festivals.tsx

# See last change
git log -1 --stat
```

---

**Created:** April 11, 2026
**For Issues:** Follow the debugging flowchart at top
**Quick Help:** Use emoji prefixes to navigate console logs

