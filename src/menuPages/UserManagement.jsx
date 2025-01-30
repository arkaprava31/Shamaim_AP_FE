import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [orderError, setOrderError] = useState('');

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('https://helloworld-j376pdtdya-uc.a.run.app/users'); // Replace with your API URL
                setUsers(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching users:', error);
                toast.error('Error in loading users!');
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Handle user selection and fetch order details
    const handleUserClick = async (user) => {
        setSelectedUser(user);
        setOrders([]);
        setOrderError('');
        setLoadingOrders(true);

        try {
            // const response = await axios.get(
            //     `https://helloworld-j376pdtdya-uc.a.run.app/orders/own/${user.id}` // Replace vendorId with appropriate field
            // );
            // setOrders(response.data);

            const response = await axios.get(
                `https://helloworld-j376pdtdya-uc.a.run.app/orders`
            );

            setOrders(response.data.filter(d => d.user === user.id));

            console.log(user);


        } catch (error) {
            setOrderError('Failed to fetch order details.');
            console.error('Error fetching orders:', error);
        } finally {
            setLoadingOrders(false);
        }
    };

    return (
        <div className="w-full flex flex-col items-center justify-start p-6 gap-2 min-h-screen">
            <div className="w-full text-left text-2xl font-semibold">User Management</div>
            <div className="w-full h-[3px] bg-main"></div>
            {
                loading ? <Loader /> :
                    <div className="w-full flex flex-col lg:flex-row gap-6 mt-2">
                        {/* User List */}
                        <div className="w-full flex-1 bg-gray-50 shadow-md rounded-md p-4">
                            <h2 className="text-xl font-semibold bg-black text-main p-1.5 px-3.5 rounded-md mb-4 w-fit">User List</h2>
                            <div className="space-y-2">
                                {users.map((user, index) => (
                                    <div
                                        key={index}
                                        className={`p-3 border rounded-md cursor-pointer hover:bg-gray-100 ${selectedUser === user ? 'border-black border-2' : 'border-gray-300'}`}
                                        onClick={() => handleUserClick(user)}
                                    >
                                        {user.email}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Selected User Details */}
                        <div className="w-full flex-1 bg-gray-50 shadow-md rounded-md p-4">
                            <h2 className="text-xl font-semibold bg-black text-main p-1.5 px-3.5 rounded-md w-fit mb-4">User Details</h2>
                            {selectedUser ? (
                                <div className="space-y-1">
                                    <p className='text-gray-800'>
                                        <strong className="text-black">Email:</strong> {selectedUser.email}
                                    </p>
                                    <p className='text-gray-800'>
                                        <strong className="text-black">Role:</strong> {selectedUser.role}
                                    </p>
                                    <p className='text-gray-800'>
                                        <strong className="text-black">Created At:</strong>{' '}
                                        {new Date(selectedUser.createdAt).toLocaleString()}
                                    </p>
                                    <p className='text-gray-800'>
                                        <strong className="text-black">Updated At:</strong>{' '}
                                        {new Date(selectedUser.updatedAt).toLocaleString()}
                                    </p>
                                    <p className='text-gray-800'>
                                        <strong className="text-black">OTP:</strong> {selectedUser.otp ? selectedUser.otp : 'Not found!'}
                                    </p>
                                    <div className='w-full flex flex-col items-start gap-1'>
                                        <strong className="text-black">Addresses:</strong>
                                        {/* <ul className="list-disc ml-5 mt-2">
                                            {selectedUser.addresses.map((address, i) => (
                                                <li key={i} className="text-gray-700">
                                                    {JSON.stringify(address)}
                                                </li>
                                            ))}
                                        </ul> */}

                                        {
                                            selectedUser.addresses.length == 0 ? <div className='text-gray-700 -mt-1 mb-3'>Not found!</div> :
                                                <div className='w-full flex items-start justify-start flex-wrap gap-2 mb-3'>
                                                    {
                                                        selectedUser.addresses.map((add, i) => {
                                                            return (
                                                                <div key={i} className='max-w-[15rem] flex flex-col items-start p-2 border border-black rounded-md text-sm gap-0.25'>
                                                                    <div className='text-gray-800'><span className='text-black font-semibold'>Name: </span>{add.name}</div>
                                                                    <div className='text-gray-800'><span className='text-black font-semibold'>Email: </span>{add.email}</div>
                                                                    <div className='text-gray-800'><span className='text-black font-semibold'>Contact No.: </span>{add.phone}</div>
                                                                    <div className='text-gray-800'><span className='text-black font-semibold'>Address: </span>{add.street}, {add.city}, {add.state}, {add.pinCode}</div>
                                                                </div>
                                                            )
                                                        })
                                                    }
                                                </div>
                                        }
                                    </div>

                                    <div className='w-full h-[2px] bg-black'></div>

                                    {/* Order Details Section */}
                                    {loadingOrders ? (
                                        <p className="text-gray-600 pt-2">Loading orders...</p>
                                    ) : orderError ? (
                                        <p className="text-red-600 pt-2">{orderError}</p>
                                    ) : orders.length > 0 ? (
                                        <div className="mt-6 bg-gray-50 p-2.5 rounded-md shadow-md">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-2.5">
                                                Order Details
                                            </h3>
                                            <div className="w-full flex flex-col items-start gap-3">
                                                {orders.map((order, index) => (
                                                    <div key={index} className="bg-white border border-gray-300 rounded-md p-4 text-sm flex flex-col items-start gap-0.5">
                                                        <h3 className="font-semibold text-gray-800 text-lg">
                                                            Order ID: {order.id}
                                                        </h3>
                                                        <p>
                                                            <strong className="text-black">Status:</strong>{' '}
                                                            {order.status}
                                                        </p>
                                                        <p>
                                                            <strong className="text-black">Total Amount:</strong> {new Intl.NumberFormat('en-US', {
                                                                style: 'currency',
                                                                currency: 'INR',
                                                            }).format(order.totalAmount)}
                                                        </p>
                                                        <p>
                                                            <strong className="text-black">Total Items:</strong>{' '}
                                                            {order.totalItems}
                                                        </p>
                                                        <div className='w-full flex flex-col items-start gap-1 my-2.5'>
                                                            <strong className="text-black">Ordered Items:</strong>
                                                            {/* <ul className="list-disc ml-5 mt-2">
                                                                {order.items.map((item, i) => (
                                                                    <li key={i} className="text-gray-700">
                                                                        <img
                                                                            src={item.thumbnail}
                                                                            alt={item.name}
                                                                            className="w-12 h-12 inline-block mr-2"
                                                                        />
                                                                        {item.name} - ₹{item.selling_price} - Qty:{' '}
                                                                        {item.quantity}
                                                                    </li>
                                                                ))}
                                                            </ul> */}
                                                            <div className="w-full flex flex-col items-start justify-start gap-2">
                                                                {
                                                                    order.items.map((item, i) => {
                                                                        return (
                                                                            <div key={i} className="w-full flex items-start justify-start gap-2.5">
                                                                                <img
                                                                                    src={item.thumbnail}
                                                                                    alt={item.name}
                                                                                    className="w-[4rem] aspect-auto"
                                                                                />
                                                                                <div className="w-full flex flex-col items-start">
                                                                                    <div className='max-w-[80%] truncate'>{item.name}</div>
                                                                                    <div><span className='font-semibold'>Price: </span>{new Intl.NumberFormat('en-US', {
                                                                                        style: 'currency',
                                                                                        currency: 'INR',
                                                                                    }).format(item.selling_price)}</div>
                                                                                    <div><span className='font-semibold'>Qty: </span>{item.quantity}</div>
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    })
                                                                }
                                                            </div>
                                                        </div>
                                                        <p>
                                                            <strong className="text-black">Payment Mode:</strong>{' '}
                                                            {order.paymentDetails[0]?.payMode || 'N/A'}
                                                        </p>
                                                        <p>
                                                            <strong className="text-black">Shipping Address:</strong>{' '}
                                                            {order.items[0]?.selectedAddress
                                                                ? `${order.items[0].selectedAddress.street}, ${order.items[0].selectedAddress.city}, ${order.items[0].selectedAddress.state}, ${order.items[0].selectedAddress.pinCode}`
                                                                : 'N/A'}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-600 pt-2">No orders found for this user.</p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-600">Select a user to view details.</p>
                            )}
                        </div>
                    </div>
            }
        </div>
    );
};

export default UserManagement;