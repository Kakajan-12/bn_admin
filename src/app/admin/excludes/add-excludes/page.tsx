'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/Components/Sidebar';
import TokenTimer from '@/Components/TokenTimer';
import TipTapEditor from '@/Components/TipTapEditor';

interface ExcludeItem {
    text_tk: string;
    text_en: string;
    text_ru: string;
    tour_id: string;
}

const AddExcludes = () => {
    const [isClient, setIsClient] = useState(false);
    const [excludes, setExcludes] = useState<ExcludeItem[]>([
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

    // Добавить новый пустой exclude
    const addNewExclude = () => {
        setExcludes(prev => [...prev, {
            text_tk: '',
            text_en: '',
            text_ru: '',
            tour_id: '',
        }]);
        setActiveTabIndexes(prev => [...prev, 0]);
    };

    // Удалить exclude
    const removeExclude = (index: number) => {
        if (excludes.length > 1) {
            setExcludes(prev => prev.filter((_, i) => i !== index));
            setActiveTabIndexes(prev => prev.filter((_, i) => i !== index));
        }
    };

    // Обновить конкретное поле в определенном exclude
    const updateExclude = (index: number, field: keyof ExcludeItem, value: string) => {
        setExcludes(prev => prev.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        ));
    };

    // Обновить вкладку для конкретного exclude
    const updateActiveTab = (excludeIndex: number, tabIndex: number) => {
        setActiveTabIndexes(prev => prev.map((tab, i) =>
            i === excludeIndex ? tabIndex : tab
        ));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.error('Нет токена. Пользователь не авторизован.');
            return;
        }

        // Фильтруем пустые excludes (где нет хотя бы одного заполненного поля)
        const nonEmptyExcludes = excludes.filter(item =>
            item.text_tk.trim() ||
            item.text_en.trim() ||
            item.text_ru.trim() ||
            item.tour_id
        );

        if (nonEmptyExcludes.length === 0) {
            alert('Пожалуйста, заполните хотя бы один exclude');
            return;
        }

        try {
            // Отправляем все excludes одним запросом (если есть bulk endpoint)
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/excludes/bulk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ excludes: nonEmptyExcludes }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Excludes добавлены!', data);
                // Сброс формы
                setExcludes([{
                    text_tk: '',
                    text_en: '',
                    text_ru: '',
                    tour_id: '',
                }]);
                setActiveTabIndexes([0]);
                router.push('/admin/excludes');
            } else {
                // Если bulk endpoint не работает, пробуем по одному
                await handleSubmitOneByOne(nonEmptyExcludes, token);
            }
        } catch (error) {
            console.error('Ошибка запроса', error);
            // Пробуем отправить по одному
            const token = localStorage.getItem('auth_token');
            if (token) {
                await handleSubmitOneByOne(nonEmptyExcludes, token);
            }
        }
    };

    // Отправка по одному
    const handleSubmitOneByOne = async (nonEmptyExcludes: ExcludeItem[], token: string) => {
        try {
            // Отправляем каждый exclude отдельно
            for (const exclude of nonEmptyExcludes) {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/excludes`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(exclude),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Ошибка при добавлении: ${errorText}`);
                }
            }

            console.log('Все excludes успешно добавлены!');
            // Сброс формы
            setExcludes([{
                text_tk: '',
                text_en: '',
                text_ru: '',
                tour_id: '',
            }]);
            setActiveTabIndexes([0]);
            router.push('/admin/excludes');
        } catch (error) {
            console.error('Ошибка при добавлении excludes:', error);
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
                            <h2 className="text-2xl font-bold text-left">Add new excludes</h2>
                            <button
                                type="button"
                                onClick={addNewExclude}
                                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-150"
                            >
                                + Add Another Exclude
                            </button>
                        </div>

                        {excludes.map((exclude, excludeIndex) => (
                            <div key={excludeIndex} className="mb-8 p-4 border rounded-lg bg-gray-50">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">Exclude #{excludeIndex + 1}</h3>
                                    {excludes.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeExclude(excludeIndex)}
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
                                        value={exclude.tour_id}
                                        onChange={(e) => updateExclude(excludeIndex, 'tour_id', e.target.value)}
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
                                            name={`my_tabs_${excludeIndex}`}
                                            className="tab"
                                            aria-label="Turkmen"
                                            checked={activeTabIndexes[excludeIndex] === 0}
                                            onChange={() => updateActiveTab(excludeIndex, 0)}
                                        />
                                        <div className="tab-content bg-base-100 border-base-300 p-6">
                                            <div className="mb-4">
                                                <label className="block text-gray-700 font-semibold mb-2">Text:</label>
                                                <TipTapEditor
                                                    content={exclude.text_tk}
                                                    onChange={(content) => updateExclude(excludeIndex, 'text_tk', content)}
                                                />
                                            </div>
                                        </div>

                                        {/* English Tab */}
                                        <input
                                            type="radio"
                                            name={`my_tabs_${excludeIndex}`}
                                            className="tab"
                                            aria-label="English"
                                            checked={activeTabIndexes[excludeIndex] === 1}
                                            onChange={() => updateActiveTab(excludeIndex, 1)}
                                        />
                                        <div className="tab-content bg-base-100 border-base-300 p-6">
                                            <div className="mb-4">
                                                <label className="block text-gray-700 font-semibold mb-2">Text:</label>
                                                <TipTapEditor
                                                    content={exclude.text_en}
                                                    onChange={(content) => updateExclude(excludeIndex, 'text_en', content)}
                                                />
                                            </div>
                                        </div>

                                        {/* Russian Tab */}
                                        <input
                                            type="radio"
                                            name={`my_tabs_${excludeIndex}`}
                                            className="tab"
                                            aria-label="Russian"
                                            checked={activeTabIndexes[excludeIndex] === 2}
                                            onChange={() => updateActiveTab(excludeIndex, 2)}
                                        />
                                        <div className="tab-content bg-base-100 border-base-300 p-6">
                                            <div className="mb-4">
                                                <label className="block text-gray-700 font-semibold mb-2">Text:</label>
                                                <TipTapEditor
                                                    content={exclude.text_ru}
                                                    onChange={(content) => updateExclude(excludeIndex, 'text_ru', content)}
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
                                Add {excludes.length > 1 ? 'All Excludes' : 'Exclude'}
                            </button>
                            <button
                                type="button"
                                onClick={addNewExclude}
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

export default AddExcludes;