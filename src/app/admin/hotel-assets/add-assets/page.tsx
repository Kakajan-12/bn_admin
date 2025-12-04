'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Sidebar from '@/Components/Sidebar';
import TokenTimer from '@/Components/TokenTimer';
import { FaBed, FaUtensils, FaDumbbell, FaWifi } from "react-icons/fa6";
import { MdOutlineFreeBreakfast, MdWaves } from "react-icons/md";
import { TbMassage } from "react-icons/tb";
import { LuSquareParking } from "react-icons/lu";
import { GiTennisCourt } from "react-icons/gi";

const iconOptions = [
    { value: "FaBed", label: "Bed", icon: FaBed },
    { value: "FaUtensils", label: "Restaurant", icon: FaUtensils },
    { value: "FaDumbbell", label: "Gym", icon: FaDumbbell },
    { value: "FaWifi", label: "WiFi", icon: FaWifi },
    { value: "MdWaves", label: "Pool", icon: MdWaves },
    { value: "TbMassage", label: "Spa / Massage", icon: TbMassage },
    { value: "LuSquareParking", label: "Parking", icon: LuSquareParking },
    { value: "MdOutlineFreeBreakfast", label: "Breakfast", icon: MdOutlineFreeBreakfast },
    { value: "GiTennisCourt", label: "Tennis", icon: GiTennisCourt },
];

interface Hotel {
    id: number;
    title_tk?: string;
    title_en?: string;
    title_ru?: string;
}

interface AssetItem {
    hotel_id: string;
    icon: string;
    text_tk: string;
    text_en: string;
    text_ru: string;
}

