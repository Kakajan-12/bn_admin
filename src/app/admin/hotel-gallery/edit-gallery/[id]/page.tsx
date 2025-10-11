'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import { DocumentIcon } from "@heroicons/react/16/solid";
import Image from "next/image";

const EditGallery = () => {
    const { id } = useParams();
    const router = useRouter();

    const [data, setData] = useState({ image: '', hotel_id: ''});
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [hotels, setHotels] = useState<{ id: number, title_tk: string, title_en: string, title_ru: string }[]>([]);
    const [previewURL, setPreviewURL] = useState<string | null>(null);

    useEffect(() => {
        const fetchTours = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hotels`);
                if (!res.ok) throw new Error('Ошибка при загрузке');
                const data = await res.json();
                setHotels(data);
            } catch (err) {
                console.error('Ошибка при загрузке:', err);
                setError('Ошибка при загрузке');
            }
        };

        fetchTours();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/hotel-gallery/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data && response.data.id) {
                    const rawData = response.data;
                    setData({
                        ...rawData
                    });

                    setLoading(false);
                } else {
                    throw new Error('Данные не найдены');
                }
            } catch (err) {
                console.error('Ошибка при загрузке данных:', err);
                setError('Ошибка при загрузке');
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) throw new Error("Токен не найден");

            const formData = new FormData();
            formData.append('hotel_id', String(data.hotel_id));

            if (imageFile) {
                formData.append('image', imageFile);
            }

            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/hotel-gallery/${id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            router.push(`/admin/hotel-gallery/view-gallery/${id}`);
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
                    <h1 className="text-2xl font-bold mb-4">Edit Hotel Gallery</h1>
                    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
                        {data.image && (
                            <div className="mb-4">
                                <label className="block font-semibold mb-2">Current image:</label>
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_API_URL}/${data.image.replace(/\\/g, '/')}`}
                                    alt="Gallery Image"
                                    width={200}
                                    height={200}
                                    className="w-64 rounded"
                                />
                            </div>
                        )}
                        <div className="mb-4 flex space-x-4">
                            <div className="w-full">
                                <div className="mb-4">
                                    <label htmlFor="image" className="block font-semibold mb-2">New image:</label>
                                    <input
                                        type="file"
                                        id="image"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setImageFile(e.target.files[0]);
                                                setPreviewURL(URL.createObjectURL(e.target.files[0]));
                                            }
                                        }}
                                        className="border border-gray-300 rounded p-2 w-full"
                                    />
                                </div>
                            </div>
                            <div className="w-full">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Hotel:
                                </label>
                                <select
                                    id="hotel_id"
                                    name="hotel_id"
                                    value={String(data.hotel_id)}
                                    onChange={(e) => setData((prev) => ({ ...prev, hotel_id: e.target.value }))}
                                    required
                                    className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                                >
                                    <option value="">Select tour</option>
                                    {hotels.map((hotel) => (
                                        <option key={hotel.id} value={String(hotel.id)}>
                                            {hotel.title_en} / {hotel.title_tk} / {hotel.title_ru}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {previewURL && (
                            <div className="mb-4">
                                <label className="block font-semibold mb-2">Preview of New Image:</label>
                                <Image
                                    src={previewURL}
                                    alt="Preview"
                                    width={200}
                                    height={200}
                                    className="w-64 rounded"
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            className="bg text-white px-4 py-2 rounded flex items-center hover:bg-blue-700"
                        >
                            <DocumentIcon className="size-5 mr-2" />
                            Save
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditGallery;
