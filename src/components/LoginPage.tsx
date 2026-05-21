import { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { mockUsers } from '../data/mockData';
import { Button } from '../app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../app/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../app/components/ui/select';
import { Building2, Shield, Hospital, Loader2 } from 'lucide-react';

// 1. Definisikan tipe yang spesifik untuk Role
type Role = 'hospital' | 'health_office' | 'ministry' | string;

// 2. Pindahkan helper ke luar komponen untuk mencegah re-creation saat re-render
const getRoleIcon = (role: Role) => {
  switch (role) {
    case 'hospital':
      return <Hospital className="h-5 w-5" />;
    case 'health_office':
      return <Building2 className="h-5 w-5" />;
    case 'ministry':
      return <Shield className="h-5 w-5" />;
    default:
      return null;
  }
};

const getRoleLabel = (role: Role) => {
  switch (role) {
    case 'hospital':
      return 'Hospital Staff';
    case 'health_office':
      return 'Health Office';
    case 'ministry':
      return 'Ministry of Health';
    default:
      return role;
  }
};

export function LoginPage() {
  const { login, users } = useAuth();
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false); // State untuk loading
  const availableUsers = useMemo(() => (users.length > 0 ? users : mockUsers), [users]);

  // 3. Buat fungsi menjadi async dan tambahkan try/catch
  const handleLogin = async () => {
    if (!selectedUser) return;

    try {
      setIsLoading(true);
      // Asumsi fungsi login mengembalikan Promise.
      await login(selectedUser); 
      
      // Catatan: Pastikan navigasi ke dashboard dilakukan di dalam useAuth atau di sini.
    } catch (error) {
      console.error('Login failed:', error);
      // Di sini Anda bisa menambahkan toast notification untuk error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center">
              <Hospital className="h-10 w-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">EMRAM Assessment Platform</CardTitle>
          <CardDescription className="text-center">
            Electronic Medical Record Adoption Model - Ministry of Health
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {/* 4. Tambahkan htmlFor untuk aksesibilitas */}
            <label htmlFor="user-select" className="text-sm font-medium">
              Select User (Demo Mode)
            </label>
            <Select value={selectedUser} onValueChange={setSelectedUser} disabled={isLoading}>
              <SelectTrigger id="user-select">
                <SelectValue placeholder="Choose a user to login" />
              </SelectTrigger>
              <SelectContent>
                {mockUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      {getRoleIcon(user.role)}
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {getRoleLabel(user.role)} - {user.organizationName}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 5. Disable button saat loading dan tampilkan icon spinner */}
          <Button onClick={handleLogin} disabled={!selectedUser || isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </Button>

          <div className="text-xs text-muted-foreground text-center pt-4 border-t">
            <p>
              This is a demo platform showcasing EMRAM assessment workflows.
              <br />
              In production, this would integrate with Supabase for authentication.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}