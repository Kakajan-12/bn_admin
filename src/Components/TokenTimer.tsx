import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import jwt, { JwtPayload } from 'jsonwebtoken';

// Define the interface for the decoded token
interface DecodedToken extends JwtPayload {
    exp: number; // The expiration time (in seconds)
}

const TokenTimer = () => {
    const router = useRouter();
    const [expirationDate, setExpirationDate] = useState<string>(''); // Ensure it's a string
    const [isTokenValid, setIsTokenValid] = useState<boolean>(true); // To track token validity

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            router.push('/');
            return;
        }

        try {
            const decodedToken = jwt.decode(token) as DecodedToken | null; // Type the decoded token

            // Check if the decodedToken exists and the token is expired
            const currentTime = Date.now() / 1000;

            if (!decodedToken || decodedToken.exp < currentTime) {
                localStorage.removeItem('auth_token');
                router.push('/');
                setIsTokenValid(false); // Token is invalid
                return;
            }

            // Token is valid, set expiration date
            const expiration = new Date(decodedToken.exp * 1000);
            setExpirationDate(expiration.toLocaleString());
            setIsTokenValid(true); // Token is valid

            console.log('Decoded Token:', decodedToken);
        } catch (error) {
            console.error("Failed to decode token:", error);
            localStorage.removeItem('auth_token');
            router.push('/');
            setIsTokenValid(false); // Token is invalid
        }
    }, [router]);

    return (
        <div>
            <h1 className="text-4xl font-bold mb-6">Admin Panel</h1>
            {/* Show message if token is invalid */}
            <p className="text-lg mb-4">
                {isTokenValid
                    ? `Expiration Date: ${expirationDate}`
                    : 'Token is invalid or expired. Please log in again.'}
            </p>
        </div>
    );
};

export default TokenTimer;
