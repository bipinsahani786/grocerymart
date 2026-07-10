import React from 'react';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 select-none animate-page-enter">
      <Card className="w-full max-w-md border-rose-500/25 bg-card/60 backdrop-blur-md shadow-2xl relative overflow-hidden">
        
        {/* Glow Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-600 via-strawberry-red to-atomic-tangerine" />
        
        <CardContent className="p-8 text-center space-y-6">
          {/* Animated Icon Container */}
          <div className="relative h-20 w-20 mx-auto bg-rose-500/10 text-rose-500 dark:text-rose-400 rounded-2xl flex items-center justify-center">
            <FileQuestion className="h-10 w-10 animate-bounce" />
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-rose-600 text-white flex items-center justify-center font-black text-[9px] uppercase">
              404
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-2">
            <Badge variant="destructive" className="font-black text-[9px] uppercase tracking-widest px-3 py-1">
              Page Not Found
            </Badge>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight font-display pt-1">
              Lost in Grocery Mart?
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
              The page or section you are trying to reach doesn't exist, has been archived, or was moved to another pathway.
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
                <Home className="h-4 w-4" /> Home Login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export default NotFoundPage;