const AddAsset = () => {
    const [assets, setAssets] = useState<AssetItem[]>([
        {
            hotel_id: '',
            icon: 'FaBed',
            text_tk: '',
            text_en: '',
            text_ru: '',
        }
    ]);
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (!token) router.push('/');
        else fetchHotels(token);
    }, [router]);

    const fetchHotels = async (token: string) => {
        try {
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/hotels`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setHotels(res.data);
        } catch {
            console.error('Ошибка загрузки отелей');
            setError('Failed to load hotels');
        }
    };

    // Добавить новый пустой asset
    const addNewAsset = () => {
        setAssets(prev => [...prev, {
            hotel_id: '',
            icon: 'FaBed',
            text_tk: '',
            text_en: '',
            text_ru: '',
        }]);
    };

    // Удалить asset
    const removeAsset = (index: number) => {
        if (assets.length > 1) {
            setAssets(prev => prev.filter((_, i) => i !== index));
        }
    };

    // Обновить конкретное поле в определенном asset
    const updateAsset = (index: number, field: keyof AssetItem, value: string) => {
        setAssets(prev => prev.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        ));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                router.push('/');
                return;
            }

            // Фильтруем пустые assets (где нет хотя бы одного заполненного поля)
            const nonEmptyAssets = assets.filter(item =>
                item.hotel_id.trim() ||
                item.text_tk.trim() ||
                item.text_en.trim() ||
                item.text_ru.trim()
            );

            if (nonEmptyAssets.length === 0) {
                setError('Please fill at least one asset');
                setIsSubmitting(false);
                return;
            }

            // Проверяем, что для каждого asset выбран отель
            const hasEmptyHotel = nonEmptyAssets.some(item => !item.hotel_id.trim());
            if (hasEmptyHotel) {
                setError('Please select a hotel for all assets');
                setIsSubmitting(false);
                return;
            }

            // Отправляем все assets по одному (используем существующий endpoint)
            await handleSubmitOneByOne(nonEmptyAssets, token);

        } catch {
            setError('Error adding assets');
            setSuccess(null);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Отправка по одному (используем существующий endpoint)
    const handleSubmitOneByOne = async (nonEmptyAssets: AssetItem[], token: string) => {
        try {
            let successCount = 0;

            for (const asset of nonEmptyAssets) {
                try {
                    await axios.post(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/hotel-assets`,
                        {
                            hotel_id: asset.hotel_id,
                            icon: asset.icon,
                            text_tk: asset.text_tk,
                            text_en: asset.text_en,
                            text_ru: asset.text_ru,
                        },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    successCount++;
                } catch {
                    console.error('Error adding individual asset');
                }
            }

            if (successCount > 0) {
                setSuccess(`${successCount} of ${nonEmptyAssets.length} asset(s) successfully added!`);
                setError(null);

                // Сброс формы
                setAssets([{
                    hotel_id: '',
                    icon: 'FaBed',
                    text_tk: '',
                    text_en: '',
                    text_ru: '',
                }]);

                setTimeout(() => {
                    router.push('/admin/hotel-assets');
                }, 1500);
            } else {
                setError('Failed to add any assets');
            }
        } catch {
            setError('Error adding assets one by one');
        }
    };

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Add Hotel Assets</h2>
                    <button
                        type="button"
                        onClick={addNewAsset}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-150"
                    >
                        + Add Another Asset
                    </button>
                </div>

                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
                {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}

                <div className="w-full bg-white rounded-lg shadow-md">
                    <form onSubmit={handleSubmit} className="p-6">
                        {assets.map((asset, assetIndex) => (
                            <div key={assetIndex} className="mb-8 p-6 border rounded-lg bg-gray-50">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">Asset #{assetIndex + 1}</h3>
                                    {assets.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeAsset(assetIndex)}
                                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-sm"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    {/* Hotel Select */}
                                    <div className="mb-4">
                                        <label className="block font-medium mb-2">Hotel *</label>
                                        <select
                                            value={asset.hotel_id}
                                            onChange={(e) => updateAsset(assetIndex, 'hotel_id', e.target.value)}
                                            className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">Select Hotel</option>
                                            {hotels.map((hotel) => (
                                                <option key={hotel.id} value={hotel.id}>
                                                    {hotel.title_en} / {hotel.title_tk} / {hotel.title_ru}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Icon Select */}
                                    <div className="mb-4">
                                        <label className="block font-medium mb-2">Icon</label>
                                        <select
                                            value={asset.icon}
                                            onChange={(e) => updateAsset(assetIndex, 'icon', e.target.value)}
                                            className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                                        >
                                            {iconOptions.map((opt) => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="flex gap-2 flex-wrap">
                                            {iconOptions.map((opt) => {
                                                const IconComp = opt.icon;
                                                return (
                                                    <button
                                                        type="button"
                                                        key={opt.value}
                                                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                                            asset.icon === opt.value
                                                                ? 'bg-blue-100 border-blue-500 text-blue-600'
                                                                : 'bg-white border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                        onClick={() => updateAsset(assetIndex, 'icon', opt.value)}
                                                        title={opt.label}
                                                    >
                                                        <IconComp className="w-5 h-5" />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Text Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="mb-4">
                                        <label className="block font-medium mb-2">Text (Turkmen)</label>
                                        <input
                                            type="text"
                                            value={asset.text_tk}
                                            onChange={(e) => updateAsset(assetIndex, 'text_tk', e.target.value)}
                                            className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter text in Turkmen"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block font-medium mb-2">Text (English)</label>
                                        <input
                                            type="text"
                                            value={asset.text_en}
                                            onChange={(e) => updateAsset(assetIndex, 'text_en', e.target.value)}
                                            className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter text in English"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block font-medium mb-2">Text (Russian)</label>
                                        <input
                                            type="text"
                                            value={asset.text_ru}
                                            onChange={(e) => updateAsset(assetIndex, 'text_ru', e.target.value)}
                                            className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter text in Russian"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="flex space-x-4 mt-6">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Adding...' : `Add ${assets.length > 1 ? 'All Assets' : 'Asset'}`}
                            </button>
                            <button
                                type="button"
                                onClick={addNewAsset}
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded transition duration-150"
                            >
                                + Add Another
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddAsset;