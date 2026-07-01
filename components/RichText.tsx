"use client";

import React from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";

// Small rich-text editor used for the "Content (in image)" field, so a brief can
// express the on-image text hierarchy (headline / subhead / body / fine print).
// Stores HTML; the .docx generator (lib/htmlToDocx.ts) round-trips the formatting.

function ToolBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()} // keep editor selection
      onClick={onClick}
      className={
        "min-w-[28px] h-7 px-1.5 rounded text-sm leading-none transition " +
        (active ? "bg-[var(--brand)] text-white" : "text-gray-600 hover:bg-[var(--brand-soft)]")
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
    extensions: [StarterKit, Underline],
    content: value || "",
    immediatelyRender: false,
    editorProps: { attributes: { class: "richtext" } },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });

  if (!editor) {
    return <div className="rounded-lg border border-[var(--border)] bg-white h-32" />;
  }

  const e = editor as Editor;
  return (
    <div className="rounded-lg border border-[var(--border)] bg-white focus-within:border-[var(--brand)] focus-within:ring-2 focus-within:ring-[var(--brand-soft)]">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-[var(--border)] p-1.5">
        <ToolBtn title="Bold" active={e.isActive("bold")} onClick={() => e.chain().focus().toggleBold().run()}>
          <strong>B</strong>
        </ToolBtn>
        <ToolBtn title="Italic" active={e.isActive("italic")} onClick={() => e.chain().focus().toggleItalic().run()}>
          <em>I</em>
        </ToolBtn>
        <ToolBtn title="Underline" active={e.isActive("underline")} onClick={() => e.chain().focus().toggleUnderline().run()}>
          <span className="underline">U</span>
        </ToolBtn>
        <ToolBtn title="Strikethrough" active={e.isActive("strike")} onClick={() => e.chain().focus().toggleStrike().run()}>
          <span className="line-through">S</span>
        </ToolBtn>
        <span className="mx-1 w-px h-5 bg-[var(--border)]" />
        <ToolBtn title="Heading" active={e.isActive("heading", { level: 2 })} onClick={() => e.chain().focus().toggleHeading({ level: 2 }).run()}>
          H1
        </ToolBtn>
        <ToolBtn title="Subheading" active={e.isActive("heading", { level: 3 })} onClick={() => e.chain().focus().toggleHeading({ level: 3 }).run()}>
          H2
        </ToolBtn>
        <span className="mx-1 w-px h-5 bg-[var(--border)]" />
        <ToolBtn title="Bullet list" active={e.isActive("bulletList")} onClick={() => e.chain().focus().toggleBulletList().run()}>
          •
        </ToolBtn>
        <ToolBtn title="Numbered list" active={e.isActive("orderedList")} onClick={() => e.chain().focus().toggleOrderedList().run()}>
          1.
        </ToolBtn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
