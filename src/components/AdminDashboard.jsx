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
            className="min-h-screen"
            style={{
                backgroundImage: 'url("/bg-image.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            <div className="container mx-auto bg-gradient-to-br from-gray-100 to-gray-200 shadow-xl rounded-lg mt-10 p-6">
                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                    Logout
                </button>

                {/* Admin Dashboard Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl font-bold capitalize bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
                        Admin Dashboard
                    </h1>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100"
                    >
                        Back to Feedback Form
                    </button>
                </div>

                {/* Statistics Section */}
                <div className="bg-indigo-600 p-6 rounded-lg shadow-lg text-white mb-6">
                    <h2 className="text-3xl font-bold mb-4">
                        Total Feedbacks: {allfeedbacks.length}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {Object.keys(groupFeedBack).length > 0
                            ? Object.keys(groupFeedBack).map((type) => {
                                  const averageRating = groupFeedBack[type].count > 0
                                      ? groupFeedBack[type].totalRating / groupFeedBack[type].count
                                      : 0;
                                  return (
                                      <div
                                          key={type}
                                          className="p-4 bg-white rounded-lg text-indigo-800 shadow-lg"
                                      >
                                          <h3 className="text-xl font-semibold">
                                              {type}
                                          </h3>
                                          <p>
                                              <span className="font-bold">
                                                  Avg Rating:
                                              </span>{' '}
                                              {averageRating.toFixed(1)}
                                          </p>
                                          <p>
                                              <span className="font-bold">
                                                  Total Feedbacks:
                                              </span>{' '}
                                              {Math.floor(groupFeedBack[type].count / questions.length)}
                                          </p>
                                      </div>
                                  );
                              })
                            : <div className="col-span-3 text-center">No feedbacks yet</div>}
                    </div>
                </div>

                {/* All Feedbacks Section */}
                <div className="space-y-4">
                    {allfeedbacks?.map((feedback, index) => (
                        <div
                            key={index}
                            className="p-4 bg-white rounded-lg text-indigo-800 shadow-lg"
                        >
                            <div>
                                <h4>
                                    <span className="font-bold">Name:</span>{' '}
                                    {feedback.name}
                                </h4>
                                <h4>
                                    <span className="font-bold">Email:</span>{' '}
                                    {feedback.email}
                                </h4>
                                <h4>
                                    <span className="font-bold">Department:</span>{' '}
                                    {feedback.department}
                                </h4>
                                <div className="mt-2">
                                    {questions.map((q) => (
                                        <h4 key={q.id}>
                                            <span className="font-bold">{q.category}:</span>{' '}
                                            {feedback.ratings && feedback.ratings[q.id] 
                                                ? `${feedback.ratings[q.id]} / 5`
                                                : 'Not rated'}
                                        </h4>
                                    ))}
                                </div>
                                <h4 className="mt-2">
                                    <span className="font-bold">Final Comment:</span>{' '}
                                    {feedback.finalComment || 'No comment provided'}
                                </h4>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard; 