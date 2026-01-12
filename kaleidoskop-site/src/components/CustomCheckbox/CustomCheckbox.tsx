import React from 'react';
import './CustomCheckbox.scss';

interface CustomCheckboxProps {
  checked: boolean;
  onChange: () => void;
  checkboxClass: string;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ checked, onChange, checkboxClass }) => {
  return (
    <div className={`custom-checkbox ${checkboxClass}`} onClick={onChange}>
      {checked ? (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="20" height="20" rx="5" fill="#EA5B21"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M7.59863 15L4.33406 11.8924C3.93326 11.5108 3.93166 10.8721 4.33054 10.4886C4.70448 10.129 5.29496 10.1267 5.67168 10.4834L7.59863 12.3077L14.5261 5.64669C14.9017 5.2855 15.4956 5.2855 15.8712 5.64669C16.2682 6.02848 16.2682 6.66383 15.8712 7.04562L7.59863 15Z" fill="white"/>
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="20" height="20" rx="5" fill="#E7E7E6"/>
        </svg>
      )}
    </div>
  );
};

export default CustomCheckbox;