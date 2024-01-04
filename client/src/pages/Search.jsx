import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import ListingItem from '../components/ListingItem';

const Search = () => {
    const navigate = useNavigate();
    const [sideBarData, setSideBarData] = useState({
        searchTerm: '',
        type: 'all',
        parking: false,
        furnished: false,
        offer: false,
        sort: 'created_at',
        order: 'desc',
    });

    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [showMore, setShowMore] = useState(false);
    const [showMoreLoading, setShowMoreLoading] = useState(false);
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const searchTermFromUrl = urlParams.get('searchTerm');
        const typeFromUrl = urlParams.get('type');
        const parkingFromUrl = urlParams.get('parking');
        const furnishedFromUrl = urlParams.get('furnished');
        const offerFromUrl = urlParams.get('offer');
        const sortFromUrl = urlParams.get('sort');
        const orderFromUrl = urlParams.get('order');
        if (searchTermFromUrl || typeFromUrl || parkingFromUrl || furnishedFromUrl || offerFromUrl || sortFromUrl || orderFromUrl) {
            setSideBarData({
                searchTerm: searchTermFromUrl || '',
                type: typeFromUrl || 'all',
                parking: parkingFromUrl === 'true' ? true : false,
                furnished: furnishedFromUrl === 'true' ? true : false,
                offer: offerFromUrl === 'true' ? true : false,
                sort: sortFromUrl || 'createdAt',
                order: orderFromUrl || 'desc',
            });
        }

        const fetchListings = async () => {
            setLoading(true);
            setShowMore(false);
            setError(false);
            try {
                const searchQuery = urlParams.toString();
                const res = await fetch(`/api/listing/get?${searchQuery}`);
                const data = await res.json();
                if (data.success === false) {
                    setLoading(false);
                    setError('Please try again later...');
                    return;
                }
                if (data.length > 8) {
                    setShowMore(true);
                } else {
                    setShowMore(false);
                }
                setLoading(false);
                setError(false);
                setListings(data);
            } catch (error) {
                setLoading(false);
                setError('Please try again later...');
            }
        }

        fetchListings();
    }, [location.search]);

    const handleChange = (e) => {
        if (e.target.id === 'all' || e.target.id === 'rent' || e.target.id === 'sale') {
            setSideBarData({ ...sideBarData, type: e.target.id });
        }

        if (e.target.id === 'searchTerm') {
            setSideBarData({ ...sideBarData, searchTerm: e.target.value });
        }

        if (e.target.id === 'parking' || e.target.id === 'offer' || e.target.id === 'furnished') {
            setSideBarData({ ...sideBarData, [e.target.id]: e.target.checked || e.target.checked === 'true' ? true : false });
        }

        if (e.target.id === 'sort_order') {
            const sort = e.target.value.split('_')[0] || 'createdAt';

            const order = e.target.value.split('_')[1] || 'desc';

            setSideBarData({ ...sideBarData, sort, order });
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const urlParams = new URLSearchParams();
        urlParams.set('searchTerm', sideBarData.searchTerm)
        urlParams.set('type', sideBarData.type)
        urlParams.set('parking', sideBarData.parking)
        urlParams.set('furnished', sideBarData.furnished)
        urlParams.set('offer', sideBarData.offer)
        urlParams.set('sort', sideBarData.sort)
        urlParams.set('order', sideBarData.order)
        const searchQuery = urlParams.toString();
        navigate(`/search?${searchQuery}`)
    }

    const onShowMoreClick = async () => {
        setShowMoreLoading(true);
        try {
            const numberOfListings = listings.length;
            const startIndex = numberOfListings;
            const urlParams = new URLSearchParams(location.search);
            urlParams.set('startIndex', startIndex);
            const searchQuery = urlParams.toString();
            const res = await fetch(`/api/listing/get?${searchQuery}`);
            const data = await res.json();
            if (data.success === false) {
                setShowMoreLoading(false);
                setError('Please try again later...');
                return;
            }
            if (data.length === 0) {
                setError('No more listings found!');
            }
            if (data.length < 9) {
                setShowMore(false);
            }
            setShowMoreLoading(false);
            setError(false);
            setListings([...listings, ...data]);
        } catch (error) {
            setShowMoreLoading(false);
            setError('Please try again later...');
        }
    }

    return (
        <div className='flex flex-col md:flex-row'>
            <div className="p-7 border-b-2 md:border-r-2 md:min-h-screen">
                <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                    <div className="flex items-center gap-2">
                        <label htmlFor="searchTerm" className='whitespace-nowrap font-semibold'>Search Term:</label>
                        <input type="text" id='searchTerm' name='searchTerm' placeholder='Search...' className='border rounded-lg w-full p-3' value={sideBarData.searchTerm} onChange={handleChange} />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <label className='font-semibold'>Type:</label>
                        <div className="flex gap-2">
                            <input type="checkbox" id='all' name='all' className='w-5' onChange={handleChange} checked={sideBarData.type === 'all'} />
                            <label htmlFor="all">Rent & Sale</label>
                        </div>
                        <div className="flex gap-2">
                            <input type="checkbox" id='rent' name='rent' className='w-5' onChange={handleChange} checked={sideBarData.type === 'rent'} />
                            <label htmlFor="rent">Rent</label>
                        </div>
                        <div className="flex gap-2">
                            <input type="checkbox" id='sale' name='sale' className='w-5' onChange={handleChange} checked={sideBarData.type === 'sale'} />
                            <label htmlFor="sale">Sale</label>
                        </div>
                        <div className="flex gap-2">
                            <input type="checkbox" id='offer' name='offer' className='w-5' onChange={handleChange} checked={sideBarData.offer} />
                            <label htmlFor="offer">Offer</label>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <label className='font-semibold'>Amenities:</label>
                        <div className="flex gap-2">
                            <input type="checkbox" id='parking' name='parking' className='w-5' onChange={handleChange} checked={sideBarData.parking} />
                            <label htmlFor="parking">Parking</label>
                        </div>
                        <div className="flex gap-2">
                            <input type="checkbox" id='furnished' name='furnished' className='w-5' onChange={handleChange} checked={sideBarData.furnished} />
                            <label htmlFor="furnished">Furnished</label>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <label htmlFor="sort_order" className='font-semibold'>
                            Sort:
                        </label>
                        <select onChange={handleChange} defaultValue={'createdAt_desc'} id="sort_order" className='border rounded-lg p-3'>
                            <option value="regularPrice_desc">Price high to low</option>
                            <option value="regularPrice_asc">Price low to high</option>
                            <option value="createdAt_desc">Latest</option>
                            <option value="createdAt_asc">Oldest</option>
                        </select>
                    </div>
                    <button className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95'>
                        Search
                    </button>
                </form>
            </div>
            <div className="flex-1">
                <h1 className='text-3xl font-semibold border-b p-3 text-slate-700 mt-5'>Listing Results:</h1>
                <div className="p-7 flex flex-wrap gap-4">
                    {!loading && !error && listings.length === 0 && (
                        <p className='text-xl text-slate-700 text-center w-full'>No listing found!</p>
                    )}
                    {loading && (
                        <p className='text-xl text-slate-700 text-center w-full'>Searching...</p>
                    )}
                    {!loading && listings && listings.map((listing) => <ListingItem key={listing._id} listing={listing} />)}
                    {showMore && (
                        <button onClick={onShowMoreClick} className='text-green-700 p-7 text-center w-full hover:underline'>Show More</button>
                    )}
                    {showMoreLoading && (
                        <p className='text-xl text-slate-700 text-center w-full'>Searching...</p>
                    )}
                    {error && (
                        <p className='text-xl text-red-700 text-center w-full'>{error}</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Search
