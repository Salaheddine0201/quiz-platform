import { useState, useEffect } from 'react';
import { teacherDashboardApi } from '../../api/teacherService';

export function useTeacherDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await teacherDashboardApi.getDashboardData();
            setData(result);
        } catch (err) {
            setError('Erreur lors du chargement du tableau de bord.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    return { data, loading, error, refetch: fetchDashboard };
}