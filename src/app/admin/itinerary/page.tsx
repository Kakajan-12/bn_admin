'use client';
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import Link from "next/link";
import { ChevronDownIcon, ChevronUpIcon, EyeIcon, PlusCircleIcon } from "@heroicons/react/16/solid";

interface DataItem {
    id: number;
    title_tk: string;
    title_en: string;
    title_ru: string;
    text_tk: string;
    text_en: string;
    text_ru: string;
    tour_id: number;
    tour_title_en: string;
}

interface GroupedItinerary {
    tour_id: number;
    title_tk: string;
    title_en: string;
    title_ru: string;
    tour_title_en:string;
    items: DataItem[];
}

const Itinerary = () => {
    const [groupedData, setGroupedData] = useState<GroupedItinerary[]>([]);
    const [expanded, setExpanded] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("auth_token");
                if (!token) return router.push("/");

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/itinerary`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const grouped: GroupedItinerary[] = [];
                response.data.forEach((item: DataItem) => {
                    const existing = grouped.find(g => g.tour_id === item.tour_id);
                    if (existing) {
                        existing.items.push(item);
                    } else {
                        grouped.push({
                            tour_id: item.tour_id,
                            title_tk: item.title_tk,
                            title_en: item.title_en,
                            title_ru: item.title_ru,
                            tour_title_en: item.tour_title_en,
                            items: [item]
                        });
                    }
                });

                setGroupedData(grouped);
            } catch (err) {
                const axiosError = err as AxiosError;
                console.error(axiosError);
                setError("Ошибка при получении данных");

                if (axios.isAxiosError(axiosError) && axiosError.response?.status === 401) {
                    router.push("/");
                }
            }
        };

        fetchData();
    }, [router]);

    const toggleExpand = (tourId: number) => {
        setExpanded(prev => (prev === tourId ? null : tourId));
    };

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8">
                    <div className="w-full flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Itinerary</h2>
                        <Link
                            href="/admin/itinerary/add-itinerary"
                            className="bg text-white py-2 px-8 rounded-md flex items-center hover:bg-blue-700"
                        >
                            <PlusCircleIcon className="w-6 h-6" />
                            <span className="ml-2">Add</span>
                        </Link>
                    </div>

                    {error && <div className="text-red-500">{error}</div>}

                    <div className="bg-white rounded shadow divide-y">
                        {groupedData.map(group => (
                            <div key={group.tour_id}>
                                <button
                                    onClick={() => toggleExpand(group.tour_id)}
                                    className="w-full text-left p-4 hover:bg-gray-100 flex justify-between items-center"
                                >
                                    <div className="text-xl font-semibold" dangerouslySetInnerHTML={{ __html: group.tour_title_en }} />
                                    {expanded === group.tour_id ? (
                                        <ChevronUpIcon className="w-5 h-5" />
                                    ) : (
                                        <ChevronDownIcon className="w-5 h-5" />
                                    )}
                                </button>

                                {expanded === group.tour_id && (
                                    <div className="p-4 bg-gray-50 overflow-x-auto">
                                        <div className="flex flex-col gap-4">
                                            {group.items.map(item => (
                                                <div key={item.id} className="bg-white rounded shadow p-4 w-full min-w-[18rem] flex flex-row justify-between">
                                                    <div>
                                                        <h4 className="font-bold mb-2" dangerouslySetInnerHTML={{ __html: item.title_tk }} />
                                                        <p className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: item.text_tk }} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold mb-2" dangerouslySetInnerHTML={{ __html: item.title_en }} />
                                                        <p className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: item.text_en }} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold mb-2" dangerouslySetInnerHTML={{ __html: item.title_ru }} />
                                                        <p className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: item.text_ru }} />
                                                    </div>
                                                    <Link
                                                        href={`/admin/itinerary/view-itinerary/${item.id}`}
                                                        className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center justify-center"
                                                    >
                                                        <EyeIcon className="w-4 h-4 mr-2" />
                                                        View
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
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

export default Itinerary;
