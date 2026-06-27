import { useState, useEffect } from 'react';
import { studentResultApi } from '../../api/studentService';

export function useStudentResults() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchResults = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await studentResultApi.getResultsList();
            console.log("=== APPEL API /student/results ===");
            console.log("Résultat reçu depuis le service :", result);
            setData(result);
        } catch (err) {
            setError('Erreur lors du chargement de l\'historique des résultats.');
            console.error("Erreur API /student/results :", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResults();
    }, []);

    return { data, loading, error, refetch: fetchResults };
}
