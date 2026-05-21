"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import type { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaListOl,
  FaListUl,
  FaParagraph,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaAlignJustify,
  FaLink,
  FaMinus,
  FaFont,
} from "react-icons/fa";
import { RiArrowGoBackFill, RiArrowGoForwardFill } from "react-icons/ri";
import {
  LuHeading1,
  LuHeading2,
  LuHeading3,
  LuHeading4,
  LuHeading5,
  LuHeading6,
} from "react-icons/lu";
import type { IconType } from "react-icons";
import { LuPaintBucket } from "react-icons/lu";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { Toggle } from "./ui/toggle";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontFamily } from "@tiptap/extension-text-style/font-family";
import Color from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";

const HEADING_ICONS: Record<1 | 2 | 3 | 4 | 5 | 6, IconType> = {
  1: LuHeading1,
  2: LuHeading2,
  3: LuHeading3,
  4: LuHeading4,
  5: LuHeading5,
  6: LuHeading6,
};

const TIMES_FONT = "'Times New Roman', serif";

function parseColorToHex(color: string | undefined): string {
  if (!color) return "#000000";
  const c = color.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(c)) return c.toLowerCase();
  if (/^#[0-9A-Fa-f]{3}$/.test(c)) {
    const [, r, g, b] = c;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  const rgb = c.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgb) {
    const h = (n: string) => Number(n).toString(16).padStart(2, "0");
    return `#${h(rgb[1])}${h(rgb[2])}${h(rgb[3])}`;
  }
  return "#000000";
}

function ColorPicker({ editor }: { editor: Editor }) {
  const [, tick] = useReducer((n: number) => n + 1, 0);
  useEffect(() => {
    const sync = () => tick();
    editor.on("selectionUpdate", sync);
    editor.on("transaction", sync);
    return () => {
      editor.off("selectionUpdate", sync);
      editor.off("transaction", sync);
    };
  }, [editor]);

  const raw = editor.getAttributes("textStyle").color as string | undefined;
  const currentColor = raw ?? "#000000";
  const pickerValue = parseColorToHex(raw);

  return (
    <div className="group relative flex h-8 min-w-8 items-center">
      <label className="relative flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-muted">
        <LuPaintBucket
          className="size-4 shrink-0"
          style={{ color: currentColor }}
        />
        <div
          className="absolute bottom-1 left-1/2 h-0.5 w-3 -translate-x-1/2 rounded-full"
          style={{ backgroundColor: currentColor }}
        />
        <input
          type="color"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          value={pickerValue}
          onInput={(e) =>
            editor.chain().focus().setColor(e.currentTarget.value).run()
          }
        />
      </label>
      <button
        type="button"
        onClick={() => editor.chain().focus().unsetColor().run()}
        className="ml-0.5 px-1 py-0.5 text-[10px] font-bold uppercase text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
      >
        Reset
      </button>
    </div>
  );
}

