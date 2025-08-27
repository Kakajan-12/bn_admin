'use client';
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import Link from "next/link";
import { ChevronDownIcon, ChevronUpIcon, EyeIcon, PlusCircleIcon } from "@heroicons/react/16/solid";
import Image from "next/image";

type GalleryItem = {
    id: number;
    image: string;
    blog_id: number;
    blog_title_tk?: string;
    blog_title_en?: string;
    blog_title_ru?: string;
};

type GroupedGallery = {
    blog_id: number;
    blog_title_tk?: string;
    blog_title_en?: string;
    blog_title_ru?: string;
    images: GalleryItem[];
};

const BlogsGallery = () => {
    const [gallery, setGallery] = useState<GroupedGallery[]>([]);
    const [expanded, setExpanded] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) return router.push('/');

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/blog-gallery`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const grouped = response.data.reduce((acc: GroupedGallery[], item: GalleryItem) => {
                    const existing = acc.find(g => g.blog_id === item.blog_id);
                    if (existing) {
                        existing.images.push(item);
                    } else {
                        acc.push({
                            blog_id: item.blog_id,
                            blog_title_tk: item.blog_title_tk,
                            blog_title_en: item.blog_title_en,
                            blog_title_ru: item.blog_title_ru,
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

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8">
                    <div className="w-full flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Blogs Gallery</h2>
                        <Link href="/admin/blogs-gallery/add-gallery"
                              className="bg text-white py-2 px-8 rounded-md flex items-center hover:bg-blue-700">
                            <PlusCircleIcon className="w-5 h-5 mr-2" />
                            Add
                        </Link>
                    </div>

                    {error && <div className="text-red-500">{error}</div>}

                    <div className="bg-white rounded shadow divide-y">
                        {gallery.map(group => (
                            <div key={group.blog_id}>
                                <button
                                    onClick={() => toggleExpand(group.blog_id)}
                                    className="w-full text-left p-4 hover:bg-gray-100 flex justify-between items-center"
                                >
                                    <div className="font-bold text-2xl" dangerouslySetInnerHTML={{ __html: group.blog_title_en || 'Untitled' }} />
                                    {expanded === group.blog_id ? (
                                        <ChevronUpIcon className="w-5 h-5" />
                                    ) : (
                                        <ChevronDownIcon className="w-5 h-5" />
                                    )}
                                </button>

                                {expanded === group.blog_id && (
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
                                                        href={`/admin/blogs-gallery/view-gallery/${img.id}`}
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

export default BlogsGallery;
