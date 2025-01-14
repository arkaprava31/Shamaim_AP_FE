import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { backendServer } from '../utils/data';
import axios from 'axios';
import Loader from '../components/Loader';

const OrderManagement = () => {

    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);

    const [loading, setLoading] = useState(true);

    const getAllOrders = async () => {
        try {
            const response = await axios.get(`${backendServer}/api/allOrders`);
            setOrders(response.data);
            setLoading(false);
        } catch (error) {
            toast.error('Error in loading orders!');
        }
    };

    useEffect(() => {
        getAllOrders();
    }, []);

    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('');

    useEffect(() => {
        let updatedOrders = [...orders];

        if (search) {
            updatedOrders = updatedOrders.filter((order) =>
                order._id.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (sort) {
            updatedOrders = updatedOrders.filter(odr => odr.status === sort);
        }

        setFilteredOrders(updatedOrders);
    }, [search, sort, orders]);

    return (
        <div className="w-full flex flex-col items-center justify-start p-6 gap-2">
            <div className="w-full text-left text-2xl font-semibold">Orders Management</div>
            <div className="w-full h-[3px] bg-main"></div>

            {/* Search and sort */}
            <div className="w-full flex items-center justify-between gap-4 mt-4">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by Order ID"
                    className="w-1/3 p-2 border border-gray-400 rounded-md"
                />

                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="p-2 border border-gray-400 rounded-md"
                >
                    <option value="">Sort by Status</option>
                    <option value="pending">Pending</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                </select>
            </div>

            {
                (!loading || filteredOrders.length != 0) &&
                <div className="w-full text-left my-2.5 text-lg">{filteredOrders.length} order(s)</div>
            }

            <div className="w-full flex flex-col items-center justify-start gap-4">
                {
                    loading ? <Loader /> :
                        filteredOrders.length === 0 ? <div className="w-full text-left">No order found!</div> :
                            filteredOrders.map(odr => {
                                return (
                                    <div key={odr._id} className="w-full flex flex-col items-start justify-start p-4 border border-solid border-gray-500 rounded-md">
                                        <div className="w-full flex items-end justify-between">
                                            <div className="text-xl font-semibold">Order Id: <span className='text-gray-700'>{odr._id}</span></div>
                                            {
                                                odr.status === 'shipped' ? <div className="bg-blue-800 text-white py-1.5 px-3 rounded-md">Shipped</div> :
                                                    odr.status === 'delivered' ? <div className="bg-green-800 text-white py-1.5 px-3 rounded-md">Delivered</div> :
                                                        <div className="bg-gray-800 text-white py-1.5 px-3 rounded-md">Pending</div>
                                            }
                                        </div>
                                        <div className="w-fit bg-black text-main px-2 py-1 rounded-md mt-6">Ordered item(s):</div>
                                        <div className="w-full text-left font-semibold mt-2">{odr.items.length} {odr.items.length === 1 ? 'item' : 'items'}</div>
                                        <div className="w-[60%] flex flex-col items-center justify-start mt-3">
                                            {
                                                odr.items.map(item => {
                                                    return (
                                                        <div key={item.sku} className='w-full flex items-center justify-around border-b border-solid border-b-black py-2.5'>
                                                            <img src={item.thumbnail} className='w-[3rem] aspect-auto' alt="" />
                                                            <div className="w-[40%] flex flex-col items-start justify-start gap-1">
                                                                <div className="w-full truncate">{item.name}</div>
                                                                <div>Size: {item.size.name}</div>
                                                            </div>
                                                            <div className="">{item.units} x {new Intl.NumberFormat('en-US', {
                                                                style: 'currency',
                                                                currency: 'INR',
                                                            }).format(item.selling_price)}</div>
                                                            <div className="font-semibold">{new Intl.NumberFormat('en-US', {
                                                                style: 'currency',
                                                                currency: 'INR',
                                                            }).format(item.units * item.selling_price)}</div>
                                                        </div>
                                                    )
                                                })
                                            }
                                            <div className="w-full text-left my-2 font-semibold">
                                                Subtotal: <span className='text-lg'>{new Intl.NumberFormat('en-US', {
                                                    style: 'currency',
                                                    currency: 'INR',
                                                }).format(odr.totalAmount)}</span>
                                            </div>
                                        </div>
                                        <div className="w-full flex items-start justify-center">
                                            <div className="w-full flex flex-col items-start justify-start gap-0.5">
                                                <div className="w-fit bg-black text-main px-2 py-1 rounded-md my-1.5">User Details:</div>
                                                <div className="font-semibold">Name: <span className='font-normal'>{odr.items[0].selectedAddress.name}</span></div>
                                                <div className="font-semibold">Email: <span className='font-normal'>{odr.items[0].selectedAddress.email}</span></div>

                                                <div className="w-fit bg-black text-main px-2 py-1 rounded-md my-1.5">Shipping Address:</div>
                                                <div className="font-semibold">Street: <span className='font-normal'>{odr.items[0].selectedAddress.street}</span></div>
                                                <div className="font-semibold">City: <span className='font-normal'>{odr.items[0].selectedAddress.city}</span></div>
                                                <div className="font-semibold">State: <span className='font-normal'>{odr.items[0].selectedAddress.state}</span></div>
                                                <div className="font-semibold">Pin Code: <span className='font-normal'>{odr.items[0].selectedAddress.pinCode}</span></div>

                                                <div className="font-semibold mt-0.5">Contact No.: <span className='font-normal'>{odr.items[0].selectedAddress.phone}</span></div>
                                            </div>
                                            <div className="w-full flex flex-col items-start justify-start gap-0.5">
                                                <div className="w-fit bg-black text-main px-2 py-1 rounded-md my-1.5">Payment Details:</div>
                                                <div className="font-semibold">Mode of payment: <span className='font-normal'>{odr.paymentDetails[0].payMode}</span></div>

                                                {
                                                    odr.calculatedTotalAmount > odr.totalAmount ?
                                                        <div className='w-full flex flex-col items-start justify-start'>
                                                            <div className='text-green-600 font-semibold'>Discount applied!</div>
                                                            {
                                                                odr.calculatedTotalAmount - odr.totalAmount == 100 ?
                                                                <div className='text-gray-700'>Coupon applied: <span className='font-semibold'>FORYOU100</span> ({new Intl.NumberFormat('en-US', {
                                                                    style: 'currency',
                                                                    currency: 'INR',
                                                                }).format(100)}) </div>
                                                                : null
                                                            }
                                                        </div>
                                                        : null
                                                }

                                                <div className="w-fit bg-black text-main px-2 py-1 rounded-md my-1.5">Shiprocket Details:</div>
                                                <div className="font-semibold">Order Id: <span className='font-normal'>{odr.shiprocketResponse[0].order_id || 'Not found!'}</span></div>
                                                <div className="font-semibold">Channel Order Id: <span className='font-normal'>{odr.shiprocketResponse[0].channel_order_id || 'Not found!'}</span></div>
                                                <div className="font-semibold">Shipment Id: <span className='font-normal'>{odr.shiprocketResponse[0].shipment_id || 'Not found!'}</span></div>
                                                <div className="font-semibold">Status: <span className='font-normal'>{odr.shiprocketResponse[0].status || 'Not found!'}</span></div>
                                                <div className="font-semibold">AWB Code: <span className='font-normal'>{odr.shiprocketResponse[0].awb_code || 'Not found!'}</span></div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                }
            </div>
        </div>
    );
};

export default OrderManagement;