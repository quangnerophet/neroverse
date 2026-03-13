/**
 * Parses a subset of Markdown: converts **bold text** into <strong>...</strong>
 * with the custom highlighter pen styling.
 */
export function parseMarkdown(text: string): string {
  // Replace **bold** with <strong>
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}
