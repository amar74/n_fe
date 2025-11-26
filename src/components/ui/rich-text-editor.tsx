import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Bold, Italic, List, Underline } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sanitizeBasicHtml } from '@/lib/sanitize-html';

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  toolbarClassName?: string;
}

const COMMANDS: Array<{ label: string; icon: JSX.Element; command: string }> = [
  { label: 'Bold', icon: <Bold className="h-4 w-4" />, command: 'bold' },
  { label: 'Italic', icon: <Italic className="h-4 w-4" />, command: 'italic' },
  { label: 'Underline', icon: <Underline className="h-4 w-4" />, command: 'underline' },
  { label: 'Bulleted list', icon: <List className="h-4 w-4" />, command: 'insertUnorderedList' },
];

export const RichTextEditor = forwardRef<HTMLDivElement, RichTextEditorProps>(
  ({ value, onChange, placeholder, className, toolbarClassName }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => editorRef.current as HTMLDivElement, []);

    useEffect(() => {
      const target = editorRef.current;
      if (!target) return;
      if ((target.innerHTML || '') !== value) {
        target.innerHTML = value || '';
      }
    }, [value]);

    const handleInput = () => {
      if (!editorRef.current) return;
      onChange(editorRef.current.innerHTML);
    };

    const handleCommand = (command: string) => {
      document.execCommand(command, false);
      handleInput();
      editorRef.current?.focus();
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if ((event.metaKey || event.ctrlKey) && ['b', 'i', 'u'].includes(event.key.toLowerCase())) {
        event.preventDefault();
        const mapping: Record<string, string> = { b: 'bold', i: 'italic', u: 'underline' };
        handleCommand(mapping[event.key.toLowerCase()]);
      }
    };

    const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
      event.preventDefault();
      const clipboard = event.clipboardData || (window as any).clipboardData;
      if (!clipboard) return;

      const html = clipboard.getData('text/html');
      const text = clipboard.getData('text/plain');
      const sanitized = sanitizeBasicHtml(html || text);
      document.execCommand('insertHTML', false, sanitized);
      handleInput();
    };

    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
      if (!editorRef.current) return;
      if (event.target instanceof HTMLElement && editorRef.current.contains(event.target)) {
        // Allow selections to occur naturally.
        return;
      }
      editorRef.current.focus();
    };

    return (
      <div className={cn('rounded-lg border border-gray-200 bg-white shadow-sm', className)}>
        <div
          className={cn(
            'flex items-center gap-1 border-b border-gray-200 bg-gray-50 px-2 py-1',
            toolbarClassName,
          )}
        >
          {COMMANDS.map((item) => (
            <button
              key={item.command}
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-600 hover:bg-white hover:text-indigo-600"
              onClick={() => handleCommand(item.command)}
              aria-label={item.label}
            >
              {item.icon}
            </button>
          ))}
        </div>
        <div
          ref={editorRef}
          contentEditable
          role="textbox"
          aria-multiline="true"
          spellCheck
          tabIndex={0}
          className="rich-text-editor__content min-h-[300px] max-h-[600px] w-full resize-y overflow-auto px-4 py-3 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-text"
          data-placeholder={placeholder || ''}
          onMouseDown={handleMouseDown}
          onInput={handleInput}
          onBlur={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          suppressContentEditableWarning
        />
        <style>{`
          .rich-text-editor__content[data-placeholder]:empty:before {
            content: attr(data-placeholder);
            color: rgba(107, 114, 128, 0.7);
            pointer-events: none;
            font-weight: 400;
            white-space: pre-wrap;
          }
        `}</style>
      </div>
    );
  },
);

RichTextEditor.displayName = 'RichTextEditor';
