import React, { useState, useEffect, useCallback } from 'react';
import { Veiculo, Status, Notification } from './types.ts';
import LoginScreen from './components/LoginScreen.tsx';
import Dashboard from './components/Dashboard.tsx';
import NotificationPopup from './components/NotificationPopup.tsx';
import { Loader2, LogOut, Download } from 'lucide-react';

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
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const collectionPath = `artifacts/${__app_id}/public/data/veiculos`;

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

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
          const savedAuth = localStorage.getItem('siva_auth_persistent');
          if (savedAuth === 'true') {
            setIsAuthenticated(true);
          }
        })
        .catch((error: any) => {
          console.error("Auth error:", error);
        })
        .finally(() => setLoading(false));
    } catch (error: any) {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || !db) return;

    // REMOVIDO orderBy direto no Firestore para garantir que documentos SEM timestamp apareçam
    const unsubscribe = db.collection(collectionPath)
      .onSnapshot((snapshot: any) => {
        const vehiclesData = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        } as Veiculo));
        
        // ORDENAÇÃO NO CLIENTE: Garante que o editado/novo suba sem sumir com os antigos
        const sortedData = vehiclesData.sort((a, b) => {
          const timeA = a.timestamp?.seconds || 0;
          const timeB = b.timestamp?.seconds || 0;
          return timeB - timeA;
        });

        setVehicles(sortedData);
      }, (error: any) => {
        console.error("Error fetching data:", error);
      });

    return () => unsubscribe();
  }, [user, db, collectionPath]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogin = (matricula: string, senha_tatica: string, remember: boolean): boolean => {
    if (matricula === 'Admin' && (senha_tatica === 'choque123' || senha_tatica === 'CHOQUE123')) {
      setIsAuthenticated(true);
      if (remember) localStorage.setItem('siva_auth_persistent', 'true');
      showNotification('Acesso autorizado.', 'success');
      return true;
    }
    showNotification('Dados incorretos.', 'error');
    return false;
  };

  const handleAddVehicle = useCallback(async (newVehicle: Omit<Veiculo, 'id' | 'status' | 'timestamp'>) => {
    if (!db) return;
    try {
      await db.collection(collectionPath).add({
        ...newVehicle,
        placa: newVehicle.placa.toUpperCase(),
        status: Status.ROUBADO,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });
      showNotification('Alerta cadastrado!', 'success');
    } catch (error: any) {
      showNotification('Erro ao salvar.', 'error');
    }
  }, [db, collectionPath]);

  const handleEditVehicle = useCallback(async (id: string, updatedData: Omit<Veiculo, 'id' | 'status' | 'timestamp'>) => {
    if (!db) return;
    try {
        await db.collection(collectionPath).doc(id).update({
            ...updatedData,
            placa: updatedData.placa.toUpperCase(),
            // Atualizar o timestamp faz com que o veículo suba para o topo
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        });
        showNotification('Alerta atualizado!', 'success');
    } catch (error: any) {
        showNotification('Erro ao editar.', 'error');
    }
  }, [db, collectionPath]);

  const handleUpdateStatus = useCallback(async (id: string) => {
    if (!db) return;
    try {
        await db.collection(collectionPath).doc(id).update({
            status: Status.RECUPERADO,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        });
        showNotification('Recuperado!', 'success');
    } catch (error: any) {
        showNotification('Erro ao atualizar.', 'error');
    }
  }, [db, collectionPath]);

  const handleDeleteVehicle = useCallback(async (id: string) => {
    if (!db) return;
    try {
        await db.collection(collectionPath).doc(id).delete();
        showNotification('Excluído.', 'success');
    } catch (error: any) {
        showNotification('Erro ao excluir.', 'error');
    }
  }, [db, collectionPath]);

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-black"><Loader2 className="w-12 h-12 text-red-600 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-black text-zinc-300 flex flex-col items-center p-4">
        <div className="w-full max-w-lg">
            {!isAuthenticated ? (
                <LoginScreen onLogin={handleLogin} />
            ) : (
                <Dashboard 
                    vehicles={vehicles}
                    onAddVehicle={handleAddVehicle}
                    onEditVehicle={handleEditVehicle}
                    onUpdateStatus={handleUpdateStatus}
                    onDeleteVehicle={handleDeleteVehicle}
                    onClearRecovered={async () => {}} // Lógica interna do Dashboard
                />
            )}
        </div>
        {notification && <NotificationPopup message={notification.message} type={notification.type} />}
    </div>
  );
};

export default App;