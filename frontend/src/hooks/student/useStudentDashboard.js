import { useState, useEffect } from 'react';
import { studentDashboardApi } from '../../api/studentService';

export function useStudentDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await studentDashboardApi.getDashboardData();
            setData(result);
        } catch (err) {
            setError('Erreur lors du chargement des données du tableau de bord.');
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
