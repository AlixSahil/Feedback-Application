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
            className="min-h-screen flex items-center justify-center"
            style={{
                backgroundImage: 'url("/bg-image.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            <div className="container mx-auto p-6 flex flex-col md:flex-row gap-10 justify-center items-center">
                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                    Logout
                </button>

                {/* Feedback Form */}
                <form
                    onSubmit={handleSubmit}
                    className="p-6 w-full max-w-lg bg-white/90 rounded-lg shadow-lg flex flex-col items-center gap-4 mt-10 backdrop-blur-sm"
                >
                    <h1 className="text-3xl font-bold text-center text-gray-800">
                        Hindalco Industries Limited
                    </h1>
                    <h2 className="text-2xl font-semibold text-center text-gray-700 mb-4">
                        Survey Form
                    </h2>
                    <div className="w-full border-t border-gray-300 my-2"></div>

                    <select
                        value={formData.department}
                        onChange={handleChange}
                        name="department"
                        className="w-full bg-gray-200/90 px-4 py-2 rounded-lg shadow focus:ring focus:ring-blue-500"
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
                        className="w-full bg-gray-200/90 px-4 py-2 rounded-lg shadow focus:ring focus:ring-blue-500"
                        placeholder="Enter your name..."
                    />
                    <div className="w-full bg-gray-200/90 px-4 py-2 rounded-lg shadow">
                        <span className="font-semibold">Email: </span>
                        {currentUser?.email}
                    </div>

                    {/* Questions with Ratings */}
                    <div className="w-full space-y-4">
                        {questions.map((question) => (
                            <div key={question.id} className="flex items-center justify-between gap-4">
                                <p className="font-medium text-gray-700 flex-1">{question.text}</p>
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((rating) => (
                                        <label key={rating} className="flex items-center">
                                            <input
                                                type="radio"
                                                name={`rating-${question.id}`}
                                                value={rating}
                                                checked={formData.ratings[question.id] === rating.toString()}
                                                onChange={() => handleRatingChange(question.id, rating.toString())}
                                                className="form-radio h-4 w-4 text-blue-600"
                                            />
                                            <span className="ml-1">{rating}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Final Comment Box */}
                    <textarea
                        value={formData.finalComment}
                        onChange={handleChange}
                        name="finalComment"
                        rows={4}
                        className="w-full bg-gray-200/90 px-4 py-2 rounded-lg shadow focus:ring focus:ring-blue-500"
                        placeholder="Any additional comments or suggestions..."
                    ></textarea>

                    <button className="w-full bg-gradient-to-r from-blue-600 to-green-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transform hover:scale-105 transition">
                        Submit Feedback
                    </button>
                </form>

                {/* Admin Dashboard Button - Only visible to admin */}
                {userRole === 'admin' && (
                    <div className="w-full md:w-1/3 text-center">
                        <button
                            onClick={() => navigate('/admin')}
                            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Go to Admin Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeedbackCollection;
