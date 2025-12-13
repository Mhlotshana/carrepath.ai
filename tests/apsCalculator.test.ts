import { describe, it, expect } from 'vitest';
import { calculateLevel, calculateTotalAPS } from '../services/apsCalculator';
import { Subject } from '../types';

describe('APS Calculator', () => {

    it('should correctly calculate levels from marks', () => {
        expect(calculateLevel(85)).toBe(7);
        expect(calculateLevel(70)).toBe(6);
        expect(calculateLevel(65)).toBe(5);
        expect(calculateLevel(50)).toBe(4);
        expect(calculateLevel(40)).toBe(3);
        expect(calculateLevel(33)).toBe(2);
        expect(calculateLevel(20)).toBe(1);
    });

    it('should calculate total APS using best 6 subjects excluding Life Orientation', () => {
        const subjects: Subject[] = [
            { name: 'Life Orientation', mark: 80, level: 7 }, // Should be excluded
            { name: 'Mathematics', mark: 80, level: 7 },      // Counted (1)
            { name: 'Physical Science', mark: 70, level: 6 }, // Counted (2)
            { name: 'English', mark: 60, level: 5 },          // Counted (3)
            { name: 'History', mark: 50, level: 4 },          // Counted (4)
            { name: 'Geography', mark: 50, level: 4 },        // Counted (5)
            { name: 'Accounting', mark: 40, level: 3 },       // Counted (6)
            { name: 'Art', mark: 30, level: 2 }               // Ignore (lowest)
        ];

        // Sum: 7+6+5+4+4+3 = 29
        expect(calculateTotalAPS(subjects)).toBe(29);
    });

    it('should handle exactly 6 subjects (excluding LO)', () => {
        const subjects: Subject[] = [
            { name: 'Life Orientation', mark: 50, level: 4 }, // Exclude
            { name: 'S1', mark: 50, level: 4 },
            { name: 'S2', mark: 50, level: 4 },
            { name: 'S3', mark: 50, level: 4 },
            { name: 'S4', mark: 50, level: 4 },
            { name: 'S5', mark: 50, level: 4 },
            { name: 'S6', mark: 50, level: 4 },
        ];
        // Sum: 4*6 = 24
        expect(calculateTotalAPS(subjects)).toBe(24);
    });

    it('should handle case insensitivity for Life Orientation', () => {
        const subjects: Subject[] = [
            { name: 'life orientation', mark: 90, level: 7 }, // Exclude
            { name: 'Maths', mark: 50, level: 4 },
            { name: 'S2', mark: 50, level: 4 },
            { name: 'S3', mark: 50, level: 4 },
            { name: 'S4', mark: 50, level: 4 },
            { name: 'S5', mark: 50, level: 4 },
            { name: 'S6', mark: 50, level: 4 },
        ];
        expect(calculateTotalAPS(subjects)).toBe(24);
    });
});
