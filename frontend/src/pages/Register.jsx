import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { GraduationCap, Users, BookOpen, TrendingUp, MessageSquare, Calendar, ArrowRight, ArrowLeft } from 'lucide-react';

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
      role: '', // Sera défini à l'étape 1
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

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      
      {/* Colonne Principale (Gauche) */}
      <div className="flex-1 flex flex-col p-8 lg:p-16 relative">
        
        {/* Content Centré */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-2xl">
            
            {/* ETAPE 1 : CHOIX DU RÔLE */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-12">
                  <div className="inline-flex bg-primary/10 rounded-full p-3 mb-6">
                    <GraduationCap className="h-8 w-8 text-primary" />
                  </div>
                  <h1 className="text-4xl font-extrabold text-foreground mb-3 tracking-tight">Créez votre compte</h1>
                  <p className="text-muted-foreground text-lg">Choisissez votre profil pour obtenir l'expérience la plus adaptée.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Carte Enseignant */}
                  <div 
                    onClick={() => handleRoleSelection('enseignant')}
                    className="group cursor-pointer border-2 border-border hover:border-primary rounded-3xl p-8 transition-all hover:shadow-lg bg-card"
                  >
                    <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <GraduationCap className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-foreground">Enseignant</h3>
                    <p className="text-muted-foreground text-sm mb-6 leading-relaxed">Lancez vos évaluations avec un parcours guidé et commencez à enseigner.</p>
                    <ul className="space-y-3 text-sm font-medium text-foreground">
                      <li className="flex items-center"><ArrowRight className="h-4 w-4 mr-3 text-primary"/> Création guidée</li>
                      <li className="flex items-center"><ArrowRight className="h-4 w-4 mr-3 text-primary"/> Configuration et notes</li>
                      <li className="flex items-center"><ArrowRight className="h-4 w-4 mr-3 text-primary"/> Tableau de bord</li>
                    </ul>
                  </div>

                  {/* Carte Étudiant */}
                  <div 
                    onClick={() => handleRoleSelection('etudiant')}
                    className="group cursor-pointer border-2 border-border hover:border-primary rounded-3xl p-8 transition-all hover:shadow-lg bg-card"
                  >
                    <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-foreground">Étudiant</h3>
                    <p className="text-muted-foreground text-sm mb-6 leading-relaxed">Créez votre compte rapidement avec une inscription simplifiée.</p>
                    <ul className="space-y-3 text-sm font-medium text-foreground">
                      <li className="flex items-center"><ArrowRight className="h-4 w-4 mr-3 text-primary"/> Inscription simple</li>
                      <li className="flex items-center"><ArrowRight className="h-4 w-4 mr-3 text-primary"/> Suivi des notes</li>
                      <li className="flex items-center"><ArrowRight className="h-4 w-4 mr-3 text-primary"/> Accès aux quiz</li>
                    </ul>
                  </div>
                </div>
                
                <p className="text-center text-sm text-muted-foreground mt-12">
                  Déjà un compte ? <Link to="/login" className="text-primary hover:underline font-bold ml-1">Se connecter</Link>
                </p>
              </div>
            )}

            {/* ETAPE 2 : FORMULAIRE */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-md mx-auto bg-card border rounded-2xl p-8 shadow-sm">
                <button 
                  onClick={() => setStep(1)}
                  className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors font-medium"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" /> Retour au choix du profil
                </button>

                <div className="mb-8">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      {form.getValues('role') === 'enseignant' ? <GraduationCap className="h-5 w-5 text-primary" /> : <Users className="h-5 w-5 text-primary" />}
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">
                      Compte {form.getValues('role') === 'enseignant' ? 'Enseignant' : 'Étudiant'}
                    </h2>
                  </div>
                  <p className="text-muted-foreground mt-2">Renseignez vos informations pour y accéder.</p>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mot de passe</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} className="bg-muted/50" />
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
                              <Input type="password" placeholder="••••••••" {...field} className="bg-muted/50" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button type="submit" className="w-full h-11 mt-4" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? 'Création...' : 'Créer mon compte'}
                    </Button>
                  </form>
                </Form>
                
                <p className="text-center text-sm text-muted-foreground mt-6">
                  Déjà inscrit ? <Link to="/login" className="text-primary hover:underline font-bold ml-1">Se connecter</Link>
                </p>
              </div>
            )}
            
          </div>
        </div>
      </div>

      {/* Colonne Décorative (Droite) - Identique au Login pour la cohérence DRY */}
      <div className="hidden lg:flex flex-1 bg-primary text-primary-foreground p-12 flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        
        <div className="relative z-10 max-w-lg mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
            Gérez vos activités académiques sur une plateforme éducative moderne.
          </h1>
          <p className="text-lg opacity-90 mb-12">
            Conçue sur mesure pour les étudiants et les enseignants, notre plateforme centralise la gestion scolaire, facilite la communication et optimise l'apprentissage au quotidien.
          </p>
          
          <div className="grid grid-cols-2 gap-6">
            {[
              { icon: BookOpen, title: "Ressources", desc: "Consultez vos supports" },
              { icon: TrendingUp, title: "Progression", desc: "Visualisez votre parcours" },
              { icon: MessageSquare, title: "Communication", desc: "Échangez avec l'équipe" },
              { icon: Calendar, title: "Activités", desc: "Événements importants" }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col space-y-2 bg-primary-foreground/10 p-5 rounded-xl backdrop-blur-sm">
                <item.icon className="h-6 w-6 opacity-90 mb-2" />
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-sm opacity-80">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
    </div>
  );
}
