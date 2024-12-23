import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [orderError, setOrderError] = useState('');

    // Fetch user data on component mount
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('https://helloworld-j376pdtdya-uc.a.run.app/users'); // Replace with your API URL
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
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
            const response = await axios.get(
                `https://helloworld-j376pdtdya-uc.a.run.app/orders/own/${selectedUser.id}` // Replace vendorId with appropriate field
            );
            setOrders(response.data);
        } catch (error) {
            setOrderError('Failed to fetch order details.');
            console.error('Error fetching orders:', error);
        } finally {
            setLoadingOrders(false);
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">User Management</h1>
            <div className="flex flex-col lg:flex-row gap-6">
                {/* User List */}
                <div className="flex-1 bg-white shadow-md rounded-md p-4">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">User List</h2>
                    <div className="space-y-2">
                        {users.map((user, index) => (
                            <div
                                key={index}
                                className="p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-100"
                                onClick={() => handleUserClick(user)}
                            >
                                {user.email}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Selected User Details */}
                <div className="flex-1 bg-white shadow-md rounded-md p-4">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">User Details</h2>
                    {selectedUser ? (
                        <div className="space-y-3">
                            <p>
                                <strong className="text-gray-600">Email:</strong> {selectedUser.email}
                            </p>
                            <p>
                                <strong className="text-gray-600">Role:</strong> {selectedUser.role}
                            </p>
                            <p>
                                <strong className="text-gray-600">Created At:</strong>{' '}
                                {new Date(selectedUser.createdAt).toLocaleString()}
                            </p>
                            <p>
                                <strong className="text-gray-600">Updated At:</strong>{' '}
                                {new Date(selectedUser.updatedAt).toLocaleString()}
                            </p>
                            <p>
                                <strong className="text-gray-600">OTP:</strong> {selectedUser.otp}
                            </p>
                            <div>
                                <strong className="text-gray-600">Addresses:</strong>
                                <ul className="list-disc ml-5 mt-2">
                                    {selectedUser.addresses.map((address, i) => (
                                        <li key={i} className="text-gray-700">
                                            {JSON.stringify(address)}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Order Details Section */}
                            {loadingOrders ? (
                                <p className="text-gray-600">Loading orders...</p>
                            ) : orderError ? (
                                <p className="text-red-600">{orderError}</p>
                            ) : orders.length > 0 ? (
                                <div className="mt-6 bg-gray-50 p-4 rounded-md shadow-md">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                        Order Details
                                    </h3>
                                    {orders.map((order, index) => (
                                        <div key={index} className="space-y-4">
                                            <div className="bg-white border border-gray-300 rounded-md p-4">
                                                <h4 className="font-semibold text-gray-800">
                                                    Order ID: {order.id}
                                                </h4>
                                                <p>
                                                    <strong className="text-gray-600">Status:</strong>{' '}
                                                    {order.status}
                                                </p>
                                                <p>
                                                    <strong className="text-gray-600">Total Amount:</strong> ₹
                                                    {order.totalAmount}
                                                </p>
                                                <p>
                                                    <strong className="text-gray-600">Total Items:</strong>{' '}
                                                    {order.totalItems}
                                                </p>
                                                <div>
                                                    <strong className="text-gray-600">Items:</strong>
                                                    <ul className="list-disc ml-5 mt-2">
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
                                                    </ul>
                                                </div>
                                                <p>
                                                    <strong className="text-gray-600">Payment Mode:</strong>{' '}
                                                    {order.paymentDetails[0]?.payMode || 'N/A'}
                                                </p>
                                                <p>
                                                    <strong className="text-gray-600">Shipping Address:</strong>{' '}
                                                    {order.items[0]?.selectedAddress
                                                        ? `${order.items[0].selectedAddress.street}, ${order.items[0].selectedAddress.city}, ${order.items[0].selectedAddress.state}, ${order.items[0].selectedAddress.pinCode}`
                                                        : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-600">No orders found for this user.</p>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-600">Select a user to view details.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
