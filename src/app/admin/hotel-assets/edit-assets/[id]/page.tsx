'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Sidebar from '@/Components/Sidebar';
import TokenTimer from '@/Components/TokenTimer';
import { FaBed, FaUtensils, FaDumbbell, FaWifi } from 'react-icons/fa6';
import { MdWaves } from 'react-icons/md';
import { TbMassage } from 'react-icons/tb';

const iconOptions = [
    { value: 'FaBed', label: 'Bed', icon: FaBed },
    { value: 'FaUtensils', label: 'Restaurant', icon: FaUtensils },
    { value: 'FaDumbbell', label: 'Gym', icon: FaDumbbell },
    { value: 'FaWifi', label: 'WiFi', icon: FaWifi },
    { value: 'MdWaves', label: 'Pool', icon: MdWaves },
    { value: 'TbMassage', label: 'Spa / Massage', icon: TbMassage },
];

interface Hotel {
    id: number;
    title_tk?: string;
    title_en?: string;
    title_ru?: string;
}

interface Asset {
    id: number;
    hotel_id: number;
    icon: string;
    text_tk?: string;
    text_en?: string;
    text_ru?: string;
}

const EditAsset = () => {
    const { id } = useParams();
    const router = useRouter();

    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [asset, setAsset] = useState<Asset | null>(null);

    const [hotelId, setHotelId] = useState('');
    const [icon, setIcon] = useState('FaBed');
    const [textTk, setTextTk] = useState('');
    const [textEn, setTextEn] = useState('');
    const [textRu, setTextRu] = useState('');

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (!token) return router.push('/');

        const fetchHotels = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/hotels`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setHotels(res.data);
            } catch (err) {
                console.error('Ошибка загрузки отелей:', err);
            }
        };

        const fetchAsset = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/hotel-assets/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data: Asset = res.data;
                setAsset(data);
                setHotelId(data.hotel_id.toString());
                setIcon(data.icon);
                setTextTk(data.text_tk || '');
                setTextEn(data.text_en || '');
                setTextRu(data.text_ru || '');
            } catch (err) {
                console.error('Ошибка загрузки ассета:', err);
                setError('Не удалось загрузить данные ассета');
            }
        };

        fetchHotels();
        if (id) fetchAsset();
    }, [id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) return router.push('/');

            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/hotel-assets/${id}`,
                {
                    hotel_id: hotelId,
                    icon,
                    text_tk: textTk,
                    text_en: textEn,
                    text_ru: textRu,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSuccess('Asset успешно обновлён!');
            setError(null);

            setTimeout(() => router.push('/admin/hotel-assets'), 1000);
        } catch (err) {
            console.error(err);
            setError('Ошибка при обновлении ассета');
            setSuccess(null);
        }
    };

    if (!asset) return <div className="p-4">Загрузка...</div>;

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <h2 className="text-2xl font-bold mb-6">Edit Hotel Asset</h2>

                {error && <div className="text-red-500 mb-4">{error}</div>}
                {success && <div className="text-green-500 mb-4">{success}</div>}

                <div className="w-full bg-white p-6 rounded shadow-md">
                    <form onSubmit={handleSubmit}>
                        <div className="flex space-x-6">
                            {/* Hotel Select */}
                            <div className="mb-4 w-full">
                                <label className="block font-medium mb-1">Hotel</label>
                                <select
                                    value={hotelId}
                                    onChange={(e) => setHotelId(e.target.value)}
                                    className="border rounded px-3 py-2 w-full"
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
                            <div className="mb-4 w-full">
                                <label className="block font-medium mb-1">Icon</label>
                                <select
                                    value={icon}
                                    onChange={(e) => setIcon(e.target.value)}
                                    className="border rounded px-3 py-2 w-full"
                                >
                                    {iconOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>

                                <div className="flex gap-2 mt-2 flex-wrap">
                                    {iconOptions.map((opt) => {
                                        const IconComp = opt.icon;
                                        return (
                                            <div
                                                key={opt.value}
                                                className={`p-2 border rounded cursor-pointer ${
                                                    icon === opt.value ? 'bg-blue-100 border-blue-500' : ''
                                                }`}
                                                onClick={() => setIcon(opt.value)}
                                            >
                                                <IconComp className="w-6 h-6" />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Text Fields */}
                        <div className="mb-4">
                            <label className="block font-medium mb-1">Text (Turkmen)</label>
                            <input
                                type="text"
                                value={textTk}
                                onChange={(e) => setTextTk(e.target.value)}
                                className="border rounded px-3 py-2 w-full"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block font-medium mb-1">Text (English)</label>
                            <input
                                type="text"
                                value={textEn}
                                onChange={(e) => setTextEn(e.target.value)}
                                className="border rounded px-3 py-2 w-full"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block font-medium mb-1">Text (Russian)</label>
                            <input
                                type="text"
                                value={textRu}
                                onChange={(e) => setTextRu(e.target.value)}
                                className="border rounded px-3 py-2 w-full"
                            />
                        </div>

                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Save
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditAsset;
