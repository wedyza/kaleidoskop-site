import { useRef } from 'react';
import Modal from '../../../components/Modal/Modal';
import './AddBannerModal.scss'

interface AddBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
  //group: 'first' | 'second';
}

const AddBannerModal: React.FC<AddBannerModalProps> = ({
  isOpen, 
  onClose,
  onUpload,
  //group
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      onUpload(file);
      onClose();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className='banner-addmodal'
    >
      <h2 className='inter18-600'>Загрузите изображение</h2>
      <p className='inter15-400 banner-addmodal_desc'>
        Пожалуйста, загрузите изображение в 
        png или jpg формате в размере 1565x265 px
      </p>
      <div 
        className={'banner-addmodal_upload inter16-400'}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/png, image/jpeg"
          className="banner-addmodal_input"
        />

        <div className='banner-addmodal_icon'>
          <svg width="60" height="75" viewBox="0 0 60 75" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M40.4165 0.579639C40.0726 0.217383 39.6012 0 39.1125 0H9.85518C4.4562 0 0 4.43848 0 9.83672V65.1627C0 70.5614 4.45635 75 9.85503 75H49.5649C54.9637 75 59.4201 70.5615 59.4201 65.1627V21.2314C59.4201 20.7606 59.2025 20.308 58.8948 19.9635L40.4165 0.579639ZM40.9418 6.39507L53.3152 19.384H45.2717C42.8804 19.384 40.9418 17.4636 40.9418 15.0725V6.39507ZM49.5649 71.3769H9.85503C6.46758 71.3769 3.62314 68.569 3.62314 65.1627V9.83672C3.62314 6.44927 6.44927 3.62314 9.85503 3.62314H37.3187V15.0724C37.3187 19.4744 40.8697 23.0071 45.2717 23.0071H55.7968V65.1627C55.7968 68.569 52.9707 71.3769 49.5649 71.3769Z" fill="#888888"/>
            <path d="M44.6235 58.877H14.8047C13.8086 58.877 12.9932 59.6917 12.9932 60.6886C12.9932 61.6847 13.8085 62.5001 14.8047 62.5001H44.6418C45.6379 62.5001 46.4534 61.6848 46.4534 60.6886C46.4534 59.6917 45.6379 58.877 44.6235 58.877ZM28.3917 52.3732C28.7363 52.7355 29.2071 52.9529 29.7141 52.9529C30.2216 52.9529 30.6926 52.7355 31.0365 52.3732L41.6525 40.9784C42.341 40.2533 42.2865 39.0941 41.5622 38.4241C40.8371 37.7356 39.6779 37.7896 39.0079 38.5145L31.5256 46.5396V26.7574C31.5256 25.7605 30.7103 24.9458 29.7141 24.9458C28.718 24.9458 27.9025 25.7605 27.9025 26.7574V46.5396L20.4387 38.5145C19.7502 37.79 18.6088 37.7356 17.8843 38.4241C17.1599 39.1125 17.1056 40.254 17.7939 40.9784L28.3917 52.3732Z" fill="#888888"/>
          </svg>
        </div>

        <div className='banner-addmodal_main'>
          <button 
            className='banner-addmodal_button'
            onClick={handleButtonClick}
            type="button"
          >
            Выберите файл
          </button>
          <span>
            или перетащите его в эту область
          </span>
        </div>

        <span className='banner-addmodal_hint'>
          Формат: jpg/png, размер: 1565x265 px
        </span>
      </div>
    </Modal>
  )
}

export default AddBannerModal;