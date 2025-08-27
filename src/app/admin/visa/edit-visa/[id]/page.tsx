'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import { DocumentIcon } from "@heroicons/react/16/solid";
import TipTapEditor from "@/Components/TipTapEditor";

interface VisaData {
    title_tk: string;
    text_tk: string;
    title_en: string;
    text_en: string;
    title_ru: string;
    text_ru: string;
}

const EditVisa = () => {
    const { id } = useParams();
    const router = useRouter();

    const [data, setData] = useState<VisaData>({
        title_tk: '',
        text_tk: '',
        title_en: '',
        text_en: '',
        title_ru: '',
        text_ru: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/visa/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                console.log("Ответ от сервера:", response.data);

                if (Array.isArray(response.data) && response.data.length > 0) {
                    const rawData = response.data[0]; // Получаем первый элемент массива

                    setData({
                        title_tk: rawData.title_tk,
                        text_tk: rawData.text_tk,
                        title_en: rawData.title_en,
                        text_en: rawData.text_en,
                        title_ru: rawData.title_ru,
                        text_ru: rawData.text_ru,
                    });

                    setLoading(false);
                } else {
                    throw new Error("Данные не найдены");
                }
            } catch (err) {
                console.error('Ошибка при загрузке данных:', err);
                setError('Ошибка при загрузке');
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    const handleEditorChange = (name: keyof VisaData, content: string) => {
        setData((prev) => ({ ...prev, [name]: content }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) throw new Error("Токен не найден");

            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/visa/${id}`,
                {
                    title_tk: data.title_tk,
                    text_tk: data.text_tk,
                    title_en: data.title_en,
                    text_en: data.text_en,
                    title_ru: data.title_ru,
                    text_ru: data.text_ru,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            router.push(`/admin/visa/view-visa/${id}`);
        } catch (err) {
            console.error('Ошибка при сохранении:', err);
            setError('Ошибка при сохранении');
        }
    };





    if (loading) return <p>Загрузка...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8">
                    <h1 className="text-2xl font-bold mb-4">Edit Visa</h1>
                    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
                        <div className="tabs tabs-lift">
                            <input type="radio" name="my_tabs_3" className="tab" aria-label="Turkmen" defaultChecked />
                            <div className="tab-content bg-base-100 border-base-300 p-6">
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Title</label>

                                    <TipTapEditor
                                        content={data.title_tk}
                                        onChange={(content) => handleEditorChange('title_tk', content)}
                                    />

                                </div>
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Text:</label>
                                    <TipTapEditor
                                        content={data.text_tk}
                                        onChange={(content) => handleEditorChange('text_tk', content)}
                                    />
                                </div>
                            </div>

                            <input type="radio" name="my_tabs_3" className="tab" aria-label="English" />
                            <div className="tab-content bg-base-100 border-base-300 p-6">
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Title:</label>
                                    <TipTapEditor
                                        content={data.title_en}
                                        onChange={(content) => handleEditorChange('title_en', content)}

                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Text:</label>
                                    <TipTapEditor
                                        content={data.text_en}
                                        onChange={(content) => handleEditorChange('text_en', content)}

                                    />
                                </div>
                            </div>

                            <input type="radio" name="my_tabs_3" className="tab" aria-label="Russian" />
                            <div className="tab-content bg-base-100 border-base-300 p-6">
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Title:</label>
                                    <TipTapEditor
                                        content={data.title_ru}
                                        onChange={(content) => handleEditorChange('title_ru', content)}

                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Text:</label>
                                    <TipTapEditor
                                        content={data.text_ru}
                                        onChange={(content) => handleEditorChange('text_ru', content)}

                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="bg text-white px-4 py-2 rounded flex items-center hover:bg-blue-700"
                        >
                            <DocumentIcon className="size-5 mr-2" />
                            Save
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditVisa;
