import React, { useState } from 'react';
import CryptoJS from "crypto-js";
import toast from 'react-hot-toast';

const Login = () => {

    const [password, setPassword] = useState("");

    const storedHash = "58a83bd52ddb579460c04952acba4055"; 

    const handleLogin = () => {
        const hashedInput = CryptoJS.MD5(password).toString();
        if (hashedInput === storedHash) {
            localStorage.setItem('isAuthenticated', true);
            toast.success("Login successful!");
            window.location.reload();
        } else {
            toast.error("Incorrect password");
        }
    };

    return (
        <div className="w-full flex flex-col items-center justify-start">
            <div className="w-full text-left bg-black p-4">
                <div className="text-main text-nowrap text-xl font-medium">Shamaim Lifestyle</div>
            </div>
            <div className="w-full h-screen-minus-60 flex items-center justify-center">
                <div className="w-fit flex flex-col items-center justify-start p-6 bg-main rounded-md">
                    <div className="w-full text-center font-semibold text-2xl mb-10">Login</div>
                    <div className="w-full flex flex-col items-start gap-1">
                        <div>Enter password:</div>
                        <input
                            type="password"
                            className="p-2 w-[20rem] mb-4 rounded text-sm"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        className="w-full bg-black hover:bg-gray-900 text-white py-1.5 rounded-md"
                        onClick={handleLogin}
                    >
                        Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
