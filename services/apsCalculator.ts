import { Subject } from '../types';

export const calculateLevel = (mark: number): number => {
  if (mark >= 80) return 7;
  if (mark >= 70) return 6;
  if (mark >= 60) return 5;
  if (mark >= 50) return 4;
  if (mark >= 40) return 3;
  if (mark >= 30) return 2;
  return 1;
};

export const calculateTotalAPS = (subjects: Subject[]): number => {
  // Standard SA University Logic: Sum of best 6 subjects, EXCLUDING Life Orientation.
  
  // Filter out Life Orientation (case insensitive)
  const validSubjects = subjects.filter(
    (s) => s.name.trim().toLowerCase() !== 'life orientation'
  );
  
  // Sort by level descending to get the best subjects
  const sorted = [...validSubjects].sort((a, b) => b.level - a.level);
  
  // Take top 6
  const top6 = sorted.slice(0, 6);
  
  return top6.reduce((sum, sub) => sum + sub.level, 0);
};