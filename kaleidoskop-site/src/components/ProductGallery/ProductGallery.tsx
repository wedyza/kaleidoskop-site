import React, { useState } from 'react';
import './ProductGallery.scss';
import img1 from '../../assets/empty_imgs.jpg';
import type { ProductImage } from '../../features/products/productsSlice';

interface ProductGalleryProps {
  images: ProductImage[] | undefined;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ images }) => {
  const fallbackImage: ProductImage[] = [{ source: img1 }];
  const displayImages = images && images.length > 0 ? images : fallbackImage;
  const isUsingFallback = !images || images.length === 0;
  
  const [selectedImage, setSelectedImage] = useState<ProductImage>(displayImages[0]);

  return (
    <div className='product-gallery'>
      <div className='product-gallery_main'>
        <div className='product-gallery_main-container'>
          <img className='product-gallery_main-img' src={selectedImage.source} alt='Selected' />
        </div>
      </div>
      
      {!isUsingFallback && (
        <div className='product-gallery_list'>
          {displayImages.map((img, index) => (
            <div
              key={index}
              className='product-gallery_img'
              onClick={() => setSelectedImage(img)}
            >
              <img className='product-gallery_img-src' src={img.source} alt={`Gallery ${index + 1}`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;