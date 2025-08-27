'use client';

import { useState} from 'react';
import { TextField, Button, MenuItem } from '@mui/material';
import { useRouter } from 'next/navigation';
import Sidebar from '@/Components/Sidebar';
import TokenTimer from '@/Components/TokenTimer';


const icons = ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'telegram', 'whatsapp'];

const AddLink = () => {
    const [icon, setIcon] = useState('');
    const [url, setUrl] = useState('');
    const router = useRouter();
    const handleSubmit = async () => {
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/links`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,},
            body: JSON.stringify({ icon, url }),
        });

        if (res.ok) {
            router.push('/admin/social-links');
            setIcon('');
            setUrl('');
        } else {
            const err = await res.json();
            alert('Ошибка: ' + err.error);
        }
    };

    return (
        <div className="flex bg-gray-200">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8 bg-white p-4">
                    <form onSubmit={(e) => e.preventDefault()} style={{display: 'flex', gap: '1rem'}}>
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

                        <Button variant="contained" color="primary" onClick={handleSubmit}
                        className="w-44">
                            Add link
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddLink;
