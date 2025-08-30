'use client';

import React, {useState, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import Sidebar from '@/Components/Sidebar';
import TokenTimer from '@/Components/TokenTimer';
import TipTapEditor from '@/Components/TipTapEditor';

const AddTour = () => {
    const [isClient, setIsClient] = useState(false);
    const [image, setImage] = useState<File | null>(null);
    const [popular, setPopular] = useState(false);
    const [title_tk, setTitleTk] = useState('');
    const [title_en, setTitleEn] = useState('');
    const [title_ru, setTitleRu] = useState('');
    const [text_tk, setTextTk] = useState('');
    const [text_en, setTextEn] = useState('');
    const [text_ru, setTextRu] = useState('');
    const [destination_tk, setDestinationTk] = useState('');
    const [destination_en, setDestinationEn] = useState('');
    const [destination_ru, setDestinationRu] = useState('');
    const [duration_tk, setDurationTk] = useState('');
    const [duration_en, setDurationEn] = useState('');
    const [duration_ru, setDurationRu] = useState('');
    const [lang_tk, setLangTk] = useState('');
    const [lang_en, setLangEn] = useState('');
    const [lang_ru, setLangRu] = useState('');
    const [price, setPrice] = useState('');
    const [tour_type_id, setTourType] = useState('');
    const [tour_cat_id, setTourCat] = useState('');
    const [location_id, setLocationTour] = useState('');
    const [types, setTypes] = useState<
        { id: number; type_tk: string; type_en: string; type_ru: string }[]
    >([]);
    const [cat, setCat] = useState<
        { id: number; cat_tk: string; cat_en: string; cat_ru: string }[]
    >([]);
    const [location, setLocation] = useState<
        { id: number; location_tk: string; location_en: string; location_ru: string }[]
    >([]);

    const router = useRouter();

    useEffect(() => {
        setIsClient(true)
        const fetchData = async () => {
            try {
                const [typesRes, catRes, locationRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tour-types`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tour-category`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tour-location`)
                ]);
                const [typesData, catData, locationData] = await Promise.all([
                    typesRes.json(),
                    catRes.json(),
                    locationRes.json()
                ]);

                setTypes(typesData);
                setCat(catData);
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
        formData.append('popular', popular ? '1' : '0');
        formData.append('title_tk', title_tk ?? '');
        formData.append('title_en', title_en ?? '');
        formData.append('title_ru', title_ru ?? '');
        formData.append('text_tk', text_tk ?? '');
        formData.append('text_en', text_en ?? '');
        formData.append('text_ru', text_ru ?? '');
        formData.append('destination_tk', destination_tk ?? '');
        formData.append('destination_en', destination_en ?? '');
        formData.append('destination_ru', destination_ru ?? '');
        formData.append('duration_tk', duration_en ?? '');
        formData.append('duration_en', duration_en ?? '');
        formData.append('duration_ru', duration_ru ?? '');
        formData.append('lang_tk', lang_tk ?? '');
        formData.append('lang_en', lang_en ?? '');
        formData.append('lang_ru', lang_ru ?? '');
        formData.append('price', price ?? '');
        formData.append('tour_type_id', tour_type_id ?? '');
        formData.append('tour_cat_id', tour_cat_id ?? '');
        formData.append('location_id', location_id ?? '');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tours`, {
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
                setPopular(Boolean)
                setTitleTk('');
                setTitleEn('');
                setTitleRu('');
                setTextTk('');
                setTextEn('');
                setTextRu('');
                setDestinationTk('');
                setDestinationEn('');
                setDestinationRu('');
                setDurationTk('');
                setDurationEn('');
                setDurationRu('');
                setLangTk('')
                setLangEn('');
                setLangRu('');
                setPrice('')
                setTourType('');
                setTourCat('');
                setLocationTour('');
                router.push('/admin/tours');
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
                        <h2 className="text-2xl font-bold mb-4 text-left">Add new tour</h2>

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
                                    Select Types:
                                </label>
                                <select
                                    id="tour_type"
                                    name="tour_type_id"
                                    value={tour_type_id}
                                    onChange={(e) => setTourType(e.target.value)}
                                    required
                                    className="border border-gray-300 rounded p-2 w-full"
                                >
                                    <option value="">Select type</option>
                                    {types.map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.type_en} / {type.type_tk} / {type.type_ru}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-full">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Select Category:
                                </label>
                                <select
                                    id="tour_cat"
                                    name="tour_cat_id"
                                    value={tour_cat_id}
                                    onChange={(e) => setTourCat(e.target.value)}
                                    required
                                    className="border border-gray-300 rounded p-2 w-full"
                                >
                                    <option value="">Select category</option>
                                    {cat.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.cat_en} / {cat.cat_tk} / {cat.cat_ru}
                                        </option>
                                    ))}
                                </select>
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
                                    className="block text-gray-700 font-semibold mb-2">Price:</label>
                                <input
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    type="text"
                                    required
                                    className="border border-gray-300 rounded p-2 w-full"
                                />
                            </div>
                            <div className="mb-4 w-full">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Popular:
                                </label>
                                <select
                                    id="popular"
                                    name="popular"
                                    value={popular ? '1' : '0'}
                                    onChange={(e) => setPopular(e.target.value === '1')}
                                    required
                                    className="border border-gray-300 rounded p-2 w-full"
                                >
                                    <option value="1">Yes</option>
                                    <option value="0">No</option>
                                </select>
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
                                        <div className="mb-4">
                                            <label
                                                className="block text-gray-700 font-semibold mb-2">Destinations:</label>
                                            <TipTapEditor
                                                content={destination_tk}
                                                onChange={(content) => setDestinationTk(content)}
                                            />
                                        </div>
                                        <div className="flex w-full space-x-4">
                                            <div className="mb-4 w-full">
                                                <label
                                                    className="block text-gray-700 font-semibold mb-2">Duration:</label>
                                                <input
                                                    content={duration_tk}
                                                    onChange={(e) => setDurationTk(e.target.value)}
                                                    type="text"
                                                    required
                                                    className="border border-gray-300 rounded p-2 w-full"
                                                />
                                            </div>
                                            <div className="mb-4 w-full">
                                                <label
                                                    className="block text-gray-700 font-semibold mb-2">Languages:</label>
                                                <input
                                                    value={lang_tk}
                                                    onChange={(e) => setLangTk(e.target.value)}
                                                    type="text"
                                                    required
                                                    className="border border-gray-300 rounded p-2 w-full"
                                                />
                                            </div>
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
                                        <div className="mb-4">
                                            <label
                                                className="block text-gray-700 font-semibold mb-2">Destinations:</label>
                                            <TipTapEditor
                                                content={destination_en}
                                                onChange={(content) => setDestinationEn(content)}
                                            />
                                        </div>
                                        <div className="flex w-full space-x-4">
                                            <div className="mb-4 w-full">
                                                <label
                                                    className="block text-gray-700 font-semibold mb-2">Duration:</label>
                                                <input
                                                    value={duration_en}
                                                    onChange={(e) => setDurationEn(e.target.value)}
                                                    type="text"
                                                    required
                                                    className="border border-gray-300 rounded p-2 w-full"
                                                />
                                            </div>
                                            <div className="mb-4 w-full">
                                                <label
                                                    className="block text-gray-700 font-semibold mb-2">Languages:</label>
                                                <input
                                                    value={lang_en}
                                                    onChange={(e) => setLangEn(e.target.value)}
                                                    type="text"
                                                    required
                                                    className="border border-gray-300 rounded p-2 w-full"
                                                />
                                            </div>
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
                                        <div className="mb-4">
                                            <label
                                                className="block text-gray-700 font-semibold mb-2">Destinations:</label>
                                            <TipTapEditor
                                                content={destination_ru}
                                                onChange={(content) => setDestinationRu(content)}
                                            />
                                        </div>
                                        <div className="flex w-full space-x-4">
                                            <div className="mb-4 w-full">
                                                <label
                                                    className="block text-gray-700 font-semibold mb-2">Duration:</label>
                                                <input
                                                    value={duration_ru}
                                                    onChange={(e) => setDurationRu(e.target.value)}
                                                    type="text"
                                                    required
                                                    className="border border-gray-300 rounded p-2 w-full"
                                                />
                                            </div>
                                            <div className="mb-4 w-full">
                                                <label
                                                    className="block text-gray-700 font-semibold mb-2">Languages:</label>
                                                <input
                                                    value={lang_ru}
                                                    onChange={(e) => setLangRu(e.target.value)}
                                                    type="text"
                                                    required
                                                    className="border border-gray-300 rounded p-2 w-full"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            className="w-full bg hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150"
                        >
                            Add tour
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddTour;
