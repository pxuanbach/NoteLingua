# PDF Viewer Tooltip Refactor - Issues Report

**Date:** 2026-04-22
**Goal:** Refactor tooltip to follow library's example pattern

---

## Issue 1: `usePdfHighlighterContext` not accessible in `selectionTip`

**Problem:** Tried to use `usePdfHighlighterContext()` inside `SelectionTipContent` component passed as `selectionTip` prop.

**Root Cause:** When `selectionTip` is passed to `PdfHighlighter`, the library captures it and renders it later inside `TipContainer`. However, the component is not rendered within the `PdfHighlighterContext.Provider` tree at that point.

**Evidence from library source (`TipContainer.js`):**
```javascript
// TipContainer receives `content` prop (the selectionTip component)
// but doesn't wrap it with PdfHighlighterContext.Provider
return (
  <div className="PdfHighlighter__tip-container">
    {content}
  </div>
);
```

**Status:** Cannot use `usePdfHighlighterContext()` in `selectionTip` component.

---

## Issue 2: `selectionTip` is captured once at render time

**Problem:** When trying to pass `text` as a prop to `SelectionTipContent`, the tooltip always showed "Sample text" (the initial value) instead of the actual selected text.

**Root Cause:** `selectionTip = <SelectionTipContent text={tooltipText} />` is evaluated once during render. Even when `tooltipText` state updates, the `selectionTip` prop doesn't re-evaluate because it's a static JSX expression.

**Attempted Fix:** Tried using `useCallback` to dynamically generate the tip:
```tsx
const getSelectionTip = useCallback(() => {
  return selectionDataRef.current?.text
    ? <SelectionTipContent text={selectionDataRef.current.text} onCreateVocab={handleCreateVocab} />
    : null;
}, [handleCreateVocab]);
const selectionTip = getSelectionTip();
```

**Status:** This approach also failed due to stale closure - the `selectionDataRef.current.text` value was from the previous selection cycle.

---

## Issue 3: Library's `selectionTip` mechanism

**How `selectionTip` works (from library source `PdfHighlighter.js`):**
```javascript
// Line 154-155 in handleMouseUp:
selectionTip && setTip({ position: viewportPosition, content: selectionTip });
```

The library:
1. Captures the `selectionTip` component as a React element at mount time
2. On selection, calls `setTip({ position, content: selectionTip })` passing the same captured element
3. `TipContainer` renders `content` (the captured React element) without re-evaluating props

**Key Insight:** The library expects `selectionTip` to be a React element that will be rendered "as-is" by `TipContainer`. The library doesn't pass dynamic data to it - it relies on the component to fetch its own data via context.

---

## Issue 4: `handleCreateVocab` cannot access selection data

**Problem:** Even though `onCreateVocab` callback was passed to `SelectionTipContent`, when clicked, the selection data was already cleared or stale.

**Root Cause:** The callbacks (`onSelection`, `onCreateGhostHighlight`) that store selection data are called BEFORE the tip is shown. When the user clicks "Create Vocabulary", the `selectionDataRef.current` may have been cleared by subsequent selection events.

---

## Why Example Works

The example's `ExpandableTip` works because:
1. It uses `getCurrentSelection()` from context to get the selection at click time
2. It stores selection in a local `selectionRef` during the compact→expanded transition
3. It calls `addHighlight()` with the stored selection on submit

---

## Conclusion

The library's `selectionTip` pattern is designed for simple tips that don't need dynamic data at render time. For custom behavior (like showing selected text and handling "Create Vocabulary"), the recommended approach is:

1. **Follow the example exactly** - use context to fetch selection data inside the tip component
2. **Accept limitations** - context only works when the tip is rendered within the provider tree

**Current Status:** Reverted to minimal implementation that follows library pattern. Further customization requires either:
- Modifying the library to pass context to `selectionTip`
- Using a different approach (e.g., external tooltip state management)
