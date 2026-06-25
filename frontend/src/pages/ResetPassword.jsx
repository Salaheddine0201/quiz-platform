import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { LockKeyhole, ArrowLeft, CheckCircle2 } from 'lucide-react';

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" })
    .regex(/[A-Z]/, { message: "Le mot de passe doit contenir au moins une majuscule" })
    .regex(/[0-9]/, { message: "Le mot de passe doit contenir au moins un chiffre" }),
  password_confirmation: z.string().min(1, { message: "Veuillez confirmer le mot de passe" }),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Les mots de passe ne correspondent pas",
  path: ["password_confirmation"],
});

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);
  
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      password_confirmation: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      await axios.post('http://localhost:8000/api/reset-password', {
        token,
        email,
        password: data.password,
        password_confirmation: data.password_confirmation
      }, {
        headers: { 'Accept': 'application/json' }
      });
      
      setIsSuccess(true);
    } catch (err) {
      if (err.response?.status === 422 && err.response.data?.errors) {
        const backendErrors = err.response.data.errors;
        Object.keys(backendErrors).forEach((field) => {
          form.setError(field === 'email' || field === 'token' ? 'password' : field, { 
            type: 'server', 
            message: backendErrors[field][0] 
          });
        });
      } else {
        form.setError('password', { type: 'server', message: "Le lien de réinitialisation est invalide ou expiré." });
      }
    }
  };

  if (!token || !email) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] p-4 bg-background">
        <Card className="w-full max-w-md shadow-sm border p-6 text-center space-y-4">
          <h2 className="text-xl font-bold text-destructive">Lien invalide</h2>
          <p className="text-muted-foreground">Le lien de réinitialisation est incomplet ou corrompu.</p>
          <Button asChild className="mt-4">
            <Link to="/forgot-password">Demander un nouveau lien</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4 bg-background">
      <Card className="w-full max-w-md shadow-sm border relative">
        <CardHeader className="text-center pt-8">
          <div className="mx-auto mb-4 bg-primary/10 p-3 rounded-full w-14 h-14 flex items-center justify-center text-primary">
            {isSuccess ? <CheckCircle2 className="h-7 w-7 text-success" /> : <LockKeyhole className="h-7 w-7" />}
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            {isSuccess ? "Mot de passe modifié" : "Nouveau mot de passe"}
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            {isSuccess 
              ? "Votre mot de passe a été réinitialisé avec succès."
              : "Choisissez un nouveau mot de passe sécurisé pour votre compte."}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {!isSuccess ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nouveau mot de passe</FormLabel>
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
                      <FormLabel>Confirmez le mot de passe</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} className="bg-muted/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full h-11" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Mise à jour...' : 'Réinitialiser le mot de passe'}
                </Button>
              </form>
            </Form>
          ) : (
            <div className="flex justify-center mt-6">
              <Button asChild className="w-full h-11 bg-success hover:bg-success/90">
                <Link to="/login">
                  Se connecter maintenant
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
