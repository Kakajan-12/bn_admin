'use client';
import React, {useEffect, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import axios from 'axios';
import TipTapEditor from '@/Components/TipTapEditor';
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import {DocumentIcon} from "@heroicons/react/16/solid";
import Image from "next/image";

const EditHotel = () => {
    const {id} = useParams();
    const router = useRouter();

    type HotelData = {
        title_tk: string;
        title_en: string;
        title_ru: string;
        text_tk: string;
        text_en: string;
        text_ru: string;
        image: string;
        rating: number;
        location_id: number;
    };

    const [data, setData] = useState<HotelData>({
        title_tk: '',
        title_en: '',
        title_ru: '',
        text_tk: '',
        text_en: '',
        text_ru: '',
        image: '',
        rating: 0,
        location_id: 0,
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [location, setLocation] = useState<{ id: number, location_tk: string, location_en: string, location_ru: string }[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hotel-location`);
                const data = await res.json();
                setLocation(data);
            } catch (err) {
                console.error('Ошибка при загрузке категорий:', err);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/hotels/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data && response.data.id) {
                    const rawData = response.data;

                    const formattedDate = rawData.date
                        ? new Date(rawData.date).toISOString().split('T')[0]
                        : '';

                    setData({
                        ...rawData,
                        popular: Number(rawData.popular),
                        date: formattedDate,
                    });

                    setLoading(false);
                } else {
                    throw new Error("Данные не найдены для этой новости");
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
        setData((prev) => ({...prev, [name]: content}));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('auth_token');

            const formData = new FormData();
            formData.append('title_tk', data.title_tk);
            formData.append('title_en', data.title_en);
            formData.append('title_ru', data.title_ru);
            formData.append('text_tk', data.text_tk);
            formData.append('text_en', data.text_en);
            formData.append('text_ru', data.text_ru);
            formData.append('rating', String(data.rating));
            formData.append('location_id', String(data.location_id));


            if (imageFile) {
                formData.append('image', imageFile);
            } else {
                formData.append('image', data.image);
            }

            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/hotels/${id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            router.push(`/admin/hotels/view-hotel/${id}`);
        } catch (err) {
            console.error(err);
            setError('Ошибка при сохранении');
        }
    };

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar/>
            <div className="flex-1 p-10 ml-62">
                <TokenTimer/>
                <div className="mt-8">
                    <h1 className="text-2xl font-bold mb-4">Edit Tour</h1>
                    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
                        {data.image && (
                            <div className="mb-4">
                                <label className="block font-semibold mb-2">Current image:</label>
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_API_URL}/${data.image.replace('\\', '/')}`}
                                    alt="hotel"
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
                                            }
                                        }}
                                        className="border border-gray-300 rounded p-2 w-full"
                                    />
                                </div>
                            </div>

                            <div className="w-full">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Select Location:
                                </label>
                                <select
                                    id="location_id"
                                    name="location_id"
                                    value={data.location_id} // число
                                    onChange={(e) =>
                                        setData((prev) => ({
                                            ...prev,
                                            location_id: Number(e.target.value), // приводим к числу
                                        }))
                                    }
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
                                <label className="block text-gray-700 font-semibold mb-2">Rating:</label>
                                <input
                                    name="rating"
                                    value={data.rating}
                                    onChange={(e) =>
                                        setData((prev) => ({
                                            ...prev,
                                            rating: Number(e.target.value),
                                        }))
                                    }
                                    type="number"
                                    required
                                    className="border border-gray-300 rounded p-2 w-full"
                                />
                            </div>
                        </div>

                        <div className="tabs tabs-lift">
                            <input type="radio" name="my_tabs_3" className="tab" aria-label="Turkmen" defaultChecked/>
                            <div className="tab-content bg-base-100 border-base-300 p-6">
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Title</label>
                                    <TipTapEditor
                                        content={data.title_tk}
                                        onChange={(content) => handleEditorChange('title_tk', content)}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Text:</label>
                                    <TipTapEditor
                                        content={data.text_tk}
                                        onChange={(content) => handleEditorChange('text_tk', content)}
                                    />
                                </div>
                            </div>

                            <input type="radio" name="my_tabs_3" className="tab" aria-label="English"/>
                            <div className="tab-content bg-base-100 border-base-300 p-6">
                                <div className="mb-4">
                                <label className="block font-semibold mb-2">Title:</label>
                                    <TipTapEditor
                                        content={data.title_en}
                                        onChange={(content) => handleEditorChange('title_en', content)}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Text:</label>
                                    <TipTapEditor
                                        content={data.text_en}
                                        onChange={(content) => handleEditorChange('text_en', content)}
                                    />
                                </div>
                            </div>

                            <input type="radio" name="my_tabs_3" className="tab" aria-label="Russian"/>
                            <div className="tab-content bg-base-100 border-base-300 p-6">
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Title:</label>
                                    <TipTapEditor
                                        content={data.title_ru}
                                        onChange={(content) => handleEditorChange('title_ru', content)}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Text:</label>
                                    <TipTapEditor
                                        content={data.text_ru}
                                        onChange={(content) => handleEditorChange('text_ru', content)}
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

export default EditHotel;
