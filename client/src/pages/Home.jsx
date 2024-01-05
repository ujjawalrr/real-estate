import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore from 'swiper';
import { Navigation } from 'swiper/modules';
import 'swiper/css/bundle';
import ListingItem from '../components/ListingItem';

const Home = () => {
  SwiperCore.use([Navigation]);
  const [offerListings, setOfferListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);
  useEffect(() => {
    const fetchOfferListings = async () => {
      try {
        const res = await fetch(`/api/listing/get?offer=true&limit=4`);
        const data = await res.json();
        setOfferListings(data);
        fetchRentListings();
      } catch (error) {
        console.log(error);
      }
    }
    const fetchRentListings = async () => {
      try {
        const res = await fetch(`/api/listing/get?type=rent&limit=4`);
        const data = await res.json();
        setRentListings(data);
        fetchSaleListings();
      } catch (error) {
        console.log(error);
      }
    }
    const fetchSaleListings = async () => {
      try {
        const res = await fetch(`/api/listing/get?type=sale&limit=4`);
        const data = await res.json();
        setSaleListings(data);
      } catch (error) {
        console.log(error);
      }
    }
    fetchOfferListings();
  }, [])

  return (
    <main>
      <div className="flex flex-col gap-6 py-28 px-3 max-w-6xl mx-auto">
        <h1 className='text-slate-700 font-bold text-3xl lg:text-6xl'>
          <p>Find your next <span className='text-slate-500'>perfect</span></p>
          <p>place with ease</p>
        </h1>
        <p className='text-gray-700 text-xs sm:text-sm'>Digital Estate is the best place to find your next perfect place to live.</p>
        <p className='text-gray-700 text-xs sm:text-sm'>We have a wide range of properties for you to choose from.</p>
        <Link className='text-blue-800 font-bold text-xs sm:text-sm hover:underline' to={'/search'}>Let's get started...</Link>
      </div>

      <Swiper navigation>
        {offerListings && offerListings.length > 0 && offerListings.map((listing) => (
          <SwiperSlide key={listing._id}>
            <div className="h-[500px]" style={{ background: `url(${listing.imageUrls[0]}) center no-repeat`, backgroundSize: 'cover' }}></div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className='flex justify-center md:px-20 lg:px-40 xl:px-10 max-w-[1600px]'>
        <div className="flex flex-col gap-8 my-10 p-3">
          {offerListings && offerListings.length > 0 && (
            <div>
              <div className="my-3">
                <h2 className='text-2xl font-semibold text-slate-600'>Recent offers</h2>
                <Link className='text-blue-800 font-bold text-sm hover:underline' to={'/search?offer=true'}>Show more offers</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-8">
                {offerListings.map((listing) => <ListingItem key={listing._id} listing={listing} />)}
              </div>
            </div>
          )}
          {rentListings && rentListings.length > 0 && (
            <div>
              <div className="my-3">
                <h2 className='text-2xl font-semibold text-slate-600'>Recent places for rent</h2>
                <Link className='text-blue-800 font-bold text-sm hover:underline' to={'/search?type=rent'}>Show more places for rent</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-8">
                {rentListings.map((listing) => <ListingItem key={listing._id} listing={listing} />)}
              </div>
            </div>
          )}
          {saleListings && saleListings.length > 0 && (
            <div>
              <div className="my-3">
                <h2 className='text-2xl font-semibold text-slate-600'>Recent places for sale</h2>
                <Link className='text-blue-800 font-bold text-sm hover:underline' to={'/search?type=sale'}>Show more places for sale</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-8">
                {saleListings.map((listing) => <ListingItem key={listing._id} listing={listing} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default Home
