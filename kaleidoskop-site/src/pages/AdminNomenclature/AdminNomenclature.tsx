import './AdminNomenclature.scss'
import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { 
  fetchAdminNomenclatureById 
} from '../../features/admin/nomenclaturesSlice';
import NomenclaturesLayout from '../../components/NomenclaturesLayout/NomenclaturesLayout';
import NomenclaturesModal from '../../components/NomenclaturesModal/NomenclaturesModal';
import NomenclaturesList from '../../components/NomenclaturesList/NomenclaturesList';
import type { Nomenclature } from '../../features/admin/nomenclaturesSlice';

const AdminNomenclature = () => {
  const { id } = useParams<{ id: string }>();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedNomId, setSelectedNomId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const dispatch = useAppDispatch();
  const currentNom = useAppSelector(state => state.nomenclatures.currentNomenclature);
  const currentNomLoading = useAppSelector(state => state.nomenclatures.currentNomenclatureLoading);

  useEffect(() => {
    if (id) {
      dispatch(fetchAdminNomenclatureById(id));
    }
  }, [dispatch, id]);

  const filteredNomenclatures = useMemo(() => {
    if (!currentNom?.daughter) return [];
    
    if (!searchTerm.trim()) return currentNom.daughter;
    
    const term = searchTerm.toLowerCase();
    return currentNom.daughter.filter((nom: Nomenclature) => 
      nom.title.toLowerCase().includes(term) ||
      nom.code.toLowerCase().includes(term) ||
      (nom.categories?.some(cat => cat.title.toLowerCase().includes(term)) || false)
    );
  }, [currentNom, searchTerm]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleSelectNom = (nom: Nomenclature) => {
    setSelectedNomId(nom.id);
    setIsModalOpen(true);
  };

  const selectedNom = useMemo(() => {
    if (!selectedNomId || !currentNom) return null;
    return currentNom.daughter.find(n => n.id === selectedNomId) || null;
  }, [selectedNomId, currentNom]);
  
  if (currentNomLoading) {
    return <div>Загрузка...</div>;
  }

  if (!currentNom) {
    return <div>Номенклатура не найдена</div>;
  }
  
  return (
    <NomenclaturesLayout
      onSearch={handleSearch}
      parentTitle={currentNom.title}
    >
      <NomenclaturesList
        nomenclatures={filteredNomenclatures}
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
  )
}

export default AdminNomenclature;