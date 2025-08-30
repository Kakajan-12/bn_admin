'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const Login = () => {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.errors ? errorData.errors[0].msg : 'Login failed');
                return;
            }
            const data = await response.json();

            localStorage.setItem('auth_token', data.token);
            router.push('/admin');
        } catch (error) {
            console.error(error);
            setError('An unexpected error occurred');
        }

    };

    return (
        <div className="w-full h-screen flex justify-center items-center">
            <div className="p-10 rounded-md border border-gray-200 bg-white max-w-md w-full">
                <h1 className="text-white text-center mb-5 text-2xl font-bold color">BN Tour Admin Panel</h1>
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col items-start w-full">
                        <label htmlFor="username" className="color font-bolder">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full p-2 text-lg outline-none rounded-md border-2 border-color"
                        />
                    </div>
                    <div className="flex flex-col items-start w-full">
                        <label htmlFor="password" className="color font-bolder">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full p-2 text-lg outline-none rounded-md border-2 border-color "
                        />
                    </div>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    <button type="submit"
                            className="w-full bg mt-5 text-white p-4 rounded-md font-bold cursor-pointer"
                    >Sign in</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
