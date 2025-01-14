import React, { useState } from 'react';

const ImageUpload = ({ newPdt, setNewPdt }) => {
    const [imagePreview, setImagePreview] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewPdt((prev) => ({ ...prev, thumbnail: file }));

            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className='w-full flex items-start justify-start gap-4'>
            <div className='flex items-center justify-start gap-4'>
                <label htmlFor="imageUpload" className="font-semibold text-lg text-nowrap">
                    Thumbnail:
                </label>
                <input
                    type="file"
                    id="imageUpload"
                    accept="image/*"
                    onChange={handleImageChange}
                    className=""
                />
            </div>
            {imagePreview && (
                <div className="flex flex-col items-start justify-start gap-2">
                    <p className="text-sm font-medium text-gray-700">Preview:</p>
                    <img src={imagePreview} alt="Thumbnail Preview" className="w-[8rem] aspect-auto" />
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
