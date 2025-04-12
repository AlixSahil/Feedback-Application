import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const questions = [
    {
        id: 1,
        text: "How satisfied are you with the response time of the department?",
        category: "Response Time"
    },
    {
        id: 2,
        text: "How would you rate the quality of service provided?",
        category: "Service Quality"
    },
    {
        id: 3,
        text: "How effective was the communication with the department?",
        category: "Communication"
    },
    {
        id: 4,
        text: "How well did the department understand your needs?",
        category: "Understanding"
    }
];

const AdminDashboard = () => {
    const { currentUser, userRole } = useAuth();
    const navigate = useNavigate();
    const [allfeedbacks, setAllFeedBacks] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('');

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const fetchFeedbacks = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "feedbacks"));
            const feedbacks = [];
            querySnapshot.forEach((doc) => {
                feedbacks.push({ id: doc.id, ...doc.data() });
            });
            setAllFeedBacks(feedbacks);
        } catch (error) {
            console.error("Error fetching feedbacks: ", error);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const groupFeedBackByType = () => {
        const groupFeedBack = {};
        allfeedbacks.forEach((feedback) => {
            const type = feedback.department;

            if (!groupFeedBack[type]) {
                groupFeedBack[type] = { totalRating: 0, count: 0 };
            }

            let totalRating = 0;
            let questionCount = 0;
            
            if (feedback.ratings) {
                Object.values(feedback.ratings).forEach(rating => {
                    if (rating && !isNaN(rating)) {
                        totalRating += Number(rating);
                        questionCount++;
                    }
                });
            }

            groupFeedBack[type].totalRating += totalRating;
            groupFeedBack[type].count += questionCount;
        });
        return groupFeedBack;
    };

    const groupFeedBack = groupFeedBackByType();

    return (
        <div 
            className="min-h-screen flex items-center justify-center"
            style={{
                backgroundImage: 'url("/assets/bg-image.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            {/* Back Button - Top Left */}
            <button
                onClick={() => navigate('/')}
                className="absolute top-4 left-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg 
                hover:from-blue-700 hover:to-blue-800 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                transform hover:scale-105 active:scale-95 transition-all duration-200 
                shadow-lg hover:shadow-xl
                font-semibold text-sm sm:text-base
                flex items-center justify-center gap-2
                group"
            >
                <svg 
                    className="w-5 h-5 transform group-hover:rotate-12 transition-transform duration-200" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                    />
                </svg>
                Back to Feedback Form
            </button>

            {/* Logout Button - Top Right */}
            <button
                onClick={handleLogout}
                className="absolute top-4 right-4 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg 
                hover:from-red-700 hover:to-red-800 
                focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 
                transform hover:scale-105 active:scale-95 transition-all duration-200 
                shadow-lg hover:shadow-xl
                font-semibold text-sm sm:text-base
                flex items-center justify-center gap-2
                group"
            >
                <svg 
                    className="w-5 h-5 transform group-hover:rotate-12 transition-transform duration-200" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                    />
                </svg>
                Logout
            </button>

            <div className="container mx-auto p-2 sm:p-6 flex flex-col gap-4 sm:gap-6 justify-center items-center w-full max-w-6xl mt-16 sm:mt-20">
                <div className="w-full bg-white/90 rounded-lg shadow-md p-4 sm:p-6 backdrop-blur-sm">
                    <h1 className="text-xl sm:text-3xl font-bold text-center text-gray-800 mb-4">
                        Admin Dashboard
                    </h1>
                    <div className="w-full border-t border-gray-300 my-2"></div>

                    {/* Department Filter */}
                    <div className="mb-4">
                        <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                            Filter by Department:
                        </label>
                        <select
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                        >
                            <option value="">All Departments</option>
                            <option value="HR">HR</option>
                            <option value="Safety">Safety</option>
                            <option value="CGPP">CGPP</option>
                            <option value="Production">Production</option>
                        </select>
                    </div>

                    {/* Department Statistics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {Object.entries(groupFeedBack).map(([type, data]) => (
                            <div key={type} className="bg-white rounded-lg shadow p-4 border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800">{type}</h3>
                                <p className="text-2xl font-bold text-blue-600">
                                    {data.count > 0 ? (data.totalRating / data.count).toFixed(2) : '0.00'}
                                </p>
                                <p className="text-sm text-gray-600">Average Rating</p>
                            </div>
                        ))}
                    </div>

                    {/* Feedback List */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                                        Department
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                                        Ratings
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                                        Comments
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {allfeedbacks
                                    .filter(feedback => !selectedDepartment || feedback.department === selectedDepartment)
                                    .map((feedback) => (
                                        <tr key={feedback.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 text-sm text-gray-900">{feedback.name}</td>
                                            <td className="px-4 py-2 text-sm text-gray-900">{feedback.email}</td>
                                            <td className="px-4 py-2 text-sm text-gray-900">{feedback.department}</td>
                                            <td className="px-4 py-2 text-sm text-gray-900">
                                                {Object.entries(feedback.ratings).map(([questionId, rating]) => (
                                                    <div key={questionId} className="flex items-center gap-1">
                                                        <span className="text-gray-600">
                                                            Q{questionId}:
                                                        </span>
                                                        <span className="font-medium text-blue-600">
                                                            {rating}
                                                        </span>
                                                    </div>
                                                ))}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-900">{feedback.finalComment}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard; 