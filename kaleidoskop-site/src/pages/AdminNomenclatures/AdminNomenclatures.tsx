import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchAdminNomenclatures, type Nomenclature } from '../../features/admin/nomenclaturesSlice';
import NomenclaturesLayout from '../../components/NomenclaturesLayout/NomenclaturesLayout';
import NomenclaturesModal from '../../components/NomenclaturesModal/NomenclaturesModal';
import NomenclaturesList from '../../components/NomenclaturesList/NomenclaturesList';
import './AdminNomenclatures.scss'

const AdminNomenclatures = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedNom, setSelectedNom] = useState<Nomenclature | null>(null);
  
  const nomenclatures = useAppSelector(state => state.nomenclatures.nomenclatures);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchAdminNomenclatures());
  }, [dispatch]);

  useEffect(() => {
    if (selectedNom?.id) {
      const updatedNom = nomenclatures.find(n => n.id === selectedNom.id);
      if (updatedNom) {
        setSelectedNom(updatedNom);
      }
    }
  }, [nomenclatures, selectedNom?.id]);

  const handleSearch = (searchTerm: string) => {
    if (searchTerm.trim()) {
      dispatch(fetchAdminNomenclatures({ search: searchTerm.trim() }));
    } else {
      dispatch(fetchAdminNomenclatures());
    }
  };

  const handleSelectNom = (nom: Nomenclature) => {
    setSelectedNom(nom);
    setIsModalOpen(true);
  };

  return (
    <NomenclaturesLayout
      onSearch={handleSearch}
    >
      <NomenclaturesList
        nomenclatures={nomenclatures}
        onSelectNom={handleSelectNom}
        showChildButton={true}
      />
      
      {isModalOpen && selectedNom && (
        <NomenclaturesModal 
          isModalOpen={isModalOpen} 
          setIsModalOpen={setIsModalOpen} 
          selectedNom={selectedNom} 
        />
      )}
    </NomenclaturesLayout>
  );
};

export default AdminNomenclatures;