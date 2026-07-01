import { useState, useEffect } from 'react';
import { studentDashboardApi, studentResultApi } from '../../api/studentService';

export function useStudentDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await studentDashboardApi.getDashboardData();
            
            // To respect the rule of not modifying the backend, we fetch the accurate scores 
            // calculated by ResultController to overwrite the raw scores returned by DashboardController
            try {
                const resultsData = await studentResultApi.getResultsList();
                if (resultsData && resultsData.stats && resultsData.results) {
                    result.average_score = resultsData.stats.average_score;
                    result.recent_results = resultsData.results.slice(0, 5); // ResultsList is already sorted by date descending
                }
            } catch (resultsErr) {
                console.error("Impossible de récupérer les résultats détaillés", resultsErr);
            }

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
