import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Assessment, AssessmentAnswer, AssessmentStatus } from '../types';
import { mockAssessments } from '../data/mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

interface AssessmentContextType {
  assessments: Assessment[];
  createAssessment: (assessment: Omit<Assessment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Assessment>;
  updateAssessment: (id: string, updates: Partial<Assessment>) => Promise<Assessment>;
  submitAssessment: (id: string) => Promise<Assessment>;
  reviewAssessment: (id: string, reviewerComments: string, reviewerId: string) => Promise<Assessment>;
  validateAssessment: (id: string, ministryComments: string, validatorId: string) => Promise<Assessment>;
  rejectAssessment: (id: string, comments: string) => Promise<Assessment>;
  updateAnswers: (id: string, answers: AssessmentAnswer[]) => Promise<Assessment>;
  getAssessmentById: (id: string) => Assessment | undefined;
  getAssessmentsByHospital: (hospitalId: string) => Assessment[];
  getAssessmentsByStatus: (status: AssessmentStatus) => Assessment[];
  getAssessmentsByRegion: (regionId: string) => Assessment[];
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);

  useEffect(() => {
    const loadAssessments = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/assessments`);
        if (!response.ok) {
          throw new Error('Gagal memuat assessment dari server.');
        }
        const data = await response.json();
        setAssessments(data);
      } catch (error) {
        console.warn('Fallback to mock assessments due to API error:', error);
        setAssessments(mockAssessments);
      }
    };

    loadAssessments();
  }, []);

  const createAssessment = async (assessment: Omit<Assessment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await fetch(`${API_BASE_URL}/api/assessments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assessment),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ message: 'Gagal membuat assessment.' }));
      throw new Error(errorBody.message || 'Gagal membuat assessment.');
    }

    const created = await response.json();
    setAssessments((prev) => [...prev, created]);
    return created;
  };

  const updateAssessment = async (id: string, updates: Partial<Assessment>) => {
    const response = await fetch(`${API_BASE_URL}/api/assessments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ message: 'Gagal memperbarui assessment.' }));
      throw new Error(errorBody.message || 'Gagal memperbarui assessment.');
    }

    const updated = await response.json();
    setAssessments((prev) => prev.map((assessment) => (assessment.id === id ? updated : assessment)));
    return updated;
  };

  const submitAssessment = async (id: string) =>
    updateAssessment(id, {
      status: 'submitted',
      submittedAt: new Date().toISOString(),
    });

  const reviewAssessment = async (id: string, reviewerComments: string, reviewerId: string) =>
    updateAssessment(id, {
      status: 'reviewed',
      reviewerComments,
      reviewedBy: reviewerId,
      reviewedAt: new Date().toISOString(),
    });

  const validateAssessment = async (id: string, ministryComments: string, validatorId: string) =>
    updateAssessment(id, {
      status: 'validated',
      ministryComments,
      validatedBy: validatorId,
      validatedAt: new Date().toISOString(),
    });

  const rejectAssessment = async (id: string, comments: string) =>
    updateAssessment(id, { status: 'rejected', reviewerComments: comments });

  const updateAnswers = async (id: string, answers: AssessmentAnswer[]) => {
    const totalScore = answers.reduce((sum, answer) => sum + answer.score, 0);
    return updateAssessment(id, { answers, totalScore, categoryScores: {} });
  };

  return (
    <AssessmentContext.Provider
      value={{
        assessments,
        createAssessment,
        updateAssessment,
        submitAssessment,
        reviewAssessment,
        validateAssessment,
        rejectAssessment,
        updateAnswers,
        getAssessmentById: (id) => assessments.find((a) => a.id === id),
        getAssessmentsByHospital: (hospitalId) => assessments.filter((a) => a.hospitalId === hospitalId),
        getAssessmentsByStatus: (status) => assessments.filter((a) => a.status === status),
        getAssessmentsByRegion: (regionId) => assessments.filter((a) => a.regionId === regionId),
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessments() {
  const context = useContext(AssessmentContext);
  if (context === undefined) {
    throw new Error('useAssessments must be used within an AssessmentProvider');
  }
  return context;
}
