"use client";

import React from "react";
import { useEditor, useEditorState, EditorContent, type Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";

// Small rich-text editor used for the "Content (in image)" field, so a brief can
// express the on-image text hierarchy (headline / subhead / body / fine print).
// Stores HTML; the .docx generator (lib/htmlToDocx.ts) round-trips the formatting.
//
// Long content: the toolbar is sticky (stays pinned while scrolling the editor), a
// mini toolbar pops up next to any selected text, and every button lists its shortcut.

const MOD = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl+";
const ALT = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform) ? "⌥" : "Alt+";

function ToolBtn({
  onClick,
  active,
  title,
  children,
  dark,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      onMouseDown={(e) => e.preventDefault()} // keep editor selection
      onClick={onClick}
      className={
        "min-w-[30px] h-8 px-2 rounded-full text-sm leading-none transition " +
        (dark
          ? active
            ? "bg-[var(--brand)] text-white"
            : "text-white/85 hover:bg-white/15"
          : active
            ? "bg-[var(--brand)] text-white"
            : "text-gray-600 hover:bg-[var(--brand-soft)]")
      }
    >
      {children}
    </button>
  );
}

export default function RichText({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [StarterKit], // StarterKit v3 already includes Underline
    content: value || "",
    immediatelyRender: false,
    editorProps: { attributes: { class: "richtext" } },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });

  if (!editor) {
    return <div className="rounded-[20px] border border-[var(--border)] bg-white/90 h-32" />;
  }

  const e = editor as Editor;
  return (
    <div className="rounded-[20px] border border-[var(--border)] bg-white/90 focus-within:border-[var(--brand)] focus-within:ring-4 focus-within:ring-[rgba(232,119,34,0.15)]">
      {/* sticky: stays pinned to the top of the screen while scrolling long content */}
      <div className="sticky top-0 z-20 flex flex-wrap items-center gap-0.5 rounded-t-[20px] border-b border-[var(--border)] bg-white p-1.5 shadow-[0_6px_14px_-12px_rgba(48,37,105,0.5)]">
        <Tools editor={e} />
        <span className="ml-auto pr-2 text-[11px] text-gray-400 hidden sm:inline">Tip: select text for quick formatting</span>
      </div>
      <BubbleMenu
        editor={e}
        // Attach to <body>: inside the editor wrapper, React re-renders detach it.
        appendTo={() => document.body}
        options={{ placement: "top", offset: 8, strategy: "fixed" }}
        className="z-50 flex items-center gap-0.5 rounded-full bg-[rgba(36,28,82,0.95)] p-1 shadow-[0_12px_28px_-10px_rgba(36,28,82,0.7)]"
      >
        <Tools editor={e} dark compact />
      </BubbleMenu>
      <EditorContent editor={editor} />
    </div>
  );
}

function Tools({ editor, dark, compact }: { editor: Editor; dark?: boolean; compact?: boolean }) {
  // Re-render on selection/format changes so active states stay accurate.
  const st = useEditorState({
    editor,
    selector: ({ editor: ed }) => ({
      bold: ed.isActive("bold"),
      italic: ed.isActive("italic"),
      underline: ed.isActive("underline"),
      strike: ed.isActive("strike"),
      h1: ed.isActive("heading", { level: 2 }),
      h2: ed.isActive("heading", { level: 3 }),
      bullet: ed.isActive("bulletList"),
      ordered: ed.isActive("orderedList"),
    }),
  });
  const e = editor;
  const sep = <span className={"mx-1 w-px h-5 " + (dark ? "bg-white/20" : "bg-[var(--border)]")} />;
  return (
    <>
      <ToolBtn dark={dark} title={`Bold (${MOD}B)`} active={st.bold} onClick={() => e.chain().focus().toggleBold().run()}>
        <strong>B</strong>
      </ToolBtn>
      <ToolBtn dark={dark} title={`Italic (${MOD}I)`} active={st.italic} onClick={() => e.chain().focus().toggleItalic().run()}>
        <em>I</em>
      </ToolBtn>
      <ToolBtn dark={dark} title={`Underline (${MOD}U)`} active={st.underline} onClick={() => e.chain().focus().toggleUnderline().run()}>
        <span className="underline">U</span>
      </ToolBtn>
      {!compact && (
        <ToolBtn dark={dark} title={`Strikethrough (${MOD}Shift+S)`} active={st.strike} onClick={() => e.chain().focus().toggleStrike().run()}>
          <span className="line-through">S</span>
        </ToolBtn>
      )}
      {sep}
      <ToolBtn dark={dark} title={`Heading (${MOD}${ALT}2)`} active={st.h1} onClick={() => e.chain().focus().toggleHeading({ level: 2 }).run()}>
        H1
      </ToolBtn>
      <ToolBtn dark={dark} title={`Subheading (${MOD}${ALT}3)`} active={st.h2} onClick={() => e.chain().focus().toggleHeading({ level: 3 }).run()}>
        H2
      </ToolBtn>
      {sep}
      <ToolBtn dark={dark} title={`Bullet list (${MOD}Shift+8)`} active={st.bullet} onClick={() => e.chain().focus().toggleBulletList().run()}>
        •
      </ToolBtn>
      <ToolBtn dark={dark} title={`Numbered list (${MOD}Shift+7)`} active={st.ordered} onClick={() => e.chain().focus().toggleOrderedList().run()}>
        1.
      </ToolBtn>
    </>
  );
}
