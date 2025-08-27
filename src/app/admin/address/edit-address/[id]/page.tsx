'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import TipTapEditor from '@/Components/TipTapEditor';
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import { DocumentIcon } from "@heroicons/react/16/solid";

const EditAddress = () => {
    const { id } = useParams();
    const router = useRouter();

    const [data, setData] = useState({ address_tk: '', address_en:'', address_ru:'', iframe: '', location_id:''});
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
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/contact-address/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data && response.data.length > 0) {
                    const rawData = response.data[0]; // <-- берём первый элемент массива
                    setData({ ...rawData });
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

    const handleEditorChange = (name: keyof typeof data, content: string) => {
        setData((prev) => ({ ...prev, [name]: content }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('auth_token');

            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/contact-address/${id}`,
                {
                    address_tk: data.address_tk,
                    address_en: data.address_en,
                    address_ru: data.address_ru,
                    iframe: data.iframe,
                    location_id: data.location_id,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );


            router.push(`/admin/address/view-address/${id}`);
        } catch (err) {
            console.error(err);
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
                    <h1 className="text-2xl font-bold mb-4">Edit Address</h1>
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
                        <div className="mb-4 w-full">
                            <label
                                className="block text-gray-700 font-semibold mb-2">Map:</label>
                            <textarea value={data.iframe}
                                      onChange={(e) => setData((prev) => ({...prev, iframe: e.target.value}))}
                                      rows={10}
                                      required
                                      className="border border-gray-300 rounded p-2 w-full">

                            </textarea>
                        </div>

                        <div className="tabs tabs-lift">
                            <input type="radio" name="my_tabs_3" className="tab" aria-label="Turkmen" defaultChecked/>
                            <div className="tab-content bg-base-100 border-base-300 p-6">
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Address</label>
                                    <TipTapEditor
                                        content={data.address_tk}
                                        onChange={(content) => handleEditorChange('address_tk', content)}
                                    />
                                </div>
                            </div>

                            <input type="radio" name="my_tabs_3" className="tab" aria-label="English"/>
                            <div className="tab-content bg-base-100 border-base-300 p-6">
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Address:</label>
                                    <TipTapEditor
                                        content={data.address_en}
                                        onChange={(content) => handleEditorChange('address_en', content)}
                                    />
                                </div>
                            </div>

                            <input type="radio" name="my_tabs_3" className="tab" aria-label="Russian"/>
                            <div className="tab-content bg-base-100 border-base-300 p-6">
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Address:</label>
                                    <TipTapEditor
                                        content={data.address_ru}
                                        onChange={(content) => handleEditorChange('address_ru', content)}
                                    />
                                </div>
                            </div>
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

export default EditAddress;
