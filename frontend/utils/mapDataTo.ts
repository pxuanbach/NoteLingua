import type { Highlight as IHighlight } from 'react-pdf-highlighter-extended';
import { Highlight } from '@/types';

export const mapHighlightToIHighlight = (h: Highlight): IHighlight => ({
  id: h._id,
  type: 'text',
  content: h.content,
  position: h.position,
});
