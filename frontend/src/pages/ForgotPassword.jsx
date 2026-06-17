import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { KeyRound, ArrowLeft } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Veuillez entrer une adresse email valide" }),
});

export default function ForgotPassword() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data) => {
    // Logique d'envoi d'email à implémenter plus tard avec le backend
    console.log("Demande de réinitialisation pour:", data.email);
    // Simulation d'attente
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitted(true);
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 bg-indigo-100 p-3 rounded-full w-12 h-12 flex items-center justify-center text-indigo-600">
            <KeyRound className="h-6 w-6" />
          </div>
          <CardTitle>Mot de passe oublié</CardTitle>
          <CardDescription>
            {isSubmitted 
              ? "Si cette adresse email existe, un lien de réinitialisation vous a été envoyé."
              : "Entrez votre adresse email, nous vous enverrons un lien pour réinitialiser votre mot de passe."}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {!isSubmitted ? (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="votre@email.com" 
                  {...form.register('email')} 
                />
                {form.formState.errors.email && (
                  <p className="text-red-500 text-xs">{form.formState.errors.email.message}</p>
                )}
              </div>
              
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Envoi en cours...' : 'Envoyer le lien'}
              </Button>
            </form>
          ) : (
            <div className="flex justify-center">
              <Button asChild variant="outline" className="w-full">
                <Link to="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour à la connexion
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
        
        {!isSubmitted && (
          <CardFooter className="flex justify-center border-t p-4">
            <Link to="/login" className="flex items-center text-sm text-slate-600 hover:text-indigo-600 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la connexion
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
