
import React, { useState, useEffect, useCallback } from 'react';
import { Veiculo, Status, Notification } from './types.ts';
import LoginScreen from './components/LoginScreen.tsx';
import Dashboard from './components/Dashboard.tsx';
import NotificationPopup from './components/NotificationPopup.tsx';
import { Loader2 } from 'lucide-react';

declare global {
  const __firebase_config: any;
  const __app_id: string;
  const firebase: any;
}

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [db, setDb] = useState<any>(null);
  const [vehicles, setVehicles] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<Notification>(null);

  // Define the collection path once to ensure consistency and correctness.
  // The leading slash was removed as it's invalid for Firestore collection paths.
  const collectionPath = `artifacts/${__app_id}/public/data/veiculos`;

  useEffect(() => {
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(__firebase_config);
      }
      const auth = firebase.auth();
      const firestore = firebase.firestore();
      setDb(firestore);

      auth.signInAnonymously()
        .then((userCredential: any) => {
          setUser(userCredential.user);
        })
        .catch((error: any) => {
          console.error("Anonymous sign-in failed:", error);
          showNotification(`Falha na autenticação: ${error.message}`, 'error');
          setLoading(false);
        });
    } catch (error: any) {
        console.error("Firebase initialization failed:", error);
        showNotification(`Falha na inicialização: ${error.message}`, 'error');
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || !db) return;

    setLoading(true);
    const unsubscribe = db.collection(collectionPath)
      .orderBy('timestamp', 'desc')
      .onSnapshot((snapshot: any) => {
        const vehiclesData = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        } as Veiculo));
        setVehicles(vehiclesData);
        setLoading(false);
      }, (error: any) => {
        console.error("Error fetching vehicles:", error);
        if (error.code === 'permission-denied') {
            console.error("FIRESTORE PERMISSION DENIED: Please check your Firestore security rules in the Firebase console.");
            showNotification('Falha de permissão. Contate o administrador.', 'error');
        } else {
            showNotification('Erro ao carregar dados. Verifique a conexão.', 'error');
        }
        setLoading(false);
      });

    return () => unsubscribe();
  }, [user, db, collectionPath]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogin = (matricula: string, senha_tatica: string): boolean => {
    if (matricula === 'Admin' && senha_tatica === 'choque123') {
      setIsAuthenticated(true);
      showNotification('Acesso autorizado.', 'success');
      return true;
    }
    showNotification('Matrícula ou senha tática incorreta.', 'error');
    return false;
  };
  
  const handleAddVehicle = useCallback(async (newVehicle: Omit<Veiculo, 'id' | 'status' | 'timestamp'>) => {
    if (!db) return;

    const isAlreadyStolen = vehicles.some(v => v.placa.toUpperCase() === newVehicle.placa.toUpperCase() && v.status === Status.ROUBADO);
    if (isAlreadyStolen) {
      showNotification('Placa já possui um alerta de roubo ativo.', 'error');
      return;
    }

    try {
      await db.collection(collectionPath).add({
        ...newVehicle,
        placa: newVehicle.placa.toUpperCase(),
        status: Status.ROUBADO,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });
      showNotification('Alerta de roubo cadastrado com sucesso!', 'success');
    } catch (error: any) {
      console.error("Error adding vehicle:", error);
      showNotification(`Erro ao cadastrar alerta: ${error.message}`, 'error');
    }
  }, [db, vehicles, collectionPath]);

  const handleUpdateStatus = useCallback(async (id: string) => {
    if (!db) return;

    try {
        await db.collection(collectionPath).doc(id).update({
            status: Status.RECUPERADO,
        });
        showNotification('Veículo marcado como recuperado.', 'success');
    } catch (error: any)        {
        console.error("Error updating vehicle status:", error);
        showNotification(`Erro ao atualizar status: ${error.message}`, 'error');
    }
  }, [db, collectionPath]);

  if (loading && !vehicles.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans flex items-start justify-center pt-8 md:pt-16">
        <div className="w-full max-w-lg mx-auto p-4">
            {!isAuthenticated ? (
                <LoginScreen onLogin={handleLogin} />
            ) : (
                <Dashboard 
                    vehicles={vehicles}
                    onAddVehicle={handleAddVehicle}
                    onUpdateStatus={handleUpdateStatus}
                />
            )}
        </div>
        {notification && <NotificationPopup message={notification.message} type={notification.type} />}
    </div>
  );
};

export default App;