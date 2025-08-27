'use client'
import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import axios, {AxiosError} from "axios";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import Link from "next/link";
import {PencilIcon, PlusCircleIcon, TrashIcon} from "@heroicons/react/16/solid";

interface DataItem {
    id: number;
    number: string;
    location_en: string;
}

const Numbers = () => {
    const [numbers, setNumbers] = useState<DataItem[]>([]);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedNumberId, setSelectedNumberId] = useState<number | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchMails = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    router.push('/');
                    return;
                }

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/contact-numbers`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setNumbers(response.data);
            } catch (err) {
                const axiosError = err as AxiosError;
                console.error(axiosError);
                setError("Ошибка при получении данных");

                if (axios.isAxiosError(axiosError) && axiosError.response?.status === 401) {
                    router.push("/");
                }
            }
        };

        fetchMails();
    }, [router]);

    const handleDelete = async () => {
        if (!selectedNumberId) return;
        setIsDeleting(true);
        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/contact-numbers/${selectedNumberId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setNumbers(prev => prev.filter(p => p.id !== selectedNumberId));
            setIsDeleting(false);
            setShowModal(false);
            setSelectedNumberId(null);
        } catch (err) {
            console.error("Ошибка при удалении:", err);
            setIsDeleting(false);
            setShowModal(false);
        }
    };

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="flex bg-gray-200">
            <Sidebar/>
            <div className="flex-1 p-10 ml-62">
                <TokenTimer/>
                <div className="mt-8">
                    <div className="w-full flex justify-between">
                        <h2 className="text-2xl font-bold mb-4">Numbers</h2>
                        <Link href="/admin/numbers/add-number"
                              className="bg text-white h-fit py-2 px-8 rounded-md cursor-pointer flex items-center"><PlusCircleIcon
                            className="size-6" color="#ffffff"/>
                            <div className="ml-2">Add</div>
                        </Link>
                    </div>
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead>
                        <tr>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Numbers</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Location</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Edit</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Delete</th>
                        </tr>
                        </thead>
                        <tbody>
                        {numbers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-4">No mails available</td>
                            </tr>
                        ) : (
                            numbers.map(number => (
                                <tr key={number.id}>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <div dangerouslySetInnerHTML={{__html: number.number}}/>
                                    </td>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <div dangerouslySetInnerHTML={{__html: number.location_en}}/>
                                    </td>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <Link
                                            href={`/admin/numbers/edit-number/${number.id}`}
                                            className="flex items-center text-blue-600 hover:underline"
                                        >
                                            <PencilIcon className="w-5 h-5 mr-2" />
                                            Edit
                                        </Link>
                                    </td>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <button
                                            onClick={() => {
                                                setSelectedNumberId(number.id);
                                                setShowModal(true);
                                            }}
                                            className="flex items-center text-red-600 hover:underline"
                                        >
                                            <TrashIcon className="w-5 h-5 mr-2"/>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
                {showModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50">
                        <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
                            <h2 className="text-xl font-semibold mb-4">Remove number?</h2>
                            <p className="mb-6">Are u sure?</p>
                            <div className="flex justify-end space-x-4">
                                <button
                                    className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                                    onClick={() => {
                                        setShowModal(false);
                                        setSelectedNumberId(null);
                                    }}
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
    )
}

export default Numbers;