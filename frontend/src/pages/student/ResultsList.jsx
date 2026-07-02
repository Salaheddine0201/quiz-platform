import React, { useState, useRef, useEffect } from 'react';
import { useStudentResults } from '../../hooks/student/useStudentResults';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, TrendingUp, CheckCircle2, Award, XCircle, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import ResultDetailsDrawer from '@/components/student/ResultDetailsDrawer';

export default function ResultsList() {
    const { data, loading, error } = useStudentResults();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'completed_at', direction: 'desc' });
    const [selectedResultId, setSelectedResultId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        console.log("=== COMPONENT MOUNTED : ResultsList ===");
    }, []);

    console.log("ResultsList render - data:", data, "loading:", loading, "error:", error);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(dateString));
    };

    const getSubject = (title) => {
        if (!title) return 'Divers';
        // Essayer le tiret long (em dash) ou court
        const parts = title.split(/—|-/);
        if (parts.length > 0) {
            return parts[0].trim();
        }
        return title;
    };

    if (loading) {
        return <LoadingSkeleton />;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 animate-in fade-in">
                <div className="p-4 bg-destructive/10 rounded-full">
                    <XCircle className="w-10 h-10 text-destructive" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Une erreur est survenue</h2>
                <p className="text-muted-foreground max-w-md text-center">{error}</p>
                <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                    Réessayer
                </button>
            </div>
        );
    }

    const stats = data?.stats || { average_score: 0, passed_count: 0, total_count: 0, failed_count: 0 };
    const results = data?.results || [];



    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) {
            return <ArrowUpDown className="w-4 h-4 ml-1 opacity-20 group-hover:opacity-100 transition-opacity inline" />;
        }
        return sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4 ml-1 text-primary inline" /> : <ArrowDown className="w-4 h-4 ml-1 text-primary inline" />;
    };

    const filteredAndSortedResults = results
        .filter(r => {
            if (!searchTerm) return true;
            return r.quiz_title.toLowerCase().includes(searchTerm.toLowerCase());
        })
        .sort((a, b) => {
            const { key, direction } = sortConfig;
            let valA, valB;
            
            if (key === 'subject') {
                valA = getSubject(a.quiz_title).toLowerCase();
                valB = getSubject(b.quiz_title).toLowerCase();
            } else if (key === 'completed_at') {
                valA = new Date(a.completed_at).getTime();
                valB = new Date(b.completed_at).getTime();
            } else if (key === 'score_on_20') {
                valA = parseFloat(a.score_on_20 ?? a.score) || 0;
                valB = parseFloat(b.score_on_20 ?? b.score) || 0;
            } else if (key === 'result') {
                valA = (parseFloat(a.score_on_20 ?? a.score) || 0) >= 10 ? 1 : 0;
                valB = (parseFloat(b.score_on_20 ?? b.score) || 0) >= 10 ? 1 : 0;
            } else {
                valA = (a[key] || '').toLowerCase();
                valB = (b[key] || '').toLowerCase();
            }
            
            if (valA < valB) return direction === 'asc' ? -1 : 1;
            if (valA > valB) return direction === 'asc' ? 1 : -1;
            return 0;
        });

    return (
        <div className="min-h-[calc(100vh-6rem)] flex flex-col space-y-6 animate-in fade-in duration-500 pb-12">
            {/* Header */}
            <div className="flex-none flex items-center gap-4 border-b border-border pb-4">
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        Mes résultats
                    </h1>
                    <p className="text-muted-foreground">Historique complet de vos évaluations</p>
                </div>
                <Award className="w-8 h-8 text-muted-foreground/30" />
            </div>

            {/* Stats Grid */}
            <div className="flex-none grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="shadow-sm border-border bg-card">
                    <CardContent className="p-6">
                        <div className="p-2 bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                            <TrendingUp className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex items-baseline gap-1 mb-1">
                            <h3 className="text-3xl font-extrabold text-foreground">{stats.average_score}</h3>
                            <span className="text-lg font-bold text-muted-foreground">/ 20</span>
                        </div>
                        <p className="text-sm font-semibold text-foreground mb-1">Score moyen</p>
                        <p className="text-xs text-muted-foreground font-medium">Sur l'ensemble des quiz</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-border bg-card">
                    <CardContent className="p-6">
                        <div className="p-2 bg-success/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-5 h-5 text-success" />
                        </div>
                        <h3 className="text-3xl font-extrabold text-foreground mb-1">{stats.passed_count}</h3>
                        <p className="text-sm font-semibold text-foreground mb-1">Quiz réussis</p>
                        <p className="text-xs text-muted-foreground font-medium">{stats.failed_count} à améliorer</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-border bg-card">
                    <CardContent className="p-6">
                        <div className="p-2 bg-secondary/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                            <TrendingUp className="w-5 h-5 text-secondary" />
                        </div>
                        <h3 className="text-3xl font-extrabold text-foreground mb-1">{stats.total_count}</h3>
                        <p className="text-sm font-semibold text-foreground mb-1">Total des évaluations</p>
                        <p className="text-xs text-muted-foreground font-medium">Depuis l'inscription</p>
                    </CardContent>
                </Card>
            </div>

            {/* Results Table Section */}
            <Card className="shadow-sm border-border bg-card flex-1 flex flex-col overflow-visible">
                <div className="flex-none p-4 sm:p-6 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-xl font-bold text-foreground">Tous les résultats</h2>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                                placeholder="Rechercher par nom..." 
                                className="pl-9 bg-muted/50 border-transparent focus:border-ring focus:bg-background h-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/30 select-none">
                            <tr>
                                <th className="px-6 py-4 font-semibold">#</th>
                                <th className="px-6 py-4 font-semibold cursor-pointer group hover:bg-muted/50 transition-colors" onClick={() => handleSort('quiz_title')}>
                                    <div className="flex items-center">QUIZ {getSortIcon('quiz_title')}</div>
                                </th>
                                <th className="px-6 py-4 font-semibold cursor-pointer group hover:bg-muted/50 transition-colors" onClick={() => handleSort('subject')}>
                                    <div className="flex items-center">MATIÈRE {getSortIcon('subject')}</div>
                                </th>
                                <th className="px-6 py-4 font-semibold cursor-pointer group hover:bg-muted/50 transition-colors" onClick={() => handleSort('completed_at')}>
                                    <div className="flex items-center">DATE {getSortIcon('completed_at')}</div>
                                </th>
                                <th className="px-6 py-4 font-semibold cursor-pointer group hover:bg-muted/50 transition-colors" onClick={() => handleSort('result')}>
                                    <div className="flex items-center">RÉSULTAT {getSortIcon('result')}</div>
                                </th>
                                <th className="px-6 py-4 font-semibold cursor-pointer group hover:bg-muted/50 transition-colors text-right" onClick={() => handleSort('score_on_20')}>
                                    <div className="flex items-center justify-end">NOTE {getSortIcon('score_on_20')}</div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {results.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-muted-foreground font-medium">Vous n'avez passé aucun quiz pour le moment</td>
                                </tr>
                            ) : filteredAndSortedResults.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">Aucun résultat trouvé pour cette recherche.</td>
                                </tr>
                            ) : (
                                filteredAndSortedResults.map((result, idx) => {
                                    const scoreOn20 = result.score_on_20 ?? result.score;
                                    const isPassed = scoreOn20 >= 10;
                                    const resultLabel = isPassed ? 'Réussi' : 'Insuffisant';
                                    
                                    return (
                                        <tr 
                                            key={result.id} 
                                            className="hover:bg-muted/30 transition-colors cursor-pointer"
                                            onClick={() => setSelectedResultId(result.id)}
                                        >
                                            <td className="px-6 py-4 font-bold text-foreground">{String(idx + 1).padStart(2, '0')}</td>
                                            <td className="px-6 py-4 font-semibold text-foreground">{result.quiz_title}</td>
                                            <td className="px-6 py-4 text-muted-foreground font-medium">{getSubject(result.quiz_title)}</td>
                                            <td className="px-6 py-4 text-muted-foreground font-medium">{formatDate(result.completed_at)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                                    isPassed 
                                                    ? 'bg-success/10 text-success' 
                                                    : 'bg-destructive/10 text-destructive'
                                                }`}>
                                                    {resultLabel}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-1.5 font-bold">
                                                    {isPassed ? (
                                                        <CheckCircle2 className="w-4 h-4 text-success" />
                                                    ) : (
                                                        <XCircle className="w-4 h-4 text-destructive" />
                                                    )}
                                                    <span className={isPassed ? 'text-success' : 'text-destructive'}>
                                                        {scoreOn20}
                                                    </span>
                                                    <span className="text-muted-foreground font-semibold">/20</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <ResultDetailsDrawer 
                sessionId={selectedResultId} 
                onClose={() => setSelectedResultId(null)} 
            />
        </div>
    );
}
