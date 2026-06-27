import React from 'react';

export default function LoadingSkeleton() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12 w-full h-full p-2 sm:p-4">
            {/* En-tête générique */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-border">
                <div className="space-y-3">
                    <div className="h-8 w-40 sm:w-64 bg-muted rounded-md animate-pulse"></div>
                    <div className="h-4 w-24 sm:w-48 bg-muted rounded-md animate-pulse"></div>
                </div>
                <div className="w-10 h-10 rounded-full bg-muted animate-pulse hidden sm:block"></div>
            </div>

            {/* Grille générique (Cartes) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
                        <div className="w-10 h-10 bg-muted rounded-lg animate-pulse"></div>
                        <div className="h-6 w-24 bg-muted rounded-md animate-pulse"></div>
                        <div className="h-4 w-3/4 bg-muted rounded-md animate-pulse"></div>
                    </div>
                ))}
            </div>
            
            {/* Bloc Contenu générique (Liste ou Tableau) */}
            <div className="bg-card border border-border shadow-sm rounded-xl p-6 space-y-6 mt-6">
                 <div className="h-6 w-48 bg-muted rounded-md animate-pulse mb-2"></div>
                 {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex gap-4 items-center">
                        <div className="h-8 w-8 bg-muted rounded-md animate-pulse"></div>
                        <div className="h-8 flex-1 bg-muted rounded-md animate-pulse"></div>
                        <div className="h-8 w-24 bg-muted rounded-md animate-pulse hidden sm:block"></div>
                    </div>
                 ))}
            </div>
        </div>
    );
}
