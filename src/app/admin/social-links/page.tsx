'use client';

import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import Link from "next/link";
import React, { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import {
    TrashIcon,
    PencilIcon,
    PlusCircleIcon
} from "@heroicons/react/16/solid";
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TelegramIcon from '@mui/icons-material/Telegram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import TikTokIcon from '@mui/icons-material/MusicNote'; // Заменитель для TikTok

interface LinkType {
    id: number;
    icon: string;
    url: string;
}

const SocialLinks = () => {
    const [links, setLinks] = useState<LinkType[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [showModal, setShowModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const router = useRouter();

    const getIconComponent = (iconName: string) => {
        switch (iconName.toLowerCase()) {
            case 'facebook':
                return <FacebookIcon />;
            case 'instagram':
                return <InstagramIcon />;
            case 'twitter':
                return <TwitterIcon />;
            case 'linkedin':
                return <LinkedInIcon />;
            case 'telegram':
                return <TelegramIcon />;
            case 'whatsapp':
                return <WhatsAppIcon />;
            case 'tiktok':
                return <TikTokIcon />;
            default:
                return <span>❓</span>;
        }
    };

    useEffect(() => {
        const fetchLinks = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    router.push('/');
                    return;
                }

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/links`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setLinks(response.data);
            } catch (err) {
                const axiosError = err as AxiosError;
                console.error(axiosError);
                setError('Ошибка при получении данных');
                if (axios.isAxiosError(axiosError) && axiosError.response?.status === 401) {
                    router.push('/');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchLinks();
    }, [router]);


    const handleDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/links/${deleteId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setLinks(prev => prev.filter(link => link.id !== deleteId));
            setDeleteId(null);
            setShowModal(false);
        } catch (err) {
            console.error("Ошибка при удалении:", err);
            setError('Ошибка при удалении ссылки');
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8">
                    <div className="w-full flex justify-between">
                        <h2 className="text-2xl font-bold mb-4">Social Links</h2>
                        <Link href="/admin/social-links/add-link" className="bg text-white py-2 px-8 rounded-md cursor-pointer flex items-center">
                            <PlusCircleIcon className="w-6 h-6" color="#ffffff" />
                            <div className="ml-2">Add</div>
                        </Link>
                    </div>
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead>
                        <tr>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Icon</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Url</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Edit</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Delete</th>
                        </tr>
                        </thead>
                        <tbody>
                        {links.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="text-center py-4">No data available</td>
                            </tr>
                        ) : (
                            links.map((link) => (
                                <tr key={link.id}>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        {getIconComponent(link.icon)}
                                    </td>
                                    <td className="py-4 px-4 border-b border-gray-200 w-full">
                                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                            {link.url}
                                        </a>
                                    </td>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <Link href={`/admin/social-links/edit-link/${link.id}`}
                                              className="bg text-white py-2 px-8 rounded-md cursor-pointer flex w-32 justify-center items-center">
                                            <PencilIcon className="w-5 h-5" color="#ffffff" />
                                            <div className="ml-2">Edit</div>
                                        </Link>
                                    </td>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <button
                                            onClick={() => {
                                                setDeleteId(link.id);
                                                setShowModal(true);
                                            }}
                                            className="bg-red-700 text-white py-2 px-8 rounded-md cursor-pointer flex w-32 justify-center items-center"
                                        >
                                            <TrashIcon className="w-5 h-5" color="#ffffff" />
                                            <div className="ml-2">Delete</div>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg">
                        <p className="text-lg font-medium mb-4">Удалить ссылку?</p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => {
                                    setDeleteId(null);
                                    setShowModal(false);
                                }}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Удаление...' : 'Удалить'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SocialLinks;
