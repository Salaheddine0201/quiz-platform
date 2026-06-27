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
import { GraduationCap, ClipboardCheck, BarChart3, Timer, Shield } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: "Adresse email invalide" }),
  password: z.string().min(1, { message: "Le mot de passe est requis" }),
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data) => {
    try {
      setError('');
      const user = await login({ email: data.email, password: data.password });
      navigate(user.role === 'enseignant' ? '/teacher-dashboard' : '/student-dashboard');
    } catch (err) {
      if (err.response?.status === 422 && err.response.data?.errors) {
        const backendErrors = err.response.data.errors;
        Object.keys(backendErrors).forEach((field) => {
          form.setError(field, { type: 'server', message: backendErrors[field][0] });
        });
      } else {
        setError('Erreur de connexion au serveur.');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      
      {/* Colonne Formulaire (Gauche) */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md space-y-8 bg-card border rounded-2xl p-8 shadow-sm">
          
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 rounded-full p-4 mb-4">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Portail Scolaire</h2>
            <p className="text-muted-foreground mt-2">Connexion à votre espace</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {error && <div className="text-destructive text-sm text-center font-medium bg-destructive/10 p-3 rounded-md">{error}</div>}
              
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
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Mot de passe</FormLabel>
                      <Link to="/forgot-password" className="text-xs text-primary hover:underline font-medium">
                        Oublié ?
                      </Link>
                    </div>
                    <FormControl>
                      <PasswordInput placeholder="••••••••" {...field} className="h-11 bg-muted/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full h-11" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>
          </Form>

          <p className="text-center text-sm text-muted-foreground">
            Pas encore de compte ? <Link to="/register" className="text-primary hover:underline font-bold ml-1">S'inscrire</Link>
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
