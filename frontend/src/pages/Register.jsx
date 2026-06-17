import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { BookOpen } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
  email: z.string().email({ message: "Email invalide" }),
  password: z.string().min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" }),
  password_confirmation: z.string(),
  role: z.enum(['enseignant', 'etudiant']),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Les mots de passe ne correspondent pas",
  path: ["password_confirmation"],
});

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  
  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      role: 'etudiant',
    },
  });

  const onSubmit = async (data) => {
    try {
      setError('');
      const user = await register({ 
        name: data.name, 
        email: data.email, 
        password: data.password,
        password_confirmation: data.password_confirmation,
        role: data.role 
      });
      if (user.role === 'enseignant') {
        navigate('/teacher-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription.');
    }
  };

  const isTeacher = form.watch('role') === 'enseignant';

  return (
    <div className="flex items-center justify-center min-h-[80vh] my-8">
      <Card className="w-[400px]">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 bg-indigo-100 p-3 rounded-full w-12 h-12 flex items-center justify-center">
            <BookOpen className="text-indigo-600" />
          </div>
          <CardTitle>Inscription</CardTitle>
          <CardDescription>Créez votre compte Quiz Platform</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input id="name" placeholder="John Doe" {...form.register('name')} />
              {form.formState.errors.name && <p className="text-red-500 text-xs">{form.formState.errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="votre@email.com" {...form.register('email')} />
              {form.formState.errors.email && <p className="text-red-500 text-xs">{form.formState.errors.email.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" type="password" {...form.register('password')} />
              {form.formState.errors.password && <p className="text-red-500 text-xs">{form.formState.errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirmation">Confirmer le mot de passe</Label>
              <Input id="password_confirmation" type="password" {...form.register('password_confirmation')} />
              {form.formState.errors.password_confirmation && <p className="text-red-500 text-xs">{form.formState.errors.password_confirmation.message}</p>}
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label>{isTeacher ? "Je suis un enseignant" : "Je suis un étudiant"}</Label>
                <div className="text-sm text-gray-500">
                  {isTeacher ? "Vous créerez des quiz pour vos étudiants" : "Vous passerez des quiz créés par les enseignants"}
                </div>
              </div>
              <Switch
                checked={isTeacher}
                onCheckedChange={(checked) => form.setValue('role', checked ? 'enseignant' : 'etudiant')}
              />
            </div>

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Inscription...' : 'S\'inscrire'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm">
          <p>Déjà un compte ? <Link to="/login" className="text-indigo-600 hover:underline">Se connecter</Link></p>
        </CardFooter>
      </Card>
    </div>
  );
}
