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
import { BookOpen } from 'lucide-react';

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
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const errorTranslations = {
    "The email has already been taken.": "Cette adresse email est déjà utilisée.",
    "These credentials do not match our records.": "Les identifiants sont incorrects.",
  };

  const onSubmit = async (data) => {
    try {
      setError('');
      const user = await login({ email: data.email, password: data.password });
      if (user.role === 'enseignant') {
        navigate('/teacher-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } catch (err) {
      if (err.response?.status === 422 && err.response.data?.errors) {
        const backendErrors = err.response.data.errors;
        Object.keys(backendErrors).forEach((field) => {
          const originalMessage = backendErrors[field][0];
          const translatedMessage = errorTranslations[originalMessage] || originalMessage;
          form.setError(field, { type: 'server', message: translatedMessage });
        });
      } else {
        setError('Identifiants incorrects ou erreur serveur.');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-[400px]">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 bg-indigo-100 p-3 rounded-full w-12 h-12 flex items-center justify-center">
            <BookOpen className="text-indigo-600" />
          </div>
          <CardTitle>Connexion</CardTitle>
          <CardDescription>Accédez à votre espace Quiz</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && <div className="text-red-500 text-sm text-center">{error}</div>}
              
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
                    <div className="flex items-center justify-between">
                      <FormLabel>Mot de passe</FormLabel>
                      <Link to="/forgot-password" className="text-xs text-indigo-600 hover:underline">
                        Mot de passe oublié ?
                      </Link>
                    </div>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm">
          <p>Pas encore de compte ? <Link to="/register" className="text-indigo-600 hover:underline">S'inscrire</Link></p>
        </CardFooter>
      </Card>
    </div>
  );
}
