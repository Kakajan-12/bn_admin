'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/Components/Sidebar';
import TokenTimer from '@/Components/TokenTimer';
import TipTapEditor from '@/Components/TipTapEditor';

interface ItineraryItem {
    title_tk: string;
    title_en: string;
    title_ru: string;
    text_tk: string;
    text_en: string;
    text_ru: string;
    tour_id: string;
}

const AddItinerary = () => {
    const [isClient, setIsClient] = useState(false);
    const [itineraries, setItineraries] = useState<ItineraryItem[]>([
        {
            title_tk: '',
            title_en: '',
            title_ru: '',
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

    const addNewItinerary = () => {
        setItineraries(prev => [...prev, {
            title_tk: '',
            title_en: '',
            title_ru: '',
            text_tk: '',
            text_en: '',
            text_ru: '',
            tour_id: '',
        }]);
        setActiveTabIndexes(prev => [...prev, 0]);
    };

    const removeItinerary = (index: number) => {
        if (itineraries.length > 1) {
            setItineraries(prev => prev.filter((_, i) => i !== index));
            setActiveTabIndexes(prev => prev.filter((_, i) => i !== index));
        }
    };

    const updateItinerary = (index: number, field: keyof ItineraryItem, value: string) => {
        setItineraries(prev => prev.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        ));
    };

    const updateActiveTab = (itineraryIndex: number, tabIndex: number) => {
        setActiveTabIndexes(prev => prev.map((tab, i) =>
            i === itineraryIndex ? tabIndex : tab
        ));
    };

    const handleSubmitOneByOne = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.error('Нет токена. Пользователь не авторизован.');
            return;
        }

        const nonEmptyItineraries = itineraries.filter(item =>
            item.title_tk.trim() ||
            item.title_en.trim() ||
            item.title_ru.trim() ||
            item.text_tk.trim() ||
            item.text_en.trim() ||
            item.text_ru.trim() ||
            item.tour_id
        );

        if (nonEmptyItineraries.length === 0) {
            alert('Пожалуйста, заполните хотя бы один маршрут');
            return;
        }

        try {
            for (const itinerary of nonEmptyItineraries) {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/itinerary`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(itinerary),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Ошибка при добавлении: ${errorText}`);
                }
            }

            console.log('Все маршруты успешно добавлены!');
            setItineraries([{
                title_tk: '',
                title_en: '',
                title_ru: '',
                text_tk: '',
                text_en: '',
                text_ru: '',
                tour_id: '',
            }]);
            setActiveTabIndexes([0]);
            router.push('/admin/itinerary');
        } catch (error) {
            console.error('Ошибка при добавлении маршрутов:', error);
        }
    };

    return (
        <div className="flex bg-gray-200">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8">
                    <form
                        onSubmit={handleSubmitOneByOne}
                        className="w-full mx-auto p-6 border border-gray-300 rounded-lg shadow-lg bg-white"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-left">Add new itinerary</h2>
                            <button
                                type="button"
                                onClick={addNewItinerary}
                                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-150"
                            >
                                + Add Another Itinerary
                            </button>
                        </div>

                        {itineraries.map((itinerary, itineraryIndex) => (
                            <div key={itineraryIndex} className="mb-8 p-4 border rounded-lg bg-gray-50">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">Itinerary #{itineraryIndex + 1}</h3>
                                    {itineraries.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeItinerary(itineraryIndex)}
                                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-sm"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Tour:
                                    </label>
                                    <select
                                        value={itinerary.tour_id}
                                        onChange={(e) => updateItinerary(itineraryIndex, 'tour_id', e.target.value)}
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
                                            name={`my_tabs_${itineraryIndex}`}
                                            className="tab"
                                            aria-label="Turkmen"
                                            checked={activeTabIndexes[itineraryIndex] === 0}
                                            onChange={() => updateActiveTab(itineraryIndex, 0)}
                                        />
                                        <div className="tab-content bg-base-100 border-base-300 p-6">
                                            <div className="mb-4">
                                                <label className="block text-gray-700 font-semibold mb-2">Title:</label>
                                                <TipTapEditor
                                                    content={itinerary.title_tk}
                                                    onChange={(content) => updateItinerary(itineraryIndex, 'title_tk', content)}
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-gray-700 font-semibold mb-2">Text:</label>
                                                <TipTapEditor
                                                    content={itinerary.text_tk}
                                                    onChange={(content) => updateItinerary(itineraryIndex, 'text_tk', content)}
                                                />
                                            </div>
                                        </div>

                                        <input
                                            type="radio"
                                            name={`my_tabs_${itineraryIndex}`}
                                            className="tab"
                                            aria-label="English"
                                            checked={activeTabIndexes[itineraryIndex] === 1}
                                            onChange={() => updateActiveTab(itineraryIndex, 1)}
                                        />
                                        <div className="tab-content bg-base-100 border-base-300 p-6">
                                            <div className="mb-4">
                                                <label className="block text-gray-700 font-semibold mb-2">Title:</label>
                                                <TipTapEditor
                                                    content={itinerary.title_en}
                                                    onChange={(content) => updateItinerary(itineraryIndex, 'title_en', content)}
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-gray-700 font-semibold mb-2">Text:</label>
                                                <TipTapEditor
                                                    content={itinerary.text_en}
                                                    onChange={(content) => updateItinerary(itineraryIndex, 'text_en', content)}
                                                />
                                            </div>
                                        </div>

                                        <input
                                            type="radio"
                                            name={`my_tabs_${itineraryIndex}`}
                                            className="tab"
                                            aria-label="Russian"
                                            checked={activeTabIndexes[itineraryIndex] === 2}
                                            onChange={() => updateActiveTab(itineraryIndex, 2)}
                                        />
                                        <div className="tab-content bg-base-100 border-base-300 p-6">
                                            <div className="mb-4">
                                                <label className="block text-gray-700 font-semibold mb-2">Title:</label>
                                                <TipTapEditor
                                                    content={itinerary.title_ru}
                                                    onChange={(content) => updateItinerary(itineraryIndex, 'title_ru', content)}
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-gray-700 font-semibold mb-2">Text:</label>
                                                <TipTapEditor
                                                    content={itinerary.text_ru}
                                                    onChange={(content) => updateItinerary(itineraryIndex, 'text_ru', content)}
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
                                Add {itineraries.length > 1 ? 'All Itineraries' : 'Itinerary'}
                            </button>
                            <button
                                type="button"
                                onClick={addNewItinerary}
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

export default AddItinerary;