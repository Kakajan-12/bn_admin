'use client';

import {useEffect, useState} from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/Components/Sidebar';
import TokenTimer from '@/Components/TokenTimer';
import TipTapEditor from "@/Components/TipTapEditor";

const ContactLocation = () => {
    const [isClient, setIsClient] = useState(false);
    const [location_tk, setLocationTk] = useState('');
    const [location_en, setLocationEn] = useState('');
    const [location_ru, setLocationRu] = useState('');
    const router = useRouter();

    useEffect(() => {
        setIsClient(true);
    }, []);

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
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact-location`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const data = await response.json();
                console.log(' добавлены!', data);
                setLocationTk('');
                setLocationEn('');
                setLocationRu('');
                router.push('/admin/locations');
            } else {
                const errorText = await response.text();
                console.error('Ошибка при добавлении проекта:', errorText);
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
                        <h2 className="text-2xl font-bold mb-4">Add contact locations</h2>

                        {isClient && (
                            <>
                                <div className="tabs tabs-lift">
                                    <input type="radio" name="my_tabs_3" className="tab" aria-label="Turkmen"
                                           defaultChecked/>
                                    <div className="tab-content bg-base-100 border-base-300 p-6">
                                        <div className="mb-4">
                                            <label className="block text-gray-700 font-semibold mb-2">Location Address:</label>
                                            <TipTapEditor
                                                content={location_tk}
                                                onChange={(content) => setLocationTk(content)}
                                            />
                                        </div>
                                    </div>

                                    <input type="radio" name="my_tabs_3" className="tab" aria-label="English"/>
                                    <div className="tab-content bg-base-100 border-base-300 p-6">
                                        <div className="mb-4">
                                            <label className="block text-gray-700 font-semibold mb-2">Location Address:</label>
                                            <TipTapEditor
                                                content={location_en}
                                                onChange={(content) => setLocationEn(content)}
                                            />
                                        </div>
                                    </div>

                                    <input type="radio" name="my_tabs_3" className="tab" aria-label="Russian" />
                                    <div className="tab-content bg-base-100 border-base-300 p-6">
                                        <div className="mb-4">
                                            <label className="block text-gray-700 font-semibold mb-2">Location Address:</label>
                                            <TipTapEditor
                                                content={location_ru}
                                                onChange={(content) => setLocationRu(content)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

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

export default ContactLocation;
