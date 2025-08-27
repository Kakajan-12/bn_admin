'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import Sidebar from '@/Components/Sidebar';
import TokenTimer from '@/Components/TokenTimer';

const AddMail = () => {
    const [mail, setMail] = useState('');
    const router = useRouter();
    const [location_id, setLocationId] = useState('');
    const [locations, setLocations] = useState<{ id: number, location_tk: string, location_en: string, location_ru: string }[]>([]);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact-location`);
                const data = await res.json();
                setLocations(data);
            } catch (err) {
                console.error('Ошибка при загрузке:', err);
            }
        };

        fetchLocations();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.error('No token. User is not authenticated.');
            return;
        }

        const locId = Number(location_id);
        if (!locId) {
            console.error('Location is required.');
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact-mails`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ mail,
                    location_id: locId}),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('добавлен!', data);
                setMail('');
                setLocationId('');
                router.push('/admin/mails');
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
                        <h2 className="text-2xl font-bold mb-4 text-left">Add new mail</h2>

                        <div className="w-full">
                            <label className="block text-gray-700 font-semibold mb-2">
                                Location:
                            </label>
                            <select
                                id="location_id"
                                name="location_id"
                                value={location_id}
                                onChange={(e) => setLocationId(e.target.value)}
                                required
                                className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                            >
                                <option value="">Select location</option>
                                {locations.map((location) => (
                                    <option key={location.id} value={location.id}>
                                        {location.location_en} / {location.location_tk} / {location.location_ru}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">Mail address:</label>
                            <input
                                value={mail}
                                onChange={(e) => setMail(e.target.value)}
                                type="text"
                                required
                                className="border border-gray-300 rounded p-2 w-full"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150"
                        >
                            Add mail
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddMail;
