import {useEditor, EditorContent} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import {
    FaBold,
    FaItalic,
    FaUnderline,
    FaListOl,
    FaListUl,
    FaHeading,
} from "react-icons/fa"
import {useEffect, useState} from "react";

const TipTap = ({ content, onChange }: { content: string, onChange: (val: string) => void }) => {
    const [headingLevel, setHeadingLevel] = useState(1);
    const editor = useEditor({
        extensions: [StarterKit,
            Underline],
        content,
        editorProps: {
            attributes: {
                class:
                    "prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl focus:outline-none min-h-[250px]",
            }
        },
        immediatelyRender: false,
        onUpdate({ editor }) {
            onChange(editor.getHTML());
        },
    })
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);
    if (!editor) return null;
    return (
        <>
            <div className="flex flex-col border rounded-md">
                <div className="w-full p-2">
                    <div className="flex space-x-2 mb-2 border-b">
                        <div className="relative">
                            <button type="button" className={`p-2`}>
                                <FaHeading/>
                            </button>
                            <select
                                value={headingLevel}
                                onChange={(e) => {
                                    const levelNum = Number(e.target.value);
                                    const level = [1, 2, 3, 4, 5, 6].includes(levelNum) ? (levelNum as 1 | 2 | 3 | 4 | 5 | 6) : 1;
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
                        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()}
                                className={`p-2 ${editor.isActive("bold") ? "bg-gray-300" : ""}`}>
                            <FaBold/>
                        </button>
                        <button type="button"
                                onClick={() => editor.chain().focus().toggleItalic().run()}
                                className={`p-2 ${editor.isActive("italic") ? "bg-gray-300" : ""}`}>
                            <FaItalic/>
                        </button>
                        <button type="button"
                                onClick={() => editor.chain().focus().toggleUnderline().run()}
                                className={`p-2 ${editor.isActive("underline") ? "bg-gray-300" : ""}`}>
                            <FaUnderline/>
                        </button>
                        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}
                                className={`p-2 ${editor.isActive("bulletList") ? "bg-gray-300" : ""}`}>
                            <FaListUl/>
                        </button>
                        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()}
                                className={`p-2 ${editor.isActive("orderedList") ? "bg-gray-300" : ""}`}>
                            <FaListOl/>
                        </button>

                    </div>
                    <EditorContent editor={editor} className="tiptap-content"/>
                </div>
            </div>
        </>
    )
}
export default TipTap;