import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import "./Modal.scss";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
};

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  className = "",
  children,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-backdrop">
      <div ref={modalRef} className={`modal-container ${className}`}>
        <button className="modal-close" onClick={onClose} aria-label="Закрыть">
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M0.219748 0.219705C0.512641 -0.0731876 0.987515 -0.0731878 1.28041 0.219705L5.99272 4.93202L10.705 0.219705C10.9979 -0.0731876 11.4728 -0.0731879 11.7657 0.219705C12.0586 0.512598 12.0586 0.987473 11.7657 1.28037L7.05338 5.99268L11.7657 10.705C12.0586 10.9979 12.0586 11.4728 11.7657 11.7656C11.4728 12.0585 10.9979 12.0585 10.705 11.7656L5.99272 7.05334L1.28041 11.7656C0.987515 12.0585 0.512641 12.0585 0.219748 11.7656C-0.0731455 11.4728 -0.0731455 10.9979 0.219748 10.705L4.93206 5.99268L0.219748 1.28037C-0.0731455 0.987472 -0.0731455 0.512599 0.219748 0.219705Z"
              fill="#888888"
            />
          </svg>
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
