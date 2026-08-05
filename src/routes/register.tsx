import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export const Route = createFileRoute('/register')({
  component: RegisterComponent,
});

function RegisterComponent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
          data: {
            full_name: fullName,
            address,
            city,
            postal_code: postalCode,
          },
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Registration successful! Please check your email for verification.');
      navigate({ to: '/login' });
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blush/30 via-cream to-blush/20 py-16 md:py-24 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">Join Our Community</h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">Create an account to start your faith-filled gifting journey</p>
        </div>
      </div>

      {/* Auth Box Section */}
      <div className="container max-w-2xl mx-auto py-12 flex justify-center pb-20">
        <Card className="border-gold/20 shadow-lg w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-serif text-primary">Create an Account</CardTitle>
          <CardDescription>
            Join the Ruth Mavis community today
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input 
                  id="full-name" 
                  placeholder="Jane Doe" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required 
                  className="focus-visible:ring-gold"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="m@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  className="focus-visible:ring-gold"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Shipping Address</Label>
                <Input 
                  id="address" 
                  placeholder="123 Main St, Apartment, Suite, etc." 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="focus-visible:ring-gold"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input 
                    id="city" 
                    placeholder="Nelspruit" 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="focus-visible:ring-gold" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal-code">Postal Code</Label>
                  <Input 
                    id="postal-code" 
                    placeholder="1201" 
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="focus-visible:ring-gold" 
                  />
                </div>
              </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="focus-visible:ring-gold"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-burgundy hover:bg-burgundy/90 text-white" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-burgundy hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardFooter>
         </form>
       </Card>
      </div>
    </div>
  );
}
