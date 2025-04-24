import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import * as XLSX from 'xlsx';
import { getFeedbacks, deleteFeedback } from '../services/api';

const questions = [
    {
        id: 1,
        text: "Does the service department keep up to the services as per agreed plan?",
        category: "Service Adherence"
    },
    {
        id: 2,
        text: "Is it clear who is responsible for your concern in the service dept.?",
        category: "Responsibility Clarity"
    },
    {
        id: 3,
        text: "How satisfied are you with the EOHS aspects of the service dept.?",
        category: "EOHS Satisfaction"
    },
    {
        id: 4,
        text: "How satisfied are you with the overall service quality in principle?",
        category: "Service Quality"
    },
    {
        id: 5,
        text: "Do you feel the service dept. focuses on loss/waste reduction?",
        category: "Waste Reduction"
    }
];

const AdminDashboard = () => {
    const { currentUser, userRole } = useAuth();
    const navigate = useNavigate();
    const [allfeedbacks, setAllFeedBacks] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
            setLoading(true);
            const feedbacks = await getFeedbacks();
            console.log('Fetched feedbacks:', feedbacks); // Debug log
            setAllFeedBacks(feedbacks);
            setError(null);
        } catch (error) {
            console.error("Error fetching feedbacks: ", error);
            setError('Failed to fetch feedbacks');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const handleDelete = async (feedbackId) => {
        if (window.confirm("Are you sure you want to delete this feedback?")) {
            try {
                setLoading(true);
                await deleteFeedback(feedbackId);
                await fetchFeedbacks();
                alert("Feedback deleted successfully!");
            } catch (error) {
                console.error("Error deleting feedback:", error);
                alert("Failed to delete feedback.");
            } finally {
                setLoading(false);
            }
        }
    };

    const groupFeedBackByType = () => {
        const groupFeedBack = {};
        allfeedbacks.forEach((feedback) => {
            const type = feedback.department || 'Unknown';

            if (!groupFeedBack[type]) {
                groupFeedBack[type] = { totalRating: 0, count: 0 };
            }

            let totalRating = 0;
            let questionCount = 0;
            
            if (feedback.ratings) {
                const ratings = typeof feedback.ratings === 'string' ? JSON.parse(feedback.ratings) : feedback.ratings;
                Object.values(ratings).forEach(rating => {
                    if (rating && !isNaN(rating)) {
                        totalRating += Number(rating);
                        questionCount++;
                    }
                });
            }

            if (questionCount > 0) {
                groupFeedBack[type].totalRating += totalRating / questionCount;
                groupFeedBack[type].count++;
            }
        });

        return groupFeedBack;
    };

    const groupFeedBack = groupFeedBackByType();

    const downloadExcel = () => {
        // Prepare data for Excel
        const excelData = allfeedbacks.map(feedback => {
            const row = {
                'Name': feedback.name,
                'Email': feedback.email,
                'Department': feedback.department,
                'Comments': feedback.final_comment
            };

            // Add ratings for each question
            if (feedback.ratings) {
                const ratings = typeof feedback.ratings === 'string' ? JSON.parse(feedback.ratings) : feedback.ratings;
                Object.entries(ratings).forEach(([questionId, rating]) => {
                    const question = questions.find(q => q.id === parseInt(questionId));
                    if (question) {
                        row[`Q${questionId} - ${question.text}`] = rating;
                    }
                });
            }

            return row;
        });

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(excelData);
        
        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Feedbacks");

        // Generate Excel file
        XLSX.writeFile(wb, "feedback_data.xlsx");
    };

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
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-xl sm:text-3xl font-bold text-gray-800">
                            Admin Dashboard
                        </h1>
                        <button
                            onClick={downloadExcel}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg 
                            focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 
                            transform hover:scale-105 active:scale-95 transition-all duration-200 
                            shadow-lg hover:shadow-xl
                            font-semibold text-sm sm:text-base
                            flex items-center justify-center gap-2"
                        >
                            <svg 
                                className="w-5 h-5" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24" 
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" 
                                />
                            </svg>
                            Download Excel
                        </button>
                    </div>
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
                                            <td className="px-4 py-2 text-sm text-gray-900">{feedback.final_comment}</td>
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