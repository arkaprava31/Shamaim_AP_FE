import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import ProductManagement from '../menuPages/ProductManagement';
import UserManagement from '../menuPages/UserManagement';
import OrderManagement from '../menuPages/OrderManagement';
import Login from './Login';
import { TbLogout } from 'react-icons/tb';

const Home = () => {

    const { menuID, handleMenuID } = useContext(AppContext);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        if (localStorage.getItem('isAuthenticated')) {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        window.location.reload();
    }

    return (
        <>
            {
                !isAuthenticated ? <Login /> :
                    <div className="w-full flex flex-col items-center justify-start">
                        <div className="w-full flex items-center justify-between bg-black p-4">
                            <div className="text-main text-nowrap text-xl font-medium">Shamaim Lifestyle</div>
                            {
                                isAuthenticated &&
                                <button className='flex items-center justify-center bg-red-600 text-white text-2xl p-2 rounded-md' onClick={handleLogout}>
                                    <TbLogout />
                                </button>
                            }
                        </div>
                        <div className="w-full h-screen-minus-60 flex items-start justify-start">
                            <div className="w-[20%] h-full flex flex-col items-start justify-start bg-main">

                                <div onClick={() => handleMenuID(1)}
                                    className={`w-full p-2.5 text-lg cursor-pointer text-nowrap ${menuID === 1 ? 'bg-secondary font-semibold' : 'bg-main font-medium'}`}>Product Management</div>

                                <div onClick={() => handleMenuID(2)}
                                    className={`w-full p-2.5 text-lg cursor-pointer text-nowrap ${menuID === 2 ? 'bg-secondary font-semibold' : 'bg-main font-medium'}`}>User Management</div>

                                <div onClick={() => handleMenuID(3)}
                                    className={`w-full p-2.5 text-lg cursor-pointer text-nowrap ${menuID === 3 ? 'bg-secondary font-semibold' : 'bg-main font-medium'}`}>Orders Management</div>

                            </div>
                            <div className='w-full max-h-full overflow-y-scroll'>
                                {
                                    menuID === 1 ? <ProductManagement /> :
                                        menuID === 2 ? <UserManagement /> :
                                            menuID === 3 ? <OrderManagement /> : ''
                                }
                            </div>
                        </div>
                    </div>
            }
        </>
    );
};

export default Home;
