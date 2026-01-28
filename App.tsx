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
          console.error("Anonymous sign-in failed:", error);
          showNotification(`Falha na autenticação: ${error.message}`, 'error');
        })
        .finally(() => setLoading(false));
    } catch (error: any) {
        console.error("Firebase initialization failed:", error);
        showNotification(`Falha na inicialização: ${error.message}`, 'error');
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || !db) return;

    const unsubscribe = db.collection(collectionPath)
      .orderBy('timestamp', 'desc')
      .onSnapshot((snapshot: any) => {
        const vehiclesData = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        } as Veiculo));
        setVehicles(vehiclesData);
      }, (error: any) => {
        console.error("Error fetching vehicles:", error);
        showNotification('Erro ao carregar dados.', 'error');
      });

    return () => unsubscribe();
  }, [user, db, collectionPath]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogin = (matricula: string, senha_tatica: string, remember: boolean): boolean => {
    if (matricula === 'Admin' && (senha_tatica === 'choque123' || senha_tatica === 'CHOQUE123')) {
      setIsAuthenticated(true);
      if (remember) {
        localStorage.setItem('siva_auth_persistent', 'true');
        localStorage.setItem('siva_saved_matricula', matricula);
      }
      showNotification('Acesso autorizado.', 'success');
      return true;
    }
    showNotification('Matrícula ou senha tática incorreta.', 'error');
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('siva_auth_persistent');
    showNotification('Sessão encerrada.', 'success');
  };
  
  const handleAddVehicle = useCallback(async (newVehicle: Omit<Veiculo, 'id' | 'status' | 'timestamp'>) => {
    if (!db) return;
    const isAlreadyStolen = vehicles.some(v => v.placa.toUpperCase() === newVehicle.placa.toUpperCase() && v.status === Status.ROUBADO);
    if (isAlreadyStolen) {
      showNotification('Placa já possui um alerta ativo.', 'error');
      return;
    }
    try {
      await db.collection(collectionPath).add({
        ...newVehicle,
        placa: newVehicle.placa.toUpperCase(),
        status: Status.ROUBADO,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });
      showNotification('Alerta cadastrado com sucesso!', 'success');
    } catch (error: any) {
      showNotification(`Erro ao cadastrar: ${error.message}`, 'error');
    }
  }, [db, vehicles, collectionPath]);

  const handleEditVehicle = useCallback(async (id: string, updatedData: Omit<Veiculo, 'id' | 'status' | 'timestamp'>) => {
    if (!db) return;
    try {
        await db.collection(collectionPath).doc(id).update({
            ...updatedData,
            placa: updatedData.placa.toUpperCase(),
            // Atualizar timestamp faz com que o veículo suba para o topo da lista (ordenada desc)
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        });
        showNotification('Alerta atualizado!', 'success');
    } catch (error: any) {
        showNotification(`Erro ao atualizar: ${error.message}`, 'error');
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
        showNotification(`Erro no status: ${error.message}`, 'error');
    }
  }, [db, collectionPath]);

  const handleDeleteVehicle = useCallback(async (id: string) => {
    if (!db) return;
    try {
        await db.collection(collectionPath).doc(id).delete();
        showNotification('Alerta excluído.', 'success');
    } catch (error: any) {
        showNotification(`Erro ao excluir: ${error.message}`, 'error');
    }
  }, [db, collectionPath]);

  const handleClearRecovered = useCallback(async () => {
    if (!db) return;
    const recovered = vehicles.filter(v => v.status === Status.RECUPERADO);
    if (recovered.length === 0) {
      showNotification('Não há veículos recuperados para zerar.', 'error');
      return;
    }
    
    try {
      const batch = db.batch();
      recovered.forEach(v => {
        const ref = db.collection(collectionPath).doc(v.id);
        batch.delete(ref);
      });
      await batch.commit();
      showNotification('Histórico de recuperados zerado!', 'success');
    } catch (error: any) {
      showNotification(`Erro ao zerar: ${error.message}`, 'error');
    }
  }, [db, vehicles, collectionPath]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans flex flex-col items-center pt-8 md:pt-16 px-4 pb-12">
        <div className="w-full max-w-lg">
            {deferredPrompt && (
              <button 
                onClick={handleInstallClick}
                className="w-full mb-6 bg-zinc-900 border border-red-900/50 p-3 rounded-lg flex items-center justify-between text-sm animate-pulse hover:bg-zinc-800 transition-colors"
              >
                <div className="flex items-center">
                  <Download className="w-5 h-5 text-red-500 mr-3" />
                  <span className="text-zinc-200 font-bold uppercase tracking-tighter">Instalar SIVA no Aparelho</span>
                </div>
                <span className="bg-red-600 text-white px-2 py-1 rounded text-[10px] font-black">FIXAR APP</span>
              </button>
            )}

            {!isAuthenticated ? (
                <LoginScreen onLogin={handleLogin} />
            ) : (
                <>
                    <div className="flex justify-end mb-2">
                      <button 
                        onClick={handleLogout}
                        className="flex items-center text-xs text-zinc-500 hover:text-red-500 transition-colors"
                      >
                        <LogOut className="w-3 h-3 mr-1" /> Sair
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