import { Link, useParams } from 'react-router-dom';
import './ProductPage.scss'
import ProductGallery from '../../components/ProductGallery/ProductGallery';
import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchProductById, toggleWishlist } from '../../features/products/productItemSlice';
import { formatPrice } from '../../utils/formatPrice';
import { toggleBasketItem, updateBasketItemAmount } from '../../features/basket/basketSlice';
import ToBasket from '../../components/ToBasket/ToBasket';
import MainParameters from '../../components/MainParameters/MainParameters';
import { fetchContentBasedRecommendations } from '../../features/recommendations/recommendationsSlice';
import ItemsBlock from '../../components/ItemsBlock/ItemsBlock';

function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useAppDispatch();
  const selectedItem = useAppSelector((state) => state.productItem.selectedItem);
  const prevProductIdRef = useRef<string | null>(null);
  const recommendations = useAppSelector((state) => state.recommendations.items);

  useEffect(() => {
    if (slug) {
      const productId = slug.split('--')[1];
      dispatch(fetchProductById(productId));
      prevProductIdRef.current = productId;
    }
  }, [dispatch, slug]);
  const [galleryKey, setGalleryKey] = useState(0);

  useEffect(() => {
    if (selectedItem && selectedItem.id) {
      dispatch(fetchContentBasedRecommendations({ 
        productId: selectedItem.id, 
      }));
    }
  }, [dispatch, selectedItem]);
  
  useEffect(() => {
    if (selectedItem && selectedItem.id !== prevProductIdRef.current) {
      setGalleryKey(prev => prev + 1);
      prevProductIdRef.current = selectedItem.id;
    }
  }, [selectedItem]);

  const handleToggleWishlist = (e: React.MouseEvent ) => {
    if (selectedItem){
      e.stopPropagation();
      e.preventDefault();
      dispatch(toggleWishlist({id: selectedItem.id, enable: !selectedItem.in_wishlist}));
    }
  };

  if (!selectedItem) return;
  
  return (
    <div className='page-product'>
      <div className="page-path inter16-400">
        <Link to={'/'} className='main-link'>
          Главная
        </Link>
        <span className='page-path_separator'>/</span>
        <Link to={'/'} className='main-link'>
          Категория
        </Link>
        <span className='page-path_separator'>/</span>
        <Link to={'/'} className='main-link'>
          Подкатегория
        </Link>
        <span className='page-path_separator'>/</span>
        <span className="page-path_name">
           {selectedItem?.title}
        </span>
      </div>

      <div className='product-info'>
        <div className='product-info_sub'>
          <span className='product-info_id inter14-400'>код: 18803520</span>
          <div className='product-info_gallery'>
            <ProductGallery 
              key={galleryKey}
              images={selectedItem?.images} 
            />
          </div>
        </div>
        <div className='product-info_main'>
          <h1 className='product-info_name inter28-600'>
            {selectedItem?.title}
          </h1>
          <div className='product-info-price'>
            <div className='product-info_discount'>
              <span className='product-info_discount-value inter18-500'>
                {selectedItem && formatPrice(selectedItem.price * 4/3)} ₽
              </span>
              <span className='product-info_discount-percent inter11-600'>
                - 25%
              </span>
            </div>
            <span className='product-info_price inter32-700'>
              {selectedItem && formatPrice(selectedItem.price)} ₽ <span className='product-info_price-label inter16-400'>за шт</span>
            </span>
          </div>
          <div className='product-info_actions'>
            <ToBasket
              product={selectedItem}
              classBtn='accent-btn'
              onAdd={() => dispatch(toggleBasketItem({ id: selectedItem.id, enable: true }))}

              onRemove={() => dispatch(toggleBasketItem({ id: selectedItem.id, enable: false }))}

              onIncrease={() =>
                dispatch(updateBasketItemAmount({
                  id: selectedItem.id!,
                  amount: selectedItem.cart_count! + 1
                }))
              }

              onDecrease={() =>
                dispatch(updateBasketItemAmount({
                  id: selectedItem.id!,
                  amount: selectedItem.cart_count! - 1
                }))
              }
            />
            <button
              onClick={handleToggleWishlist}
              className={`product_fav product_action ${selectedItem && selectedItem.in_wishlist ? 'product_action__active' : ''}`}
            >
              <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M14.005 1.38461C12.7848 1.38461 11.6125 1.88224 10.7485 2.77137L10.5019 3.02505C10.3704 3.1603 10.1892 3.23669 9.99979 3.23669C9.81041 3.23669 9.62916 3.1603 9.49768 3.02505L9.25103 2.77135C7.45404 0.922964 4.53515 0.922964 2.73816 2.77135C0.947745 4.61297 0.947745 7.59419 2.73816 9.43581L9.52424 16.416C9.77424 16.6731 10.1911 16.6829 10.4534 16.4375C12.0146 14.9455 13.4984 13.3818 14.9935 11.8064C15.7429 11.0166 16.4952 10.224 17.2614 9.43581C18.1202 8.55286 18.6047 7.35487 18.6047 6.10358C18.6047 4.85237 18.1204 3.65454 17.2615 2.77145C16.3975 1.88239 15.2251 1.38461 14.005 1.38461ZM9.99987 1.56211C11.0937 0.561895 12.5181 0 14.005 0C15.6105 0 17.1432 0.655169 18.2655 1.80992C19.3797 2.95551 20 4.49981 20 6.10358C20 7.70741 19.3797 9.25178 18.2655 10.3973C17.5246 11.1593 16.785 11.9387 16.0414 12.7221C14.5311 14.3134 13.0048 15.9217 11.4191 17.4369L11.4154 17.4404C10.5978 18.2103 9.30277 18.1824 8.52003 17.3773L1.73394 10.3971C-0.577981 8.0191 -0.577981 4.18806 1.73394 1.81002C3.99632 -0.517066 7.63943 -0.599702 9.99987 1.56211Z" fill="#888888"/>
                <path d="M10.7485 2.77137C11.6125 1.88224 12.7848 1.38461 14.005 1.38461C15.2251 1.38461 16.3975 1.88239 17.2615 2.77145C18.1204 3.65454 18.6047 4.85237 18.6047 6.10358C18.6047 7.35487 18.1202 8.55286 17.2614 9.43581C16.4952 10.224 15.7429 11.0166 14.9935 11.8064C13.4984 13.3818 12.0146 14.9455 10.4534 16.4375C10.1911 16.6829 9.77424 16.6731 9.52424 16.416L2.73816 9.43581C0.947745 7.59419 0.947745 4.61297 2.73816 2.77135C4.53515 0.922964 7.45404 0.922964 9.25103 2.77135L9.49768 3.02505C9.62916 3.1603 9.81041 3.23669 9.99979 3.23669C10.1892 3.23669 10.3704 3.1603 10.5019 3.02505L10.7485 2.77137Z" fill="#888888"/>
              </svg>
            </button>
            {/* <button className='product_comp product_action'>
              <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M1.14286 6.27672C0.839753 6.27672 0.549063 6.39523 0.334735 6.60618C0.120408 6.81713 0 7.10324 0 7.40158V18.8751C0 19.1735 0.120408 19.4596 0.334735 19.6705C0.549063 19.8815 0.839753 20 1.14286 20C1.44596 20 1.73665 19.8815 1.95098 19.6705C2.16531 19.4596 2.28571 19.1735 2.28571 18.8751V7.39033C2.28571 7.092 2.16531 6.80588 1.95098 6.59493C1.73665 6.38398 1.44596 6.26547 1.14286 6.26547V6.27672ZM16 18.8751V12.8684C15.9981 12.6377 15.9242 12.4132 15.7884 12.2253C15.6525 12.0373 15.4612 11.895 15.2404 11.8177C15.0196 11.7403 14.78 11.7316 14.554 11.7928C14.3281 11.854 14.1267 11.9821 13.9771 12.1597C13.8093 12.3591 13.7164 12.6094 13.7143 12.8684V18.8639C13.7143 19.1622 13.8347 19.4483 14.049 19.6593C14.2633 19.8702 14.554 19.9888 14.8571 19.9888C15.1602 19.9888 15.4509 19.8702 15.6653 19.6593C15.8796 19.4483 16 19.1622 16 18.8639V18.8751ZM9.14286 18.8751C9.14286 19.1735 9.02245 19.4596 8.80812 19.6705C8.59379 19.8815 8.30311 20 8 20C7.6969 20 7.40621 19.8815 7.19188 19.6705C6.97755 19.4596 6.85714 19.1735 6.85714 18.8751V1.12486C6.85714 0.826528 6.97755 0.540416 7.19188 0.329464C7.40621 0.118512 7.6969 0 8 0C8.30311 0 8.59379 0.118512 8.80812 0.329464C9.02245 0.540416 9.14286 0.826528 9.14286 1.12486V18.8526V18.8751Z" fill="#888888"/>
              </svg>
            </button> */}
          </div>
          <div className='product-info_availability inter13-400'>
            <div className='product-info_availability-item'>
              <span className='product-info_availability-day'>
                Сегодня в 2 магазинах:
              </span>
              <Link to={''} className='product-info_availability-link'>
                Посмотреть
              </Link>
            </div>
            <div className='product-info_availability-item'>
              <span className='product-info_availability-day'>
                Завтра в 5 магазинах:
              </span>
              <Link to={''} className='product-info_availability-link'>
                Посмотреть
              </Link>
            </div>
          </div>

          {selectedItem.parameters && selectedItem.parameters.length > 0 && (
            <div className='product-info_params'>
              <MainParameters params={selectedItem.parameters} />
            </div>
          )}
        </div>
      </div>

      <div className='product-recs'>
        <ItemsBlock
            title="Похожие товары"
            items={recommendations}
          />
      </div>
    </div>
  )
}

export default ProductPage;