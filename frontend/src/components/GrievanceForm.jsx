import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, CheckCircle2, MapPin } from 'lucide-react';

const GrievanceForm = () => {
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        ward: '',
        description: ''
    });
    const [location, setLocation] = useState(null);
    const [images, setImages] = useState([]);
    const [success, setSuccess] = useState(false);
    const [trackingInfo, setTrackingInfo] = useState('');
    const [locError, setLocError] = useState('');

    const handleGetLocation = () => {
        setLocError('');
        if (!navigator.geolocation) {
           setLocError('Geolocation is not supported by your browser.');
           return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
            },
            (error) => {
                setLocError('Unable to retrieve your location.');
            }
        );
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 3) {
            alert('You can only upload up to 3 images.');
            return;
        }
        setImages(files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (location) data.append('location', JSON.stringify(location));
        images.forEach(img => data.append('images', img));

        try {
            const res = await axios.post('http://localhost:5000/api/grievances', data, { headers });
            setTrackingInfo(res.data.trackingId);
            setSuccess(true);
        } catch (err) {
            console.error(err);
            alert('Failed to submit grievance. Make sure you are logged in.');
        }
    };

    if (success) {
        return (
            <div className="max-w-2xl mx-auto mt-16 p-8 text-center bg-white rounded-2xl shadow-sm border border-slate-200">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Issue Reported Successfully</h2>
                <p className="text-slate-600 mb-6">Your tracking ID is <strong>{trackingInfo}</strong>. You will receive an email shortly.</p>
                <button onClick={() => { setSuccess(false); setImages([]); setLocation(null); setFormData({title:'',category:'',ward:'',description:''}); }} className="px-6 py-2 bg-emerald-50 text-emerald-700 font-medium rounded-xl hover:bg-emerald-100">
                    Report Another
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto w-full p-4 md:p-8">
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                <h2 className="text-2xl font-bold text-slate-900 mb-1">File a Grievance</h2>
                <p className="text-slate-500 mb-8">Please provide details about the issue.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                            <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition" placeholder="e.g. Broken Streetlight" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                            <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition" required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                <option value="">Select a category</option>
                                <option value="Electricity">Electricity</option>
                                <option value="Sanitation">Sanitation</option>
                                <option value="Road/Pothole">Road/Pothole</option>
                                <option value="Water Supply">Water Supply</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                            <div className="flex gap-2">
                                <button type="button" onClick={handleGetLocation} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none hover:bg-slate-100 transition flex items-center justify-center gap-2 text-sm text-slate-600 font-medium">
                                    <MapPin className="w-4 h-4" /> 
                                    {location ? `Lat: ${location.lat.toFixed(2)}, Lng: ${location.lng.toFixed(2)}` : 'Get Current Location'}
                                </button>
                            </div>
                            {locError && <p className="text-red-500 text-xs mt-1">{locError}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Ward Number</label>
                            <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition" placeholder="e.g. Ward 45" value={formData.ward} onChange={e => setFormData({ ...formData, ward: e.target.value })} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                        <textarea className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition min-h-[120px]" placeholder="Provide more details..." required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Photo Evidence (Up to 3 images)</label>
                        <label className="border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition group">
                            <UploadCloud className="w-10 h-10 text-slate-400 group-hover:text-emerald-500 mb-3 transition" />
                            <span className="text-sm font-medium text-slate-600">Click to upload images</span>
                            <span className="text-xs text-slate-400 mt-1">JPEG, PNG up to 5MB total</span>
                            <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageChange} />
                        </label>
                        {images.length > 0 && <p className="text-sm text-emerald-600 mt-2 font-medium">{images.length} file(s) selected</p>}
                    </div>

                    <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-4 rounded-xl shadow-sm transition-colors">
                        Submit Issue
                    </button>
                </form>
            </div>
        </div>
    );
};

export default GrievanceForm;
