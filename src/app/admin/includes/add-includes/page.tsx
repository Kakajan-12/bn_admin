'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/Components/Sidebar';
import TokenTimer from '@/Components/TokenTimer';
import TipTapEditor from '@/Components/TipTapEditor';

interface IncludeItem {
    text_tk: string;
    text_en: string;
    text_ru: string;
    tour_id: string;
}

const AddIncludes = () => {
    const [isClient, setIsClient] = useState(false);
    const [includes, setIncludes] = useState<IncludeItem[]>([
        {
            text_tk: '',
            text_en: '',
            text_ru: '',
            tour_id: '',
        }
    ]);
    const [tours, setTours] = useState<
        { id: number; title_tk: string; title_en: string; title_ru: string }[]
    >([]);
    const [activeTabIndexes, setActiveTabIndexes] = useState<number[]>([0]);

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

    const addNewInclude = () => {
        setIncludes(prev => [...prev, {
            text_tk: '',
            text_en: '',
            text_ru: '',
            tour_id: '',
        }]);
        setActiveTabIndexes(prev => [...prev, 0]);
    };

    const removeInclude = (index: number) => {
        if (includes.length > 1) {
            setIncludes(prev => prev.filter((_, i) => i !== index));
            setActiveTabIndexes(prev => prev.filter((_, i) => i !== index));
        }
    };

    const updateInclude = (index: number, field: keyof IncludeItem, value: string) => {
        setIncludes(prev => prev.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        ));
    };

    const updateActiveTab = (includeIndex: number, tabIndex: number) => {
        setActiveTabIndexes(prev => prev.map((tab, i) =>
            i === includeIndex ? tabIndex : tab
        ));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.error('Нет токена. Пользователь не авторизован.');
            return;
        }

        const nonEmptyIncludes = includes.filter(item =>
            item.text_tk.trim() ||
            item.text_en.trim() ||
            item.text_ru.trim() ||
            item.tour_id
        );

        if (nonEmptyIncludes.length === 0) {
            alert('Пожалуйста, заполните хотя бы один include');
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/includes/bulk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ includes: nonEmptyIncludes }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Includes добавлены!', data);
                setIncludes([{
                    text_tk: '',
                    text_en: '',
                    text_ru: '',
                    tour_id: '',
                }]);
                setActiveTabIndexes([0]);
                router.push('/admin/includes');
            } else {
                await handleSubmitOneByOne(nonEmptyIncludes, token);
            }
        } catch (error) {
            console.error('Ошибка запроса', error);
            const token = localStorage.getItem('auth_token');
            if (token) {
                const nonEmptyIncludes = includes.filter(item =>
                    item.text_tk.trim() ||
                    item.text_en.trim() ||
                    item.text_ru.trim() ||
                    item.tour_id
                );
                await handleSubmitOneByOne(nonEmptyIncludes, token);
            }
        }
    };

    const handleSubmitOneByOne = async (nonEmptyIncludes: IncludeItem[], token: string) => {
        try {
            for (const include of nonEmptyIncludes) {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/includes`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(include),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Ошибка при добавлении: ${errorText}`);
                }
            }

            console.log('Все includes успешно добавлены!');
            setIncludes([{
                text_tk: '',
                text_en: '',
                text_ru: '',
                tour_id: '',
            }]);
            setActiveTabIndexes([0]);
            router.push('/admin/includes');
        } catch (error) {
            console.error('Ошибка при добавлении includes:', error);
            alert('Ошибка: ' + (error as Error).message);
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
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-left">Add new includes</h2>
                            <button
                                type="button"
                                onClick={addNewInclude}
                                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-150"
                            >
                                + Add Another Include
                            </button>
                        </div>

                        {includes.map((include, includeIndex) => (
                            <div key={includeIndex} className="mb-8 p-4 border rounded-lg bg-gray-50">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">Include #{includeIndex + 1}</h3>
                                    {includes.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeInclude(includeIndex)}
                                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-sm"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Tours:
                                    </label>
                                    <select
                                        value={include.tour_id}
                                        onChange={(e) => updateInclude(includeIndex, 'tour_id', e.target.value)}
                                        required
                                        className="border border-gray-300 rounded p-2 w-full"
                                    >
                                        <option value="">Select a tour</option>
                                        {tours.map((tour) => (
                                            <option key={tour.id} value={tour.id}>
                                                {tour.title_en} / {tour.title_tk} / {tour.title_ru}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {isClient && (
                                    <div className="tabs tabs-lift">
                                        {/* Turkmen Tab */}
                                        <input
                                            type="radio"
                                            name={`my_tabs_${includeIndex}`}
                                            className="tab"
                                            aria-label="Turkmen"
                                            checked={activeTabIndexes[includeIndex] === 0}
                                            onChange={() => updateActiveTab(includeIndex, 0)}
                                        />
                                        <div className="tab-content bg-base-100 border-base-300 p-6">
                                            <div className="mb-4">
                                                <label className="block text-gray-700 font-semibold mb-2">Text:</label>
                                                <TipTapEditor
                                                    content={include.text_tk}
                                                    onChange={(content) => updateInclude(includeIndex, 'text_tk', content)}
                                                />
                                            </div>
                                        </div>

                                        <input
                                            type="radio"
                                            name={`my_tabs_${includeIndex}`}
                                            className="tab"
                                            aria-label="English"
                                            checked={activeTabIndexes[includeIndex] === 1}
                                            onChange={() => updateActiveTab(includeIndex, 1)}
                                        />
                                        <div className="tab-content bg-base-100 border-base-300 p-6">
                                            <div className="mb-4">
                                                <label className="block text-gray-700 font-semibold mb-2">Text:</label>
                                                <TipTapEditor
                                                    content={include.text_en}
                                                    onChange={(content) => updateInclude(includeIndex, 'text_en', content)}
                                                />
                                            </div>
                                        </div>

                                        <input
                                            type="radio"
                                            name={`my_tabs_${includeIndex}`}
                                            className="tab"
                                            aria-label="Russian"
                                            checked={activeTabIndexes[includeIndex] === 2}
                                            onChange={() => updateActiveTab(includeIndex, 2)}
                                        />
                                        <div className="tab-content bg-base-100 border-base-300 p-6">
                                            <div className="mb-4">
                                                <label className="block text-gray-700 font-semibold mb-2">Text:</label>
                                                <TipTapEditor
                                                    content={include.text_ru}
                                                    onChange={(content) => updateInclude(includeIndex, 'text_ru', content)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        <div className="flex space-x-4 mt-6">
                            <button
                                type="submit"
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition duration-150"
                            >
                                Add {includes.length > 1 ? 'All Includes' : 'Include'}
                            </button>
                            <button
                                type="button"
                                onClick={addNewInclude}
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded transition duration-150"
                            >
                                + Add Another
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddIncludes;