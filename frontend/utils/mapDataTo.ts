import { IHighlight } from 'react-pdf-highlighter-extended';
import { Highlight } from '@/types';

export const mapHighlightToIHighlight = (h: Highlight): IHighlight => ({
  id: h._id,
  comment: {
    text: h.vocab?.meaning || '',
    emoji: '',
  },
  content: h.content,
  position: h.position,
});
