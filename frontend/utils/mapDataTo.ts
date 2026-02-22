import type { Highlight as IHighlight } from 'react-pdf-highlighter-extended';
import { Highlight } from '@/types';

export const mapHighlightToIHighlight = (h: Highlight): IHighlight => ({
  id: h._id,
  type: h.content?.text ? 'text' : 'area',
  content: h.content,
  position: h.position,
});
