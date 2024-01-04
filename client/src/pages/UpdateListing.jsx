import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { useEffect, useState } from "react";
import { app } from "../firebase";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

const UpdateListing = () => {
    const { currentUser } = useSelector((state) => state.user);
    const navigate = useNavigate();
    const params = useParams();
    const [files, setFiles] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: '',
        regularPrice: 0,
        discountPrice: 0,
        bedrooms: 1,
        bathrooms: 1,
        parking: false,
        furnished: false,
        offer: false,
        type: "rent",
        imageUrls: [],
    });
    const [imageUploadErrror, setImageUploadErrror] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchListing = async () => {
            const listingId = params.listingId;
            try {
                const res = await fetch(`/api/listing/get/${listingId}`);
                const data = await res.json();
                if (data.success === false) {
                    console.log(data.message)
                    return;
                }
                setFormData(data);
            } catch (error) {
                console.log(error.message)
            }
        }
        fetchListing();
    }, [params.listingId]);

    const handleImageSubmit = (e) => {
        if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
            setUploading(true);
            setImageUploadErrror(false);
            const promises = [];

            for (let i = 0; i < files.length; i++) {
                promises.push(storeImage(files[i]));
            };
            Promise.all(promises).then((urls) => {
                setFormData({ ...formData, imageUrls: formData.imageUrls.concat(urls) });
                setImageUploadErrror(false);
                setUploading(false);
            }).catch((err) => {
                setImageUploadErrror('Image upload failed (2 mb max per image)');
                setUploading(false);
            })
        } else {
            setImageUploadErrror('You can only upload 6 images per listing');
            setUploading(false);
        }
    };

    const storeImage = async (file) => {
        return new Promise((resolve, reject) => {
            const storage = getStorage(app);
            const fileName = new Date().getTime() + file.name;
            const storageRef = ref(storage, fileName);
            const uploadTask = uploadBytesResumable(storageRef, file);
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`Upload is ${progress}% done`)
                },
                (error) => {
                    reject(error);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        resolve(downloadURL);
                    })
                }
            )
        })
    };

    const handleRemoveImage = (index) => {
        setFormData({
            ...formData, imageUrls: formData.imageUrls.filter((_, i) => i !== index),
        });
    };

    const handleChange = (e) => {
        if (e.target.name === 'sale' || e.target.name === 'rent') {
            setFormData({
                ...formData, type: e.target.name,
            })
        }
        if (e.target.name === 'furnished' || e.target.name === 'parking' || e.target.name === 'offer') {
            setFormData({
                ...formData, [e.target.name]: e.target.checked,
            })
        }
        if (e.target.type === 'number' || e.target.type === 'text' || e.target.type === 'textarea') {
            setFormData({
                ...formData, [e.target.name]: e.target.value,
            })
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.imageUrls.length < 1) return setError('You must upload at least one image')
            if (+formData.regularPrice < +formData.discountPrice) return setError('Discount price must be lower than regular price')
            setLoading(true);
            setError(false);
            const res = await fetch(`/api/listing/update/${params.listingId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData, userRef: currentUser._id,
                }),
            });
            const data = await res.json();
            setLoading(false);
            if (data.success === false) {
                setError(data.message);
                return;
            }
            navigate(`/listing/${data._id}`);
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    }

    return (
        <main className='p-3 max-w-4xl mx-auto'>
            <h1 className='text-3xl font-semibold text-center my-7'>
                Update a Listing
            </h1>
            <form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-4'>
                <div className="flex flex-col flex-1 gap-4">
                    <input onChange={handleChange} value={formData.name} type="text" placeholder='Name' className='border p-3 rounded-lg' id="name" name="name" required />
                    <textarea onChange={handleChange} value={formData.description} type="text" placeholder='Description' className='border p-3 rounded-lg' id="description" name="description" required />
                    <input onChange={handleChange} value={formData.address} type="text" placeholder='Address' className='border p-3 rounded-lg' id="address" name="address" required />

                    <div className="flex gap-6 flex-wrap">
                        <div className="flex gap-2">
                            <input onChange={handleChange} checked={formData.type === 'sale'} type="checkbox" name="sale" id="sale" className='w-5' />
                            <label htmlFor="sale">Sale</label>
                        </div>
                        <div className="flex gap-2">
                            <input onChange={handleChange} checked={formData.type === 'rent'} type="checkbox" name="rent" id="rent" className='w-5' />
                            <label htmlFor="rent">Rent</label>
                        </div>
                        <div className="flex gap-2">
                            <input onChange={handleChange} checked={formData.parking} type="checkbox" name="parking" id="parking" className='w-5' />
                            <label htmlFor="parking">Parking Spot</label>
                        </div>
                        <div className="flex gap-2">
                            <input onChange={handleChange} checked={formData.furnished} type="checkbox" name="furnished" id="furnished" className='w-5' />
                            <label htmlFor="furnished">Furnished</label>
                        </div>
                        <div className="flex gap-2">
                            <input onChange={handleChange} checked={formData.offer} type="checkbox" name="offer" id="offer" className='w-5' />
                            <label htmlFor="offer">Offer</label>
                        </div>
                    </div>
                    <div className="flex gap-6 flex-wrap">
                        <div className="flex items-center gap-2">
                            <input onChange={handleChange} value={formData.bedrooms} type="number" id='bedrooms' name='bedrooms' min='1' max='10' required className='border border-gray-300 p-3 rounded-lg' />
                            <label htmlFor='bedrooms'>Beds</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input onChange={handleChange} value={formData.bathrooms} type="number" id='bathrooms' name='bathrooms' min='1' max='10' required className='border border-gray-300 p-3 rounded-lg' />
                            <label htmlFor='bathrooms'>Baths</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input onChange={handleChange} value={formData.regularPrice} type="number" id='regularPrice' name='regularPrice' required className='border border-gray-300 p-3 rounded-lg' />
                            <label htmlFor='regularPrice' className='flex flex-col items-center'>
                                <p>Regular Price</p>
                                <span className='text-xs'>(₹ / month)</span>
                            </label>
                        </div>
                        {formData.offer && (
                            <div className="flex items-center gap-2">
                                <input onChange={handleChange} value={formData.discountPrice} type="number" id='discountPrice' name='discountPrice' required className='border border-gray-300 p-3 rounded-lg' />
                                <label htmlFor='discountPrice' className='flex flex-col items-center'>
                                    <p>Discounted Price</p>
                                    <span className='text-xs'>(₹ / month)</span>
                                </label>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex flex-col flex-1 gap-4">
                    <p className='font-semibold'>
                        Images:
                        <span className='font-normal text-gray-600 ml-2'>The first image will be the cover (max6)</span>
                    </p>
                    <div className='flex gap-4'>
                        <input onChange={(e) => setFiles(e.target.files)} className='p-3 border border-gray-300 rounded w-full' type="file" name="images" id="images" accept='image/*' multiple />
                        <button type="button" disabled={uploading} onClick={handleImageSubmit} className='p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80'>
                            {uploading ? 'Uploading...' : 'Upload'}
                        </button>
                    </div>
                    <p className="text-red-700 text-sm text-center">
                        {imageUploadErrror && imageUploadErrror}
                    </p>
                    {
                        formData.imageUrls.length > 0 && formData.imageUrls.map((url, index) => (
                            <div key={url} className="flex justify-between p-3 border items-center">
                                <img src={url} alt="listing image" className="w-20 h-20 object-contain rounded-lg" />
                                <button type="button" onClick={() => handleRemoveImage(index)} className="p-3 text-red-700 rounded-lg uppercase hover:opacity-95">Delete</button>
                            </div>
                        ))
                    }
                    <button disabled={loading || uploading} className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80'>
                        {loading ? 'Updating...' : 'Update Listing'}
                    </button>
                    <p className="text-red-700 text-sm text-center">{error ? error : ''}</p>
                </div>
            </form>
        </main>
    )
}

export default UpdateListing
