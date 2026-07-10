import React from 'react';
import { ShieldOff, Lock, Home, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';

export function AccessDeniedPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 select-none animate-page-enter">
      <Card className="w-full max-w-md border-rose-500/25 bg-card/60 backdrop-blur-md shadow-2xl relative overflow-hidden">
        
        {/* Glow Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-600 via-carrot-orange to-tuscan-sun" />
        
        <CardContent className="p-8 text-center space-y-6">
          {/* Animated Icon Container */}
          <div className="relative h-20 w-20 mx-auto bg-rose-500/10 text-rose-500 dark:text-rose-400 rounded-2xl flex items-center justify-center">
            <Lock className="h-10 w-10 animate-pulse" />
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-rose-600 text-white flex items-center justify-center">
              <ShieldOff className="h-3 w-3" />
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-2">
            <Badge variant="destructive" className="font-black text-[9px] uppercase tracking-widest px-3 py-1">
              Access Restricted
            </Badge>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight font-display pt-1">
              Permission Required
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
              Your account role (<span className="font-bold text-slate-800 dark:text-slate-200 capitalize">{user?.role || 'Guest'}</span>) does not have authorization parameters to access this section of Grocery Mart.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center max-w-sm mx-auto">
            <Button 
              variant="outline" 
              className="flex-1 h-11 text-xs uppercase flex items-center justify-center gap-1.5"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" /> Go Back
            </Button>
            <Link to="/login" className="flex-1">
              <Button variant="brand" className="w-full h-11 text-xs uppercase flex items-center justify-center gap-1.5 shadow-none">
                <Home className="h-4 w-4" /> Return Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export default AccessDeniedPage;
