# react-pdf-highlighter-extended - Technical Analysis Report

**Date:** 2026-04-21
**Source:** [DanielArnould/react-pdf-highlighter-extended](https://github.com/DanielArnould/react-pdf-highlighter-extended)
**Analysis Type:** Library Architecture & Positioning Logic

---

## 1. Core Architecture

### 1.1 Directory Structure

```
src/
├── components/
│   ├── HighlightLayer.tsx      # Renders highlight overlays
│   ├── MouseSelection.tsx      # Area selection (Alt+drag)
│   ├── PdfHighlighter.tsx      # Main component, context provider
│   └── TipContainer.tsx        # Renders tooltip/popup at position
├── contexts/
│   └── PdfHighlighterContext.tsx  # Context for tip management
├── lib/
│   ├── coordinates.ts          # Coordinate conversion utilities
│   ├── get-bounding-rect.ts    # Selection bounding rect extraction
│   ├── get-client-rects.ts     # Client rects for multi-line selections
│   └── ...
└── types.ts                    # Type definitions
```

### 1.2 Context API (usePdfHighlighterContext)

```typescript
interface PdfHighlighterContextValue {
  // Tip management
  setTip: (tip: Tip | null) => void;
  getTip: () => Tip | null;
  updateTipPosition: () => void;

  // Selection
  getCurrentSelection: () => PdfSelection | null;
  removeGhostHighlight: () => void;

  // Viewer
  getViewer: () => PDFViewer | null;

  // Scroll
  scrollToHighlight: (highlight: IHighlight) => void;
}
```

**Key insight:** The context provides `setTip()` directly - this bypasses the `selectionTip` prop mechanism and gives full control over tip content and position.

---

## 2. Coordinate System

### 2.1 Position Types

| Type | Description | Coordinate Space |
|------|-------------|------------------|
| `ScaledPosition` | PDF-native coordinates | PDF units (0-1 or actual PDF coords) |
| `ViewportPosition` | Browser pixel coordinates | Absolute viewport pixels |

### 2.2 Coordinate Conversion (coordinates.ts)

```typescript
export const scaledPositionToViewport = (
  { boundingRect, rects, usePdfCoordinates }: ScaledPosition,
  viewer: PDFViewer,
): ViewportPosition => {
  const pageNumber = boundingRect.pageNumber;
  const viewport = viewer.getPageView(pageNumber - 1).viewport;
  const scale = (obj: Scaled) =>
    scaledToViewport(obj, viewport, usePdfCoordinates);

  return {
    boundingRect: scale(boundingRect),
    rects: (rects || []).map(scale),
  };
};
```

**Important:** `scaledPositionToViewport` returns **absolute viewport coordinates** - these are relative to the PDF page element's offset parent, NOT page-relative.

---

## 3. TipContainer Positioning (THE CRITICAL FILE)

**File:** `src/components/TipContainer.tsx`

### 3.1 Positioning Logic

```typescript
const VERTICAL_PADDING = 5;

// Inside TipContainer:
const { position, content } = currentTip;
const { boundingRect } = position;
const pageNumber = boundingRect.pageNumber;
const pageNode = viewer.getPageView(pageNumber - 1).div;
const pageBoundingClientRect = pageNode.getBoundingClientRect();
const { left: pageLeft, width: pageWidth } = pageBoundingClientRect;

const scrollTop = viewer.container.scrollTop;

// HORIZONTAL: Center tip over highlight
const left = pageNode.offsetLeft + boundingRect.left + boundingRect.width / 2;

// VERTICAL: Calculate top and bottom of highlight
const highlightTop = boundingRect.top + pageNode.offsetTop;
const highlightBottom = highlightTop + boundingRect.height;

// Decide: render ABOVE or BELOW?
const shouldMove = highlightTop - height - VERTICAL_PADDING < scrollTop;
const top = shouldMove
  ? highlightBottom + VERTICAL_PADDING   // Below
  : highlightTop - height - VERTICAL_PADDING;  // Above

// Clamp horizontal to stay within page
const clampedLeft = clamp(left - width / 2, 0, pageLeft + pageWidth - width);
```

### 3.2 Key Positioning Formula

```typescript
// Horizontal center
left = pageNode.offsetLeft + boundingRect.left + (boundingRect.width / 2)

// Vertical (choose above or below based on scroll)
top = shouldMove
  ? boundingRect.top + pageNode.offsetTop + boundingRect.height + VERTICAL_PADDING
  : boundingRect.top + pageNode.offsetTop - height - VERTICAL_PADDING
```

### 3.3 CRITICAL: Double-Offset Issue

**The library ITSELF adds `pageNode.offsetLeft` and `pageNode.offsetTop` to positions.**

If you:
1. Call `scaledPositionToViewport()` which returns coordinates that may already include page offsets
2. Then pass to `setTip({ position: viewportPosition, ... })`
3. TipContainer adds the offsets AGAIN

**Result:** Double-offset, tooltip appears 700-900px away when page is at 0.

### 3.4 Solution Options

**Option A: Pass Raw Position (Recommended by library)**
- Don't adjust `viewportPosition` before passing to `setTip()`
- Let TipContainer handle all offset calculations
- The `scaledPositionToViewport()` result is designed to work with TipContainer's offset logic

**Option B: Pre-subtract Offsets**
- If you need custom positioning, subtract page offsets before passing:
```typescript
const adjustedPosition = {
  boundingRect: {
    ...viewportPosition.boundingRect,
    left: viewportPosition.boundingRect.left - pageView.div.offsetLeft,
    top: viewportPosition.boundingRect.top - pageView.div.offsetTop,
  },
  // same for rects[]
};
```
- Then TipContainer adds them back correctly

---

## 4. Selection Tip Mechanism

### 4.1 How selectionTip Prop Works

**In PdfHighlighter.tsx (onMouseUp handler):**

```typescript
onSelectionFinished && onSelectionFinished(selectionRef.current);

selectionTip &&
  setTip({ position: viewportPosition, content: selectionTip });
```

When text is selected:
1. `scaledPositionToViewport()` is called to convert to viewport coords
2. If `selectionTip` prop is provided, `setTip()` is called automatically
3. TipContainer renders the tip at the calculated position

### 4.2 Why selectionTip Prop Can Be Problematic

1. **Timing Issue:** `selectionTip` is evaluated at render time, before React state updates
2. **React Batching:** If `selectionTip` depends on state, it may be `undefined` during the first render after selection
3. **No access to context:** The prop approach doesn't give access to `usePdfHighlighterContext()`

### 4.3 Alternative: Direct setTip() via Context

Instead of using `selectionTip` prop, use `usePdfHighlighterContext().setTip()` directly inside a child component:

```typescript
function TipManager({ selectionData, onConfirm }) {
  const utils = usePdfHighlighterContext();

  useEffect(() => {
    if (selectionData) {
      const viewer = utils.getViewer();
      const viewportPosition = scaledPositionToViewport(selectionData.position, viewer);

      // NO adjustment needed - pass directly
      utils.setTip({
        position: viewportPosition,
        content: <SelectionTip onConfirm={onConfirm} content={selectionData.content} />,
      });
    }
  }, [selectionData, utils, onConfirm]);

  return null; // TipContainer renders the actual tip
}
```

---

## 5. Existing Highlight Popup (highlightTip)

### 5.1 MonitoredHighlightContainer Pattern

```typescript
<MonitoredHighlightContainer
  highlightTip={
    showPopup
      ? {
          position: viewportHighlight.position,  // Use the highlight's stored position
          content: <HighlightPopup highlight={dbHighlight} />,
        }
      : undefined
  }
>
  {isTextHighlight ? <TextHighlight /> : <AreaHighlight />}
</MonitoredHighlightContainer>
```

### 5.2 Important: highlightTip Uses Stored Position

The `position` for `highlightTip` comes from `viewportHighlight.position` which is ALREADY a `ViewportPosition` (stored during initial highlight creation via `scaledPositionToViewport`).

**DO NOT re-convert** stored positions - they are already in viewport coordinate space.

---

## 6. SelectionTip Component Example (from ExpandableTip.tsx)

```typescript
const ExpandableTip = ({ addHighlight }: ExpandableTipProps) => {
  const [compact, setCompact] = useState(true);
  const {
    getCurrentSelection,
    removeGhostHighlight,
    setTip,
    updateTipPosition,
  } = usePdfHighlighterContext();

  useLayoutEffect(() => {
    updateTipPosition!(); // Recalculate when compact state changes
  }, [compact]);

  return (
    <div className="Tip">
      {compact ? (
        <button
          className="Tip__compact"
          onClick={() => {
            setCompact(false);
            selectionRef.current = getCurrentSelection();
            selectionRef.current!.makeGhostHighlight();
          }}
        >
          Add highlight
        </button>
      ) : (
        <CommentForm ... />
      )}
    </div>
  );
};
```

**Key pattern:** Call `updateTipPosition()` after layout changes that affect tip positioning.

---

## 7. Ghost Highlight System

### 7.1 Flow

1. User selects text → `onSelection` callback fires
2. `selection.makeGhostHighlight()` creates a temporary visual highlight
3. If user confirms → create permanent highlight
4. If user clicks away → `onRemoveGhostHighlight` removes it

### 7.2 Ghost Highlight Data

```typescript
// The ghost contains:
// - content: { text, image? }
// - position: ScaledPosition (NOT viewport - conversion happens later)
```

---

## 8. Common Issues & Solutions

### Issue 1: Tooltip Not Appearing

**Possible causes:**
- `selectionTip` prop evaluated before React state update → Use `setTip()` directly via context
- SSR: `pdfjs-dist` accesses `window` at module load → Use dynamic import with `ssr: false`
- `isSelecting` state not properly triggering TipManager mount

### Issue 2: Tooltip Wrong Position (Double-Offset)

**Cause:** Passing adjusted coordinates when TipContainer already adds offsets.

**Solution:** Pass `scaledPositionToViewport()` result directly WITHOUT adjustment.

### Issue 3: Tooltip Appears But Disappears Immediately

**Cause:** `onSelection` or `onMouseDown` clears the tip.

**Check:** Ensure `onRemoveGhostHighlight` doesn't clear selection data needed for tip.

### Issue 4: SSR Error - window is not defined

**Cause:** `react-pdf-highlighter-extended` imports `pdfjs-dist` which accesses browser globals at import time.

**Solution:**
```typescript
const PdfViewer = dynamic(
  () => import('@/components/documents/pdf-viewer'),
  { ssr: false, loading: () => <Loading /> }
);
```

---

## 9. Best Practices

1. **Prefer `setTip()` via context over `selectionTip` prop** - More control, avoids timing issues
2. **Don't adjust viewport positions** - Let TipContainer handle offset calculations
3. **Use `selectionVersion` state** - Force useEffect re-run when selection changes
4. **Store selection data in refs** - Avoids stale closures, doesn't trigger re-render
5. **Call `updateTipPosition()` after layout changes** - Ensures tip stays positioned correctly
6. **Pre-existing highlights use stored positions** - Don't re-convert, they're already viewport coordinates

---

## 10. File Reference

| File | Purpose |
|------|---------|
| `TipContainer.tsx` | Renders tooltip at calculated position |
| `PdfHighlighter.tsx` | Main component, handles selection events |
| `PdfHighlighterContext.tsx` | Context API for tip management |
| `coordinates.ts` | `scaledPositionToViewport` function |
| `ExpandableTip.tsx` (example) | Reference implementation of selection tip |

---

## Appendix: CSS Classes

| Class | Purpose |
|-------|---------|
| `.PdfHighlighter__tip-container` | TipContainer wrapper |
| `.Tip__compact` | Compact tip button (Add highlight) |
| `.Tip__card` | Expanded tip card |
| `.Highlight__popup` | Existing highlight popup |

---

*Report generated from library source code analysis*
