import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Home, Briefcase, Plus, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function ProfileAddressesTab({ user }: { user: any }) {
  const addresses = user?.addresses?.length > 0 ? user.addresses : [
    { id: 1, label: 'Home', street: '101, A Wing, Crystal Palace, Linking Road', city: 'Mumbai', state: 'Maharashtra', isDefault: true, type: 'home' },
    { id: 2, label: 'Work', street: '5th Floor, Tech Park, Andheri East', city: 'Mumbai', state: 'Maharashtra', isDefault: false, type: 'work' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-bold">Saved Addresses</h2>
          <p className="text-sm text-muted-foreground">Manage your delivery locations</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Add New
        </Button>
      </div>

      <div className="space-y-4">
        {addresses.map((addr: any, i: number) => (
          <Card key={i} className={`relative overflow-hidden transition-all duration-200 border-2 ${addr.isDefault ? 'border-primary shadow-md' : 'border-transparent hover:border-primary/20'}`}>
            {addr.isDefault && (
              <div className="absolute top-0 right-0">
                <div className="bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                  DEFAULT
                </div>
              </div>
            )}
            <CardContent className="p-5">
              <div className="flex gap-4">
                <div className="mt-1">
                  {addr.type === 'home' || addr.label?.toLowerCase() === 'home' ? (
                    <div className="p-2 bg-blue-100 rounded-full text-blue-600"><Home className="w-5 h-5" /></div>
                  ) : addr.type === 'work' || addr.label?.toLowerCase() === 'work' ? (
                    <div className="p-2 bg-orange-100 rounded-full text-orange-600"><Briefcase className="w-5 h-5" /></div>
                  ) : (
                    <div className="p-2 bg-gray-100 rounded-full text-gray-600"><MapPin className="w-5 h-5" /></div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg">{addr.label}</h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2 cursor-pointer">
                          <Edit2 className="w-4 h-4" /> Edit
                        </DropdownMenuItem>
                        {!addr.isDefault && (
                          <DropdownMenuItem className="gap-2 cursor-pointer">
                            <MapPin className="w-4 h-4" /> Set as Default
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                          <Trash2 className="w-4 h-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 max-w-[85%]">
                    {addr.street}, {addr.city}, {addr.state}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
