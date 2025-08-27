'use client';
import React, { useEffect, useState, Fragment } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import Image from 'next/image';
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import { Menu, Transition } from '@headlessui/react';
import {
    ChevronDownIcon,
    PencilIcon,
    TrashIcon,
} from '@heroicons/react/16/solid';

interface Slider {
    id: number;
    image: string;
    title_tk: string;
    title_en: string;
    title_ru: string;
    text_tk: string;
    text_en: string;
    text_ru: string;
}

const ViewSlider = () => {
    const { id } = useParams();
    const [slider, setSlider] = useState<Slider | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [loading, setLoading] = useState(true); // Added loading state
    const router = useRouter();

    useEffect(() => {
        const fetchSlider = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    router.push('/');
                    return;
                }

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/sliders/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setSlider(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Ошибка при загрузке слайдера:", err);
                setError('Ошибка при загрузке слайдера');
                setLoading(false);

                if (err instanceof AxiosError && err.response?.status === 401) {
                    router.push('/');
                }
            }
        };

        if (id) fetchSlider();
    }, [id, router]);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/sliders/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setIsDeleting(false);
            setShowModal(false);
            router.push('/admin/sliders');
        } catch (err) {
            console.error("Ошибка при удалении:", err);
            setIsDeleting(false);
            setShowModal(false);
            setError('Ошибка при удалении слайдера');
        }
    };

    if (loading) return <div className="text-center">Загрузка...</div>; // Loading state
    if (error) return <div className="text-red-500 text-center">{error}</div>; // Display error message if any

    return (
        <div className="flex bg-gray-200 h-screen">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8">
                    <div className="w-full flex justify-between">
                        <h2 className="text-2xl font-bold mb-4">View Slider</h2>
                        <Menu as="div" className="relative inline-block text-left">
                            <Menu.Button
                                className="inline-flex items-center gap-2 rounded-md bg-gray-800 py-1.5 px-3 text-sm font-semibold text-white shadow-inner hover:bg-gray-700 focus:outline-none cursor-pointer">
                                Options
                                <ChevronDownIcon className="w-4 h-4 fill-white/60"/>
                            </Menu.Button>

                            <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                            >
                                <Menu.Items
                                    className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                    <div className="py-1">
                                        <Menu.Item>
                                            {({active}) => (
                                                <button
                                                    onClick={() => router.push(`/admin/sliders/edit-slider/${id}`)}
                                                    className={`${
                                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                                    } group flex w-full items-center px-4 py-2 text-sm cursor-pointer`}
                                                >
                                                    <PencilIcon className="w-4 h-4 mr-2 text-gray-400"/>
                                                    Edit
                                                </button>
                                            )}
                                        </Menu.Item>
                                        <div className="border-t border-gray-100"></div>
                                        <Menu.Item>
                                            {({active}) => (
                                                <button
                                                    onClick={() => setShowModal(true)}
                                                    className={`${
                                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                                    } group flex w-full items-center px-4 py-2 text-sm cursor-pointer`}
                                                >
                                                    <TrashIcon className="w-4 h-4 mr-2 text-gray-400"/>
                                                    Delete
                                                </button>
                                            )}
                                        </Menu.Item>
                                    </div>
                                </Menu.Items>
                            </Transition>
                        </Menu>
                    </div>

                    <div className="bg-white p-4 rounded-md border-gray-200 flex">
                        {slider && slider.image && (
                            <Image
                                src={`${process.env.NEXT_PUBLIC_API_URL}/${slider.image.replace('\\', '/')}`}
                                alt="Slider"
                                width={500}
                                height={400}
                                className="rounded mb-6"
                            />
                        )}

                        <div className="flex-1 space-y-10 divide-y-1">
                            <div>
                                <div className="font-bold text-lg mb-2">Turkmen</div>
                                {slider?.title_tk && (
                                    <div>
                                        <strong>Title</strong>
                                        <div dangerouslySetInnerHTML={{__html: slider.title_tk}}/>
                                    </div>
                                )}
                                {slider?.text_tk && (
                                    <div>
                                        <strong>Text</strong>
                                        <div dangerouslySetInnerHTML={{__html: slider.text_tk}}/>
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="font-bold text-lg mb-2">English</div>
                                {slider?.title_en && (
                                    <div>
                                        <strong>Title English:</strong>
                                        <div dangerouslySetInnerHTML={{__html: slider.title_en}}/>
                                    </div>
                                )}
                                {slider?.text_en && (
                                    <div>
                                        <strong>Text English:</strong>
                                        <div dangerouslySetInnerHTML={{__html: slider.text_en}}/>
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="font-bold text-lg mb-2">Russian</div>
                                {slider?.title_ru && (
                                    <div>
                                        <strong>Title Russian:</strong>
                                        <div dangerouslySetInnerHTML={{__html: slider.title_ru}}/>
                                    </div>
                                )}
                                {slider?.text_ru && (
                                    <div>
                                        <strong>Text Russian:</strong>
                                        <div dangerouslySetInnerHTML={{__html: slider.text_ru}}/>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>

                {showModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50">
                        <div className="bg-white p-6 rounded shadow-md w-96">
                            <h2 className="text-lg font-bold mb-4">Remove slider</h2>
                            <p className="mb-6">Are you sure you want to delete this slider?</p>
                            <div className="flex justify-end space-x-4">
                                <button
                                    className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                                    onClick={() => setShowModal(false)}
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewSlider;
