'use client';
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import Link from "next/link";
import {ChevronDownIcon, ChevronUpIcon, EyeIcon, PlusCircleIcon} from "@heroicons/react/16/solid";
import Image from "next/image";

type GalleryItem = {
    id: number;
    image: string;
    tour_id: number;
    tour_title_tk?: string;
    tour_title_en?: string;
    tour_title_ru?: string;
};

type GroupedGallery = {
    tour_id: number;
    tour_title_tk?: string;
    tour_title_en?: string;
    tour_title_ru?: string;
    images: GalleryItem[];
};

const TourGallery = () => {
    const [gallery, setGallery] = useState<GroupedGallery[]>([]);
    const [expanded, setExpanded] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();


    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) return router.push('/');

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/tour-gallery`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const grouped = response.data.reduce((acc: GroupedGallery[], item: GalleryItem) => {
                    const existing = acc.find(g => g.tour_id === item.tour_id);
                    if (existing) {
                        existing.images.push(item);
                    } else {
                        acc.push({
                            tour_id: item.tour_id,
                            tour_title_tk: item.tour_title_tk,
                            tour_title_en: item.tour_title_en,
                            tour_title_ru: item.tour_title_ru,
                            images: [item],
                        });
                    }
                    return acc;
                }, []);
                setGallery(grouped);
            } catch (err) {
                setError('Ошибка при получении данных');
                if (axios.isAxiosError(err) && err.response?.status === 401) {
                    router.push('/');
                }
            }
        };

        fetchGallery();
    }, [router]);

    const toggleExpand = (id: number) => {
        setExpanded(prev => (prev === id ? null : id));
    };

    if (error) {
        return (
            <div className="text-red-500 py-4 text-center">
                <strong>Error: </strong>{error}
            </div>
        );
    }

    return (
        <div className="flex bg-gray-200">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8">
                    <div className="w-full flex justify-between items-center">
                        <h2 className="text-2xl font-bold mb-4">Tours Gallery</h2>
                        <Link
                            href="/admin/tour-gallery/add-gallery"
                            className="bg text-white h-fit py-2 px-8 rounded-md cursor-pointer flex items-center hover:bg-blue-700"
                        >
                            <PlusCircleIcon className="w-6 h-6" color="#ffffff" />
                            <div className="ml-2">Add</div>
                        </Link>
                    </div>

                    {error && <div className="text-red-500">{error}</div>}

                    <div className="bg-white rounded shadow divide-y">
                        {gallery.map(group => (
                            <div key={group.tour_id}>
                                <button
                                    onClick={() => toggleExpand(group.tour_id)}
                                    className="w-full text-left p-4 hover:bg-gray-100 flex justify-between items-center"
                                >
                                    <div className="font-bold text-2xl" dangerouslySetInnerHTML={{ __html: group.tour_title_en || 'Untitled' }} />
                                    {expanded === group.tour_id ? (
                                        <ChevronUpIcon className="w-5 h-5" />
                                    ) : (
                                        <ChevronDownIcon className="w-5 h-5" />
                                    )}
                                </button>

                                {expanded === group.tour_id && (
                                    <div className="p-4 bg-gray-50 flex flex-row gap-4 flex-wrap">
                                        {group.images.map(img => (
                                            <div
                                                key={img.id}
                                                className="flex flex-col justify-between bg-white rounded shadow p-4 w-48 min-h-[250px]"
                                            >
                                                <Image
                                                    src={`${process.env.NEXT_PUBLIC_API_URL}/${img.image}`}
                                                    alt={`Image ${img.id}`}
                                                    width={200}
                                                    height={200}
                                                    className="rounded object-cover"
                                                />

                                                <div className="mt-auto">
                                                    <Link
                                                        href={`/admin/tour-gallery/view-gallery/${img.id}`}
                                                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center justify-center"
                                                    >
                                                        <EyeIcon className="w-4 h-4 mr-2" />
                                                        View
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}

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

export default TourGallery;
