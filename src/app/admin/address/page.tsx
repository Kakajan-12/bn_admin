'use client'
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import Link from "next/link";
import { EyeIcon, PlusCircleIcon } from "@heroicons/react/16/solid";

interface Address {
    address_id: number;
    address_tk: string;
    address_en: string;
    address_ru: string;
    iframe: string;
}

const Address = () => {
    const [addresses, setAddresses] = useState<Address[]>([]); // Type the state with Service[]
    const [error, setError] = useState<string | null>(null); // Error state
    const router = useRouter();

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    router.push('/');
                    return;
                }

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/contact-address`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setAddresses(response.data); // Assuming the response data is an array of services
            } catch (err) {
                const axiosError = err as AxiosError;
                console.error(axiosError);
                setError('Ошибка при получении данных');

                if (axios.isAxiosError(axiosError) && axiosError.response?.status === 401) {
                    router.push('/');
                }
            }
        };

        fetchServices();
    }, [router]);

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
                        <h2 className="text-2xl font-bold mb-4">Addresses</h2>
                        <Link
                            href="/admin/address/add-address"
                            className="bg text-white h-fit py-2 px-8 rounded-md cursor-pointer flex items-center"
                        >
                            <PlusCircleIcon className="size-6" color="#ffffff"/>
                            <div className="ml-2">Add</div>
                        </Link>
                    </div>
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead>
                        <tr>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">iframe</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Turkmen</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">English</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Russian</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">View</th>
                        </tr>
                        </thead>
                        <tbody>
                        {addresses.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-4">No address available</td>
                            </tr>
                        ) : (
                            addresses.map((address) => (
                                <tr key={address.address_id}>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <div dangerouslySetInnerHTML={{__html: address.iframe}}/>
                                    </td>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <div dangerouslySetInnerHTML={{__html: address.address_tk}}/>
                                    </td>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <div dangerouslySetInnerHTML={{__html: address.address_en}}/>
                                    </td>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <div dangerouslySetInnerHTML={{__html: address.address_ru}}/>
                                    </td>
                                    <td className="py-4 px-4 border-b border-gray-200">
                                        <Link
                                            href={`/admin/address/view-address/${address.address_id}`}
                                            className="bg text-white py-2 px-8 rounded-md cursor-pointer flex w-32"
                                        >
                                            <EyeIcon color="#ffffff"/>
                                            <div className="ml-2">View</div>
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

    );
};

export default Address;
