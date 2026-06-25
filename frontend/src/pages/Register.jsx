import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { BookOpen } from 'lucide-react';

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
      if (err.response?.status === 422 && err.response.data?.errors) {
        const backendErrors = err.response.data.errors;
        Object.keys(backendErrors).forEach((field) => {
          const backendMessage = backendErrors[field][0];
          form.setError(field, { type: 'server', message: backendMessage });
        });
      } else {
        setError(err.response?.data?.message || 'Erreur lors de l\'inscription.');
      }
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && <div className="text-red-500 text-sm text-center">{error}</div>}
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom complet</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="votre@email.com" {...field} />
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
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
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
                    <FormLabel>Confirmer le mot de passe</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <FormLabel>{isTeacher ? "Je suis un enseignant" : "Je suis un étudiant"}</FormLabel>
                      <div className="text-sm text-gray-500">
                        {isTeacher ? "Vous créerez des quiz pour vos étudiants" : "Vous passerez des quiz créés par les enseignants"}
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value === 'enseignant'}
                        onCheckedChange={(checked) => field.onChange(checked ? 'enseignant' : 'etudiant')}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Inscription...' : 'S\'inscrire'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm">
          <p>Déjà un compte ? <Link to="/login" className="text-indigo-600 hover:underline">Se connecter</Link></p>
        </CardFooter>
      </Card>
    </div>
  );
}
