'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/Components/Sidebar';
import TokenTimer from '@/Components/TokenTimer';
import TipTapEditor from '@/Components/TipTapEditor';

const AddExcludes = () => {
    const [isClient, setIsClient] = useState(false);
    const [text_tk, setTextTk] = useState('');
    const [text_en, setTextEn] = useState('');
    const [text_ru, setTextRu] = useState('');
    const [tour_id, setTourId] = useState('');
    const [tours, setTours] = useState<
        { id: number; title_tk: string; title_en: string; title_ru: string }[]
    >([]);


    const router = useRouter();

    useEffect(() => {
        setIsClient(true);

        const fetchTours = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tours`);
                const data = await res.json();

                if (Array.isArray(data)) {
                    setTours(data);
                } else {
                    console.error('Неверный формат данных:', data);
                }
            } catch (err) {
                console.error('Ошибка при загрузке:', err);
            }
        };


        fetchTours();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.error('Нет токена. Пользователь не авторизован.');
            return;
        }

        const formData = {
            text_tk,
            text_en,
            text_ru,
            tour_id,
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/excludes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('добавлен!', data);
                setTextTk('');
                setTextEn('');
                setTextRu('');
                setTourId('');
                router.push('/admin/excludes');
            } else {
                const errorText = await response.text();
                console.error('Ошибка при добавлении:', errorText);
            }
        } catch (error) {
            console.error('Ошибка запроса', error);
        }
    };

    return (
        <div className="flex bg-gray-200">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8">
                    <form
                        onSubmit={handleSubmit}
                        className="w-full mx-auto p-6 border border-gray-300 rounded-lg shadow-lg bg-white"
                    >
                        <h2 className="text-2xl font-bold mb-4 text-left">Add new excludes</h2>

                        <div className="mb-4 flex space-x-4">

                            <div className="w-full">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Tours:
                                </label>
                                <select
                                    id="tours"
                                    name="tours"
                                    value={tour_id}
                                    onChange={(e) => setTourId(e.target.value)}
                                    required
                                    className="border border-gray-300 rounded p-2 w-full"
                                >
                                    <option value="">Select a category</option>
                                    {tours.map((tour) => (
                                        <option key={tour.id} value={tour.id}>
                                            {tour.title_en} / {tour.title_tk} / {tour.title_ru}
                                        </option>
                                    ))}
                                </select>

                            </div>
                        </div>

                        {isClient && (
                            <>
                                <div className="tabs tabs-lift">
                                    <input type="radio" name="my_tabs_3" className="tab" aria-label="Turkmen"
                                           defaultChecked/>
                                    <div className="tab-content bg-base-100 border-base-300 p-6">
                                        <div className="mb-4">
                                            <label className="block text-gray-700 font-semibold mb-2">Text:</label>
                                            <TipTapEditor
                                                content={text_tk}
                                                onChange={(content) => setTextTk(content)}
                                            />
                                        </div>
                                    </div>

                                    <input type="radio" name="my_tabs_3" className="tab" aria-label="English" />
                                    <div className="tab-content bg-base-100 border-base-300 p-6">
                                        <div className="mb-4">
                                            <label className="block text-gray-700 font-semibold mb-2">Text:</label>
                                            <TipTapEditor
                                                content={text_en}
                                                onChange={(content) => setTextEn(content)}
                                            />
                                        </div>
                                    </div>

                                    <input type="radio" name="my_tabs_3" className="tab" aria-label="Russian" />
                                    <div className="tab-content bg-base-100 border-base-300 p-6">
                                        <div className="mb-4">
                                            <label className="block text-gray-700 font-semibold mb-2">Text:</label>
                                            <TipTapEditor
                                                content={text_ru}
                                                onChange={(content) => setTextRu(content)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            className="w-full bg hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150"
                        >
                            Add excludes
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddExcludes;
