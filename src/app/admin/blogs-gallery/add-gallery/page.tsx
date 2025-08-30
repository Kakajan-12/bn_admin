'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/Components/Sidebar';
import TokenTimer from '@/Components/TokenTimer';

const AddBlogGallery = () => {
    const [image, setImage] = useState<File | null>(null);
    const [blog_id, setBlogId] = useState('');
    const [blogs, setBlogs] = useState<{ id: number, title_tk: string, title_en: string, title_ru: string }[]>([]);
    const [isGallery, setIsGallery] = useState(false);


    const router = useRouter();

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs`);
                const data = await res.json();
                setBlogs(data);
            } catch (err) {
                console.error('Ошибка при загрузке:', err);
            }
        };

        fetchBlogs();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.error('Нет токена. Пользователь не авторизован.');
            return;
        }

        const formData = new FormData();
        if (image) formData.append('image', image);
        formData.append('blog_id', blog_id ?? '');
        formData.append("is_gallery", isGallery ? "1" : "0");


        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blog-gallery`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                console.log('добавлен!', data);
                setImage(null);
                setBlogId('');
                router.push('/admin/blogs-gallery'); // После добавления слайда редирект
            } else {
                const errorText = await response.text();
                console.error('Ошибка при добавлении:', errorText);
            }
        } catch (error) {
            console.error('Ошибка запроса', error);
        }
    };

    return (
        <div className="flex bg-gray-200">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8">
                    <form
                        onSubmit={handleSubmit}
                        className="w-full mx-auto p-6 border border-gray-300 rounded-lg shadow-lg bg-white"
                    >
                        <h2 className="text-2xl font-bold mb-4 text-left">Add new blog gallery</h2>

                        <div className="mb-4 flex space-x-4">
                            <div className="w-full">
                                <label htmlFor="image" className="block text-gray-700 font-semibold mb-2">
                                    Image:
                                </label>
                                <input
                                    type="file"
                                    id="image"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setImage(e.target.files[0]);
                                        }
                                    }}
                                    required
                                    className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                                />
                            </div>
                            <div className="w-full">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Blog:
                                </label>
                                <select
                                    id="blog_id"
                                    name="blog_id"
                                    value={blog_id}
                                    onChange={(e) => setBlogId(e.target.value)}
                                    required
                                    className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                                >
                                    <option value="">Select location</option>
                                    {blogs.map((blog) => (
                                        <option key={blog.id} value={blog.id}>
                                            {blog.title_en} / {blog.title_tk} / {blog.title_ru}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="w-full">
                            <label className="inline-flex items-center mt-6">
                                <input
                                    type="checkbox"
                                    checked={isGallery}
                                    onChange={(e) => setIsGallery(e.target.checked)}
                                    className="form-checkbox h-5 w-5 text-blue-600"
                                />
                                <span className="ml-2 text-gray-700">Is Gallery</span>
                            </label>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150"
                        >
                            Add gallery
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddBlogGallery;
