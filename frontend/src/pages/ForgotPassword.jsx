import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { KeyRound, ArrowLeft } from 'lucide-react';
import axios from 'axios';

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
    try {
      // L'URL exacte dépendra de la configuration de tes routes web.php / api.php
      await axios.post('http://localhost:8000/api/forgot-password', data, {
        headers: {
          'Accept': 'application/json'
        }
      });
      setIsSubmitted(true);
    } catch (err) {
      if (err.response?.status === 422 && err.response.data?.errors) {
        const backendErrors = err.response.data.errors;
        Object.keys(backendErrors).forEach((field) => {
          form.setError(field, { type: 'server', message: backendErrors[field][0] });
        });
      } else {
        form.setError('email', { type: 'server', message: "Une erreur est survenue lors de la connexion au serveur." });
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4 bg-background">
      <Card className="w-full max-w-md shadow-sm border relative">
        <Link to="/login" className="absolute top-4 left-4 text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <CardHeader className="text-center pt-8">
          <div className="mx-auto mb-4 bg-primary/10 p-3 rounded-full w-14 h-14 flex items-center justify-center text-primary">
            <KeyRound className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Mot de passe oublié</CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            {isSubmitted 
              ? "Si cette adresse email existe, un lien de réinitialisation vous a été envoyé."
              : "Entrez votre adresse email, nous vous enverrons un lien pour réinitialiser votre mot de passe."}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {!isSubmitted ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
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
                
                <Button type="submit" className="w-full h-11" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Envoi en cours...' : 'Envoyer le lien'}
                </Button>
              </form>
            </Form>
          ) : (
            <div className="flex justify-center mt-6">
              <Button onClick={() => setIsSubmitted(false)} variant="outline" className="w-full h-11">
                Essayer une autre adresse
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
