import { createContext, useContext, useState, ReactNode } from 'react';
import CreateWorkspaceModal from '../components/CreateWorkspaceModal';

interface CreateWorkspaceContextType {
  openModal: (successCallback?: (workspace: any) => void) => void;
  closeModal: () => void;
}

const CreateWorkspaceContext = createContext<CreateWorkspaceContextType | undefined>(undefined);

export function CreateWorkspaceProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [onSuccess, setOnSuccess] = useState<((workspace: any) => void) | null>(null);

  const openModal = (successCallback?: (workspace: any) => void) => {
    setOnSuccess(() => successCallback || null);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setOnSuccess(null);
  };

  return (
    <CreateWorkspaceContext.Provider value={{ openModal, closeModal }}>
      {children}
      {isOpen && (
        <CreateWorkspaceModal
          onClose={closeModal}
          onSuccess={(workspace) => {
            if (onSuccess) {
              onSuccess(workspace);
            }
            closeModal();
          }}
        />
      )}
    </CreateWorkspaceContext.Provider>
  );
}

export function useCreateWorkspace() {
  const context = useContext(CreateWorkspaceContext);
  if (!context) {
    throw new Error('useCreateWorkspace must be used within CreateWorkspaceProvider');
  }
  return context;
}


