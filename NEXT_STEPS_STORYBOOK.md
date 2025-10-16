# Storybook Next Steps - Quick Action Plan

## Current Status

✅ **Storybook Installed**: 9.1.10 with React-Vite  
✅ **Configuration Complete**: main.ts + preview.tsx ready  
✅ **Button Stories**: 100% complete (16 stories)  
⚠️ **Skeleton Stories**: Created but needs API alignment

## Immediate Actions (Next 30 Minutes)

### 1. Review Actual Component APIs (10 mins)

Before writing more stories, check the actual component interfaces:

```bash
# Check Alert component
code src/shared/components/ui/Alert/Alert.tsx

# Check Modal component
code src/shared/components/ui/Modal/Modal.tsx

# Check Badge component
code src/shared/components/ui/Badge/Badge.tsx
```

### 2. Fix or Remove Skeleton Stories (20 mins)

**Option A**: Fix stories to match simple API

- Use `className` prop only
- Show Tailwind class combinations
- Document PageSkeleton, DashboardSkeleton separately

**Option B**: Remove incomplete stories for now

- Focus on components with stable APIs
- Come back to Skeleton after standardization

**Recommended**: Option B - remove and focus on Alert/Modal next

## Phase 2 Remaining Tasks

### Task 7: Component Documentation (Storybook) - 75% Remaining

**Priority Order**:

1. ✅ Button ← DONE
2. 🔄 Alert ← NEXT (check API first!)
3. 🔄 Modal ← AFTER ALERT
4. 🔄 Badge
5. 🔄 Skeleton (revisit)

### Task 8: Implement View Transitions (Not Started)

- React 19 useTransition hook
- Animate route changes
- Loading state transitions

### Task 9: Dark Mode Testing (Not Started)

- Test all components in dark mode
- Verify contrast ratios
- Document edge cases

### Task 10: Dark Theme Guidelines (Not Started)

- Document color tokens
- Usage examples
- Best practices

## Smart Workflow

Instead of spending hours fixing Skeleton stories, let's:

1. **Verify Component APIs First** (all at once)
2. **Write Stories for Stable Components** (Alert, Modal, Badge)
3. **Document What Works** (Button is already perfect)
4. **Flag Components Needing Enhancement** (Skeleton, etc.)
5. **Move to Task 8-10** (View Transitions, Testing, Documentation)

## Time Budget

| Task                 | Estimated     | Priority                 |
| -------------------- | ------------- | ------------------------ |
| Check Component APIs | 15 mins       | HIGH                     |
| Alert Stories        | 45 mins       | HIGH                     |
| Modal Stories        | 45 mins       | HIGH                     |
| Badge Stories        | 30 mins       | MEDIUM                   |
| Run Storybook + Test | 15 mins       | HIGH                     |
| **Total**            | **2.5 hours** | **Complete Task 7 Core** |

Then move to Task 8-10 (View Transitions, Testing, Docs)

## Decision Point

**Question**: Should we:

- A) Perfect every component story now (8-10 hours)
- B) Document core components + move to Task 8-10 (4 hours + 6 hours)

**Recommendation**: Option B - get breadth first, depth later

## Next Command

```bash
# Start by checking Alert component API
code src/shared/components/ui/Alert/Alert.tsx
```

Or tell me:

- "Fix Skeleton stories properly"
- "Skip Skeleton, do Alert next"
- "Move to Task 8 (View Transitions)"
- "Show me what's in Alert component"

**Your call** - you're the 25-year React expert! 🚀
