import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { Calendar, Plus, Trash, CalendarPlus, CheckCircle2, AlertCircle } from 'lucide-react';

interface Reminder {
  id: number;
  text: string;
  date: string;
}

const RemindersPage: React.FC = () => {
  const { analysis } = useUser();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newText, setNewText] = useState('');
  const [newDate, setNewDate] = useState('');

  // Load reminders from analysis action plan on mount if available
  useEffect(() => {
    // Only auto-populate if we have no reminders yet and we have an analysis
    if (reminders.length === 0 && analysis?.actionPlan) {
      const planReminders = analysis.actionPlan
        .filter(item => item.deadline && item.deadline.match(/\d{4}-\d{2}-\d{2}/)) // Only items with valid dates roughly
        .map(item => ({
          id: Math.random(),
          text: item.title,
          date: item.deadline
        }));
      
      // If regex match is weak (AI might return "30 Sept"), we might need manual logic or assume user enters manually.
      // But for "Prevent Hardcoding", using the dynamic data is key.
      // Let's just map all of them and let user edit if date is text.
      
      const dynamicReminders = analysis.actionPlan.map((item, index) => ({
        id: Date.now() + index,
        text: item.title,
        date: parseDate(item.deadline) // Attempt to standardize
      }));

      setReminders(dynamicReminders);
    }
  }, [analysis]);

  // Helper to try and make AI dates usable for input[type=date]
  // AI often returns "30 September 2024". Browsers need "2024-09-30".
  const parseDate = (dateStr: string): string => {
    if (!dateStr) return '';
    // If it's already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    
    // Simple attempt to convert or return empty if complex text
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
    return ''; // Return empty so user sees it needs attention but text is preserved in title
  };

  const addReminder = () => {
    if (newText) {
      setReminders([...reminders, { id: Date.now(), text: newText, date: newDate }]);
      setNewText('');
      setNewDate('');
    }
  };

  const deleteReminder = (id: number) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  const addToCalendar = (reminder: Reminder) => {
    if (!reminder.date) {
        alert("Please set a valid date first.");
        return;
    }
    const startDate = new Date(reminder.date);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);

    const formatDate = (date: Date) => date.toISOString().split('T')[0].replace(/-/g, '');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `SUMMARY:${reminder.text}`,
      `DTSTART;VALUE=DATE:${formatDate(startDate)}`,
      `DTEND;VALUE=DATE:${formatDate(endDate)}`,
      'DESCRIPTION:Reminder from CareerPath.AI',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${reminder.text.replace(/[^a-z0-9]/gi, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
         <h1 className="text-3xl font-bold text-gray-900">Deadlines & Reminders</h1>
         {analysis && (
             <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium flex items-center">
                 <CheckCircle2 className="w-3 h-3 mr-1" /> Synced with Action Plan
             </span>
         )}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-2 mb-6">
          <input 
            type="text" 
            placeholder="New Reminder (e.g., Submit ID Copy)" 
            className="flex-grow p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
            value={newText}
            onChange={e => setNewText(e.target.value)}
          />
          <input 
            type="date" 
            className="p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
            value={newDate}
            onChange={e => setNewDate(e.target.value)}
          />
          <button onClick={addReminder} className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {reminders.length === 0 && (
              <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No reminders yet.</p>
                  {!analysis && <p className="text-xs mt-1">Upload your results to auto-generate a plan.</p>}
              </div>
          )}
          
          {reminders.map(r => (
            <div key={r.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex-grow">
                <p className="font-bold text-gray-800 text-sm">{r.text}</p>
                <div className={`flex items-center text-xs mt-1 ${r.date ? 'text-gray-500' : 'text-orange-500'}`}>
                  <Calendar className="w-3 h-3 mr-1" />
                  {r.date || "Set a date"}
                </div>
              </div>
              <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => addToCalendar(r)} 
                  className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="Add to device calendar"
                >
                  <CalendarPlus className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => deleteReminder(r.id)} 
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete reminder"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RemindersPage;
