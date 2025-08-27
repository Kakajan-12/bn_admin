'use client';

import { useState, useEffect } from 'react';
import { TextField, Button, MenuItem } from '@mui/material';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/Components/Sidebar';
import TokenTimer from '@/Components/TokenTimer';

const icons = ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'telegram', 'whatsapp'];

const EditLink = () => {
    const [icon, setIcon] = useState('');
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(true);

    const router = useRouter();
    const params = useParams();
    const id = params?.id;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/links/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) throw new Error('Failed to fetch link');
                const data = await res.json();
                const item = Array.isArray(data) ? data[0] : data;
                if (!item) {
                    alert("Данные не найдены");
                    return;
                }

                setIcon(item.icon);
                setUrl(item.url);

                setLoading(false);
            } catch (err) {
                console.error(err);
                alert('Ошибка загрузки данных');
            }
        };

        if (id) fetchData();
    }, [id]);

    const handleSubmit = async () => {
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/links/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ icon, url }),
        });

        if (res.ok) {
            router.push('/admin/social-links');
        } else {
            const err = await res.json();
            alert('Ошибка: ' + err.error);
        }
    };

    if (loading) {
        return <div className="p-10">Загрузка...</div>;
    }

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8 bg-white p-4">
                    <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', gap: '1rem' }}>
                        <TextField
                            select
                            label="Platform"
                            value={icon}
                            onChange={(e) => setIcon(e.target.value)}
                            required
                            className="w-56"
                        >
                            {icons.map((p) => (
                                <MenuItem key={p} value={p}>
                                    {p}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="Ссылка"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            required
                            fullWidth
                        />

                        <Button variant="contained" onClick={handleSubmit} className="w-64">
                            Save changes
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditLink;
