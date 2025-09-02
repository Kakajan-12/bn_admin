'use client';
import React, {Fragment, useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import axios from "axios";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import {FaBed, FaUtensils, FaDumbbell, FaWifi} from "react-icons/fa6";
import {MdWaves} from "react-icons/md";
import {TbMassage} from "react-icons/tb";
import {Menu, Transition} from "@headlessui/react";
import {ChevronDownIcon, PencilIcon, TrashIcon} from "@heroicons/react/16/solid";

interface AssetItem {
    id: number;
    icon: string;
    text_tk?: string;
    text_en?: string;
    text_ru?: string;
    hotel_id: number;
    hotels_title_tk?: string;
    hotels_title_en?: string;
    hotels_title_ru?: string;
}


const IconMap: Record<string, any> = {FaBed, FaUtensils, FaDumbbell, FaWifi, MdWaves, TbMassage};

const ViewAsset = () => {
    const {id} = useParams();
    const router = useRouter();
    const [asset, setAsset] = useState<AssetItem | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchAsset = async () => {
            try {
                const token = localStorage.getItem("auth_token");
                if (!token) return router.push("/");

                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/hotel-assets/${id}`, {
                    headers: {Authorization: `Bearer ${token}`},
                });

                setAsset(res.data);
            } catch (err) {
                console.error(err);
                setError("Ошибка при загрузке данных");
            }
        };

        if (id) fetchAsset();
    }, [id, router]);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/hotel-assets/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            router.push('/admin/hotel-assets');
        } catch (err) {
            console.error('Ошибка при удалении:', err);
        } finally {
            setIsDeleting(false);
            setShowModal(false);
        }
    };

    if (error) return <div className="text-red-500 p-4">{error}</div>;
    if (!asset) return <div className="text-gray-500 p-4">Загрузка...</div>;

    const Icon = IconMap[asset.icon] || FaBed;

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar/>
            <div className="flex-1 p-10 ml-62">
                <TokenTimer/>
                <div className="mt-8 bg-white p-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold mb-6">View Hotel Assets</h2>
                        <Menu as="div" className="relative inline-block text-left">
                            <Menu.Button
                                className="inline-flex items-center gap-2 rounded-md bg-gray-800 py-1.5 px-3 text-sm font-semibold text-white hover:bg-gray-700">
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
                                    className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                                    <div className="py-1">
                                        <Menu.Item>
                                            {({active}) => (
                                                <button
                                                    onClick={() => router.push(`/admin/hotel-assets/edit-assets/${id}`)}
                                                    className={`${
                                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                                    } group flex items-center w-full px-4 py-2 text-sm`}
                                                >
                                                    <PencilIcon className="w-4 h-4 mr-2 text-gray-400"/>
                                                    Edit
                                                </button>
                                            )}
                                        </Menu.Item>
                                        <div className="border-t border-gray-100"/>
                                        <Menu.Item>
                                            {({active}) => (
                                                <button
                                                    onClick={() => setShowModal(true)}
                                                    className={`${
                                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                                    } group flex items-center w-full px-4 py-2 text-sm`}
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
                    <div className="flex items-center gap-6 mb-6">
                        <Icon className="w-12 h-12 text-blue-600"/>
                            <div className="text-xl font-semibold" dangerouslySetInnerHTML={{__html: asset.hotels_title_en}}/>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-4 bg-gray-50 rounded shadow">
                            <h4 className="font-bold mb-2">Turkmen</h4>
                            <p>{asset.text_tk || "-"}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded shadow">
                            <h4 className="font-bold mb-2">English</h4>
                            <p>{asset.text_en || "-"}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded shadow">
                            <h4 className="font-bold mb-2">Русский</h4>
                            <p>{asset.text_ru || "-"}</p>
                        </div>
                    </div>
                    {showModal && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                            <div className="bg-white p-6 rounded shadow-md w-96">
                                <h2 className="text-lg font-bold mb-4">Remove hotel assets</h2>
                                <p className="mb-6">Are you sure you want to delete this hotel assets?</p>
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

        </div>
    );
};

export default ViewAsset;
