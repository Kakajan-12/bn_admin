'use client';
import React, {FormEvent, useEffect, useState} from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import { DocumentIcon } from "@heroicons/react/16/solid";

const EditMail = () => {
    const { id } = useParams();
    const router = useRouter();

    const [data, setData] = useState({ mail: '', location_id: '',});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [locations, setLocations] = useState<{ id: number, location_tk: string, location_en: string, location_ru: string }[]>([]);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact-location`);
                const data = await res.json();
                setLocations(data);
            } catch (err) {
                console.error('Ошибка при загрузке категорий:', err);
            }
        };

        fetchLocations();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/contact-mails/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setData(response.data[0]);
                setLoading(false);
            } catch (err) {
                console.error('Ошибка при загрузке данных:', err);
                setError('Ошибка при загрузке');
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('auth_token');
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/contact-mails/${id}`, {
                mail: data.mail,
                location_id: data.location_id,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            router.push('/admin/mails');
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
                    <h1 className="text-2xl font-bold mb-4">Edit mail</h1>
                    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
                        <div className="w-full">
                            <label className="block text-gray-700 font-semibold mb-2">
                                Select Location:
                            </label>
                            <select
                                id="location"
                                name="location_id"
                                value={String(data.location_id)}
                                onChange={(e) => setData((prev) => ({...prev, location_id: e.target.value}))}
                                required
                                className="border border-gray-300 rounded p-2 w-full"
                            >
                                <option value="">Select tour</option>
                                {locations.map((location) => (
                                    <option key={location.id} value={location.id}>
                                        {location.location_en} / {location.location_tk} / {location.location_ru}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">Mail:</label>
                            <input
                                name="mail"
                                value={data.mail}
                                onChange={handleChange}
                                type="text"
                                required
                                className="border border-gray-300 rounded p-2 w-full"
                            />
                        </div>

                        <button
                            type="submit"
                            className="bg text-white px-4 py-2 rounded flex items-center hover:bg-blue-700"
                        >
                            <DocumentIcon className="size-5 mr-2"/>
                            Save
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditMail;
