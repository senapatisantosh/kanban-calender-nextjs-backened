import React, { useState } from 'react';

interface SubjectFormProps {
  title: string;
}

const DAYS_OF_WEEK = [
  { id: 'monday', label: 'Mon' },
  { id: 'tuesday', label: 'Tue' },
  { id: 'wednesday', label: 'Wed' },
  { id: 'thursday', label: 'Thu' },
  { id: 'friday', label: 'Fri' },
];

export default function SubjectForm({ title }: SubjectFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [subjectTitle, setSubjectTitle] = useState('');
  const [numberOfLessons, setNumberOfLessons] = useState(1);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const handleDayToggle = (dayId: string) => {
    setSelectedDays(prev => 
      prev.includes(dayId) 
        ? prev.filter(id => id !== dayId) 
        : [...prev, dayId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      subjectTitle,
      numberOfLessons,
      selectedDays
    });
    // Add submission logic here
    setShowForm(false); // Hide form after submission
  };

  // Card view when form is not shown
  if (!showForm) {
    return (
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setShowForm(true)}
      >
        <div className="flex items-center justify-center py-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
        </div>
      </div>
    );
  }

  // Form view
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
        <button 
          onClick={() => setShowForm(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="subject-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Subject Title
          </label>
          <input
            id="subject-title"
            type="text"
            value={subjectTitle}
            onChange={(e) => setSubjectTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Enter subject title"
            required
          />
        </div>
        
        <div>
          <label htmlFor="number-of-lessons" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Number of Lessons
          </label>
          <input
            id="number-of-lessons"
            type="number"
            min="1"
            value={numberOfLessons}
            onChange={(e) => setNumberOfLessons(parseInt(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>
        
        <div>
          <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Days of Week
          </p>
          <div className="flex space-x-4">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => handleDayToggle(day.id)}
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                    ${selectedDays.includes(day.id) 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}
                  `}
                >
                  {day.label}
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <button 
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add Subject
          </button>
        </div>
      </form>
    </div>
  );
} 