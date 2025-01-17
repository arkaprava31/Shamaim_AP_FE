import axios from 'axios';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { backendServer } from '../utils/data';
import Loader from '../components/Loader';
import { MdOutlineDelete } from 'react-icons/md';
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Typography,
} from "@material-tailwind/react";
import { GrNext, GrPrevious } from 'react-icons/gr';
import { FiEdit } from 'react-icons/fi';
import ImageUpload from '../components/ImageUpload';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import firebaseApp from '../utils/firebaseConfig';

const ProductManagement = () => {

    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);

    const getAllProducts = async () => {
        try {
            const response = await axios.get(`${backendServer}/api/allProducts`);
            setProducts(response.data);
            setLoading(false);
        } catch (error) {
            toast.error('Error in loading products!');
        }
    };

    useEffect(() => {
        getAllProducts();
    }, []);

    const [isUpdate, setIsUpdate] = useState(false);

    const [newPdt, setNewPdt] = useState({
        title: '',
        style: '',
        code: '',
        mrp: 0,
        discount: 0,
        offerPrice: 0,
        gender: '',
        category: '',
        subcategory: '',
        genre: [],
        color: '',
        size: [],
        gsm: '',
        highlight: '',
        aboutDesign: '',
        material: '',
        sleeve: '',
        fit: '',
        neckType: '',
        pattern: '',
        thumbnail: null,
        stock: {},
        images: []
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewPdt((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (name === 'category') {
            const selectedCategory = categories.find((cat) => cat.value === value);
            setSubcategories(selectedCategory ? selectedCategory.subcategories : []);
            setNewPdt((prev) => ({
                ...prev,
                subcategory: '',
            }));
        }
    };

    useEffect(() => {
        if (newPdt.mrp && newPdt.discount) {
            const calculatedOfferPrice =
                newPdt.mrp - (newPdt.mrp * newPdt.discount) / 100;
            setNewPdt((prev) => ({
                ...prev,
                offerPrice: calculatedOfferPrice.toFixed(2),
            }));
        }
    }, [newPdt.mrp, newPdt.discount]);

    const [updatePdt, setUpdatePdt] = useState({});

    const updateProduct = async (id) => {

        setLoading(true);

        try {
            const response = await axios.get(`${backendServer}/api/getProduct/${id}`);

            setNewPdt({
                title: response.data.title,
                style: response.data.Style,
                code: response.data.ProductCode,
                mrp: response.data.price,
                discount: response.data.discountPercentage,
                gender: response.data.gender === 'men' || response.data.gender === 'Male' ? 'Male' : 'Female',
                category: response.data.category,
                subcategory: response.data.subcategory,
                genre: response.data.genre || [],
                color: response.data.color,
                size: response.data.size || [],
                gsm: response.data.GSM,
                aboutDesign: response.data.AboutTheDesign,
                material: response.data.Material,
                sleeve: response.data.SleeveLength,
                fit: response.data.Fit,
                neckType: response.data.NeckType,
                pattern: response.data.Pattern,
                stock: response.data.stock || {},
                thumbnail: response.data.thumbnail,
                images: response.data.images
            });

            setLoading(false);

        } catch (error) {
            setLoading(false);
            toast.error(error.response.data.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const requiredFields = [
            'title',
            'style',
            'code',
            'mrp',
            'discount',
            'gender',
            'color',
            'gsm',
            'aboutDesign',
            'material',
            'sleeve',
            'fit',
            'neckType',
            'pattern',
            ...(!isUpdate ? ['category', 'subcategory', 'highlight', 'thumbnail', 'images'] : []),
        ];

        const emptyFields = requiredFields.filter((field) => !newPdt[field]);

        if (emptyFields.length > 0) {
            toast.error(`All the fields are required!`);
            return;
        }

        if (!isUpdate && newPdt.genre.length === 0) {
            toast.error('Please select at least one genre.');
            return;
        }

        if (newPdt.size.length === 0) {
            toast.error('Please select at least one size.');
            return;
        }

        const invalidStock = newPdt.size.some((size) => !newPdt.stock[size] || newPdt.stock[size] <= 0);

        if (invalidStock) {
            toast.error('Please enter valid stock values for all selected sizes.');
            return;
        }

        try {
            let thumbnailURL = newPdt.thumbnail;

            if (newPdt.thumbnail instanceof File) {
                const storage = getStorage(firebaseApp);
                const storageRef = ref(storage, `thumbnails/${Date.now()}-${newPdt.thumbnail.name}`);
                const uploadResult = await uploadBytes(storageRef, newPdt.thumbnail);
                thumbnailURL = await getDownloadURL(uploadResult.ref);
            }

            const productImagesURLs = [];

            for (const image of newPdt.images) {
                if (image instanceof File) {
                    const storage = getStorage(firebaseApp);
                    const storageRef = ref(storage, `product-images/${Date.now()}-${image.name}`);
                    const uploadResult = await uploadBytes(storageRef, image);
                    const imageURL = await getDownloadURL(uploadResult.ref);
                    productImagesURLs.push(imageURL);
                } else {
                    productImagesURLs.push(image);
                }
            }

            const product = {
                ...(!isUpdate && { id: products[products.length - 1]?.id + 1 }),
                title: newPdt.title,
                Style: newPdt.style,
                genre: newPdt.genre,
                ProductCode: newPdt.code,
                SleeveLength: newPdt.sleeve,
                Fit: newPdt.fit,
                NeckType: newPdt.neckType,
                Pattern: newPdt.pattern,
                AboutTheDesign: newPdt.aboutDesign,
                Material: newPdt.material,
                GSM: newPdt.gsm,
                NetQTY: 1,
                CountryOfOrigin: 'India',
                CareInstructions: 'Please read the brand tag.',
                gender: newPdt.gender,
                color: newPdt.color,
                size: newPdt.size,
                stock: newPdt.stock,
                category: newPdt.category,
                subcategory: newPdt.subcategory,
                price: newPdt.mrp,
                discountPercentage: newPdt.discount,
                thumbnail: thumbnailURL,
                images: productImagesURLs
            };

            if (isUpdate) {
                const response = await axios.put(`${backendServer}/api/updateProduct/${currId}`, { product });
                toast.success(response.data.message);
                setIsAdd(false);
                setIsUpdate(false);
                setCurrId(null);
            } else {
                const response = await axios.post(`${backendServer}/api/newProduct`, { product });
                toast.success(response.data.message);
                setIsAdd(false);
            }

            await getAllProducts();

            setNewPdt({
                title: '',
                style: '',
                code: '',
                mrp: 0,
                discount: 0,
                offerPrice: 0,
                gender: '',
                category: '',
                subcategory: '',
                genre: [],
                color: '',
                size: [],
                gsm: '',
                highlight: '',
                aboutDesign: '',
                material: '',
                sleeve: '',
                fit: '',
                neckType: '',
                pattern: '',
                thumbnail: null,
                stock: {},
                images: []
            });
        } catch (error) {
            toast.error(error.response.data.message);
        }
    };

    const [subcategories, setSubcategories] = useState([]);

    const categories = [
        { value: 'TShirts', subcategories: ['Classic Fit', 'Drop Shoulder', 'Polo Tees'] },
        { value: 'Hoodies', subcategories: ['Classic Fit', 'Drop Shoulder'] },
        { value: 'Sweatshirts', subcategories: ['Classic Fit', 'Drop Shoulder'] },
    ];

    const genres = ['Anime', 'Movies & Series', 'Superhero', 'Abstract', 'Bangla O Bangali', 'Drip & Doodle', 'Sports', 'Music & Band'];

    const sizes = ['M', 'L', 'XL'];

    const [isAdd, setIsAdd] = useState(false);

    const [currId, setCurrId] = useState(null);

    const handleProductDelete = async () => {
        try {
            const response = await axios.delete(`${backendServer}/api/deleteProduct/${currId}`);
            handleOpen();
            toast.success(response.data.message);
            setCurrId(null);
            getAllProducts();
        } catch (error) {
            toast.error(error.response.data.message);
        }
    };

    const [open, setOpen] = React.useState(false);

    const handleOpen = () => setOpen(!open);

    //Pagination

    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 20;

    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const currentProducts = products.slice(startIndex, endIndex);

    const totalPages = Math.ceil(products.length / productsPerPage);

    return (
        <div className="w-full flex flex-col items-center justify-start p-6 gap-2">
            <div className="w-full text-left text-2xl font-semibold">Product Management</div>
            <div className="w-full h-[3px] bg-main"></div>
            <div className={`w-full text-left ${isAdd ? 'hidden' : 'block'}`}>
                <button onClick={() => {
                    setIsAdd(true);
                    setIsUpdate(false);
                    setNewPdt({
                        title: '',
                        style: '',
                        code: '',
                        mrp: 0,
                        discount: 0,
                        offerPrice: 0,
                        gender: '',
                        category: '',
                        subcategory: '',
                        genre: [],
                        color: '',
                        size: [],
                        gsm: '',
                        highlight: '',
                        aboutDesign: '',
                        material: '',
                        sleeve: '',
                        fit: '',
                        neckType: '',
                        pattern: '',
                        thumbnail: null,
                        stock: {},
                        images: []
                    });
                }} disabled={loading} className='bg-black text-white px-3.5 py-2 rounded-md'>Add Product</button>
            </div>

            {
                isAdd && <div className="w-full flex items-start justify-start">
                    <form className='w-[60%] flex flex-col items-center justify-start gap-6 my-4'>
                        <div className='w-full flex flex-col items-start gap-1'>
                            <label htmlFor="title" className="font-semibold text-lg">
                                Title
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={newPdt.title}
                                onChange={handleChange}
                                className="w-full bg-transparent border-b border-solid border-black p-1 outline-none"
                                placeholder="Type here..."
                            />
                        </div>

                        <div className='w-full flex flex-col items-start gap-1'>
                            <label htmlFor="style" className="font-semibold text-lg">
                                Style
                            </label>
                            <input
                                type="text"
                                id="style"
                                name="style"
                                value={newPdt.style}
                                onChange={handleChange}
                                className="w-full bg-transparent border-b border-solid border-black p-1 outline-none"
                                placeholder="Type here..."
                            />
                        </div>

                        <div className="w-full flex items-center justify-start gap-4">
                            <div className="w-full flex flex-col items-start gap-1">
                                <label htmlFor="mrp" className="font-semibold text-lg">
                                    MRP
                                </label>
                                <input
                                    type="number"
                                    id="mrp"
                                    name="mrp"
                                    value={newPdt.mrp}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-b border-solid border-black p-1 outline-none"
                                    placeholder="Type here..."
                                />
                            </div>
                            <div className="w-full flex flex-col items-start gap-1">
                                <label htmlFor="discount" className="font-semibold text-lg">
                                    Discount (%)
                                </label>
                                <input
                                    type="number"
                                    id="discount"
                                    name="discount"
                                    value={newPdt.discount}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-b border-solid border-black p-1 outline-none"
                                    placeholder="Type here..."
                                />
                            </div>
                            <div className="w-full flex flex-col items-start gap-1">
                                <label htmlFor="offerPrice" className="font-semibold text-lg">
                                    Offer Price
                                </label>
                                <input
                                    type="number"
                                    id="offerPrice"
                                    name="offerPrice"
                                    value={newPdt.offerPrice}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-b border-solid border-black p-1 outline-none"
                                    placeholder="Type here..."
                                    disabled
                                />
                            </div>
                        </div>

                        <div className="w-full flex flex-col items-start gap-1">
                            <label htmlFor="gender" className="font-semibold text-lg">
                                Gender
                            </label>
                            <select
                                id="gender"
                                name="gender"
                                value={newPdt.gender}
                                onChange={handleChange}
                                className="w-[50%] bg-transparent border-b border-solid border-black p-1 outline-none"
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>

                        <div className="w-full flex items-center justify-start gap-4">
                            <div className="w-full flex flex-col items-start gap-1">
                                <label htmlFor="category" className="font-semibold text-lg">
                                    Category
                                </label>
                                <select
                                    id="category"
                                    name="category"
                                    value={newPdt.category}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-b border-solid border-black p-1 outline-none"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.value}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="w-full flex flex-col items-start gap-1">
                                <label htmlFor="subcategory" className="font-semibold text-lg">
                                    Subcategory
                                </label>
                                <select
                                    id="subcategory"
                                    name="subcategory"
                                    value={newPdt.subcategory}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-b border-solid border-black p-1 outline-none"
                                    disabled={!subcategories.length}
                                >
                                    <option value="">Select Subcategory</option>
                                    {subcategories.map((subcat) => (
                                        <option key={subcat} value={subcat}>
                                            {subcat}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="w-full flex flex-col items-start gap-1">
                            <label htmlFor="genre" className="font-semibold text-lg">
                                Genre
                            </label>
                            <div className="w-full flex flex-wrap gap-2">
                                {genres.map((gen) => (
                                    <div
                                        key={gen}
                                        className={`cursor-pointer px-3 py-1 rounded-md ${newPdt.genre.includes(gen)
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 text-black'
                                            }`}
                                        onClick={() =>
                                            setNewPdt((prev) => ({
                                                ...prev,
                                                genre: prev.genre.includes(gen)
                                                    ? prev.genre.filter((g) => g !== gen)
                                                    : [...prev.genre, gen],
                                            }))
                                        }
                                    >
                                        {gen}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="w-full flex flex-col items-start gap-1">
                            <label htmlFor="highlight" className="font-semibold text-lg">
                                Highlight
                            </label>
                            <textarea
                                id="highlight"
                                name="highlight"
                                value={newPdt.highlight}
                                onChange={handleChange}
                                rows="2"
                                className="w-full bg-transparent border-b border-solid border-black p-1 outline-none"
                                placeholder="Type here..."
                            />
                        </div>

                        <div className="w-full text-left text-black font-semibold text-lg bg-main p-1 pl-2.5 rounded-md">Product Description:</div>

                        <div className="w-full flex items-center justify-start gap-4">
                            <div className='w-full flex flex-col items-start gap-1'>
                                <label htmlFor="code" className="font-semibold text-lg">
                                    Product Code
                                </label>
                                <input
                                    type="text"
                                    id="code"
                                    name="code"
                                    value={newPdt.code}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-b border-solid border-black p-1 outline-none"
                                    placeholder="Type here..."
                                />
                            </div>
                            <div className='w-full flex flex-col items-start gap-1'>
                                <label htmlFor="gsm" className="font-semibold text-lg">
                                    GSM
                                </label>
                                <input
                                    type="text"
                                    id="gsm"
                                    name="gsm"
                                    value={newPdt.gsm}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-b border-solid border-black p-1 outline-none"
                                    placeholder="Type here..."
                                />
                            </div>
                        </div>

                        <div className="w-full flex items-center justify-start gap-4">
                            <div className='w-full flex flex-col items-start gap-1'>
                                <label htmlFor="color" className="font-semibold text-lg">
                                    Color
                                </label>
                                <input
                                    type="text"
                                    id="color"
                                    name="color"
                                    value={newPdt.color}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-b border-solid border-black p-1 outline-none"
                                    placeholder="Type here..."
                                />
                            </div>
                            <div className='w-full flex flex-col items-start gap-1'>
                                <label htmlFor="sleeve" className="font-semibold text-lg">
                                    Sleeve length
                                </label>
                                <input
                                    type="text"
                                    id="sleeve"
                                    name="sleeve"
                                    value={newPdt.sleeve}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-b border-solid border-black p-1 outline-none"
                                    placeholder="Type here..."
                                />
                            </div>
                            <div className='w-full flex flex-col items-start gap-1'>
                                <label htmlFor="fit" className="font-semibold text-lg">
                                    Fit
                                </label>
                                <input
                                    type="text"
                                    id="fit"
                                    name="fit"
                                    value={newPdt.fit}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-b border-solid border-black p-1 outline-none"
                                    placeholder="Type here..."
                                />
                            </div>
                        </div>

                        <div className="w-full flex items-center justify-start gap-4">
                            <div className='w-full flex flex-col items-start gap-1'>
                                <label htmlFor="neckType" className="font-semibold text-lg">
                                    Neck type
                                </label>
                                <input
                                    type="text"
                                    id="neckType"
                                    name="neckType"
                                    value={newPdt.neckType}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-b border-solid border-black p-1 outline-none"
                                    placeholder="Type here..."
                                />
                            </div>
                            <div className='w-full flex flex-col items-start gap-1'>
                                <label htmlFor="pattern" className="font-semibold text-lg">
                                    Pattern
                                </label>
                                <input
                                    type="text"
                                    id="pattern"
                                    name="pattern"
                                    value={newPdt.pattern}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-b border-solid border-black p-1 outline-none"
                                    placeholder="Type here..."
                                />
                            </div>
                            <div className='w-full flex flex-col items-start gap-1'>
                                <label htmlFor="material" className="font-semibold text-lg">
                                    Material
                                </label>
                                <input
                                    type="text"
                                    id="material"
                                    name="material"
                                    value={newPdt.material}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-b border-solid border-black p-1 outline-none"
                                    placeholder="Type here..."
                                />
                            </div>
                        </div>

                        <div className='w-full flex flex-col items-start gap-1'>
                            <label htmlFor="aboutDesign" className="font-semibold text-lg">
                                About the Design
                            </label>
                            <input
                                type="text"
                                id="aboutDesign"
                                name="aboutDesign"
                                value={newPdt.aboutDesign}
                                onChange={handleChange}
                                className="w-full bg-transparent border-b border-solid border-black p-1 outline-none"
                                placeholder="Type here..."
                            />
                        </div>

                        <div className="w-full flex items-center justify-start gap-4">
                            <div className='w-full flex flex-col items-start gap-1'>
                                <label className="font-semibold text-lg">
                                    Country of Origin
                                </label>
                                <input
                                    type="text"
                                    value="India"
                                    className="w-full bg-transparent border-b border-solid border-black p-1 outline-none"
                                    disabled
                                />
                            </div>
                            <div className='w-full flex flex-col items-start gap-1'>
                                <label className="font-semibold text-lg">
                                    Care Instruction
                                </label>
                                <input
                                    type="text"
                                    value="Please read the brand tag."
                                    className="w-full bg-transparent border-b border-solid border-black p-1 outline-none"
                                    disabled
                                />
                            </div>
                        </div>

                        <div className="w-full text-left text-black font-semibold text-lg bg-main p-1 pl-2.5 rounded-md">Size & Stock details:</div>

                        <div className="w-full flex flex-col items-start gap-1">
                            <label htmlFor="size" className="font-semibold text-lg">
                                Available sizes
                            </label>
                            <div className="w-full flex flex-wrap gap-2">
                                {sizes.map((size) => (
                                    <div
                                        key={size}
                                        className={`cursor-pointer px-3 py-1 rounded-md ${newPdt.size.includes(size)
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 text-black'
                                            }`}
                                        onClick={() =>
                                            setNewPdt((prev) => ({
                                                ...prev,
                                                size: prev.size.includes(size)
                                                    ? prev.size.filter((g) => g !== size)
                                                    : [...prev.size, size],
                                            }))
                                        }
                                    >
                                        {size}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="w-full flex flex-col items-start gap-1">
                            <label htmlFor="stock" className="font-semibold text-lg">
                                Stock details
                            </label>
                            {newPdt.size.length > 0 ?
                                <div className="w-full flex flex-wrap gap-4 mt-4">
                                    {newPdt.size.map((size) => (
                                        <div key={size} className="flex items-center gap-1">
                                            <label htmlFor={`stock-${size}`} className="font-medium text-md">
                                                {size}:
                                            </label>
                                            <input
                                                type="number"
                                                id={`stock-${size}`}
                                                name={`stock-${size}`}
                                                value={newPdt.stock?.[size] || ''}
                                                onChange={(e) =>
                                                    setNewPdt((prev) => ({
                                                        ...prev,
                                                        stock: {
                                                            ...prev.stock,
                                                            [size]: Number(e.target.value),
                                                        },
                                                    }))
                                                }
                                                className="w-[5rem] bg-transparent border-b border-solid border-black p-1 outline-none"
                                            />
                                        </div>
                                    ))}
                                </div> :
                                <div>No size selected!</div>
                            }
                        </div>

                        <div className="w-full text-left text-black font-semibold text-lg bg-main p-1 pl-2.5 rounded-md">Product Images:</div>

                        <ImageUpload newPdt={newPdt} setNewPdt={setNewPdt} />

                        {
                            newPdt.thumbnail && isUpdate ?
                                <div className='w-full flex flex-col items-start gap-2'>
                                    <div className='font-semibold'>Uploaded thumbnail:</div>
                                    <img className='w-[8rem] aspect-auto' src={newPdt.thumbnail} alt="thumbnail" />
                                </div>
                                : null
                        }

                        <div className='w-full flex items-center justify-start gap-4'>
                            <label htmlFor="images" className="font-semibold text-lg text-nowrap">Product Images:</label>
                            <input
                                type="file"
                                id="images"
                                accept="image/*"
                                multiple
                                onChange={(e) => setNewPdt({ ...newPdt, images: Array.from(e.target.files) })}
                            />
                        </div>
                        <div className='w-full flex flex-col items-start gap-2'>
                            { newPdt.images.length != 0 && <p className="text-sm font-medium text-gray-700">Image preview:</p> }
                            <div className="w-full flex items-start justify-start gap-3.5">
                                {newPdt.images && newPdt.images.map((image, index) => (
                                    <div key={index}>
                                        <img
                                            src={image instanceof File ? URL.createObjectURL(image) : image}
                                            alt={`Product-${index}`}
                                            className='w-[8rem] aspect-auto'
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>


                        <div className="w-full flex items-center justify-end gap-2.5">
                            <button onClick={(e) => { e.preventDefault(); setIsAdd(false) }}
                                className='bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition'>
                                Close
                            </button>
                            <button
                                type="submit" onClick={handleSubmit}
                                className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition"
                            >
                                {isUpdate ? 'Update' : 'Submit'}
                            </button>
                        </div>

                    </form>
                </div>
            }

            {
                !isAdd && <div className="w-full flex flex-col items-center justify-start gap-4 my-6">
                    {
                        loading ? <Loader /> :
                            products.length === 0 ? <div className="w-full text-left">No product found!</div> :
                                currentProducts.map((pdt) => {
                                    return (
                                        <div key={pdt._id} className="w-full flex items-start justify-center p-2.5 border border-solid border-gray-500 rounded-md">
                                            <div className="w-full flex items-start justify-center gap-4">
                                                <img className='w-[12rem] aspect-auto' src={pdt.thumbnail} alt="Product image" />
                                                <div className="w-full flex flex-col items-start gap-0.5">
                                                    <div className="w-full text-left font-semibold">
                                                        ID: <span className='font-normal text-gray-800'>{pdt.id}</span>
                                                    </div>
                                                    <div className="w-full text-left font-semibold">
                                                        Title: <span className='font-normal text-gray-800'>{pdt.title}</span>
                                                    </div>
                                                    <div className="w-full text-left font-semibold">
                                                        Style: <span className='font-normal text-gray-800'>{pdt.Style}</span>
                                                    </div>
                                                    <div className="w-full text-left font-semibold">
                                                        Gender: <span className='font-normal text-gray-800'>
                                                            {pdt.gender === 'Male' || pdt.gender === 'men' ? 'Male' : 'Female'}
                                                        </span>
                                                    </div>
                                                    <div className="w-full flex items-center justify-start gap-2">
                                                        <div className="font-semibold">
                                                            MRP: <span className='font-normal text-gray-800'>{
                                                                new Intl.NumberFormat('en-US', {
                                                                    style: 'currency',
                                                                    currency: 'INR',
                                                                }).format(pdt.price)
                                                            },</span>
                                                        </div>
                                                        <div className="font-semibold">
                                                            Applied discount: <span className='font-normal text-gray-800'>{pdt.discountPercentage}%,</span>
                                                        </div>
                                                        <div className="font-semibold">
                                                            Selling price: <span className='font-semibold text-green-700'>
                                                                {new Intl.NumberFormat('en-US', {
                                                                    style: 'currency',
                                                                    currency: 'INR',
                                                                }).format((pdt.price - (pdt.price * pdt.discountPercentage) / 100).toFixed(2))}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="w-full flex items-center justify-start gap-2">
                                                        <div className="font-semibold">
                                                            Category: <span className='font-normal text-gray-800'>{pdt.category},</span>
                                                        </div>
                                                        <div className="font-semibold">
                                                            Sub-Category: <span className='font-normal text-gray-800'>{pdt.subcategory}</span>
                                                        </div>
                                                    </div>

                                                    <div className="w-full flex items-center justify-start gap-2 font-semibold my-1">
                                                        <div>Genre:</div>
                                                        <div className="flex flex-wrap items-center justify-start gap-2 font-normal">
                                                            {
                                                                pdt.genre.length === 0 ? <div>Not found!</div> :
                                                                    pdt.genre.map((gen) => {
                                                                        return (
                                                                            <div key={gen} className='px-3 py-1 rounded-md bg-blue-600 text-white'>{gen}</div>
                                                                        )
                                                                    })
                                                            }
                                                        </div>
                                                    </div>

                                                    <div className="w-fit bg-black text-main px-2 py-1 rounded-md mt-2">Product Description:</div>
                                                    <div className="w-full flex flex-wrap items-center justify-start gap-2 gap-y-0.5 mb-2">
                                                        <div className="font-semibold">
                                                            Code: <span className='font-normal text-gray-800'>{pdt.ProductCode},</span>
                                                        </div>
                                                        <div className="font-semibold">
                                                            Color: <span className='font-normal text-gray-800'>{pdt.color},</span>
                                                        </div>
                                                        <div className="font-semibold">
                                                            Sleeve length: <span className='font-normal text-gray-800'>{pdt.SleeveLength},</span>
                                                        </div>
                                                        <div className="font-semibold">
                                                            Fit: <span className='font-normal text-gray-800'>{pdt.Fit},</span>
                                                        </div>
                                                        <div className="font-semibold">
                                                            Neck type: <span className='font-normal text-gray-800'>{pdt.NeckType},</span>
                                                        </div>
                                                        <div className="font-semibold">
                                                            Pattern: <span className='font-normal text-gray-800'>{pdt.Pattern},</span>
                                                        </div>
                                                        <div className="font-semibold">
                                                            Material: <span className='font-normal text-gray-800'>{pdt.Material},</span>
                                                        </div>
                                                        <div className="font-semibold">
                                                            Product GSM: <span className='font-normal text-gray-800'>{pdt.GSM}</span>
                                                        </div>
                                                    </div>
                                                    <div className="w-full text-left font-semibold">
                                                        About the Design: <span className='font-normal text-gray-800'>{pdt.AboutTheDesign}</span>
                                                    </div>
                                                    <div className="w-full text-left font-semibold">
                                                        Country of Origin: <span className='font-normal text-gray-800'>{pdt.CountryOfOrigin}</span>
                                                    </div>
                                                    <div className="w-full text-left font-semibold">
                                                        Care Instructions: <span className='font-normal text-gray-800'>{pdt.CareInstructions}</span>
                                                    </div>

                                                    <div className="w-fit bg-black text-main px-2 py-1 rounded-md mt-2">Available size & Stock details:</div>
                                                    <div className="w-full flex items-center justify-start gap-2 font-semibold my-1">
                                                        <div>Available sizes:</div>
                                                        <div className="flex flex-wrap items-center justify-start gap-2 font-normal">
                                                            {
                                                                pdt.size.length === 0 ? <div>Not found!</div> :
                                                                    pdt.size.map((size) => {
                                                                        return (
                                                                            <div key={size} className='px-3 py-1 rounded-md bg-gray-300 text-black'>{size}</div>
                                                                        )
                                                                    })
                                                            }
                                                        </div>
                                                    </div>
                                                    <div className="w-full flex items-start gap-2 font-semibold my-1">
                                                        <div>Stock details:</div>
                                                        <div className="flex flex-col gap-0.5 font-normal">
                                                            {pdt.size.length === 0 ? (
                                                                <div>Not found!</div>
                                                            ) : (
                                                                pdt.size.map((size) => (
                                                                    <div key={size} className="flex gap-1">
                                                                        <span>{size}:</span>
                                                                        <span className={`font-medium ${pdt.stock[size] > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                                            {pdt.stock[size] || 0}
                                                                        </span>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                            <div className="flex items-center justify-center gap-2 px-6 py-4">
                                                <FiEdit onClick={() => { setIsAdd(true); setIsUpdate(true); updateProduct(pdt._id); setCurrId(pdt._id) }} className='text-xl cursor-pointer text-gray-800' />
                                                <MdOutlineDelete onClick={() => { handleOpen(); setCurrId(pdt._id) }} className='text-2xl text-red-600 cursor-pointer' />
                                            </div>
                                        </div>
                                    )
                                })
                    }
                </div>
            }

            {
                (!loading && !isAdd) && <div className="flex justify-center items-center mt-4">
                    <button
                        className="px-4 py-2 mx-1 bg-gray-300 rounded disabled:opacity-50"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                    >
                        <GrPrevious />
                    </button>
                    <span className="mx-2 text-sm">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        className="px-4 py-2 mx-1 bg-gray-300 rounded disabled:opacity-50"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                    >
                        <GrNext />
                    </button>
                </div>
            }

            <Dialog open={open} handler={handleOpen} className='w-full p-4 bg-white flex flex-col items-center justify-start gap-4'>
                <div className="w-full text-left text-black text-base">Are you sure you want to delete this item? This action cannot be undone.</div>
                <div className="w-full flex items-center justify-start gap-4">
                    <button onClick={handleProductDelete}
                        className='bg-red-600 text-white px-4 py-1.5 rounded-md hover:bg-red-700 transition'>
                        Delete
                    </button>
                    <button onClick={handleOpen} className='bg-gray-600 hover:bg-gray-700 text-white px-4 py-1.5 rounded-md'>
                        Cancel
                    </button>
                </div>
            </Dialog>

        </div>
    );
};

export default ProductManagement;