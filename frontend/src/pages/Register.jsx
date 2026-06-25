import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { GraduationCap, Users, ClipboardCheck, BarChart3, Timer, Shield, ArrowRight, ArrowLeft } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(3, { message: "Le nom doit contenir au moins 3 caractères" }),
  email: z.string().email({ message: "Adresse email invalide" }),
  password: z.string()
    .min(8, { message: "Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre" })
    .regex(/[A-Z]/, { message: "Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre" })
    .regex(/[0-9]/, { message: "Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre" }),
  password_confirmation: z.string().min(1, { message: "Veuillez confirmer votre mot de passe" }),
  role: z.enum(['enseignant', 'etudiant']),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Les mots de passe ne correspondent pas",
  path: ["password_confirmation"],
});

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  
  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      role: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setError('');
      const user = await register(data);
      navigate(user.role === 'enseignant' ? '/teacher-dashboard' : '/student-dashboard');
    } catch (err) {
      if (err.response?.status === 422 && err.response.data?.errors) {
        const backendErrors = err.response.data.errors;
        Object.keys(backendErrors).forEach((field) => {
          form.setError(field, { type: 'server', message: backendErrors[field][0] });
        });
      } else {
        setError('Erreur lors de l\'inscription.');
      }
    }
  };

  const handleRoleSelection = (selectedRole) => {
    form.setValue('role', selectedRole);
    setStep(2);
  };

  // ─── ÉTAPE 1 : Choix du rôle (plein écran, sans panneau droit) ───
  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-10">
            <div className="inline-flex bg-primary/10 rounded-full p-3 mb-5">
              <GraduationCap className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-3xl font-extrabold text-foreground mb-2 tracking-tight">Créez votre compte</h1>
            <p className="text-muted-foreground">Choisissez votre profil pour obtenir l'expérience la plus adaptée.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Carte Enseignant */}
            <div 
              onClick={() => handleRoleSelection('enseignant')}
              className="group cursor-pointer border-2 border-border hover:border-primary rounded-2xl p-6 transition-all hover:shadow-lg bg-card"
            >
              <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">Enseignant</h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">Créez des quiz, configurez la notation et suivez les résultats de vos étudiants.</p>
              <ul className="space-y-2 text-sm font-medium text-foreground">
                <li className="flex items-center"><ArrowRight className="h-3.5 w-3.5 mr-2 text-primary"/> Création de quiz</li>
                <li className="flex items-center"><ArrowRight className="h-3.5 w-3.5 mr-2 text-primary"/> Notation standard & canadien</li>
                <li className="flex items-center"><ArrowRight className="h-3.5 w-3.5 mr-2 text-primary"/> Tableau de bord enseignant</li>
              </ul>
            </div>

            {/* Carte Étudiant */}
            <div 
              onClick={() => handleRoleSelection('etudiant')}
              className="group cursor-pointer border-2 border-border hover:border-primary rounded-2xl p-6 transition-all hover:shadow-lg bg-card"
            >
              <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">Étudiant</h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">Passez vos évaluations, consultez vos notes et suivez votre progression.</p>
              <ul className="space-y-2 text-sm font-medium text-foreground">
                <li className="flex items-center"><ArrowRight className="h-3.5 w-3.5 mr-2 text-primary"/> Passage de quiz en ligne</li>
                <li className="flex items-center"><ArrowRight className="h-3.5 w-3.5 mr-2 text-primary"/> Suivi des notes et résultats</li>
                <li className="flex items-center"><ArrowRight className="h-3.5 w-3.5 mr-2 text-primary"/> Historique des évaluations</li>
              </ul>
            </div>
          </div>
          
          <p className="text-center text-sm text-muted-foreground mt-8">
            Déjà un compte ? <Link to="/login" className="text-primary hover:underline font-bold ml-1">Se connecter</Link>
          </p>
        </div>
      </div>
    );
  }

  // ─── ÉTAPE 2 : Formulaire (avec panneau droit) ───
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      
      {/* Colonne Formulaire (Gauche) */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-right-8 duration-500 bg-card border rounded-2xl p-7 shadow-sm">
          <button 
            onClick={() => setStep(1)}
            className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour au choix du profil
          </button>

          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                {form.getValues('role') === 'enseignant' ? <GraduationCap className="h-5 w-5 text-primary" /> : <Users className="h-5 w-5 text-primary" />}
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Compte {form.getValues('role') === 'enseignant' ? 'Enseignant' : 'Étudiant'}
              </h2>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">Renseignez vos informations pour y accéder.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && <div className="text-destructive text-sm text-center font-medium bg-destructive/10 p-3 rounded-md">{error}</div>}
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom complet</FormLabel>
                    <FormControl>
                      <Input placeholder="Jean Dupont" {...field} className="bg-muted/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse e-mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="vous@ecole.fr" {...field} className="bg-muted/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe</FormLabel>
                      <FormControl>
                        <PasswordInput placeholder="••••••••" {...field} className="bg-muted/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password_confirmation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmer</FormLabel>
                      <FormControl>
                        <PasswordInput placeholder="••••••••" {...field} className="bg-muted/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full h-11 mt-2" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Création...' : 'Créer mon compte'}
              </Button>
            </form>
          </Form>
          
          <p className="text-center text-sm text-muted-foreground mt-5">
            Déjà inscrit ? <Link to="/login" className="text-primary hover:underline font-bold ml-1">Se connecter</Link>
          </p>
        </div>
      </div>

      {/* Colonne Décorative (Droite) — Fonctionnalités réelles */}
      <div className="hidden lg:flex flex-1 bg-primary text-primary-foreground p-10 flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        
        <div className="relative z-10 max-w-md mx-auto">
          <h1 className="text-3xl font-extrabold mb-4 leading-tight">
            Évaluez et progressez sur une plateforme moderne.
          </h1>
          <p className="text-base opacity-90 mb-8">
            Créez des quiz, passez des évaluations et suivez vos résultats en temps réel.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: ClipboardCheck, title: "Quiz en ligne", desc: "Créez et passez des évaluations" },
              { icon: BarChart3, title: "Résultats", desc: "Notes et statistiques détaillées" },
              { icon: Timer, title: "Temps maîtrisé", desc: "Chronomètre et soumission auto" },
              { icon: Shield, title: "Sécurisé", desc: "Navigation contrôlée et anti-triche" }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col space-y-1.5 bg-primary-foreground/10 p-4 rounded-xl backdrop-blur-sm">
                <item.icon className="h-5 w-5 opacity-90 mb-1" />
                <h3 className="font-semibold text-sm">{item.title}</h3>
                <p className="text-xs opacity-80">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
    </div>
  );
}
