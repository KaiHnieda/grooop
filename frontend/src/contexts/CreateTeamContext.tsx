import { createContext, useContext, useState, ReactNode } from 'react';
import CreateTeamModal from '../components/CreateTeamModal';
import type { Team } from '../types';

interface CreateTeamContextType {
  openModal: (successCallback?: (team: Team) => void) => void;
  closeModal: () => void;
}

const CreateTeamContext = createContext<CreateTeamContextType | undefined>(undefined);

export function CreateTeamProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [onSuccess, setOnSuccess] = useState<((team: Team) => void) | null>(null);

  const openModal = (successCallback?: (team: Team) => void) => {
    setOnSuccess(() => successCallback || null);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setOnSuccess(null);
  };

  return (
    <CreateTeamContext.Provider value={{ openModal, closeModal }}>
      {children}
      {isOpen && (
        <CreateTeamModal
          onClose={closeModal}
          onSuccess={(team) => {
            if (onSuccess) {
              onSuccess(team);
            }
            closeModal();
          }}
        />
      )}
    </CreateTeamContext.Provider>
  );
}

export function useCreateTeam() {
  const context = useContext(CreateTeamContext);
  if (!context) {
    throw new Error('useCreateTeam must be used within CreateTeamProvider');
  }
  return context;
}