const TipTap = ({
  content,
  onChange,
  placeholder,
}: {
  content: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) => {
  const [headingLevel, setHeadingLevel] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [, tick] = useReducer((n: number) => n + 1, 0);
  const initialContent = useRef(content);
  const isInternalUpdate = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: false,
        underline: false,
        undoRedo: {
          depth: 100,
          newGroupDelay: 0,
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      FontFamily,
      Color,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        defaultProtocol: "https",
        protocols: ["http", "https"],
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
          style: "color: blue; text-decoration: underline;",
        },
      }),
    ],
    content: initialContent.current,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl focus:outline-none min-h-[150px]",
      },
      handlePaste(view, event) {
        const text = event.clipboardData?.getData("text/plain");
        if (!text) return false;
        event.preventDefault();
        view.dispatch(view.state.tr.insertText(text));
        return true;
      },
    },
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    onSelectionUpdate() {
      tick();
    },
    onTransaction() {
      tick();
    },
    onUpdate({ editor }) {
      isInternalUpdate.current = true;
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    if (editor.getHTML() !== content) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  const normalizeUrl = (url: string): string => {
    if (/^https?:\/\//i.test(url)) return url;
    return `https://${url}`;
  };

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    try {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: normalizeUrl(url.trim()) })
        .run();
    } catch (e) {
      alert((e as Error).message);
    }
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    const activeLevel = ([1, 2, 3, 4, 5, 6] as const).find((level) =>
      editor.isActive("heading", { level }),
    );
    if (activeLevel !== undefined) setHeadingLevel(activeLevel);
  }, [editor, tick]);

  if (!editor) return null;

  const HeadingIcon = HEADING_ICONS[headingLevel];

  const timesFontActive = (() => {
    const font = editor.getAttributes("textStyle").fontFamily as
      | string
      | undefined;
    return font?.includes("Times") ?? false;
  })();

  const Options = [
    {
      icon: <FaParagraph />,
      onClick: () => editor.chain().focus().setParagraph().run(),
      pressed: editor.isActive("paragraph"),
    },
    {
      icon: <FaBold />,
      onClick: () => editor.chain().focus().toggleBold().run(),
      pressed: editor.isActive("bold"),
    },
    {
      icon: <FaItalic />,
      onClick: () => editor.chain().focus().toggleItalic().run(),
      pressed: editor.isActive("italic"),
    },
    {
      icon: <FaUnderline />,
      onClick: () => editor.chain().focus().toggleUnderline().run(),
      pressed: editor.isActive("underline"),
    },
    {
      icon: <FaFont />,
      onClick: () => {
        if (timesFontActive) {
          editor.chain().focus().unsetFontFamily().run();
        } else {
          editor.chain().focus().setFontFamily(TIMES_FONT).run();
        }
      },
      pressed: timesFontActive,
    },
    {
      icon: <FaListUl />,
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      pressed: editor.isActive("bulletList"),
    },
    {
      icon: <FaListOl />,
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      pressed: editor.isActive("orderedList"),
    },
    {
      icon: <FaAlignLeft />,
      onClick: () => editor.chain().focus().toggleTextAlign("left").run(),
      pressed: editor.isActive("textAlign", "left"),
    },
    {
      icon: <FaAlignCenter />,
      onClick: () => editor.chain().focus().toggleTextAlign("center").run(),
      pressed: editor.isActive("textAlign", "center"),
    },
    {
      icon: <FaAlignRight />,
      onClick: () => editor.chain().focus().toggleTextAlign("right").run(),
      pressed: editor.isActive("textAlign", "right"),
    },
    {
      icon: <FaAlignJustify />,
      onClick: () => editor.chain().focus().toggleTextAlign("justify").run(),
      pressed: editor.isActive("textAlign", "justify"),
    },
    {
      icon: <FaMinus />,
      onClick: () => editor.chain().focus().setHorizontalRule().run(),
      pressed: false,
    },
    {
      icon: <FaLink />,
      onClick: setLink,
      pressed: editor.isActive("link"),
    },
  ];

  return (
    <>
      <div className="flex flex-col border rounded-md">
        <div className="w-full p-2">
          <div className="flex space-x-2 mb-2 border-b pb-1">
            <div className="relative">
              <button type="button" className="p-2 pointer-events-none">
                <HeadingIcon className="size-4" />
              </button>
              <select
                value={headingLevel}
                onChange={(e) => {
                  const levelNum = Number(e.target.value);
                  const level = [1, 2, 3, 4, 5, 6].includes(levelNum)
                    ? (levelNum as 1 | 2 | 3 | 4 | 5 | 6)
                    : 1;
                  setHeadingLevel(level);
                  editor.chain().focus().toggleHeading({ level }).run();
                }}
                className="absolute top-0 left-0 opacity-0 w-full h-full cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6].map((level) => (
                  <option key={level} value={level}>
                    H{level}
                  </option>
                ))}
              </select>
            </div>
            {Options.map((option, index) => (
              <Toggle
                key={index}
                type="button"
                onClick={option.onClick}
                pressed={option.pressed}
                className="hover:bg-gray-100 aria-pressed:bg-blue-100 aria-pressed:text-blue-700 aria-pressed:ring-1 aria-pressed:ring-blue-300 data-[state=on]:bg-blue-100 data-[state=on]:text-blue-700 data-[state=on]:ring-1 data-[state=on]:ring-blue-300"
              >
                {option.icon}
              </Toggle>
            ))}
            <Toggle
              type="button"
              onClick={() => editor.commands.undo()}
              disabled={!editor.can().undo()}
              pressed={false}
              aria-label="Undo"
              className="hover:bg-gray-100"
            >
              <RiArrowGoBackFill />
            </Toggle>
            <Toggle
              type="button"
              onClick={() => editor.commands.redo()}
              disabled={!editor.can().redo()}
              pressed={false}
              aria-label="Redo"
              className="hover:bg-gray-100"
            >
              <RiArrowGoForwardFill />
            </Toggle>
            <ColorPicker editor={editor} />
          </div>
          <EditorContent
            editor={editor}
            className="tiptap-content"
            placeholder={placeholder}
          />
        </div>
      </div>
    </>
  );
};
export default TipTap;
