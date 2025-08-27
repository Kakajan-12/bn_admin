'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import TipTapEditor from "@/Components/TipTapEditor";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import { DocumentIcon } from "@heroicons/react/16/solid";
import Image from "next/image";

const EditSlider = () => {
    const { id } = useParams();
    const router = useRouter();

    const [slider, setSlider] = useState({ title_tk: '', text_tk: '', title_en: '', text_en: '', title_ru: '', text_ru: '', image: '', tour_id: '' });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [tours, setTours] = useState<{ id: number, title_tk: string, title_en: string, title_ru: string }[]>([]);

    useEffect(() => {
        const fetchTours = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tours`);
                const data = await res.json();
                setTours(data);
            } catch (err) {
                console.error('Ошибка при загрузке категорий:', err);
            }
        };

        fetchTours();
    }, []);

    useEffect(() => {
        const fetchSlider = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/sliders/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setSlider(response.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Error loading slider');
                setLoading(false);
            }
        };

        if (id) fetchSlider();
    }, [id]);

    const handleEditorChange = (name: keyof typeof slider, content: string) => {
        setSlider((prev) => ({ ...prev, [name]: content }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('auth_token');
            if (!token) throw new Error("Токен не найден");

            const formData = new FormData();
            formData.append('title_tk', String(slider.title_tk));
            formData.append('title_en', String(slider.title_en));
            formData.append('title_ru', String(slider.title_ru));
            formData.append('text_tk', String(slider.text_tk));
            formData.append('text_en', String(slider.text_en));
            formData.append('text_ru', String(slider.text_ru));
            formData.append('tour_id', slider.tour_id ? String(slider.tour_id) : '');

            if (imageFile) {

                formData.append('image', imageFile);
            } else {

                formData.append('image', slider.image);
            }

            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/sliders/${id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            router.push(`/admin/sliders/view-slider/${id}`);
        } catch (err) {
            console.error(err);
            setError('Error saving slider');
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8">
                    <h1 className="text-2xl font-bold mb-4">Edit Slider</h1>
                    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
                        {slider.image && (
                            <div className="mb-4">
                                <label className="block font-semibold mb-2">Current Image:</label>
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_API_URL}/${slider.image.replace('\\', '/')}`}
                                    alt="Slider"
                                    width={200}
                                    height={200}
                                    className="w-64 rounded"
                                />
                            </div>
                        )}

                        <div className="flex space-x-4">
                            <div className="w-full">
                                <label htmlFor="image" className="block font-semibold mb-2">New Image:</label>
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
                            <div className="w-full">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Select Tour:
                                </label>
                                <select
                                    id="tour"
                                    name="tour_id"
                                    value={String(slider.tour_id)}
                                    onChange={(e) => setSlider((prev) => ({...prev, tour_id: e.target.value}))}
                                    required
                                    className="border border-gray-300 rounded p-2 w-full"
                                >
                                    <option value="">Select tour</option>
                                    {tours.map((tour) => (
                                        <option key={tour.id} value={tour.id}>
                                            {tour.title_en} / {tour.title_tk} / {tour.title_ru}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>


                        <div className="tabs tabs-lift">
                            <input type="radio" name="my_tabs_3" className="tab" aria-label="Turkmen" defaultChecked/>
                            <div className="tab-content bg-base-100 border-base-300 p-6">
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Title</label>
                                    <TipTapEditor
                                        content={slider.title_tk}
                                        onChange={(content) => handleEditorChange('title_tk', content)}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Text:</label>
                                    <TipTapEditor
                                        content={slider.text_tk}
                                        onChange={(content) => handleEditorChange('text_tk', content)}
                                    />
                                </div>
                            </div>

                            <input type="radio" name="my_tabs_3" className="tab" aria-label="English"/>
                            <div className="tab-content bg-base-100 border-base-300 p-6">
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Title:</label>
                                    <TipTapEditor
                                        content={slider.title_en}
                                        onChange={(content) => handleEditorChange('title_en', content)}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Text:</label>
                                    <TipTapEditor
                                        content={slider.text_en}
                                        onChange={(content) => handleEditorChange('text_en', content)}
                                    />
                                </div>
                            </div>

                            <input type="radio" name="my_tabs_3" className="tab" aria-label="Russian"/>
                            <div className="tab-content bg-base-100 border-base-300 p-6">
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Title:</label>
                                    <TipTapEditor
                                        content={slider.title_ru}
                                        onChange={(content) => handleEditorChange('title_ru', content)}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Text:</label>
                                    <TipTapEditor
                                        content={slider.text_ru}
                                        onChange={(content) => handleEditorChange('text_ru', content)}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="bg text-white px-4 py-2 rounded flex items-center hover:bg-blue-700"
                        >
                            <DocumentIcon className="w-5 h-5 mr-2"/>
                            Save
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditSlider;
