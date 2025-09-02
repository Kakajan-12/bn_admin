'use client';
import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import axios from "axios";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import Link from "next/link";
import {ChevronDownIcon, ChevronUpIcon, PlusCircleIcon} from "@heroicons/react/16/solid";
import {FaBed, FaUtensils, FaDumbbell, FaWifi} from "react-icons/fa6";
import {MdWaves} from "react-icons/md";
import {TbMassage} from "react-icons/tb";

interface AssetItem {
    id: number;
    icon: string;
    text_tk?: string;
    text_en?: string;
    text_ru?: string;
    hotel_id: number;
}

interface HotelItem {
    id: number;
    title_tk?: string;
    title_en?: string;
    title_ru?: string;
}

type GroupedAssets = {
    hotel_id: number;
    hotel_title?: string;
    data: AssetItem[];
};

const HotelAssets = () => {
    const [assets, setAssets] = useState<GroupedAssets[]>([]);
    const [expanded, setExpanded] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("auth_token");
                if (!token) return router.push("/");

                const [assetsRes, hotelsRes] = await Promise.all([
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/hotel-assets`, {
                        headers: {Authorization: `Bearer ${token}`},
                    }),
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/hotels`, {
                        headers: {Authorization: `Bearer ${token}`},
                    }),
                ]);

                const hotels: HotelItem[] = hotelsRes.data;

                const grouped: GroupedAssets[] = [];
                assetsRes.data.forEach((item: AssetItem) => {
                    let group = grouped.find(g => g.hotel_id === item.hotel_id);
                    if (!group) {
                        const hotel = hotels.find(h => h.id === item.hotel_id);
                        group = {
                            hotel_id: item.hotel_id,
                            // тут вытаскиваем title_en
                            hotel_title: hotel?.title_en?.replace(/<\/?[^>]+(>|$)/g, "") || "Untitled",
                            data: [],
                        };
                        grouped.push(group);
                    }
                    group.data.push(item);
                });

                setAssets(grouped);
            } catch (err) {
                console.error(err);
                setError("Ошибка при получении данных");
                if (axios.isAxiosError(err) && err.response?.status === 401) router.push("/");
            }
        };

        fetchData();
    }, [router]);

    const toggleExpand = (id: number) => {
        setExpanded(prev => (prev === id ? null : id));
    };

    if (error) return <div className="text-red-500 py-4 text-center">{error}</div>;

    const IconMap: Record<string, any> = {FaBed, FaUtensils, FaDumbbell, FaWifi, MdWaves, TbMassage};

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar/>
            <div className="flex-1 p-10 ml-62">
                <TokenTimer/>
                <div className="mt-8">
                    <div className="w-full flex justify-between items-center">
                        <h2 className="text-2xl font-bold mb-4">Hotel Assets</h2>
                        <Link
                            href="/admin/hotel-assets/add-assets"
                            className="bg text-white h-fit py-2 px-8 rounded-md flex items-center hover:bg-blue-700"
                        >
                            <PlusCircleIcon className="w-6 h-6 mr-2"/>
                            Add
                        </Link>
                    </div>

                    <div className="bg-white rounded shadow divide-y">
                        {assets.map(group => (
                            <div key={group.hotel_id}>
                                <button
                                    onClick={() => toggleExpand(group.hotel_id)}
                                    className="w-full text-left p-4 hover:bg-gray-100 flex justify-between items-center"
                                >
                                    <span className="font-bold text-xl">
                                        {group.hotel_title}
                                    </span>
                                    {expanded === group.hotel_id ? (
                                        <ChevronUpIcon className="w-5 h-5"/>
                                    ) : (
                                        <ChevronDownIcon className="w-5 h-5"/>
                                    )}
                                </button>


                                {expanded === group.hotel_id && (
                                    <div className="p-4 bg-gray-50 flex flex-row gap-4 flex-wrap">
                                        {group.data.map(asset => {
                                            const Icon = IconMap[asset.icon] || FaBed;
                                            return (
                                                <div
                                                    key={asset.id}
                                                    className="flex flex-col justify-between bg-white rounded shadow p-4 w-48 min-h-[150px] items-center"
                                                >
                                                    <Icon className="w-10 h-10 text-blue-600 mb-2"/>
                                                    <p className="text-center">{asset.text_en}</p>

                                                    <div className="mt-auto w-full flex justify-around mt-2">
                                                        <Link
                                                            href={`/admin/hotel-assets/edit/${asset.id}`}
                                                            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <Link
                                                            href={`/admin/hotel-assets/view-assets/${asset.id}`}
                                                            className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                                                        >
                                                            View
                                                        </Link>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HotelAssets;
