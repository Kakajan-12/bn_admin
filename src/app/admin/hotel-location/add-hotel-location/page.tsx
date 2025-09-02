'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/Components/Sidebar';
import TokenTimer from '@/Components/TokenTimer';

const AddHotelLocation = () => {
    const [location_tk, setLocationTk] = useState('');
    const [location_en, setLocationEn] = useState('');
    const [location_ru, setLocationRu] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.error('Нет токена. Пользователь не авторизован.');
            return;
        }

        const payload = {
            location_tk,
            location_en,
            location_ru,
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hotel-location`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Категория добавлена!', data);
                setLocationTk('');
                setLocationEn('');
                setLocationRu('');
                router.push('/admin/hotel-location');
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
                        <h2 className="text-2xl font-bold mb-4">Add hotel location</h2>

                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">Turkmen:</label>
                            <input
                                value={location_tk}
                                onChange={(e) => setLocationTk(e.target.value)}
                                type="text"
                                required
                                className="border border-gray-300 rounded p-2 w-full"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">English:</label>
                            <input
                                value={location_en}
                                onChange={(e) => setLocationEn(e.target.value)}
                                type="text"
                                required
                                className="border border-gray-300 rounded p-2 w-full"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">Russian:</label>
                            <input
                                value={location_ru}
                                onChange={(e) => setLocationRu(e.target.value)}
                                type="text"
                                required
                                className="border border-gray-300 rounded p-2 w-full"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Add location
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddHotelLocation;
