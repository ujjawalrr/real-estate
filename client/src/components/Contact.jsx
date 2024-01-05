import { useEffect, useState } from 'react';
import { useSelector } from "react-redux";
import { Link } from 'react-router-dom';

const Contact = ({ listing }) => {
    const { currentUser } = useSelector((state) => state.user);
    const [landlord, setLandlord] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const fetchLandlord = async () => {
            try {
                const res = await fetch(`/api/user/${listing.userRef}`);
                const data = await res.json();
                if (data.success === false) {
                    setError(data.message);
                    return;
                }
                setLandlord(data);
            } catch (error) {
                setError(error.message);
            }
        }
        fetchLandlord();
    }, [listing.userRef]);

    const handleContact = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(false);
            const res = await fetch(`/api/user/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message,
                    from: currentUser.email,
                    to: landlord.email,
                    subject: `Regarding ${listing.name}`
                }),
            });
            const data = await res.json();
            setLoading(false);
            if (data.success === false) {
                setError(data.message);
                setTimeout(() => {
                    setError(false);
                }, 2000);
                return;
            }
            setError(data);
            setTimeout(() => {
                setError(false);
            }, 2000);
        } catch (error) {
            setLoading(false);
            setError(error.message);
            setTimeout(() => {
                setError(false);
            }, 4000);
        }
    }

    return (
        <>
            {landlord && (
                <div className='flex flex-col gap-2 mt-2'>
                    <p>Contact <span className='font-semibold'>{landlord.email}</span> for <span className='font-semibold'>{listing.name.toLowerCase()}</span></p>
                    <textarea name="message" id="message" rows="2" value={message} onChange={(e) => setMessage(e.target.value)} placeholder='Enter your message here...' className='w-full border p-3 rounded-lg'></textarea>
                    <button onClick={handleContact} className='p-3 bg-slate-700 text-white text-center rounded-lg uppercase hover:opacity-95'>{loading ? 'Sending...' : 'Send Message'}</button>
                    {error && <p className='text-slate-700 mt-2 w-full text-center'>{error}</p>}
                </div>
            )}
            {!landlord && (
                <p className='text-slate-700 mt-2 w-full text-center'>This landlord is not available at this moment.</p>
            )}
        </>
    )
}

export default Contact
