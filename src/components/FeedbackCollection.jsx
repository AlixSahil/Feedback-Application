import { db } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

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

const FeedbackCollection = () => {
    const { currentUser, userRole } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        department: '',
        name: '',
        email: currentUser?.email || '',
        finalComment: '',
        ratings: questions.reduce((acc, q) => {
            acc[q.id] = '';
            return acc;
        }, {})
    });
    const [allfeedbacks, setAllFeedBacks] = useState([]);

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRatingChange = (questionId, value) => {
        setFormData(prev => ({
            ...prev,
            ratings: {
                ...prev.ratings,
                [questionId]: value
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
      
        // Check if department is selected
        if (!formData.department) {
            alert("Please select a department before submitting the feedback.");
            return;
        }

        // Check if user has already submitted feedback
        const existingFeedback = allfeedbacks.find(feedback => feedback.userId === currentUser.uid);
        if (existingFeedback) {
            alert("You have already submitted feedback. Only one feedback per user is allowed.");
            return;
        }

        // Check if all ratings are provided
        const missingRatings = questions.filter(q => !formData.ratings[q.id]);
        if (missingRatings.length > 0) {
            alert("Please provide ratings for all questions.");
            return;
        }

        const newFeedback = {
          name: formData.name,
          email: formData.email,
          department: formData.department,
          finalComment: formData.finalComment,
          ratings: formData.ratings,
          timestamp: new Date(),
          userId: currentUser.uid
        };
      
        try {
          await addDoc(collection(db, "feedbacks"), newFeedback);
          alert("Feedback submitted successfully!");
          await fetchFeedbacks();
          
          setFormData({
            department: '',
            name: '',
            email: currentUser?.email || '',
            finalComment: '',
            ratings: questions.reduce((acc, q) => {
                acc[q.id] = '';
                return acc;
            }, {})
          });
        } catch (error) {
          console.error("Error adding feedback: ", error);
          alert("Failed to submit feedback.");
        }
    };

    const handleDelete = async (feedbackId) => {
        if (window.confirm("Are you sure you want to delete this feedback?")) {
            try {
                await deleteDoc(doc(db, "feedbacks", feedbackId));
                await fetchFeedbacks();
                alert("Feedback deleted successfully!");
            } catch (error) {
                console.error("Error deleting feedback: ", error);
                alert("Failed to delete feedback.");
            }
        }
    };

    const groupFeedBackByType = () => {
        const groupFeedBack = {};
        allfeedbacks.forEach((feedback) => {
            const type = feedback.department;

            if (!groupFeedBack[type]) {
                groupFeedBack[type] = { totalRating: 0, count: 0 };
            }

            // Safely calculate total rating for all questions
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
            className="min-h-screen flex flex-col items-center justify-center"
            style={{
                backgroundImage: 'url("/assets/bg-image.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            {/* Admin Dashboard Button - Top Left */}
            {userRole === 'admin' && (
                <button
                    onClick={() => navigate('/admin')}
                    className="absolute top-4 left-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg 
                    hover:from-blue-700 hover:to-blue-800 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                    transform hover:scale-105 active:scale-95 transition-all duration-300 
                    shadow-lg hover:shadow-xl
                    font-semibold text-sm sm:text-base
                    flex items-center justify-center gap-2
                    group"
                >
                    <svg 
                        className="w-5 h-5 transform group-hover:rotate-12 transition-transform duration-300" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" 
                        />
                    </svg>
                    <span className="transform group-hover:translate-x-1 transition-transform duration-300">
                        Go to Admin Dashboard
                    </span>
                </button>
            )}

            {/* Logout Button - Top Right */}
            <button
                onClick={handleLogout}
                className="absolute top-4 right-4 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg 
                hover:from-red-700 hover:to-red-800 
                focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 
                transform hover:scale-105 active:scale-95 transition-all duration-300 
                shadow-lg hover:shadow-xl
                font-semibold text-sm sm:text-base
                flex items-center justify-center gap-2
                group"
            >
                <svg 
                    className="w-5 h-5 transform group-hover:rotate-12 transition-transform duration-300" 
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
                <span className="transform group-hover:translate-x-1 transition-transform duration-300">
                    Logout
                </span>
            </button>

            <div className="container mx-auto p-2 sm:p-6 flex flex-col gap-4 sm:gap-10 justify-center items-center w-full max-w-6xl mt-16 sm:mt-20">
                {/* Feedback Form */}
                <form
                    onSubmit={handleSubmit}
                    className="p-4 sm:p-6 w-full max-w-4xl bg-white/90 rounded-lg shadow-md flex flex-col items-center gap-3 sm:gap-4 backdrop-blur-sm animate-fade-in"
                >
                    <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-2 sm:mb-4 animate-slide-up tracking-wide">
                        Hindalco Industries Limited, Muri Works
                    </h1>
                    <h2 className="text-xl sm:text-2xl font-semibold text-center text-gray-700 mb-6 sm:mb-8 animate-slide-up animation-delay-100 tracking-wider uppercase">
                        Survey Form
                    </h2>
                    <div className="w-full border-t border-gray-300 my-1 sm:my-2 animate-slide-up animation-delay-200"></div>

                    <select
                        value={formData.department}
                        onChange={handleChange}
                        name="department"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base animate-slide-up animation-delay-300"
                    >
                        <option value="">Select Department</option>
                        <option value="HR">HR</option>
                        <option value="Safety">Safety</option>
                        <option value="CGPP">CGPP</option>
                        <option value="Production">Production</option>
                    </select>
                    <input
                        value={formData.name}
                        onChange={handleChange}
                        type="text"
                        name="name"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base animate-slide-up animation-delay-400"
                        placeholder="Enter your name..."
                    />
                    <div className="w-full rounded-md border-gray-300 shadow-sm text-sm sm:text-base animate-slide-up animation-delay-500">
                        <span className="font-semibold">Email: </span>
                        {currentUser?.email}
                    </div>

                    {/* Questions with Ratings */}
                    {questions.map((question, index) => (
                        <div key={question.id} className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 animate-slide-up"
                             style={{ animationDelay: `${(index + 6) * 100}ms` }}>
                            <p className="text-gray-700 flex-1 text-sm sm:text-base">{question.text}</p>
                            <div className="flex gap-1 sm:gap-2">
                                {[1, 2, 3, 4, 5].map((rating) => (
                                    <button
                                        key={rating}
                                        type="button"
                                        onClick={() => handleRatingChange(question.id, rating)}
                                        className={`
                                            w-8 h-8 sm:w-10 sm:h-10 rounded-md
                                            flex items-center justify-center
                                            transition-all duration-300 ease-in-out
                                            transform hover:scale-110 hover:rotate-3
                                            ${formData.ratings[question.id] === rating
                                                ? 'bg-blue-600 text-white scale-110 shadow-lg ring-2 ring-blue-400'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                                            }
                                            ${formData.ratings[question.id] >= rating
                                                ? 'bg-blue-600 text-white'
                                                : ''
                                            }
                                            hover:z-10 relative
                                            group
                                        `}
                                    >
                                        <span className="transform group-hover:scale-125 transition-transform duration-200">
                                            {rating}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}

                    <textarea
                        value={formData.finalComment}
                        onChange={handleChange}
                        name="finalComment"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base animate-slide-up animation-delay-1100"
                        placeholder="Additional comments..."
                        rows="3"
                    ></textarea>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg 
                        hover:from-blue-700 hover:to-blue-800 
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                        transform hover:scale-105 active:scale-95 transition-all duration-300 
                        shadow-lg hover:shadow-xl
                        font-semibold text-sm sm:text-base
                        flex items-center justify-center gap-2
                        group
                        animate-slide-up animation-delay-1200"
                    >
                        <svg 
                            className="w-5 h-5 transform group-hover:rotate-12 transition-transform duration-300" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24" 
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M5 13l4 4L19 7" 
                            />
                        </svg>
                        <span className="transform group-hover:translate-x-1 transition-transform duration-300">
                            Submit Feedback
                        </span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FeedbackCollection;
