'use client';

import React, {useState, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import Sidebar from '@/Components/Sidebar';
import TokenTimer from '@/Components/TokenTimer';
import TipTapEditor from '@/Components/TipTapEditor';

const AddHotel = () => {
    const [isClient, setIsClient] = useState(false);
    const [image, setImage] = useState<File | null>(null);
    const [title_tk, setTitleTk] = useState('');
    const [title_en, setTitleEn] = useState('');
    const [title_ru, setTitleRu] = useState('');
    const [text_tk, setTextTk] = useState('');
    const [text_en, setTextEn] = useState('');
    const [text_ru, setTextRu] = useState('');
    const [rating, setRating] = useState('');
    const [location_id, setLocationTour] = useState('');
    const [location, setLocation] = useState<
        { id: number; location_tk: string; location_en: string; location_ru: string }[]
    >([]);

    const router = useRouter();

    useEffect(() => {
        setIsClient(true)
        const fetchData = async () => {
            try {
                const [locationRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hotel-location`)
                ]);
                const [locationData] = await Promise.all([
                    locationRes.json()
                ]);
                setLocation(locationData)
            } catch (err) {
                console.error('Ошибка при загрузке данных:', err);
            }
        };

        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.error('Нет токена. Пользователь не авторизован.');
            return;
        }

        const formData = new FormData();
        if (image) formData.append('image', image);
        formData.append('title_tk', title_tk ?? '');
        formData.append('title_en', title_en ?? '');
        formData.append('title_ru', title_ru ?? '');
        formData.append('text_tk', text_tk ?? '');
        formData.append('text_en', text_en ?? '');
        formData.append('text_ru', text_ru ?? '');
        formData.append('rating', rating ?? '');
        formData.append('location_id', location_id ?? '');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hotels`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                console.log('добавлен!', data);
                setImage(null);
                setTitleTk('');
                setTitleEn('');
                setTitleRu('');
                setTextTk('');
                setTextEn('');
                setTextRu('');
                setRating('')
                setLocationTour('');
                router.push('/admin/hotels');
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
            <Sidebar/>
            <div className="flex-1 p-10 ml-62">
                <TokenTimer/>
                <div className="mt-8">
                    <form
                        onSubmit={handleSubmit}
                        className="w-full mx-auto p-6 border border-gray-300 rounded-lg shadow-lg bg-white"
                    >
                        <h2 className="text-2xl font-bold mb-4 text-left">Add new hotel</h2>

                        <div className="mb-4 flex space-x-4">
                            <div className="w-full">
                                <label htmlFor="image" className="block text-gray-700 font-semibold mb-2">
                                    Image:
                                </label>
                                <input
                                    type="file"
                                    id="image"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setImage(e.target.files[0]);
                                        }
                                    }}
                                    required
                                    className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                                />
                            </div>
                            <div className="w-full">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Select Location:
                                </label>
                                <select
                                    id="location_id"
                                    name="location_id"
                                    value={location_id}
                                    onChange={(e) => setLocationTour(e.target.value)}
                                    required
                                    className="border border-gray-300 rounded p-2 w-full"
                                >
                                    <option value="">Select location</option>
                                    {location.map((location) => (
                                        <option key={location.id} value={location.id}>
                                            {location.location_en} / {location.location_tk} / {location.location_ru}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4 w-full">
                                <label
                                    className="block text-gray-700 font-semibold mb-2">Rating:</label>
                                <input
                                    value={rating}
                                    onChange={(e) => setRating(e.target.value)}
                                    type="text"
                                    required
                                    className="border border-gray-300 rounded p-2 w-full"
                                />
                            </div>
                        </div>

                        {isClient && (
                            <>
                                <div className="tabs tabs-lift">
                                    <input type="radio" name="my_tabs_3" className="tab" aria-label="Turkmen"
                                           defaultChecked/>
                                    <div className="tab-content bg-base-100 border-base-300 p-6">
                                        <div className="mb-4">
                                            <label className="block text-gray-700 font-semibold mb-2">Title:</label>
                                            <TipTapEditor
                                                content={title_tk}
                                                onChange={(content) => setTitleTk(content)}
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-gray-700 font-semibold mb-2">Text:</label>
                                            <TipTapEditor
                                                content={text_tk}
                                                onChange={(content) => setTextTk(content)}
                                            />
                                        </div>
                                    </div>

                                    <input type="radio" name="my_tabs_3" className="tab" aria-label="English"/>
                                    <div className="tab-content bg-base-100 border-base-300 p-6">
                                        <div className="mb-4">
                                            <label className="block text-gray-700 font-semibold mb-2">Title:</label>
                                            <TipTapEditor
                                                content={title_en}
                                                onChange={(content) => setTitleEn(content)}
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-gray-700 font-semibold mb-2">Text:</label>
                                            <TipTapEditor
                                                content={text_en}
                                                onChange={(content) => setTextEn(content)}
                                            />
                                        </div>
                                    </div>

                                    <input type="radio" name="my_tabs_3" className="tab" aria-label="Russian"/>
                                    <div className="tab-content bg-base-100 border-base-300 p-6">
                                        <div className="mb-4">
                                            <label className="block text-gray-700 font-semibold mb-2">Title:</label>
                                            <TipTapEditor
                                                content={title_ru}
                                                onChange={(content) => setTitleRu(content)}
                                            />
                                        </div>
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
                            Add hotel
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddHotel;
