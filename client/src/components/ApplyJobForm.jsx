import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from '../utils/api';


const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function ApplyJobForm({ jobId, onSuccess, onCancel }) {
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check if the file is a PDF
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError('');
      } else {
        setFile(null);
        setError('Please upload a PDF file');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please upload your CV (PDF format)');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      // Create FormData object to send file
      const formData = new FormData();
      formData.append('cv', file);
      formData.append('job_id', jobId);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      // Use direct axios for file upload
      await axios.post(`${API_BASE_URL}/applications/create`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      // Navigate to user applications page
      navigate('/user/lamaran');
      
    } catch (err) {
      console.error('Error submitting application:', err);
      setError(
        err.response?.data?.message || 
        'Failed to submit application. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Apply for this Position</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Upload your CV (PDF format)
          </label>
          
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          
          {file && (
            <p className="mt-2 text-sm text-green-600">
              Selected: {file.name}
            </p>
          )}
        </div>
        
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isSubmitting || !file}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              isSubmitting || !file 
                ? 'bg-blue-300 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-md border border-gray-300 
                text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ApplyJobForm;