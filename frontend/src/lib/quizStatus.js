/*
 * Statut d'un quiz dérivé côté front.
 *
 * Le backend actuel (modèle Quiz) n'expose que `expires_at` / `is_expired`
 * et `questions_count`. Il n'a PAS de champ `status` ni de `starts_at`,
 * donc les statuts « Programmé » et « Terminé » des maquettes ne peuvent
 * pas être calculés de façon fiable pour l'instant.
 *
 * Statuts gérés : actif | expire | brouillon
 *  - brouillon : aucune question (le quiz n'est pas diffusable)
 *  - expire    : date d'expiration dépassée
 *  - actif     : sinon
 */
export const QUIZ_STATUS = {
    actif: { label: 'Actif', className: 'bg-success/10 text-success', dot: 'bg-success' },
    planifie: { label: 'Planifié', className: 'bg-warning/10 text-warning', dot: 'bg-warning' },
    expire: { label: 'Expiré', className: 'bg-destructive/10 text-destructive', dot: 'bg-destructive' },
    brouillon: { label: 'Brouillon', className: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground' },
};

export function deriveQuizStatus(quiz) {
    if (!quiz) return 'brouillon';
    if ((quiz.questions_count ?? 0) === 0) return 'brouillon';
    if (quiz.is_expired || (quiz.expires_at && new Date() > new Date(quiz.expires_at))) return 'expire';
    if (quiz.starts_at && new Date() < new Date(quiz.starts_at)) return 'planifie';
    return 'actif';
}

export function getSubject(title) {
    if (!title) return 'Divers';
    return title.split(/—|-/)[0].trim() || title;
}
