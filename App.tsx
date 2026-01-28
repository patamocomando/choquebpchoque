import React, { useState, useEffect, useCallback } from 'react';
import { Veiculo, Status, Notification } from './types.ts';
import LoginScreen from './components/LoginScreen.tsx';
import Dashboard from './components/Dashboard.tsx';
import NotificationPopup from './components/NotificationPopup.tsx';
import { Loader2, LogOut } from 'lucide-react';

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
          const savedAuth = localStorage.getItem('siva_auth_persistent');
          if (savedAuth === 'true') {
            setIsAuthenticated(true);
          }
        })
        .catch((error: any) => console.error("Auth error:", error))
        .finally(() => setLoading(false));
    } catch (error: any) {
        setLoading(false);
    }
  }, []);

  // Função para limpar dados com mais de 40 dias
  const performAutoCleanup = useCallback(async (data: Veiculo[]) => {
    if (!db || data.length === 0) return;
    
    const FORTY_DAYS_MS = 40 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const toDelete = data.filter(v => {
      if (!v.timestamp) return false; // Não apaga dados sem data para evitar perdas acidentais
      const docDate = v.timestamp.seconds ? v.timestamp.seconds * 1000 : v.timestamp;
      return (now - docDate) > FORTY_DAYS_MS;
    });

    if (toDelete.length > 0) {
      const batch = db.batch();
      toDelete.forEach(v => {
        const ref = db.collection(collectionPath).doc(v.id);
        batch.delete(ref);
      });
      await batch.commit();
      console.log(`${toDelete.length} registros antigos (40 dias+) foram removidos automaticamente.`);
    }
  }, [db, collectionPath]);

  useEffect(() => {
    if (!user || !db) return;

    // BUSCA TOTAL: Sem filtros de ordenação no Firestore para garantir que dados antigos apareçam
    const unsubscribe = db.collection(collectionPath)
      .onSnapshot((snapshot: any) => {
        const vehiclesData = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        } as Veiculo));
        
        // ORDENAÇÃO NO CLIENTE: Garante que o editado/novo suba, mas mantém os sem timestamp visíveis no fim
        const sortedData = vehiclesData.sort((a, b) => {
          const timeA = a.timestamp?.seconds || 0;
          const timeB = b.timestamp?.seconds || 0;
          return timeB - timeA;
        });

        setVehicles(sortedData);
        
        // Se estiver logado como admin, executa a limpeza de 40 dias
        if (isAuthenticated) {
            performAutoCleanup(sortedData);
        }
      }, (error: any) => {
        console.error("Firestore error:", error);
      });

    return () => unsubscribe();
  }, [user, db, collectionPath, isAuthenticated, performAutoCleanup]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogin = (matricula: string, senha_tatica: string, remember: boolean): boolean => {
    const isMaster = matricula === 'Admin' && (senha_tatica === 'choque123' || senha_tatica === 'CHOQUE123');
    if (isMaster) {
      setIsAuthenticated(true);
      if (remember) localStorage.setItem('siva_auth_persistent', 'true');
      showNotification('Acesso autorizado. Faxina de 40 dias iniciada.', 'success');
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
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        });
        showNotification('Alerta atualizado e movido para o topo!', 'success');
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
        showNotification('Veículo recuperado!', 'success');
    } catch (error: any) {
        showNotification('Erro ao atualizar.', 'error');
    }
  }, [db, collectionPath]);

  const handleDeleteVehicle = useCallback(async (id: string) => {
    if (!db) return;
    try {
        await db.collection(collectionPath).doc(id).delete();
        showNotification('Registro excluído.', 'success');
    } catch (error: any) {
        showNotification('Erro ao excluir.', 'error');
    }
  }, [db, collectionPath]);

  const handleClearRecovered = useCallback(async () => {
    if (!db) return;
    const recovered = vehicles.filter(v => v.status === Status.RECUPERADO);
    if (recovered.length === 0) return;
    
    try {
      const batch = db.batch();
      recovered.forEach(v => batch.delete(db.collection(collectionPath).doc(v.id)));
      await batch.commit();
      showNotification('Histórico limpo.', 'success');
    } catch (error: any) {
      showNotification('Erro na limpeza.', 'error');
    }
  }, [db, vehicles, collectionPath]);

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-black"><Loader2 className="w-12 h-12 text-red-600 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-black text-zinc-300 flex flex-col items-center p-4">
        <div className="w-full max-w-lg">
            {!isAuthenticated ? (
                <LoginScreen onLogin={handleLogin} />
            ) : (
                <>
                    <div className="flex justify-end mb-4">
                        <button 
                            onClick={() => {
                                setIsAuthenticated(false);
                                localStorage.removeItem('siva_auth_persistent');
                            }}
                            className="text-xs text-zinc-600 hover:text-red-500 flex items-center"
                        >
                            <LogOut className="w-3 h-3 mr-1" /> Sair do Sistema
                        </button>
                    </div>
                    <Dashboard 
                        vehicles={vehicles}
                        onAddVehicle={handleAddVehicle}
                        onEditVehicle={handleEditVehicle}
                        onUpdateStatus={handleUpdateStatus}
                        onDeleteVehicle={handleDeleteVehicle}
                        onClearRecovered={handleClearRecovered}
                    />
                </>
            )}
        </div>
        {notification && <NotificationPopup message={notification.message} type={notification.type} />}
    </div>
  );
};

export default App;