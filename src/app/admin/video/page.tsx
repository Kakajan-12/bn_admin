'use client';
import React, { Fragment, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import Link from "next/link";
import { ChevronDownIcon, PencilIcon, PlusCircleIcon, TrashIcon } from "@heroicons/react/16/solid";
import { Menu, Transition } from "@headlessui/react";

type VideoItem = {
    id: number;
    video: string;
};

const VideoContent = () => {
    const [video, setVideo] = useState<VideoItem[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    router.push('/');
                    return;
                }

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/video`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setVideo(response.data);
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    setError('Ошибка при получении данных');
                    if (err.response?.status === 401) {
                        router.push('/');
                    }
                } else {
                    setError('Неизвестная ошибка');
                }
            }
        };

        fetchVideo();
    }, [router]);

    const renderError = () => (
        <div className="text-red-500 py-4">
            <strong>Error: </strong>{error}
        </div>
    );

    const handleDelete = async (id: number) => {
        setIsDeleting(true);
        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/video/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setVideo((prev) => prev.filter((item) => item.id !== id)); // удаляем из стейта
            setSelectedId(null);
            setIsDeleting(false);
        } catch (err) {
            console.error("Ошибка при удалении:", err);
            setIsDeleting(false);
            setSelectedId(null);
        }
    };

    if (error) return renderError();

    return (
        <div className="flex bg-gray-200">
            <Sidebar/>
            <div className="flex-1 p-10 ml-62">
                <TokenTimer/>
                <div className="mt-8">
                    <div className="w-full flex justify-between items-center">
                        <h2 className="text-2xl font-bold mb-4">Video</h2>

                        {video.length > 0 ? (
                            <Menu as="div" className="relative inline-block text-left">
                                <Menu.Button
                                    className="inline-flex items-center gap-2 rounded-md bg-gray-800 py-1.5 px-3 text-sm font-semibold text-white hover:bg-gray-700">
                                    Options
                                    <ChevronDownIcon className="w-4 h-4"/>
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
                                        className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                                        <div className="py-1">
                                            {video.map((item) => (
                                                <Fragment key={item.id}>
                                                    <Menu.Item>
                                                        {({active}) => (
                                                            <button
                                                                onClick={() => router.push(`/admin/video/edit-video/${item.id}`)}
                                                                className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} group flex w-full items-center px-4 py-2 text-sm`}
                                                            >
                                                                <PencilIcon className="w-4 h-4 mr-2"/> Edit
                                                            </button>
                                                        )}
                                                    </Menu.Item>
                                                    <Menu.Item>
                                                        {({ active }) => (
                                                            <button
                                                                onClick={() => setSelectedId(item.id)}
                                                                className={`${
                                                                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                                                } group flex w-full items-center px-4 py-2 text-sm`}
                                                            >
                                                                <TrashIcon className="w-4 h-4 mr-2" />
                                                                Delete
                                                            </button>
                                                        )}
                                                    </Menu.Item>
                                                    <div className="border-t border-gray-100"/>
                                                </Fragment>
                                            ))}
                                        </div>
                                    </Menu.Items>
                                </Transition>
                            </Menu>
                        ) : (
                            <Link href="/admin/video/add-video"
                                  className="bg text-white h-fit py-2 px-8 rounded-md cursor-pointer flex items-center hover:bg-blue-700">
                                <PlusCircleIcon className="w-6 h-6" color="#ffffff"/>
                                <div className="ml-2">Add</div>
                            </Link>
                        )}
                    </div>

                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead>
                        <tr>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Video</th>
                        </tr>
                        </thead>
                        <tbody>
                        {video.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-4">No sliders available</td>
                            </tr>
                        ) : (
                            video.map((data) => (
                                <tr key={data.id}>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <video width="640" height="360" controls preload="true">
                                            <source src={`${process.env.NEXT_PUBLIC_API_URL}/${data.video}`}
                                                    type="video/mp4"/>
                                            Your browser does not support the video tag.
                                        </video>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>

                    {selectedId !== null && (
                        <div className="fixed inset-0 bg-opacity-40 flex items-center justify-center z-50">
                            <div className="bg-white p-6 rounded shadow-md w-96">
                                <h2 className="text-lg font-bold mb-4">Remove Video</h2>
                                <p className="mb-6">Are you sure you want to delete this video?</p>
                                <div className="flex justify-end space-x-4">
                                    <button
                                        className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                                        onClick={() => setSelectedId(null)}
                                        disabled={isDeleting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                                        onClick={() => handleDelete(selectedId)}
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
        </div>
    );
};

export default VideoContent;
