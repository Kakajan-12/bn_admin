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
    text_tk: string;
    text_en: string;
    text_ru: string;
    tour_id: number;
    tour_title_en: string;
}

interface GroupedExclude {
    tour_title_en: string;
    items: DataItem[];
}

const Excludes = () => {
    const [groupedData, setGroupedData] = useState<GroupedExclude[]>([]);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    router.push('/');
                    return;
                }

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/excludes`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const groupedMap: { [title: string]: DataItem[] } = {};

                response.data.forEach((item: DataItem) => {
                    const title = item.tour_title_en;
                    if (groupedMap[title]) {
                        groupedMap[title].push(item);
                    } else {
                        groupedMap[title] = [item];
                    }
                });

                const groupedArray: GroupedExclude[] = Object.entries(groupedMap).map(([title, items]) => ({
                    tour_title_en: title,
                    items,
                }));

                setGroupedData(groupedArray);
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

    const toggleExpand = (title: string) => {
        setExpanded(prev => (prev === title ? null : title));
    };

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8">
                    <div className="w-full flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Excludes</h2>
                        <Link
                            href="/admin/excludes/add-excludes"
                            className="bg text-white py-2 px-8 rounded-md flex items-center hover:bg-blue-700"
                        >
                            <PlusCircleIcon className="w-6 h-6" />
                            <span className="ml-2">Add</span>
                        </Link>
                    </div>

                    {error && <div className="text-red-500">{error}</div>}

                    <div className="bg-white rounded shadow divide-y">
                        {groupedData.map(group => (
                            <div key={group.tour_title_en}>
                                <button
                                    onClick={() => toggleExpand(group.tour_title_en)}
                                    className="w-full text-left p-4 hover:bg-gray-100 flex justify-between items-center"
                                >
                                    <div className="text-lg font-medium"
                                         dangerouslySetInnerHTML={{__html: group.tour_title_en}}/>
                                    {expanded === group.tour_title_en ? (
                                        <ChevronUpIcon className="w-5 h-5"/>
                                    ) : (
                                        <ChevronDownIcon className="w-5 h-5"/>
                                    )}
                                </button>

                                {expanded === group.tour_title_en && (
                                    <div className="p-4 bg-gray-50 overflow-x-auto">
                                        <div className="flex flex-col gap-4">
                                            {group.items.map(item => (
                                                <div key={item.id} className="bg-white rounded shadow p-4 w-full min-w-[18rem] flex flex-row justify-between">
                                                    <div>
                                                        <p className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: item.text_tk }} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-700"
                                                           dangerouslySetInnerHTML={{__html: item.text_en}}/>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-700"
                                                           dangerouslySetInnerHTML={{__html: item.text_ru}}/>
                                                    </div>
                                                    <Link
                                                        href={`/admin/excludes/view-excludes/${item.id}`}
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

export default Excludes;